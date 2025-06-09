/**
 * Agent Power Engine - Modular N8N Workflow Trigger System
 * 
 * This module handles the execution of agent powers and their corresponding
 * N8N workflows, API calls, and cross-agent handoffs.
 * 
 * @version 2.0.0
 * @author SKRBL AI Team
 */

import { triggerN8nWorkflow } from '@/lib/n8nClient';
import { agentLeague, type AgentPower, type AgentConfiguration } from './agentLeague';
import { createClient } from '@supabase/supabase-js';

// =============================================================================
// POWER EXECUTION TYPES
// =============================================================================

export interface PowerExecutionContext {
  userId: string;
  userRole: string;
  sessionId: string;
  metadata: Record<string, any>;
  requestTimestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface PowerExecutionRequest {
  agentId: string;
  powerId: string;
  userPrompt: string;
  payload: Record<string, any>;
  context: PowerExecutionContext;
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

// =============================================================================
// SUPABASE CLIENT
// =============================================================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// =============================================================================
// POWER ENGINE CLASS
// =============================================================================

export class PowerEngine {
  private static instance: PowerEngine;
  
  private constructor() {}
  
  public static getInstance(): PowerEngine {
    if (!PowerEngine.instance) {
      PowerEngine.instance = new PowerEngine();
    }
    return PowerEngine.instance;
  }
  
  /**
   * Execute an agent power
   */
  public async executePower(request: PowerExecutionRequest): Promise<PowerExecutionResult> {
    const startTime = Date.now();
    
    try {
      console.log(`[PowerEngine] Executing power ${request.powerId} for agent ${request.agentId}`);
      
      // Get agent and power configuration
      const agent = agentLeague.getAgent(request.agentId);
      if (!agent) {
        throw new Error(`Agent not found: ${request.agentId}`);
      }
      
      const power = agent.powers.find(p => p.id === request.powerId);
      if (!power) {
        throw new Error(`Power not found: ${request.powerId} for agent ${request.agentId}`);
      }
      
      // Check premium requirements
      if (power.premiumRequired && !this.hasPremiumAccess(request.context.userRole)) {
        throw new Error(`Power ${power.name} requires premium access`);
      }
      
      // Create execution ID
      const executionId = `power_${Date.now()}_${request.agentId}_${request.powerId}`;
      
      // Log execution start
      await this.logPowerExecution(executionId, request, agent, power, 'running');
      
      // Execute the power based on its type
      let result: PowerExecutionResult;
      
      if (power.n8nWorkflowId) {
        result = await this.executeN8nPower(executionId, request, agent, power);
      } else if (power.apiEndpoint) {
        result = await this.executeApiPower(executionId, request, agent, power);
      } else {
        result = await this.executeMockPower(executionId, request, agent, power);
      }
      
      // Add execution metrics
      result.metrics = {
        ...result.metrics,
        executionTime: Date.now() - startTime
      };
      
      // Generate handoff suggestions
      result.handoffSuggestions = await this.generateHandoffSuggestions(
        request.agentId, 
        request.userPrompt, 
        result
      );
      
      // Log completion
      await this.logPowerExecution(executionId, request, agent, power, result.status, result);
      
      console.log(`[PowerEngine] Power execution completed: ${executionId}`);
      return result;
      
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      
      console.error(`[PowerEngine] Power execution failed:`, error);
      
      const errorResult: PowerExecutionResult = {
        success: false,
        executionId: `error_${Date.now()}_${request.agentId}_${request.powerId}`,
        agentId: request.agentId,
        powerId: request.powerId,
        powerName: request.powerId,
        status: 'failed',
        error: error.message || 'Unknown error',
        metrics: {
          executionTime
        }
      };
      
      return errorResult;
    }
  }
  
  /**
   * Execute N8N-based power
   */
  private async executeN8nPower(
    executionId: string,
    request: PowerExecutionRequest,
    agent: AgentConfiguration,
    power: AgentPower
  ): Promise<PowerExecutionResult> {
    
    // Prepare enhanced payload with agent personality
    const enhancedPayload = {
      agentId: agent.id,
      agentName: agent.name,
      powerId: power.id,
      powerName: power.name,
      capability: power.description,
      userPrompt: request.userPrompt,
      payload: request.payload,
      fileData: request.fileData,
      timestamp: request.context.requestTimestamp,
      source: 'agent-power-engine',
      executionId,
      
      // Agent personality injection for enhanced responses
      personality: {
        superheroName: agent.personality.superheroName,
        powers: agent.personality.powers,
        catchphrase: agent.personality.catchphrase,
        voiceTone: agent.personality.voiceTone,
        communicationStyle: agent.personality.communicationStyle
      },
      
      // User context
      context: request.context
    };
    
    // Trigger N8N workflow
    const n8nResult = await triggerN8nWorkflow(power.n8nWorkflowId!, enhancedPayload);
    
    const estimatedCompletion = new Date(
      Date.now() + (power.estimatedDuration * 60 * 1000)
    ).toISOString();
    
    return {
      success: n8nResult.success,
      executionId,
      agentId: agent.id,
      powerId: power.id,
      powerName: power.name,
      status: n8nResult.status as any || 'running',
      data: n8nResult.data,
      error: n8nResult.error,
      estimatedCompletion,
      metrics: {
        executionTime: 0, // Will be filled by caller
        cost: this.calculatePowerCost(power, request.context.userRole)
      }
    };
  }
  
  /**
   * Execute API-based power
   */
  private async executeApiPower(
    executionId: string,
    request: PowerExecutionRequest,
    agent: AgentConfiguration,
    power: AgentPower
  ): Promise<PowerExecutionResult> {
    
    const apiPayload = {
      agentId: agent.id,
      powerId: power.id,
      userPrompt: request.userPrompt,
      payload: request.payload,
      context: request.context,
      personality: agent.personality,
      executionId
    };
    
    try {
      const response = await fetch(power.apiEndpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.INTERNAL_API_KEY}`,
          'X-Execution-ID': executionId
        },
        body: JSON.stringify(apiPayload)
      });
      
      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }
      
      const apiResult = await response.json();
      
      return {
        success: true,
        executionId,
        agentId: agent.id,
        powerId: power.id,
        powerName: power.name,
        status: 'completed',
        data: apiResult,
        metrics: {
          executionTime: 0, // Will be filled by caller
          cost: this.calculatePowerCost(power, request.context.userRole)
        }
      };
      
    } catch (error: any) {
      return {
        success: false,
        executionId,
        agentId: agent.id,
        powerId: power.id,
        powerName: power.name,
        status: 'failed',
        error: error.message,
        metrics: {
          executionTime: 0
        }
      };
    }
  }
  
  /**
   * Execute mock power (for testing or agents without workflows)
   */
  private async executeMockPower(
    executionId: string,
    request: PowerExecutionRequest,
    agent: AgentConfiguration,
    power: AgentPower
  ): Promise<PowerExecutionResult> {
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockResult = {
      message: `${agent.personality.superheroName} has activated ${power.name}!`,
      capability: power.description,
      userRequest: request.userPrompt,
      catchphrase: agent.personality.catchphrase,
      timestamp: new Date().toISOString(),
      mode: 'mock'
    };
    
    return {
      success: true,
      executionId,
      agentId: agent.id,
      powerId: power.id,
      powerName: power.name,
      status: 'completed',
      data: mockResult,
      metrics: {
        executionTime: 0, // Will be filled by caller
        cost: 0 // Mock is free
      }
    };
  }
  
  /**
   * Generate cross-agent handoff suggestions
   */
  private async generateHandoffSuggestions(
    agentId: string,
    userPrompt: string,
    executionResult: PowerExecutionResult
  ): Promise<HandoffSuggestion[]> {
    
    const suggestions: HandoffSuggestion[] = [];
    
    // Find potential handoffs based on user prompt
    const handoff = agentLeague.findBestHandoff(agentId, userPrompt);
    if (handoff) {
      const targetAgent = agentLeague.getAgent(handoff.targetAgentId);
      if (targetAgent) {
        suggestions.push({
          targetAgentId: handoff.targetAgentId,
          targetAgentName: targetAgent.personality.superheroName,
          suggestion: handoff.handoffMessage,
          confidence: handoff.confidence,
          autoTrigger: handoff.autoTrigger,
          triggerPayload: {
            previousAgent: agentId,
            previousResult: executionResult.data,
            handoffReason: 'workflow_continuation'
          }
        });
      }
    }
    
    // Add contextual suggestions based on execution result
    if (executionResult.success && executionResult.data) {
      const contextualSuggestions = this.getContextualHandoffs(agentId, executionResult);
      suggestions.push(...contextualSuggestions);
    }
    
    return suggestions;
  }
  
  /**
   * Get contextual handoff suggestions based on execution result
   */
  private getContextualHandoffs(
    agentId: string,
    executionResult: PowerExecutionResult
  ): HandoffSuggestion[] {
    const suggestions: HandoffSuggestion[] = [];
    
    // Example: If branding agent created a brand, suggest content creation
    if (agentId === 'branding-agent' && executionResult.powerId === 'brand-identity-creation') {
      suggestions.push({
        targetAgentId: 'content-creator-agent',
        targetAgentName: 'ContentCarltig the Word Weaver',
        suggestion: "Your brand identity looks amazing! Ready to create content that tells your brand story?",
        confidence: 85,
        autoTrigger: false,
        triggerPayload: {
          brandAssets: executionResult.data,
          workflowType: 'brand_content_creation'
        }
      });
    }
    
    // Example: If content created, suggest social media distribution
    if (agentId === 'content-creator-agent' && executionResult.powerId === 'article-generation') {
      suggestions.push({
        targetAgentId: 'social-bot-agent',
        targetAgentName: 'SocialNino the Viral Virtuoso',
        suggestion: "Great content! Want me to help you distribute this across social media channels?",
        confidence: 75,
        autoTrigger: false,
        triggerPayload: {
          content: executionResult.data,
          workflowType: 'content_distribution'
        }
      });
    }
    
    return suggestions;
  }
  
  /**
   * Calculate power execution cost
   */
  private calculatePowerCost(power: AgentPower, userRole: string): number {
    // Base cost calculation
    let baseCost = power.estimatedDuration * 0.1; // $0.10 per minute
    
    // Role-based discounts
    if (userRole === 'enterprise') {
      baseCost *= 0.7; // 30% discount
    } else if (userRole === 'pro') {
      baseCost *= 0.85; // 15% discount
    }
    
    // Premium powers cost more
    if (power.premiumRequired) {
      baseCost *= 1.5;
    }
    
    return Number(baseCost.toFixed(2));
  }
  
  /**
   * Check if user has premium access
   */
  private hasPremiumAccess(userRole: string): boolean {
    return ['pro', 'enterprise'].includes(userRole);
  }
  
  /**
   * Log power execution to Supabase
   */
  private async logPowerExecution(
    executionId: string,
    request: PowerExecutionRequest,
    agent: AgentConfiguration,
    power: AgentPower,
    status: string,
    result?: PowerExecutionResult
  ): Promise<void> {
    try {
      await supabase.from('agent_power_executions').insert({
        execution_id: executionId,
        agent_id: agent.id,
        agent_name: agent.name,
        power_id: power.id,
        power_name: power.name,
        user_id: request.context.userId,
        user_role: request.context.userRole,
        user_prompt: request.userPrompt,
        status,
        success: result?.success || null,
        execution_time: result?.metrics.executionTime || null,
        cost: result?.metrics.cost || null,
        n8n_workflow_id: power.n8nWorkflowId || null,
        api_endpoint: power.apiEndpoint || null,
        error_message: result?.error || null,
        payload: JSON.stringify(request.payload),
        result_data: result?.data ? JSON.stringify(result.data) : null,
        handoff_suggestions: result?.handoffSuggestions ? JSON.stringify(result.handoffSuggestions) : null,
        timestamp: new Date().toISOString(),
        session_id: request.context.sessionId,
        ip_address: request.context.ipAddress,
        user_agent: request.context.userAgent
      });
    } catch (error) {
      console.error('[PowerEngine] Failed to log execution:', error);
      // Don't fail the main request if logging fails
    }
  }
  
  /**
   * Get power execution status
   */
  public async getPowerExecutionStatus(executionId: string): Promise<PowerExecutionResult | null> {
    try {
      const { data, error } = await supabase
        .from('agent_power_executions')
        .select('*')
        .eq('execution_id', executionId)
        .single();
      
      if (error || !data) {
        return null;
      }
      
      return {
        success: data.success,
        executionId: data.execution_id,
        agentId: data.agent_id,
        powerId: data.power_id,
        powerName: data.power_name,
        status: data.status,
        data: data.result_data ? JSON.parse(data.result_data) : null,
        error: data.error_message,
        handoffSuggestions: data.handoff_suggestions ? JSON.parse(data.handoff_suggestions) : [],
        metrics: {
          executionTime: data.execution_time || 0,
          cost: data.cost || 0
        }
      };
    } catch (error) {
      console.error('[PowerEngine] Failed to get execution status:', error);
      return null;
    }
  }
  
  /**
   * Execute cross-agent handoff
   */
  public async executeHandoff(
    sourceExecutionId: string,
    handoffSuggestion: HandoffSuggestion,
    userContext: PowerExecutionContext
  ): Promise<PowerExecutionResult> {
    
    console.log(`[PowerEngine] Executing handoff to ${handoffSuggestion.targetAgentId}`);
    
    const targetAgent = agentLeague.getAgent(handoffSuggestion.targetAgentId);
    if (!targetAgent) {
      throw new Error(`Target agent not found: ${handoffSuggestion.targetAgentId}`);
    }
    
    // Find the best power to trigger on target agent based on handoff payload
    const targetPower = targetAgent.powers[0]; // For now, use first power
    if (!targetPower) {
      throw new Error(`No powers available for target agent: ${handoffSuggestion.targetAgentId}`);
    }
    
    // Create handoff execution request
    const handoffRequest: PowerExecutionRequest = {
      agentId: handoffSuggestion.targetAgentId,
      powerId: targetPower.id,
      userPrompt: `Handoff from previous agent: ${handoffSuggestion.suggestion}`,
      payload: handoffSuggestion.triggerPayload || {},
      context: {
        ...userContext,
        metadata: {
          ...userContext.metadata,
          handoffSource: sourceExecutionId,
          handoffType: 'auto',
          previousAgent: handoffSuggestion.targetAgentId
        }
      }
    };
    
    // Execute the handoff
    return await this.executePower(handoffRequest);
  }
}

// =============================================================================
// EXPORT SINGLETON INSTANCE
// =============================================================================

export const powerEngine = PowerEngine.getInstance();

/**
 * Helper function to execute a power
 */
export async function executePower(request: PowerExecutionRequest): Promise<PowerExecutionResult> {
  return powerEngine.executePower(request);
}

/**
 * Helper function to get execution status
 */
export async function getPowerExecutionStatus(executionId: string): Promise<PowerExecutionResult | null> {
  return powerEngine.getPowerExecutionStatus(executionId);
}

/**
 * Helper function to execute handoff
 */
export async function executeHandoff(
  sourceExecutionId: string,
  handoffSuggestion: HandoffSuggestion,
  userContext: PowerExecutionContext
): Promise<PowerExecutionResult> {
  return powerEngine.executeHandoff(sourceExecutionId, handoffSuggestion, userContext);
}

console.log('[PowerEngine] System initialized - Powers ready for action! ⚡'); 