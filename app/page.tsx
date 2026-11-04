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

  const topicChip =
    'min-h-11 px-4 py-2 text-sm font-medium border border-white/40 text-white hover:bg-white hover:text-[#0b0b0c] transition-colors duration-150';

  return (
    <main id="main-content" className="min-h-screen bg-white text-[#0b0b0c] relative" role="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homePageSchema).replaceAll('<', String.raw`\u003c`),
        }}
      />

      {/* Theme Toggle - fixed position */}
      <div className="fixed top-24 sm:top-12 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Stats Banner */}
      <div className="bg-[#0b0b0c] text-white border-b border-white/20 py-2.5 px-4 text-center relative z-10">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm font-mono">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="motion-safe:animate-ping absolute inline-flex h-2 w-2 rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span className="font-semibold">26 Arguments Indexed</span>
          </div>
          <span className="hidden sm:inline text-white/60" aria-hidden="true">
            /
          </span>
          <div>
            <span className="font-semibold">88.1</span> Avg Quality Score
          </div>
          <span className="hidden sm:inline text-white/60" aria-hidden="true">
            /
          </span>
          <div>
            <span className="font-semibold">73/73</span> Tests Passing
          </div>
        </div>
      </div>

      {/* Hero: white half (the claim) over near-black half (the counter) */}
      <div className="bg-white text-[#0b0b0c]">
        <div className="max-w-6xl mx-auto px-5 sm:px-10 pt-10 sm:pt-12 pb-0">
          <header className="mb-8 sm:mb-10">
            <h1 className="font-display text-[clamp(2.4rem,6.6vw,5.75rem)] font-extrabold leading-[0.95] tracking-[-0.045em] text-balance max-w-5xl">
              An AI that disagrees with you
            </h1>
            <p className="mt-5 sm:mt-6 text-lg sm:text-xl text-[#333333] leading-relaxed max-w-2xl">
              Challenge your beliefs with the strongest counterarguments, backed by research. Fight
              echo chambers. Think critically.
            </p>
            <p className="mt-3 text-sm text-[#4a4a4a]">
              By{' '}
              <a
                href="/about"
                rel="author"
                itemProp="author"
                itemScope
                itemType="https://schema.org/Person"
                className="underline underline-offset-2"
              >
                <span itemProp="name">{DEFAULT_AUTHOR}</span>
              </a>{' '}
              • Last updated{' '}
              <time dateTime={HOME_UPDATED_ISO_DATE} itemProp="dateModified">
                {HOME_UPDATED_DATE}
              </time>
            </p>
          </header>

          {/* Challenge input */}
          <div className="relative mb-10 sm:mb-14 max-w-3xl">
            <label htmlFor="challenge-input" className="sr-only">
              Enter a belief to challenge
            </label>
            <input
              id="challenge-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleChallenge()}
              className="w-full px-4 sm:px-6 py-4 sm:py-5 pr-36 sm:pr-48 border-2 border-[#0b0b0c] focus:ring-4 focus:ring-[#0b0b0c]/25 outline-none placeholder:text-[#4a4a4a] bg-white text-[#0b0b0c] text-base sm:text-lg rounded-none"
              placeholder="Tell me something you believe strongly..."
              aria-label="Tell me something you believe strongly"
            />
            <button
              type="button"
              onClick={() => handleChallenge()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 sm:px-7 py-2.5 sm:py-3 bg-[#0b0b0c] text-white font-semibold text-sm sm:text-base whitespace-nowrap hover:bg-[#333333] transition-colors rounded-none"
              aria-label="Challenge Me"
            >
              Challenge Me
            </button>
          </div>

          {/* The claim: sample, shown in the chat's own message format */}
          <section aria-labelledby="example-heading">
            <h2
              id="example-heading"
              className="font-mono text-xs sm:text-sm uppercase tracking-[0.14em] text-[#4a4a4a] mb-4"
            >
              Here&apos;s what you&apos;ll get:
            </h2>
            <div className="flex items-baseline gap-3 sm:gap-5">
              <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#4a4a4a] shrink-0 w-16 sm:w-24">
                You say
              </span>
              <p className="font-display text-2xl sm:text-4xl font-bold tracking-[-0.03em] leading-tight pb-6 sm:pb-8 text-balance">
                Remote work is{' '}
                <mark className="bg-transparent text-[#0b0b0c] underline decoration-[#c93509] decoration-[5px] underline-offset-[6px]">
                  always
                </mark>{' '}
                better for productivity.
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* Seam: the point of disagreement */}
      <div className="relative h-[6px] bg-[#ff4a1c]" role="separator" aria-hidden="true" />

      {/* The counter */}
      <div className="bg-[#0b0b0c] text-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-10 pt-8 sm:pt-12 pb-14 sm:pb-20">
          <article
            aria-label="Sample counterargument"
            className="flex flex-col sm:flex-row gap-3 sm:gap-5"
          >
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-[#ff4a1c] shrink-0 sm:w-24 pt-1">
              Counter
            </span>
            <div className="max-w-3xl">
              <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-[-0.03em] leading-tight mb-4">
                Productivity depends on the work, not the location
              </h3>
              <p className="text-base sm:text-lg leading-relaxed text-white/90 mb-6">
                Work that needs unplanned conversation, such as early product design, often moves
                faster when people share a room for part of the week.{' '}
                <mark className="bg-[#ff4a1c] text-[#0b0b0c] px-1 font-semibold">
                  &ldquo;Always&rdquo; is the weak point:
                </mark>{' '}
                one well-documented exception is enough to break the claim.
              </p>

              <div className="border border-white/30 p-4 mb-4 font-mono">
                <div className="font-medium text-white mb-1 text-sm sm:text-base">
                  [Author name]
                </div>
                <div className="text-xs sm:text-sm text-white/80">[Institution], [Year]</div>
                <p className="mt-2 text-xs text-white/80">Source not verified</p>
              </div>

              <div className="border-l-4 border-white pl-4 mb-6">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold mb-2">
                  <svg
                    className="w-4 h-4 text-white"
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
                <ul className="list-none p-0 m-0 space-y-1 text-xs sm:text-sm text-white/90">
                  <li>Applies to knowledge work, not every kind of job</li>
                  <li>Hybrid schedules vary widely between teams</li>
                </ul>
              </div>

              <div className="inline-flex flex-wrap items-center gap-2 text-sm">
                <span className="px-2 py-1 bg-white text-[#0b0b0c] text-xs font-semibold uppercase tracking-wide">
                  Example Card
                </span>
                <span className="text-white/90">
                  Illustrative only: not a real study. Real arguments include source links
                </span>
              </div>
            </div>
          </article>

          {/* Demo + example topics */}
          <div className="mt-14 sm:mt-20 pt-8 border-t border-white/25">
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-[-0.02em] mb-2">
              Try a Demo
            </h2>
            <p className="text-sm sm:text-base text-white/80 mb-5 max-w-2xl">
              Click any example to see how ContradictMe challenges beliefs with research-backed
              counterarguments
            </p>
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                type="button"
                onClick={() => handleChallenge('Remote work is always better for productivity')}
                className={topicChip}
              >
                Remote work productivity
              </button>
              <button
                type="button"
                onClick={() => handleChallenge('AI is going to take my job')}
                className={topicChip}
              >
                AI job displacement
              </button>
              <button
                type="button"
                onClick={() => handleChallenge('Nuclear energy is too dangerous')}
                className={topicChip}
              >
                Nuclear safety
              </button>
            </div>
            <div className="flex flex-wrap gap-2" aria-label="Example topics to challenge">
              <button
                type="button"
                onClick={() => handleChallenge('Nuclear energy is too dangerous')}
                className={topicChip}
              >
                Nuclear energy
              </button>
              <button
                type="button"
                onClick={() => handleChallenge('College is always worth it')}
                className={topicChip}
              >
                College ROI
              </button>
              <button
                type="button"
                onClick={() => handleChallenge('AI will cause mass unemployment')}
                className={topicChip}
              >
                AI & Jobs
              </button>
              <button
                type="button"
                onClick={() => handleChallenge('UBI makes people lazy')}
                className={topicChip}
              >
                Universal basic income
              </button>
              <button
                type="button"
                onClick={() => handleChallenge('EVs are always better for the environment')}
                className={topicChip}
              >
                Electric vehicles
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white text-[#0b0b0c]">
        <section
          className="max-w-6xl mx-auto px-5 sm:px-10 py-14 sm:py-20 grid md:grid-cols-3 gap-0 md:gap-0"
          aria-labelledby="features-heading"
        >
          <h2 id="features-heading" className="sr-only">
            Key Features
          </h2>
          <div className="py-6 md:py-0 md:pr-8 border-t-4 border-[#0b0b0c] md:mr-6">
            <h3 className="font-display font-bold text-2xl tracking-[-0.03em] mt-4 mb-3">
              Evidence-Based
            </h3>
            <p className="text-base text-[#333333] leading-relaxed">
              Each argument names a checked source or is marked &ldquo;Source not verified&rdquo;.
            </p>
          </div>
          <div className="py-6 md:py-0 md:pr-8 border-t-4 border-[#0b0b0c] md:mr-6">
            <h3 className="font-display font-bold text-2xl tracking-[-0.03em] mt-4 mb-3">
              Steel-Manned
            </h3>
            <p className="text-base text-[#333333] leading-relaxed">
              The strongest form of opposing arguments, not weak straw-man versions.
            </p>
          </div>
          <div className="py-6 md:py-0 md:pr-8 border-t-4 border-[#0b0b0c]">
            <h3 className="font-display font-bold text-2xl tracking-[-0.03em] mt-4 mb-3">
              Respectful
            </h3>
            <p className="text-base text-[#333333] leading-relaxed">
              Never condescending. Honest about limitations. Promotes thinking, not
              &ldquo;winning.&rdquo;
            </p>
          </div>
        </section>
      </div>

      {/* Why this exists */}
      <section className="bg-[#0b0b0c] text-white" aria-labelledby="why-heading">
        <div className="max-w-3xl mx-auto px-5 sm:px-10 py-14 sm:py-20">
          <h2
            id="why-heading"
            className="font-display text-3xl sm:text-4xl font-extrabold tracking-[-0.04em] mb-8 leading-tight"
          >
            Why ContradictMe matters
          </h2>
          <p className="text-base sm:text-lg text-white/90 leading-relaxed mb-4">
            Most feeds reward agreement and outrage. That pushes people toward familiar takes, not
            stronger reasoning. ContradictMe is built to reverse that pattern by presenting the
            strongest case against your position, including evidence quality, sample size, and
            limits of each source. The goal is not to force a conclusion. The goal is to help you
            make better decisions after seeing what your current view may be missing.
          </p>
          <p className="text-base sm:text-lg text-white/90 leading-relaxed">
            Use it to pressure-test an argument before a debate, evaluate policy tradeoffs, or
            prepare for high-stakes conversations at work and school. If you want details on the
            project mission, trust standards, or how to get in touch, visit our{' '}
            <Link href="/about" className="underline underline-offset-2 font-medium">
              About page
            </Link>
            ,{' '}
            <Link href="/contact" className="underline underline-offset-2 font-medium">
              Contact page
            </Link>
            , and{' '}
            <Link href="/privacy-policy" className="underline underline-offset-2 font-medium">
              Privacy Policy
            </Link>
            .
          </p>
          <p className="text-base sm:text-lg text-white/90 leading-relaxed mt-4">
            Good reasoning is rarely about finding one perfect argument. It is about understanding
            the strongest objections, updating beliefs when warranted, and separating facts from
            narratives. ContradictMe is designed as a practical thinking tool for that process.
          </p>
        </div>
      </section>

      {/* Status */}
      <div className="bg-white text-[#0b0b0c] border-b-4 border-[#0b0b0c]">
        <div className="max-w-6xl mx-auto px-5 sm:px-10 py-10 sm:py-14">
          <div className="font-mono text-xs sm:text-sm font-semibold uppercase tracking-[0.14em] mb-2">
            Algolia Agent Studio Challenge
          </div>
          <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-[-0.03em] mb-2">
            Contest Submission
          </h3>
          <p className="text-sm sm:text-base text-[#333333] mb-3">
            Building an AI that challenges echo chambers
          </p>
          <div className="inline-flex items-center gap-2 text-sm text-[#333333] font-mono">
            <span className="flex h-2 w-2 relative" aria-hidden="true">
              <span className="relative inline-flex h-2 w-2 bg-[#0b0b0c]"></span>
            </span>
            <span>26 arguments indexed • GPT-4 powered</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0b0b0c] text-white py-8 sm:py-10">
        <div className="max-w-6xl mx-auto px-5 sm:px-10">
          <nav className="mb-4 flex flex-wrap gap-x-6 gap-y-2 text-sm" aria-label="Footer links">
            {[
              ['/about', 'About'],
              ['/chat', 'Chat'],
              ['/analytics', 'Analytics'],
              ['/debate', 'Debate Arena'],
              ['/learn', 'Learn'],
              ['/contact', 'Contact'],
              ['/privacy-policy', 'Privacy'],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="hover:underline underline-offset-2">
                {label}
              </Link>
            ))}
          </nav>
          <p className="text-sm text-white/85">
            Built with{' '}
            <a
              href="https://www.algolia.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 font-medium"
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
