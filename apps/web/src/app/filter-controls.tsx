'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

type Props = {
  categories: string[];
  currentCategory?: string;
  currentSort?: string;
};

export function FilterControls({ categories, currentCategory, currentSort }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Create a new URLSearchParams instance preserving existing params
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      // Reset pagination when filters change
      if (name !== 'page') {
        params.delete('page');
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleCategoryChange = (category: string) => {
    const qs = createQueryString('category', category);
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const handleSortChange = (sort: string) => {
    const qs = createQueryString('sort', sort);
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const clearFilters = () => {
    router.push(pathname);
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Category filter */}
      <select
        value={currentCategory || ''}
        onChange={(e) => handleCategoryChange(e.target.value)}
        className="rounded border px-3 py-1 text-sm"
      >
        <option value="">All categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      {/* Sort control */}
      <select
        value={currentSort || ''}
        onChange={(e) => handleSortChange(e.target.value)}
        className="rounded border px-3 py-1 text-sm"
      >
        <option value="">Default order</option>
        <option value="title">Sort by title</option>
      </select>

      {/* Clear all filters */}
      {(currentCategory || currentSort) && (
        <button
          type="button"
          onClick={clearFilters}
          className="text-sm text-red-600 hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
