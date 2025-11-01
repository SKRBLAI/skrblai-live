import { getServerSupabaseAnon, getBoostClientPublic } from '@/lib/supabase';
import { redirect } from 'next/navigation';

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
 * Supports both Supabase and Clerk authentication based on feature flags
 * Redirects to appropriate sign-in page if no user is found
 * 
 * Usage in page components:
 * export default async function MyPage() {
 *   const user = await requireUser();
 *   // user is guaranteed to exist here
 * }
 */
export async function requireUser(): Promise<NormalizedUser> {
  // Check if Clerk is enabled
  const useClerk = process.env.NEXT_PUBLIC_FF_CLERK === '1';
  const useBoost = process.env.FF_USE_BOOST_FOR_AUTH === '1';
  
  if (useClerk) {
    return await requireUserFromClerk();
  } else if (useBoost) {
    return await requireUserFromSupabaseBoost();
  } else {
    return await requireUserFromSupabaseLegacy();
  }
}

/**
 * Get user from Supabase Legacy (original auth)
 */
async function requireUserFromSupabaseLegacy(): Promise<NormalizedUser> {
  const supabase = getServerSupabaseAnon();
  
  if (!supabase) {
    console.warn('[requireUser] Legacy Supabase not configured, redirecting to sign-in');
    redirect('/sign-in');
  }

  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    console.log('[requireUser] No authenticated user found in legacy Supabase, redirecting to sign-in');
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
 * Get user from Supabase Boost
 */
async function requireUserFromSupabaseBoost(): Promise<NormalizedUser> {
  const supabase = getBoostClientPublic();
  
  if (!supabase) {
    console.warn('[requireUser] Boost Supabase not configured, redirecting to auth2/sign-in');
    redirect('/auth2/sign-in');
  }

  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    console.log('[requireUser] No authenticated user found in Boost Supabase, redirecting to auth2/sign-in');
    redirect('/auth2/sign-in');
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
 * Get user from Clerk
 * This is a placeholder - Clerk integration will be added when Clerk is installed
 */
async function requireUserFromClerk(): Promise<NormalizedUser> {
  // TODO: Implement Clerk user retrieval
  // For now, redirect to auth2/sign-in
  console.log('[requireUser] Clerk auth not yet implemented, redirecting to auth2/sign-in');
  redirect('/auth2/sign-in');
}