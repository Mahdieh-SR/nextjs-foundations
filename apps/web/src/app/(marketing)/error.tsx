'use client';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded border border-red-200 bg-red-50 p-4">
      <h2 className="mb-2 font-semibold text-lg text-red-800">
        Something went wrong
      </h2>
      <p className="mb-4 text-red-600 text-sm">{error.message}</p>
      <button
        className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        onClick={reset}
        type="button"
      >
        Try again
      </button>
    </div>
  );
}
