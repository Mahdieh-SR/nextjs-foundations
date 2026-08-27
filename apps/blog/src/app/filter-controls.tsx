'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import {
  CATEGORIES,
  type Category,
  SORT_OPTIONS,
  type Sort,
} from '@/lib/post-filters';

type Props = {
  currentCategory?: Category;
  currentSort: Sort;
};

const CATEGORY_LABELS: Record<Category, string> = {
  tech: 'Tech',
  design: 'Design',
  general: 'General',
};

const SORT_LABELS: Record<Sort, string> = {
  newest: 'Newest first',
  title: 'Sort by title',
};

export function FilterControls({ currentCategory, currentSort }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Start from the params already in the URL so the other filters survive.
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }

      // Any filter change invalidates the current page number.
      if (name !== 'page') {
        params.delete('page');
      }

      return params.toString();
    },
    [searchParams]
  );

  const navigate = (name: string, value: string) => {
    const query = createQueryString(name, value);

    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const clearFilters = () => {
    router.push(pathname);
  };

  const hasFilters = Boolean(currentCategory) || currentSort !== 'newest';

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex gap-2">
        <button
          className={`rounded px-3 py-1 text-sm ${
            currentCategory ? 'bg-gray-100' : 'bg-blue-600 text-white'
          }`}
          onClick={() => navigate('category', '')}
          type="button"
        >
          All
        </button>

        {CATEGORIES.map((category) => (
          <button
            className={`rounded px-3 py-1 text-sm ${
              currentCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100'
            }`}
            key={category}
            onClick={() => navigate('category', category)}
            type="button"
          >
            {CATEGORY_LABELS[category]}
          </button>
        ))}
      </div>

      <select
        aria-label="Sort posts"
        className="rounded border px-3 py-1 text-sm"
        onChange={(event) =>
          // 'newest' is the default, so it stays out of the URL.
          navigate(
            'sort',
            event.target.value === 'newest' ? '' : event.target.value
          )
        }
        value={currentSort}
      >
        {SORT_OPTIONS.map((sort) => (
          <option key={sort} value={sort}>
            {SORT_LABELS[sort]}
          </option>
        ))}
      </select>

      {hasFilters && (
        <button
          className="text-red-600 text-sm hover:underline"
          onClick={clearFilters}
          type="button"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
