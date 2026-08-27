import Link from 'next/link';
import { Suspense } from 'react';

type Props = {
  searchParams: Promise<{ throw?: string }>;
};

// `searchParams` is request data. Awaiting it in the page body would make the
// whole route wait for a request before anything could render; kept in its own
// component under Suspense, the shell below still prerenders as static HTML.
//
// The trade-off is where the error surfaces. The shell has already been sent by
// the time this throws, so the server cannot replace the page with error.tsx —
// it streams the error down instead and the boundary takes over on the client.
// The route still logs the error server-side and the response carries its
// digest; only the visible takeover moves to the client.
async function ErrorTrigger({ searchParams }: Props) {
  const { throw: shouldThrow } = await searchParams;

  if (shouldThrow === 'true') {
    throw new Error('This error was triggered intentionally for testing');
  }

  return null;
}

export default function ErrorDemoPage({ searchParams }: Props) {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <Suspense fallback={null}>
        <ErrorTrigger searchParams={searchParams} />
      </Suspense>

      <h1 className="mb-4 font-bold text-3xl">Error Boundary Demo</h1>
      <p className="mb-6 text-gray-600">
        This page demonstrates how error boundaries work in Next.js.
      </p>

      <div className="space-y-4">
        <div className="rounded border p-4">
          <h2 className="mb-2 font-semibold">Trigger an Error</h2>
          <p className="mb-4 text-gray-600 text-sm">
            Click below to throw an error and see the error boundary in action.
          </p>
          <Link
            className="inline-block rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            href="/error-demo?throw=true"
          >
            Throw Error
          </Link>
        </div>

        <div className="rounded border p-4">
          <h2 className="mb-2 font-semibold">Safe Navigation</h2>
          <p className="mb-4 text-gray-600 text-sm">
            This link loads the page without triggering an error.
          </p>
          <Link
            className="inline-block rounded bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
            href="/error-demo"
          >
            Load Normally
          </Link>
        </div>
      </div>
    </main>
  );
}
