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
