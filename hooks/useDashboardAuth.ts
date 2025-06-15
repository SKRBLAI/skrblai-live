'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/context/AuthContext';
import { supabase } from '@/utils/supabase';
import toast from 'react-hot-toast';
import type { User } from '@supabase/supabase-js';

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
  const { user: authUser, session: authSession, isLoading: authIsLoading } = useAuth();
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
    loading: true,
    error: null
  });

  // Fetches current access state from API
  const checkAccess = useCallback(async () => {
    if (!authUser || !authSession?.access_token) {
      setDashboardAccess(prev => ({
        ...prev,
        user: null,
        loading: false,
        error: 'No active authenticated session'
      }));
      return;
    }
    try {
      setDashboardAccess(prev => ({ ...prev, loading: true, error: null }));
      console.log('[DASHBOARD_AUTH] Checking access for user:', authUser.email);

      // Check dashboard access with API (pass token)
      const response = await fetch('/api/auth/dashboard-signin?checkAccess=true', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authSession.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[DASHBOARD_AUTH] API error (${response.status}):`, errorText);
        
        // If we get a 401 Unauthorized, provide fallback access
        if (response.status === 401) {
          console.log('[DASHBOARD_AUTH] Using fallback access due to 401 error');
          
          // Provide fallback access with basic permissions
          setDashboardAccess(prev => ({
            ...prev,
            user: authUser,
            accessLevel: 'free',
            isVIP: false,
            vipStatus: { isVIP: false, vipLevel: 'standard' },
            benefits: { features: [] },
            promoCodeUsed: null,
            metadata: {},
            loading: false,
            error: null
          }));
          return;
        }
        
        throw new Error(`API error (${response.status}): ${errorText}`);
      }

      const dataJson = await response.json();

      if (!dataJson.success) {
        // If the API returns an error but the request was successful,
        // still provide fallback access
        console.log('[DASHBOARD_AUTH] API returned error but providing fallback access:', dataJson.error);
        
        setDashboardAccess(prev => ({
          ...prev,
          user: authUser,
          accessLevel: 'free',
          isVIP: false,
          vipStatus: { isVIP: false, vipLevel: 'standard' },
          benefits: { features: [] },
          promoCodeUsed: null,
          metadata: {},
          loading: false,
          error: null
        }));
        return;
      }

      console.log('[DASHBOARD_AUTH] Access check successful:', {
        level: dataJson.accessLevel,
        isVIP: dataJson.isVIP,
        features: Object.keys(dataJson.benefits?.features || {}).length
      });

      setDashboardAccess(prev => ({
        ...prev,
        user: authUser,
        accessLevel: dataJson.accessLevel,
        isVIP: dataJson.isVIP,
        vipStatus: dataJson.vipStatus,
        benefits: dataJson.benefits || { features: [] },
        promoCodeUsed: dataJson.promoCodeUsed,
        metadata: dataJson.metadata || {},
        loading: false,
        error: null
      }));

    } catch (error: any) {
      console.error('[DASHBOARD_AUTH] Access check failed:', error);
      
      // Instead of showing an error, provide fallback access
      console.log('[DASHBOARD_AUTH] Using fallback access due to error');
      
      setDashboardAccess(prev => ({
        ...prev,
        user: authUser,
        accessLevel: 'free',
        isVIP: false,
        vipStatus: { isVIP: false, vipLevel: 'standard' },
        benefits: { features: [] },
        promoCodeUsed: null,
        metadata: {},
        loading: false,
        error: null
      }));
    }
  }, [authUser, authSession]);

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
      return;
    }
    
    if (authUser && authSession) {
      console.log('[DASHBOARD_AUTH] Auth state updated, user is authenticated');
      // If auth context has loaded and user is authenticated, check access
      checkAccess();

      // Log sign-in event if it hasn't been logged for this session
      if (!loginEventLogged && authUser) {
        const provider = authUser.app_metadata?.provider;
        // Don't log for email provider, as it's handled on the sign-in page
        if (provider && provider !== 'email') {
          supabase.from('auth_events').insert({
            user_id: authUser.id,
            event_type: 'sign_in',
            provider: provider,
            details: { email: authUser.email }
          }).then(({ error }) => {
            if (error) {
              console.error('[DASHBOARD_AUTH] Failed to log sign-in event:', error);
            }
          });
        }
        setLoginEventLogged(true);
      }
    } else {
      console.log('[DASHBOARD_AUTH] Auth state updated, no authenticated user');
      // If auth context has loaded and no user/session, set dashboardAccess accordingly
      setDashboardAccess({
        user: null, 
        accessLevel: 'free', 
        isVIP: false, 
        vipStatus: { isVIP: false, vipLevel: 'standard' },
        benefits: {}, 
        promoCodeUsed: null, 
        metadata: {}, 
        loading: false, 
        error: null
      });
      setLoginEventLogged(false); // Reset when user signs out
    }
  }, [authUser, authSession, authIsLoading, checkAccess, loginEventLogged]);

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
