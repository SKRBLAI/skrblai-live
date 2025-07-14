'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  accessLevel?: 'free' | 'promo' | 'vip';
  vipStatus?: any;
  benefits?: any;
  signIn: (email: string, password: string, options?: { promoCode?: string; vipCode?: string; marketingConsent?: boolean }) => Promise<{ success: boolean; error?: string }>;
  signInWithOAuth: (provider: 'google') => Promise<{ success: boolean; error?: string }>;
  signInWithOtp: (email: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, options?: { promoCode?: string; vipCode?: string; marketingConsent?: boolean }) => Promise<{ success: boolean; error?: string; needsEmailConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  error: string | null;
  validatePromoCode: (code: string) => Promise<{ isValid: boolean; type: 'PROMO' | 'VIP'; benefits: any; error?: string }>;
  // NEW: Percy onboarding fields
  isEmailVerified: boolean;
  onboardingComplete: boolean;
  setOnboardingComplete: (complete: boolean) => void;
  shouldShowOnboarding: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessLevel, setAccessLevel] = useState<'free' | 'promo' | 'vip'>('free');
  const [vipStatus, setVipStatus] = useState<any>(null);
  const [benefits, setBenefits] = useState<any>(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  // NEW: Percy onboarding state
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [onboardingComplete, setOnboardingCompleteState] = useState(false);

  // Computed property for whether to show onboarding
  const shouldShowOnboarding = !isEmailVerified && !onboardingComplete;

  // NEW: Function to update onboarding completion
  const setOnboardingComplete = useCallback((complete: boolean) => {
    setOnboardingCompleteState(complete);
    // Store in localStorage for persistence
    if (complete) {
      localStorage.setItem('percyOnboardingComplete', 'true');
    } else {
      localStorage.removeItem('percyOnboardingComplete');
    }
  }, []);

  // NEW: Function to check if user email is verified
  const checkEmailVerification = useCallback((currentUser: User | null) => {
    if (!currentUser) {
      setIsEmailVerified(false);
      return;
    }
    
    // Check if user has email_confirmed_at (Supabase email verification)
    const emailConfirmed = currentUser.email_confirmed_at != null;
    setIsEmailVerified(emailConfirmed);
    
    // If email is verified, onboarding should be complete
    if (emailConfirmed) {
      setOnboardingComplete(true);
    }
  }, [setOnboardingComplete]);

  // NEW: Initialize onboarding state from localStorage
  useEffect(() => {
    const savedOnboardingComplete = localStorage.getItem('percyOnboardingComplete');
    if (savedOnboardingComplete === 'true') {
      setOnboardingCompleteState(true);
    }
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log('[AUTH] Auth state change:', event);
      if (currentSession) {
        setUser(currentSession.user);
        setSession(currentSession);
        // NEW: Check email verification status
        checkEmailVerification(currentSession.user);
      } else {
        setUser(null);
        setSession(null);
        setIsEmailVerified(false);
        // Don't reset onboarding completion on logout - user might return
      }
      setIsLoading(false);
    });

    const initializeAuth = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      if (initialSession) {
        setUser(initialSession.user);
        setSession(initialSession);
      }
      setIsLoading(false);
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, checkEmailVerification]);

  // Add dashboard access check on auth state change
  useEffect(() => {
    const checkDashboardAccess = async () => {
      if (user && session) {
        try {
          const response = await fetch('/api/auth/dashboard-signin?checkAccess=true', {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          });
          
          const result = await response.json();
          if (result.success) {
            setAccessLevel(result.accessLevel);
            setVipStatus(result.vipStatus);
            setBenefits(result.benefits);
          }
        } catch (err) {
          console.error('[AUTH] Failed to check dashboard access:', err);
        }
      }
    };

    checkDashboardAccess();
  }, [user, session]);

  const signIn = async (email: string, password: string, options?: { promoCode?: string; vipCode?: string; marketingConsent?: boolean }) => {
    try {
      setError(null);
      
      // Get client IP and user agent for logging
      const metadata = {
        userAgent: window.navigator.userAgent,
        ip: await fetch('https://api.ipify.org?format=json').then(r => r.json()).then(data => data.ip)
      };

      // Step 1: Authenticate with Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('[AUTH] Sign-in error:', signInError);
        setError(signInError.message);
        return { success: false, error: signInError.message };
      }

      // Step 2: If authentication successful, handle dashboard-specific features
      if (data.user) {
        console.log('[AUTH] Sign-in successful for:', data.user.email);
        
        // Update local state
        setUser(data.user);
        setSession(data.session);

        // Call dashboard-signin endpoint for additional features
        const dashboardResponse = await fetch('/api/auth/dashboard-signin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.session?.access_token}`
          },
          body: JSON.stringify({
            email,
            password,
            promoCode: options?.promoCode,
            vipCode: options?.vipCode,
            marketingConsent: options?.marketingConsent
          })
        });

        const dashboardResult = await dashboardResponse.json();
        
        if (dashboardResult.success) {
          // Update context with dashboard access info
          setAccessLevel(dashboardResult.accessLevel);
          setVipStatus(dashboardResult.vipStatus);
          setBenefits(dashboardResult.benefits);
        } else {
          console.warn('[AUTH] Dashboard features setup warning:', dashboardResult.error);
          // Don't fail the sign-in if dashboard features fail
        }
        
        // Log the sign-in event
        await supabase.from('auth_events').insert({
          user_id: data.user.id,
          event_type: 'sign_in',
          provider: 'email',
          details: { 
            email: data.user.email,
            accessLevel: dashboardResult.accessLevel,
            promoRedeemed: dashboardResult.promoRedeemed
          }
        });
      }

      return { success: true };
    } catch (err: any) {
      console.error('[AUTH] Sign-in exception:', err);
      setError(err.message || 'An unexpected error occurred');
      return { success: false, error: err.message || 'An unexpected error occurred' };
    }
  };

  const signInWithOAuth = async (provider: 'google') => {
    try {
      setError(null);
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (oauthError) {
        console.error('[AUTH] OAuth sign-in error:', oauthError);
        setError(oauthError.message);
        return { success: false, error: oauthError.message };
      }
      
      return { success: true };
    } catch (err: any) {
      console.error('[AUTH] OAuth sign-in exception:', err);
      setError(err.message || 'An unexpected error occurred');
      return { success: false, error: err.message || 'An unexpected error occurred' };
    }
  };

  const signInWithOtp = async (email: string) => {
    try {
      setError(null);
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (otpError) {
        console.error('[AUTH] Magic link error:', otpError);
        setError(otpError.message);
        return { success: false, error: otpError.message };
      }
      
      return { success: true };
    } catch (err: any) {
      console.error('[AUTH] Magic link exception:', err);
      setError(err.message || 'An unexpected error occurred');
      return { success: false, error: err.message || 'An unexpected error occurred' };
    }
  };

  const signUp = async (email: string, password: string, options?: { promoCode?: string; vipCode?: string; marketingConsent?: boolean }) => {
    try {
      setError(null);
      
      // Get client IP and user agent for logging
      const metadata = {
        userAgent: window.navigator.userAgent,
        ip: await fetch('https://api.ipify.org?format=json').then(r => r.json()).then(data => data.ip)
      };

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          ...options
        }
      });
      
      if (signUpError) {
        console.error('[AUTH] Sign-up error:', signUpError);
        setError(signUpError.message);
        return { success: false, error: signUpError.message };
      }
      
      const needsEmailConfirmation = !data.session;
      
      // Register with dashboard if email confirmation not required
      if (data.user && data.session) {
        console.log('[AUTH] Sign-up successful for:', data.user.email);
        
        // Call dashboard registration endpoint
        const dashboardResponse = await fetch('/api/auth/dashboard-signin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${data.session.access_token}`
          },
          body: JSON.stringify({
            email,
            password,
            promoCode: options?.promoCode,
            vipCode: options?.vipCode,
            marketingConsent: options?.marketingConsent,
            mode: 'signup'
          })
        });

        const dashboardResult = await dashboardResponse.json();
        
        if (dashboardResult.success) {
          setAccessLevel(dashboardResult.accessLevel);
          setVipStatus(dashboardResult.vipStatus);
          setBenefits(dashboardResult.benefits);
        }
        
        // Log successful sign-up
        await supabase.from('auth_events').insert({
          user_id: data.user.id,
          event_type: 'sign_up',
          provider: 'email',
          details: { 
            email: data.user.email,
            accessLevel: dashboardResult.accessLevel,
            promoRedeemed: dashboardResult.promoRedeemed,
            marketingConsent: options?.marketingConsent
          }
        });
      }
      
      return { 
        success: true, 
        needsEmailConfirmation 
      };
    } catch (err: any) {
      console.error('[AUTH] Sign-up exception:', err);
      setError(err.message || 'An unexpected error occurred');
      return { success: false, error: err.message || 'An unexpected error occurred' };
    }
  };

  const signOut = async () => {
    try {
      console.log('[AUTH] Signing out user');
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      router.push('/');
    } catch (err: any) {
      console.error('[AUTH] Sign-out exception:', err);
      setError(err.message || 'Failed to sign out');
      toast.error('Failed to sign out. Please try again.');
    }
  };

  const validatePromoCode = async (code: string) => {
    try {
      const { data, error: validateError } = await supabase.from('promo_codes').select('*').eq('code', code);

      if (validateError) {
        console.error('[AUTH] Promo code validation error:', validateError);
        return { isValid: false, type: 'PROMO' as const, benefits: null, error: validateError.message };
      }

      if (data.length > 0) {
        const promoCode = data[0];
        return {
          isValid: true,
          type: promoCode.type as 'PROMO' | 'VIP',
          benefits: promoCode.benefits,
          error: undefined
        };
      } else {
        return { isValid: false, type: 'PROMO' as const, benefits: null, error: 'Promo code not found' };
      }
    } catch (err: any) {
      console.error('[AUTH] Promo code validation exception:', err);
      return { isValid: false, type: 'PROMO' as const, benefits: null, error: err.message || 'An unexpected error occurred' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        accessLevel,
        vipStatus,
        benefits,
        signIn,
        signInWithOAuth,
        signInWithOtp,
        signUp,
        signOut,
        error,
        validatePromoCode,
        isEmailVerified,
        onboardingComplete,
        setOnboardingComplete,
        shouldShowOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
