import { redirect } from 'next/navigation';
import { getServerSupabaseAdmin } from '@/lib/supabase';
import { getUserAndRole, routeForRole } from '@/lib/auth/roles';

interface SearchParams {
  from?: string;
  code?: string;
  error?: string;
}

interface AuthCallbackPageProps {
  searchParams: SearchParams;
}

export default async function AuthCallbackPage({ searchParams }: AuthCallbackPageProps) {
  const supabase = getServerSupabaseAdmin();
  
  // If Supabase is not configured, redirect to sign-in
  if (!supabase) {
    console.log('[AUTH_CALLBACK] Supabase not configured, redirecting to sign-in');
    return redirect('/sign-in');
  }

  // Handle auth code exchange
  if (searchParams.code) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(searchParams.code);
      if (error) {
        console.error('[AUTH_CALLBACK] Code exchange failed:', error);
        return redirect('/sign-in?error=callback_failed');
      }
    } catch (error) {
      console.error('[AUTH_CALLBACK] Code exchange error:', error);
      return redirect('/sign-in?error=callback_failed');
    }
  }

  // Handle auth errors
  if (searchParams.error) {
    console.log('[AUTH_CALLBACK] Auth error:', searchParams.error);
    return redirect('/sign-in?error=' + encodeURIComponent(searchParams.error));
  }

  // Get user and role
  const { user, role } = await getUserAndRole(supabase);
  
  // If no user, redirect to sign-in
  if (!user) {
    console.log('[AUTH_CALLBACK] No user found, redirecting to sign-in');
    return redirect('/sign-in');
  }

  // Check if there's a 'from' parameter and if it's safe to redirect to
  const from = searchParams?.from;
  const safeFrom = from && 
    from.startsWith('/') && 
    !from.startsWith('/sign-in') && 
    !from.startsWith('/sign-up') &&
    !from.startsWith('/auth/callback') &&
    !from.startsWith('/auth/redirect')
    ? from 
    : null;

  // If there's a safe 'from' parameter, redirect there
  if (safeFrom) {
    console.log('[AUTH_CALLBACK] Redirecting to safe from parameter:', safeFrom);
    return redirect(safeFrom);
  }

  // Otherwise, redirect based on user role
  const roleRoute = routeForRole(role);
  console.log('[AUTH_CALLBACK] Redirecting based on role:', role, '→', roleRoute);
  return redirect(roleRoute);
}