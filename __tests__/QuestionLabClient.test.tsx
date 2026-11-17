import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuestionLabClient from '@/app/question-lab/QuestionLabClient';

const turn = (o: object) => new Response(JSON.stringify(o), { status: 200 });

describe('QuestionLabClient', () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());

  async function start(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole('radio', { name: /3/ }));
    await user.click(screen.getByRole('button', { name: /start/i }));
  }

  it('shows difficulty choices and a scenario after starting', async () => {
    const user = userEvent.setup();
    render(<QuestionLabClient />);
    expect(screen.getAllByRole('radio')).toHaveLength(4);
    await start(user);
    expect(screen.getByText(/You have been asked to find out/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/your question/i)).toBeInTheDocument();
  });

  it('sends the question and renders mode and the investigation map', async () => {
    fetchMock.mockResolvedValueOnce(
      turn({
        mode: 'CLEAN_ADVANCE',
        reply: 'It began at noon.',
        explored: ['timing'],
        unexplored: ['ownership'],
        turn: 1,
        done: false,
      })
    );
    const user = userEvent.setup();
    render(<QuestionLabClient />);
    await start(user);
    await user.type(screen.getByLabelText(/your question/i), 'When did it start?');
    await user.click(screen.getByRole('button', { name: /ask/i }));
    expect(await screen.findByText('It began at noon.')).toBeInTheDocument();
    expect(screen.getByText('Clean advance')).toBeInTheDocument();
    expect(screen.getByText('timing')).toBeInTheDocument();
    expect(screen.getByText('ownership')).toBeInTheDocument();
    const sent = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(sent).toMatchObject({ difficulty: 3, question: 'When did it start?' });
    expect(sent.scenarioId).toBeTruthy();
    expect(sent).not.toHaveProperty('truth');
  });

  it('shows the diagnostic when the investigation ends', async () => {
    fetchMock.mockResolvedValueOnce(
      turn({
        mode: 'CLEAN_ADVANCE',
        reply: 'Scope is bounded.',
        explored: ['timing'],
        unexplored: [],
        turn: 5,
        done: true,
        golden_question: 'Who owns the audit?',
        rabbit_hole: 'The backup supplier.',
        grade: 'B+',
      })
    );
    const user = userEvent.setup();
    render(<QuestionLabClient />);
    await start(user);
    await user.type(screen.getByLabelText(/your question/i), 'Q?');
    await user.click(screen.getByRole('button', { name: /ask/i }));
    expect(await screen.findByText('Who owns the audit?')).toBeInTheDocument();
    expect(screen.getByText('The backup supplier.')).toBeInTheDocument();
    expect(screen.getByText('B+')).toBeInTheDocument();
    expect(screen.queryByLabelText(/your question/i)).not.toBeInTheDocument();
  });

  it('shows the server error', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Rate limit exceeded.' }), { status: 429 })
    );
    const user = userEvent.setup();
    render(<QuestionLabClient />);
    await start(user);
    await user.type(screen.getByLabelText(/your question/i), 'Q?');
    await user.click(screen.getByRole('button', { name: /ask/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Rate limit exceeded.');
  });
});
