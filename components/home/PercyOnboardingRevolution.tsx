'use client';

/**
 * DEPRECATED COMPONENT - Minimal Fallback
 * This component redirects to homepage to avoid React Hook violations
 * Original 2,891-line component archived
 */

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { showPerformanceWarning } from '@/lib/config/featureFlags';

export default function PercyOnboardingRevolution() {
  const router = useRouter();
  
  useEffect(() => {
    showPerformanceWarning();
    // Redirect to homepage after 1 second
    const timer = setTimeout(() => {
      router.push('/');
    }, 1000);
    return () => clearTimeout(timer);
  }, [router]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-white mb-4">Redirecting...</h2>
        <p className="text-gray-400 mb-6">
          Taking you to the homepage...
        </p>
        <button 
          onClick={() => router.push('/')}
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Go Now
        </button>
      </div>
    </div>
  );
}
