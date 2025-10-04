/** MMM: Canonical Supabase client exports. Single source of truth for all Supabase client access. */

// Browser client (for client-side components)
export { getBrowserSupabase } from './client';

// Server clients (for API routes and server-side code)
export { getServerSupabaseAnon } from './server';
export { getServerSupabaseAdmin } from './server';

// Legacy exports for backward compatibility (deprecated)
export { 
  createSafeSupabaseClient,
  getOptionalServerSupabase,
  createServerSupabaseClient 
} from './server';

/**
 * Usage Guide:
 * 
 * Browser Components:
 *   import { getBrowserSupabase } from '@/lib/supabase';
 *   const supabase = getBrowserSupabase();
 *   if (!supabase) return; // Handle null case
 * 
 * Server API Routes (Admin):
 *   import { getServerSupabaseAdmin } from '@/lib/supabase';
 *   const supabase = getServerSupabaseAdmin();
 *   if (!supabase) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
 * 
 * Server API Routes (RLS-respecting):
 *   import { getServerSupabaseAnon } from '@/lib/supabase';
 *   const supabase = getServerSupabaseAnon();
 *   if (!supabase) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
 */