import Link from 'next/link';
import { Suspense } from 'react';
import {
  POSTS_PER_PAGE,
  parseCategory,
  parsePage,
  parseSort,
  type Sort,
  selectPosts,
} from '@/lib/post-filters';
import { getPosts } from '@/lib/posts';
import { FilterControls } from './filter-controls';

type Props = {
  // View state lives in the query string, so it is a Promise like `params`.
  searchParams: Promise<{
    category?: string;
    sort?: string;
    page?: string;
  }>;
};

/**
 * Build a listing URL that preserves the filters already in the URL.
 * The client component does the same with `useSearchParams`; here on the
 * server we already hold the parsed values.
 */
function listingHref(
  current: { category?: string; sort: Sort },
  page: number
): string {
  const params = new URLSearchParams();

  if (current.category) {
    params.set('category', current.category);
  }

  if (current.sort !== 'newest') {
    params.set('sort', current.sort);
  }

  if (page > 1) {
    params.set('page', String(page));
  }

  const query = params.toString();

  return query ? `/?${query}` : '/';
}

/**
 * Everything that depends on the query string lives here, so the heading above
 * it can be prerendered as a static shell while this region streams in.
 */
async function FilteredPosts({ searchParams }: Props) {
  // `searchParams` must be awaited before any value can be read.
  const {
    category: rawCategory,
    sort: rawSort,
    page: rawPage,
  } = await searchParams;

  // Query strings are user input: parse them into known values first.
  const category = parseCategory(rawCategory);
  const sort = parseSort(rawSort);
  const requestedPage = parsePage(rawPage);

  // Cached read (shared by every visitor)...
  const allPosts = await getPosts();
  // ...then the request-dependent view state is applied outside the cache.
  const { posts, page, totalPages, totalPosts } = selectPosts(allPosts, {
    category,
    sort,
    page: requestedPage,
  });

  const firstOnPage = totalPosts === 0 ? 0 : (page - 1) * POSTS_PER_PAGE + 1;
  const lastOnPage = Math.min(page * POSTS_PER_PAGE, totalPosts);

  return (
    <>
      <FilterControls currentCategory={category} currentSort={sort} />

      <p className="mt-6 text-gray-500 text-sm">
        {totalPosts === 0
          ? 'No posts match these filters.'
          : `Showing ${firstOnPage}-${lastOnPage} of ${totalPosts} posts`}
        {category && <span> in {category}</span>}
      </p>

      {posts.length > 0 ? (
        <ul className="mt-3 space-y-4">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                className="block rounded-lg border p-4 hover:bg-gray-50"
                href={`/${post.slug}`}
              >
                <h2 className="font-semibold">{post.title}</h2>
                <p className="mt-1 text-gray-600 text-sm">{post.excerpt}</p>
                <span className="mt-2 block text-gray-500 text-sm">
                  {post.category} · {post.readingTime} min read ·{' '}
                  {post.publishedAt}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-3 rounded-lg border border-dashed p-6 text-center">
          <p className="text-gray-600">
            Nothing here with the current filters.
          </p>
          <Link className="text-blue-600 text-sm hover:underline" href="/">
            Clear filters
          </Link>
        </div>
      )}

      {totalPages > 1 && (
        <nav
          aria-label="Pagination"
          className="mt-6 flex items-center justify-between text-sm"
        >
          {page > 1 ? (
            <Link
              className="text-blue-600 hover:underline"
              href={listingHref({ category, sort }, page - 1)}
            >
              ← Previous
            </Link>
          ) : (
            <span className="text-gray-300">← Previous</span>
          )}

          <span className="text-gray-500">
            Page {page} of {totalPages}
          </span>

          {page < totalPages ? (
            <Link
              className="text-blue-600 hover:underline"
              href={listingHref({ category, sort }, page + 1)}
            >
              Next →
            </Link>
          ) : (
            <span className="text-gray-300">Next →</span>
          )}
        </nav>
      )}
    </>
  );
}

export default function BlogListingPage({ searchParams }: Props) {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-1 font-bold text-2xl">Blog Posts</h1>
      <p className="mb-4 text-gray-500 text-sm">
        Filters, sorting and pagination all live in the URL, so this view is
        shareable and bookmarkable.
      </p>

      <Suspense fallback={<div className="h-10 animate-pulse bg-gray-100" />}>
        <FilteredPosts searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
