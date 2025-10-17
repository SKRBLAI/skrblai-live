// Client-side onboarding helper for profile creation
import { getBrowserSupabase } from './client';

let profileSyncAttempted = false;

/**
 * Ensures user profile exists by calling server-side profile sync
 * Should be called once per session after successful authentication
 */
export async function ensureProfileOnClientMount(): Promise<{ success: boolean; error?: string }> {
  // Prevent multiple attempts in the same session
  if (profileSyncAttempted) {
    return { success: true };
  }

  try {
    const supabase = getBrowserSupabase();
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return { success: false, error: 'No authenticated user' };
    }

    // Call server-side profile sync
    const response = await fetch('/api/user/profile-sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });

    const result = await response.json();
    
    if (result.success) {
      profileSyncAttempted = true;
      console.log('[ONBOARDING] Profile sync successful:', result.message);
    } else {
      console.warn('[ONBOARDING] Profile sync failed:', result.error);
    }

    return { success: result.success, error: result.error };
  } catch (error: any) {
    console.error('[ONBOARDING] Profile sync exception:', error);
    return { success: false, error: error.message || 'Profile sync failed' };
  }
}

/**
 * Reset the profile sync attempt flag (useful for testing)
 */
export function resetProfileSyncAttempt() {
  profileSyncAttempted = false;
}
