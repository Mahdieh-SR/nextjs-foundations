'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'

type Props = {
  currentCategory?: string
  currentSort?: string
}

export function FilterControls({ currentCategory, currentSort }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Create a new URLSearchParams instance preserving existing params
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      // Reset pagination when filters change
      if (name !== 'page') {
        params.delete('page')
      }
      return params.toString()
    },
    [searchParams]
  )

  const handleCategoryChange = (category: string) => {
    router.push(`${pathname}?${createQueryString('category', category)}`)
  }

  const handleSortChange = (sort: string) => {
    router.push(`${pathname}?${createQueryString('sort', sort)}`)
  }

  const clearFilters = () => {
    router.push(pathname)
  }

  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handleCategoryChange('')}
          className={`rounded px-3 py-1 text-sm ${
            !currentCategory ? 'bg-blue-600 text-white' : 'bg-gray-100'
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => handleCategoryChange('tech')}
          className={`rounded px-3 py-1 text-sm ${
            currentCategory === 'tech' ? 'bg-blue-600 text-white' : 'bg-gray-100'
          }`}
        >
          Tech
        </button>
        <button
          type="button"
          onClick={() => handleCategoryChange('general')}
          className={`rounded px-3 py-1 text-sm ${
            currentCategory === 'general' ? 'bg-blue-600 text-white' : 'bg-gray-100'
          }`}
        >
          General
        </button>
      </div>

      <select
        value={currentSort || ''}
        onChange={(e) => handleSortChange(e.target.value)}
        className="rounded border px-3 py-1 text-sm"
      >
        <option value="">Default order</option>
        <option value="title">Sort by title</option>
      </select>

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
  )
}