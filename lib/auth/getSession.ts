import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

/**
 * Lightweight session helper that matches our existing auth mechanism
 * Returns the current user session or null
 */
export async function getSession() {
  try {
    const supabase = createClientComponentClient();
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
