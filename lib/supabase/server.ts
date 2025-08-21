import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Returns a Supabase client for server-side code or null if not configured.
 * NEVER throws during import/build; only returns null when envs missing.
 * Call this INSIDE route handlers and handle null gracefully.
 */
export function getOptionalServerSupabase(): SupabaseClient | null {
  const url =
    process.env.SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? // fallback if only public vars exist
    '';

  // Prefer service role on server, fall back to anon/public if that's all we have
  const key =
    process.env.SUPABASE_SERVICE_ROLE ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    '';

  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false },
    global: { headers: { 'X-Client-Source': 'server' } },
  });
}

/** Convenience: throw an explicit error if missing (use only if you catch it). */
export function requireServerSupabase(): SupabaseClient {
  const c = getOptionalServerSupabase();
  if (!c) throw new Error('Supabase not configured on server (missing URL/KEY envs).');
  return c;
}
