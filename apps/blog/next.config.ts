import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // Required for the `"use cache"` directive used in src/lib/posts.ts.
    useCache: true,
  },
};

export default nextConfig;
