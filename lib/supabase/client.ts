"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabase: SupabaseClient | null = null;

/** Returns a real Supabase client when public envs are present, otherwise null (no-op mode). */
export function getBrowserSupabase(): SupabaseClient | null {
  if (supabase) return supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[supabase] Missing NEXT_PUBLIC_SUPABASE_URL/ANON_KEY; browser auth disabled."
      );
    }
    return null;
  }

  supabase = createClient(url, anon);
  return supabase;
}

// Legacy function for backward compatibility - now creates client safely
export function createSafeSupabaseClient() {
  try {
    return getBrowserSupabase();
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    
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
}

// Legacy export for backward compatibility
export default createSafeSupabaseClient;