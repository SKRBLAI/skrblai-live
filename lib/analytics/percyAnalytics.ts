// Create Percy-specific analytics to track conversion funnel
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface PercyConversationEvent {
  event_type: 'conversation_start' | 'step_completed' | 'step_abandoned' | 'lead_captured' | 'agent_selected';
  step_number?: number;
  user_choice?: string;
  session_id: string;
  user_id?: string;
  qualification_score?: number;
  timestamp: string;
  user_agent?: string;
  referrer?: string;
}

export async function trackPercyEvent(event: PercyConversationEvent) {
  try {
    // Save to database for analytics
    await supabase.from('percy_analytics').insert([{
      ...event,
      created_at: new Date().toISOString()
    }]);
    
    console.log('📊 Percy Analytics:', event.event_type, event);
  } catch (error) {
    console.error('Percy analytics failed:', error);
  }
}

// Get Percy funnel metrics
export async function getPercyFunnelMetrics(days: number = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data, error } = await supabase
    .from('percy_analytics')
    .select('*')
    .gte('created_at', startDate.toISOString());
    
  if (error) throw error;
  
  // Calculate funnel metrics with proper string indexing
  const totalStarts = data.filter(e => e.event_type === 'conversation_start').length;
  const step1Completed = data.filter(e => e.event_type === 'step_completed' && e.step_number === 1).length;
  const step2Completed = data.filter(e => e.event_type === 'step_completed' && e.step_number === 2).length;
  const step3Completed = data.filter(e => e.event_type === 'step_completed' && e.step_number === 3).length;
  const leadsCaptured = data.filter(e => e.event_type === 'lead_captured').length;
  
  return {
    totalConversations: totalStarts,
    step1ConversionRate: totalStarts > 0 ? (step1Completed / totalStarts) * 100 : 0,
    step2ConversionRate: step1Completed > 0 ? (step2Completed / step1Completed) * 100 : 0,
    step3ConversionRate: step2Completed > 0 ? (step3Completed / step2Completed) * 100 : 0,
    leadConversionRate: totalStarts > 0 ? (leadsCaptured / totalStarts) * 100 : 0,
    dropOffPoints: {
      step1: totalStarts - step1Completed,
      step2: step1Completed - step2Completed, 
      step3: step2Completed - step3Completed,
      leadForm: step3Completed - leadsCaptured
    }
  };
} 