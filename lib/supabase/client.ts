"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// MMM: Single-source Supabase env reads (no fallbacks)
// Accepts ONLY NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
// IMPORTANT: Env vars are read ONLY when the factory function is called (lazy),
// not at module import time, to prevent build-time crashes.

let supabase: SupabaseClient | null = null;

/** 
 * Returns a real Supabase client when public envs are present.
 * This function reads env vars at call time (not import time), so it's safe to
 * import this module even when env vars are missing during build.
 * 
 * In production: throws on missing env vars
 * In development: returns null on missing env vars to avoid build-time crashes
 */
export function getBrowserSupabase(): SupabaseClient | null {
  if (supabase) return supabase;

  // Lazy env read - happens only when function is called, not at import
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    const missing = [];
    if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!anonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    
    // During build time, always return null (Clerk-only migration support)
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || process.env.NEXT_PHASE === 'phase-export';
    if (isBuildTime) {
      console.warn('[supabase] Build time: Missing Supabase env vars, returning null (Clerk-only mode)');
      return null;
    }
    
    // In production runtime, throw to catch misconfigurations early
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`[supabase] Missing required environment variables: ${missing.join(', ')}`);
    }
    
    // In development/build, return null to avoid build-time crashes
    console.warn(`[supabase] Missing environment variables: ${missing.join(', ')}. Returning null.`);
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
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
    return null;
  }
}

// Legacy function for backward compatibility - now throws clear error
export function createSafeSupabaseClient() {
  return getBrowserSupabase();
}

// Legacy export for backward compatibility
export default createSafeSupabaseClient;
