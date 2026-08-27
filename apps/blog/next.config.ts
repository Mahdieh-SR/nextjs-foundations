import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // Required for the `"use cache"` directive in src/lib/posts.ts.
    useCache: true,
  },

  /**
   * This app is a zone mounted at /blog on the main domain. Setting basePath
   * here means every route and every asset it emits already carries the /blog
   * prefix, so the same links work whether the app is reached directly or
   * through the web app's rewrite.
   */
  basePath: '/blog',

  /**
   * Only needed when the blog's assets are served from somewhere other than
   * the proxying domain (a CDN, or the blog's own deployment). Left undefined
   * locally, where /blog/_next/* is proxied like everything else.
   */
  assetPrefix: process.env.ASSET_PREFIX,

  /**
   * The zone is reachable cross-origin once it is deployed on its own domain,
   * so its API routes have to say who may call them.
   */
  // biome-ignore lint/suspicious/useAwait: Next.js types headers() as returning a Promise
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
        ],
      },
    ];
  },
};

export default nextConfig;
