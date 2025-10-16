'use client';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

/**
 * Debug page to help diagnose Supabase environment variable issues
 * Uses runtime fetch to /api/_probe/env to avoid build-time env checks
 */
export default function SignInDebugPage() {
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({
    checking: true,
    probe: null
  });
  
  useEffect(() => {
    async function checkEnvironment() {
      try {
        // Fetch env probe from API route at runtime
        const response = await fetch('/api/_probe/env', {
          cache: 'no-store'
        });
        
        if (!response.ok) {
          throw new Error(`API probe failed: ${response.status}`);
        }
        
        const probeData = await response.json();
        
        setDebugInfo({
          checking: false,
          probe: probeData,
          timestamp: new Date().toISOString(),
        });
      } catch (error: any) {
        setDebugInfo({
          checking: false,
          probe: null,
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
            {debugInfo.error && (
              <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/50">
                <h3 className="font-bold text-red-300">Error</h3>
                <div className="mt-2 text-red-400">{debugInfo.error}</div>
              </div>
            )}
            
            {debugInfo.probe && (
              <>
                <div>
                  <h2 className="text-xl text-teal-400 mb-2">Supabase Configuration:</h2>
                  <div className="bg-gray-800 p-4 rounded space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">URL:</span>
                      <span className={debugInfo.probe.supabase.url === 'PRESENT' ? 'text-green-400' : 'text-red-400'}>
                        {debugInfo.probe.supabase.url}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Anon Key:</span>
                      <span className={debugInfo.probe.supabase.anon === 'PRESENT' ? 'text-green-400' : 'text-red-400'}>
                        {debugInfo.probe.supabase.anon}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Service Role:</span>
                      <span className={debugInfo.probe.supabase.service === 'PRESENT' ? 'text-green-400' : 'text-red-400'}>
                        {debugInfo.probe.supabase.service}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-xl text-teal-400 mb-2">Project Info:</h2>
                  <div className="bg-gray-800 p-4 rounded space-y-1 text-sm">
                    <div className="text-gray-300">Host: <span className="text-white font-mono">{debugInfo.probe.notes.projectHost || 'N/A'}</span></div>
                    <div className="text-gray-300">Ref: <span className="text-white font-mono">{debugInfo.probe.notes.projectRef || 'N/A'}</span></div>
                    <div className="text-gray-300">Live Project: <span className={debugInfo.probe.notes.assertLiveProject ? 'text-green-400' : 'text-yellow-400'}>
                      {debugInfo.probe.notes.assertLiveProject ? 'Yes ✅' : 'No ⚠️'}
                    </span></div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-xl text-teal-400 mb-2">Full Probe Response:</h2>
                  <pre className="bg-gray-800 p-4 rounded overflow-auto text-xs max-h-60">
                    {JSON.stringify(debugInfo.probe, null, 2)}
                  </pre>
                </div>
              </>
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
