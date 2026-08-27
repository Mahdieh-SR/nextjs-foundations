import { GoogleAnalytics } from '@next/third-parties/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { OG_SITE_DEFAULTS, SITE_NAME, SITE_ORIGIN } from '@/lib/site';

import './globals.css';

/**
 * next/font downloads these at build time and serves them from
 * /_next/static/media, so the browser never talks to fonts.googleapis.com or
 * fonts.gstatic.com — one less origin to connect to, and nothing about the
 * visitor leaks to Google.
 *
 * Both are variable fonts: a single file covers the whole weight range instead
 * of one request per weight.
 */
const inter = Inter({
  // Latin only. Without this the file carries every script the family covers.
  subsets: ['latin'],
  variable: '--font-inter',
  // Render in the fallback immediately and swap when the file lands, rather
  // than holding the text invisible.
  display: 'swap',
  // Scales the fallback's metrics to match Inter, so the swap does not reflow
  // the text around it.
  adjustFontFallback: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  // Resolves every relative metadata URL in this app into an absolute one.
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    template: `%s | ${SITE_NAME}`,
    default: SITE_NAME,
  },
  description: 'VAF Web',
  openGraph: {
    ...OG_SITE_DEFAULTS,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

/**
 * Unset by default: the placeholder id the layout used to hard-code made every
 * visit request a tag that does not exist.
 */
const gaId = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The two variables are declared on <html> so every subtree can reach
    // them; `font-sans` on <body> is what actually applies Inter.
    <html className={`${inter.variable} ${jetbrainsMono.variable}`} lang="en">
      <body className="container mx-auto px-4 py-8 font-sans">
        {children}

        {/*
          Third-party scripts on every page. Each one is here because something
          needs it, loads after the page is interactive, and can be removed by
          unsetting one variable.

          Google Analytics — product analytics, page views and events.
            Owner: marketing. Strategy: afterInteractive, via
            @next/third-parties, which owns the gtag bootstrap so we do not.
            Loads only when NEXT_PUBLIC_GA_ID is set, so nothing is requested
            in development or in a fork that has not configured it.

          Vercel Analytics — page views. Owner: the team. Strategy: the
            component's own deferred load. No-op outside Vercel.

          Vercel Speed Insights — Core Web Vitals from real visits. Owner: the
            team. Strategy: the component's own deferred load. No-op outside
            Vercel; locally the same metrics go to /api/analytics/vitals
            through src/instrumentation-client.ts.

          Nothing here is a remote polyfill service, and nothing runs before
          hydration.
        */}
        {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
