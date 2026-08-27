import type { Metadata } from 'next';
import Link from 'next/link';
import { getPostSummaries } from '@/lib/blog-db';

/**
 * The detail pages have always linked back to /posts, but the route did not
 * exist, so "← Back to posts" answered 404.
 *
 * One query for the whole list: the summaries carry everything the listing
 * shows, so there is no reason to read each post again per row — that is the
 * N+1 this page would otherwise have.
 */
export const metadata: Metadata = {
  title: 'Posts',
  description: 'Every post on the site.',
};

export default async function PostsPage() {
  const posts = await getPostSummaries();

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 font-bold text-3xl">Posts</h1>

      <ul className="space-y-4">
        {posts.map((post) => (
          <li key={post.id}>
            <Link
              className="block rounded-lg border p-4 hover:bg-gray-50"
              href={`/posts/${post.slug}`}
            >
              <h2 className="font-semibold">{post.title}</h2>
              <p className="mt-1 text-gray-600 text-sm">{post.content}</p>
              <span className="mt-2 block text-gray-500 text-sm">
                {post.publishedAt}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
