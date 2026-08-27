/**
 * View-state vocabulary for the blog: the values that are allowed to appear in
 * `searchParams`, plus the pure helpers that apply them.
 *
 * This module is safe to import from Client Components. The data itself (and
 * its `"use cache"` boundaries) lives in `./posts`, which is server-only.
 */

export const CATEGORIES = ['tech', 'design', 'general'] as const;
export type Category = (typeof CATEGORIES)[number];

export const SORT_OPTIONS = ['newest', 'title'] as const;
export type Sort = (typeof SORT_OPTIONS)[number];

export const COMMENT_SORT_OPTIONS = ['newest', 'top'] as const;
export type CommentSort = (typeof COMMENT_SORT_OPTIONS)[number];

export const POSTS_PER_PAGE = 3;

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: Category;
  publishedAt: string;
  readingTime: number;
};

export type Comment = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
  likes: number;
};

/* -------------------------------------------------------------------------- */
/* Query strings are user input: parse them into known values before use.      */
/* -------------------------------------------------------------------------- */

export function parseCategory(value?: string): Category | undefined {
  return CATEGORIES.find((category) => category === value);
}

export function parseSort(value?: string): Sort {
  return SORT_OPTIONS.find((sort) => sort === value) ?? 'newest';
}

export function parseCommentSort(value?: string): CommentSort {
  return COMMENT_SORT_OPTIONS.find((sort) => sort === value) ?? 'newest';
}

export function parsePage(value?: string): number {
  const page = Number.parseInt(value ?? '1', 10);

  return Number.isNaN(page) || page < 1 ? 1 : page;
}

export type PostSelection = {
  posts: Post[];
  page: number;
  totalPages: number;
  totalPosts: number;
};

/**
 * Apply the current view state (`searchParams`) to a list of posts.
 * Deliberately request-dependent, so it stays outside any cache boundary.
 */
export function selectPosts(
  allPosts: Post[],
  options: { category?: Category; sort: Sort; page: number }
): PostSelection {
  const filtered = options.category
    ? allPosts.filter((post) => post.category === options.category)
    : allPosts;

  const sorted =
    options.sort === 'title'
      ? [...filtered].sort((a, b) => a.title.localeCompare(b.title))
      : filtered;

  const totalPosts = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalPosts / POSTS_PER_PAGE));
  const page = Math.min(options.page, totalPages);
  const start = (page - 1) * POSTS_PER_PAGE;

  return {
    posts: sorted.slice(start, start + POSTS_PER_PAGE),
    page,
    totalPages,
    totalPosts,
  };
}

export function sortComments(
  comments: Comment[],
  sort: CommentSort
): Comment[] {
  return sort === 'top'
    ? [...comments].sort((a, b) => b.likes - a.likes)
    : [...comments].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
