'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/utils/supabase-auth';
import { User } from '@supabase/supabase-js';

export interface DashboardAccess {
  user: User | null;
  accessLevel: 'free' | 'promo' | 'vip';
  isVIP: boolean;
  vipStatus: {
    isVIP: boolean;
    vipLevel: string;
    vipScore?: number;
    companyName?: string;
  };
  benefits: Record<string, any>;
  promoCodeUsed: string | null;
  metadata: Record<string, any>;
  loading: boolean;
  error: string | null;
}

export interface DashboardAuthActions {
  checkAccess: () => Promise<void>;
  hasFeature: (feature: string) => boolean;
  isAccessLevel: (level: 'free' | 'promo' | 'vip') => boolean;
  getAccessLevelLabel: () => string;
}

/**
 * Custom hook for dashboard authentication and access control
 * Provides user access information and helper functions for feature gating
 */
export function useDashboardAuth(): DashboardAccess & DashboardAuthActions {
  const [dashboardAccess, setDashboardAccess] = useState<DashboardAccess>({
    user: null,
    accessLevel: 'free',
    isVIP: false,
    vipStatus: {
      isVIP: false,
      vipLevel: 'standard'
    },
    benefits: {},
    promoCodeUsed: null,
    metadata: {},
    loading: true,
    error: null
  });

  const checkAccess = async (): Promise<void> => {
    try {
      setDashboardAccess(prev => ({ ...prev, loading: true, error: null }));

      // Get current session
      const { data: { session } } = await auth.getSession();
      
      if (!session?.access_token) {
        setDashboardAccess(prev => ({
          ...prev,
          user: null,
          loading: false,
          error: 'No active session'
        }));
        return;
      }

      // Check dashboard access with API
      const response = await fetch('/api/auth/dashboard-signin?checkAccess=true', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to check access');
      }

      setDashboardAccess(prev => ({
        ...prev,
        user: data.user,
        accessLevel: data.accessLevel,
        isVIP: data.isVIP,
        vipStatus: data.vipStatus,
        benefits: data.benefits,
        promoCodeUsed: data.promoCodeUsed,
        metadata: data.metadata,
        loading: false,
        error: null
      }));

    } catch (error: any) {
      console.error('[useDashboardAuth] Access check failed:', error);
      setDashboardAccess(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to check dashboard access'
      }));
    }
  };

  // Helper function to check if user has specific feature access
  const hasFeature = (feature: string): boolean => {
    const { benefits, accessLevel, isVIP } = dashboardAccess;

    // VIP users have access to all features
    if (isVIP || accessLevel === 'vip') {
      return true;
    }

    // Check if feature is in benefits
    if (benefits.features && Array.isArray(benefits.features)) {
      return benefits.features.includes(feature);
    }

    // Check specific benefit properties
    return benefits[feature] === true;
  };

  // Helper function to check access level
  const isAccessLevel = (level: 'free' | 'promo' | 'vip'): boolean => {
    return dashboardAccess.accessLevel === level;
  };

  // Helper function to get access level label
  const getAccessLevelLabel = (): string => {
    const { accessLevel, vipStatus } = dashboardAccess;
    
    if (accessLevel === 'vip') {
      return `VIP ${vipStatus.vipLevel.charAt(0).toUpperCase() + vipStatus.vipLevel.slice(1)}`;
    }
    
    if (accessLevel === 'promo') {
      return 'Promo Access';
    }
    
    return 'Free Access';
  };

  // Set up auth state listener and initial check
  useEffect(() => {
    const { data: { subscription } } = auth.onAuthStateChanged(async (user) => {
      if (user) {
        await checkAccess();
      } else {
        setDashboardAccess(prev => ({
          ...prev,
          user: null,
          accessLevel: 'free',
          isVIP: false,
          vipStatus: { isVIP: false, vipLevel: 'standard' },
          benefits: {},
          promoCodeUsed: null,
          metadata: {},
          loading: false,
          error: null
        }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    ...dashboardAccess,
    checkAccess,
    hasFeature,
    isAccessLevel,
    getAccessLevelLabel
  };
}

/**
 * Hook for checking specific feature access
 * Useful for conditional rendering of premium features
 */
export function useFeatureAccess(feature: string) {
  const { hasFeature, accessLevel, isVIP, loading } = useDashboardAuth();
  
  return {
    hasAccess: hasFeature(feature),
    accessLevel,
    isVIP,
    loading,
    requiresUpgrade: !hasFeature(feature) && !loading
  };
}

/**
 * Hook for VIP status checking
 */
export function useVIPStatus() {
  const { vipStatus, isVIP, loading } = useDashboardAuth();
  
  return {
    ...vipStatus,
    isVIP,
    loading,
    isEnterprise: vipStatus.vipLevel === 'enterprise',
    isPlatinum: vipStatus.vipLevel === 'platinum',
    isGold: vipStatus.vipLevel === 'gold',
    isSilver: vipStatus.vipLevel === 'silver',
    vipScore: vipStatus.vipScore || 0
  };
} 