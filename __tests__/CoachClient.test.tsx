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

  it('keeps the answer when the request fails', async () => {
    fetchMock.mockResolvedValueOnce(reply('What is this about?', 1));
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ error: 'Busy.' }), { status: 503 }));
    const user = userEvent.setup();
    render(<CoachClient />);
    await user.type(screen.getByLabelText(/material/i), 'Some text.');
    await user.click(screen.getByRole('button', { name: /start/i }));
    await screen.findByText('What is this about?');
    await user.type(screen.getByLabelText(/your answer/i), 'my long answer');
    await user.click(screen.getByRole('button', { name: /send answer/i }));
    await screen.findByRole('alert');
    expect(screen.getByLabelText(/your answer/i)).toHaveValue('my long answer');
  });

  it('uses the newly picked level when retrying a failed start', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ error: 'Busy.' }), { status: 503 }));
    fetchMock.mockResolvedValueOnce(reply('Q?', 1));
    const user = userEvent.setup();
    render(<CoachClient />);
    await user.type(screen.getByLabelText(/material/i), 'Some text.');
    await user.click(screen.getByRole('button', { name: /start/i }));
    await screen.findByRole('alert');
    await user.click(screen.getByRole('radio', { name: 'advanced' }));
    await user.click(screen.getByRole('button', { name: /start/i }));
    await screen.findByText('Q?');
    expect(JSON.parse(fetchMock.mock.calls[1][1].body as string).state.level).toBe('advanced');
  });

  it('ignores a response that arrives after the session was ended', async () => {
    let resolveSecond: (r: Response) => void = () => {};
    fetchMock.mockResolvedValueOnce(reply('What is this about?', 1));
    fetchMock.mockReturnValueOnce(new Promise<Response>((r) => (resolveSecond = r)));
    const user = userEvent.setup();
    render(<CoachClient />);
    await user.type(screen.getByLabelText(/material/i), 'Some text.');
    await user.click(screen.getByRole('button', { name: /start/i }));
    await screen.findByText('What is this about?');
    await user.type(screen.getByLabelText(/your answer/i), 'ans');
    await user.click(screen.getByRole('button', { name: /send answer/i }));
    await user.click(screen.getByRole('button', { name: /end session/i }));
    resolveSecond(reply('Late reply.', 2));
    await waitFor(() => expect(screen.getByRole('button', { name: /start/i })).toBeInTheDocument());
    expect(screen.queryByText('Late reply.')).not.toBeInTheDocument();
    await new Promise((r) => setTimeout(r, 0));
    fetchMock.mockResolvedValueOnce(reply('Fresh.', 1));
    await user.click(screen.getByRole('button', { name: /start/i }));
    await screen.findByText('Fresh.');
    const sent = JSON.parse(fetchMock.mock.calls[2][1].body as string);
    expect(sent.state.turn).toBe(0);
    expect(sent.history).toEqual([]);
  });

  it('sends at most the shared history limit on long sessions', async () => {
    fetchMock.mockResolvedValueOnce(reply('Q0', 1));
    for (let i = 1; i <= 8; i++) fetchMock.mockResolvedValueOnce(reply('Q' + i, i + 1));
    const user = userEvent.setup();
    render(<CoachClient />);
    await user.type(screen.getByLabelText(/material/i), 'Some text.');
    await user.click(screen.getByRole('button', { name: /start/i }));
    await screen.findByText('Q0');
    for (let i = 1; i <= 8; i++) {
      await user.type(screen.getByLabelText(/your answer/i), 'a' + i);
      await user.click(screen.getByRole('button', { name: /send answer/i }));
      await screen.findByText('Q' + i);
    }
    const last = JSON.parse(fetchMock.mock.calls[8][1].body as string);
    expect(last.history.length).toBeLessThanOrEqual(12);
    expect(last.history[0].role).toBe('user');
  });
});
