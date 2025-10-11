import { getServerSupabaseAnon } from '../supabase/server';

/**
 * Lightweight session helper for SERVER-SIDE usage
 * Returns the current user session or null
 * For client-side, use the AuthContext instead
 */
export async function getSession() {
  try {
    const supabase = getServerSupabaseAnon();
    if (!supabase || typeof supabase.auth?.getSession !== 'function') {
      console.warn('[Auth] Supabase not configured for server-side');
      return null;
    }
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.warn('[Auth] Session check error:', error);
      return null;
    }
    
    return session;
  } catch (error) {
    console.warn('[Auth] Session helper error:', error);
    return null;
  }
}

/**
 * Check if user is authenticated (client-side helper)
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session?.user;
}

/**
 * Get current user if authenticated
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user || null;
}
