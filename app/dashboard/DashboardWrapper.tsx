'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboardAuth } from '@/hooks/useDashboardAuth';
import { supabase } from '@/utils/supabase';

interface DashboardWrapperProps {
  children: React.ReactNode;
}

export default function DashboardWrapper({ children }: DashboardWrapperProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { 
    user, 
    accessLevel, 
    isVIP, 
    vipStatus, 
    benefits, 
    loading, 
    error,
    hasFeature,
    getAccessLevelLabel
  } = useDashboardAuth();

  // Ensure client-side only rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Debug session info
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        const debug = {
          hasSession: !!session,
          sessionUser: session?.user?.id || null,
          sessionEmail: session?.user?.email || null,
          accessToken: session?.access_token ? 'Present' : 'Missing',
          expiresAt: session?.expires_at || null,
          hookUser: user?.id || null,
          hookError: error?.message || null,
          timestamp: new Date().toISOString()
        };
        setDebugInfo(debug);
        console.log('[DASHBOARD] Session debug info:', debug);
      } catch (err) {
        console.error('[DASHBOARD] Session check error:', err);
      }
    };

    if (isClient) {
      checkSession();
    }
  }, [isClient, user]);

  // Handle authentication check
  useEffect(() => {
    if (!isClient || loading) {
      console.log('[DASHBOARD] Waiting for client/loading to complete...', { isClient, loading });
      return;
    }

    console.log('[DASHBOARD] Authentication check:', {
      hasUser: !!user,
      userEmail: user?.email,
      loading,
      error,
      accessLevel,
      debugInfo
    });

    if (!user && !loading) {
      console.log('[DASHBOARD] User not authenticated, redirecting to sign-in');
      router.push('/sign-in');
      return;
    }

    if (user) {
      console.log('[DASHBOARD] User authenticated successfully:', {
        email: user.email,
        accessLevel,
        isVIP,
        vipLevel: vipStatus?.vipLevel,
        hasFeatures: Object.keys(benefits.features || {}).length
      });
    }
  }, [user, loading, router, isClient, accessLevel, isVIP, vipStatus, benefits, error, debugInfo]);

  // Show loading state
  if (!isClient || loading) {
    return (
      <div className="min-h-screen bg-deep-navy flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-electric-blue mx-auto mb-4"></div>
          <p className="text-white">Loading dashboard...</p>
          <p className="text-gray-400 text-sm">Verifying access permissions</p>
          {process.env.NODE_ENV === 'development' && debugInfo && (
            <pre className="text-xs text-gray-500 mt-4 max-w-lg mx-auto text-left">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          )}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-deep-navy flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-xl mb-4">⚠️ Authentication Error</div>
          <p className="text-gray-300 mb-4">{error}</p>
          {process.env.NODE_ENV === 'development' && debugInfo && (
            <details className="text-xs text-gray-500 mt-4 text-left">
              <summary>Debug Info</summary>
              <pre className="mt-2">{JSON.stringify(debugInfo, null, 2)}</pre>
            </details>
          )}
          <button
            onClick={() => router.push('/sign-in')}
            className="px-4 py-2 bg-electric-blue text-white rounded hover:bg-electric-blue/90 transition-colors"
          >
            Return to Sign In
          </button>
        </div>
      </div>
    );
  }

  // If no user after loading complete, don't render anything (redirect will happen)
  if (!user) {
    console.log('[DASHBOARD] No user found, redirecting should happen...');
    return (
      <div className="min-h-screen bg-deep-navy flex items-center justify-center">
        <div className="text-center">
          <p className="text-white">Redirecting to sign in...</p>
          {process.env.NODE_ENV === 'development' && debugInfo && (
            <details className="text-xs text-gray-500 mt-4 text-left">
              <summary>Debug Info</summary>
              <pre className="mt-2">{JSON.stringify(debugInfo, null, 2)}</pre>
            </details>
          )}
        </div>
      </div>
    );
  }

  // Success state - render children with access level info
  return (
    <div className="dashboard-wrapper">
      {/* Add access level indicator for debugging/admin purposes */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-0 right-0 z-50 bg-black/80 text-white text-xs p-2 rounded-bl max-w-xs">
          <div>Level: {getAccessLevelLabel()}</div>
          {isVIP && <div>VIP: {vipStatus?.vipLevel}</div>}
          <div>Features: {Object.keys(benefits.features || {}).length}</div>
          <div>User: {user.email}</div>
          {debugInfo && (
            <details className="mt-2">
              <summary>Session</summary>
              <pre className="text-xs">{JSON.stringify(debugInfo, null, 2)}</pre>
            </details>
          )}
        </div>
      )}
      
      {children}
    </div>
  );
} 