'use client';

import React, { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/context/AuthContext';
import toast from 'react-hot-toast';

interface DashboardWrapperProps {
  children: ReactNode;
}

export default function DashboardWrapper({ children }: DashboardWrapperProps) {
  const router = useRouter();
  const {
    user,
    session,
    isLoading,
    error,
    accessLevel,
    vipStatus,
    benefits,
    signOut,
  } = useAuth();
  
  const [isClient, setIsClient] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  // Set client-side rendering flag
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Set a timeout to prevent infinite loading
  useEffect(() => {
    if (isClient && isLoading) {
      const timer = setTimeout(() => {
        console.log('[DASHBOARD] Loading timeout reached, forcing render');
        setLoadingTimeout(true);
      }, 8000); // 8-second timeout
      return () => clearTimeout(timer);
    }
  }, [isClient, isLoading]);
  
  // Handle auth errors with toast
  useEffect(() => {
    if (error && isClient) {
      console.error('[DASHBOARD] Error:', error);
      toast.error(error);
    }
  }, [error, isClient]);

  // Handle authentication check
  useEffect(() => {
    if (!isClient || (isLoading && !loadingTimeout)) {
      console.log('[DASHBOARD] Waiting for client/loading to complete...', { isClient, isLoading });
      return;
    }

    console.log('[DASHBOARD] Authentication check:', {
      hasUser: !!user,
      userEmail: user?.email,
      isLoading,
      error,
      accessLevel
    });

    if (!user && !isLoading) {
      console.log('[DASHBOARD] User not authenticated, redirecting to sign-in');
      toast.error('Please sign in to access the dashboard');
      router.push('/sign-in?reason=session-expired');
      return;
    }

    if (user) {
      console.log('[DASHBOARD] User authenticated successfully:', {
        email: user.email,
        accessLevel,
        isVIP: vipStatus?.isVIP,
        vipLevel: vipStatus?.vipLevel,
        hasFeatures: Object.keys(vipStatus?.features || {}).length
      });
    }
  }, [user, isLoading, router, isClient, accessLevel, vipStatus, error, loadingTimeout]);

  // Show loading state
  if ((!isClient || isLoading) && !loadingTimeout) {
    return (
      <div className="min-h-screen bg-deep-navy flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-electric-blue mx-auto mb-4"></div>
          <p className="text-white">Loading dashboard...</p>
          <p className="text-gray-400 text-sm">Verifying access permissions</p>
        </div>
      </div>
    );
  }

  // Error state - show error and redirect
  if (error) {
    return (
      <div className="min-h-screen bg-deep-navy flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-gray-800 rounded-lg shadow-lg">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-white text-2xl font-bold mb-4">Access Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
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
        <div className="fixed top-0 right-0 z-50 bg-gradient-to-br from-deep-navy via-purple-900/80 to-black/80 text-teal-200 text-xs p-2 rounded-bl max-w-xs">
          <div>Level: {accessLevel}</div>
          {vipStatus?.isVIP && <div>VIP: {vipStatus?.vipLevel}</div>}
          <div>Features: {Object.keys(vipStatus?.features || {}).length}</div>
          <div>User: {user?.email || 'No user'}</div>
        </div>
      )}
      
      {children}
    </div>
  );
} 