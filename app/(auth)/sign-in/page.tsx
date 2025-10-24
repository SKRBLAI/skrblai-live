import { redirect } from 'next/navigation';
import { getServerSupabaseAnon, getServerSupabaseAdmin } from '@/lib/supabase/server';
import SignInForm from './SignInForm';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

/**
 * Helper function to route user to appropriate dashboard based on role
 */
async function routeUserToDashboard(userId: string) {
  const adminSupabase = getServerSupabaseAdmin();
  if (!adminSupabase) {
    console.warn('[SIGNIN] Admin client not available, redirecting to default dashboard');
    return redirect('/dashboard');
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
    
    // Route based on role
    switch (found) {
      case 'founder':
        redirect('/dashboard/founders');
        break;
      case 'heir':
        redirect('/dashboard/heir');
        break;
      case 'vip':
        redirect('/dashboard/vip');
        break;
      case 'parent':
        redirect('/dashboard/parent');
        break;
      default:
        redirect('/dashboard');
    }
  } catch (error) {
    console.error('[SIGNIN] Error checking user role:', error);
    redirect('/dashboard');
  }
}

export default async function SignInPage() {
  const supabase = getServerSupabaseAnon();
  
  if (!supabase) {
    console.warn('[SIGNIN] Supabase not configured');
    return <SignInForm />;
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    console.log('[SIGNIN] User already authenticated, redirecting to dashboard');
    // Server-side redirect based on role - no client-side flicker
    routeUserToDashboard(user.id);
  }

  return <SignInForm />;
}