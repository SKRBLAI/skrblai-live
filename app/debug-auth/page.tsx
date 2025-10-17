'use client';

import React, { useState, useEffect } from 'react';

// Only render in non-production or when debug tools are enabled
const shouldRender = process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_DEBUG_TOOLS === 'true';

export default function DebugAuthPage() {
  const [supabaseData, setSupabaseData] = useState<any>(null);
  const [authData, setAuthData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shouldRender) {
      setError('Debug tools not available in production');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch all probe data
        const [supabaseRes, authRes, profileRes] = await Promise.all([
          fetch('/api/_probe/supabase'),
          fetch('/api/_probe/auth'),
          fetch('/api/_probe/db/profile-check')
        ]);

        const [supabase, auth, profile] = await Promise.all([
          supabaseRes.json(),
          authRes.json(),
          profileRes.json()
        ]);

        setSupabaseData(supabase);
        setAuthData(auth);
        setProfileData(profile);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch debug data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (!shouldRender) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Debug Auth Tools</h1>
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-300">Debug tools are not available in production.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Debug Auth Tools</h1>
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            <span className="ml-3">Loading debug data...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Debug Auth Tools</h1>
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-300">Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Auth Tools</h1>
        
        <div className="grid gap-6">
          {/* Supabase Status */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-400">Supabase Status</h2>
            <pre className="bg-gray-900 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(supabaseData, null, 2)}
            </pre>
          </div>

          {/* Auth Status */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">Auth Status</h2>
            <pre className="bg-gray-900 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(authData, null, 2)}
            </pre>
          </div>

          {/* Profile Status */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-400">Profile Status</h2>
            <pre className="bg-gray-900 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(profileData, null, 2)}
            </pre>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-yellow-400">Quick Actions</h2>
            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded mr-4"
              >
                Refresh Data
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify({
                    supabase: supabaseData,
                    auth: authData,
                    profile: profileData
                  }, null, 2));
                  alert('Debug data copied to clipboard');
                }}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mr-4"
              >
                Copy All Data
              </button>
              <a
                href="/"
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';