import { NextRequest, NextResponse } from "next/server";
import {
  rateLimit,
  getRateLimitHeaders,
  getClientIdentifier,
  type RateLimitType,
} from "../rate-limit";

/**
 * Rate limit middleware for API routes.
 *
 * @example
 * ```typescript
 * export async function POST(request: NextRequest) {
 *   const rateLimitResult = await withRateLimit(request, "ai");
 *   if (rateLimitResult) return rateLimitResult;
 *
 *   // ... rest of handler
 * }
 * ```
 */
export async function withRateLimit(
  request: NextRequest,
  type: RateLimitType = "api",
  identifier?: string
): Promise<NextResponse | null> {
  const id = identifier ?? getClientIdentifier(request.headers);
  const result = await rateLimit(id, type);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded. Please wait a minute and try again.",
        arguments: [],
      },
      {
        status: 429,
        headers: getRateLimitHeaders(result.limit, result.remaining, result.reset),
      }
    );
  }

  return null;
}

/**
 * Higher-order function to wrap an API handler with rate limiting.
 *
 * @example
 * ```typescript
 * export const POST = rateLimited("ai", async (request: NextRequest) => {
 *   // ... handler logic
 * });
 * ```
 */
export function rateLimited<T>(
  type: RateLimitType,
  handler: (request: NextRequest) => Promise<T>
): (request: NextRequest) => Promise<T | NextResponse> {
  return async (request: NextRequest) => {
    const rateLimitResult = await withRateLimit(request, type);
    if (rateLimitResult) return rateLimitResult;
    return handler(request);
  };
}
