import { vi } from 'vitest';
import { NextRequest } from 'next/server';

const traceMock = vi.fn((_args: { userId: string }) => ({ update: vi.fn(), generation: vi.fn(() => ({ end: vi.fn() })) }));

vi.mock('@/lib/langfuse', () => ({
  getLangfuse: () => ({ trace: traceMock }),
  flushLangfuse: vi.fn(async () => {}),
}));
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: vi.fn(async () => ({ success: true, limit: 25, remaining: 24, reset: 0 })),
  getClientIdentifier: () => '203.0.113.7',
  getRateLimitHeaders: () => ({}),
}));

import { POST } from '@/app/api/chat/route';

function makeReq(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/chat', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

describe('POST /api/chat', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('ALGOLIA_AGENT_ENDPOINT', 'https://agent.example.test/completions');
    vi.stubEnv('ALGOLIA_APP_ID', 'app');
    vi.stubEnv('ALGOLIA_SEARCH_API_KEY', 'key');
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ text: 'ok' }), { status: 200, headers: { 'content-type': 'application/json' } })
    );
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('forwards validated history before the new message', async () => {
    await POST(
      makeReq({
        message: 'but what about X?',
        stream: false,
        history: [
          { role: 'user', content: 'first' },
          { role: 'assistant', content: 'reply' },
        ],
      })
    );
    const sent = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(sent.messages.map((m: { role: string }) => m.role)).toEqual(['user', 'assistant', 'user']);
    expect(sent.messages[2].parts[0].text).toBe('but what about X?');
  });

  it('still works with no history', async () => {
    const res = await POST(makeReq({ message: 'hi', stream: false }));
    expect(res.status).toBe(200);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).messages).toHaveLength(1);
  });

  it('rejects malformed history with 400 and oversized history with 413, without calling upstream', async () => {
    const bad = await POST(makeReq({ message: 'hi', history: [{ role: 'system', content: 'x' }] }));
    expect(bad.status).toBe(400);
    const big = await POST(
      makeReq({
        message: 'hi',
        history: [
          { role: 'user', content: 'a'.repeat(5000) },
          { role: 'assistant', content: 'b'.repeat(5000) },
        ],
      })
    );
    expect(big.status).toBe(413);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does not send the raw client IP to Langfuse', async () => {
    await POST(makeReq({ message: 'hi', stream: false }));
    const arg = traceMock.mock.calls[0][0];
    expect(arg.userId).not.toContain('203.0.113.7');
    expect(arg.userId).toMatch(/^[0-9a-f]{16}$/);
  });
});
