import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/site';
import CoachClient from './CoachClient';

export const metadata: Metadata = {
  title: `Socratic Coach | ${SITE_NAME}`,
  description:
    'Paste something you want to understand. The coach asks one question at a time until you can explain it yourself.',
  alternates: { canonical: '/coach' },
};

export default function CoachPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="max-w-3xl mx-auto px-6 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Socratic Coach</h1>
        <p className="text-slate-600 dark:text-slate-300 mb-8">
          Paste the material you want to learn. The coach asks one question at a time and
          follows up on vague answers. You can ask for a direct explanation at any point.
        </p>
        <CoachClient />
      </div>
    </main>
  );
}
