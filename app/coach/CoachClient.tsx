'use client';

import { useState } from 'react';
import {
  LEVELS,
  MAX_ANSWER_CHARS,
  MAX_MATERIAL_CHARS,
  initialState,
  type CoachState,
  type Level,
} from '@/lib/socratic-coach';

interface Turn {
  role: 'user' | 'assistant';
  content: string;
}

const inputClass =
  'w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm';
const primaryButton =
  'rounded-xl px-4 py-2 bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 font-medium';
const secondaryButton =
  'rounded-xl px-4 py-2 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 disabled:opacity-50 font-medium';

export default function CoachClient() {
  const [material, setMaterial] = useState('');
  const [level, setLevel] = useState<Level>('some foundation');
  const [started, setStarted] = useState(false);
  const [state, setState] = useState<CoachState | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function send(message: string, history: Turn[], explain = false) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          material,
          state: state ?? initialState(level),
          history,
          message,
          explain,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Something went wrong. Try again.');
        return false;
      }
      setTurns([...history, { role: 'user', content: message }, { role: 'assistant', content: data.reply }]);
      setState(data.state);
      setProgress(typeof data.progress === 'number' ? data.progress : 0);
      setDone(data.done === true);
      return true;
    } catch {
      setError('Could not reach the coach. Check your connection and try again.');
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function start() {
    setState(initialState(level));
    setStarted(true);
    const ok = await send('Begin.', []);
    if (!ok) setStarted(false);
  }

  async function submitAnswer(e: React.FormEvent) {
    e.preventDefault();
    const text = answer.trim();
    if (!text || loading) return;
    setAnswer('');
    await send(text, turns);
  }

  function reset() {
    setStarted(false);
    setState(null);
    setTurns([]);
    setProgress(0);
    setDone(false);
    setError('');
  }

  if (!started) {
    return (
      <section className="space-y-5">
        <div>
          <label htmlFor="coach-material" className="block font-semibold mb-2">
            Material
          </label>
          <textarea
            id="coach-material"
            className={inputClass}
            rows={8}
            maxLength={MAX_MATERIAL_CHARS}
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            placeholder="Paste a passage, notes, or a definition."
          />
          <p className="text-xs text-slate-500 mt-1">
            Up to {MAX_MATERIAL_CHARS} characters. Do not paste personal data.
          </p>
        </div>
        <fieldset>
          <legend className="font-semibold mb-2">Your level</legend>
          <div className="flex flex-wrap gap-4">
            {LEVELS.map((l) => (
              <label key={l} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="level"
                  checked={level === l}
                  onChange={() => setLevel(l)}
                />
                {l}
              </label>
            ))}
          </div>
        </fieldset>
        {error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
        <button className={primaryButton} disabled={!material.trim() || loading} onClick={start}>
          Start session
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span>Progress</span>
          <span>
            Turn {state?.turn ?? 0}
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Mastery progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden"
        >
          <div className="h-full bg-violet-600" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <ol className="space-y-3" aria-live="polite">
        {turns.map((t, i) => (
          <li
            key={i}
            className={
              t.role === 'assistant'
                ? 'rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4'
                : 'rounded-xl bg-violet-50 dark:bg-violet-950/30 p-4 ml-8'
            }
          >
            {t.content}
          </li>
        ))}
      </ol>

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {done ? (
        <button className={primaryButton} onClick={reset}>
          Start a new session
        </button>
      ) : (
        <form onSubmit={submitAnswer} className="space-y-3">
          <label htmlFor="coach-answer" className="sr-only">
            Your answer
          </label>
          <textarea
            id="coach-answer"
            className={inputClass}
            rows={3}
            maxLength={MAX_ANSWER_CHARS}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Answer in your own words."
          />
          <div className="flex flex-wrap gap-3">
            <button type="submit" className={primaryButton} disabled={loading || !answer.trim()}>
              {loading ? 'Thinking...' : 'Send answer'}
            </button>
            <button
              type="button"
              className={secondaryButton}
              disabled={loading}
              onClick={() => send('Please explain this directly.', turns, true)}
            >
              Explain it directly
            </button>
            <button type="button" className={secondaryButton} onClick={reset}>
              End session
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
