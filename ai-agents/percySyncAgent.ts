import { agentDb } from '@/utils/db';
import { validateAgentInput } from '@/utils/agentUtils';
import type { Agent, AgentInput as BaseAgentInput, AgentFunction } from '@/types/agent';

// Import agent implementations
import { socialBotAgent } from '@/ai-agents/socialBotAgent';
import { publishingAgent } from '@/ai-agents/publishingAgent';
import { sitegenAgent } from '@/ai-agents/sitegenAgent';
import { brandingAgent } from '@/ai-agents/brandingAgent';
import { analyticsAgent } from '@/ai-agents/analyticsAgent';

// Type-safe agent map
const AGENT_HANDLERS = {
  socialBotAgent,
  publishingAgent,
  sitegenAgent,
  brandingAgent,
  analyticsAgent
} as const;

type AgentName = keyof typeof AGENT_HANDLERS;

// Intent configuration
const INTENT_MAPPING = {
  'grow_social_media': {
    agent: 'socialBotAgent',
    message: " Great! I've assigned your request to the SocialBot Agent. You'll receive updates shortly.",
    priority: 'high'
  },
  'publish_book': {
    agent: 'publishingAgent', 
    message: " Publishing team activated! Your manuscript is now in professional hands.",
    priority: 'medium'
  },
  'launch_website': {
    agent: 'sitegenAgent',
    message: " Website launch sequence initiated with our SiteGen specialists!",
    priority: 'high'
  },
  'design_brand': {
    agent: 'brandingAgent',
    message: " Branding vision unlocked! Our design team is on the case.",
    priority: 'medium'
  },
  'improve_marketing': {
    agent: 'analyticsAgent',
    message: " Marketing optimization in progress - crunching numbers with our Analytics AI.",
    priority: 'medium'
  }
} as const;

type IntentKey = keyof typeof INTENT_MAPPING;

interface PercySyncAgentInput extends BaseAgentInput {
  projectId?: string;
  intent: IntentKey;
  customParams?: Record<string, any>;
}

interface AgentJob {
  id: string;
  userId: string;
  agentName: string;
  status: 'queued' | 'in_progress' | 'complete' | 'failed';
  intent: IntentKey;
  priority: 'low' | 'medium' | 'high';
  timestamp: number;
  customParams: Record<string, any>;
  title?: string;
  type?: string;
  createdAt?: any;
  progress?: number;
}

export interface AgentResponse {
  success: boolean;
  message: string;
  data?: {
    jobId: string;
    agent: string;
    nextSteps: string;
  };
}

export async function routeToAgentFromIntent(input: PercySyncAgentInput): Promise<AgentResponse> {
  try {
    // Use validateAgentInput to validate the intent and customParams
    const percyFields = validateAgentInput<'intent' | 'projectId' | 'customParams'>(
      input as unknown as Record<string, any>,
      ['intent', 'projectId', 'customParams'],
      {
        intent: (val) => Object.keys(INTENT_MAPPING).includes(val),
        projectId: (val) => typeof val === 'string',
        customParams: (val) => typeof val === 'object'
      },
      {
        projectId: undefined,
        customParams: {}
      }
    );

    // Validate intent exists
    if (!INTENT_MAPPING[percyFields.intent as IntentKey]) {
      throw new Error(`Invalid intent: ${percyFields.intent}`);
    }

    const { agent, message, priority } = INTENT_MAPPING[percyFields.intent as IntentKey];
    
    // Validate agent name exists in AGENT_HANDLERS
    if (!(agent in AGENT_HANDLERS)) {
      throw new Error(`Agent handler not found: ${agent}`);
    }
    
    // Get the agent handler using a checked agent name
    // Using type casting to tell TypeScript that we've validated the agent name
    const agentName = agent as AgentName;
    const agentHandler = AGENT_HANDLERS[agentName];

    // Create Firestore job document
    const jobId = `${input.userId}-${Date.now()}`;
    const job: AgentJob = {
      id: jobId,
      userId: input.userId,
      agentName: agent,
      status: 'queued',
      intent: percyFields.intent,
      priority,
      timestamp: Date.now(),
      customParams: percyFields.customParams || {},
      title: `${percyFields.intent.replace(/_/g, ' ')} task`,
      type: percyFields.intent.split('_')[0], // e.g., 'grow' from 'grow_social_media'
      createdAt: new Date(),
      progress: 0
    };

    // Save to database - using existing method
    await agentDb.saveJob(job);
    
    // Log agent activity
    await agentDb.logActivity(agent, 'job_created', { jobId, userId: input.userId });
    
    // Safely call runAgent with a definite check
    if (typeof agentHandler.runAgent === 'function') {
      agentHandler.runAgent({
        userId: input.userId,
        goal: percyFields.intent,
        jobId, // Pass jobId directly as parameter
        metadata: {
          jobId, // Also include in metadata for backward compatibility
          ...percyFields.customParams
        }
      });
    } else {
      throw new Error(`Agent ${agent} does not have a runAgent method`);
    }

    return {
      success: true,
      message,
      data: {
        jobId,
        agent,
        nextSteps: 'Monitor progress in your dashboard or wait for email updates'
      }
    };

  } catch (error) {
    console.error(`Routing error: ${error instanceof Error ? error.message : error}`);
    return {
      success: false,
      message: " Oops! Our systems are a bit overwhelmed. Please try again in 30 seconds.",
      data: {
        jobId: 'error',
        agent: 'PercySync',
        nextSteps: 'Please try again in 30 seconds'
      }
    };
  }
}

