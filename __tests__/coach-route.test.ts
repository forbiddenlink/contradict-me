import { vi } from 'vitest';
import { NextRequest } from 'next/server';

const rateLimitMock = vi.fn(async (_id: string, _type: string) => ({
  success: true,
  limit: 25,
  remaining: 24,
  reset: 0,
}));
vi.mock('@/lib/rate-limit', () => ({
  rateLimit: (id: string, type: string) => rateLimitMock(id, type),
  getClientIdentifier: () => '203.0.113.7',
  getRateLimitHeaders: () => ({}),
}));

import { POST } from '@/app/api/coach/route';
import { MAX_MATERIAL_CHARS, MAX_TURNS, initialState } from '@/lib/socratic-coach';

function makeReq(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/coach', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

const agentReply = (text: string) =>
  new Response(JSON.stringify({ text }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });

const valid = {
  material: 'Photosynthesis turns light into sugar.',
  state: initialState('some foundation'),
  history: [],
  message: 'Begin.',
};

describe('POST /api/coach', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('ALGOLIA_AGENT_ENDPOINT', 'https://agent.example.test/completions');
    vi.stubEnv('ALGOLIA_APP_ID', 'app');
    vi.stubEnv('ALGOLIA_SEARCH_API_KEY', 'key');
    fetchMock.mockResolvedValue(
      agentReply('{"reply":"What is this about?","quality":"adequate","concept":"light"}')
    );
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('returns the next question and updated state', async () => {
    const res = await POST(makeReq(valid));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.reply).toBe('What is this about?');
    expect(json.state.turn).toBe(1);
    expect(json.done).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('scores the learner answer once history exists', async () => {
    fetchMock.mockResolvedValue(
      agentReply('{"reply":"Why?","quality":"shallow","concept":"light"}')
    );
    const res = await POST(
      makeReq({
        ...valid,
        state: { ...initialState('some foundation'), turn: 1 },
        history: [
          { role: 'user', content: 'Begin.' },
          { role: 'assistant', content: 'What is this about?' },
        ],
        message: 'idk',
      })
    );
    const json = await res.json();
    expect(json.state.shallow_streak).toBe(1);
    expect(json.state.turn).toBe(2);
  });

  it('sends the material and strips personal data before calling the model', async () => {
    await POST(makeReq({ ...valid, message: 'reach me at me@example.com' }));
    const sent = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    const text = JSON.stringify(sent);
    expect(text).toContain('Photosynthesis turns light into sugar.');
    expect(text).not.toContain('me@example.com');
  });

  it('rejects bad input without calling the model', async () => {
    for (const bad of [
      { ...valid, material: '' },
      { ...valid, material: 'x'.repeat(MAX_MATERIAL_CHARS + 1) },
      { ...valid, state: { level: 'wizard' } },
      { ...valid, message: '   ' },
      { ...valid, history: 'nope' },
    ]) {
      const res = await POST(makeReq(bad));
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('ends the session at the turn cap without calling the model', async () => {
    const res = await POST(
      makeReq({ ...valid, state: { ...initialState('advanced'), turn: MAX_TURNS } })
    );
    const json = await res.json();
    expect(json.done).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('uses the shared per-client and site-wide limits', async () => {
    await POST(makeReq(valid));
    const types = rateLimitMock.mock.calls.map((c) => c[1]);
    expect(types).toEqual(['debate', 'debateDaily']);
  });

  it('returns 429 when the client is limited', async () => {
    rateLimitMock.mockResolvedValueOnce({ success: false, limit: 25, remaining: 0, reset: 0 });
    const res = await POST(makeReq(valid));
    expect(res.status).toBe(429);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 503 when the daily ceiling is reached', async () => {
    rateLimitMock.mockResolvedValueOnce({ success: true, limit: 25, remaining: 1, reset: 0 });
    rateLimitMock.mockResolvedValueOnce({ success: false, limit: 400, remaining: 0, reset: 0 });
    const res = await POST(makeReq(valid));
    expect(res.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns 502 when the agent fails', async () => {
    fetchMock.mockResolvedValue(new Response('boom', { status: 500 }));
    const res = await POST(makeReq(valid));
    expect(res.status).toBe(502);
  });

  it('asks for a direct explanation when requested', async () => {
    await POST(makeReq({ ...valid, explain: true }));
    const sent = JSON.stringify(JSON.parse(fetchMock.mock.calls[0][1].body as string));
    expect(sent).toMatch(/explain directly/i);
  });
});
