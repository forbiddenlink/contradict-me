import {
  trimHistory,
  validateHistory,
  MAX_HISTORY_MESSAGES,
  MAX_HISTORY_CHARS,
} from '@/lib/chat-history';

describe('trimHistory', () => {
  it('drops a leading assistant greeting and keeps order', () => {
    const out = trimHistory([
      { role: 'assistant', content: 'welcome' },
      { role: 'user', content: 'a' },
      { role: 'assistant', content: 'b' },
    ]);
    expect(out).toEqual([
      { role: 'user', content: 'a' },
      { role: 'assistant', content: 'b' },
    ]);
  });

  it('caps by message count, oldest first', () => {
    const msgs = Array.from({ length: 30 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `m${i}`,
    }));
    const out = trimHistory(msgs);
    expect(out.length).toBeLessThanOrEqual(MAX_HISTORY_MESSAGES);
    expect(out.at(-1)?.content).toBe('m29');
    expect(out[0].role).toBe('user');
  });

  it('caps by total characters, oldest first', () => {
    const big = 'x'.repeat(3000);
    const out = trimHistory([
      { role: 'user', content: 'old ' + big },
      { role: 'assistant', content: 'mid ' + big },
      { role: 'user', content: 'new ' + big },
    ]);
    const total = out.reduce((n, m) => n + m.content.length, 0);
    expect(total).toBeLessThanOrEqual(MAX_HISTORY_CHARS);
    expect(out.some((m) => m.content.startsWith('old'))).toBe(false);
    expect(out.at(-1)?.content.startsWith('new')).toBe(true);
  });

  it('skips empty placeholder turns and returns [] for no input', () => {
    expect(trimHistory([{ role: 'assistant', content: '  ' }])).toEqual([]);
    expect(trimHistory([])).toEqual([]);
  });

  it('output always passes server validation', () => {
    const msgs = Array.from({ length: 50 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: 'y'.repeat(900),
    }));
    expect(validateHistory(trimHistory(msgs)).ok).toBe(true);
  });
});

describe('validateHistory', () => {
  it('accepts absent history', () => {
    expect(validateHistory(undefined)).toEqual({ ok: true, history: [] });
  });

  it('rejects non-arrays, bad roles, empty and non-string content', () => {
    expect(validateHistory('x')).toMatchObject({ ok: false, status: 400 });
    expect(validateHistory([{ role: 'system', content: 'x' }])).toMatchObject({ ok: false, status: 400 });
    expect(validateHistory([{ role: 'user', content: '' }])).toMatchObject({ ok: false, status: 400 });
    expect(validateHistory([{ role: 'user', content: 5 }])).toMatchObject({ ok: false, status: 400 });
    expect(validateHistory([null])).toMatchObject({ ok: false, status: 400 });
  });

  it('rejects too many messages with 400 and too many characters with 413', () => {
    const many = Array.from({ length: MAX_HISTORY_MESSAGES + 1 }, () => ({ role: 'user', content: 'a' }));
    expect(validateHistory(many)).toMatchObject({ ok: false, status: 400 });
    const long = [
      { role: 'user', content: 'a'.repeat(5000) },
      { role: 'assistant', content: 'b'.repeat(5000) },
    ];
    expect(validateHistory(long)).toMatchObject({ ok: false, status: 413 });
  });
});
