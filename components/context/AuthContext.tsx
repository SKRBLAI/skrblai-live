'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
// Assuming your Supabase client instance is exported from here:
import { supabase } from '@/utils/supabase'; // IMPORTANT: Adjust this path if your Supabase client is elsewhere

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    // Check initial session state on component mount
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setIsLoading(false);

      // Then, set up the onAuthStateChange listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, currentSession) => {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          // Ensure loading is false after any auth state change
          // (though it should already be false from getSession)
          if (isLoading) setIsLoading(false);
        }
      );

      return () => {
        subscription?.unsubscribe();
      };
    }).catch(() => {
        // Handle error in getSession if necessary
        setIsLoading(false);
    });
  // The empty dependency array ensures this effect runs only once on mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sign out function available in context
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signOut,
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
