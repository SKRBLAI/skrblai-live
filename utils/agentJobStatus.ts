import { supabase } from './supabase';

// Job status options
export type JobStatus = 'queued' | 'in_progress' | 'complete' | 'failed';

// Interface for job updates
export interface JobUpdate {
  status?: JobStatus;
  progress?: number;
  output?: any;
  results?: any;
  error?: string;
}

/**
 * Updates a job status in the agent_jobs collection
 * @param jobId - The ID of the job to update
 * @param update - The update data (status, progress, output, etc)
 * @returns Promise with success status and message
 */
export const updateJobStatus = async (jobId: string, update: JobUpdate) => {
  try {
    // First check if the job exists
    const { data: job, error: fetchError } = await supabase
      .from('agent_jobs')
      .select('*')
      .eq('id', jobId)
      .single();
    
    if (fetchError || !job) {
      console.error(`Job ${jobId} not found`);
      return { success: false, message: `Job ${jobId} not found` };
    }
    
    // Prepare update data
    const updateData = {
      ...update,
      updatedAt: new Date().toISOString()
    };
    
    // Update the job
    const { error: updateError } = await supabase
      .from('agent_jobs')
      .update(updateData)
      .eq('id', jobId);
    
    if (updateError) throw updateError;
    
    console.log(`Job ${jobId} updated with status: ${update.status || 'unchanged'}`);
    return { success: true, message: `Job ${jobId} updated successfully` };
  } catch (error) {
    console.error(`Error updating job ${jobId}:`, error);
    return { 
      success: false, 
      message: `Error updating job: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
};

/**
 * Marks a job as in-progress with optional initial progress percentage
 * @param jobId - The ID of the job
 * @param initialProgress - Initial progress percentage (default: 10)
 */
export const markJobStarted = async (jobId: string, initialProgress: number = 10) => {
  return updateJobStatus(jobId, {
    status: 'in_progress',
    progress: initialProgress
  });
};

/**
 * Updates job progress
 * @param jobId - The ID of the job
 * @param progress - Progress percentage (0-100)
 */
export const updateJobProgress = async (jobId: string, progress: number) => {
  return updateJobStatus(jobId, {
    progress: Math.min(Math.max(progress, 0), 100) // Ensure value is between 0-100
  });
};

/**
 * Marks a job as complete with results
 * @param jobId - The ID of the job
 * @param output - The output results from the agent
 */
export const markJobComplete = async (jobId: string, output: any) => {
  return updateJobStatus(jobId, {
    status: 'complete',
    progress: 100,
    output
  });
};

/**
 * Marks a job as failed with error message
 * @param jobId - The ID of the job
 * @param error - Error message
 */
export const markJobFailed = async (jobId: string, error: string) => {
  return updateJobStatus(jobId, {
    status: 'failed',
    error
  });
};
