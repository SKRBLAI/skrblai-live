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
 */
export function getServerSupabaseAdmin(): SupabaseClient | null {
  if (adminClient) return adminClient;

  // Lazy env read - happens only when function is called, not at import
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !serviceKey) {
    if (process.env.NODE_ENV === 'development') {
      const missing = [];
      if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL');
      if (!serviceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
      console.warn('[server-supabase] Missing environment variables:', missing.join(', '));
    }
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
    return null;
  }
}

/**
 * Returns a Supabase client for server-side code with ANON permissions.
 * This client respects RLS and is safer for general server-side operations.
 * Env vars are read lazily at call time, not import time.
 */
export function getServerSupabaseAnon(): SupabaseClient | null {
  if (anonClient) return anonClient;

  // Lazy env read - happens only when function is called, not at import
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !anonKey) {
    if (process.env.NODE_ENV === 'development') {
      const missing = [];
      if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL');
      if (!anonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
      console.warn('[server-supabase] Missing environment variables for anon client:', missing.join(', '));
    }
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
    return null;
  }
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
