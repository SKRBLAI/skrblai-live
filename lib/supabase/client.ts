"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// MMM: Single-source Supabase env reads (no fallbacks)
// Accepts ONLY NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase: SupabaseClient | null = null;

/** Returns a real Supabase client when public envs are present, otherwise throws. */
export function getBrowserSupabase(): SupabaseClient | null {
  if (supabase) return supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    const missing = [];
    if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!anonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    throw new Error(`[supabase] Missing required environment variables: ${missing.join(', ')}`);
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
    throw error;
  }
}

// Legacy function for backward compatibility - now throws clear error
export function createSafeSupabaseClient() {
  return getBrowserSupabase();
}

// Legacy export for backward compatibility
export default createSafeSupabaseClient;