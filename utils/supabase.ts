import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Supabase client instance, created lazily
export let supabase: any = null;

// Function to get (or create) the Supabase client safely
export function getSupabase() {
  if (!supabase) {
    try {
      // Check if environment variables are available
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.warn('[Supabase] Environment variables not configured');
        return null;
      }
      supabase = createClientComponentClient();
    } catch (error) {
      console.warn('[Supabase] Failed to create client:', error);
      return null;
    }
  }
  return supabase;
}

// Initialize supabase safely
supabase = getSupabase();

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
