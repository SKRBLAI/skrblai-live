export interface AgentInput {
  userId: string;
  goal: string;
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
  config: AgentConfig;
  runAgent: AgentFunction;
}
