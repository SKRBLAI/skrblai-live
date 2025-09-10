/**
 * React Hook for Agent League Integration
 * 
 * Provides easy access to the Agent League system from frontend components.
 * Handles agent discovery, power execution, handoff analysis, and state management.
 * 
 * @version 2.0.0
 * @author SKRBL AI Team
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../components/context/AuthContext';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface AgentLeagueAgent {
  id: string;
  name: string;
  superheroName: string;
  category: string;
  description: string;
  version: string;
  visible: boolean;
  premium: boolean;
  emoji: string;
  colorTheme: string;
  imageSlug: string;
  catchphrase: string;
  powers: string[];
  personality?: {
    superheroName: string;
    origin: string;
    powers: string[];
    weakness: string;
    catchphrase: string;
    nemesis: string;
    backstory: string;
    voiceTone: string;
    communicationStyle: string;
  };
  capabilities?: Array<{
    category: string;
    skills: string[];
    primaryOutput: string;
    supportedFormats: string[];
    integrations: string[];
  }>;
  agentPowers?: Array<{
    id: string;
    name: string;
    description: string;
    triggerKeywords: string[];
    outputType: string;
    estimatedDuration: number;
    premiumRequired: boolean;
  }>;
}

export interface PowerExecutionRequest {
  agentId: string;
  powerId: string;
  userPrompt: string;
  payload?: Record<string, any>;
  fileData?: any;
}

export interface PowerExecutionResult {
  success: boolean;
  executionId: string;
  agentId: string;
  powerId: string;
  powerName: string;
  status: 'running' | 'completed' | 'failed' | 'queued';
  data?: any;
  error?: string;
  estimatedCompletion?: string;
  handoffSuggestions?: HandoffSuggestion[];
  metrics: {
    executionTime: number;
    cost?: number;
    tokensUsed?: number;
  };
}

export interface HandoffSuggestion {
  targetAgentId: string;
  targetAgentName: string;
  suggestion: string;
  confidence: number;
  autoTrigger: boolean;
  triggerPayload?: Record<string, any>;
}

export interface HandoffRecommendation {
  targetAgentId: string;
  targetAgentName: string;
  superheroName: string;
  confidence: number;
  reasoning: string;
  suggestedAction: string;
  estimatedValue: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  autoExecute: boolean;
  prerequisites: string[];
  expectedOutcome: string;
}

export interface UseAgentLeagueOptions {
  includePersonality?: boolean;
  includeCapabilities?: boolean;
  category?: string;
  visibleOnly?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

export interface UseAgentLeagueReturn {
  // Agent Data
  agents: AgentLeagueAgent[];
  loading: boolean;
  error: string | null;
  
  // Single Agent Operations
  getAgent: (agentId: string) => AgentLeagueAgent | undefined;
  getAgentVisualConfig: (agentId: string) => Promise<any>;
  getAgentSystemPrompt: (agentId: string) => Promise<string>;
  
  // Power Execution
  executeAgentPower: (request: PowerExecutionRequest) => Promise<PowerExecutionResult>;
  getPowerExecutionStatus: (executionId: string) => Promise<PowerExecutionResult | null>;
  
  // Handoff System
  analyzeHandoffs: (params: AnalyzeHandoffsParams) => Promise<HandoffRecommendation[]>;
  executeHandoff: (params: ExecuteHandoffParams) => Promise<any>;
  findBestHandoff: (fromAgentId: string, userInput: string) => Promise<any>;
  
  // NEW: Conversational Features
  chatWithAgent: (agentId: string, message: string, conversationHistory?: any[], context?: any) => Promise<any>;
  getAgentChatCapabilities: (agentId: string) => Promise<any>;
  
  // Utility Functions
  refreshAgents: () => Promise<void>;
  validateSystem: () => Promise<any>;
  getSystemHealth: () => Promise<any>;
  
  // State Management
  selectedAgent: AgentLeagueAgent | null;
  setSelectedAgent: (agent: AgentLeagueAgent | null) => void;
  executionHistory: PowerExecutionResult[];
  handoffHistory: any[];
  
  // NEW: Conversation State
  conversationHistory: any[];
  activeConversationAgent: string | null;
  setActiveConversationAgent: (agentId: string | null) => void;
}

export interface AnalyzeHandoffsParams {
  sourceAgentId: string;
  sourceExecutionId?: string;
  userPrompt: string;
  executionResult: PowerExecutionResult;
  userPreferences?: {
    autoHandoffs?: boolean;
    preferredAgents?: string[];
    workflowStyle?: 'manual' | 'guided' | 'automated';
    notificationLevel?: 'minimal' | 'standard' | 'detailed';
  };
}

export interface ExecuteHandoffParams {
  recommendation: HandoffRecommendation;
  context: any;
  userConfirmation?: boolean;
}

// =============================================================================
// MAIN HOOK
// =============================================================================

export function useAgentLeague(options: UseAgentLeagueOptions = {}): UseAgentLeagueReturn {
  const {
    includePersonality = false,
    includeCapabilities = false,
    category,
    visibleOnly = true,
    autoRefresh = false,
    refreshInterval = 30000 // 30 seconds
  } = options;

  // Authentication
  const auth = useAuth();
  const { accessLevel } = auth;

  const hasPremiumAccess = accessLevel === 'promo' || accessLevel === 'vip';

  // State
  const [agents, setAgents] = useState<AgentLeagueAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentLeagueAgent | null>(null);
  const [executionHistory, setExecutionHistory] = useState<PowerExecutionResult[]>([]);
  const [handoffHistory, setHandoffHistory] = useState<any[]>([]);
  
  // Conversation State
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [activeConversationAgent, setActiveConversationAgent] = useState<string | null>(null);

  // =============================================================================
  // API HELPERS
  // =============================================================================

  const apiCall = useCallback(async (endpoint: string, options: RequestInit = {}) => {
    try {
      // Get token from Supabase session
      const { supabase } = await import('@/utils/supabase');
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;
      
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (err: any) {
      console.error(`[useAgentLeague] API call failed:`, err);
      throw err;
    }
  }, []);

  // =============================================================================
  // AGENT DATA OPERATIONS
  // =============================================================================

  const loadAgents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        action: 'list',
        ...(visibleOnly && { visible: 'true' }),
        ...(category && { category }),
        ...(includePersonality && { personality: 'true' }),
        ...(includeCapabilities && { capabilities: 'true' })
      });

      const response = await apiCall(`/api/agents/league?${params}`);
      
      if (response.success) {
        setAgents(response.agents);
      } else {
        throw new Error(response.error || 'Failed to load agents');
      }
    } catch (err: any) {
      setError(err.message);
      console.error('[useAgentLeague] Load agents failed:', err);
    } finally {
      setLoading(false);
    }
  }, [apiCall, visibleOnly, category, includePersonality, includeCapabilities]);

  const getAgent = useCallback((agentId: string): AgentLeagueAgent | undefined => {
    return agents.find(agent => agent.id === agentId);
  }, [agents]);

  const getAgentVisualConfig = useCallback(async (agentId: string) => {
    try {
      const response = await apiCall(`/api/agents/league?action=visual&agentId=${agentId}`);
      return response.success ? response.visualConfig : null;
    } catch (err: any) {
      console.error('[useAgentLeague] Get visual config failed:', err);
      return null;
    }
  }, [apiCall]);

  const getAgentSystemPrompt = useCallback(async (agentId: string): Promise<string> => {
    try {
      const response = await apiCall(`/api/agents/league?action=prompt&agentId=${agentId}`);
      return response.success ? response.systemPrompt : '';
    } catch (err: any) {
      console.error('[useAgentLeague] Get system prompt failed:', err);
      return '';
    }
  }, [apiCall]);

  const refreshAgents = useCallback(async () => {
    await loadAgents();
  }, [loadAgents]);

  // =============================================================================
  // POWER EXECUTION
  // =============================================================================

  const executeAgentPower = useCallback(async (request: PowerExecutionRequest): Promise<PowerExecutionResult> => {
    try {
      console.log(`[useAgentLeague] Executing power ${request.powerId} for agent ${request.agentId}`);
      
      const response = await apiCall('/api/agents/league', {
        method: 'POST',
        body: JSON.stringify({
          action: 'execute_power',
          ...request
        })
      });

      if (response.success) {
        const result = response.result;
        
        // Add to execution history
        setExecutionHistory(prev => [result, ...prev.slice(0, 9)]); // Keep last 10
        
        console.log(`[useAgentLeague] Power execution completed:`, result);
        return result;
      } else {
        throw new Error(response.error || 'Power execution failed');
      }
    } catch (err: any) {
      console.error('[useAgentLeague] Execute power failed:', err);
      
      // Return error result
      const errorResult: PowerExecutionResult = {
        success: false,
        executionId: `error_${Date.now()}`,
        agentId: request.agentId,
        powerId: request.powerId,
        powerName: request.powerId,
        status: 'failed',
        error: err.message,
        metrics: { executionTime: 0 }
      };
      
      setExecutionHistory(prev => [errorResult, ...prev.slice(0, 9)]);
      return errorResult;
    }
  }, [apiCall]);

  const getPowerExecutionStatus = useCallback(async (executionId: string): Promise<PowerExecutionResult | null> => {
    try {
      const response = await apiCall(`/api/agents/league?action=status&executionId=${executionId}`);
      return response.success ? response.status : null;
    } catch (err: any) {
      console.error('[useAgentLeague] Get execution status failed:', err);
      return null;
    }
  }, [apiCall]);

  // =============================================================================
  // HANDOFF SYSTEM
  // =============================================================================

  const analyzeHandoffs = useCallback(async (params: AnalyzeHandoffsParams): Promise<HandoffRecommendation[]> => {
    try {
      console.log(`[useAgentLeague] Analyzing handoffs for ${params.sourceAgentId}`);
      
      const response = await apiCall('/api/agents/league', {
        method: 'POST',
        body: JSON.stringify({
          action: 'analyze_handoffs',
          ...params
        })
      });

      if (response.success) {
        console.log(`[useAgentLeague] Found ${response.recommendations.length} handoff recommendations`);
        return response.recommendations;
      } else {
        throw new Error(response.error || 'Handoff analysis failed');
      }
    } catch (err: any) {
      console.error('[useAgentLeague] Analyze handoffs failed:', err);
      return [];
    }
  }, [apiCall]);

  const executeHandoff = useCallback(async (params: ExecuteHandoffParams) => {
    try {
      console.log(`[useAgentLeague] Executing handoff to ${params.recommendation.targetAgentId}`);
      
      const response = await apiCall('/api/agents/league', {
        method: 'POST',
        body: JSON.stringify({
          action: 'execute_handoff',
          ...params
        })
      });

      if (response.success) {
        const execution = response.execution;
        
        // Add to handoff history
        setHandoffHistory(prev => [execution, ...prev.slice(0, 9)]); // Keep last 10
        
        console.log(`[useAgentLeague] Handoff executed:`, execution);
        return execution;
      } else {
        throw new Error(response.error || 'Handoff execution failed');
      }
    } catch (err: any) {
      console.error('[useAgentLeague] Execute handoff failed:', err);
      throw err;
    }
  }, [apiCall]);

  const findBestHandoff = useCallback(async (fromAgentId: string, userInput: string) => {
    try {
      const response = await apiCall('/api/agents/league', {
        method: 'POST',
        body: JSON.stringify({
          action: 'find_handoff',
          fromAgentId,
          userInput
        })
      });

      return response.success ? response.handoff : null;
    } catch (err: any) {
      console.error('[useAgentLeague] Find handoff failed:', err);
      return null;
    }
  }, [apiCall]);

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  const validateSystem = useCallback(async () => {
    try {
      const response = await apiCall('/api/agents/league?action=validate');
      return response.success ? response : null;
    } catch (err: any) {
      console.error('[useAgentLeague] System validation failed:', err);
      return null;
    }
  }, [apiCall]);

  const getSystemHealth = useCallback(async () => {
    try {
      const response = await apiCall('/api/agents/league?action=health');
      return response.success ? response : null;
    } catch (err: any) {
      console.error('[useAgentLeague] System health check failed:', err);
      return null;
    }
  }, [apiCall]);

  // =============================================================================
  // CONVERSATIONAL FEATURES
  // =============================================================================

  const chatWithAgent = useCallback(async (
    agentId: string, 
    message: string, 
    conversationHistory: any[] = [], 
    context: any = {}
  ): Promise<any> => {
    try {
      const response = await apiCall('/api/agents/chat', {
        method: 'POST',
        body: JSON.stringify({
          agentId,
          message,
          conversationHistory,
          context
        })
      });

      if (response.success) {
        // Update conversation history
        const newMessage = {
          role: 'user',
          content: message,
          timestamp: new Date().toISOString()
        };
        const agentResponse = {
          role: 'assistant',
          content: response.message,
          timestamp: new Date().toISOString(),
          agentId
        };
        
        setConversationHistory(prev => [...prev, newMessage, agentResponse]);
        return response;
      } else {
        throw new Error(response.error || 'Chat failed');
      }
    } catch (err: any) {
      console.error('[useAgentLeague] Chat with agent failed:', err);
      return { success: false, error: err.message };
    }
  }, [apiCall]);

  const getAgentChatCapabilities = useCallback(async (agentId: string): Promise<any> => {
    try {
      const response = await apiCall(`/api/agents/league?action=chat_capabilities&agentId=${agentId}`);
      return response.success ? response.capabilities : null;
    } catch (err: any) {
      console.error('[useAgentLeague] Get chat capabilities failed:', err);
      return null;
    }
  }, [apiCall]);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  // Initial load
  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadAgents();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadAgents]);
  return {
    // Agent Data
    agents,
    loading,
    error,
    
    // Single Agent Operations
    getAgent,
    getAgentVisualConfig,
    getAgentSystemPrompt,
    
    // Power Execution
    executeAgentPower,
    getPowerExecutionStatus,
    
    // Handoff System
    analyzeHandoffs,
    executeHandoff,
    findBestHandoff,
    
    // Conversational Features
    chatWithAgent,
    getAgentChatCapabilities,
    
    // Utility Functions
    refreshAgents,
    validateSystem,
    getSystemHealth,
    
    // State Management
    selectedAgent,
    setSelectedAgent,
    executionHistory,
    handoffHistory,
    
    // Conversation State
    conversationHistory,
    activeConversationAgent,
    setActiveConversationAgent
  };
}

// =============================================================================
// ADDITIONAL HOOKS
// =============================================================================

/**
 * Hook for single agent operations
 */
