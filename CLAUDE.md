# contradict-me

AI-powered debate and critical-thinking trainer. State a position; the app
challenges it with steelman counter-arguments, evidence, and rebuttals.
Live at https://contradict-me.vercel.app.

## Stack

- Next.js ^16.3.4 (App Router, in the root-level `app/` directory rather
  than under `src/`), TypeScript
- Tailwind CSS 4
- Chat backend: proxies to an **Algolia Agent Studio** endpoint
  (`ALGOLIA_AGENT_ENDPOINT`), not a direct LLM SDK call
- Dexie (IndexedDB) for client-side conversation persistence, not Prisma
  (a `prisma/schema.prisma` exists but is not wired up; see Gotchas)
- Upstash Redis for distributed rate limiting, with an in-memory fallback
  for local dev
- Langfuse for LLM tracing, Sentry, Axiom, PostHog
- Vitest + Testing Library for tests (migrated off Jest; see Gotchas)
- pnpm (`packageManager: pnpm@10.34.5`)

## Commands

- `pnpm dev` - dev server
- `pnpm build` - `next build --webpack` (explicitly opts out of Turbopack)
- `pnpm lint` - ESLint (`eslint . --ext .js,.jsx,.ts,.tsx --max-warnings=0`)
- `pnpm format` / `pnpm format:check` - Prettier
- `pnpm biome:check` / `pnpm biome:fix` / `pnpm biome:format` - Biome, run
  separately from `pnpm lint`/`pnpm format`
- `pnpm test` / `pnpm test:watch` / `pnpm test:coverage` - Vitest

## Layout

- `app/` - routes: `chat/`, `debate/`, `demo/`, `learn/[slug]/`, `about/`,
  `analytics/`, `contact/`, `privacy-policy/`, `test-chat/`,
  `api/chat/route.ts`, `api/health/route.ts`
- `components/{chat,arguments,ui,demo}/`
- `lib/` - `db.ts` (Dexie schema), `rate-limit.ts`, `langfuse.ts`,
  `posthog.ts` / `posthog-server.ts`, `hooks.ts`, `site.ts`, `storage.ts`,
  `topicGuides.ts`, `utils.ts`
- `__tests__/` - Vitest test files
- `src/` - a separate, currently unused tree (`lib/debate-scoring.ts`,
  `lib/safe-action.ts`, `lib/logger.ts`, `lib/upstash.ts`, `mocks/` MSW
  handlers); nothing under `app/`, `components/`, or `lib/` imports it

## Env vars

Real usage (per `.env.example` and `app/api/chat/route.ts`,
`lib/rate-limit.ts`, `lib/langfuse.ts`):
`NEXT_PUBLIC_ALGOLIA_APP_ID`, `NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY`,
`ALGOLIA_AGENT_ENDPOINT` (chat backend), `LANGFUSE_SECRET_KEY`,
`LANGFUSE_PUBLIC_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
(rate limiting; falls back to in-memory if unset), `NEXT_PUBLIC_SENTRY_DSN`,
`NEXT_PUBLIC_AXIOM_DATASET`, `AXIOM_TOKEN`, `NEXT_PUBLIC_POSTHOG_KEY`,
`NEXT_PUBLIC_POSTHOG_HOST`.

`GROQ_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` are listed in
`.env.example` but nothing in `app/`, `lib/`, or `components/` reads them.

## Gotchas

- `lib/env.ts` (Algolia-only schema) and `src/env.ts` (a much larger schema
  including Stripe, N8N, and other vars unrelated to this app) are both
  unused: nothing imports either. Real env reads are inline `process.env.*`
  calls in the route handlers and `lib/` files listed above.
- The test suite migrated from Jest to Vitest; `jest.config.ts` is gone and
  `pnpm test` runs `vitest run`. Leftover Jest packages (`jest`,
  `@jest/globals`, `jest-environment-jsdom`) are still in `package.json`
  but nothing imports them. The `@` alias in `vitest.config.ts` must point
  at the repo root (matching `tsconfig`'s `"@/*": ["./*"]`), not `./src` -
  pointing it at `./src` makes every `@/...` import in `__tests__` fail to
  resolve and the suite silently collects 0 tests.
- The MSW mocks in `src/mocks/` are unused scaffolding; `vitest-setup.ts`
  used to call `server.listen()` but that broke tests that mock
  `global.fetch` directly, so it was removed rather than reconciled.
- Path alias `@/*` maps to the repo root (`./*`), not `./src/*`. An import
  written as `@/lib/db` resolves to the root-level `lib/db.ts`, not
  anything under `src/lib/`.
