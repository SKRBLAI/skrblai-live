import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions to replace Firebase equivalents
export const saveToSupabase = async (table: string, data: any) => {
  const { data: result, error } = await supabase
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
  let query = supabase.from(table).select(options.select || '*');

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
