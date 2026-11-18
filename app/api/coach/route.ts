import { NextRequest } from 'next/server';
import {
  rateLimit,
  getClientIdentifier,
  getRateLimitHeaders,
} from '@/lib/rate-limit';
import { validateHistory } from '@/lib/chat-history';
import {
  MAX_ANSWER_CHARS,
  MAX_MATERIAL_CHARS,
  MAX_TURNS,
  applyAssessment,
  buildCoachPrompt,
  masteryPercent,
  parseCoachReply,
  redactPii,
  sanitizeState,
} from '@/lib/socratic-coach';

const AGENT_TIMEOUT_MS = 30_000;
const jsonHeaders = { 'Content-Type': 'application/json' };

function json(status: number, body: unknown, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { ...jsonHeaders, ...extra } });
}

/** Pull the text out of a non-streaming Agent Studio response. */
function extractText(data: unknown): string {
  if (!data || typeof data !== 'object') return '';
  const d = data as {
    text?: unknown;
    parts?: Array<{ text?: string }>;
    message?: unknown;
    response?: unknown;
  };
  if (typeof d.text === 'string') return d.text;
  if (Array.isArray(d.parts)) return d.parts.map((p) => p.text ?? '').join('');
  if (typeof d.message === 'string') return d.message;
  if (typeof d.response === 'string') return d.response;
  return '';
}

export async function POST(req: NextRequest) {
  const clientId = getClientIdentifier(req.headers);

  // Same per-client limit as the debate endpoint.
  const limit = await rateLimit(clientId, 'debate');
  if (limit.unavailable) {
    return json(503, { error: 'Service temporarily unavailable. Please retry shortly.' }, { 'Retry-After': '5' });
  }
  if (!limit.success) {
    return json(
      429,
      { error: 'Rate limit exceeded. Please wait a minute and try again.' },
      getRateLimitHeaders(limit.limit, limit.remaining, limit.reset)
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: 'Invalid JSON payload.' });
  }
  const b = (body ?? {}) as Record<string, unknown>;

  const material = typeof b.material === 'string' ? b.material.trim() : '';
  if (!material) return json(400, { error: 'Paste the material you want to learn first.' });
  if (material.length > MAX_MATERIAL_CHARS) {
    return json(413, { error: `Material is limited to ${MAX_MATERIAL_CHARS} characters.` });
  }

  const state = sanitizeState(b.state);
  if (!state) return json(400, { error: 'Pick a learner level first.' });

  const message = typeof b.message === 'string' ? redactPii(b.message.trim()) : '';
  if (!message) return json(400, { error: 'Message is required.' });
  if (message.length > MAX_ANSWER_CHARS) {
    return json(413, { error: `Answers are limited to ${MAX_ANSWER_CHARS} characters.` });
  }

  const historyResult = validateHistory(b.history);
  if (!historyResult.ok) return json(historyResult.status, { error: historyResult.error });
  const history = historyResult.history.map((t) => ({ ...t, content: redactPii(t.content) }));

  if (state.turn >= MAX_TURNS) {
    return json(200, {
      reply: 'That is the end of this session. Start a new one to keep practicing.',
      state,
      progress: masteryPercent(state),
      done: true,
    });
  }

  const agentEndpoint =
    process.env.ALGOLIA_AGENT_ENDPOINT || process.env.NEXT_PUBLIC_ALGOLIA_AGENT_ENDPOINT;
  const appId = process.env.ALGOLIA_APP_ID || process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
  const apiKey = process.env.ALGOLIA_AGENT_API_KEY || process.env.ALGOLIA_SEARCH_API_KEY;
  if (!agentEndpoint || !appId || !apiKey) {
    return json(500, { error: 'The coach is not configured.' });
  }

  // Site-wide daily ceiling shared with /api/chat. Checked last so only real model calls count.
  const daily = await rateLimit('global', 'debateDaily');
  if (daily.unavailable || !daily.success) {
    return json(
      503,
      { error: 'The coach is resting for today. Please come back tomorrow.' },
      { 'Retry-After': '3600' }
    );
  }

  const prompt = buildCoachPrompt({ material: redactPii(material), state, explain: b.explain === true });
  const url = new URL(agentEndpoint);
  url.searchParams.set('stream', 'false');
  url.searchParams.set('compatibilityMode', 'ai-sdk-5');

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
          ...history.map((t) => ({ role: t.role, parts: [{ text: t.content }] })),
          { role: 'user', parts: [{ text: `${prompt}\n\nLearner says: ${message}` }] },
        ],
      }),
      signal: AbortSignal.timeout(AGENT_TIMEOUT_MS),
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      return json(504, { error: 'The coach took too long. Please retry.' });
    }
    return json(502, { error: 'Failed to reach the coach.' });
  }
  if (!response.ok) return json(502, { error: `The coach service returned ${response.status}.` });

  const text = extractText(await response.json().catch(() => ({})));
  if (!text.trim()) return json(502, { error: 'The coach returned no response.' });

  const parsed = parseCoachReply(text);
  // The first turn has no learner answer to score yet.
  const next =
    history.length === 0
      ? { ...state, turn: state.turn + 1 }
      : applyAssessment(state, parsed);

  return json(200, {
    reply: parsed.reply,
    state: next,
    progress: masteryPercent(next),
    done: next.turn >= MAX_TURNS,
  });
}
