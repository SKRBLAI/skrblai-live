import { supabase } from './supabase';

// Centralized database operations for agents
export const agentDb = {
  // Log agent activity
  logActivity: async (agentName: string, action: string, activityData: any) => {
    try {
      const { data, error } = await supabase
        .from('agent_activities')
        .insert([{
        agentName,
        action,
        activityData,
        timestamp: new Date().toISOString()
      }]).select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error(`Error logging agent activity: ${error}`);
    }
  },

  // Save agent job
  saveJob: async (jobData: any) => {
    try {
      const { data, error } = await supabase
        .from('agent_jobs')
        .insert([{
        ...jobData,
        createdAt: new Date().toISOString()
      }]).select();
      
      if (error) throw error;
      return data[0].id;
    } catch (error) {
      console.error(`Error saving agent job: ${error}`);
      throw error;
    }
  },

  // Query agent jobs
  queryJobs: async (agentName: string, userId: string, maxResults = 10) => {
    try {
      const { data, error } = await supabase
        .from('agent_jobs')
        .select('*')
        .eq('agentName', agentName)
        .eq('userId', userId)
        .order('createdAt', { ascending: false })
        .limit(maxResults);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error querying agent jobs: ${error}`);
      throw error;
    }
  }
};
