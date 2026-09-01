import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Rate limiter — only active when Upstash env vars are set.
// This guards /api/*, most importantly /api/chat, which spends model credits
// per call and is reachable unauthenticated.
const ratelimit =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(20, '10 s'),
        analytics: true,
        prefix: 'rl',
      })
    : null;

function clientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1';
}

export async function proxy(request: NextRequest) {
  // API routes: rate limit only. No CSP work — these responses are not documents.
  if (request.nextUrl.pathname.startsWith('/api')) {
    if (ratelimit) {
      const { success } = await ratelimit.limit(clientIp(request));
      if (!success) {
        return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
      }
    }
    return NextResponse.next();
  }

  // Generate a unique nonce for this request
  const nonce = Buffer.from(nanoid()).toString('base64');

  // Build CSP with nonce for scripts and styles
  const isDev = process.env.NODE_ENV !== 'production';

  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    ...(isDev ? ["'unsafe-eval'"] : []),
  ].join(' ');

  const connectSrc = [
    "'self'",
    ...(isDev ? ['ws:', 'wss:'] : []),
    'https://*.algolia.net',
    'https://*.algolianet.com',
    'https://ai-sdk-5.api.algolia.com',
    'https://vitals.vercel-analytics.com',
    'https://vercel.live',
  ].join(' ');

  const cspHeader = `
    default-src 'self';
    script-src ${scriptSrc};
    style-src 'self' 'nonce-${nonce}';
    img-src 'self' data: blob: https:;
    font-src 'self' data:;
    connect-src ${connectSrc};
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\\s{2,}/g, ' ')
    .trim();

  // Add nonce to request headers so we can access it in pages
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspHeader);

  // Create response with updated headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Set CSP header on response
  response.headers.set('Content-Security-Policy', cspHeader);

  // Add HSTS header for security
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

  return response;
}

// Configure which routes the proxy runs on
export const config = {
  matcher: [
    // API routes, so the rate limiter above actually runs on them.
    '/api/:path*',
    /*
     * Match all request paths except for the ones starting with:
     * - api (handled by the entry above)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)/',
  ],
};
