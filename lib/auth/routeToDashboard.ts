import { getServerSupabaseAnon, getServerSupabaseAdmin } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

/**
 * Server-side role-based routing utility
 * Redirects users to appropriate dashboard based on their role
 * 
 * Usage in page components:
 * export default async function MyPage() {
 *   await routeToDashboard();
 *   // User will be redirected to appropriate dashboard
 * }
 */
export async function routeToDashboard() {
  const supabase = getServerSupabaseAnon();
  
  if (!supabase) {
    console.warn('[routeToDashboard] Supabase not configured, redirecting to sign-in');
    redirect('/sign-in');
  }

  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    console.log('[routeToDashboard] No authenticated user found, redirecting to sign-in');
    redirect('/sign-in');
  }

  // Get user role from user_roles table
  const adminSupabase = getServerSupabaseAdmin();
  if (!adminSupabase) {
    console.warn('[routeToDashboard] Admin client not available, redirecting to default dashboard');
    redirect('/dashboard');
  }

  try {
    const { data: roleRows } = await adminSupabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const roles: string[] = (roleRows || []).map((r: any) => r.role?.toLowerCase?.() || '');
    
    // Priority order: founder > heir > vip > parent > user
    const priority: string[] = ['founder', 'heir', 'vip', 'parent', 'user'];
    const found = priority.find(r => roles.includes(r)) || 'user';
    
    // Route based on role
    switch (found) {
      case 'founder':
        redirect('/dashboard/founders');
      case 'heir':
        redirect('/dashboard/heir');
      case 'vip':
        redirect('/dashboard/vip');
      case 'parent':
        redirect('/dashboard/parent');
      default:
        redirect('/dashboard');
    }
  } catch (error) {
    console.error('[routeToDashboard] Error checking user role:', error);
    // Fallback to default dashboard
    redirect('/dashboard');
  }
}