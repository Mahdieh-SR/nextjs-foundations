// apps/web/src/app/data-demo/data.ts
export async function fetchUser(): Promise<{ name: string; email: string }> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return { name: 'John Doe', email: 'john@example.com' };
}

export async function fetchPosts(): Promise<
  Array<{ id: number; title: string }>
> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return [
    { id: 1, title: 'Getting Started with Next.js' },
    { id: 2, title: 'Server Components Deep Dive' },
    { id: 3, title: 'Caching Strategies' },
  ];
}

export async function fetchStats(): Promise<{ views: number; likes: number }> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  return { views: 1234, likes: 567 };
}
