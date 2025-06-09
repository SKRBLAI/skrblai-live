'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboardAuth } from '@/hooks/useDashboardAuth';

interface DashboardWrapperProps {
  children: React.ReactNode;
}

export default function DashboardWrapper({ children }: DashboardWrapperProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
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

  // Handle authentication check
  useEffect(() => {
    if (!isClient || loading) return;

    if (!user && !loading) {
      console.log('[DASHBOARD] User not authenticated, redirecting to sign-in');
      router.push('/dashboard/signin');
      return;
    }

    if (user) {
      console.log('[DASHBOARD] User authenticated:', {
        email: user.email,
        accessLevel,
        isVIP,
        vipLevel: vipStatus?.vipLevel,
        hasFeatures: Object.keys(benefits.features || {}).length
      });
    }
  }, [user, loading, router, isClient, accessLevel, isVIP, vipStatus, benefits]);

  // Show loading state
  if (!isClient || loading) {
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

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-deep-navy flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-xl mb-4">⚠️ Authentication Error</div>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard/signin')}
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
    return null;
  }

  // Success state - render children with access level info
  return (
    <div className="dashboard-wrapper">
      {/* Add access level indicator for debugging/admin purposes */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-0 right-0 z-50 bg-black/80 text-white text-xs p-2 rounded-bl">
          <div>Level: {getAccessLevelLabel()}</div>
          {isVIP && <div>VIP: {vipStatus?.vipLevel}</div>}
          <div>Features: {Object.keys(benefits.features || {}).length}</div>
        </div>
      )}
      
      {children}
    </div>
  );
} 