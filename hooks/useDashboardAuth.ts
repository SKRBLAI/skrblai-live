'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/utils/supabase'; // Update this import path if needed!
import type { User, Session } from '@supabase/supabase-js';

// --- Types ---
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
 * Uses official Supabase client methods (getSession, onAuthStateChange)
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

  // Fetches current access state from API
  const checkAccess = useCallback(async (): Promise<void> => {
    try {
      setDashboardAccess(prev => ({ ...prev, loading: true, error: null }));

      // Use official supabase.auth.getSession()
      const { data, error: sessionError } = await supabase.auth.getSession();
      const session: Session | null = data?.session || null;

      if (sessionError || !session?.access_token) {
        setDashboardAccess(prev => ({
          ...prev,
          user: null,
          loading: false,
          error: 'No active session'
        }));
        return;
      }

      // Check dashboard access with API (pass token)
      const response = await fetch('/api/auth/dashboard-signin?checkAccess=true', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const dataJson = await response.json();

      if (!dataJson.success) {
        throw new Error(dataJson.error || 'Failed to check access');
      }

      setDashboardAccess(prev => ({
        ...prev,
        user: dataJson.user,
        accessLevel: dataJson.accessLevel,
        isVIP: dataJson.isVIP,
        vipStatus: dataJson.vipStatus,
        benefits: dataJson.benefits,
        promoCodeUsed: dataJson.promoCodeUsed,
        metadata: dataJson.metadata,
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
  }, []);

  // Helper: does user have a feature
  const hasFeature = useCallback((feature: string): boolean => {
    const { benefits, accessLevel, isVIP } = dashboardAccess;

    if (isVIP || accessLevel === 'vip') return true;
    if (benefits.features && Array.isArray(benefits.features)) {
      return benefits.features.includes(feature);
    }
    return benefits[feature] === true;
  }, [dashboardAccess]);

  // Helper: is current access level
  const isAccessLevel = useCallback((level: 'free' | 'promo' | 'vip'): boolean => {
    return dashboardAccess.accessLevel === level;
  }, [dashboardAccess]);

  // Helper: get human label for current access
  const getAccessLevelLabel = useCallback((): string => {
    const { accessLevel, vipStatus } = dashboardAccess;
    if (accessLevel === 'vip') {
      return `VIP ${vipStatus.vipLevel.charAt(0).toUpperCase() + vipStatus.vipLevel.slice(1)}`;
    }
    if (accessLevel === 'promo') return 'Promo Access';
    return 'Free Access';
  }, [dashboardAccess]);

  // Listen for Supabase auth state changes (login/logout, etc)
  useEffect(() => {
    let isMounted = true;

    // On mount: run initial check
    checkAccess();

    // Auth listener (official)
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      if (session && session.user) {
        checkAccess();
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

    const subscription = data?.subscription;
    return () => {
      isMounted = false;
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, [checkAccess]);

  return {
    ...dashboardAccess,
    checkAccess,
    hasFeature,
    isAccessLevel,
    getAccessLevelLabel
  };
}

// --- Additional hooks ---

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
