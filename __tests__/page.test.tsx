import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '@/app/page';
import { ThemeProvider } from '@/components/ThemeProvider';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Helper to wrap components with ThemeProvider
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Home Page', () => {
  it('renders the main heading', () => {
    renderWithTheme(<Home />);
    const heading = screen.getByRole('heading', { name: /An AI that disagrees with you/i });
    expect(heading).toBeInTheDocument();
  });

  it('renders the tagline', () => {
    renderWithTheme(<Home />);
    expect(
      screen.getByText(/Challenge your beliefs with the strongest counterarguments/i)
    ).toBeInTheDocument();
  });

  it('renders the challenge input', () => {
    renderWithTheme(<Home />);
    const input = screen.getByPlaceholderText(/Tell me something you believe strongly/i);
    expect(input).toBeInTheDocument();
  });

  it('renders the Challenge Me button', () => {
    renderWithTheme(<Home />);
    const button = screen.getByRole('button', { name: /Challenge Me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Challenge Me');
  });

  it('renders example topics', () => {
    renderWithTheme(<Home />);
    expect(screen.getByText(/Nuclear energy/i)).toBeInTheDocument();
    expect(screen.getByText(/College ROI/i)).toBeInTheDocument();
    expect(screen.getByText(/AI & Jobs/i)).toBeInTheDocument();
  });

  it('renders feature cards', () => {
    renderWithTheme(<Home />);
    expect(screen.getByText(/Evidence-Based/i)).toBeInTheDocument();
    expect(screen.getByText(/Steel-Manned/i)).toBeInTheDocument();
    expect(screen.getByText(/Respectful/i)).toBeInTheDocument();
  });

  it('renders the contest submission status', () => {
    renderWithTheme(<Home />);
    expect(screen.getByText(/Algolia Agent Studio Challenge/i)).toBeInTheDocument();
    // Use getAllByText since "26 arguments indexed" appears in multiple places (banner + footer area)
    const argumentsTexts = screen.getAllByText(/26 arguments indexed/i);
    expect(argumentsTexts.length).toBeGreaterThanOrEqual(1);
  });
});
