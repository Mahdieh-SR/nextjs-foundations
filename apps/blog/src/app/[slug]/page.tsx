import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostBySlug, getPostSlugs } from '@/lib/posts';

type Props = {
  // Route identity: which resource is this page about?
  params: Promise<{ slug: string }>;
};

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
