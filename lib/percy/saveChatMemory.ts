import { getBrowserSupabase } from '@/lib/supabase';
import { getCurrentUser } from '../../utils/supabase-helpers';

export const saveChatMemory = async (intent: string, message: string) => {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'No user found' };

    const supabase = getBrowserSupabase();
    if (!supabase) return { success: false, error: 'Database unavailable' };

    const { error } = await supabase
      .from('percy_memory')
      .insert({
        userId: user.id,
        intent,
        message,
        created_at: new Date().toISOString()
      });
      
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error saving chat memory:', error);
    return { success: false, error };
  }
};
