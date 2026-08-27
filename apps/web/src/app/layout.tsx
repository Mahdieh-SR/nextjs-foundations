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
        {/* TODO: Convert to next/script (Section 4 Lesson 3) */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'GA_MEASUREMENT_ID');
            `,
          }}
        />
      </body>
    </html>
  );
}
