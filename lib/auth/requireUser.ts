import { getServerSupabaseAnon } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

/**
 * Server-side auth guard that requires a signed-in user
 * Redirects to /sign-in if no user is found
 * 
 * Usage in page components:
 * export default async function MyPage() {
 *   const user = await requireUser();
 *   // user is guaranteed to exist here
 * }
 */
export async function requireUser() {
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

  return user;
}