// Import shared Lead interface
import type { Lead } from '@/types/lead';

// Intent to dashboard path mapping
// IMPORTANT: Every key in INTENT_MAPPING must be present here, or users will not be routed correctly after onboarding!
const intentToDashboardMap = {
  design_brand: '/dashboard/branding',
  grow_social_media: '/dashboard/social-media',
  launch_website: '/dashboard/website',
  improve_marketing: '/dashboard/marketing',
  publish_book: '/dashboard/book-publishing'
} as const;

type IntentDashboardKeys = keyof typeof intentToDashboardMap;
type IntentMappingKeys = keyof typeof INTENT_MAPPING;
type DashboardPaths = typeof intentToDashboardMap[IntentDashboardKeys];

// Type assertion: this ensures all INTENT_MAPPING keys are present in intentToDashboardMap
// The type must reflect that intentToDashboardMap maps intent keys to string URL paths
const _typeCheck: Record<IntentMappingKeys, string> = intentToDashboardMap as Record<IntentMappingKeys, string>;

// Add the percySyncAgent export
const percySyncAgent: Agent = {
  id: 'percy-sync',
  name: 'Percy Sync',
  category: 'System',
  description: 'Handles synchronization and routing of Percy chat interactions',
  visible: false,
  agentCategory: ['system'],
  roleRequired: 'any',
};

// Handle user onboarding from Percy chat
export async function handlePercyOnboarding(lead: Lead): Promise<{success: boolean; message: string; redirectPath?: string}> {
  try {
    // Validate intent
    if (!lead.intent || !Object.keys(intentToDashboardMap).includes(lead.intent)) {
      return {
        success: false,
        message: 'Invalid intent selected. Please choose a valid option.'
      };
    }
    
    // Get the intent configuration
    const intentConfig = INTENT_MAPPING[lead.intent as IntentKey];
    if (!intentConfig) {
      return {
        success: false,
        message: 'Intent configuration not found'
      };
    }
    
    // Generate a userId from email for consistency
    const userId = lead.email.replace('@', '-at-').replace(/\./g, '-');
    
    // Log activity
    await agentDb.logActivity('percySyncAgent', 'intent_routing', {
      intent: lead.intent,
      userId,
      timestamp: Date.now()
    });
    
    // Create agent job
    const jobResponse = await routeToAgentFromIntent({
      userId,
      goal: lead.intent as IntentKey,
      intent: lead.intent as IntentKey,
      customParams: {
        name: lead.name,
        email: lead.email,
        selectedPlan: lead.selectedPlan,
        businessGoal: lead.businessGoal
      }
    });
    
    if (!jobResponse.success) {
      return {
        success: false,
        message: jobResponse.message || 'Failed to create agent job'
      };
    }

    // Return success with redirect path
    return {
      success: true,
      message: intentConfig.message,
      redirectPath: intentToDashboardMap[lead.intent as keyof typeof intentToDashboardMap]
    };
    
  } catch (error) {
    console.error('Error in Percy onboarding:', error);
    return {
      success: false,
      message: 'An unexpected error occurred during onboarding.'
    };
  }
}

export { percySyncAgent };
export default percySyncAgent;
