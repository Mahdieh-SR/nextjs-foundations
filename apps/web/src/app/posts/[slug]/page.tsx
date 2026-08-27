// apps/web/src/app/posts/[slug]/page.tsx

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPostData, getPostSlugs } from '@/lib/blog-db';

type Props = {
  params: Promise<{ slug: string }>;
};

// The slugs are known at build time, so each route prerenders and `params`
// never has to be resolved at request time.
export async function generateStaticParams() {
  const slugs = await getPostSlugs();

  return slugs.map((slug) => ({ slug }));
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const data = await getPostData(slug);

  if (!data) {
    notFound();
  }

  const { post, author, comments, engagement } = data;

  return (
    <main className="mx-auto max-w-2xl p-8">
      <Link
        className="mb-4 inline-block text-blue-600 hover:underline"
        href="/posts"
      >
        ← Back to posts
      </Link>

      <h1 className="mb-2 font-bold text-3xl">{post.title}</h1>
      <p className="mb-6 text-gray-500 text-sm">
        {author ? `By ${author.name}` : 'Author unknown'} · {post.publishedAt} ·{' '}
        {engagement.likes} likes · {engagement.comments} comments
      </p>

      <p className="text-gray-600">{post.content}</p>

      {author && (
        <section className="mt-8 rounded-lg border p-4">
          <h2 className="font-semibold">About {author.name}</h2>
          <p className="mt-1 text-gray-600 text-sm">{author.bio}</p>
        </section>
      )}

      <section className="mt-8 border-t pt-6">
        <h2 className="mb-3 font-semibold text-lg">
          Comments ({comments.length})
        </h2>

        {comments.length > 0 ? (
          <ul className="space-y-3">
            {comments.map((comment) => (
              <li className="rounded-lg border p-3" key={comment.id}>
                <strong className="text-sm">{comment.author}</strong>
                <p className="mt-1 text-gray-600 text-sm">{comment.body}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">No comments yet.</p>
        )}
      </section>
    </main>
  );
}
