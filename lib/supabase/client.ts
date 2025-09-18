import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseEnvSafe } from '@/lib/env';

export function getBrowserSupabase() {
  const env = getSupabaseEnvSafe();
  
  if (!env.isValid || !env.env.NEXT_PUBLIC_SUPABASE_URL || !env.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Supabase environment not properly configured');
  }
  
  return createBrowserClient(env.env.NEXT_PUBLIC_SUPABASE_URL, env.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

// Legacy function for backward compatibility - now creates client safely
export function createSafeSupabaseClient() {
  try {
    return getBrowserSupabase();
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    
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
        signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
      },
      storage: {
        from: () => ({
          upload: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
          download: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
        }),
      },
    } as any;
  }
}

// Legacy export for backward compatibility
export default createSafeSupabaseClient;