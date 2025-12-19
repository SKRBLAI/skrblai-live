import { getServerSupabaseAnon, getServerSupabaseAnonWithVariant } from '@/lib/supabase/server';
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
 * v1: Supabase-only (FF_CLERK and FF_BOOST are quarantined)
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
  // Clerk and Boost are quarantined - flags exist but behavior is disabled
  const useBoost = FLAGS.FF_BOOST;
  const useClerk = FLAGS.FF_CLERK;
  
  // For v1, we always use Supabase legacy regardless of flags
  // This ensures stable auth behavior until Clerk is fully configured
  if (useClerk) {
    // Clerk is quarantined in v1 - fall back to Supabase
    console.log('[requireUser] FF_CLERK is set but quarantined in v1, using Supabase');
  }
  
  if (useBoost) {
    // Boost is available but optional
    return await requireUserFromSupabaseBoost();
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

/**
 * Get user from Supabase Boost (optional alternative Supabase project)
 */
async function requireUserFromSupabaseBoost(): Promise<NormalizedUser> {
  const supabase = getServerSupabaseAnonWithVariant('boost');
  
  if (!supabase) {
    console.warn('[requireUser] Boost Supabase not configured, falling back to legacy');
    return await requireUserFromSupabaseLegacy();
  }

  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    console.log('[requireUser] No authenticated user found in Boost, redirecting to sign-in');
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