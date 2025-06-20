'use client';

import React from 'react';
import { useAuth } from '@/components/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthTestPage() {
  const { user, session, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
        <p>Loading authentication state...</p>
      </div>
    );
  }

  if (!user) {
    router.push('/sign-in?reason=auth-required');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
      
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Authentication Status</h2>
        <p className="mb-2">
          <span className="font-bold">Status:</span>{' '}
          <span className="text-green-400">Authenticated</span>
        </p>
        <div className="mb-2">
          <p><span className="font-bold">User Email:</span> {user.email}</p>
          <p><span className="font-bold">User ID:</span> {user.id}</p>
        </div>
        <p className="mb-2">
          <span className="font-bold">Session:</span>{' '}
          <span className={session ? 'text-green-400' : 'text-red-400'}>
            {session ? 'Active' : 'None'}
          </span>
        </p>
      </div>
      
      <div className="flex flex-wrap gap-3 mb-6">
        <Link href="/dashboard" className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md">
          Go to Dashboard
        </Link>
        
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
      </div>
      
      <div className="text-sm text-gray-400">
        <p>This page is for testing authentication flow.</p>
      </div>
    </div>
  );
}