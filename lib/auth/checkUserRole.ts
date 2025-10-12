import { getServerSupabaseAdmin } from '@/lib/supabase';
import { getCurrentUser } from '../../utils/supabase-helpers';

export async function checkUserRole(): Promise<'free' | 'premium'> {
  try {
    const user = await getCurrentUser();
    if (!user) return 'free';

    const supabase = getServerSupabaseAdmin();
    if (!supabase) {
      console.warn('Supabase client unavailable, defaulting to free tier');
      return 'free';
    }

    // Check user role from Supabase
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('userId', user.id)
      .maybeSingle();

    if (error) throw error;
    
    // If no role is found or there's an error, default to free
    return (data?.role === 'premium') ? 'premium' : 'free';
  } catch (error) {
    console.error('Error checking user role:', error);
    return 'free';
  }
}
