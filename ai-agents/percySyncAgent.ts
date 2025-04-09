import { db } from '@/utils/firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';

// Define intent mapping for Percy's routing
const INTENT_MAPPING = {
  'grow_social_media': {
    type: 'social',
    message: "I'll help you grow your social media presence! Let me connect you with our Social Media experts.",
    priority: 'high'
  },
  'publish_book': {
    type: 'publishing',
    message: "Ready to help you publish your book! I'll get our Publishing team started.",
    priority: 'medium'
  },
  'launch_website': {
    type: 'website',
    message: "Excited to help you launch your website! Connecting you with our Web Development specialists.",
    priority: 'high'
  },
  'design_brand': {
    type: 'branding',
    message: "Let's create an amazing brand identity! I'll bring in our Branding experts.",
    priority: 'medium'
  },
  'improve_marketing': {
    type: 'analytics',
    message: "Time to optimize your marketing! Connecting you with our Marketing Analytics team.",
    priority: 'medium'
  }
} as const;

type IntentKey = keyof typeof INTENT_MAPPING;
type AgentType = (typeof INTENT_MAPPING)[IntentKey]['type'];
type Priority = (typeof INTENT_MAPPING)[IntentKey]['priority'];

// Define input interface for Percy Sync Agent
interface AgentInput {
  userId: string;
  projectId?: string;
  intent: IntentKey;
  additionalNotes?: string;
  customParams?: Record<string, any>;
}

// Define response interface
interface AgentResponse {
  success: boolean;
  message: string;
  data?: Record<string, any>;
}

// Define agent job interface
interface AgentJob {
  id: string;
  userId: string;
  agentName: string;
  agentType: AgentType;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  intent: IntentKey;
  priority: Priority;
  timestamp: number;
  result?: Record<string, any>;
}

// Percy's main routing function
export async function routeToAgentFromIntent(input: AgentInput): Promise<AgentResponse> {
  try {
    const intentConfig = INTENT_MAPPING[input.intent];
    console.log(`🤖 Percy routing request for intent: ${input.intent}`);

    // Create a new job in Firestore
    const job: AgentJob = {
      id: `${input.userId}-${Date.now()}`,
      userId: input.userId,
      agentName: `${intentConfig.type.charAt(0).toUpperCase()}${intentConfig.type.slice(1)} Agent`,
      agentType: intentConfig.type,
      status: 'pending',
      intent: input.intent,
      priority: intentConfig.priority,
      timestamp: Date.now()
    };

    // Log the job to Firestore
    const jobsRef = collection(db, 'agent_jobs');
    await addDoc(jobsRef, job);

    // Return Percy's confirmation message
    return {
      success: true,
      message: intentConfig.message,
      data: {
        jobId: job.id,
        agentType: job.agentType,
        priority: job.priority
      }
    };

  } catch (error) {
    console.error('Percy routing error:', error);
    return {
      success: false,
      message: "I'm having trouble connecting to the right agent. Please try again in a moment.",
      data: { error: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
}

// Function to update job status
export async function updateJobStatus(
  jobId: string,
  status: AgentJob['status'],
  result?: Record<string, any>
): Promise<void> {
  try {
    const jobRef = doc(db, 'agent_jobs', jobId);
    await updateDoc(jobRef, {
      status,
      ...(result && { result })
    });
  } catch (error) {
    console.error('Error updating job status:', error);
    throw error;
  }
}
