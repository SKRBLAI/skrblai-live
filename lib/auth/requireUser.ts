import { getServerSupabaseAnon } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { FLAGS } from '@/lib/config/featureFlags';

export interface NormalizedUser {
  id: string;
  email: string;
  provider: 'supabase' | 'clerk';
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

/**
 * Server-side auth guard that requires a signed-in user
 * 
 * v1: Supabase-only (FF_CLERK is quarantined)
 * v2: Will support Clerk when FF_CLERK=1
 * 
 * Usage in page components:
 * export default async function MyPage() {
 *   const user = await requireUser();
 *   // user is guaranteed to exist here
 * }
 */
export async function requireUser(): Promise<NormalizedUser> {
  // v1: Supabase-only behavior
  // Clerk is quarantined - flag exists but behavior is disabled
  const useClerk = FLAGS.FF_CLERK;
  
  // For v1, we always use Supabase legacy regardless of flags
  // This ensures stable auth behavior until Clerk is fully configured
  if (useClerk) {
    // Clerk is quarantined in v1 - fall back to Supabase
    console.log('[requireUser] FF_CLERK is set but quarantined in v1, using Supabase');
  }

  return await requireUserFromSupabaseLegacy();
}

/**
 * Get user from Supabase Legacy (original auth)
 */
async function requireUserFromSupabaseLegacy(): Promise<NormalizedUser> {
  const supabase = getServerSupabaseAnon();
  
  if (!supabase) {
    console.warn('[requireUser] Supabase not configured, redirecting to sign-in');
    redirect('/sign-in');
  }

  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    console.log('[requireUser] No authenticated user found, redirecting to sign-in');
    redirect('/sign-in');
  }

  return {
    id: user.id,
    email: user.email || '',
    provider: 'supabase',
    metadata: user.user_metadata,
    created_at: user.created_at,
    updated_at: user.updated_at
  };
}