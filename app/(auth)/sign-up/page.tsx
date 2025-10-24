import { redirect } from 'next/navigation';
import { getServerSupabaseAnon, getServerSupabaseAdmin } from '@/lib/supabase/server';
import SignUpForm from './SignUpForm';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * Helper function to route user to appropriate dashboard based on role
 * Note: redirect() throws, so this function never returns normally
 */
async function routeUserToDashboard(userId: string): Promise<never> {
  const adminSupabase = getServerSupabaseAdmin();
  if (!adminSupabase) {
    console.warn('[SIGNUP] Admin client not available, redirecting to default dashboard');
    redirect('/dashboard');
  }

  try {
    const { data: roleRows } = await adminSupabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    const roles: string[] = (roleRows || []).map((r: any) => r.role?.toLowerCase?.() || '');
    
    // Priority order: founder > heir > vip > parent > user
    const priority: string[] = ['founder', 'heir', 'vip', 'parent', 'user'];
    const found = priority.find(r => roles.includes(r)) || 'user';
    
    // Route based on role - redirect() throws and stops execution
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
    console.error('[SIGNUP] Error checking user role:', error);
    redirect('/dashboard');
  }
}

export default async function SignUpPage() {
  const supabase = getServerSupabaseAnon();
  
  if (!supabase) {
    console.warn('[SIGNUP] Supabase not configured');
    return <SignUpForm />;
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    console.log('[SIGNUP] User already authenticated, redirecting to dashboard');
    // Server-side redirect based on role - no client-side flicker
    // This will throw and prevent rendering SignUpForm
    await routeUserToDashboard(user.id);
    // The line below will never execute due to redirect() throwing
  }

  return <SignUpForm />;
}