import { ReactNode } from 'react';

export interface AgentInput {
  userId: string;
  goal: string;
  content?: string;
  context?: string;
  options?: Record<string, any>;
}

export interface AgentResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface AgentStats {
  id: string;
  name: string;
  emoji: string;
  usageCount: number;
}

export interface AgentConfig {
  name?: string;
  description?: string;
  capabilities: string[];
  workflows?: string[];
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  agentCategory?: string[];
  emoji?: string;
  usageCount?: number;
  config?: AgentConfig;
  route?: string | null;
  intent?: string | null;
  visible: boolean;
  runAgent?: (input: any) => Promise<any>;
}

export type AgentFunction = (input: AgentInput) => Promise<AgentResponse>;
