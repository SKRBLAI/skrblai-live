import { ReactNode } from 'react';
import type { Lead } from '@/types/supabase';

export interface AgentInput {
  userId: string;
  goal: string;
  content?: string;
  context?: string;
  options?: Record<string, any>;
  contactMethod?: 'email' | 'sms' | 'voice' | 'chat';
  contactInfo?: {
    email?: string;
    phone?: string;
    preferredTime?: string;
    timezone?: string;
  };
}

export interface AgentResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

// New interfaces for enhanced conversational capabilities
export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    powersUsed?: string[];
    handoffSuggested?: boolean;
    emotionalTone?: string;
    confidence?: number;
  };
}

export interface ChatResponse {
  success: boolean;
  message: string;
  personalityInjected: boolean;
  handoffSuggestions?: HandoffSuggestion[];
  conversationAnalytics?: ConversationAnalytics;
  data?: any;
  error?: string;
}

export interface HandoffSuggestion {
  targetAgentId: string;
  targetAgentName: string;
  reason: string;
  confidence: number; // 0-100
  triggerKeywords: string[];
  userBenefit: string;
}

export interface ConversationAnalytics {
  messageCount: number;
  avgResponseTime: number;
  personalityAlignment: number; // 0-100
  engagementLevel: 'low' | 'medium' | 'high';
  topicsDiscussed: string[];
  sentimentScore: number; // -1 to 1
  handoffTriggers: number;
}

export interface AgentStats {
  id: string;
  name: string;
  emoji: string;
  usageCount: number;
  conversationCount?: number;
  avgSatisfactionScore?: number;
  totalHandoffsInitiated?: number;
  totalHandoffsReceived?: number;
}

export interface AgentConfig {
  name?: string;
  description?: string;
  capabilities: string[];
  workflows?: string[];
  // Enhanced conversational config
  conversationalSettings?: {
    defaultGreeting?: string;
    personalityStrength?: 'subtle' | 'moderate' | 'strong';
    fallbackResponses?: string[];
    maxConversationLength?: number;
  };
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  category: string;
  agentCategory?: string[];
  emoji?: string;
  usageCount?: number;
  lastRun?: string;
  performanceScore?: number;
  config?: AgentConfig;
  capabilities: string[];
  route?: string | null;
  intent?: string | null;
  visible: boolean;
  premium?: boolean;
  icon?: string;
  unlocked?: boolean;
  imageSlug?: string;
  hasImage?: boolean;
  displayInOrbit?: boolean;
  orbit?: {
    radius?: number;
    speed?: number;
    angle?: number;
  };
  hoverSummary?: string;
  gender?: 'male' | 'female' | 'neutral';
  
  // Superhero backstory fields
  superheroName?: string;
  origin?: string;
  powers?: string[];
  weakness?: string;
  catchphrase?: string;
  nemesis?: string;
  backstory?: string;
  
  // Standardized action handlers
  onInfo?: () => void;
  onChat?: () => void;
  onHandoff?: () => void;
  onLaunch?: () => void;
  
  // N8N Integration fields
  n8nWorkflowId?: string;
  primaryOutput?: string;
  primaryCapability?: string;
  n8nWebhookConfig?: {
    webhookUrl?: string;
    method?: 'POST' | 'GET';
    headers?: Record<string, string>;
  };
  
  // NEW: Enhanced Interactivity & Personality Metadata
  canConverse: boolean;
  recommendedHelpers: string[]; // Array of agent IDs that work well with this agent
  handoffTriggers: string[]; // Keywords/phrases that indicate this agent should hand off
  conversationCapabilities?: {
    supportedLanguages?: string[];
    maxConversationDepth?: number;
    specializedTopics?: string[];
    emotionalIntelligence?: boolean;
  };
  
  runAgent?: (input: any) => Promise<AgentResponse>;
  handleOnboarding?: (
    lead: Lead
  ) => Promise<{ success: boolean; message: string; redirectPath?: string }>;
  
  // NEW: Enhanced Agent Functions
  chat?: (
    message: string, 
    conversationHistory?: ConversationMessage[],
    context?: any
  ) => Promise<ChatResponse>;
  
  roleRequired?: string;
  premiumFeature?: string;
  upgradeRequired?: string | null;
}

export type AgentFunction = (input: AgentInput) => Promise<AgentResponse>;
export type AgentChatFunction = (
  message: string, 
  conversationHistory?: ConversationMessage[],
  context?: any
) => Promise<ChatResponse>;
