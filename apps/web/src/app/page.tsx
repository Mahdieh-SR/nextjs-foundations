import { fetchCategories, fetchPosts, fetchPostsByCategory } from '@repo/api/blog';
import Link from 'next/link';
import { Suspense } from 'react';
import { FilterControls } from './filter-controls';

const PAGE_SIZE = 5;

type Props = {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    page?: string;
  }>;
};

export default async function BlogHomePage({ searchParams }: Props) {
  const { category, sort, page } = await searchParams;

  const categories = await fetchCategories();

  // Fetch a large-enough batch, then filter/sort/paginate locally
  // (fetchPostsByCategory doesn't support offset, so we control pagination here)
  const allMatching = category
    ? await fetchPostsByCategory(category, 50)
    : await fetchPosts(50);

  const sorted =
    sort === 'title'
      ? [...allMatching].sort((a, b) => a.title.localeCompare(b.title))
      : allMatching;

  const currentPage = Math.max(1, Number.parseInt(page || '1', 10) || 1);
  const start = (currentPage - 1) * PAGE_SIZE;
  const posts = sorted.slice(start, start + PAGE_SIZE);
  const hasNextPage = start + PAGE_SIZE < sorted.length;
  const hasPrevPage = currentPage > 1;

  return (
    <main className="flex flex-col gap-8">
      <h1 className="font-bold text-4xl">
        Blog {category && <span className="text-gray-500">in {category}</span>}
      </h1>

      <Suspense fallback={<div className="h-10 animate-pulse bg-gray-100" />}>
        <FilterControls categories={categories} currentCategory={category} currentSort={sort} />
      </Suspense>

      <div className="flex flex-col gap-6">
        {posts.map((post) => (
          <article key={post.id} className="flex flex-col gap-2 border-b pb-6">
            <Link href={`/${post.slug}`} className="hover:underline">
              <h2 className="font-semibold text-2xl">{post.title}</h2>
            </Link>
            <p className="text-sm text-gray-500">
              {post.category} · {post.readingTime} min read ·{' '}
              {post.publishedAt.toLocaleDateString()}
            </p>
          </article>
        ))}

        {posts.length === 0 && (
          <p className="text-gray-500">No posts found.</p>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">Page {currentPage}</span>
        <div className="flex gap-4">
          {hasPrevPage && (
            <Link
              href={buildPageHref({ category, sort, page: currentPage - 1 })}
              className="text-blue-600 hover:underline"
            >
              ← Previous
            </Link>
          )}
          {hasNextPage && (
            <Link
              href={buildPageHref({ category, sort, page: currentPage + 1 })}
              className="text-blue-600 hover:underline"
            >
              Next →
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}

function buildPageHref({
  category,
  sort,
  page,
}: {
  category?: string;
  sort?: string;
  page: number;
}) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (sort) params.set('sort', sort);
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  return qs ? `/?${qs}` : '/';
}
