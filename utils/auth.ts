// This file is deprecated in favor of supabase-auth.ts
// Keeping it temporarily for backward compatibility
// All authentication should be migrated to use @/utils/supabase-auth

import { signUp, signIn, signOut, resetPassword } from './supabase-auth';
import { supabase } from './supabase';

// Create user with Supabase Auth and store initial user data
export const createUser = async (email: string, password: string, userData: any) => {
  return signUp(email, password, userData.displayName || '');
};

// Login with existing credentials
export const loginUser = async (email: string, password: string) => {
  return signIn(email, password);
};

// Sign out user
export const logoutUser = async () => {
  return signOut();
};

// Send password reset email
export const sendPasswordReset = async (email: string) => {
  return resetPassword(email);
};

// Check if a user exists by email
export const checkUserExists = async (email: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .limit(1);
    
    if (error) throw error;
    return data && data.length > 0;
  } catch (error) {
    console.error('Error checking user existence:', error);
    return false;
  }
};

// Listen for auth state changes
export const initAuth = (callback: (user: any) => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null);
  });
  
  return () => subscription.unsubscribe();
};

// Get user data from Supabase
export const getUserData = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    
    if (data) {
      return { success: true, data };
    } else {
      return { success: false, error: 'User data not found' };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// --- AUTH STUBS FOR ONBOARDING/ACCESS GATING ---

/**
 * Placeholder signup logic for onboarding and access gating
 * Accepts email, password, and optional role (default: 'user')
 */
export const signupWithRole = async (email: string, password: string, role: string = 'user') => {
  // TODO: Integrate with real signup logic and role assignment
  // For now, just call createUser and log the role
  console.log('[AUTH STUB] Signup:', { email, role });
  const result = await createUser(email, password, { displayName: email.split('@')[0] });
  // Simulate role assignment (to be replaced with DB logic)
  return { ...result, assignedRole: role };
};

/**
 * Placeholder login logic
 */
export const loginWithEmail = async (email: string, password: string) => {
  // TODO: Integrate with real login logic
  console.log('[AUTH STUB] Login:', { email });
  return loginUser(email, password);
};

/**
 * Placeholder for email capture (lead collection)
 */
export const captureEmailForAccess = async (email: string) => {
  // TODO: Store email in a leads table or CRM
  console.log('[AUTH STUB] Captured email for access gating:', email);
  // Simulate success
  return { success: true };
};

/**
 * Placeholder for role assignment (upgrade/downgrade)
 */
export const assignUserRole = async (userId: string, role: string) => {
  // TODO: Update user role in DB
  console.log('[AUTH STUB] Assign role:', { userId, role });
  // Simulate success
  return { success: true, userId, newRole: role };
};
