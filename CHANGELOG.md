# Changelog

## 1.0.0 (2026-04-07)


### Features

* add health check endpoint (/api/health) ([ea171fd](https://github.com/forbiddenlink/contradict-me/commit/ea171fd025dc66b7c2a87ba895328865f4cceeaa))
* apply 2026 glassmorphism design trends ([5cf2475](https://github.com/forbiddenlink/contradict-me/commit/5cf24753303f337405063d5ca13d3566123b3079))


### Bug Fixes

* add all missing ESLint plugin dependencies ([aea083d](https://github.com/forbiddenlink/contradict-me/commit/aea083d20988109444d9ff45327e4b74dfc8ac18))
* add missing @eslint/js dependency ([f0a383e](https://github.com/forbiddenlink/contradict-me/commit/f0a383e0e6cf3fbbe6627046927b387f907f0597))
* add missing typescript-eslint dependency ([4d30a48](https://github.com/forbiddenlink/contradict-me/commit/4d30a48c10b0b4660bc67b089a861fdbd7c96fb9))
* add required maxDuration to TriggerConfig ([63f3a78](https://github.com/forbiddenlink/contradict-me/commit/63f3a78be3558f7b29e17583236bfb437caf8a8a))
* add zod dependency to resolve module not found error ([73fb739](https://github.com/forbiddenlink/contradict-me/commit/73fb73962300a50e0e592c8dc39f561ae11fedc3))
* align package.json name with project identity ([8bb7146](https://github.com/forbiddenlink/contradict-me/commit/8bb7146d299f7ff7150f4ac84246f03fbbc485a6))
* **ci:** run prettier on package.json to fix format check ([2e20ea1](https://github.com/forbiddenlink/contradict-me/commit/2e20ea1bac1623df3e78a5e0629b718524ea11f5))
* disable Sentry webpack plugin when SENTRY_AUTH_TOKEN not set to prevent middleware NFT error ([654d7c7](https://github.com/forbiddenlink/contradict-me/commit/654d7c724da2cf9ce0dab4bc4beebbea0ea441e9))
* disable Turbopack to fix middleware.js.nft.json missing in Next.js 16 build ([e577a77](https://github.com/forbiddenlink/contradict-me/commit/e577a77f044f41fe478adea6c6260c0f7e1f310f))
* env.ts import, sentry paths, MSW types, safe-action api ([788131b](https://github.com/forbiddenlink/contradict-me/commit/788131bfb8647d0b7b045d9028c46962dfa88c20))
* prefix unused error parameters with underscore to satisfy ESLint ([1370c9c](https://github.com/forbiddenlink/contradict-me/commit/1370c9c169bf8de5d99fbc7d935f5ff3892bab2e))
* regenerate npm lockfile with clean install ([2e2142b](https://github.com/forbiddenlink/contradict-me/commit/2e2142b4c5d02698c8159b6a309e4b67a37021a0))
* remove env.ts import from next.config ([d00ef34](https://github.com/forbiddenlink/contradict-me/commit/d00ef34e61acc9d310d48629cc96b4a128f7433d))
* remove unused RateLimitResult import ([fb12abc](https://github.com/forbiddenlink/contradict-me/commit/fb12abcf9bb20380ddc9ae3145bce629f4d1c060))
* resolve CI/CD failures - remove conflicting ESLint config and fix lint script ([020af02](https://github.com/forbiddenlink/contradict-me/commit/020af027ca5c3bb704c315d4ee5bfe401cbd6065))
* revert Codacy YAML to Prettier formatting ([7e7daba](https://github.com/forbiddenlink/contradict-me/commit/7e7daba04c822f3bbb77665046190c0cc899e8da))
* update CI to use pnpm ([5fa151e](https://github.com/forbiddenlink/contradict-me/commit/5fa151eb9002e63684c4a7be42f0604dfad21416))
* upgrade @sentry/nextjs to ^10 for Next.js 16 compat, regenerate lockfile ([f36cd07](https://github.com/forbiddenlink/contradict-me/commit/f36cd070404ac2eef05df14b515a1c975da8d851))
* use next build --webpack to disable Turbopack in Next.js 16 ([2cb44e9](https://github.com/forbiddenlink/contradict-me/commit/2cb44e951d026cd8f4f905ae31e1892291c3fe77))
* use Sentry v10 useRunAfterProductionCompileHook: false to prevent middleware NFT error ([76b1313](https://github.com/forbiddenlink/contradict-me/commit/76b13136afdf7df0e403a5357ce5edc602fb0c8a))
* use Sentry v10 webpack.disableSentryConfig to prevent middleware NFT error ([55f9932](https://github.com/forbiddenlink/contradict-me/commit/55f993279015d3fb680621fb324dc8d145321255))
* Vercel build fixes ([249fc5e](https://github.com/forbiddenlink/contradict-me/commit/249fc5e20f006f5eab2ef51975f826618c717197))

## 2026-01-13 - Major Polish Update

### New Arguments Added (5)

- Gun control and safety
- Abortion rights and bodily autonomy
- Drug legalization harm reduction
- Cryptocurrency regulation vs innovation
- School choice and voucher programs

**Total Arguments: 26** (Average quality: 88.1/100)

### Typography & Spacing

- Switched to Inter font (from Plus Jakarta Sans) for better readability
- Updated to JetBrains Mono (from Fira Code) for code elements
- Improved letter-spacing and line-height across all text
- Increased padding and margins throughout for better breathing room
- Better responsive text scaling (mobile to desktop)

### Mobile Responsiveness

- All buttons now meet 44px minimum touch target size
- Improved responsive typography with sm/md breakpoints
- Better input field sizing on mobile devices
- Enhanced suggestion pill sizing and spacing
- Optimized grid layouts for smaller screens

### UX Improvements

- **Conversation persistence**: Conversations saved to localStorage (24hr expiry)
- **Error boundary**: Graceful error handling with recovery UI
- **Loading states**: Added loading.tsx with spinner
- **404 page**: Custom not-found page
- **Smooth scrolling**: Enabled smooth scroll behavior
- **Focus indicators**: Better keyboard navigation with visible focus rings
- **Accessibility**: Added comprehensive ARIA labels and roles throughout

### Performance & Security

- Enabled SWC minification
- Image optimization configuration (AVIF, WebP)
- Security headers (X-Frame-Options, CSO, etc.)
- CSS optimization enabled
- Compressed responses

### Error Handling

- Retry functionality on API errors
- Better error messages with user guidance
- Fallback UI for React errors
- Automatic conversation recovery

### Code Quality

- All TypeScript errors resolved
- ESLint warnings fixed
- Consistent code formatting
- Type safety throughout

### Build Status

✅ All files building successfully
✅ No compilation errors
✅ All 26 arguments indexed to Algolia
