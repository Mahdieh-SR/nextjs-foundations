import Link from "next/link";
import { connection } from "next/server";
import { NavigationButtons } from "./navigation-buttons";

export default async function NavDemoPage() {
  await connection();
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="mb-6 font-bold text-3xl">Navigation Demo</h1>

      <div className="space-y-6">
        <section className="rounded-lg border p-4">
          <h2 className="mb-4 font-semibold text-xl">
            Soft Navigation with Link
          </h2>
          <p className="mb-4 text-gray-600">
            These links use next/link for client-side transitions. Notice how
            the page does not fully reload.
          </p>
          <nav className="flex gap-4">
            <Link
              href="/nav-demo/page-a"
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Go to Page A
            </Link>
            <Link
              href="/nav-demo/page-b"
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Go to Page B
            </Link>
          </nav>
        </section>

        <section className="rounded-lg border p-4">
          <h2 className="mb-4 font-semibold text-xl">
            Hard Navigation (Avoid)
          </h2>
          <p className="mb-4 text-gray-600">
            Plain anchor tags cause full page reloads. Notice the browser
            refresh indicator.
          </p>
          <nav className="flex gap-4">
            <a
              href="/nav-demo/page-a"
              className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Hard nav to Page A
            </a>
          </nav>
        </section>

        <section className="rounded-lg border p-4">
          <h2 className="mb-4 font-semibold text-xl">
            Programmatic Navigation
          </h2>
          <p className="mb-4 text-gray-600">
            useRouter enables navigation from event handlers and conditional
            logic.
          </p>
          <NavigationButtons />
        </section>

        <section className="rounded-lg border p-4">
          <h2 className="mb-4 font-semibold text-xl">State Preservation</h2>
          <p className="mb-4 text-gray-600">
            Navigate to child pages and back. The layout state is preserved
            during soft navigation.
          </p>
          <div className="rounded bg-gray-100 p-4">
            <p className="text-gray-500 text-sm">
              Current timestamp: {Date.now()}
            </p>
            <p className="text-gray-500 text-sm">
              (This updates on hard navigation but not soft navigation from
              child pages back)
            </p>
          </div>
        </section>
      </div>

      <div className="mt-8 rounded bg-gray-100 p-4">
        <h3 className="mb-2 font-semibold">Key Concepts</h3>
        <ul className="list-inside list-disc space-y-1 text-gray-600 text-sm">
          <li>
            <strong>Soft navigation:</strong> Client-side transitions, preserves state
          </li>
          <li>
            <strong>Hard navigation:</strong> Full page reload, clears state
          </li>
          <li>
            <strong>Link component:</strong> Declarative soft navigation
          </li>
          <li>
            <strong>useRouter:</strong> Programmatic client-side navigation
          </li>
        </ul>
      </div>
    </main>
  );
}
