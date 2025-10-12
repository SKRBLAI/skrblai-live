import { getBrowserSupabase } from '@/lib/supabase';

/**
 * Fetch Percy logs from Supabase, ordered by timestamp.
 * Optionally filter by sessionId or eventType.
 * Returns only logs with required fields.
 */
export async function fetchPercyLogs({ sessionId, eventType }: { sessionId?: string; eventType?: string } = {}) {
  const supabase = getBrowserSupabase();
  if (!supabase) {
    console.error('Supabase client unavailable');
    return { data: [], error: null };
  }

  let query = supabase.from('percy_logs').select('*').order('timestamp', { ascending: false });
  if (sessionId) query = query.eq('meta->>sessionId', sessionId);
  if (eventType) query = query.eq('type', eventType);
  const { data, error } = await query;
  if (error) throw error;
  // Validate completeness
  const validLogs = (data || []).filter((log: any) =>
    log && log.sessionId && log.agentId && log.type && log.meta && log.timestamp
  );
  return validLogs;
}

/**
 * Format Percy logs for display or export.
 * Supports 'json' (default) or 'csv'.
 */
export function formatPercyLogs(logs: any[], { format = 'json' }: { format?: 'json' | 'csv' } = {}) {
  if (format === 'csv') {
    // Flatten meta for CSV
    const headers = ['sessionId', 'agentId', 'type', 'timestamp', 'meta'];
    const rows = logs.map(log => [
      log.sessionId,
      log.agentId,
      log.type,
      log.timestamp,
      JSON.stringify(log.meta)
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
  // Default: pretty JSON
  return JSON.stringify(logs, null, 2);
} 