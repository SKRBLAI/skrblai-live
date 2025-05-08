// This file is fully deprecated in favor of Supabase
// All Firebase functionality has been migrated to Supabase
// Keeping this file as redirect to avoid breaking imports

import { supabase } from './supabase';
import { uploadFileToStorage, saveToSupabase, saveLeadToSupabase } from './supabase-helpers';
import { 
  auth, 
  getCurrentUser, 
  getCurrentSession,
  signIn,
  signUp,
  signOut
} from './supabase-auth';

// Redirect Firebase exports to Supabase equivalents
export { supabase as db };
export { supabase as storage };
export { auth };
export { getCurrentUser as getAuth };
export { uploadFileToStorage };
export { saveToSupabase as saveToFirestore };
export { saveLeadToSupabase as saveLeadToFirebase };

// Mark all Firebase types as redirected to Supabase types
export type FirestoreTimestamp = string; // Supabase uses ISO strings
export type FirestoreCollection<T = any> = any; // Supabase doesn't use collections
export type { Lead } from '@/types/lead';

// Provide dummy/redirected versions of Firebase functions
export const serverTimestamp = () => new Date().toISOString();
export const collection = () => null; // No direct equivalent in Supabase
export const addDoc = async () => ({ id: '' }); // Should use saveToSupabase instead
export const setDoc = async () => {}; // Should use saveToSupabase instead
export const getDoc = async () => {}; // Should use supabase.from().select() instead
export const getDocs = async () => ({ docs: [] }); // Should use supabase.from().select() instead
export const updateDoc = async () => {}; // Should use supabase.from().update() instead
export const doc = () => null; // No direct equivalent in Supabase
export const query = () => null; // Should use supabase.from().select() instead
export const where = () => null; // Should use .eq(), .gt(), etc. in Supabase
export const orderBy = () => null; // Should use .order() in Supabase
export const limit = () => null; // Should use .limit() in Supabase