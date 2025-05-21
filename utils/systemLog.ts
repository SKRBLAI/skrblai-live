import { supabase } from './supabase';

const consoleMap = {
  error: console.error,
  warning: console.warn,
  info: console.info,
};

export async function systemLog({ type, message, meta }: { type: 'error' | 'warning' | 'info'; message: string; meta?: any }) {
  try {
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