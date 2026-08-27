import type { NextConfig } from 'next';

/**
 * Where the blog zone lives. In development both apps run locally; in
 * production this is the blog's own deployment URL, set per environment in the
 * Vercel project settings rather than passed on the CLI.
 */
const blogUrl = process.env.BLOG_URL ?? 'http://localhost:3001';

const nextConfig: NextConfig = {
  /**
   * Cache Components: prerender a static shell for every route and fill the
   * cached and request-time regions behind Suspense boundaries. This supersedes
   * `experimental.useCache` — it enables the `"use cache"` directive and adds
   * partial prerendering on top.
   *
   * (`partialPrefetching` from the lesson needs Next 16.3; this repo is on
   * 16.1.1, where the option does not exist yet.)
   */
  cacheComponents: true,

  /**
   * Named revalidation profiles, referenced by `cacheLife('products')` and
   * friends inside a cached scope.
   */
  cacheLife: {
    products: { stale: 300, revalidate: 900, expire: 3600 },
  },

  images: {
    /**
     * next/image only optimises hosts named here. `remotePatterns` rather than
     * the deprecated `domains`, because it can pin the protocol and path too,
     * so an allowed host cannot be used to proxy arbitrary URLs.
     */
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
    ],

    // Served in preference order, falling back to the original when a browser
    // supports neither.
    formats: ['image/avif', 'image/webp'],

    /**
     * Widths generated for images that span a share of the viewport, aligned
     * with Tailwind's breakpoints (sm 640, md 768, lg 1024, xl 1280, 2xl 1536)
     * plus one above them.
     *
     * The default list sits at 640/750/828/1080/1200/1920/2048/3840, which
     * generates variants between our breakpoints that no layout ever asks for.
     * Aligning them costs a little at high DPR — a 408px column at DPR 2 now
     * picks 1024 where it used to find 828 — and buys a cache that is not
     * spread across widths nothing renders at.
     */
    deviceSizes: [640, 768, 1024, 1280, 1536, 1920],

    /** Widths for images sized by their component: avatars, thumbnails, icons. */
    imageSizes: [32, 48, 64, 96, 128, 192, 256],

    // Only these quality values may be requested; anything else is rejected
    // rather than becoming a new cache entry an attacker can fill.
    qualities: [75, 85],
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
