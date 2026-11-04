import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DEFAULT_AUTHOR, SITE_NAME, SITE_URL } from '@/lib/site';
import { TOPIC_GUIDES, getTopicGuide, getTopicGuideUrl } from '@/lib/topicGuides';

type TopicPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return TOPIC_GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getTopicGuide(slug);
  if (!guide) {
    return {
      title: `Guide Not Found | ${SITE_NAME}`,
      description: 'This topic guide could not be found.',
    };
  }

  return {
    title: `${guide.seoTitle} | ${SITE_NAME}`,
    description: guide.description,
    authors: [{ name: DEFAULT_AUTHOR }],
    alternates: {
      canonical: `/learn/${guide.slug}`,
    },
  };
}

export default async function TopicGuidePage({ params }: TopicPageProps) {
  const { slug } = await params;
  const guide = getTopicGuide(slug);
  if (!guide) notFound();

  const publishedIso = `${guide.publishDate}T00:00:00.000Z`;
  const faqSchema = guide.faq.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  }));

  const topicSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: guide.seoTitle,
        description: guide.description,
        datePublished: publishedIso,
        dateModified: publishedIso,
        author: {
          '@type': 'Person',
          name: DEFAULT_AUTHOR,
          url: `${SITE_URL}/about/liz-stein`,
        },
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          logo: {
            '@type': 'ImageObject',
            url: `${SITE_URL}/og-image.png`,
          },
        },
        image: `${SITE_URL}/og-image.png`,
        mainEntityOfPage: getTopicGuideUrl(guide.slug),
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqSchema,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${SITE_URL}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Learn',
            item: `${SITE_URL}/learn`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: guide.title,
            item: `${SITE_URL}/learn/${guide.slug}`,
          },
        ],
      },
    ],
  };

  const relatedGuides = TOPIC_GUIDES.filter((item) => item.slug !== guide.slug).slice(0, 2);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(topicSchema).replace(/</g, '\\u003c'),
        }}
      />
      <div className="max-w-4xl mx-auto px-6 py-12 sm:py-16">
        <nav className="text-sm text-slate-700 dark:text-slate-300 mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:underline">
            Home
          </Link>{' '}
          /{' '}
          <Link href="/learn" className="hover:underline">
            Learn
          </Link>{' '}
          / <span className="text-slate-800 dark:text-slate-200">{guide.title}</span>
        </nav>

        <header className="mb-10">
          <p className="text-xs uppercase tracking-wide font-semibold text-violet-600 dark:text-violet-400 mb-3">
            Counterargument Guide
          </p>
          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight mb-4">
            {guide.seoTitle}
          </h1>
          <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
            {guide.description}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
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
            • Published{' '}
            <time dateTime={publishedIso} itemProp="datePublished">
              {guide.publishDate}
            </time>
          </p>
        </header>

        <section className="rounded-2xl border border-violet-200 dark:border-violet-900 bg-violet-50/70 dark:bg-violet-950/20 p-6 mb-8">
          <h2 className="font-display text-xl font-semibold mb-2">Belief Being Tested</h2>
          <p className="text-slate-700 dark:text-slate-300">{guide.beliefToChallenge}</p>
        </section>

        <section className="mb-8" aria-labelledby="counterarguments-heading">
          <h2 id="counterarguments-heading" className="font-display text-2xl font-semibold mb-4">
            Strong Counterarguments to Consider
          </h2>
          <div className="space-y-4">
            {guide.counterarguments.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6"
              >
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-slate-700 dark:text-slate-300 mb-3">{item.summary}</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                  <strong>Evidence signal:</strong> {item.evidence}
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  <strong>Limitation:</strong> {item.limitation}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h2 className="font-display text-2xl font-semibold mb-4">
            Questions to Pressure-Test Your View
          </h2>
          <ul className="space-y-2 text-slate-700 dark:text-slate-300">
            {guide.reflectionQuestions.map((question) => (
              <li key={question}>- {question}</li>
            ))}
          </ul>
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h2 className="font-display text-2xl font-semibold mb-4">
            Primary Source Types & Further Reading
          </h2>
          <ul className="space-y-3 text-sm sm:text-base text-slate-700 dark:text-slate-300">
            {guide.primarySources.map((source) => (
              <li key={source}>• {source}</li>
            ))}
          </ul>
          <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Recommended External Resources:
            </p>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              {guide.slug === 'remote-work-productivity' && (
                <>
                  <li>
                    •{' '}
                    <a
                      href="https://www.oecd.org/future-of-work/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-600 dark:text-violet-400 hover:underline"
                    >
                      OECD Future of Work
                    </a>{' '}
                    - International labor market analysis
                  </li>
                  <li>
                    •{' '}
                    <a
                      href="https://www.nber.org/papers"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-600 dark:text-violet-400 hover:underline"
                    >
                      NBER Working Papers
                    </a>{' '}
                    - Academic research on remote work productivity
                  </li>
                  <li>
                    •{' '}
                    <a
                      href="https://web.stanford.edu/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-600 dark:text-violet-400 hover:underline"
                    >
                      Stanford HAI
                    </a>{' '}
                    - Human-centered AI research on distributed teams
                  </li>
                </>
              )}
              {guide.slug === 'nuclear-energy-safety' && (
                <>
                  <li>
                    •{' '}
                    <a
                      href="https://ourworldindata.org/energy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-600 dark:text-violet-400 hover:underline"
                    >
                      Our World in Data - Energy
                    </a>{' '}
                    - Comparative energy risk analysis
                  </li>
                  <li>
                    •{' '}
                    <a
                      href="https://www.iea.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-600 dark:text-violet-400 hover:underline"
                    >
                      International Energy Agency (IEA)
                    </a>{' '}
                    - Energy transition scenarios
                  </li>
                  <li>
                    •{' '}
                    <a
                      href="https://www.ipcc.ch/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-600 dark:text-violet-400 hover:underline"
                    >
                      IPCC Reports
                    </a>{' '}
                    - Climate change mitigation pathways
                  </li>
                </>
              )}
              {guide.slug === 'ai-jobs-automation' && (
                <>
                  <li>
                    •{' '}
                    <a
                      href="https://www.oecd.org/employment/future-of-work/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-600 dark:text-violet-400 hover:underline"
                    >
                      OECD Employment Outlook
                    </a>{' '}
                    - AI and labor market analysis
                  </li>
                  <li>
                    •{' '}
                    <a
                      href="https://www.nber.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-600 dark:text-violet-400 hover:underline"
                    >
                      NBER
                    </a>{' '}
                    - Automation and task composition research
                  </li>
                  <li>
                    •{' '}
                    <a
                      href="https://www.imf.org/en/Publications/WP"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-600 dark:text-violet-400 hover:underline"
                    >
                      IMF Working Papers
                    </a>{' '}
                    - AI impact on employment and inequality
                  </li>
                </>
              )}
            </ul>
          </div>
        </section>

        <section className="mb-10 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h2 className="font-display text-2xl font-semibold mb-4">
            Try This Prompt in {SITE_NAME}
          </h2>
          <p className="text-slate-700 dark:text-slate-300 mb-4">
            Open the live chat with this guide preloaded, then ask follow-up questions to test your
            assumptions against stronger opposing evidence.
          </p>
          <Link
            href={`/chat?message=${encodeURIComponent(guide.starterPrompt)}`}
            className="inline-flex rounded-xl px-5 py-3 bg-slate-950 dark:bg-slate-700 text-white font-semibold hover:opacity-95 transition-opacity"
          >
            Start Guided Challenge
          </Link>
        </section>

        <section className="mb-8" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="font-display text-2xl font-semibold mb-4">
            Guide FAQ
          </h2>
          <div className="space-y-4">
            {guide.faq.map((item) => (
              <article
                key={item.question}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5"
              >
                <h3 className="font-semibold mb-2">{item.question}</h3>
                <p className="text-slate-700 dark:text-slate-300">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="related-heading" className="mb-8">
          <h2 id="related-heading" className="font-display text-2xl font-semibold mb-4">
            Related Guides
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {relatedGuides.map((item) => (
              <Link
                key={item.slug}
                href={`/learn/${item.slug}`}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
              >
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-slate-700 dark:text-slate-300">{item.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <footer className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800">
          <nav
            className="flex flex-wrap gap-4 text-sm text-slate-700 dark:text-slate-300"
            aria-label="Legal and site links"
          >
            <Link
              href="/"
              className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/chat"
              className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
            >
              Start Chat
            </Link>
            <Link
              href="/about"
              className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
            >
              About
            </Link>
            <Link
              href="/privacy-policy"
              className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/contact"
              className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
            >
              Contact
            </Link>
          </nav>
        </footer>
      </div>
    </main>
  );
}
