import { supabase } from './supabase';
import type { Lead, Proposal, ScheduledPost } from '@/types/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js'; // Added SupabaseUser for clarity if local User type conflicts

/**
 * Upload a file to Supabase storage
 * @param file - File to upload
 * @param path - Storage path
 * @returns Upload result with URL if successful
 */
export const uploadFileToStorage = async (file: File, path: string) => {
  try {
    const { data, error } = await supabase.storage
      .from('files')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL of the file
    const { data: urlData } = supabase.storage
      .from('files')
      .getPublicUrl(data.path);

    return { success: true, url: urlData.publicUrl };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { success: false, error };
  }
};

/**
 * Save data to a Supabase table
 * @param tableName - Name of the table
 * @param data - Data to save
 * @param id - Optional ID for record
 * @returns Save result with ID if successful
 */
export const saveToSupabase = async <T extends Record<string, any>>(
  tableName: string,
  data: T,
  id?: string
): Promise<{ success: boolean; id?: string; error?: any }> => {
  try {
    const now = new Date().toISOString();
    
    if (id) {
      // Update existing record
      const { data: result, error } = await supabase
        .from(tableName)
        .update({
          ...data,
          updated_at: now
        })
        .eq('id', id)
        .select();

      if (error) throw error;
      return { success: true, id };
    } else {
      // Insert new record
      const { data: result, error } = await supabase
        .from(tableName)
        .insert({
          ...data,
          created_at: now,
          updated_at: now
        })
        .select();

      if (error) throw error;
      return { success: true, id: result[0].id };
    }
  } catch (error) {
    console.error(`Error saving to ${tableName}:`, error);
    return { success: false, error };
  }
};

/**
 * Save a lead to Supabase
 * @param leadData - Lead data
 * @returns Save result
 */
export const saveLeadToSupabase = async (leadData: Lead): Promise<{ success: boolean; id?: string; error?: any }> => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .insert({
        ...leadData,
        created_at: new Date().toISOString()
      })
      .select();
    
    if (error) throw error;
    return { success: true, id: data[0].id };
  } catch (error) {
    console.error('Error saving lead:', error);
    return { success: false, error };
  }
};

/**
 * Save a scheduled post to Supabase
 * @param postData - Scheduled post data
 * @returns Save result
 */
export const saveScheduledPost = async (postData: ScheduledPost) => {
  return saveToSupabase('scheduled_posts', postData);
};

/**
 * Save a proposal to Supabase
 * @param proposalData - Proposal data
 * @returns Save result
 */
export const saveProposal = async (proposalData: Proposal) => {
  return saveToSupabase('proposals', proposalData);
};

/**
 * Get proposals from Supabase
 * @returns Array of proposals with IDs
 */
export const getProposals = async (): Promise<Array<Proposal & { id: string }>> => {
  try {
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map((item: any) => ({
      ...item,
      id: item.id,
      projectName: item.project_name || '',
      notes: item.notes || '',
      budget: item.budget || '',
      pdfUrl: item.pdf_url || '',
      createdAt: item.created_at
    }));
  } catch (error) {
    console.error('Error getting proposals:', error);
    return [];
  }
};

/**
 * Save user data to Supabase
 * @param userId - User ID
 * @param userName - User name
 * @param userEmail - User email
 * @returns Save result
 */
export const saveUser = async (userId: string, userName: string, userEmail: string) => {
  return saveToSupabase('users', {
    name: userName,
    email: userEmail
  }, userId);
};

/**
 * Log agent activity to Supabase
 * @param activityData - Agent activity data
 * @returns Save result
 */
export const logAgentActivity = async (activityData: any) => {
  const { error } = await supabase
    .from('agent_activities')
    .insert({
      ...activityData,
      created_at: new Date().toISOString()
    });
    
  if (error) {
    console.error('Error logging agent activity:', error);
    return { success: false, error };
  }
  
  return { success: true };
};

/**
 * Get the currently authenticated Supabase user.
 * @returns The Supabase User object if a session exists, otherwise null.
 */
export const getCurrentUser = async (): Promise<SupabaseUser | null> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error fetching current user:', error.message);
      return null;
    }
    return user;
  } catch (error) {
    console.error('Exception in getCurrentUser:', error);
    return null;
  }
};