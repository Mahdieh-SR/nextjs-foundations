/**
 * Server-only blog data plus its cache boundaries.
 *
 * The listing page and the detail page both read from here, so every post that
 * is listed is always resolvable by its slug (no dangling links).
 *
 * Reads are wrapped in `"use cache"` because they are expensive and shared
 * across requests. The request-dependent parts (which category, which sort,
 * which page) live in `./post-filters` and are applied to the cached result.
 */

import type { Comment, Post } from './post-filters';

const POSTS: Post[] = [
  {
    id: '1',
    slug: 'hello-world',
    title: 'Hello World',
    excerpt: 'The very first post on this blog.',
    content:
      'Welcome to our blog! This post exists so that /hello-world always resolves, because the listing and the detail route share the same data module.',
    category: 'general',
    publishedAt: '2026-08-01',
    readingTime: 2,
    tags: ['announcement', 'meta'],
    author: { name: 'Ada Lovelace' },
    coverImage: '/blog/og/hello-world.png',
  },
  {
    id: '2',
    slug: 'nextjs-routing',
    title: 'Next.js Routing',
    excerpt: 'How the App Router maps folders to URLs.',
    content:
      'A dynamic segment such as [slug] becomes part of `params`. It answers "which resource?" and is therefore part of the route identity.',
    category: 'tech',
    publishedAt: '2026-07-24',
    readingTime: 6,
    tags: ['nextjs', 'routing', 'app-router'],
    author: { name: 'Grace Hopper' },
    coverImage: '/blog/og/nextjs-routing.png',
  },
  {
    id: '3',
    slug: 'react-tips',
    title: 'React Tips',
    excerpt: 'Small habits that keep components readable.',
    content:
      'Keep Server Components as the default and push `use client` down to the leaves that actually need interactivity.',
    category: 'tech',
    publishedAt: '2026-07-11',
    readingTime: 4,
    tags: ['react', 'components', 'patterns'],
    author: { name: 'Margaret Hamilton' },
    coverImage: '/blog/og/react-tips.png',
  },
  {
    id: '4',
    slug: 'search-params-as-state',
    title: 'Search Params as State',
    excerpt: 'Why the URL is the best state container you already have.',
    content:
      'Filters, sorting and pagination belong in `searchParams`: the resulting URL is shareable, bookmarkable and survives a reload.',
    category: 'tech',
    publishedAt: '2026-06-30',
    readingTime: 5,
    tags: ['nextjs', 'urls', 'state'],
    author: { name: 'Grace Hopper' },
    coverImage: '/blog/og/search-params-as-state.png',
  },
  {
    id: '5',
    slug: 'designing-empty-states',
    title: 'Designing Empty States',
    excerpt: 'What a list should say when it has nothing to say.',
    content:
      'An empty state is a real state. A filtered list that matches nothing should explain itself and offer a way back.',
    category: 'design',
    publishedAt: '2026-06-18',
    readingTime: 3,
    tags: ['design', 'ux', 'content'],
    author: { name: 'Barbara Liskov' },
    coverImage: '/blog/og/designing-empty-states.png',
  },
  {
    id: '6',
    slug: 'type-safe-urls',
    title: 'Type-Safe URLs',
    excerpt: 'Validate query strings before you trust them.',
    content:
      'Query strings are user input. Parse them into a known union up front so the rest of the page never handles a surprise value.',
    category: 'tech',
    publishedAt: '2026-06-02',
    readingTime: 7,
    tags: ['typescript', 'validation', 'urls'],
    author: { name: 'Barbara Liskov' },
    coverImage: '/blog/og/type-safe-urls.png',
  },
  {
    id: '7',
    slug: 'writing-good-changelogs',
    title: 'Writing Good Changelogs',
    excerpt: 'Notes your future self will thank you for.',
    content:
      'Describe the change from the point of view of the reader: what they can now do that they could not do before.',
    category: 'general',
    publishedAt: '2026-05-21',
    readingTime: 3,
    tags: ['writing', 'process', 'release'],
    author: { name: 'Ada Lovelace' },
    coverImage: '/blog/og/writing-good-changelogs.png',
  },
];

const COMMENTS: Record<string, Comment[]> = {
  'hello-world': [
    {
      id: 'c1',
      author: 'Ada',
      body: 'Great to see this blog finally live.',
      createdAt: '2026-08-02',
      likes: 12,
    },
    {
      id: 'c2',
      author: 'Grace',
      body: 'Bookmarked, looking forward to the next one.',
      createdAt: '2026-08-05',
      likes: 3,
    },
  ],
  'nextjs-routing': [
    {
      id: 'c3',
      author: 'Linus',
      body: 'The params vs searchParams distinction finally clicked, thanks.',
      createdAt: '2026-07-25',
      likes: 41,
    },
    {
      id: 'c4',
      author: 'Barbara',
      body: 'Would love a follow-up on route groups.',
      createdAt: '2026-07-28',
      likes: 8,
    },
    {
      id: 'c5',
      author: 'Alan',
      body: 'Worth noting that both are Promises in Next 15 and later.',
      createdAt: '2026-08-03',
      likes: 27,
    },
  ],
  'react-tips': [
    {
      id: 'c6',
      author: 'Margaret',
      body: 'Pushing the client boundary to the leaves helped us a lot.',
      createdAt: '2026-07-12',
      likes: 19,
    },
  ],
};

function simulateLatency(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Every post, newest first. Cached: identical for every visitor.
 */
export async function getPosts(): Promise<Post[]> {
  'use cache';

  await simulateLatency(120);

  return [...POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

/**
 * A single post by its route identity. Cached per slug.
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  'use cache';

  await simulateLatency(80);

  return POSTS.find((post) => post.slug === slug) ?? null;
}

/**
 * Known slugs, used by `generateStaticParams` to prerender the detail routes.
 */
export async function getPostSlugs(): Promise<string[]> {
  'use cache';

  const posts = await getPosts();

  return posts.map((post) => post.slug);
}

/**
 * Comments for one post. Cached per slug; the sort order is applied after.
 */
export async function getComments(slug: string): Promise<Comment[]> {
  'use cache';

  await simulateLatency(100);

  return COMMENTS[slug] ?? [];
}
