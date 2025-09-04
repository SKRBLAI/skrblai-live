
'use client';

import { useState, useEffect } from 'react';
import { createSafeSupabaseClient } from '../lib/supabase/client';

export function useDashboardAuth() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const supabase = createSafeSupabaseClient();
    
    if (!supabase || typeof supabase.auth?.getSession !== 'function') {
      console.warn('[Auth] Supabase not configured');
      setUser(null);
      setIsLoading(false);
      return;
    }

    // Get current session on mount
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    }).catch((error: any) => {
      console.warn('[Auth] Session error:', error);
      setUser(null);
      setIsLoading(false);
    });

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  return { user, isLoading };
} 