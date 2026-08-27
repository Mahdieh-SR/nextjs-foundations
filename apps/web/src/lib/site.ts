/**
 * Public identity of this site, shared by the root layout and by every route
 * that builds its own metadata.
 */

export const SITE_NAME =
  process.env.NEXT_PUBLIC_APP_NAME || 'Vercel Academy Foundation - Web';

function resolveSiteOrigin(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return 'http://localhost:3000';
}

export const SITE_ORIGIN = resolveSiteOrigin();

/**
 * A page-level `openGraph` object replaces the layout's outright rather than
 * merging into it, so anything site-wide has to be spread back in or it
 * disappears from that page's card.
 */
export const OG_SITE_DEFAULTS = {
  siteName: SITE_NAME,
  locale: 'en_US',
} as const;
