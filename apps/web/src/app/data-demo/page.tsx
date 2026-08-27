// apps/web/src/app/data-demo/page.tsx
import { Suspense } from 'react';
import { fetchPosts, fetchStats, fetchUser } from './data';

async function fetchParallel() {
  const startTime = performance.now();

  const [user, posts, stats] = await Promise.all([
    fetchUser(),
    fetchPosts(),
    fetchStats(),
  ]);

  const endTime = performance.now();
  const duration = Math.round(endTime - startTime);

  return { user, posts, stats, duration };
}

// The whole point of this page is how long the fetches actually take, so the
// result cannot be cached or prerendered. Isolated here, it is the only part
// of the route that waits: the headings and the code sample below ship as a
// static shell and this region streams in.
async function ParallelResults() {
  const { user, posts, stats, duration } = await fetchParallel();

  return (
    <>
      <div className="mb-6 rounded-lg border-2 border-green-200 bg-green-50 p-4">
        <h2 className="font-semibold text-green-800">Performance Result</h2>
        <p className="text-green-700">
          Parallel fetch completed in{' '}
          <span className="font-bold font-mono">{duration}ms</span>
        </p>
        <p className="mt-2 text-green-600 text-sm">
          Sequential would take ~750ms (200 + 300 + 250ms). Parallel takes
          ~300ms (max of all three).
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border p-4">
          <h2 className="mb-2 font-semibold">User (200ms fetch)</h2>
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="mb-2 font-semibold">Posts (300ms fetch)</h2>
          <ul className="list-inside list-disc">
            {posts.map((post) => (
              <li key={post.id}>{post.title}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="mb-2 font-semibold">Stats (250ms fetch)</h2>
          <p>Views: {stats.views.toLocaleString()}</p>
          <p>Likes: {stats.likes.toLocaleString()}</p>
        </div>
      </div>
    </>
  );
}

function ResultsFallback() {
  return (
    <div className="space-y-6">
      <div className="h-24 animate-pulse rounded-lg bg-gray-100" />
      <div className="h-20 animate-pulse rounded-lg bg-gray-100" />
      <div className="h-28 animate-pulse rounded-lg bg-gray-100" />
      <div className="h-20 animate-pulse rounded-lg bg-gray-100" />
    </div>
  );
}

export default function DataDemoPage() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 font-bold text-3xl">
        Data Fetching Without Waterfalls
      </h1>

      <Suspense fallback={<ResultsFallback />}>
        <ParallelResults />
      </Suspense>

      <div className="mt-8 rounded bg-gray-100 p-4">
        <h3 className="mb-2 font-semibold">Key Takeaway</h3>
        <pre className="overflow-x-auto font-mono text-sm">
          {`// Sequential (750ms total)
const user = await fetchUser();    // 200ms
const posts = await fetchPosts();  // 300ms
const stats = await fetchStats();  // 250ms

// Parallel (300ms total)
const [user, posts, stats] = await Promise.all([
  fetchUser(),    // All run
  fetchPosts(),   // simultaneously
  fetchStats(),   // max(200,300,250) = 300ms
]);`}
        </pre>
      </div>
    </main>
  );
}
