import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';

/**
 * A stand-in for a database, with one deliberate property: every call costs a
 * round trip. That is what makes the difference between waiting for four of
 * them in a row and waiting for the slowest of three visible.
 */

const ROUND_TRIP_MS = 200;

export type Post = {
  id: string;
  slug: string;
  title: string;
  content: string;
  authorId: string;
  publishedAt: string;
};

export type Author = {
  id: string;
  name: string;
  bio: string;
};

export type Comment = {
  id: string;
  postId: string;
  author: string;
  body: string;
};

export type Engagement = {
  comments: number;
  likes: number;
};

const POSTS: Post[] = [
  {
    id: 'p1',
    slug: 'hello-world',
    title: 'Hello World',
    content: 'This is the first post. Welcome to the blog!',
    authorId: 'u1',
    publishedAt: '2026-08-01',
  },
  {
    id: 'p2',
    slug: 'nextjs-tips',
    title: 'Next.js Tips',
    content: 'Here are some tips for building with Next.js...',
    authorId: 'u2',
    publishedAt: '2026-07-20',
  },
];

const AUTHORS: Record<string, Author> = {
  u1: { id: 'u1', name: 'Ada Lovelace', bio: 'Writes about first things.' },
  u2: { id: 'u2', name: 'Grace Hopper', bio: 'Writes about the tools.' },
};

const COMMENTS: Comment[] = [
  {
    id: 'c1',
    postId: 'p1',
    author: 'Linus',
    body: 'Good to see this up and running.',
  },
  {
    id: 'c2',
    postId: 'p1',
    author: 'Barbara',
    body: 'Looking forward to the next one.',
  },
  {
    id: 'c3',
    postId: 'p2',
    author: 'Alan',
    body: 'The routing section was the useful part.',
  },
];

/** Every read goes through here, so each one costs the same round trip. */
async function roundTrip<T>(result: T): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, ROUND_TRIP_MS));

  return result;
}

export function findPostBySlug(slug: string): Promise<Post | undefined> {
  return roundTrip(POSTS.find((post) => post.slug === slug));
}

export function findAuthor(id: string): Promise<Author | undefined> {
  return roundTrip(AUTHORS[id]);
}

export function findComments(postId: string): Promise<Comment[]> {
  return roundTrip(COMMENTS.filter((comment) => comment.postId === postId));
}

export function countEngagement(postId: string): Promise<Engagement> {
  return roundTrip({
    comments: COMMENTS.filter((comment) => comment.postId === postId).length,
    likes: postId === 'p1' ? 42 : 17,
  });
}

export function listPosts(): Promise<Post[]> {
  return roundTrip(POSTS);
}

export type PostPage = {
  post: Post;
  author: Author | undefined;
  comments: Comment[];
  engagement: Engagement;
};

/**
 * The post has to be read first, because its id and authorId are what the
 * other three queries are keyed on — that dependency is real, not an
 * accident of how the code is written.
 *
 * The other three depend only on those ids, so they go out together. Four
 * round trips in a row would be four times the latency; this is two.
 *
 * A database that can join would collapse these further, into one trip with
 * the author and a page of comments included. That is the better answer when
 * the store supports it, and this mock does not — so the honest optimisation
 * here is the one that removes the waterfall rather than the round trips.
 */
export async function getPostData(slug: string): Promise<PostPage | null> {
  'use cache';
  cacheLife('hours');
  cacheTag(`post-${slug}`);

  const startedAt = performance.now();

  const post = await findPostBySlug(slug);

  if (!post) {
    return null;
  }

  const [author, comments, engagement] = await Promise.all([
    findAuthor(post.authorId),
    findComments(post.id),
    countEngagement(post.id),
  ]);

  const elapsed = Math.round(performance.now() - startedAt);
  const queryTime = ROUND_TRIP_MS * 4;

  // The two numbers together are the measurement: four queries' worth of
  // waiting, finished in the time of two.
  // biome-ignore lint/suspicious/noConsole: the lesson reads this from the server log
  console.log(
    `[posts] ${slug}: 4 queries totalling ${queryTime}ms of latency, assembled in ${elapsed}ms`
  );

  return { post, author, comments, engagement };
}

export async function getPostSlugs(): Promise<string[]> {
  'use cache';
  cacheLife('hours');

  const posts = await listPosts();

  return posts.map((post) => post.slug);
}

export async function getPostSummaries(): Promise<Post[]> {
  'use cache';
  cacheLife('hours');
  cacheTag('posts');

  return await listPosts();
}
