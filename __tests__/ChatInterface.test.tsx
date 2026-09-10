import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatInterface from '@/components/chat/ChatInterface';
import { ThemeProvider } from '@/components/ThemeProvider';

// Mock fetch
global.fetch = vi.fn();

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    };
  },
  usePathname() {
    return '/chat';
  },
}));

describe('ChatInterface', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider>{component}</ThemeProvider>);
  };

  it('renders the initial assistant message', () => {
    renderWithTheme(<ChatInterface />);
    expect(screen.getByText(/I'm ContradictMe/i)).toBeInTheDocument();
  });

  it('renders the chat input', () => {
    renderWithTheme(<ChatInterface />);
    const input = screen.getByPlaceholderText(/Tell me something you believe strongly/i);
    expect(input).toBeInTheDocument();
  });

  it('renders suggestion buttons when no user messages', () => {
    renderWithTheme(<ChatInterface />);
    expect(screen.getByText(/Nuclear energy/i)).toBeInTheDocument();
  });

  it('allows typing in the input field', () => {
    renderWithTheme(<ChatInterface />);
    const input = screen.getByPlaceholderText(
      /Tell me something you believe strongly/i
    ) as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'Climate change is urgent' } });
    expect(input.value).toBe('Climate change is urgent');
  });

  it('sends a message when send button is clicked', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Test response', arguments: [] }),
    });

    renderWithTheme(<ChatInterface />);
    const input = screen.getByPlaceholderText(/Tell me something you believe strongly/i);
    const button = screen.getByRole('button', { name: /Challenge Me/i });

    fireEvent.change(input, { target: { value: 'Climate change is urgent' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/chat',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });
  });

  it('shows loading state while waiting for response', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => new Promise(() => {}));

    renderWithTheme(<ChatInterface />);
    const input = screen.getByPlaceholderText(/Tell me something you believe strongly/i);
    const button = screen.getByRole('button', { name: /Challenge Me/i });

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(button);

    // Multi-phase loading starts with "Understanding your belief..."
    expect(screen.getByText(/Understanding your belief/i)).toBeInTheDocument();
  });

  it('displays error message on API failure', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    renderWithTheme(<ChatInterface />);
    const input = screen.getByPlaceholderText(/Tell me something you believe strongly/i);
    const button = screen.getByRole('button', { name: /Challenge Me/i });

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Connection Error/i)).toBeInTheDocument();
    });
  });

  it('saves conversation to localStorage', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Test response', arguments: [] }),
    });

    renderWithTheme(<ChatInterface />);
    const input = screen.getByPlaceholderText(/Tell me something you believe strongly/i);
    const button = screen.getByRole('button', { name: /Challenge Me/i });

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(button);

    await waitFor(() => {
      const saved = localStorage.getItem('contradictme_conversation');
      expect(saved).toBeTruthy();
    });
  });
});
