/**
 * Public URLs for this blog.
 *
 * The blog is a zone: visitors reach it at `${SITE_URL}/blog` through the web
 * app's rewrite, and never see this deployment's own hostname. Canonical and
 * social URLs therefore have to be built from the main site origin — pointing
 * them at the blog's own domain would tell search engines and crawlers about a
 * URL the audience does not use.
 */

const FALLBACK_ORIGIN = 'http://localhost:3000';

function resolveSiteOrigin(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // Last resort on a preview deployment: this is the blog's own host, which is
  // only correct when the blog is being visited directly.
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return FALLBACK_ORIGIN;
}

export const SITE_ORIGIN = resolveSiteOrigin();

/** Matches `basePath` in next.config.ts. */
export const BLOG_BASE_PATH = '/blog';

/**
 * Path of a post relative to the site origin. `metadataBase` resolves it into
 * an absolute URL, which is what crawlers need.
 */
export function postPath(slug: string): string {
  return `${BLOG_BASE_PATH}/${slug}`;
}

export function commentsPath(slug: string): string {
  return `${postPath(slug)}/comments`;
}

/**
 * A page-level `openGraph` object replaces the layout's outright rather than
 * merging into it, so anything site-wide has to be spread back in or it
 * disappears from that page's card.
 */
export const SITE_NAME = 'VAF Blog';

export const OG_SITE_DEFAULTS = {
  siteName: SITE_NAME,
  locale: 'en_US',
} as const;
