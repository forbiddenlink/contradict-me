/**
 * Conversation history sent with each chat turn.
 *
 * Shared by the client (trim before sending) and the route (validate on receipt)
 * so both sides agree on the limits. The per-message cap matches the route's
 * MAX_MESSAGE_LENGTH.
 */

export const MAX_HISTORY_MESSAGES = 12;
export const MAX_HISTORY_CHARS = 8000;
export const MAX_HISTORY_ITEM_CHARS = 8000;

export interface HistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type HistoryValidation =
  | { ok: true; history: HistoryMessage[] }
  | { ok: false; status: 400 | 413; error: string };

/**
 * Pick the most recent turns that fit the message and character caps.
 * Oldest turns are dropped first. The window always starts on a user turn so the
 * upstream agent never sees a leading assistant message. Empty turns are skipped.
 */
export function trimHistory(
  messages: ReadonlyArray<{ role: string; content: string }>,
  maxMessages: number = MAX_HISTORY_MESSAGES,
  maxChars: number = MAX_HISTORY_CHARS
): HistoryMessage[] {
  const picked: HistoryMessage[] = [];
  let total = 0;

  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if ((m.role !== 'user' && m.role !== 'assistant') || typeof m.content !== 'string') continue;
    const content = m.content.trim();
    if (!content) continue;
    if (picked.length >= maxMessages) break;
    if (content.length > MAX_HISTORY_ITEM_CHARS || total + content.length > maxChars) break;
    picked.unshift({ role: m.role, content });
    total += content.length;
  }

  while (picked.length > 0 && picked[0].role !== 'user') picked.shift();
  return picked;
}

/** Validate the `history` field of a chat request body. Absent means no history. */
export function validateHistory(raw: unknown): HistoryValidation {
  if (raw === undefined || raw === null) return { ok: true, history: [] };
  if (!Array.isArray(raw)) return { ok: false, status: 400, error: 'History must be an array.' };
  if (raw.length > MAX_HISTORY_MESSAGES) {
    return {
      ok: false,
      status: 400,
      error: `History exceeds ${MAX_HISTORY_MESSAGES} messages.`,
    };
  }

  const history: HistoryMessage[] = [];
  let total = 0;
  for (const item of raw) {
    if (!item || typeof item !== 'object') {
      return { ok: false, status: 400, error: 'Each history item must be an object.' };
    }
    const { role, content } = item as { role?: unknown; content?: unknown };
    if (role !== 'user' && role !== 'assistant') {
      return { ok: false, status: 400, error: 'History role must be "user" or "assistant".' };
    }
    if (typeof content !== 'string' || !content.trim()) {
      return { ok: false, status: 400, error: 'History content must be a non-empty string.' };
    }
    if (content.length > MAX_HISTORY_ITEM_CHARS) {
      return { ok: false, status: 413, error: 'A history message is too long.' };
    }
    total += content.length;
    if (total > MAX_HISTORY_CHARS) {
      return {
        ok: false,
        status: 413,
        error: `History exceeds ${MAX_HISTORY_CHARS} characters.`,
      };
    }
    history.push({ role, content: content.trim() });
  }
  return { ok: true, history };
}
