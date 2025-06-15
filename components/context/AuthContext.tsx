'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
// Assuming your Supabase client instance is exported from here:
import { supabase } from '@/utils/supabase'; // IMPORTANT: Adjust this path if your Supabase client is elsewhere

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signInWithOAuth: (provider: 'google') => Promise<{ success: boolean; error?: string }>;
  signInWithOtp: (email: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string; needsEmailConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    console.log('[AUTH] Initializing AuthProvider');
    setIsLoading(true);
    // Check initial session state on component mount
    supabase.auth.getSession().then(({ data: { session: initialSession }, error: sessionError }) => {
      if (sessionError) {
        console.error('[AUTH] Error getting session:', sessionError);
        setError(sessionError.message);
        setIsLoading(false);
        return;
      }

      console.log('[AUTH] Session check:', initialSession ? 'Active session found' : 'No active session');
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setIsLoading(false);

      // Then, set up the onAuthStateChange listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, currentSession) => {
          console.log('[AUTH] Auth state change:', event, currentSession ? 'session exists' : 'no session');
          
          // Update state based on auth event
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          // Log the auth event for debugging
          if (event === 'SIGNED_IN') {
            console.log('[AUTH] User signed in:', currentSession?.user?.email);
          } else if (event === 'SIGNED_OUT') {
            console.log('[AUTH] User signed out');
          } else if (event === 'TOKEN_REFRESHED') {
            console.log('[AUTH] Token refreshed');
          }
          
          // Ensure loading is false after any auth state change
          if (isLoading) setIsLoading(false);
        }
      );

      return () => {
        subscription?.unsubscribe();
      };
    }).catch((err) => {
        console.error('[AUTH] Unexpected error in getSession:', err);
        setError('Failed to initialize authentication');
        setIsLoading(false);
    });
  // The empty dependency array ensures this effect runs only once on mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sign in with email/password
  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      console.log('[AUTH] Attempting sign-in for:', email);
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('[AUTH] Sign-in error:', signInError);
        setError(signInError.message);
        return { success: false, error: signInError.message };
      }
      
      // Log successful sign-in
      if (data.user) {
        console.log('[AUTH] Sign-in successful for:', data.user.email);
        
        // Update local state immediately to ensure UI updates
        setUser(data.user);
        setSession(data.session);
        
        await supabase.from('auth_events').insert({
          user_id: data.user.id,
          event_type: 'sign_in',
          provider: 'email',
          details: { email: data.user.email }
        });
      }

      return { success: true };
    } catch (err: any) {
      console.error('[AUTH] Sign-in exception:', err);
      setError(err.message || 'An unexpected error occurred');
      return { success: false, error: err.message || 'An unexpected error occurred' };
    }
  };

  // Sign in with OAuth
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

  // Sign in with OTP (magic link)
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

  // Sign up with email/password
  const signUp = async (email: string, password: string) => {
    try {
      setError(null);
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (signUpError) {
        console.error('[AUTH] Sign-up error:', signUpError);
        setError(signUpError.message);
        return { success: false, error: signUpError.message };
      }
      
      const needsEmailConfirmation = !data.session;
      
      // Log successful sign-up
      if (data.user) {
        console.log('[AUTH] Sign-up successful for:', data.user.email);
        await supabase.from('auth_events').insert({
          user_id: data.user.id,
          event_type: 'sign_up',
          provider: 'email',
          details: { email: data.user.email }
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

  // Sign out function available in context
  const signOut = async () => {
    try {
      console.log('[AUTH] Signing out user');
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      router.push('/sign-in');
    } catch (err: any) {
      console.error('[AUTH] Sign out error:', err);
      setError(err.message || 'Failed to sign out');
      toast.error('Failed to sign out. Please try again.');
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signInWithOAuth,
    signInWithOtp,
    signUp,
    signOut,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
