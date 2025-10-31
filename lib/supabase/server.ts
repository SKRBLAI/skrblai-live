// lib/supabase/server.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/** Admin (service role) ? SERVER ONLY. Uses Boost keys. */
export function getBoostClientAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL_BOOST;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY_BOOST;
  const missing: string[] = [];
  if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL_BOOST');
  if (!serviceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY_BOOST');

  if (missing.length) {
    const msg = `[boost-supabase] Missing env: ${missing.join(', ')}`;
    if (process.env.NODE_ENV === 'production') throw new Error(msg);
    console.warn(msg);
    return null as any;
  }

  return createClient(url!, serviceKey!, {
    auth: { persistSession: false },
    global: {
      headers: {
        'X-Client-Source': 'boost-admin',
        Authorization: `Bearer ${serviceKey}`,
      },
    },
  });
}

/** Anon (RLS) ? server-side usage that should respect policies. */
export function getBoostClientPublic(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL_BOOST;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_BOOST;
  const missing: string[] = [];
  if (!url) missing.push('NEXT_PUBLIC_SUPABASE_URL_BOOST');
  if (!anonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY_BOOST');

  if (missing.length) {
    const msg = `[boost-supabase] Missing env: ${missing.join(', ')}`;
    if (process.env.NODE_ENV === 'production') throw new Error(msg);
    console.warn(msg);
    return null as any;
  }

  return createClient(url!, anonKey!, {
    auth: { persistSession: false },
    global: { headers: { 'X-Client-Source': 'boost-anon' } },
  });
}

/** Backward-compat surface: map legacy call-sites to Boost. */
export function getServerSupabaseAdminWithVariant(): SupabaseClient {
  if (process.env.NEXT_PUBLIC_FF_USE_BOOST !== '1') {
    const msg = '[boost-supabase] NEXT_PUBLIC_FF_USE_BOOST must be 1.';
    if (process.env.NODE_ENV === 'production') throw new Error(msg);
    console.warn(msg);
    return null as any;
  }
  return getBoostClientAdmin();
}

export function getServerSupabaseAnonWithVariant(): SupabaseClient {
  if (process.env.NEXT_PUBLIC_FF_USE_BOOST !== '1') {
    const msg = '[boost-supabase] NEXT_PUBLIC_FF_USE_BOOST must be 1.';
    if (process.env.NODE_ENV === 'production') throw new Error(msg);
    console.warn(msg);
    return null as any;
  }
  return getBoostClientPublic();
}
