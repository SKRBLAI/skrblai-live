'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

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
  const supabase = createClientComponentClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log('[AUTH] Auth state change:', event);
      if (currentSession) {
        setUser(currentSession.user);
        setSession(currentSession);
      } else {
        setUser(null);
        setSession(null);
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
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
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
        
        // Update local state
        setUser(data.user);
        setSession(data.session);
        
        // Log the sign-in event
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

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signIn,
        signInWithOAuth,
        signInWithOtp,
        signUp,
        signOut,
        error,
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
