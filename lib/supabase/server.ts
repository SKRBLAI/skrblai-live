import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Returns a Supabase client for server-side code with SERVICE ROLE permissions.
 * This client bypasses RLS and should ONLY be used in server-side code.
 * NEVER expose this client to the browser.
 */
export function getServerSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.warn('Server Supabase client: Missing URL or service role key');
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
    global: { 
      headers: { 
        'X-Client-Source': 'server-admin',
        'Authorization': `Bearer ${serviceRoleKey}`
      } 
    },
  });
}

/**
 * Returns a Supabase client for server-side code with ANON permissions.
 * This client respects RLS and is safer for general server-side operations.
 */
export function getServerSupabaseAnon(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.warn('Server Supabase client: Missing URL or anon key');
    return null;
  }

  return createClient(url, anonKey, {
    auth: { persistSession: false },
    global: { 
      headers: { 
        'X-Client-Source': 'server-anon'
      } 
    },
  });
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
