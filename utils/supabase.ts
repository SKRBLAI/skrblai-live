// @ts-nocheck
/**
 * LEGACY COMPATIBILITY LAYER - PLEASE USE NEW CLIENT FROM lib/supabase INSTEAD
 * 
 * This file exists only to provide backward compatibility with existing code.
 * New code should use getBrowserSupabase() or getServerSupabaseAnon() instead.
 */

import { getBrowserSupabase } from '@/lib/supabase';
import { getServerSupabaseAdmin } from '@/lib/supabase';

// Detect if we're running on server or client
function isServer() {
  return typeof window === 'undefined';
}

// Legacy supabase client - simplified approach
export const supabase = (() => {
  console.warn('[Supabase Legacy] Using deprecated supabase client - please migrate to proper client');
  
  // Use server client when on server, browser client when on client
  const client = isServer() ? getServerSupabaseAdmin() : getBrowserSupabase();
  
  if (!client) {
    console.error('[Supabase Legacy] Failed to get Supabase client');
    // Return a mock object to prevent crashes
    return {
      from: () => ({ select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }) }) }) }),
      auth: { getSession: () => Promise.resolve({ data: { session: null }, error: new Error('Supabase not configured') }) }
    };
  }
  return client;
})();

// Compatibility function - returns appropriate client based on environment
export function getSupabase() {
  console.warn('[Supabase Legacy] Using deprecated getSupabase() - please migrate to proper client');
  return isServer() ? getServerSupabaseAdmin() : getBrowserSupabase();
}

// Helper functions to replace Firebase equivalents
export const saveToSupabase = async (table: string, data: any) => {
  const client = getSupabase();
  if (!client) {
    console.warn('[Supabase] Client not available, skipping save operation');
    return null;
  }
  
  const { data: result, error } = await client
    .from(table)
    .insert([data])
    .select();

  if (error) throw error;
  return result[0];
};

export const saveLeadToSupabase = async (leadData: any) => {
  return saveToSupabase('leads', {
    ...leadData,
    created_at: new Date().toISOString()
  });
};

export const logAgentActivity = async (activityData: any) => {
  return saveToSupabase('agent_activities', {
    ...activityData,
    created_at: new Date().toISOString()
  });
};

export const saveUser = async (userData: any) => {
  return saveToSupabase('users', {
    ...userData,
    created_at: new Date().toISOString()
  });
};

// Query helpers
export const querySupabase = async (table: string, options: {
  select?: string,
  eq?: Record<string, any>,
  orderBy?: { column: string, ascending?: boolean },
  limit?: number
}) => {
  const client = getSupabase();
  if (!client) {
    console.warn('[Supabase] Client not available, returning empty results');
    return [];
  }
  
  let query = client.from(table).select(options.select || '*');

  if (options.eq) {
    Object.entries(options.eq).forEach(([column, value]) => {
      query = query.eq(column, value);
    });
  }

  if (options.orderBy) {
    query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? true });
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};
