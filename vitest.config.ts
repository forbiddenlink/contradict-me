import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest-setup.ts'],
    globals: true,
    // Explicit even though vitest already defaults to this: a suite that
    // collects zero tests must exit non-zero, not read as "nothing to run,
    // fine". This is what CI checks, in the "Vitest" step below.
    passWithNoTests: false,
  },
  resolve: {
    alias: {
      // Must match tsconfig's `"@/*": ["./*"]`, which is the repo ROOT, not ./src.
      // This pointed at ./src, where almost nothing lives — components/ and lib/
      // are at the root — so every `@/...` import in __tests__ failed to resolve
      // and the entire suite collected 0 tests while CI showed failed FILES
      // rather than failed tests.
      '@': resolve(__dirname, '.'),
    },
  },
})
