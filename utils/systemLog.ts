import { getBrowserSupabase } from '@/lib/supabase';

const consoleMap: Record<string, typeof console.log> = {
  error: console.error,
  warning: console.warn,
  info: console.info,
};

export async function logSystemEvent(type: string, message: string, meta?: any) {
  try {
    const supabase = getBrowserSupabase();
    if (supabase) {
      await supabase.from('system_logs').insert({
        type,
        message,
        meta: meta ? JSON.stringify(meta) : null,
        timestamp: new Date().toISOString(),
      });
    } else {
      // Fallback to console
      (consoleMap[type] || console.log)(`[systemLog] ${message}`, meta);
    }
  } catch (err) {
    console.error('[systemLog] Failed to log event:', err, { type, message, meta });
  }
}

// Alias for backwards compatibility
export const systemLog = logSystemEvent;