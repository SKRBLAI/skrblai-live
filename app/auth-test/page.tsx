'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/context/AuthContext';
import { debugAuthState, addAuthDebugButton } from '@/lib/auth/authDebugger';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthTestPage() {
  const { user, session, isLoading } = useAuth();
  const [authDiagnostics, setAuthDiagnostics] = useState<any>(null);
  const [cookies, setCookies] = useState<string[]>([]);
  const router = useRouter();
  
  useEffect(() => {
    // Add debug button
    addAuthDebugButton();
    
    // Get auth diagnostics
    const runDiagnostics = async () => {
      const diagnostics = await debugAuthState();
      setAuthDiagnostics(diagnostics);
    };
    
    runDiagnostics();
    
    // Get cookies
    if (typeof document !== 'undefined') {
      setCookies(document.cookie.split(';').map(c => c.trim()));
    }
  }, []);
  
  const handleRefreshDiagnostics = async () => {
    const diagnostics = await debugAuthState();
    setAuthDiagnostics(diagnostics);
    if (typeof document !== 'undefined') {
      setCookies(document.cookie.split(';').map(c => c.trim()));
    }
  };
  
  const handleTestDashboardRedirect = () => {
    router.push('/dashboard');
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
        <p>Loading authentication state...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
      
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Authentication Status</h2>
        <p className="mb-2">
          <span className="font-bold">Status:</span>{' '}
          {user ? (
            <span className="text-green-400">Authenticated</span>
          ) : (
            <span className="text-red-400">Not Authenticated</span>
          )}
        </p>
        {user && (
          <div className="mb-2">
            <p><span className="font-bold">User Email:</span> {user.email}</p>
            <p><span className="font-bold">User ID:</span> {user.id}</p>
          </div>
        )}
        <p className="mb-2">
          <span className="font-bold">Session:</span>{' '}
          {session ? (
            <span className="text-green-400">Active</span>
          ) : (
            <span className="text-red-400">None</span>
          )}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Auth Diagnostics</h2>
          {authDiagnostics ? (
            <pre className="text-xs bg-gray-900 p-3 rounded overflow-auto max-h-80">
              {JSON.stringify(authDiagnostics, null, 2)}
            </pre>
          ) : (
            <p>No diagnostics available</p>
          )}
        </div>
        
        <div className="p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Cookies</h2>
          {cookies.length > 0 ? (
            <ul className="text-xs bg-gray-900 p-3 rounded overflow-auto max-h-80">
              {cookies.map((cookie, index) => (
                <li key={index} className="mb-1 break-all">{cookie}</li>
              ))}
            </ul>
          ) : (
            <p>No cookies found</p>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={handleRefreshDiagnostics}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md"
        >
          Refresh Diagnostics
        </button>
        
        <button
          onClick={handleTestDashboardRedirect}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md"
        >
          Test Dashboard Redirect
        </button>
        
        <Link href="/sign-in" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md">
          Go to Sign In
        </Link>
        
        {user && (
          <button
            onClick={async () => {
              const { supabase } = await import('@/utils/supabase');
              await supabase.auth.signOut();
              router.push('/sign-in');
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md"
          >
            Sign Out
          </button>
        )}
      </div>
      
      <div className="text-sm text-gray-400">
        <p>This page is for testing authentication flow and debugging auth issues.</p>
        <p>If you're seeing this page, you're in development mode.</p>
      </div>
    </div>
  );
} 