# 🤔 Contradict Me

An AI-powered debate and critical-thinking trainer. State a position and the app challenges it
with steelman counter-arguments, evidence, and rebuttals.

[![Live Demo](https://img.shields.io/badge/Live_Demo-000?style=for-the-badge&logo=vercel&logoColor=white)](https://contradict-me.vercel.app)
![Next.js](https://img.shields.io/badge/Next.js-000?style=flat-square&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

## What it does

State your opinion on any topic. The chat backend proxies to an Algolia Agent Studio agent,
which challenges your position with counter-arguments, evidence, and logical rebuttals to
sharpen your critical thinking and debate skills. Conversations persist client-side in
IndexedDB (Dexie), so there's no account or server-side storage of your debates.

## Getting started

```bash
git clone https://github.com/forbiddenlink/contradict-me
cd contradict-me
pnpm install
cp .env.example .env.local
```

Fill in `.env.local`: `NEXT_PUBLIC_ALGOLIA_APP_ID`, `NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY`, and
`ALGOLIA_AGENT_ENDPOINT` are required for the chat backend to work. Everything else (Langfuse,
Upstash Redis rate limiting, Sentry, Axiom, PostHog) is optional and degrades gracefully when
unset - rate limiting falls back to in-memory locally.

```bash
pnpm dev
```

### Scripts

```bash
pnpm dev
pnpm build           # next build --webpack (opts out of Turbopack)
pnpm lint            # eslint --max-warnings=0
pnpm format / pnpm format:check   # prettier
pnpm biome:check / pnpm biome:fix / pnpm biome:format
pnpm test / pnpm test:watch / pnpm test:coverage   # vitest
```

## Tech stack

Next.js (App Router), TypeScript, Tailwind CSS, Algolia Agent Studio for the chat backend,
Dexie (IndexedDB) for client-side conversation persistence, Upstash Redis for rate limiting,
Langfuse for LLM tracing. See `CLAUDE.md` for the full architecture and known gotchas.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
