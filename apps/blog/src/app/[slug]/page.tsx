import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, getPostSlugs } from '@/lib/posts';
import { OG_SITE_DEFAULTS, postPath } from '@/lib/site';

type Props = {
  // Route identity: which resource is this page about?
  params: Promise<{ slug: string }>;
};

/**
 * Metadata reads the post through the same cached function the page uses — a
 * direct call, not `fetch('/api/...')`. A relative fetch has no origin to
 * resolve against on the server and fails at build time; the direct call also
 * hits the same cache entry, so the post is not loaded twice.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  // On this route the page also calls notFound(), so the 404 response wins and
  // this title is not what a visitor sees. It is still the correct answer to
  // "what is the metadata for a post that does not exist", and it is what keeps
  // the build from throwing on a slug that has been removed.
  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.',
      robots: { index: false, follow: false },
    };
  }

  const url = postPath(slug);

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    authors: [{ name: post.author.name }],
    // Resolved against `metadataBase` from the root layout.
    alternates: { canonical: url },
    openGraph: {
      ...OG_SITE_DEFAULTS,
      title: post.title,
      description: post.excerpt,
      url,
      type: 'article',
      publishedTime: new Date(post.publishedAt).toISOString(),
      authors: [post.author.name],
      tags: post.tags,
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}

/**
 * The set of slugs is known at build time, so every detail route is
 * prerendered instead of being rendered on demand.
 */
export async function generateStaticParams() {
  const slugs = await getPostSlugs();

  return slugs.map((slug) => ({ slug }));
}

export default async function BlogPostPage({ params }: Props) {
  // `params` is a Promise and must be awaited before `slug` can be read.
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-2xl p-6">
      <Link className="text-blue-600 text-sm hover:underline" href="/">
        ← Back to posts
      </Link>

      <h1 className="mt-4 mb-2 font-bold text-3xl">{post.title}</h1>
      <p className="text-gray-500 text-sm">
        {post.category} · {post.readingTime} min read · {post.publishedAt}
      </p>

      <p className="mt-6 text-gray-600">{post.content}</p>

      <p className="mt-8 border-t pt-4">
        <Link
          className="text-blue-600 text-sm hover:underline"
          href={`/${post.slug}/comments`}
        >
          Read the comments →
        </Link>
      </p>
    </article>
  );
}
