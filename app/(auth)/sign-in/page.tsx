import { redirect } from 'next/navigation';
import { getServerSupabaseAnon } from '@/lib/supabase/server';
import { routeToDashboard } from '@/lib/auth/routeToDashboard';
import SignInForm from './SignInForm';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SignInPage() {
  const supabase = getServerSupabaseAnon();
  
  if (!supabase) {
    console.warn('[SIGNIN] Supabase not configured');
    return <SignInForm />;
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    console.log('[SIGNIN] User already authenticated, redirecting to dashboard');
    await routeToDashboard();
  }

  return <SignInForm />;
}