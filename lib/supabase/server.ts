import { createClient, SupabaseClient } from '@supabase/supabase-js';

function requireEnv(keys: string[]): void {
  const missing = keys.filter(k => !process.env[k]);
  if (missing.length) {
    const msg = `[boost-supabase] Missing env: ${missing.join(', ')}`;
    if (process.env.NODE_ENV === 'production') throw new Error(msg);
    console.warn(msg);
  }
}

export function getBoostClientAdmin(): SupabaseClient | null {
  requireEnv(['NEXT_PUBLIC_SUPABASE_URL_BOOST', 'SUPABASE_SERVICE_ROLE_KEY_BOOST']);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL_BOOST!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY_BOOST!;
  if (!url || !serviceKey) return null as any;

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
    global: {
      headers: {
        'X-Client-Source': 'boost-admin',
        'Authorization': `Bearer ${serviceKey}`,
      },
    },
  });
}

export function getBoostClientPublic(): SupabaseClient | null {
  requireEnv(['NEXT_PUBLIC_SUPABASE_URL_BOOST', 'NEXT_PUBLIC_SUPABASE_ANON_KEY_BOOST']);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL_BOOST!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_BOOST!;
  if (!url || !anonKey) return null as any;

  return createClient(url, anonKey, {
    auth: { persistSession: false },
    global: {
      headers: { 'X-Client-Source': 'boost-anon' },
    },
  });
}

/** Back-compat shims that ONLY work when Boost flag is ON */
export function getServerSupabaseAdminWithVariant(): SupabaseClient | null {
  if (process.env.NEXT_PUBLIC_FF_USE_BOOST !== '1') {
    const msg = '[boost-supabase] NEXT_PUBLIC_FF_USE_BOOST must be 1.';
    if (process.env.NODE_ENV === 'production') throw new Error(msg);
    console.warn(msg);
    return null;
  }
  return getBoostClientAdmin();
}

export function getServerSupabaseAnonWithVariant(): SupabaseClient | null {
  if (process.env.NEXT_PUBLIC_FF_USE_BOOST !== '1') {
    const msg = '[boost-supabase] NEXT_PUBLIC_FF_USE_BOOST must be 1.';
    if (process.env.NODE_ENV === 'production') throw new Error(msg);
    console.warn(msg);
    return null;
  }
  return getBoostClientPublic();
}
