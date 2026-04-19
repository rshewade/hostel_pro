'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled error:', error.digest || error.message);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-page, #f8fafc)' }}>
      <div className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>
        <h1 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary, #1e293b)' }}>
          Something went wrong
        </h1>
        <p className="mb-6" style={{ color: 'var(--text-secondary, #64748b)' }}>
          An unexpected error occurred. Please try again or contact support if the problem persists.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 rounded-lg text-white font-medium"
            style={{ backgroundColor: 'var(--color-primary, #2563eb)' }}
          >
            Try again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 rounded-lg border font-medium"
            style={{ borderColor: 'var(--border-default, #e2e8f0)', color: 'var(--text-primary, #1e293b)' }}
          >
            Go home
          </button>
        </div>
      </div>
    </div>
  );
}
