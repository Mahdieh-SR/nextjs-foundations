import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // Required for the `"use cache"` directive in src/lib/server/contact-store.ts.
    useCache: true,
  },
};

export default nextConfig;
