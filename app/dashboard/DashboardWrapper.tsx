'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboardAuth } from '@/hooks/useDashboardAuth';
import { useAuth } from '@/components/context/AuthContext';
import toast from 'react-hot-toast';
import { debugAuthState, attemptAuthFix } from '@/lib/auth/authDebugger';

interface DashboardWrapperProps {
  children: React.ReactNode;
}

export default function DashboardWrapper({ children }: DashboardWrapperProps) {
  const router = useRouter();
  const { user, session, isLoading: authLoading } = useAuth();
  const { 
    user: dashboardUser, 
    accessLevel, 
    isVIP, 
    vipStatus, 
    benefits, 
    loading: dashboardLoading, 
    error: dashboardError,
    checkAccess,
    getAccessLevelLabel 
  } = useDashboardAuth();
  
  const [isClient, setIsClient] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  // Set client-side rendering flag
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Set a timeout to prevent infinite loading
  useEffect(() => {
    if (isClient && (authLoading || dashboardLoading)) {
      const timer = setTimeout(() => {
        console.log('[DASHBOARD] Loading timeout reached, forcing render');
        setLoadingTimeout(true);
      }, 5000); // 5 second timeout
      
      return () => clearTimeout(timer);
    }
  }, [isClient, authLoading, dashboardLoading]);
  
  // Attempt to fix auth issues on mount
  useEffect(() => {
    if (isClient && !user && !authLoading) {
      console.log('[DASHBOARD] No user detected, attempting to fix auth issues');
      attemptAuthFix().then(result => {
        if (result.success && result.fixed) {
          console.log('[DASHBOARD] Auth fix successful, refreshing page');
          window.location.reload();
        } else if (result.needsSignIn) {
          console.log('[DASHBOARD] Auth fix failed, redirecting to sign-in');
          router.push('/sign-in?reason=session-expired');
        }
      });
    }
  }, [isClient, user, authLoading, router]);
  
  // Collect debug info for development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Enhanced debug info
      const getDebugInfo = async () => {
        const authDiagnostics = await debugAuthState();
        setDebugInfo({
          hasUser: !!user,
          userEmail: user?.email,
          authLoading,
          dashboardLoading,
          dashboardError,
          accessLevel,
          sessionExists: !!session,
          authDiagnostics: authDiagnostics.diagnostics || null
        });
      };
      
      getDebugInfo();
    }
  }, [user, session, authLoading, dashboardLoading, dashboardError, accessLevel]);
  
  // Handle auth errors with toast
  useEffect(() => {
    if (dashboardError && isClient) {
      console.error('[DASHBOARD] Error:', dashboardError);
      toast.error(dashboardError);
    }
  }, [dashboardError, isClient]);
  
  // Force access check on mount
  useEffect(() => {
    if (user && session && !dashboardLoading) {
      checkAccess();
    }
  }, [user, session, checkAccess, dashboardLoading]);

  // Handle authentication check
  useEffect(() => {
    if (!isClient || (authLoading && !loadingTimeout) || (dashboardLoading && !loadingTimeout)) {
      console.log('[DASHBOARD] Waiting for client/loading to complete...', { isClient, authLoading, dashboardLoading });
      return;
    }

    console.log('[DASHBOARD] Authentication check:', {
      hasUser: !!user,
      userEmail: user?.email,
      authLoading,
      dashboardLoading,
      dashboardError,
      accessLevel,
      debugInfo
    });

    if (!user && !authLoading) {
      console.log('[DASHBOARD] User not authenticated, redirecting to sign-in');
      toast.error('Please sign in to access the dashboard');
      
      // Try to fix auth issues before redirecting
      attemptAuthFix().then(result => {
        if (result.success && result.fixed) {
          console.log('[DASHBOARD] Auth fix successful, refreshing page');
          window.location.reload();
        } else {
          router.push('/sign-in?reason=session-expired');
        }
      });
      
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
  }, [user, authLoading, dashboardLoading, router, isClient, accessLevel, isVIP, vipStatus, benefits, dashboardError, debugInfo, loadingTimeout]);

  // Show loading state
  if ((!isClient || authLoading || dashboardLoading) && !loadingTimeout) {
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

  // Error state - show error and redirect
  if (dashboardError) {
    return (
      <div className="min-h-screen bg-deep-navy flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-gray-800 rounded-lg shadow-lg">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-white text-2xl font-bold mb-4">Access Error</h2>
          <p className="text-gray-300 mb-6">{dashboardError}</p>
          <button 
            onClick={() => router.push('/sign-in')}
            className="px-4 py-2 bg-electric-blue text-white rounded-md hover:bg-electric-blue/80"
          >
            Return to Sign In
          </button>
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
          <div>User: {user?.email || 'No user'}</div>
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