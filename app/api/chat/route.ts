import { NextRequest } from 'next/server';
import { getLangfuse, flushLangfuse } from '@/lib/langfuse';
import {
  rateLimit,
  getClientIdentifier,
  getRateLimitHeaders,
  type RateLimitResult,
} from '@/lib/rate-limit';

const MAX_MESSAGE_LENGTH = 8000;
const AGENT_TIMEOUT_MS = 30_000;

const jsonHeaders = { 'Content-Type': 'application/json' };

function getClientId(req: NextRequest): string {
  return getClientIdentifier(req.headers);
}

function errorResponse(status: number, error: string): Response {
  return new Response(JSON.stringify({ error, arguments: [] }), {
    status,
    headers: jsonHeaders,
  });
}

function extractTextPayload(parsed: unknown): string {
  if (!parsed || typeof parsed !== 'object') return '';

  const data = parsed as {
    type?: string;
    delta?: string | { text?: string };
    textDelta?: string;
    output_text?: string;
    content?: string | Array<{ type?: string; text?: string }>;
    value?: string;
    parts?: Array<{ type?: string; text?: string }>;
    text?: string;
    choices?: Array<{ delta?: { content?: string } }>;
    response?: string | { text?: string };
    message?: string | { content?: string | Array<{ text?: string }> };
  };

  // Handle common stream chunk formats: {"type":"text-delta","delta":"..."}
  if (data.type?.includes('delta') && typeof data.delta === 'string') {
    return data.delta;
  }

  if (Array.isArray(data.parts)) {
    return data.parts
      .filter((part) => part.type === 'text' || Boolean(part.text))
      .map((part) => part.text ?? '')
      .join('');
  }
  if (data.text) return data.text;
  if (data.textDelta) return data.textDelta;
  if (data.output_text) return data.output_text;
  if (typeof data.content === 'string') return data.content;
  if (Array.isArray(data.content)) {
    return data.content
      .filter((part) => part.type === 'text' || Boolean(part.text))
      .map((part) => part.text ?? '')
      .join('');
  }
  if (data.type?.includes('delta') && typeof data.value === 'string') return data.value;
  if (typeof data.delta === 'object' && data.delta?.text) return data.delta.text;
  if (data.choices?.[0]?.delta?.content) return data.choices[0].delta.content;
  if (typeof data.response === 'string') return data.response;
  if (data.response && typeof data.response === 'object' && data.response.text) {
    return data.response.text;
  }
  if (typeof data.message === 'string') return data.message;
  if (data.message && typeof data.message === 'object') {
    if (typeof data.message.content === 'string') return data.message.content;
    if (Array.isArray(data.message.content)) {
      return data.message.content.map((part) => part.text ?? '').join('');
    }
  }
  return '';
}

// Detect if message is from debate mode based on content patterns
function detectDebateContext(message: string): {
  isDebate: boolean;
  speaker?: 'logical' | 'emotional';
  round?: number;
} {
  const logicalMatch = message.match(/You are "Logical Larry"/i);
  const emotionalMatch = message.match(/You are "Emotional Emma"/i);
  const roundMatch = message.match(/Round (\d+)/i);

  if (logicalMatch || emotionalMatch) {
    return {
      isDebate: true,
      speaker: logicalMatch ? 'logical' : 'emotional',
      round: roundMatch ? parseInt(roundMatch[1], 10) : undefined,
    };
  }

  return { isDebate: false };
}

