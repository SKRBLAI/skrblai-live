import { redirect } from 'next/navigation';
import { getServerSupabaseAnon } from '@/lib/supabase/server';
import SignUpForm from '@/app/(auth)/sign-up/SignUpForm';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function SignUpPage() {
  const supabase = getServerSupabaseAnon();
  
  if (!supabase) {
    console.warn('[AUTH2-SIGNUP] Supabase not configured');
    return <SignUpForm />;
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    console.log('[AUTH2-SIGNUP] User already authenticated, redirecting to udash');
    // Server-side redirect to universal dashboard - no client-side flicker
    redirect('/udash');
  }

  return <SignUpForm />;
}
