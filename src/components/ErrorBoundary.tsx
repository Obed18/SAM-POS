import React, { ReactNode, useState, useEffect } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setError(event.error);
      console.error('Uncaught error:', event.error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setError(new Error(event.reason?.message || 'Unhandled Promise Rejection'));
      console.error('Unhandled rejection:', event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  if (error) {
    return (
      <div className="w-screen h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md p-6 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Application Error</h1>
          <p className="text-slate-600 text-sm mb-4">
            {error.message}
          </p>
          {error.message.includes('environment variables') && (
            <div className="bg-amber-50 border border-amber-200 rounded p-3 text-left text-xs text-amber-800 mb-4">
              <p className="font-semibold mb-1">⚙️ Missing Configuration</p>
              <p>Please set the following environment variables in Netlify:</p>
              <ul className="list-disc list-inside mt-2">
                <li>VITE_SUPABASE_URL</li>
                <li>VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY</li>
              </ul>
              <p className="mt-2 text-xs">
                Go to your Netlify site settings → Environment → Add environment variables
              </p>
            </div>
          )}
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-900 transition"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
