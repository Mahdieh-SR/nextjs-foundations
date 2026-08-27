import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import {
  COMMENT_SORT_OPTIONS,
  type Comment,
  parseCommentSort,
  sortComments,
} from '@/lib/post-filters';
import { getComments, getPostBySlug, getPostSlugs } from '@/lib/posts';

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

export async function generateStaticParams() {
  const slugs = await getPostSlugs();

  return slugs.map((slug) => ({ slug }));
}

/**
 * Only the ordering depends on the query string, so this is the one part that
 * waits for a request. Everything around it prerenders per slug.
 */
async function SortedComments({
  comments,
  searchParams,
  slug,
}: {
  comments: Comment[];
  searchParams: Props['searchParams'];
  slug: string;
}) {
  const { sort: rawSort } = await searchParams;
  const sort = parseCommentSort(rawSort);
  const visibleComments = sortComments(comments, sort);

  return (
    <>
      <div className="flex gap-2">
        {COMMENT_SORT_OPTIONS.map((option) => (
          <Link
            className={`rounded px-3 py-1 text-sm ${
              sort === option ? 'bg-blue-600 text-white' : 'bg-gray-100'
            }`}
            href={
              option === 'newest'
                ? `/${slug}/comments`
                : `/${slug}/comments?sort=${option}`
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
    </>
  );
}

export default async function PostCommentsPage({
  params,
  searchParams,
}: Props) {
  // `params` is known from generateStaticParams, and both reads below are
  // cached, so the header is part of the prerendered shell.
  const { slug } = await params;

  const [post, comments] = await Promise.all([
    getPostBySlug(slug),
    getComments(slug),
  ]);

  if (!post) {
    notFound();
  }

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

      <Suspense
        fallback={<div className="h-10 animate-pulse rounded bg-gray-100" />}
      >
        <SortedComments
          comments={comments}
          searchParams={searchParams}
          slug={post.slug}
        />
      </Suspense>
    </section>
  );
}
