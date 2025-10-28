import { redirect } from 'next/navigation';
import { getServerSupabaseAnon } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function Auth2CallbackPage() {
  const supabase = getServerSupabaseAnon('boost');
  
  if (!supabase) {
    console.error('[AUTH2-CALLBACK] Boost Supabase not configured');
    redirect('/auth2/sign-in?error=configuration');
  }

  try {
    // Exchange session via Boost anon client
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      console.error('[AUTH2-CALLBACK] Session error:', error);
      redirect('/auth2/sign-in?error=session');
    }

    // POST to /api/user/profile-sync with variant=boost
    const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/user/profile-sync?variant=boost`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    if (!profileResponse.ok) {
      console.error('[AUTH2-CALLBACK] Profile sync failed:', await profileResponse.text());
      redirect('/auth2/sign-in?error=profile-sync');
    }

    console.log('[AUTH2-CALLBACK] Profile sync successful, redirecting to udash');
    redirect('/udash');
    
  } catch (error) {
    console.error('[AUTH2-CALLBACK] Unexpected error:', error);
    redirect('/auth2/sign-in?error=unexpected');
  }
}
