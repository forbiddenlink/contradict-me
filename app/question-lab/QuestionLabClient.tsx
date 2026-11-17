'use client';

import { useState } from 'react';
import {
  DIFFICULTY_LABELS,
  MAX_QUESTION_CHARS,
  MAX_QUESTION_TURNS,
  type Difficulty,
  type LabMode,
} from '@/lib/question-lab';
import { BRIEFS, type ScenarioBrief } from '@/lib/question-lab-briefs';

interface Exchange {
  question: string;
  mode: LabMode;
  reply: string;
}

interface Diagnostic {
  golden_question: string;
  rabbit_hole: string;
  grade: string;
}

const MODE_LABELS: Record<LabMode, string> = {
  REJECTED: 'Rejected',
  NO_ADVANCE: 'No advance',
  REFLECTION: 'Reflection',
  PARTIAL_ADVANCE: 'Partial advance',
  CLEAN_ADVANCE: 'Clean advance',
};

const inputClass =
  'w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm';
const primaryButton =
  'rounded-xl px-4 py-2 bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 font-medium';

export default function QuestionLabClient() {
  const [difficulty, setDifficulty] = useState<Difficulty>(1);
  const [scenario, setScenario] = useState<ScenarioBrief | null>(null);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [explored, setExplored] = useState<string[]>([]);
  const [unexplored, setUnexplored] = useState<string[]>([]);
  const [diagnostic, setDiagnostic] = useState<Diagnostic | null>(null);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function start() {
    setScenario(BRIEFS[Math.floor(Math.random() * BRIEFS.length)]);
    setExchanges([]);
    setExplored([]);
    setUnexplored([]);
    setDiagnostic(null);
    setError('');
  }

  function reset() {
    setScenario(null);
  }

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (!q || loading || !scenario) return;
    setLoading(true);
    setError('');
    try {
      const history = exchanges.flatMap((x) => [
        { role: 'user' as const, content: x.question },
        { role: 'assistant' as const, content: x.reply },
      ]);
      const res = await fetch('/api/question-lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId: scenario.id, difficulty, history, question: q }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Something went wrong. Try again.');
        return;
      }
      setExchanges([...exchanges, { question: q, mode: data.mode, reply: data.reply }]);
      setExplored(Array.isArray(data.explored) ? data.explored : []);
      setUnexplored(Array.isArray(data.unexplored) ? data.unexplored : []);
      setQuestion('');
      if (data.done) {
        setDiagnostic({
          golden_question: data.golden_question ?? '',
          rabbit_hole: data.rabbit_hole ?? '',
          grade: data.grade ?? '',
        });
      }
    } catch {
      setError('Could not reach the lab. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!scenario) {
    return (
      <section className="space-y-5">
        <fieldset>
          <legend className="font-semibold mb-2">Difficulty (locked once you start)</legend>
          <div className="flex flex-wrap gap-4">
            {([1, 2, 3, 4] as const).map((d) => (
              <label key={d} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="difficulty"
                  checked={difficulty === d}
                  onChange={() => setDifficulty(d)}
                />
                {d} {DIFFICULTY_LABELS[d]}
              </label>
            ))}
          </div>
        </fieldset>
        <button className={primaryButton} onClick={start}>
          Start investigation
        </button>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <p className="text-xs uppercase tracking-wide text-violet-600 dark:text-violet-400 font-semibold">
          {scenario.domain} | Difficulty {difficulty} {DIFFICULTY_LABELS[difficulty]}
        </p>
        <h2 className="font-semibold mt-1">{scenario.title}</h2>
        <p className="mt-2 text-sm">{scenario.brief}</p>
      </div>

      <ol className="space-y-3" aria-live="polite">
        {exchanges.map((x, i) => (
          <li key={i} className="space-y-2">
            <p className="rounded-xl bg-violet-50 dark:bg-violet-950/30 p-3 ml-8">{x.question}</p>
            <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">
                {MODE_LABELS[x.mode] ?? x.mode}
              </p>
              <p>{x.reply}</p>
            </div>
          </li>
        ))}
      </ol>

      {(explored.length > 0 || unexplored.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div>
            <h3 className="font-semibold mb-1">Explored</h3>
            <ul className="list-disc ml-5">
              {explored.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Unexplored</h3>
            <ul className="list-disc ml-5">
              {unexplored.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {diagnostic ? (
        <div className="rounded-xl border border-violet-200 dark:border-violet-800 p-4 space-y-3">
          <h3 className="font-semibold">Diagnostic</h3>
          <div>
            <p className="text-sm font-semibold">Golden Question</p>
            <p>{diagnostic.golden_question}</p>
          </div>
          <div>
            <p className="text-sm font-semibold">Rabbit Hole</p>
            <p>{diagnostic.rabbit_hole}</p>
          </div>
          <div>
            <p className="text-sm font-semibold">Grade</p>
            <p>{diagnostic.grade}</p>
          </div>
          <button className={primaryButton} onClick={reset}>
            Try another scenario
          </button>
        </div>
      ) : (
        <form onSubmit={ask} className="space-y-3">
          <label htmlFor="lab-question" className="block font-semibold">
            Your question ({exchanges.length + 1} of {MAX_QUESTION_TURNS})
          </label>
          <input
            id="lab-question"
            className={inputClass}
            maxLength={MAX_QUESTION_CHARS}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask one simple question."
          />
          <button type="submit" className={primaryButton} disabled={loading || !question.trim()}>
            {loading ? 'Thinking...' : 'Ask'}
          </button>
        </form>
      )}
    </section>
  );
}
