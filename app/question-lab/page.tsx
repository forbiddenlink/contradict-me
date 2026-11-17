import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/site';
import QuestionLabClient from './QuestionLabClient';

export const metadata: Metadata = {
  title: `Question Quality Lab | ${SITE_NAME}`,
  description:
    'Investigate a vague scenario by asking one good question at a time. Better questions earn more information.',
  alternates: { canonical: '/question-lab' },
};

export default function QuestionLabPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="max-w-3xl mx-auto px-6 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Question Quality Lab</h1>
        <p className="text-slate-600 dark:text-slate-300 mb-8">
          You get a vague situation. Ask one simple question per turn. Precise, unbiased questions
          earn specific facts. Vague or leading ones earn little.
        </p>
        <QuestionLabClient />
      </div>
    </main>
  );
}
