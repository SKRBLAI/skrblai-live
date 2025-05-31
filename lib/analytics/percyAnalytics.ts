// Client-safe Percy analytics - NO SERVICE KEY
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
    // Use API route for server-side operations
    await fetch('/api/analytics/percy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });
    
    console.log('📊 Percy Analytics:', event.event_type, event);
  } catch (error) {
    console.error('Percy analytics failed:', error);
  }
}

// This function can only be called server-side
export async function getPercyFunnelMetrics(days: number = 7) {
  throw new Error('getPercyFunnelMetrics must be called from server-side API routes only');
} 