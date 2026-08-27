import type { Metadata } from 'next';
import { OG_SITE_DEFAULTS, SITE_NAME, SITE_ORIGIN } from '@/lib/site';

import './globals.css';

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
    <html lang="en">
      <body className="container mx-auto px-4 py-8">
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
