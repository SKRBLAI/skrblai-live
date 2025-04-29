export interface AgentInput {
  userId: string;
  goal: string;
  jobId?: string; // Job ID for tracking status in dashboard
  additionalNotes?: string;
  metadata?: Record<string, any>;
}

export interface AgentResponse {
  success: boolean;
  message: string;
  agentName: string;
  data?: Record<string, any>;
  error?: string;
}

export interface AgentConfig {
  name: string;
  description: string;
  capabilities: string[];
}

export type AgentFunction = (input: AgentInput) => Promise<AgentResponse>;

export interface Agent {
  id: string;
  name: string;
  category: string;
  description: string;
  route?: string | null;
  intent?: string | null;
  visible: boolean;
  premium?: boolean;
  config?: {
    name: string;
    description: string;
    capabilities?: string[];
  };
  runAgent?: (input: any, context?: any) => Promise<any>;
  promptTemplate?: string;
  params?: Record<string, any>;
  examples?: Array<{
    input: string;
    output: string;
  }>;
}
