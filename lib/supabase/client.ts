"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Supports new Supabase keys: sb_publishable_*, sb_secret_* (and legacy sbp_/sbs_)

let supabase: SupabaseClient | null = null;

/** Returns a real Supabase client when public envs are present, otherwise returns null. Warns in dev only. */
export function getBrowserSupabase(): SupabaseClient | null {
  if (supabase) return supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    // Only warn in development to avoid log spam in production builds
    if (process.env.NODE_ENV === 'development') {
      const missing = [];
      if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL');
      if (!anon) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
      console.warn("[supabase] Missing environment variables:", missing.join(', '));
    }
    return null;
  }

  try {
    supabase = createClient(url, anon, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    return supabase;
  } catch (error) {
    console.error("[supabase] Failed to create client:", error);
    return null;
  }
}

// Legacy function for backward compatibility - returns client or mock
export function createSafeSupabaseClient() {
  const client = getBrowserSupabase();
  
  if (client) {
    return client;
  }
  
  // Return a mock client that prevents build errors
  return {
    from: () => ({
      select: () => ({ data: null, error: new Error('Supabase not configured') }),
      insert: () => ({ data: null, error: new Error('Supabase not configured') }),
      update: () => ({ data: null, error: new Error('Supabase not configured') }),
      delete: () => ({ data: null, error: new Error('Supabase not configured') }),
      upsert: () => ({ data: null, error: new Error('Supabase not configured') }),
    }),
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: new Error('Supabase not configured') }),
      signOut: () => Promise.resolve({ error: new Error('Supabase not configured') }),
      signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        download: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      }),
    },
  } as any;
}

// Legacy export for backward compatibility
export default createSafeSupabaseClient;