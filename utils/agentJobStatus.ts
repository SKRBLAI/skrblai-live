import { getBrowserSupabase } from '@/lib/supabase';

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
    const supabase = getBrowserSupabase();
    if (!supabase) {
      console.error('Supabase client unavailable');
      return { success: false, message: 'Database unavailable' };
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (update.status) updateData.status = update.status;
    if (update.progress !== undefined) updateData.progress = update.progress;
    if (update.output) updateData.output = update.output;
    if (update.results) updateData.results = update.results;
    if (update.error) updateData.error = update.error;
    
    if (update.status === 'complete' || update.status === 'failed') {
      updateData.completed_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('agent_jobs')
      .update(updateData)
      .eq('id', jobId);

    if (updateError) throw updateError;

    console.log(`Job ${jobId} updated successfully`);
    return { success: true, message: 'Job updated successfully' };
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
