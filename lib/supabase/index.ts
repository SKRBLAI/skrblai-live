export {
  getBoostClientAdmin,
  getBoostClientPublic,
  getServerSupabaseAdminWithVariant as getServerSupabaseAdmin,
  getServerSupabaseAnonWithVariant as getServerSupabaseAnon,
  // legacy aliases routed to Boost variants to avoid touching callers
  getServerSupabaseAdminWithVariant as getOptionalServerSupabase,
  getServerSupabaseAdminWithVariant as createServerSupabaseClient,
} from './server';

// if you already have a browser client file, re-export it here:
export * from './client'; // no-op if not present
