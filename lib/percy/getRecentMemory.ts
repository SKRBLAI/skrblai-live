import { getBrowserSupabase } from '@/lib/supabase';

export const getRecentPercyMemory = async () => {
  try {
    const supabase = getBrowserSupabase();
    if (!supabase) return [];

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('percy_memory')
      .select('*')
      .eq('userId', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching Percy memory:', error);
    return [];
  }
};
