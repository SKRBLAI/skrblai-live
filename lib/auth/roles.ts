// Lightweight role system for basic RBAC routing after auth callback.
// Note: lib/founders/roles.ts provides comprehensive founder role checks (creator/heir/founder + VIP).
// This file is kept simple for auth flow routing; complex role logic should use lib/founders/roles.ts.

export type AppRole = 'founder' | 'heir' | 'vip' | 'parent' | 'admin' | 'user';

export function routeForRole(role: AppRole): string {
  switch (role) {
    case 'founder': return '/dashboard/founders';
    case 'heir':    return '/dashboard/heir';
    case 'vip':     return '/dashboard/vip';
    case 'parent':  return '/dashboard/parent';
    case 'admin':   return '/dashboard/admin';
    default:        return '/dashboard';
  }
}

export async function getUserAndRole(supabase: any): Promise<{ user?: any | null; role: AppRole }> {
  if (!supabase) return { user: null, role: 'user' };
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { user: null, role: 'user' };

    const { data: roleRows } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const roles: string[] = (roleRows || []).map((r: any) => r.role?.toLowerCase?.() || '');
    // Priority order: founder > heir > vip > parent > admin > user
    const priority: AppRole[] = ['founder', 'heir', 'vip', 'parent', 'admin', 'user'];
    const found = priority.find(r => roles.includes(r)) || 'user';
    
    return { user, role: found };
  } catch (error) {
    console.error('Error getting user and role:', error);
    return { user: null, role: 'user' };
  }
}

/**
 * Server-side role guard that requires specific roles
 * Redirects to /sign-in if no user, or /dashboard if insufficient role
 * 
 * Usage in page components:
 * export default async function MyPage() {
 *   const user = await requireRole(['vip', 'admin']);
 *   // user is guaranteed to exist and have one of the required roles
 * }
 */
export async function requireRole(allowedRoles: AppRole[]) {
  const { getServerSupabaseAnon, getServerSupabaseAdmin } = await import('@/lib/supabase/server');
  const { redirect } = await import('next/navigation');
  
  const supabase = getServerSupabaseAnon();
  
  if (!supabase) {
    console.warn('[requireRole] Supabase not configured, redirecting to sign-in');
    redirect('/sign-in');
  }

  const { data: { user }, error } = await supabase!.auth.getUser();
  
  if (error || !user) {
    console.log('[requireRole] No authenticated user found, redirecting to sign-in');
    redirect('/sign-in');
  }

  // Get user role from user_roles table
  const adminSupabase = getServerSupabaseAdmin();
  if (!adminSupabase) {
    console.warn('[requireRole] Admin client not available, redirecting to dashboard');
    redirect('/dashboard');
  }

  try {
    const { data: roleRows } = await adminSupabase!
      .from('user_roles')
      .select('role')
      .eq('user_id', user!.id);

    const roles: string[] = (roleRows || []).map((r: any) => r.role?.toLowerCase?.() || '');
    
    // Check if user has any of the allowed roles
    const hasRequiredRole = allowedRoles.some(role => roles.includes(role));
    
    if (!hasRequiredRole) {
      console.log('[requireRole] User does not have required role, redirecting to dashboard');
      redirect('/dashboard');
    }

    return user;
  } catch (error) {
    console.error('[requireRole] Error checking user role:', error);
    // Fallback to dashboard
    redirect('/dashboard');
  }
}