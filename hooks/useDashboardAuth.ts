'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/context/AuthContext'; // ++ Import useAuth
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
  const { user: authUser, session: authSession, isLoading: authIsLoading } = useAuth(); // ++ Use AuthContext
  const [loginEventLogged, setLoginEventLogged] = useState(false);
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
    loading: true, // This will be managed based on authIsLoading and checkAccess
    error: null
  });

  // Fetches current access state from API
  // Fetches current access state from API
  const checkAccess = useCallback(async (): Promise<void> => {
    if (!authUser || !authSession?.access_token) { // ++ Check authUser and token from context
      setDashboardAccess(prev => ({
        ...prev,
        user: null,
        loading: false, // Not loading if no authenticated user
        error: 'No active authenticated session'
      }));
      return;
    }
    try {
      setDashboardAccess(prev => ({ ...prev, loading: true, error: null }));

      // Check dashboard access with API (pass token)
      const response = await fetch('/api/auth/dashboard-signin?checkAccess=true', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authSession.access_token}`, // ++ Use token from context's session
          'Content-Type': 'application/json',
        },
      });

      const dataJson = await response.json();

      if (!dataJson.success) {
        throw new Error(dataJson.error || 'Failed to check access');
      }

      setDashboardAccess(prev => ({
        ...prev,
        user: authUser, // ++ Set user from context
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
        error: error.message || 'Unknown error during access check'
      }));
    }
  }, [authUser, authSession]); // ++ Add authUser and authSession as dependencies

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

  // Effect to react to changes in auth state from AuthContext
  useEffect(() => {
    if (authIsLoading) {
      // If auth context is still loading, reflect this in dashboardAccess
      setDashboardAccess(prev => ({ ...prev, user: null, loading: true }));
    } else if (authUser && authSession) {
      // If auth context has loaded and user is authenticated, check access
      checkAccess();

      // Log sign-in event if it hasn't been logged for this session
      if (!loginEventLogged) {
        const provider = authUser.app_metadata.provider;
        // Don't log for email provider, as it's handled on the sign-in page
        if (provider && provider !== 'email') {
          supabase.from('auth_events').insert({
            user_id: authUser.id,
            event_type: 'sign_in',
            provider: provider,
            details: { email: authUser.email }
          }).then(({ error }) => {
            if (error) {
              console.error('[useDashboardAuth] Failed to log sign-in event:', error);
            }
          });
        }
        setLoginEventLogged(true);
      }
    } else {
      // If auth context has loaded and no user/session, set dashboardAccess accordingly
      setDashboardAccess({
        user: null, accessLevel: 'free', isVIP: false, vipStatus: { isVIP: false, vipLevel: 'standard' },
        benefits: {}, promoCodeUsed: null, metadata: {}, loading: false, error: null
      });
      setLoginEventLogged(false); // Reset when user signs out
    }
  }, [authUser, authSession, authIsLoading, checkAccess, loginEventLogged]); // ++ Depend on context values

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
