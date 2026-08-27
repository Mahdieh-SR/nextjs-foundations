/**
 * Route-level fallback. Next wraps the segment in a Suspense boundary with
 * this as its fallback, so it is what fills the frame during a navigation to a
 * profile, before the page's own boundaries take over.
 *
 * It mirrors the three sections in page.tsx at the same sizes and spacing —
 * same max-width, same p-8, same space-y-6 — so the swap does not move
 * anything on screen.
 */
export default function ProfileLoading() {
  return (
    <main className="mx-auto max-w-2xl animate-pulse space-y-6 p-8">
      <section>
        <div className="mb-2 h-8 w-48 rounded bg-gray-200" />
        <div className="h-4 w-32 rounded bg-gray-200" />
      </section>

      <section className="flex gap-4">
        <div className="h-6 w-20 rounded bg-gray-200" />
        <div className="h-6 w-24 rounded bg-gray-200" />
        <div className="h-6 w-24 rounded bg-gray-200" />
      </section>

      <section>
        <div className="mb-2 h-6 w-40 rounded bg-gray-200" />
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="h-4 w-3/4 rounded bg-gray-200" />
        </div>
      </section>
    </main>
  );
}
