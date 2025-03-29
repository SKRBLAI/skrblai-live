import { db } from '@/utils/firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';

// Define input interface for Percy Sync Agent
interface AgentInput {
  userId: string;
  projectId?: string;
  requestType: 'content' | 'branding' | 'website' | 'social' | 'video' | 'analytics' | 'proposal' | 'publishing' | 'all';
  priority?: 'low' | 'medium' | 'high';
  customParams?: Record<string, any>;
}

// Define response interface
interface AgentResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Define agent job interface
interface AgentJob {
  agentName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  input: any;
  output?: any;
  startTime: string;
  endTime?: string;
}

// Define job result interface
interface JobResult {
  agentName: string;
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Percy Sync Agent - Orchestrates and triggers other agents based on user needs
 * @param input - Sync request parameters
 * @returns Promise with success status, message and optional data
 */
export async function runAgent(input: AgentInput): Promise<AgentResponse> {
  try {
    // Validate input
    if (!input.userId || !input.requestType) {
      throw new Error('Missing required fields: userId and requestType');
    }

    // Create a sync session to track all agent jobs
    const syncSession = {
      userId: input.userId,
      projectId: input.projectId || 'general',
      requestType: input.requestType,
      priority: input.priority || 'medium',
      status: 'processing',
      startTime: new Date().toISOString(),
      jobs: [] as AgentJob[],
      customParams: input.customParams || {}
    };

    // Determine which agents to trigger based on requestType
    const agentsToTrigger = determineAgentsToTrigger(input.requestType);
    
    // Create job entries for each agent
    for (const agent of agentsToTrigger) {
      syncSession.jobs.push({
        agentName: agent,
        status: 'pending',
        input: createAgentInput(agent, input),
        startTime: new Date().toISOString()
      });
    }

    // Save the initial sync session to Firestore
    const sessionRef = await addDoc(collection(db, 'sync-sessions'), syncSession);
    
    // Start processing each agent job
    const results = await processAgentJobs(syncSession.jobs, sessionRef.id);
    
    // Log the sync agent execution to Firestore
    await addDoc(collection(db, 'agent-logs'), {
      agent: 'percySyncAgent',
      input,
      results,
      sessionId: sessionRef.id,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      message: `Percy sync agent completed with ${results.filter(r => r.success).length}/${results.length} successful jobs`,
      data: {
        sessionId: sessionRef.id,
        results
      }
    };
  } catch (error) {
    console.error('Percy sync agent failed:', error);
    return {
      success: false,
      message: `Percy sync agent failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Determine which agents to trigger based on request type
 * @param requestType - Type of request
 * @returns Array of agent names to trigger
 */
function determineAgentsToTrigger(requestType: string): string[] {
  switch (requestType) {
    case 'content':
      return ['contentCreatorAgent'];
    case 'branding':
      return ['brandingAgent', 'adCreativeAgent'];
    case 'website':
      return ['sitegenAgent', 'contentCreatorAgent'];
    case 'social':
      return ['socialBotAgent', 'contentCreatorAgent'];
    case 'video':
      return ['videoContentAgent'];
    case 'analytics':
      return ['analyticsAgent'];
    case 'proposal':
      return ['proposalGeneratorAgent', 'bizAgent'];
    case 'publishing':
      return ['publishingAgent'];
    case 'all':
      return [
        'contentCreatorAgent',
        'brandingAgent',
        'adCreativeAgent',
        'sitegenAgent',
        'socialBotAgent',
        'videoContentAgent',
        'analyticsAgent',
        'proposalGeneratorAgent',
        'bizAgent',
        'publishingAgent'
      ];
    default:
      return ['contentCreatorAgent']; // Default to content creation
  }
}

/**
 * Create appropriate input for each agent
 * @param agentName - Name of the agent
 * @param syncInput - Original sync input
 * @returns Formatted input for the specific agent
 */
function createAgentInput(agentName: string, syncInput: AgentInput): any {
  // Base input that all agents will need
  const baseInput = {
    userId: syncInput.userId,
    projectId: syncInput.projectId,
    priority: syncInput.priority
  };

  // Add agent-specific parameters
  switch (agentName) {
    case 'contentCreatorAgent':
      return {
        ...baseInput,
        contentType: syncInput.customParams?.contentType || 'blog',
        topic: syncInput.customParams?.topic || 'general',
        tone: syncInput.customParams?.tone || 'professional',
        wordCount: syncInput.customParams?.wordCount || 800
      };
    case 'brandingAgent':
      return {
        ...baseInput,
        industry: syncInput.customParams?.industry || 'technology',
        targetAudience: syncInput.customParams?.targetAudience || 'professionals',
        brandValues: syncInput.customParams?.brandValues || ['innovative', 'trustworthy']
      };
    case 'sitegenAgent':
      return {
        ...baseInput,
        siteType: syncInput.customParams?.siteType || 'business',
        pages: syncInput.customParams?.pages || ['home', 'about', 'services', 'contact'],
        design: syncInput.customParams?.design || 'modern'
      };
    case 'socialBotAgent':
      return {
        ...baseInput,
        platforms: syncInput.customParams?.platforms || ['instagram', 'twitter'],
        postCount: syncInput.customParams?.postCount || 5,
        mediaType: syncInput.customParams?.mediaType || 'mixed'
      };
    // Add cases for other agents as needed
    default:
      return {
        ...baseInput,
        ...syncInput.customParams
      };
  }
}

/**
 * Process each agent job sequentially
 * @param jobs - Array of agent jobs to process
 * @param sessionId - ID of the sync session
 * @returns Array of job results
 */
async function processAgentJobs(jobs: AgentJob[], sessionId: string): Promise<JobResult[]> {
  const results: JobResult[] = [];
  
  // In a real implementation, this would import and call each agent
  // For now, we'll simulate the agent calls
  for (const job of jobs) {
    try {
      // Update job status to processing
      job.status = 'processing';
      await updateSyncSession(sessionId, jobs);
      
      // Simulate calling the actual agent
      // In production, you would import and call the actual agent module
      const result = await simulateAgentCall(job.agentName, job.input);
      
      // Update job with results
      job.status = result.success ? 'completed' : 'failed';
      job.output = result;
      job.endTime = new Date().toISOString();
      
      results.push({
        agentName: job.agentName,
        success: result.success,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      // Handle job failure
      job.status = 'failed';
      job.output = { 
        success: false, 
        message: `Job failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
      job.endTime = new Date().toISOString();
      
      results.push({
        agentName: job.agentName,
        success: false,
        message: `Failed to process job: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
    
    // Update the sync session after each job
    await updateSyncSession(sessionId, jobs);
  }
  
  return results;
}

/**
 * Update the sync session document in Firestore
 * @param sessionId - ID of the sync session
 * @param jobs - Updated jobs array
 */
async function updateSyncSession(sessionId: string, jobs: AgentJob[]): Promise<void> {
  try {
    // In a real implementation, you would update the Firestore document
    // For now, we'll just log the update
    console.log(`Updating sync session ${sessionId} with ${jobs.length} jobs`);
    
    // Check if all jobs are completed or failed
    const allJobsFinished = jobs.every(job => job.status === 'completed' || job.status === 'failed');
    
    // Create the update object
    const updateData = {
      jobs,
      status: allJobsFinished ? 'completed' : 'processing',
      updatedAt: new Date().toISOString(),
      ...(allJobsFinished ? { endTime: new Date().toISOString() } : {})
    };
    
    // Update the Firestore document
    await updateDoc(doc(db, 'sync-sessions', sessionId), updateData);
  } catch (error) {
    console.error('Failed to update sync session:', error);
  }
}

/**
 * Simulate calling an agent (for development purposes)
 * @param agentName - Name of the agent to call
 * @param input - Input for the agent
 * @returns Simulated agent response
 */
async function simulateAgentCall(agentName: string, input: any): Promise<AgentResponse> {
  // In a real implementation, you would import and call the actual agent
  // For now, we'll simulate a response
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    message: `${agentName} completed successfully (simulated)`,
    data: {
      simulatedResult: `Result for ${agentName} with input: ${JSON.stringify(input).substring(0, 100)}...`,
      timestamp: new Date().toISOString()
    }
  };
}