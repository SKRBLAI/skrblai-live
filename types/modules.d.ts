import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

declare module '@/lib/supabaseClient' {
  const supabase: SupabaseClient<Database>;
  export default supabase;
}

declare module '@/utils/feedback' {
  export function submitPercyFeedback(agentId: string, message: string): Promise<{ success: boolean; error?: any }>;
}

declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}
