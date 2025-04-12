import { agentDb } from '@/utils/db';

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

export interface AgentInput {
  userId: string;
  projectId?: string;
  intent: IntentKey;
  customParams?: Record<string, any>;
}

interface AgentJob {
  id: string;
  userId: string;
  agentName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  intent: IntentKey;
  priority: 'low' | 'medium' | 'high';
  timestamp: number;
  customParams: Record<string, any>;
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

export async function routeToAgentFromIntent(input: AgentInput): Promise<AgentResponse> {
  try {
    // Validate intent exists
    if (!INTENT_MAPPING[input.intent]) {
      throw new Error(`Invalid intent: ${input.intent}`);
    }

    const { agent, message, priority } = INTENT_MAPPING[input.intent];
    const agentHandler = AGENT_HANDLERS[agent as AgentName];

    // Create Firestore job document
    const job: AgentJob = {
      id: `${input.userId}-${Date.now()}`,
      userId: input.userId,
      agentName: agent,
      status: 'pending',
      intent: input.intent,
      priority,
      timestamp: Date.now(),
      customParams: input.customParams || {}
    };

    const jobId = await agentDb.saveJob(job);
    
    // Log agent activity
    await agentDb.logActivity(agent, 'job_created', { jobId, userId: input.userId });
    
    // Initiate agent processing
    agentHandler.runAgent({
      userId: input.userId,
      goal: input.intent,
      metadata: {
        jobId,
        ...input.customParams
      }
    });

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

// Define Lead interface for type safety
export interface Lead {
  name: string;
  email: string;
  plan: string;
  company: string;
  serviceInterest: string;
  message: string;
  freeTrial?: boolean;
  businessGoal?: string;
}

// Add the percySyncAgent export
export const percySyncAgent = {
  // Handle user onboarding from Percy chat
  handleOnboarding: async (userData: Lead): Promise<string> => {
    try {
      // Log the onboarding
      await agentDb.logActivity('percySyncAgent', 'user_onboarding', {
        userId: userData.email,
        plan: userData.plan,
        freeTrial: userData.freeTrial,
        businessGoal: userData.businessGoal,
        timestamp: Date.now()
      });
      
      // If there's a business goal, route to the appropriate agent
      if (userData.businessGoal) {
        const intent = userData.businessGoal as IntentKey;
        
        // Create a temporary user ID based on email
        const userId = userData.email.replace('@', '-at-').replace(/\./g, '-');
        
        // Route to the agent based on intent
        if (INTENT_MAPPING[intent]) {
          await routeToAgentFromIntent({
            userId,
            intent,
            customParams: {
              name: userData.name,
              email: userData.email,
              freeTrial: userData.freeTrial,
              plan: userData.plan
            }
          });
          
          // Route to the appropriate dashboard page based on intent
          if (intent === 'grow_social_media') {
            return '/dashboard/social-media';
          } else if (intent === 'publish_book') {
            return '/dashboard/book-publishing';
          } else if (intent === 'launch_website') {
            return '/dashboard/website';
          } else if (intent === 'design_brand') {
            return '/dashboard/branding';
          } else if (intent === 'improve_marketing') {
            return '/dashboard/marketing';
          }
        }
      }
      
      // Default routing based on plan if no specific goal
      if (userData.freeTrial || userData.plan.includes('Free Trial')) {
        return '/dashboard/getting-started';
      } else {
        return '/dashboard';
      }
    } catch (error) {
      console.error('Error in Percy onboarding:', error);
      // Default to dashboard on error
      return '/dashboard';
    }
  }
};
