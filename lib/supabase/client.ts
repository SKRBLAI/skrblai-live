"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readEnvAny } from "@/lib/env/readEnvAny";

// Supports dual key lookup for Supabase configuration
// Accepts NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (dual-key support)

let supabase: SupabaseClient | null = null;

/** Returns a real Supabase client when public envs are present, otherwise returns null. Warns in dev only. */
export function getBrowserSupabase(): SupabaseClient | null {
  if (supabase) return supabase;

  // Dual key lookup for URL with emergency fallback
  let url = readEnvAny('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL');
  
  // Last resort emergency fallback for production
  if (!url && process.env.NODE_ENV === 'production') {
    console.warn('⚠️ EMERGENCY: Using fallback Supabase URL - check your environment variables!'); 
    url = 'https://zpqavydsinrtaxhowmnb.supabase.co';
  }
  
  // Dual key lookup for anon/publishable key
  let anonKey = readEnvAny(
    'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
    'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 
    'SUPABASE_ANON_KEY'
  );
  
  // Do NOT add the actual key here for security - just detect if we're in emergency mode
  if (!anonKey && process.env.NODE_ENV === 'production' && url) {
    console.warn('⚠️ EMERGENCY: ANON KEY missing in environment - check Railway variables!');
    // The key will still be null, but we'll log a helpful message
  }

  if (!url || !anonKey) {
    // Only warn in development to avoid log spam in production builds
    if (process.env.NODE_ENV === 'development') {
      const missing = [];
      if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL');
      if (!anonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
      console.warn("[supabase] Missing environment variables:", missing.join(', '));
    }
    return null;
  }

  try {
    supabase = createClient(url, anonKey, {
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