import { getBrowserSupabase } from '@/lib/supabase';

export async function submitPercyFeedback(agentId: string, message: string) {
  try {
    const supabase = getBrowserSupabase();
    if (!supabase) {
      throw new Error('Database unavailable');
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Percy Feedback:', { agentId, message });
      return { success: true };
    }

    const { error } = await supabase
      .from('percy_feedback')
      .insert({
        agent_id: agentId,
        message,
        created_at: new Date().toISOString()
      });

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Error submitting feedback:', err);
    return { success: false, error: err };
  }
}
