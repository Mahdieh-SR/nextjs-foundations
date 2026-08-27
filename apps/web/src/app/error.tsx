'use client';

import { useEffect } from 'react';

// Named RootError rather than Error: a component called Error shadows the
// global, and the `error: Error` annotation below would then resolve to this
// function instead of the built-in type. Next only cares about the default
// export, not what it is called.
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // biome-ignore lint/suspicious/noConsole: an error boundary reporting to the server log
    console.error('Root error boundary caught:', error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center">
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
        <h2 className="mb-2 font-bold text-2xl text-red-800">
          Something went wrong
        </h2>
        <p className="mb-4 text-red-600">
          {error.message || 'An unexpected error occurred'}
        </p>
        {error.digest && (
          <p className="mb-4 font-mono text-red-400 text-xs">
            Error ID: {error.digest}
          </p>
        )}
        <button
          className="rounded bg-red-600 px-6 py-2 font-medium text-white hover:bg-red-700"
          onClick={reset}
          type="button"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
