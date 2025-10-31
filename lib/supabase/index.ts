// lib/supabase/index.ts
export {
  getBoostClientAdmin,
  getBoostClientPublic,
  getServerSupabaseAdminWithVariant as getServerSupabaseAdmin,
  getServerSupabaseAnonWithVariant as getServerSupabaseAnon,
  // Historical aliases used in older code:
  getServerSupabaseAdminWithVariant as getOptionalServerSupabase,
  getServerSupabaseAdminWithVariant as createServerSupabaseClient,
} from './server';

// Browser client (for client-side components)
export { getBrowserSupabase } from './client';
