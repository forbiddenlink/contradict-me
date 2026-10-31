import type { Metadata } from 'next';
import Link from 'next/link';
import { DEFAULT_AUTHOR, SITE_NAME, SITE_URL } from '@/lib/site';

const PROFILE_UPDATED = '2026-02-08';
const PROFILE_UPDATED_ISO = `${PROFILE_UPDATED}T00:00:00.000Z`;

const authorSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  dateCreated: '2026-02-07T00:00:00.000Z',
  dateModified: PROFILE_UPDATED_ISO,
  mainEntity: {
    '@type': 'Person',
    name: DEFAULT_AUTHOR,
    url: `${SITE_URL}/about/liz-stein`,
    jobTitle: 'Developer & Creator of ContradictMe',
    description:
      'Developer focused on building AI tools that promote critical thinking, intellectual honesty, and evidence-based reasoning.',
    sameAs: ['https://github.com/forbiddenlink', 'https://contradict-me.vercel.app'],
    knowsAbout: [
      'Artificial Intelligence',
      'Critical Thinking',
      'Software Development',
      'Evidence-Based Reasoning',
      'Debate & Argumentation',
      'Next.js',
      'React',
      'TypeScript',
    ],
  },
};

export const metadata: Metadata = {
  title: `${DEFAULT_AUTHOR} - Author & Creator | ${SITE_NAME}`,
  description:
    'Developer specializing in AI tools for critical thinking. Creator of ContradictMe, challenging beliefs with research-backed counterarguments.',
  alternates: {
    canonical: '/about/liz-stein',
  },
  authors: [{ name: DEFAULT_AUTHOR }],
};

