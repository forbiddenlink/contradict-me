import { beforeEach, describe, expect, it, vi } from 'vitest';

const limit = vi.hoisted(() => vi.fn());

vi.mock('@upstash/redis', () => ({ Redis: class {} }));
vi.mock('@upstash/ratelimit', () => {
  class Ratelimit {
    static slidingWindow() {
      return {};
    }
    limit = limit;
  }
  return { Ratelimit };
});

async function load() {
  vi.resetModules();
  process.env.UPSTASH_REDIS_REST_URL = 'https://example.invalid';
  process.env.UPSTASH_REDIS_REST_TOKEN = 'x';
  return import('@/lib/rate-limit');
}

describe('rateLimit timeout handling', () => {
  beforeEach(() => limit.mockReset());

  it('marks a limiter timeout as unavailable and not successful', async () => {
    const { rateLimit } = await load();
    limit.mockResolvedValue({
      success: true,
      reason: 'timeout',
      limit: 10,
      remaining: 0,
      reset: 0,
    });
    const r = await rateLimit('ip', 'debate');
    expect(r.success).toBe(false);
    expect(r.unavailable).toBe(true);
  });

  it('checkRateLimitOrRespond answers 503 on timeout', async () => {
    const { checkRateLimitOrRespond } = await load();
    limit.mockResolvedValue({
      success: true,
      reason: 'timeout',
      limit: 10,
      remaining: 0,
      reset: 0,
    });
    const res = await checkRateLimitOrRespond('ip', 'debate');
    expect(res?.status).toBe(503);
  });

  it('passes a normal allow through', async () => {
    const { rateLimit } = await load();
    limit.mockResolvedValue({ success: true, limit: 10, remaining: 9, reset: 1 });
    const r = await rateLimit('ip', 'debate');
    expect(r).toEqual({ success: true, limit: 10, remaining: 9, reset: 1 });
  });
});

describe('rateLimit without Upstash', () => {
  async function loadWithoutUpstash(vercelEnv: string | undefined) {
    vi.resetModules();
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    if (vercelEnv) process.env.VERCEL_ENV = vercelEnv;
    else delete process.env.VERCEL_ENV;
    return import('@/lib/rate-limit');
  }

  it('fails closed in production, where an in-memory map limits nothing', async () => {
    const { rateLimit } = await loadWithoutUpstash('production');
    const r = await rateLimit('ip', 'debate');
    expect(r.success).toBe(false);
    expect(r.unavailable).toBe(true);
    delete process.env.VERCEL_ENV;
  });

  it('keeps the in-memory fallback outside production', async () => {
    const { rateLimit } = await loadWithoutUpstash(undefined);
    const r = await rateLimit('ip-dev', 'debate');
    expect(r.success).toBe(true);
  });
});
