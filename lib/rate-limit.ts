import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// =============================================================================
// Upstash Redis Rate Limiting
// =============================================================================

/**
 * Check if Upstash Redis is configured.
 * Falls back to in-memory for local development.
 */
const isUpstashConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

// Redis client (lazy initialized)
let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!isUpstashConfigured) return null;
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return redis;
}

// =============================================================================
// Rate Limit Configurations
// =============================================================================

export const RATE_LIMIT_CONFIGS = {
  /** AI/Chat endpoints - expensive operations: 10/minute */
  ai: { requests: 10, duration: "1 m" as const, prefix: "contradict:ai" },
  /** Standard API endpoints: 60/minute */
  api: { requests: 60, duration: "1 m" as const, prefix: "contradict:api" },
  /** Auth endpoints - prevent brute force: 5/minute */
  auth: { requests: 5, duration: "1 m" as const, prefix: "contradict:auth" },
  /** Debate mode - slightly higher for back-and-forth: 25/minute */
  debate: { requests: 25, duration: "1 m" as const, prefix: "contradict:debate" },
  /**
   * Site-wide ceiling on Agent Studio calls, keyed on one shared identifier. Per-client limits
   * do not bound total spend: in Oct 2026 public traffic ran the OpenAI bill past its budget.
   */
  debateDaily: { requests: 400, duration: "1 d" as const, prefix: "contradict:debate-daily" },
} as const;

export type RateLimitType = keyof typeof RATE_LIMIT_CONFIGS;

// =============================================================================
// In-Memory Fallback (for local development)
// =============================================================================

interface InMemoryEntry {
  count: number;
  resetAt: number;
}

const inMemoryStore = new Map<string, InMemoryEntry>();

function inMemoryRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const key = identifier;

  // Clean up expired entries periodically
  const keysToDelete: string[] = [];
  inMemoryStore.forEach((v, k) => {
    if (v.resetAt <= now) keysToDelete.push(k);
  });
  keysToDelete.forEach((k) => inMemoryStore.delete(k));

  const entry = inMemoryStore.get(key);

  if (!entry || entry.resetAt <= now) {
    inMemoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, limit, remaining: limit - 1, reset: now + windowMs };
  }

  if (entry.count >= limit) {
    return { success: false, limit, remaining: 0, reset: entry.resetAt };
  }

  entry.count++;
  return { success: true, limit, remaining: limit - entry.count, reset: entry.resetAt };
}

// =============================================================================
// Rate Limiter Cache
// =============================================================================

const rateLimiterCache = new Map<RateLimitType, Ratelimit>();

function getRateLimiter(type: RateLimitType): Ratelimit | null {
  const redisClient = getRedis();
  if (!redisClient) return null;

  if (!rateLimiterCache.has(type)) {
    const config = RATE_LIMIT_CONFIGS[type];
    rateLimiterCache.set(
      type,
      new Ratelimit({
        redis: redisClient,
        limiter: Ratelimit.slidingWindow(config.requests, config.duration),
        analytics: true,
        prefix: config.prefix,
        // Default is 5s and a timeout resolves { success: true, reason: "timeout" } instead of
        // throwing, so a stalled Redis would allow every request. Keep it short; see rateLimit().
        timeout: 1500,
      })
    );
  }

  return rateLimiterCache.get(type)!;
}

// =============================================================================
// Main Rate Limit Function
// =============================================================================

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  /** True when the limiter could not answer (Redis timeout). Callers should respond 503. */
  unavailable?: boolean;
}

/**
 * Check rate limit for an identifier.
 * Uses Upstash Redis in production, falls back to in-memory for development.
 *
 * @param identifier - Unique key (user ID, IP, etc.)
 * @param type - Type of rate limit to apply
 * @returns Rate limit result with success status and headers info
 */
export async function rateLimit(
  identifier: string,
  type: RateLimitType = "api"
): Promise<RateLimitResult> {
  const config = RATE_LIMIT_CONFIGS[type];
  const limiter = getRateLimiter(type);

  // Use in-memory fallback for local development
  if (!limiter) {
    // In production an in-memory map is per serverless instance, so it limits nothing.
    // Fail closed rather than serve paid AI calls with no working limiter.
    if (process.env.VERCEL_ENV === "production") {
      return { success: false, limit: config.requests, remaining: 0, reset: Date.now() + 5000, unavailable: true };
    }
    const windowMs = parseDuration(config.duration);
    return inMemoryRateLimit(identifier, config.requests, windowMs);
  }

  const result = await limiter.limit(identifier);
  if (result.reason === "timeout") {
    return { success: false, limit: result.limit, remaining: 0, reset: Date.now() + 5000, unavailable: true };
  }
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

/**
 * Parse duration string to milliseconds.
 */
function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)\s*(s|m|h|d)$/);
  if (!match) return 60000; // Default to 1 minute

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "d":
      return value * 24 * 60 * 60 * 1000;
    default:
      return 60000;
  }
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Generate rate limit headers for HTTP responses.
 */
export function getRateLimitHeaders(
  limit: number,
  remaining: number,
  reset: number
): Record<string, string> {
  const retryAfter = Math.max(0, Math.ceil((reset - Date.now()) / 1000));
  return {
    "X-RateLimit-Limit": limit.toString(),
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": reset.toString(),
    "Retry-After": retryAfter.toString(),
  };
}

/**
 * Get client identifier from request headers.
 */
export function getClientIdentifier(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return headers.get("x-real-ip") ?? "anonymous";
}

/**
 * Check if request is rate limited and return appropriate response if so.
 * Returns null if not rate limited, Response if rate limited.
 */
export async function checkRateLimitOrRespond(
  identifier: string,
  type: RateLimitType = "api"
): Promise<Response | null> {
  const result = await rateLimit(identifier, type);

  if (result.unavailable) {
    return new Response(JSON.stringify({ error: "Service temporarily unavailable. Please retry shortly.", arguments: [] }), {
      status: 503,
      headers: { "Content-Type": "application/json", "Retry-After": "5" },
    });
  }

  if (!result.success) {
    return new Response(
      JSON.stringify({
        error: "Rate limit exceeded. Please wait a minute and try again.",
        arguments: [],
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          ...getRateLimitHeaders(result.limit, result.remaining, result.reset),
        },
      }
    );
  }

  return null;
}
