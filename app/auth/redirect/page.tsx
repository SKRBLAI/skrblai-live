import { redirect } from 'next/navigation';
import { getOptionalServerSupabase } from '@/lib/supabase/server';
import { getUserAndRole, routeForRole } from '@/lib/auth/roles';

interface SearchParams {
  from?: string;
}

interface AuthRedirectPageProps {
  searchParams: SearchParams;
}

export default async function AuthRedirectPage({ searchParams }: AuthRedirectPageProps) {
  const supabase = getOptionalServerSupabase();
  
  // If Supabase is not configured, redirect to sign-in
  if (!supabase) {
    console.log('[AUTH_REDIRECT] Supabase not configured, redirecting to sign-in');
    return redirect('/sign-in');
  }

  // Get user and role
  const { user, role } = await getUserAndRole(supabase);
  
  // If no user, redirect to sign-in
  if (!user) {
    console.log('[AUTH_REDIRECT] No user found, redirecting to sign-in');
    return redirect('/sign-in');
  }

  // Check if there's a 'from' parameter and if it's safe to redirect to
  const from = searchParams?.from;
  const safeFrom = from && 
    from.startsWith('/') && 
    !from.startsWith('/sign-in') && 
    !from.startsWith('/sign-up') &&
    !from.startsWith('/auth/redirect') 
    ? from 
    : null;

  // If there's a safe 'from' parameter, redirect there
  if (safeFrom) {
    console.log('[AUTH_REDIRECT] Redirecting to safe from parameter:', safeFrom);
    return redirect(safeFrom);
  }

  // Otherwise, redirect based on user role
  const roleRoute = routeForRole(role);
  console.log('[AUTH_REDIRECT] Redirecting based on role:', role, '→', roleRoute);
  return redirect(roleRoute);
}