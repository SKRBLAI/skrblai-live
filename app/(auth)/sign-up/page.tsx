import { redirect } from 'next/navigation';
import { getServerSupabaseAnon, getServerSupabaseAdmin } from '@/lib/supabase/server';
import { SignUp } from '@clerk/nextjs';
import SignUpForm from './SignUpForm';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const CLERK_ENABLED = process.env.NEXT_PUBLIC_FF_CLERK === '1';

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
  // Feature flag: Use Clerk or Legacy Supabase auth
  if (CLERK_ENABLED) {
    // Clerk SSR sign-up (no client redirects, no flicker)
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0b1220] via-[#0d1525] to-[#0f1a2e] p-4">
        <div className="w-full max-w-md">
          <SignUp 
            routing="path" 
            path="/sign-up"
            appearance={{
              baseTheme: undefined,
              variables: {
                colorPrimary: '#2dd4bf',
                colorBackground: '#0b1220',
                colorText: '#ffffff',
                colorTextSecondary: '#94a3b8',
              },
              elements: {
                rootBox: 'mx-auto',
                card: 'bg-[rgba(21,23,30,0.70)] border border-teal-400/40 shadow-[0_0_32px_#30d5c899] backdrop-blur-xl',
              }
            }}
          />
        </div>
      </div>
    );
  }

  // Legacy Supabase auth flow
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