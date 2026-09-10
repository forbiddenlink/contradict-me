import { vi } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import ChatInterface from '@/components/chat/ChatInterface';
import { ThemeProvider } from '@/components/ThemeProvider';
import Home from '@/app/page';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  it('ChatInterface has no accessibility violations', async () => {
    const { container } = render(
      <ThemeProvider>
        <ChatInterface />
      </ThemeProvider>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  }, 10000);

  it('Home page has no accessibility violations', async () => {
    const { container } = render(
      <ThemeProvider>
        <Home />
      </ThemeProvider>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  }, 10000);

  it('ensures keyboard navigation is possible', () => {
    const { container } = render(
      <ThemeProvider>
        <ChatInterface />
      </ThemeProvider>
    );
    const input = container.querySelector('input[type="text"]');
    expect(input).toBeInTheDocument();
    expect(input).not.toHaveAttribute('tabindex', '-1');
  });

  it('all interactive elements have accessible labels', () => {
    const { container } = render(
      <ThemeProvider>
        <ChatInterface />
      </ThemeProvider>
    );
    const buttons = container.querySelectorAll('button');

    buttons.forEach((button) => {
      // Check if button has accessible name (either text content or aria-label)
      const accessibleName = button.textContent || button.getAttribute('aria-label');
      expect(accessibleName).toBeTruthy();
    });
  });
});
