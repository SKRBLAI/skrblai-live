import { supabase } from './supabase';
import { saveUser } from './supabase-helpers';
import { systemLog } from './systemLog';

/**
 * Sign up with email and password
 * @param email User email
 * @param password User password
 * @param name User's name
 * @returns Result of the sign up operation
 */
export const signUp = async (email: string, password: string, name: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (error) throw error;

    // Save user data to users table
    if (data.user) {
      await saveUser(data.user.id, name, email);
      // Trigger onboarding automation
      try {
        const onboardingRes = await fetch('/api/agents/automation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // No auth header needed, user just signed up
          },
          body: JSON.stringify({
            agentId: 'onboarding-agent',
            task: 'onboard',
            payload: { userId: data.user?.id ?? '', email: email ?? '' }
          })
        });
        const onboardingResult = await onboardingRes.json();
        await systemLog({
          type: onboardingResult && onboardingResult.success ? 'info' : 'error',
          message: 'Onboarding automation triggered',
          meta: {
            userId: data.user?.id ?? '',
            email: email ?? '',
            onboardingResult,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (onboardErr: any) {
        await systemLog({
          type: 'error',
          message: 'Onboarding automation error',
          meta: {
            userId: data.user?.id ?? '',
            email: email ?? '',
            error: onboardErr?.message || onboardErr || '',
            timestamp: new Date().toISOString(),
          },
        });
      }
    }

    return { success: true, user: data.user };
  } catch (error) {
    console.error('Error signing up:', error);
    return { success: false, error };
  }
};

/**
 * Sign in with email and password
 * @param email User email
 * @param password User password
 * @returns Result of the sign in operation
 */
export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    return { success: true, user: data.user, session: data.session };
  } catch (error) {
    console.error('Error signing in:', error);
    return { success: false, error };
  }
};

/**
 * Sign out the current user
 * @returns Result of the sign out operation
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return { success: false, error };
  }
};

/**
 * Get the current user session
 * @returns Current session or null
 */
export const getCurrentSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error getting session:', error);
    return null;
  }
  
  return data.session;
};

/**
 * Get the current user
 * @returns Current user or null
 */
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Error getting user:', error);
    return null;
  }
  
  return data.user;
};

/**
 * Reset password
 * @param email User email
 * @returns Result of the reset password operation
 */
export const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error resetting password:', error);
    return { success: false, error };
  }
};

/**
 * Update user password
 * @param password New password
 * @returns Result of the update password operation
 */
export const updatePassword = async (password: string) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password
    });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error updating password:', error);
    return { success: false, error };
  }
};

// Export an auth object to mimic Firebase auth API
export const auth = {
  currentUser: null,
  onAuthStateChanged: (callback: (user: any) => void) => {
    supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
    
    // Return unsubscribe function
    return () => {};
  },
  signOut: () => signOut()
}; 