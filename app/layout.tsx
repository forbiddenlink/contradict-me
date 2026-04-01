import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ThemeProvider } from '@/components/ThemeProvider';
import { MotionProvider } from '@/components/MotionProvider';
import { ToastProvider } from '@/components/ui/ToastProvider';
import DynamicKeyboardShortcutsModal from '@/components/ui/DynamicKeyboardShortcutsModal';
import { DEFAULT_AUTHOR, SITE_NAME, SITE_URL } from '@/lib/site';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { PostHogProvider } from '@/components/PostHogProvider';

// Distinctive headline font - geometric, modern, memorable
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const shouldLoadVercelInsights = process.env.VERCEL === '1';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0D9A9B',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${SITE_NAME} - Challenge Your Beliefs with AI`,
  description: `${SITE_NAME} challenges your beliefs with research-backed counterarguments so you can escape echo chambers, test assumptions, and think more critically.`,
  alternates: {
    canonical: `${SITE_URL}/`,
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  keywords: [
    'AI',
    'critical thinking',
    'counterarguments',
    'debate',
    'intellectual honesty',
    'steel-manning',
    'echo chambers',
    'rational discourse',
  ],
  authors: [{ name: DEFAULT_AUTHOR }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    title: 'ContradictMe - An AI That Disagrees With You',
    description:
      'Challenge your beliefs with research-backed counterarguments. Think critically, escape echo chambers, and understand opposing perspectives.',
    type: 'website',
    locale: 'en_US',
    siteName: 'ContradictMe',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ContradictMe - An AI that disagrees with you',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ContradictMe - Challenge Your Beliefs',
    description:
      'An AI that disagrees with you, backed by research. Fight echo chambers, think critically.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        {/* Resource hints for performance */}
        <link rel="preconnect" href="https://ai-sdk-5.api.algolia.com" />
        <link rel="preconnect" href="https://vitals.vercel-analytics.com" />
        <link rel="dns-prefetch" href="https://vercel.live" />
      </head>
      <body className="antialiased bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
        {/* Skip link for accessibility - keyboard navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-teal-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2"
        >
          Skip to main content
        </a>
        <PostHogProvider>
          <NuqsAdapter>
            <ThemeProvider defaultTheme="system">
              <MotionProvider>
                <ErrorBoundary>
                  <DynamicKeyboardShortcutsModal />
                  {children}
                </ErrorBoundary>
                <ToastProvider />
              </MotionProvider>
            </ThemeProvider>
          </NuqsAdapter>
        </PostHogProvider>
        {shouldLoadVercelInsights && <Analytics />}
        {shouldLoadVercelInsights && <SpeedInsights />}
      </body>
    </html>
  );
}