export default function AuthorBioPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(authorSchema).replace(/</g, '\\u003c'),
        }}
      />

      <div className="max-w-4xl mx-auto px-6 py-12 sm:py-16">
        <nav className="text-sm text-slate-700 dark:text-slate-300 mb-8" aria-label="Breadcrumb">
          <Link href="/" className="hover:underline">
            Home
          </Link>{' '}
          /{' '}
          <Link href="/about" className="hover:underline">
            About
          </Link>{' '}
          / <span className="text-slate-900 dark:text-slate-100">{DEFAULT_AUTHOR}</span>
        </nav>

        <header className="mb-12">
          <div className="flex flex-col sm:flex-row gap-8 items-start mb-6">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-violet-500 to-teal-500 flex items-center justify-center text-white text-5xl font-bold shadow-lg">
              {DEFAULT_AUTHOR.split(' ')
                .map((n) => n[0])
                .join('')}
            </div>

            <div className="flex-1">
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-3">
                {DEFAULT_AUTHOR}
              </h1>
              <p className="text-lg sm:text-xl text-slate-700 dark:text-slate-300 mb-4">
                Developer & Creator of {SITE_NAME}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Last updated: <time dateTime={PROFILE_UPDATED_ISO}>{PROFILE_UPDATED}</time>
              </p>
            </div>
          </div>
        </header>

        <section className="mb-10">
          <h2 className="font-display text-2xl font-semibold tracking-tight mb-4">About</h2>
          <div className="space-y-4 text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
            <p>
              {DEFAULT_AUTHOR} is a developer focused on building AI systems that promote critical
              thinking and intellectual honesty. As the creator of {SITE_NAME}, they designed a
              platform that challenges users&apos; beliefs with research-backed counterarguments
              rather than confirming existing biases.
            </p>
            <p>
              The motivation behind {SITE_NAME} stems from a recognition that most AI systems
              optimize for user engagement and agreement, which can reinforce echo chambers. By
              contrast, {SITE_NAME} deliberately presents the strongest opposing evidence,
              encouraging users to test their assumptions and think more rigorously about complex
              topics.
            </p>
            <p>
              {DEFAULT_AUTHOR}&apos;s approach emphasizes transparency in AI systems—every argument
              includes quality scores, source credibility ratings, documented limitations, and
              source-checked citations. This commitment to evidence-based reasoning helps users
              distinguish between well-supported claims and speculative arguments.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-2xl font-semibold tracking-tight mb-4">
            Areas of Expertise
          </h2>
          <ul className="grid grid-cols-2 gap-3 text-base text-slate-700 dark:text-slate-300">
            <li className="flex items-center gap-2">
              <span className="text-violet-600 dark:text-violet-400">✓</span>
              <span>AI & Machine Learning Applications</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-violet-600 dark:text-violet-400">✓</span>
              <span>Full-Stack Development</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-violet-600 dark:text-violet-400">✓</span>
              <span>Critical Thinking Tools</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-violet-600 dark:text-violet-400">✓</span>
              <span>Evidence-Based Reasoning</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-violet-600 dark:text-violet-400">✓</span>
              <span>Next.js & React Development</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-violet-600 dark:text-violet-400">✓</span>
              <span>Search & Ranking Systems</span>
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-2xl font-semibold tracking-tight mb-4">
            Notable Projects
          </h2>
          <div className="space-y-4">
            <article className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
              <h3 className="font-semibold text-lg mb-2">{SITE_NAME}</h3>
              <p className="text-slate-700 dark:text-slate-300 mb-3">
                An AI system that challenges beliefs with research-backed counterarguments. Built
                with Next.js, Algolia Agent Studio, and a curated database of source-checked
                arguments. Winner of the Algolia Agent Studio Challenge (2026).
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
                  Next.js
                </span>
                <span className="text-xs px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
                  Algolia
                </span>
                <span className="text-xs px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
                  GPT-4
                </span>
                <span className="text-xs px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
                  TypeScript
                </span>
              </div>
            </article>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-2xl font-semibold tracking-tight mb-4">
            Development Philosophy
          </h2>
          <div className="rounded-2xl border border-teal-200 dark:border-teal-900 bg-teal-50/50 dark:bg-teal-950/20 p-6">
            <ul className="space-y-3 text-base text-slate-700 dark:text-slate-300">
              <li className="flex gap-3">
                <span className="text-teal-600 dark:text-teal-400 font-bold">→</span>
                <div>
                  <strong>Evidence over opinion:</strong> Prioritize checked sources and transparent
                  methodologies over anecdotal claims.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-teal-600 dark:text-teal-400 font-bold">→</span>
                <div>
                  <strong>Steel-man arguments:</strong> Present opposing views in their strongest
                  form, not weakened straw-man versions.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-teal-600 dark:text-teal-400 font-bold">→</span>
                <div>
                  <strong>Acknowledge limitations:</strong> Be honest about uncertainty, gaps in
                  evidence, and areas where consensus is lacking.
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-teal-600 dark:text-teal-400 font-bold">→</span>
                <div>
                  <strong>User transparency:</strong> Show users how quality scores are calculated
                  and why certain sources are considered credible.
                </div>
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="font-display text-2xl font-semibold tracking-tight mb-4">Connect</h2>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://github.com/forbiddenlink"
              target="_blank"
              rel="noopener noreferrer me"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  clipRule="evenodd"
                />
              </svg>
              <span>GitHub</span>
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span>Contact</span>
            </Link>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-2xl font-semibold tracking-tight mb-4">Learn More</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/about"
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
            >
              <h3 className="font-semibold mb-1">About {SITE_NAME}</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Learn about the mission, evidence standards, and editorial process behind{' '}
                {SITE_NAME}.
              </p>
            </Link>
            <Link
              href="/learn"
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
            >
              <h3 className="font-semibold mb-1">Topic Guides</h3>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Explore in-depth guides on critical thinking, counterarguments, and evidence
                evaluation.
              </p>
            </Link>
          </div>
        </section>

        <footer className="pt-8 border-t border-slate-200 dark:border-slate-800">
          <nav className="flex flex-wrap gap-4 text-sm">
            <Link href="/" className="text-violet-600 dark:text-violet-400 hover:underline">
              Home
            </Link>
            <Link href="/chat" className="text-violet-600 dark:text-violet-400 hover:underline">
              Start Chat
            </Link>
            <Link href="/about" className="text-violet-600 dark:text-violet-400 hover:underline">
              About
            </Link>
            <Link href="/contact" className="text-violet-600 dark:text-violet-400 hover:underline">
              Contact
            </Link>
            <Link
              href="/privacy-policy"
              className="text-violet-600 dark:text-violet-400 hover:underline"
            >
              Privacy Policy
            </Link>
          </nav>
        </footer>
      </div>
    </main>
  );
}
