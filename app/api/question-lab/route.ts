import { NextRequest } from 'next/server';
import { rateLimit, getClientIdentifier, getRateLimitHeaders } from '@/lib/rate-limit';
import {
  MAX_QUESTION_CHARS,
  MAX_QUESTION_TURNS,
  buildLabPrompt,
  isDifficulty,
  looksLikeInjection,
  parseLabReply,
  validateLabHistory,
} from '@/lib/question-lab';
import { BRIEFS } from '@/lib/question-lab-briefs';
import { TRUTHS } from '@/lib/question-lab-truths';

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

  const brief = BRIEFS.find((s) => s.id === b.scenarioId);
  const truth = brief ? TRUTHS[brief.id] : undefined;
  if (!brief || !truth) return json(400, { error: 'Unknown scenario.' });
  if (!isDifficulty(b.difficulty)) return json(400, { error: 'Difficulty must be 1 to 4.' });

  const question = typeof b.question === 'string' ? b.question.trim() : '';
  if (!question) return json(400, { error: 'Ask a question.' });
  if (question.length > MAX_QUESTION_CHARS) {
    return json(413, { error: `Questions are limited to ${MAX_QUESTION_CHARS} characters.` });
  }

  const historyResult = validateLabHistory(b.history);
  if (!historyResult.ok) return json(400, { error: historyResult.error });
  const turn = historyResult.playerTurns + 1;
  if (turn > MAX_QUESTION_TURNS) return json(400, { error: 'This investigation is over.' });

  if (looksLikeInjection(question)) {
    return json(200, {
      mode: 'REJECTED',
      reply: 'Rejected: ask a single question about the scenario. Requests to change the rules are not answered.',
      explored: [],
      unexplored: [],
      // Does not use up a turn, so it can never strand the last one.
      turn: historyResult.playerTurns,
      consumed: false,
      done: false,
    });
  }

  const agentEndpoint =
    process.env.ALGOLIA_AGENT_ENDPOINT || process.env.NEXT_PUBLIC_ALGOLIA_AGENT_ENDPOINT;
  const appId = process.env.ALGOLIA_APP_ID || process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
  const apiKey = process.env.ALGOLIA_AGENT_API_KEY || process.env.ALGOLIA_SEARCH_API_KEY;
  if (!agentEndpoint || !appId || !apiKey) {
    return json(500, { error: 'The lab is not configured.' });
  }

  // Site-wide daily ceiling shared with /api/chat. Checked last so only real model calls count.
  const daily = await rateLimit('global', 'debateDaily');
  if (daily.unavailable || !daily.success) {
    return json(
      503,
      { error: 'The lab is resting for today. Please come back tomorrow.' },
      { 'Retry-After': '3600' }
    );
  }

  const prompt = buildLabPrompt({
    brief,
    truth,
    difficulty: b.difficulty,
    turn,
    final: turn === MAX_QUESTION_TURNS,
  });
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
          ...historyResult.history.map((t) => ({ role: t.role, parts: [{ text: t.content }] })),
          { role: 'user', parts: [{ text: `${prompt}\n\nPlayer question: ${question}` }] },
        ],
      }),
      signal: AbortSignal.timeout(AGENT_TIMEOUT_MS),
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      return json(504, { error: 'The lab took too long. Please retry.' });
    }
    return json(502, { error: 'Failed to reach the lab.' });
  }
  if (!response.ok) return json(502, { error: `The lab service returned ${response.status}.` });

  const parsed = parseLabReply(extractText(await response.json().catch(() => ({}))));
  if (!parsed) return json(502, { error: 'The lab returned an unreadable reply. Please retry.' });

  // A finished investigation must carry a full diagnostic, never empty sections.
  const finishing = turn === MAX_QUESTION_TURNS;
  const diagnosticOk =
    !!parsed.golden_question?.trim() && !!parsed.rabbit_hole?.trim() && !!parsed.grade?.trim();
  if ((parsed.done || finishing) && !(parsed.done && diagnosticOk)) {
    return json(502, { error: 'The lab could not finish the diagnostic. Please retry.' });
  }
  return json(200, { ...parsed, turn });
}
