import { createClient } from '@supabase/supabase-js';

// Safe Supabase client creation that handles missing environment variables
export function createSafeSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  // During build time or when environment variables are missing, return a mock client
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
    console.warn('Supabase client created with placeholder values - database operations will not work');
    
    // Return a mock client that prevents build errors
    return {
      from: () => ({
        select: () => ({ data: null, error: new Error('Supabase not configured') }),
        insert: () => ({ data: null, error: new Error('Supabase not configured') }),
        update: () => ({ data: null, error: new Error('Supabase not configured') }),
        delete: () => ({ data: null, error: new Error('Supabase not configured') }),
        upsert: () => ({ data: null, error: new Error('Supabase not configured') }),
      }),
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: new Error('Supabase not configured') }),
        signOut: () => Promise.resolve({ error: new Error('Supabase not configured') }),
      },
      storage: {
        from: () => ({
          upload: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
          download: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        }),
      },
    } as any;
  }

  try {
    return createClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    return createSafeSupabaseClient(); // Return mock client on error
  }
}

// Legacy export for backward compatibility
export { createClient };
export default createSafeSupabaseClient;