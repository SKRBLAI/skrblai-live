import { supabase } from '@/utils/supabase';

/**
 * Debug helper for authentication issues
 * Checks various aspects of the auth state and returns diagnostic information
 */
export async function debugAuthState() {
  try {
    console.log('[AUTH_DEBUG] Starting authentication state check');
    
    // Check if we have a session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('[AUTH_DEBUG] Error getting session:', sessionError);
      return {
        success: false,
        error: sessionError.message,
        state: 'error',
        details: sessionError
      };
    }
    
    const session = sessionData?.session;
    const user = session?.user;
    
    // Check cookies
    const cookies = document.cookie.split(';').map(c => c.trim());
    const authCookie = cookies.find(c => c.startsWith('sb-') && c.includes('-auth-token='));
    
    const diagnostics = {
      hasSession: !!session,
      hasUser: !!user,
      hasAuthCookie: !!authCookie,
      sessionExpiry: session ? new Date(session.expires_at! * 1000).toISOString() : null,
      isSessionExpired: session ? (session.expires_at! * 1000) < Date.now() : null,
      userDetails: user ? {
        id: user.id,
        email: user.email,
        emailConfirmed: user.email_confirmed_at ? true : false,
        lastSignIn: user.last_sign_in_at,
        userMetadata: user.user_metadata
      } : null,
      cookieDetails: authCookie ? {
        name: authCookie.split('=')[0],
        length: authCookie.split('=')[1]?.length || 0
      } : null
    };
    
    console.log('[AUTH_DEBUG] Auth state diagnostics:', diagnostics);
    
    return {
      success: true,
      state: session ? 'authenticated' : 'unauthenticated',
      diagnostics
    };
  } catch (err: any) {
    console.error('[AUTH_DEBUG] Unexpected error during auth debugging:', err);
    return {
      success: false,
      error: err.message || 'Unknown error during auth debugging',
      state: 'error'
    };
  }
}

/**
 * Fix common authentication issues
 */
export async function attemptAuthFix() {
  try {
    console.log('[AUTH_DEBUG] Attempting to fix auth issues');
    
    // First check the current state
    const diagnostics = await debugAuthState();
    
    if (!diagnostics.success) {
      console.error('[AUTH_DEBUG] Cannot fix auth, diagnostics failed:', diagnostics.error);
      return { success: false, error: 'Diagnostics failed' };
    }
    
    if (diagnostics.state === 'authenticated') {
      console.log('[AUTH_DEBUG] User appears to be authenticated already');
      return { success: true, message: 'Already authenticated', fixed: false };
    }
    
    // Try to refresh the session
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('[AUTH_DEBUG] Session refresh failed:', error);
      return { success: false, error: error.message };
    }
    
    if (data.session) {
      console.log('[AUTH_DEBUG] Successfully refreshed session');
      return { success: true, message: 'Session refreshed', fixed: true };
    }
    
    console.log('[AUTH_DEBUG] No fixes applied, user needs to sign in again');
    return { success: false, error: 'No session to refresh', needsSignIn: true };
    
  } catch (err: any) {
    console.error('[AUTH_DEBUG] Fix attempt failed with error:', err);
    return { success: false, error: err.message || 'Unknown error during fix attempt' };
  }
}

/**
 * Add a debug button to the page
 */
export function addAuthDebugButton() {
  if (typeof document === 'undefined') return;
  
  const existingButton = document.getElementById('auth-debug-button');
  if (existingButton) return;
  
  const button = document.createElement('button');
  button.id = 'auth-debug-button';
  button.innerText = 'Debug Auth';
  button.style.position = 'fixed';
  button.style.bottom = '10px';
  button.style.right = '10px';
  button.style.zIndex = '9999';
  button.style.padding = '8px 12px';
  button.style.backgroundColor = '#333';
  button.style.color = '#fff';
  button.style.border = '1px solid #666';
  button.style.borderRadius = '4px';
  button.style.cursor = 'pointer';
  
  button.onclick = async () => {
    const diagnostics = await debugAuthState();
    console.log('[AUTH_DEBUG] Button clicked, diagnostics:', diagnostics);
    alert(`Auth state: ${diagnostics.state}\n${JSON.stringify(diagnostics.diagnostics || {}, null, 2)}`);
  };
  
  document.body.appendChild(button);
} 