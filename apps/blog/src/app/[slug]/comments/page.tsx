import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  COMMENT_SORT_OPTIONS,
  parseCommentSort,
  sortComments,
} from '@/lib/post-filters';
import { getComments, getPostBySlug } from '@/lib/posts';

type Props = {
  // Identity (which post?) comes from the dynamic segment...
  params: Promise<{ slug: string }>;
  // ...while the view state (how to order them?) comes from the query string.
  searchParams: Promise<{ sort?: string }>;
};

const SORT_LABELS: Record<string, string> = {
  newest: 'Newest first',
  top: 'Most liked',
};

export default async function PostCommentsPage({
  params,
  searchParams,
}: Props) {
  // Both are Promises, so await them in parallel rather than one after another.
  const [{ slug }, { sort: rawSort }] = await Promise.all([
    params,
    searchParams,
  ]);

  const sort = parseCommentSort(rawSort);

  // Independent reads, also fired in parallel.
  const [post, comments] = await Promise.all([
    getPostBySlug(slug),
    getComments(slug),
  ]);

  if (!post) {
    notFound();
  }

  const visibleComments = sortComments(comments, sort);

  return (
    <section className="mx-auto max-w-2xl p-6">
      <Link
        className="text-blue-600 text-sm hover:underline"
        href={`/${post.slug}`}
      >
        ← Back to {post.title}
      </Link>

      <h1 className="mt-4 font-bold text-2xl">Comments</h1>
      <p className="mb-4 text-gray-500 text-sm">
        {comments.length} comment{comments.length === 1 ? '' : 's'} on “
        {post.title}”
      </p>

      <div className="flex gap-2">
        {COMMENT_SORT_OPTIONS.map((option) => (
          <Link
            className={`rounded px-3 py-1 text-sm ${
              sort === option ? 'bg-blue-600 text-white' : 'bg-gray-100'
            }`}
            href={
              option === 'newest'
                ? `/${post.slug}/comments`
                : `/${post.slug}/comments?sort=${option}`
            }
            key={option}
          >
            {SORT_LABELS[option]}
          </Link>
        ))}
      </div>

      {visibleComments.length > 0 ? (
        <ul className="mt-6 space-y-4">
          {visibleComments.map((comment) => (
            <li className="rounded-lg border p-4" key={comment.id}>
              <div className="flex items-baseline justify-between">
                <strong className="text-sm">{comment.author}</strong>
                <span className="text-gray-500 text-xs">
                  {comment.createdAt} · {comment.likes} likes
                </span>
              </div>
              <p className="mt-2 text-gray-600 text-sm">{comment.body}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 rounded-lg border border-dashed p-6 text-center text-gray-600">
          No comments yet.
        </p>
      )}
    </section>
  );
}
