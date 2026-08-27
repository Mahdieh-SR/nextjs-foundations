// apps/web/src/app/dashboard/layout.tsx
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-gray-50 p-4">
        <h2 className="mb-4 font-bold text-lg">Dashboard</h2>
        <nav className="space-y-2">
          <Link
            className="block rounded px-3 py-2 text-gray-700 hover:bg-gray-200"
            href="/dashboard"
          >
            Overview
          </Link>
          <Link
            className="block rounded px-3 py-2 text-gray-700 hover:bg-gray-200"
            href="/dashboard/analytics"
          >
            Analytics
          </Link>
          <Link
            className="block rounded px-3 py-2 text-gray-700 hover:bg-gray-200"
            href="/dashboard/settings"
          >
            Settings
          </Link>
        </nav>
        <div className="mt-8 border-t pt-4">
          <Link className="text-gray-500 text-sm hover:text-gray-700" href="/">
            ← Back to site
          </Link>
        </div>
        <div className="mt-4">
          <p className="text-gray-400 text-xs">
            This sidebar persists when navigating between dashboard pages.
          </p>
        </div>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
