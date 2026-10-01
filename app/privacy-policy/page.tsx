import type { Metadata } from 'next';
import Link from 'next/link';
import { DEFAULT_AUTHOR, SITE_NAME, SITE_URL } from '@/lib/site';

const EFFECTIVE_DATE = '2026-10-01';
const EFFECTIVE_ISO_DATE = `${EFFECTIVE_DATE}T00:00:00.000Z`;

const privacySchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: `${SITE_NAME} Privacy Policy`,
  url: `${SITE_URL}/privacy-policy`,
  datePublished: EFFECTIVE_ISO_DATE,
  dateModified: EFFECTIVE_ISO_DATE,
  author: {
    '@type': 'Organization',
    name: DEFAULT_AUTHOR,
  },
};

export const metadata: Metadata = {
  title: 'Privacy Policy and Data Use | ContradictMe',
  description:
    'Read the ContradictMe privacy policy, including what data we process, why we process it, retention expectations, and your available rights.',
  alternates: {
    canonical: '/privacy-policy',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(privacySchema).replace(/</g, '\\u003c'),
        }}
      />
      <div className="max-w-3xl mx-auto px-6 py-12 sm:py-16">
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-6">
          Privacy Policy
        </h1>
        <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 mb-8">
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
          • Effective date:{' '}
          <time dateTime={EFFECTIVE_ISO_DATE} itemProp="datePublished">
            {EFFECTIVE_DATE}
          </time>
        </p>

        <section className="mb-6">
          <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight mb-3">
            Information We Process
          </h2>
          <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
            ContradictMe processes the text you submit in chat prompts and related technical logs
            needed to operate the service. We use this information to generate responses, monitor
            reliability, and improve quality. Please avoid sharing sensitive personal information in
            prompts unless it is necessary for your question.
          </p>
          <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed mt-4">
            When you send a message, your browser sends it to our server together with up to the
            last 12 earlier messages of the same conversation (capped at 8,000 characters in total),
            so the AI can follow the discussion. Our server forwards that text to Algolia Agent
            Studio to generate the reply. See Third-Party Services below for every provider that
            receives data.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight mb-3">
            How We Use Data
          </h2>
          <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
            Data is used to provide the chat experience, detect abuse, troubleshoot errors, and
            evaluate product quality. We do not sell personal data. We may use service providers to
            host infrastructure and deliver AI responses under contractual safeguards.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight mb-3">
            Your Choices
          </h2>
          <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
            You can request deletion or correction of personal data associated with your support
            communications by contacting us. For privacy inquiries, use{' '}
            <a
              href="mailto:privacy@contradict-me.vercel.app"
              className="text-violet-600 dark:text-violet-400 hover:underline"
            >
              privacy@contradict-me.vercel.app
            </a>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight mb-3">
            Retention and Security
          </h2>
          <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
            We retain operational logs only as long as needed for service continuity, abuse
            prevention, and debugging. Access is restricted to authorized personnel and service
            providers with a legitimate operational need. While no system is perfectly secure, we
            use standard safeguards for transport security and service configuration.
          </p>
        </section>
        <section className="mb-8">
          <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight mb-3">
            Legal Rights and Frameworks
          </h2>
          <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            Depending on your location, you may have rights to access, correction, deletion, and
            portability of personal data. Our handling of requests follows applicable requirements
            under relevant frameworks such as GDPR and CCPA where applicable. For background on
            those frameworks, refer to{' '}
            <a
              href="https://gdpr-info.eu/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-600 dark:text-violet-400 hover:underline"
            >
              GDPR reference guidance
            </a>{' '}
            and the{' '}
            <a
              href="https://oag.ca.gov/privacy/ccpa"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-600 dark:text-violet-400 hover:underline"
            >
              California Attorney General CCPA overview
            </a>
            .
          </p>
          <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
            If you wish to exercise these rights, please contact us with sufficient detail to
            identify the request scope. We will respond within the timeframe required by applicable
            law and may request verification of your identity before processing certain requests.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight mb-3">
            Cookies and Tracking
          </h2>
          <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            ContradictMe uses analytics and error monitoring to understand usage and fix problems.
            Vercel Analytics and Speed Insights collect page views and performance metrics. PostHog
            records page views and other browser events, including the page address you visit, which
            can include the text of a shared <code>?message=</code> link. Sentry receives error
            reports and performance traces from production. Each is listed with details below. We
            do not run advertising trackers.
          </p>
          <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            We store your theme preference (light/dark mode) in local browser storage to improve
            your experience. This data never leaves your device and is not transmitted to our
            servers.
          </p>
          <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
            <strong>Conversation History:</strong> Your saved conversations and bookmarks are stored
            locally in your browser using IndexedDB. We do not keep a copy of that archive on our
            servers. Messages you send are the exception: each message, plus recent earlier
            messages from the same conversation, is sent to our server and the providers listed
            below so you get a reply. You can clear stored data at any time through your browser
            settings (Clear Browsing Data &gt; Indexed databases) or by using the in-app
            conversation management features.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight mb-3">
            Third-Party Services
          </h2>
          <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            ContradictMe uses the following third-party services to deliver functionality:
          </p>
          <ul className="list-none space-y-3 text-base sm:text-lg text-slate-700 dark:text-slate-300 ml-6">
            <li className="flex gap-3">
              <span className="text-violet-600 dark:text-violet-400">•</span>
              <div>
                <strong>Vercel</strong> - Hosts the site and runs Vercel Analytics and Speed Insights. It receives your requests (including your IP address, as any web host does), page views, and web performance metrics. Analytics and Speed Insights load only on the Vercel deployment.{' '}
                <a
                  href="https://vercel.com/legal/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-600 dark:text-violet-400 underline hover:no-underline"
                >
                  Vercel privacy policy
                </a>
                .
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-violet-600 dark:text-violet-400">•</span>
              <div>
                <strong>Algolia Agent Studio</strong> - Generates the AI replies. Our server sends it your current message and up to 12 recent earlier messages from the conversation. It does not receive your IP address from us.{' '}
                <a
                  href="https://www.algolia.com/policies/privacy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-600 dark:text-violet-400 underline hover:no-underline"
                >
                  Algolia Agent Studio privacy policy
                </a>
                .
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-violet-600 dark:text-violet-400">•</span>
              <div>
                <strong>Langfuse</strong> - Records traces of chat requests so we can debug quality and latency. Each trace holds your message text, the first 1,000 characters of the reply, debate settings if you use the debate mode, timing, and any error. Traces are tagged with a one-way hashed identifier derived from your IP address, not the address itself, and with a random per-message conversation id. Earlier history messages are not included in the trace. Active only when we have configured it.{' '}
                <a
                  href="https://langfuse.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-600 dark:text-violet-400 underline hover:no-underline"
                >
                  Langfuse privacy policy
                </a>
                .
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-violet-600 dark:text-violet-400">•</span>
              <div>
                <strong>PostHog</strong> - Product analytics in your browser. It receives page views and page-leave events with the page address, plus the browser details and automatic click events PostHog collects by default. It does not receive your chat messages unless they appear in the page address. Active only when configured, and turned off in development.{' '}
                <a
                  href="https://posthog.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-600 dark:text-violet-400 underline hover:no-underline"
                >
                  PostHog privacy policy
                </a>
                .
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-violet-600 dark:text-violet-400">•</span>
              <div>
                <strong>Sentry</strong> - Error monitoring and performance traces from production, sampled at 10% for traces. Error reports can include the page address, browser details, and stack traces. Cookie and authorization headers are stripped from browser-side reports.{' '}
                <a
                  href="https://sentry.io/privacy/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-600 dark:text-violet-400 underline hover:no-underline"
                >
                  Sentry privacy policy
                </a>
                .
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-violet-600 dark:text-violet-400">•</span>
              <div>
                <strong>Axiom</strong> - The site is wired to Axiom for logging and web vitals through the next-axiom package. It sends data only if Axiom credentials are configured, and the application code does not currently write its own log lines to it.{' '}
                <a
                  href="https://axiom.co/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-600 dark:text-violet-400 underline hover:no-underline"
                >
                  Axiom privacy policy
                </a>
                .
              </div>
            </li>
            <li className="flex gap-3">
              <span className="text-violet-600 dark:text-violet-400">•</span>
              <div>
                <strong>Upstash</strong> - Rate limiting. It receives your IP address as the key for counting requests per minute. Used only when configured; otherwise rate limiting runs in server memory.{' '}
                <a
                  href="https://upstash.com/trust/privacy.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-600 dark:text-violet-400 underline hover:no-underline"
                >
                  Upstash privacy policy
                </a>
                .
              </div>
            </li>
          </ul>
          <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed mt-4">
            Each provider handles data under its own privacy policy. We do not control how long
            they keep it, so follow the links above for their retention terms. We do not publish
            our own retention periods for data held by these providers.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="font-display text-xl sm:text-2xl font-semibold tracking-tight mb-3">
            Policy Updates
          </h2>
          <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
            We may update this policy to reflect changes in our practices, legal requirements, or
            service features. Material changes will be posted on this page with an updated effective
            date. Continued use of the service after changes constitutes acceptance of the updated
            policy. We recommend reviewing this page periodically to stay informed.
          </p>
        </section>

        <div className="flex flex-wrap gap-4 text-sm sm:text-base">
          <Link href="/" className="text-violet-600 dark:text-violet-400 hover:underline">
            Home
          </Link>
          <Link href="/chat" className="text-violet-600 dark:text-violet-400 hover:underline">
            Chat
          </Link>
          <Link href="/analytics" className="text-violet-600 dark:text-violet-400 hover:underline">
            Analytics
          </Link>
          <Link href="/debate" className="text-violet-600 dark:text-violet-400 hover:underline">
            Debate Arena
          </Link>
          <Link href="/learn" className="text-violet-600 dark:text-violet-400 hover:underline">
            Learn
          </Link>
          <Link href="/about" className="text-violet-600 dark:text-violet-400 hover:underline">
            About
          </Link>
          <Link href="/contact" className="text-violet-600 dark:text-violet-400 hover:underline">
            Contact
          </Link>
        </div>
      </div>
    </main>
  );
}
