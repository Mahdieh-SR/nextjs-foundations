import type { NextConfig } from 'next';

/**
 * Where the blog zone lives. In development both apps run locally; in
 * production this is the blog's own deployment URL, set per environment in the
 * Vercel project settings rather than passed on the CLI.
 */
const blogUrl = process.env.BLOG_URL ?? 'http://localhost:3001';

const nextConfig: NextConfig = {
  experimental: {
    // Required for the `"use cache"` directive in src/lib/server/contact-store.ts.
    useCache: true,
  },

  /**
   * Multi-zone routing: /blog is served by a separate Next.js app, proxied so
   * the browser URL never leaves this domain. A redirect would move the user
   * to the blog's own URL; a rewrite keeps it here.
   *
   * The destinations carry the /blog prefix because the blog app sets
   * `basePath: '/blog'` and therefore serves everything under that path. The
   * second rule also covers the blog's own assets at /blog/_next/*.
   */
  // biome-ignore lint/suspicious/useAwait: Next.js types rewrites() as returning a Promise
  async rewrites() {
    return [
      {
        source: '/blog',
        destination: `${blogUrl}/blog`,
      },
      {
        source: '/blog/:path*',
        destination: `${blogUrl}/blog/:path*`,
      },
    ];
  },
};

export default nextConfig;