export function useAgent(agentId: string) {
  const { getAgent, getAgentVisualConfig, getAgentSystemPrompt, executeAgentPower } = useAgentLeague();
  
  const agent = getAgent(agentId);
  
  const executeFirstPower = useCallback(async (userPrompt: string, payload?: Record<string, any>) => {
    if (!agent || !agent.agentPowers || agent.agentPowers.length === 0) {
      throw new Error(`No powers available for agent: ${agentId}`);
    }
    
    return executeAgentPower({
      agentId,
      powerId: agent.agentPowers[0].id,
      userPrompt,
      payload
    });
  }, [agent, agentId, executeAgentPower]);
  
  return {
    agent,
    getVisualConfig: () => getAgentVisualConfig(agentId),
    getSystemPrompt: () => getAgentSystemPrompt(agentId),
    executePower: (powerId: string, userPrompt: string, payload?: Record<string, any>) =>
      executeAgentPower({ agentId, powerId, userPrompt, payload }),
    executeFirstPower
  };
}

/**
 * Hook for agent selection and workflow management
 */
export function useAgentWorkflow() {
  const { 
    agents, 
    executeAgentPower, 
    analyzeHandoffs, 
    executeHandoff,
    executionHistory,
    handoffHistory 
  } = useAgentLeague();
  
  const [workflowSteps, setWorkflowSteps] = useState<any[]>([]);
  const [currentAgent, setCurrentAgent] = useState<string | null>(null);
  
  const startWorkflow = useCallback(async (agentId: string, initialPrompt: string) => {
    setCurrentAgent(agentId);
    setWorkflowSteps([{ type: 'start', agentId, prompt: initialPrompt, timestamp: new Date() }]);
    
    // Execute initial power
    const result = await executeAgentPower({
      agentId,
      powerId: 'primary-power', // Default to first available power
      userPrompt: initialPrompt
    });
    
    setWorkflowSteps(prev => [...prev, { type: 'execution', result, timestamp: new Date() }]);
    
    // Analyze handoffs
    const handoffs = await analyzeHandoffs({
      sourceAgentId: agentId,
      userPrompt: initialPrompt,
      executionResult: result
    });
    
    if (handoffs.length > 0) {
      setWorkflowSteps(prev => [...prev, { type: 'handoffs', handoffs, timestamp: new Date() }]);
    }
    
    return { result, handoffs };
  }, [executeAgentPower, analyzeHandoffs]);
  
  const continueWorkflow = useCallback(async (handoffRecommendation: HandoffRecommendation) => {
    const execution = await executeHandoff({
      recommendation: handoffRecommendation,
      context: {
        sessionData: { 
          userId: 'current-user', 
          sessionId: `workflow_${Date.now()}`,
          userRole: 'client',
          timestamp: new Date().toISOString(),
          agentHistory: workflowSteps
        }
      },
      userConfirmation: true
    });
    
    setCurrentAgent(handoffRecommendation.targetAgentId);
    setWorkflowSteps(prev => [...prev, { type: 'handoff', execution, timestamp: new Date() }]);
    
    return execution;
  }, [executeHandoff, workflowSteps]);
  
  const resetWorkflow = useCallback(() => {
    setCurrentAgent(null);
    setWorkflowSteps([]);
  }, []);
  
  return {
    agents,
    workflowSteps,
    currentAgent,
    startWorkflow,
    continueWorkflow,
    resetWorkflow,
    executionHistory,
    handoffHistory
  };
}

console.log('[useAgentLeague] Hook initialized - Ready for agent interactions! 🎭'); 