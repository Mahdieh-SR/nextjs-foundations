import Link from 'next/link';

export default function PageB() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-4 font-bold text-2xl">Page B</h1>
      <p className="mb-6 text-gray-600">
        You navigated here via soft navigation. The layout was preserved.
      </p>
      <nav className="flex gap-4">
        <Link
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          href="/nav-demo"
        >
          Back to Demo
        </Link>
        <Link
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          href="/nav-demo/page-a"
        >
          Go to Page A
        </Link>
      </nav>
    </main>
  );
}
