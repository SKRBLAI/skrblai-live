import { getBrowserSupabase } from '@/lib/supabase';

export const saveChatMemory = async (intent: string, message: string) => {
  try {
    const supabase = getBrowserSupabase();
    if (!supabase) return { success: false, error: 'Database unavailable' };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'No user found' };

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
