'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import { DEFAULT_AUTHOR, SITE_NAME, SITE_URL } from '@/lib/site';

const HOME_UPDATED_DATE = '2026-02-08';
const HOME_UPDATED_ISO_DATE = `${HOME_UPDATED_DATE}T00:00:00.000Z`;

const homePageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: `${SITE_NAME} Home`,
  url: `${SITE_URL}/`,
  datePublished: HOME_UPDATED_ISO_DATE,
  dateModified: HOME_UPDATED_ISO_DATE,
  author: {
    '@type': 'Organization',
    name: DEFAULT_AUTHOR,
  },
};

export default function Home() {
  const router = useRouter();
  const [input, setInput] = useState('');

  const handleChallenge = (message?: string) => {
    const queryMessage = message || input;
    if (queryMessage.trim()) {
      router.push(`/chat?message=${encodeURIComponent(queryMessage)}`);
    } else {
      router.push('/chat');
    }
  };

  return (
    <main
      id="main-content"
      className="min-h-screen bg-slate-50 dark:bg-slate-950 relative transition-colors duration-300"
      role="main"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homePageSchema).replaceAll('<', String.raw`\u003c`),
        }}
      />
      {/* Subtle noise texture for print-like feel */}
      <div
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.05] pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Theme Toggle - fixed position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Stats Banner */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white py-2.5 px-4 text-center relative z-10">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span className="font-semibold">26 Arguments Indexed</span>
          </div>
          <span className="hidden sm:inline text-white/50">•</span>
          <div>
            <span className="font-semibold">88.1</span> Avg Quality Score
          </div>
          <span className="hidden sm:inline text-white/50">•</span>
          <div>
            <span className="font-semibold">73/73</span> Tests Passing
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-16 sm:pb-20 relative z-10">
        <header className="text-center mb-14 sm:mb-20">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mb-5 sm:mb-7 text-balance leading-[1.1] tracking-[-0.03em] bg-gradient-to-r from-slate-900 via-violet-600 to-teal-600 dark:from-white dark:via-violet-400 dark:to-teal-400 bg-clip-text text-transparent">
            An AI that disagrees with you
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto text-balance">
            Challenge your beliefs with the strongest counterarguments, backed by research. Fight
            echo chambers. Think critically.
          </p>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
            By{' '}
            <a
              href="/about"
              rel="author"
              itemProp="author"
              itemScope
              itemType="https://schema.org/Person"
            >
              <span itemProp="name">{DEFAULT_AUTHOR}</span>
            </a>{' '}
            • Last updated{' '}
            <time dateTime={HOME_UPDATED_ISO_DATE} itemProp="dateModified">
              {HOME_UPDATED_DATE}
            </time>
          </p>
        </header>

        {/* Demo Button with Popular Examples */}
        <div className="mb-10 p-4 sm:p-6 bg-gradient-to-br from-teal-50/80 to-slate-50 dark:from-teal-950/30 dark:to-slate-900/50 border border-teal-200/60 dark:border-teal-800/40 rounded-2xl">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-500/20">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Try a Demo</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Click any example to see how ContradictMe challenges beliefs with research-backed
                counterarguments
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleChallenge('Remote work is always better for productivity')}
              className="px-4 py-2 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-700 dark:hover:text-teal-400 hover:border-teal-300 dark:hover:border-teal-700 transition-colors border border-slate-200 dark:border-slate-700"
            >
              Remote work productivity
            </button>
            <button
              type="button"
              onClick={() => handleChallenge('AI is going to take my job')}
              className="px-4 py-2 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-700 dark:hover:text-teal-400 hover:border-teal-300 dark:hover:border-teal-700 transition-colors border border-slate-200 dark:border-slate-700"
            >
              AI job displacement
            </button>
            <button
              type="button"
              onClick={() => handleChallenge('Nuclear energy is too dangerous')}
              className="px-4 py-2 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-700 dark:hover:text-teal-400 hover:border-teal-300 dark:hover:border-teal-700 transition-colors border border-slate-200 dark:border-slate-700"
            >
              Nuclear safety
            </button>
          </div>
        </div>

        {/* Chat Input Preview */}
        <div className="mb-12 sm:mb-16">
          <div className="relative">
            <label htmlFor="challenge-input" className="sr-only">
              Enter a belief to challenge
            </label>
            <input
              id="challenge-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleChallenge()}
              className="w-full px-5 sm:px-6 py-4 sm:py-5 pr-32 sm:pr-44 rounded-2xl border-2 border-slate-200 dark:border-slate-700 focus:border-teal-500 dark:focus:border-teal-400 focus:ring-4 focus:ring-teal-100 dark:focus:ring-teal-900/50 outline-none transition-all duration-200 placeholder:text-slate-500 dark:placeholder:text-slate-400 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md text-slate-900 dark:text-slate-100 text-base sm:text-lg"
              placeholder="Tell me something you believe strongly..."
              aria-label="Tell me something you believe strongly"
            />
            <button
              type="button"
              onClick={() => handleChallenge()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 sm:px-7 py-3 sm:py-4 bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-500 dark:to-cyan-500 text-white rounded-xl font-semibold text-sm sm:text-base btn-magnetic shadow-lg hover:shadow-teal-500/25 whitespace-nowrap"
              aria-label="Challenge Me"
            >
              Challenge Me
            </button>
          </div>
          <div
            className="mt-5 sm:mt-6 flex flex-wrap gap-2.5 sm:gap-3"
            aria-label="Example topics to challenge"
          >
            <button
              type="button"
              onClick={() => handleChallenge('Nuclear energy is too dangerous')}
              className="px-5 sm:px-6 py-3 sm:py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300 hover:border-teal-400 dark:hover:border-teal-600 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-colors duration-200"
            >
              Nuclear energy
            </button>
            <button
              type="button"
              onClick={() => handleChallenge('College is always worth it')}
              className="px-5 sm:px-6 py-3 sm:py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300 hover:border-teal-400 dark:hover:border-teal-600 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-colors duration-200"
            >
              College ROI
            </button>
            <button
              type="button"
              onClick={() => handleChallenge('AI will cause mass unemployment')}
              className="px-5 sm:px-6 py-3 sm:py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300 hover:border-teal-400 dark:hover:border-teal-600 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-colors duration-200"
            >
              AI & Jobs
            </button>
            <button
              type="button"
              onClick={() => handleChallenge('UBI makes people lazy')}
              className="px-5 sm:px-6 py-3 sm:py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300 hover:border-teal-400 dark:hover:border-teal-600 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-colors duration-200"
            >
              Universal basic income
            </button>
            <button
              type="button"
              onClick={() => handleChallenge('EVs are always better for the environment')}
              className="px-5 sm:px-6 py-3 sm:py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300 hover:border-teal-400 dark:hover:border-teal-600 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-colors duration-200"
            >
              Electric vehicles
            </button>
          </div>
        </div>

        {/* Example Argument Card */}
        <section className="mb-16 sm:mb-20" aria-labelledby="example-heading">
          <h2
            id="example-heading"
            className="font-display text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-200 mb-5 sm:mb-6 px-2 sm:px-0 tracking-tight"
          >
            Here&apos;s what you&apos;ll get:
          </h2>
          <article className="argument-card">
            {/* Header with Quality Score */}
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-display title-argument flex-1 text-lg sm:text-xl">
                Innovation requires serendipity
              </h3>
              <div className="quality-score ml-3 sm:ml-4" aria-label="Quality score 87 out of 100">
                <span
                  className="text-score text-violet-600 dark:text-violet-400"
                  aria-hidden="true"
                >
                  87
                </span>
                <span className="text-[10px] sm:text-xs font-medium text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Quality
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="text-body mb-4 sm:mb-6 text-sm sm:text-base">
              [Placeholder claim] A study of [N] developers found [X]% more [outcome] from hybrid teams
              compared to fully remote. [One sentence summarizing why, as the AI would argue it.]
            </div>

            {/* Source Card */}
            <div className="source-card">
              <div className="text-citation font-medium text-slate-800 dark:text-slate-200 mb-1 text-sm sm:text-base">
                [Author name]
              </div>
              <div className="text-citation text-xs sm:text-sm">[Institution], [Year]</div>
              <ul
                className="flex gap-3 sm:gap-4 mt-2 sm:mt-3 text-[10px] sm:text-xs text-slate-700 dark:text-slate-300 list-none"
                aria-label="Research metrics"
              >
                <li>Evidence: 85/100</li>
                <li aria-hidden="true">•</li>
                <li>Sample: 10,000</li>
              </ul>
            </div>

            {/* Limitations */}
            <div className="limitations">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
                <svg
                  className="w-4 h-4 text-amber-600 dark:text-amber-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>Limitations</span>
              </div>
              <ul className="list-none p-0 m-0 space-y-1">
                <li className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 pl-4 relative">
                  <span
                    className="absolute left-0 text-violet-500 dark:text-violet-400"
                    aria-hidden="true"
                  >
                    •
                  </span>{' '}
                  Study focused on tech industry
                </li>
                <li className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 pl-4 relative">
                  <span
                    className="absolute left-0 text-violet-500 dark:text-violet-400"
                    aria-hidden="true"
                  >
                    •
                  </span>{' '}
                  Hybrid model (2-3 days) equally effective
                </li>
              </ul>
            </div>

            {/* CTA - Example indicator */}
            <div className="inline-flex items-center gap-2 text-sm font-medium text-violet-600 dark:text-violet-400 mt-4">
              <span className="px-2 py-1 bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 rounded text-xs">
                Example Card
              </span>
              <span className="text-slate-600 dark:text-slate-300">
                Illustrative only: not a real study. Real arguments include source links
              </span>
            </div>
          </article>
        </section>

        {/* Features */}
        <section
          className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-8 mb-16 sm:mb-20 px-2 sm:px-0"
          aria-labelledby="features-heading"
        >
          <h2 id="features-heading" className="sr-only">
            Key Features
          </h2>
          <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-teal-200 dark:hover:border-teal-800/60 transition-colors duration-300">
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 rounded-xl bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/40 dark:to-cyan-900/40 flex items-center justify-center"
              aria-hidden="true"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 dark:text-teal-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 mb-2 text-base sm:text-lg tracking-tight">
              Evidence-Based
            </h3>
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              Every argument backed by peer-reviewed research, not just plausible-sounding text.
            </p>
          </div>

          <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-teal-200 dark:hover:border-teal-800/60 transition-colors duration-300">
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 rounded-xl bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/40 dark:to-cyan-900/40 flex items-center justify-center"
              aria-hidden="true"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 dark:text-teal-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 mb-2 text-base sm:text-lg tracking-tight">
              Steel-Manned
            </h3>
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              The strongest form of opposing arguments, not weak straw-man versions.
            </p>
          </div>

          <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:col-span-2 md:col-span-1 hover:border-teal-200 dark:hover:border-teal-800/60 transition-colors duration-300">
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 mb-3 sm:mb-4 rounded-xl bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/40 dark:to-cyan-900/40 flex items-center justify-center"
              aria-hidden="true"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 dark:text-teal-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                />
              </svg>
            </div>
            <h3 className="font-display font-semibold text-slate-900 dark:text-slate-100 mb-2 text-base sm:text-lg tracking-tight">
              Respectful
            </h3>
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              Never condescending. Honest about limitations. Promotes thinking, not
              &ldquo;winning.&rdquo;
            </p>
          </div>
        </section>

        {/* Why this exists */}
        <section className="mb-16 sm:mb-20 px-2 sm:px-0" aria-labelledby="why-heading">
          <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <h2
              id="why-heading"
              className="font-display text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-4 tracking-tight"
            >
              Why ContradictMe matters
            </h2>
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Most feeds reward agreement and outrage. That pushes people toward familiar takes, not
              stronger reasoning. ContradictMe is built to reverse that pattern by presenting the
              strongest case against your position, including evidence quality, sample size, and
              limits of each source. The goal is not to force a conclusion. The goal is to help you
              make better decisions after seeing what your current view may be missing.
            </p>
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
              Use it to pressure-test an argument before a debate, evaluate policy tradeoffs, or
              prepare for high-stakes conversations at work and school. If you want details on the
              project mission, trust standards, or how to get in touch, visit our{' '}
              <Link
                href="/about"
                className="text-teal-600 dark:text-teal-400 hover:underline font-medium"
              >
                About page
              </Link>
              ,{' '}
              <Link
                href="/contact"
                className="text-teal-600 dark:text-teal-400 hover:underline font-medium"
              >
                Contact page
              </Link>
              , and{' '}
              <Link
                href="/privacy-policy"
                className="text-teal-600 dark:text-teal-400 hover:underline font-medium"
              >
                Privacy Policy
              </Link>
              .
            </p>
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed mt-4">
              Good reasoning is rarely about finding one perfect argument. It is about understanding
              the strongest objections, updating beliefs when warranted, and separating facts from
              narratives. ContradictMe is designed as a practical thinking tool for that process.
            </p>
          </div>
        </section>

        {/* Status */}
        <div className="text-center py-6 sm:py-8 px-4 sm:px-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl mx-2 sm:mx-0">
          <div className="text-xs sm:text-sm font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wide mb-1.5 sm:mb-2">
            Algolia Agent Studio Challenge
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100 mb-1.5 sm:mb-2">
            Contest Submission
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mb-3">
            Building an AI that challenges echo chambers
          </p>
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span>26 arguments indexed • GPT-4 powered</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-6 sm:py-8 mt-12 sm:mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <nav
            className="mb-3 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs sm:text-sm"
            aria-label="Footer links"
          >
            <Link href="/about" className="text-slate-700 dark:text-slate-300 hover:underline">
              About
            </Link>
            <Link href="/chat" className="text-slate-700 dark:text-slate-300 hover:underline">
              Chat
            </Link>
            <Link href="/analytics" className="text-slate-700 dark:text-slate-300 hover:underline">
              Analytics
            </Link>
            <Link href="/debate" className="text-slate-700 dark:text-slate-300 hover:underline">
              Debate Arena
            </Link>
            <Link href="/learn" className="text-slate-700 dark:text-slate-300 hover:underline">
              Learn
            </Link>
            <Link href="/contact" className="text-slate-700 dark:text-slate-300 hover:underline">
              Contact
            </Link>
            <Link
              href="/privacy-policy"
              className="text-slate-700 dark:text-slate-300 hover:underline"
            >
              Privacy
            </Link>
          </nav>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            Built with{' '}
            <a
              href="https://www.algolia.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-600 dark:text-teal-400 hover:text-cyan-600 dark:hover:text-cyan-400 font-medium transition-colors"
            >
              Algolia Agent Studio
            </a>{' '}
            • Making AI that challenges us to think better
          </p>
        </div>
      </footer>
    </main>
  );
}
