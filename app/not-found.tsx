import Link from 'next/link';

const popularTopics = [
  { title: 'Remote work productivity', href: '/learn/remote-work-productivity' },
  { title: 'Nuclear energy safety', href: '/learn/nuclear-energy-safety' },
  { title: 'AI job automation', href: '/learn/ai-jobs-automation' },
];

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="text-8xl font-bold text-slate-950 dark:text-white mb-4">404</div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-3">
          Page Not Found
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">
          This page doesn&apos;t exist, but your beliefs might need challenging anyway.
        </p>

        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-slate-950 dark:bg-slate-700 text-white rounded-xl font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Back to Home
          </Link>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold rounded-xl border-2 border-slate-300 dark:border-slate-700 hover:border-teal-400 dark:hover:border-teal-600 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            Start Chat
          </Link>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
            Or explore popular topics:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {popularTopics.map((topic) => (
              <Link
                key={topic.href}
                href={topic.href}
                className="px-4 py-2 text-sm bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/30 hover:text-teal-700 dark:hover:text-teal-400 transition-colors border border-slate-200 dark:border-slate-700"
              >
                {topic.title}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-500">
            Need help?{' '}
            <Link href="/contact" className="text-teal-600 dark:text-teal-400 hover:underline">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
