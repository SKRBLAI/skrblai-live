import { createClient } from '@supabase/supabase-js';

/**
 * Browser-safe Supabase client - ONLY uses anon key
 * This client is safe to use in client-side components.
 * Env vars are read lazily at call time, not import time.
 */
export function createBrowserSupabaseClient() {
  // Lazy env read - happens only when function is called, not at import
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // During build time or when environment variables are missing, return a mock client
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
    console.warn('Browser Supabase client created with placeholder values - database operations will not work');
    
    // Return a mock client that prevents build errors
    return {
      from: () => ({
        select: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        insert: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        update: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        delete: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        upsert: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      }),
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: new Error('Supabase not configured') }),
        getSession: () => Promise.resolve({ data: { session: null }, error: new Error('Supabase not configured') }),
        signOut: () => Promise.resolve({ error: new Error('Supabase not configured') }),
        signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: new Error('Supabase not configured') }),
        signUp: () => Promise.resolve({ data: { user: null, session: null }, error: new Error('Supabase not configured') }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
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
    // ONLY use anon key for browser client - never service role key
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      global: {
        headers: {
          'X-Client-Source': 'browser'
        }
      }
    });
  } catch (error) {
    console.error('Failed to create browser Supabase client:', error);
    // Return mock client on error to prevent app crashes
    return createBrowserSupabaseClient();
  }
}

// Default export for convenience
export default createBrowserSupabaseClient;