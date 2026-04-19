'use client';

/**
 * Global error boundary for root layout errors.
 * This catches errors that the regular error.tsx cannot (e.g., layout-level crashes).
 * Must include its own <html> and <body> tags.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f8fafc' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ maxWidth: '400px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px', color: '#1e293b' }}>
              Application Error
            </h1>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>
              A critical error occurred. Please reload the page.
            </p>
            <button
              onClick={reset}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              Reload
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
