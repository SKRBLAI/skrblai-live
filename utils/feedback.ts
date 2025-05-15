import { supabase } from '@/lib/supabaseClient';

export async function submitPercyFeedback(agentId: string, message: string) {
  if (process.env.NODE_ENV === 'development') {
    console.log('Percy Feedback:', { agentId, message });
    return { success: true };
  }

  try {
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
