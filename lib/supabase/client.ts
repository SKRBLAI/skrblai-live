/**
 * @deprecated This file is deprecated. Use the proper clients instead:
 * - For browser/client components: import from '@/lib/supabase/browser'
 * - For server-side code: import from '@/lib/supabase/server'
 */

import { createBrowserSupabaseClient } from './browser';

// Legacy export for backward compatibility
export function createSafeSupabaseClient() {
  console.warn('createSafeSupabaseClient is deprecated. Use createBrowserSupabaseClient from @/lib/supabase/browser instead.');
  return createBrowserSupabaseClient();
}

// Legacy exports
export { createClient } from '@supabase/supabase-js';
export default createSafeSupabaseClient;