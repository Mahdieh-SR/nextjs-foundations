import Link from 'next/link'
import { Suspense } from 'react'
import { FilterControls } from './filter-controls'

type Props = {
  searchParams: Promise<{
    category?: string
    sort?: string
    page?: string
  }>
}

// Mock data
const allPosts = [
  { id: '1', slug: 'hello-world', title: 'Hello World', category: 'general' },
  { id: '2', slug: 'nextjs-routing', title: 'Next.js Routing', category: 'tech' },
  { id: '3', slug: 'react-tips', title: 'React Tips', category: 'tech' },
]

export default async function BlogListingPage({ searchParams }: Props) {
  const { category, sort, page } = await searchParams

  let posts = category
    ? allPosts.filter((p) => p.category === category)
    : allPosts

  if (sort === 'title') {
    posts = [...posts].sort((a, b) => a.title.localeCompare(b.title))
  }

  const currentPage = parseInt(page || '1', 10)

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-2xl font-bold">
        Blog Posts {category && <span className="text-gray-500">in {category}</span>}
      </h1>

      <Suspense fallback={<div className="h-10 animate-pulse bg-gray-100" />}>
        <FilterControls currentCategory={category} currentSort={sort} />
      </Suspense>

      <ul className="mt-6 space-y-4">
        {posts.map((post) => (
          <li key={post.id}>
            <Link
              href={`/${post.slug}`}
              className="block rounded-lg border p-4 hover:bg-gray-50"
            >
              <h2 className="font-semibold">{post.title}</h2>
              <span className="text-sm text-gray-500">{post.category}</span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-sm text-gray-500">Page {currentPage}</p>
    </div>
  )
}