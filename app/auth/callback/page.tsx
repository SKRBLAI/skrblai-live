import { redirect } from 'next/navigation';
import { getServerSupabaseAnon, getServerSupabaseAdmin } from '@/lib/supabase/server';
import { routeForRole } from '@/lib/auth/roles';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

interface SearchParams {
  from?: string;
  code?: string;
  error?: string;
}

interface AuthCallbackPageProps {
  searchParams: SearchParams;
}

export default async function AuthCallbackPage({ searchParams }: AuthCallbackPageProps) {
  const supabase = getServerSupabaseAnon();
  
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

  // Get user using anon client
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  // If no user, redirect to sign-in
  if (userError || !user) {
    console.log('[AUTH_CALLBACK] No user found, redirecting to sign-in');
    return redirect('/sign-in');
  }

  // Server-upsert profiles with admin client
  const adminSupabase = getServerSupabaseAdmin();
  if (adminSupabase) {
    try {
      // Upsert user profile
      await adminSupabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          updated_at: new Date().toISOString()
        });

      // Get role from user_roles table (fallback to profiles.role if needed)
      const { data: roleRows } = await adminSupabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      let role = 'user';
      if (roleRows && roleRows.length > 0) {
        const roles: string[] = roleRows.map((r: any) => r.role?.toLowerCase?.() || '');
        // Priority order: founder > heir > vip > parent > user
        const priority: string[] = ['founder', 'heir', 'vip', 'parent', 'user'];
        role = priority.find(r => roles.includes(r)) || 'user';
      } else {
        // Fallback to profiles.role if no user_roles entry
        const { data: profile } = await adminSupabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profile?.role) {
          role = profile.role.toLowerCase();
        }
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
      const roleRoute = routeForRole(role as any);
      console.log('[AUTH_CALLBACK] Redirecting based on role:', role, '→', roleRoute);
      return redirect(roleRoute);
    } catch (error) {
      console.error('[AUTH_CALLBACK] Error processing user profile/role:', error);
      // Fallback to default dashboard
      return redirect('/dashboard');
    }
  } else {
    console.warn('[AUTH_CALLBACK] Admin client not available, redirecting to default dashboard');
    return redirect('/dashboard');
  }
}