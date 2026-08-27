'use client';

import { useEffect, useMemo } from 'react';

function generateCorrelationId(): string {
  return `err-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function ErrorDemoBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const correlationId = useMemo(() => generateCorrelationId(), []);

  useEffect(() => {
    const errorLog = {
      correlationId,
      digest: error.digest,
      message: error.message,
      timestamp: new Date().toISOString(),
      location: '/error-demo',
    };
    // biome-ignore lint/suspicious/noConsole: Error logging is intentional
    console.error('Error demo boundary caught:', errorLog);
  }, [error, correlationId]);

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="rounded-lg border-2 border-orange-300 bg-orange-50 p-6">
        <h2 className="mb-2 font-bold text-orange-800 text-xl">
          Demo Error Caught!
        </h2>
        <p className="mb-4 text-orange-700">
          This error was caught by the nested error boundary in /error-demo.
        </p>
        <p className="mb-4 font-mono text-orange-600 text-sm">
          {error.message}
        </p>
        <p className="mb-4 font-mono text-orange-400 text-xs">
          Correlation ID: {correlationId}
        </p>
        {error.digest && (
          <p className="mb-4 font-mono text-orange-400 text-xs">
            Digest: {error.digest}
          </p>
        )}
        <div className="flex gap-3">
          <button
            className="rounded bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
            onClick={reset}
            type="button"
          >
            Try Again
          </button>
          <a
            className="rounded border border-orange-600 px-4 py-2 text-orange-600 hover:bg-orange-100"
            href="/error-demo"
          >
            Reload Page
          </a>
        </div>
      </div>
    </div>
  );
}