export async function POST(req: NextRequest) {
  const langfuse = getLangfuse();
  const clientId = getClientId(req);
  let generation: ReturnType<NonNullable<ReturnType<typeof getLangfuse>>['generation']> | undefined;
  let generationEnded = false;

  // Rate limit check using Upstash Redis (falls back to in-memory in dev)
  const rateLimitResult = await rateLimit(clientId, 'debate');
  if (!rateLimitResult.success) {
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded. Please wait a minute and try again.',
        arguments: [],
      }),
      {
        status: 429,
        headers: {
          ...jsonHeaders,
          ...getRateLimitHeaders(
            rateLimitResult.limit,
            rateLimitResult.remaining,
            rateLimitResult.reset
          ),
        },
      }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse(400, 'Invalid JSON payload.');
  }

  // Create Langfuse trace for this request
  const trace = langfuse?.trace({
    name: 'chat-request',
    userId: clientId,
    metadata: {
      endpoint: '/api/chat',
    },
  });

  try {
    const {
      message,
      stream = true,
      conversationId,
      debateContext,
    } = (body ?? {}) as {
      message?: unknown;
      stream?: unknown;
      conversationId?: string;
      debateContext?: {
        topic?: string;
        round?: number;
        speaker?: 'logical' | 'emotional';
      };
    };

    if (typeof message !== 'string' || !message.trim()) {
      trace?.update({ output: { error: 'Message is required' } });
      await flushLangfuse();
      return errorResponse(400, 'Message is required.');
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      trace?.update({ output: { error: 'Message too long' } });
      await flushLangfuse();
      return errorResponse(
        413,
        `Message exceeds ${MAX_MESSAGE_LENGTH} characters. Please shorten and try again.`
      );
    }

    // Detect debate context from message content
    const detectedContext = detectDebateContext(message);
    const isDebateMode = detectedContext.isDebate || !!debateContext;

    // Update trace with context
    trace?.update({
      sessionId: conversationId,
      metadata: {
        endpoint: '/api/chat',
        isDebate: isDebateMode,
        ...(isDebateMode && {
          debateSpeaker: debateContext?.speaker || detectedContext.speaker,
          debateRound: debateContext?.round || detectedContext.round,
          debateTopic: debateContext?.topic,
        }),
      },
      input: {
        message: message.slice(0, 500), // Truncate for storage
        messageLength: message.length,
      },
    });

    // Check if Agent Studio endpoint is configured
    const agentEndpoint =
      process.env.ALGOLIA_AGENT_ENDPOINT || process.env.NEXT_PUBLIC_ALGOLIA_AGENT_ENDPOINT;

    if (!agentEndpoint) {
      trace?.update({ output: { error: 'Agent endpoint not configured' } });
      await flushLangfuse();
      return errorResponse(500, "The Agent Studio endpoint isn't configured.");
    }

    // Validate required environment variables
    const appId = process.env.ALGOLIA_APP_ID || process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
    const apiKey =
      process.env.ALGOLIA_SEARCH_API_KEY || process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY;

    if (!appId || !apiKey) {
      trace?.update({ output: { error: 'Missing Algolia credentials' } });
      await flushLangfuse();
      return errorResponse(500, 'Configuration error: Missing Algolia credentials.');
    }

    // Build the endpoint URL with required query parameters
    const wantsStream = stream !== false;
    const url = new URL(agentEndpoint);
    url.searchParams.set('stream', wantsStream ? 'true' : 'false');
    url.searchParams.set('compatibilityMode', 'ai-sdk-5');

    // Create generation span for the LLM call
    const spanName = isDebateMode
      ? `debate-turn-${detectedContext.speaker || debateContext?.speaker || 'unknown'}-round-${detectedContext.round || debateContext?.round || '?'}`
      : 'agent-generation';

    generation = trace?.generation({
      name: spanName,
      model: 'algolia-agent-studio',
      input: {
        messages: [{ role: 'user', content: message.trim() }],
      },
      metadata: {
        streaming: wantsStream,
        agentEndpoint: url.hostname,
      },
    });

    const startTime = Date.now();

    // Call Algolia Agent Studio API (ai-sdk-5 format with parts)
    let response: Response;
    try {
      response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Algolia-Application-Id': appId,
          'X-Algolia-API-Key': apiKey,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              parts: [{ text: message.trim() }],
            },
          ],
        }),
        signal: AbortSignal.timeout(AGENT_TIMEOUT_MS),
      });
    } catch (fetchError) {
      const latencyMs = Date.now() - startTime;
      generation?.end({
        output: { error: fetchError instanceof Error ? fetchError.message : 'Unknown fetch error' },
        statusMessage: 'error',
        metadata: { latencyMs },
      });
      generationEnded = true;
      trace?.update({
        output: {
          error: fetchError instanceof Error ? fetchError.message : 'Unknown fetch error',
          latencyMs,
        },
      });
      await flushLangfuse();

      if (fetchError instanceof Error && fetchError.name === 'TimeoutError') {
        return errorResponse(504, 'Agent request timed out. Please retry.');
      }
      return errorResponse(502, 'Failed to reach Agent service.');
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      const detail = errorText ? ` ${errorText.slice(0, 300)}` : '';
      const latencyMs = Date.now() - startTime;

      generation?.end({
        output: { error: `HTTP ${response.status}`, detail },
        statusMessage: 'error',
        metadata: { latencyMs, httpStatus: response.status },
      });
      generationEnded = true;
      trace?.update({
        output: {
          error: `HTTP ${response.status}`,
          detail,
          latencyMs,
          httpStatus: response.status,
        },
      });
      await flushLangfuse();

      return errorResponse(502, `Agent API returned ${response.status}.${detail}`);
    }

    // Handle streaming response
    if (wantsStream && response.body) {
      // Create a TransformStream to process the SSE events
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullResponse = '';

      const processLine = (line: string, controller: TransformStreamDefaultController) => {
        if (!line.startsWith('data:')) return;

        const data = line.slice(5).trimStart();
        if (!data) return;

        if (data === '[DONE]') {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          return;
        }

        try {
          const parsed = JSON.parse(data);
          const content = extractTextPayload(parsed);
          if (content) {
            fullResponse += content;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: content })}\n\n`));
          }
        } catch {
          // Ignore malformed chunks from upstream.
        }
      };

      const transformStream = new TransformStream({
        async transform(chunk, controller) {
          buffer += decoder.decode(chunk, { stream: true });

          let lineBreakIndex = buffer.indexOf('\n');
          while (lineBreakIndex >= 0) {
            const line = buffer.slice(0, lineBreakIndex).replace(/\r$/, '');
            processLine(line, controller);
            buffer = buffer.slice(lineBreakIndex + 1);
            lineBreakIndex = buffer.indexOf('\n');
          }
        },
        async flush(controller) {
          const finalText = decoder.decode();
          if (finalText) buffer += finalText;
          if (buffer.trim().length > 0) {
            processLine(buffer.replace(/\r$/, ''), controller);
          }

          // End the generation span after streaming completes
          const latencyMs = Date.now() - startTime;
          generation?.end({
            output: { content: fullResponse.slice(0, 1000), fullLength: fullResponse.length },
            metadata: {
              latencyMs,
              streaming: true,
              responseLength: fullResponse.length,
            },
          });
          generationEnded = true;
          trace?.update({
            output: {
              success: true,
              responseLength: fullResponse.length,
            },
          });
          await flushLangfuse();
        },
      });

      return new Response(response.body.pipeThrough(transformStream), {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
          'X-Accel-Buffering': 'no',
        },
      });
    }

    // Non-streaming fallback
    const data = await response.json().catch(() => ({}));
    const responseText = extractTextPayload(data) || 'No response from agent.';
    const latencyMs = Date.now() - startTime;

    generation?.end({
      output: { content: responseText.slice(0, 1000), fullLength: responseText.length },
      metadata: {
        latencyMs,
        streaming: false,
        responseLength: responseText.length,
      },
    });
    generationEnded = true;
    trace?.update({
      output: {
        success: true,
        responseLength: responseText.length,
      },
    });
    await flushLangfuse();

    return new Response(
      JSON.stringify({
        message: responseText,
        arguments: (data as { arguments?: unknown[] }).arguments || [],
      }),
      { status: 200, headers: jsonHeaders }
    );
  } catch (error) {
    if (generation && !generationEnded) {
      generation.end({
        output: { error: error instanceof Error ? error.message : 'Unknown error' },
        statusMessage: 'error',
      });
    }
    trace?.update({
      output: { error: error instanceof Error ? error.message : 'Unknown error' },
    });
    await flushLangfuse();

    if (process.env.NODE_ENV === 'development') {
      console.error('Chat API error:', error);
    }
    return errorResponse(
      500,
      `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
