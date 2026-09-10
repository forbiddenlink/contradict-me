import { vi } from 'vitest'
// Registers jest-dom's matchers (toBeInTheDocument, etc.) on vitest's `expect`.
// Without this every matcher call throws "Invalid Chai property" - the suite
// collects fine but almost every assertion fails.
import '@testing-library/jest-dom/vitest'

// jsdom does not implement these; jest.setup.ts already carried the same
// polyfills for the (still-running) Jest suite - ported here so vitest sees
// the same environment.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

global.window.scrollTo = vi.fn()

global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
} as unknown as typeof IntersectionObserver

Element.prototype.scrollIntoView = () => {}

// NOTE: MSW's setupServer/server.listen() used to run here, but nothing in
// __tests__ imports src/mocks/handlers or src/mocks/server - it was unused
// scaffolding. Worse, MSW's node interceptor replaces `global.fetch` at
// listen() time, which silently broke the tests that mock fetch directly
// with `global.fetch = vi.fn()` (ChatInterface.test.tsx,
// accessibility.test.tsx): `global.fetch` stopped being their mock function
// by the time the test body ran, so `.mockResolvedValueOnce` etc. did not
// exist. Removed rather than reconciled, since no test depends on it; if a
// future test needs MSW, scope `server.listen()`/`server.close()` to that
// file's own `beforeAll`/`afterAll` instead of the shared setup file.
