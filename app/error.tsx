'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to your error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-purple-900 to-indigo-900">
      <div className="max-w-md mx-auto text-center px-6">
        <div className="mb-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Something went wrong!
          </h1>
          <p className="text-gray-300 mb-8">
            Our AI agents are working to fix this issue. Please try again in a moment.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="text-left bg-black/20 p-4 rounded-lg mb-6">
              <summary className="text-red-300 cursor-pointer mb-2">
                Error Details (Development)
              </summary>
              <pre className="text-xs text-gray-400 whitespace-pre-wrap">
                {error.message}
              </pre>
            </details>
          )}
        </div>
        
        <div className="space-y-4">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 mr-4"
          >
            Try Again
          </button>
          
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-600 text-base font-medium rounded-md text-gray-300 hover:text-white hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
          >
            Go Home
          </Link>
        </div>
        
        <div className="mt-8 text-sm text-gray-400">
          If this problem persists, please{' '}
          <Link href="/contact" className="text-purple-400 hover:text-purple-300 underline">
            contact support
          </Link>
          .
        </div>
      </div>
    </div>
  );
}