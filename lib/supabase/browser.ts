import { createClient, SupabaseClient } from '@supabase/supabase-js';

function requireEnv(keys: string[]): void {
  const missing = keys.filter(k => !process.env[k]);
  if (missing.length) {
    const msg = `[boost-supabase-browser] Missing env: ${missing.join(', ')}`;
    if (process.env.NODE_ENV === 'production') throw new Error(msg);
    console.warn(msg);
  }
}

/**
 * Browser-safe Supabase client factory using Boost env vars.
 * ONLY uses anon key (never service role key).
 * This client is safe to use in client-side components.
 * Env vars are read lazily at call time, not import time.
 */
export function createBrowserSupabaseClient(): SupabaseClient | null {
  requireEnv(['NEXT_PUBLIC_SUPABASE_URL_BOOST', 'NEXT_PUBLIC_SUPABASE_ANON_KEY_BOOST']);
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_BOOST!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_BOOST!;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  try {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      global: {
        headers: {
          'X-Client-Source': 'boost-browser'
        }
      }
    });
  } catch (error) {
    console.error('[boost-supabase-browser] Failed to create client:', error);
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
    return null;
  }
}

// Default export for convenience
export default createBrowserSupabaseClient;
