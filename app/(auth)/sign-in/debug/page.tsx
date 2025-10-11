'use client';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

/**
 * Debug page to help diagnose Supabase environment variable issues
 */
export default function SignInDebugPage() {
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({
    checking: true,
    env: {}
  });
  
  useEffect(() => {
    async function checkEnvironment() {
      // Safe check for environment variables
      const envCheck = {
        // Next.js public env vars
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '[missing]',
        NEXT_PUBLIC_SUPABASE_URL_LENGTH: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
          ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 10)}...` 
          : '[missing]',
        NEXT_PUBLIC_SUPABASE_ANON_KEY_LENGTH: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
        
        // Check if other public envs are loading
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || '[missing]',
        NODE_ENV: process.env.NODE_ENV || '[missing]',
      };

      // Try to import the Supabase client dynamically
      try {
        const { getBrowserSupabase } = await import('@/lib/supabase');
        const supabase = getBrowserSupabase();
        
        setDebugInfo({
          checking: false,
          env: envCheck,
          supabaseClientCreated: !!supabase,
          timestamp: new Date().toISOString(),
        });
      } catch (error: any) {
        setDebugInfo({
          checking: false,
          env: envCheck,
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }
    }
    
    checkEnvironment();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="w-full max-w-lg p-6 rounded-xl bg-black/50 border border-teal-500/30 shadow-2xl backdrop-blur-lg">
        <h1 className="text-2xl font-bold mb-4">🔍 Supabase Debug Page</h1>
        
        {debugInfo.checking ? (
          <div className="animate-pulse">Checking environment...</div>
        ) : (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl text-teal-400 mb-2">Environment Variables:</h2>
              <pre className="bg-gray-800 p-4 rounded overflow-auto text-sm max-h-60">
                {JSON.stringify(debugInfo.env, null, 2)}
              </pre>
            </div>
            
            {debugInfo.supabaseClientCreated !== undefined && (
              <div className="p-4 rounded-lg bg-opacity-20 border"
                   style={{ 
                     backgroundColor: debugInfo.supabaseClientCreated ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                     borderColor: debugInfo.supabaseClientCreated ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'
                   }}>
                <h3 className="font-bold">
                  Supabase Client: {debugInfo.supabaseClientCreated ? 'Created ✅' : 'Failed ❌'}
                </h3>
                {!debugInfo.supabaseClientCreated && debugInfo.error && (
                  <div className="mt-2 text-red-400">Error: {debugInfo.error}</div>
                )}
              </div>
            )}
            
            <div className="text-sm text-gray-400 mt-4">
              Timestamp: {debugInfo.timestamp}
            </div>
            
            <div className="flex flex-col gap-2 mt-6">
              <Link 
                href="/sign-in" 
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 transition rounded text-center"
              >
                Back to Sign In
              </Link>
              
              <Link 
                href="/"
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 transition rounded text-center"
              >
                Go to Homepage
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
