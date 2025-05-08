import { supabase } from '@/utils/supabase';
import { getCurrentUser } from '@/utils/supabase-auth';

export const getRecentPercyMemory = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return [];

    // Get recent memory from Supabase
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
