import { createClient, SupabaseClient } from '@supabase/supabase-js';

// MMM: Single-source Supabase env reads (no fallbacks)
// Accepts ONLY NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY
// IMPORTANT: Env vars are read ONLY when the factory functions are called (lazy),
// not at module import time, to prevent build-time crashes.

// Cached clients to avoid recreation
let adminClient: SupabaseClient | null = null;
let anonClient: SupabaseClient | null = null;

/**
 * Returns a Supabase client for server-side code with SERVICE ROLE permissions.
 * This client bypasses RLS and should ONLY be used in server-side code.
 * NEVER expose this client to the browser.
 * Env vars are read lazily at call time, not import time.
 * 
 * In production: throws on missing env vars
 * In development/build: returns null to avoid build-time crashes
 * @deprecated Use getServerSupabaseAdmin(variant) instead
 */
export function getServerSupabaseAdminLegacy(): SupabaseClient | null {
  if (adminClient) return adminClient;

  // Lazy env read - happens only when function is called, not at import
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !serviceKey) {
    const missing = [];
    if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL');
    if (!serviceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
    
    // During build time, always return null (Clerk-only migration support)
    const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || process.env.NEXT_PHASE === 'phase-export';
    if (isBuildTime) {
      console.warn('[server-supabase] Build time: Missing Supabase env vars, returning null (Clerk-only mode)');
      return null;
    }
    
    // In production runtime, throw to catch misconfigurations early
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`[server-supabase] Missing required environment variables: ${missing.join(', ')}`);
    }
    
    // In development, warn and return null
    console.warn('[server-supabase] Missing environment variables:', missing.join(', '));
    return null;
  }

  try {
    adminClient = createClient(url, serviceKey, {
      auth: { persistSession: false },
      global: { 
        headers: { 
          'X-Client-Source': 'server-admin',
          'Authorization': `Bearer ${serviceKey}`
        } 
      },
    });
    return adminClient;
  } catch (error) {
    console.error('[server-supabase] Failed to create admin client:', error);
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
    return null;
  }
}

/**
 * Returns a Supabase client for server-side code with ANON permissions.
 * This client respects RLS and is safer for general server-side operations.
 * Env vars are read lazily at call time, not import time.
 * 
 * In production: throws on missing env vars
 * In development/build: returns null to avoid build-time crashes
 * @deprecated Use getServerSupabaseAnon(variant) instead
 */
export function getServerSupabaseAnonLegacy(): SupabaseClient | null {
  if (anonClient) return anonClient;

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
      console.warn('[server-supabase] Build time: Missing Supabase env vars, returning null (Clerk-only mode)');
      return null;
    }
    
    // In production runtime, throw to catch misconfigurations early
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`[server-supabase] Missing required environment variables: ${missing.join(', ')}`);
    }
    
    // In development, warn and return null
    console.warn('[server-supabase] Missing environment variables for anon client:', missing.join(', '));
    return null;
  }

  try {
    anonClient = createClient(url, anonKey, {
      auth: { persistSession: false },
      global: { 
        headers: { 
          'X-Client-Source': 'server-anon'
        } 
      },
    });
    return anonClient;
  } catch (error) {
    console.error('[server-supabase] Failed to create anon client:', error);
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
    return null;
  }
}

/**
 * Backward compatibility functions
 */
export function getServerSupabaseAdmin(variant?: 'legacy'): SupabaseClient | null {
  // Boost support removed: single Supabase project only.
  return getServerSupabaseAdminLegacy();
}

export function getServerSupabaseAnon(variant?: 'legacy'): SupabaseClient | null {
  // Boost support removed: single Supabase project only.
  return getServerSupabaseAnonLegacy();
}

/**
 * Legacy function - returns admin client for backwards compatibility
 * @deprecated Use getServerSupabaseAdmin() or getServerSupabaseAnon() instead
 */
export function getOptionalServerSupabase(): SupabaseClient | null {
  return getServerSupabaseAdmin();
}

/** Convenience: throw an explicit error if missing (use only if you catch it). */
export function requireServerSupabase(): SupabaseClient {
  const c = getOptionalServerSupabase();
  if (!c) throw new Error('Supabase not configured on server (missing URL/KEY envs).');
  return c;
}

/**
 * Create a server-side Supabase client (alias for getServerSupabaseAdmin)
 * Used by API routes that need service role access
 * @deprecated Use getServerSupabaseAdmin() directly and handle null returns
 */
export function createServerSupabaseClient(): SupabaseClient {
  const client = getServerSupabaseAdmin();
  if (!client) {
    throw new Error('Failed to create server Supabase client - check environment variables');
  }
  return client;
}
