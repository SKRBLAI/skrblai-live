"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function requireEnv(keys: string[]): void {
  const missing = keys.filter(k => !process.env[k]);
  if (missing.length) {
    const msg = `[boost-supabase-client] Missing env: ${missing.join(', ')}`;
    if (process.env.NODE_ENV === 'production') throw new Error(msg);
    console.warn(msg);
  }
}

let supabase: SupabaseClient | null = null;

/** 
 * Returns a Supabase client for browser/client-side usage with Boost env vars.
 * Uses persistSession: true for browser session management.
 * This function reads env vars at call time (not import time), safe for build.
 * 
 * In production: throws on missing env vars
 * In development: returns null on missing env vars to avoid build-time crashes
 */
export function getBrowserSupabase(): SupabaseClient | null {
  if (supabase) return supabase;

  requireEnv(['NEXT_PUBLIC_SUPABASE_URL_BOOST', 'NEXT_PUBLIC_SUPABASE_ANON_KEY_BOOST']);
  
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL_BOOST!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_BOOST!;

  if (!url || !anonKey) {
    return null;
  }

  try {
    supabase = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      global: {
        headers: {
          'X-Client-Source': 'boost-browser'
        }
      }
    });
    return supabase;
  } catch (error) {
    console.error("[boost-supabase-client] Failed to create client:", error);
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
    return null;
  }
}

// Legacy function for backward compatibility
export function createSafeSupabaseClient() {
  return getBrowserSupabase();
}

// Legacy export for backward compatibility
export default createSafeSupabaseClient;
