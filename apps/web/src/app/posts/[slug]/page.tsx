// apps/web/src/app/posts/[slug]/page.tsx

import Link from 'next/link';
import { notFound } from 'next/navigation';

const posts: Record<string, { title: string; content: string }> = {
  'hello-world': {
    title: 'Hello World',
    content: 'This is the first post. Welcome to the blog!',
  },
  'nextjs-tips': {
    title: 'Next.js Tips',
    content: 'Here are some tips for building with Next.js...',
  },
};

// The slugs are known at build time, so each route prerenders and `params`
// never has to be resolved at request time.
export function generateStaticParams() {
  return Object.keys(posts).map((slug) => ({ slug }));
}

export default async function PostPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const post = posts[params.slug];

  if (!post) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <Link
        className="mb-4 inline-block text-blue-600 hover:underline"
        href="/posts"
      >
        ← Back to posts
      </Link>
      <h1 className="mb-4 font-bold text-3xl">{post.title}</h1>
      <p className="text-gray-600">{post.content}</p>
    </main>
  );
}
