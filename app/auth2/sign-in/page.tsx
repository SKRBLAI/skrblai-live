import { redirect } from 'next/navigation';
import { getServerSupabaseAnon } from '@/lib/supabase/server';
import SignInForm from '@/app/(auth)/sign-in/SignInForm';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function SignInPage() {
  const supabase = getServerSupabaseAnon('boost');
  
  if (!supabase) {
    console.warn('[AUTH2-SIGNIN] Boost Supabase not configured');
    return <SignInForm />;
  }

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    console.log('[AUTH2-SIGNIN] User already authenticated, redirecting to udash');
    // Server-side redirect to universal dashboard - no client-side flicker
    redirect('/udash');
  }

  return <SignInForm />;
}
