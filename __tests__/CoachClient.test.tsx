import { vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CoachClient from '@/app/coach/CoachClient';
import { initialState } from '@/lib/socratic-coach';

describe('CoachClient', () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  function reply(text: string, turn: number, mastery: Record<string, number> = {}) {
    return new Response(
      JSON.stringify({
        reply: text,
        state: { ...initialState('some foundation'), turn, mastery },
        progress: 50,
        done: false,
      }),
      { status: 200 }
    );
  }

  it('needs material before starting', async () => {
    render(<CoachClient />);
    expect(screen.getByRole('button', { name: /start/i })).toBeDisabled();
  });

  it('starts a session, shows the question and a progress bar', async () => {
    fetchMock.mockResolvedValueOnce(reply('What is this about?', 1));
    const user = userEvent.setup();
    render(<CoachClient />);
    await user.type(screen.getByLabelText(/material/i), 'Photosynthesis makes sugar.');
    await user.click(screen.getByRole('button', { name: /start/i }));
    expect(await screen.findByText('What is this about?')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    const sent = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(sent.material).toBe('Photosynthesis makes sugar.');
  });

  it('sends the learner answer and offers a direct explanation', async () => {
    fetchMock.mockResolvedValueOnce(reply('What is this about?', 1));
    fetchMock.mockResolvedValueOnce(reply('Here is the explanation.', 2));
    const user = userEvent.setup();
    render(<CoachClient />);
    await user.type(screen.getByLabelText(/material/i), 'Some text.');
    await user.click(screen.getByRole('button', { name: /start/i }));
    await screen.findByText('What is this about?');
    await user.click(screen.getByRole('button', { name: /explain it directly/i }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(JSON.parse(fetchMock.mock.calls[1][1].body as string).explain).toBe(true);
    expect(await screen.findByText('Here is the explanation.')).toBeInTheDocument();
  });

  it('shows the server error', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Rate limit exceeded.' }), { status: 429 })
    );
    const user = userEvent.setup();
    render(<CoachClient />);
    await user.type(screen.getByLabelText(/material/i), 'Some text.');
    await user.click(screen.getByRole('button', { name: /start/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Rate limit exceeded.');
  });
});
