import type { Metadata } from 'next';
import { BLOG_BASE_PATH, SITE_ORIGIN } from '@/lib/site';

import './globals.css';

export const metadata: Metadata = {
  /**
   * Every relative URL in this app's metadata is resolved against this origin.
   * Without it, `alternates.canonical` and `openGraph.images` would emit
   * relative paths, which crawlers cannot follow.
   */
  metadataBase: new URL(SITE_ORIGIN),

  title: {
    // Pages set only their own title; this appends the site name.
    template: '%s | VAF Blog',
    default: 'Vercel Academy Foundation - Blog',
  },
  description: 'Articles and tutorials from the VAF team',

  alternates: {
    canonical: BLOG_BASE_PATH,
  },

  openGraph: {
    siteName: 'VAF Blog',
    locale: 'en_US',
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
      <body className="container mx-auto px-4 py-8">{children}</body>
    </html>
  );
}
