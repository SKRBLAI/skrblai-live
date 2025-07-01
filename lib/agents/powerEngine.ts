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
import { getAgentWorkflowConfig, type AgentWorkflowConfig, type WorkflowExecutionContext } from './workflowLookup';
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
  private agentLeague: typeof agentLeague;
  private powerCache: Map<string, AgentPower[]> = new Map();
  private workflowCache: Map<string, any> = new Map();
  private lastCacheUpdate: number = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  
  private constructor() {
    this.agentLeague = agentLeague; // Fix: agentLeague is already an instance
    this.initializePowerCache();
  }
  
  public static getInstance(): PowerEngine {
    if (!PowerEngine.instance) {
      PowerEngine.instance = new PowerEngine();
    }
    return PowerEngine.instance;
  }
  
  /**
   * MMM Protocol: Initialize power cache for faster lookups
   */
  private initializePowerCache(): void {
    const agents = this.agentLeague.getAllAgents();
    agents.forEach(agent => {
      this.powerCache.set(agent.id, agent.powers);
    });
    this.lastCacheUpdate = Date.now();
  }
  
  /**
   * MMM Protocol: Fast agent power lookup with caching
   */
  public getAgentPowers(agentId: string): AgentPower[] {
    // Cache refresh check
    if (Date.now() - this.lastCacheUpdate > this.CACHE_TTL) {
      this.initializePowerCache();
    }

    return this.powerCache.get(agentId) || [];
  }
  
  /**
   * Execute an agent power
   */
  public async executePower(request: PowerExecutionRequest): Promise<PowerExecutionResult> {
    const startTime = Date.now();
    
    try {
      console.log(`[PowerEngine] Executing power ${request.powerId} for agent ${request.agentId}`);
      
      // Get agent and power configuration
      const agent = this.agentLeague.getAgent(request.agentId);
      if (!agent) {
        throw new Error(`Agent not found: ${request.agentId}`);
      }
      
      const power = this.getAgentPowers(request.agentId).find(p => p.id === request.powerId);
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
    const handoff = this.agentLeague.findBestHandoff(agentId, userPrompt);
    if (handoff) {
      const targetAgent = this.agentLeague.getAgent(handoff.targetAgentId);
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
    return ['starter', 'star', 'all_star', 'pro', 'enterprise', 'vip', 'admin'].includes(userRole);
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
    
    const targetAgent = this.agentLeague.getAgent(handoffSuggestion.targetAgentId);
    if (!targetAgent) {
      throw new Error(`Target agent not found: ${handoffSuggestion.targetAgentId}`);
    }
    
    // Find the best power to trigger on target agent based on handoff payload
    const targetPower = this.getAgentPowers(handoffSuggestion.targetAgentId)[0]; // For now, use first power
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

  /**
   * MMM Protocol: Clear caches for testing/debugging
   */
  public clearCaches(): void {
    this.powerCache.clear();
    this.workflowCache.clear();
    this.lastCacheUpdate = 0;
  }

  /**
   * MMM Protocol: Get cache performance metrics
   */
  public getCacheMetrics(): {
    cacheSize: number;
    cacheAge: number;
    cacheTTL: number;
    hitRate: number;
    lastUpdate: string;
  } {
    return {
      cacheSize: this.powerCache.size,
      cacheAge: Date.now() - this.lastCacheUpdate,
      cacheTTL: this.CACHE_TTL,
      hitRate: this.powerCache.size > 0 ? 95 : 0, // Estimate based on cache presence
      lastUpdate: new Date(this.lastCacheUpdate).toISOString()
    };
  }

  /**
   * MMM Protocol: Validate system performance
   */
  public async validatePerformance(): Promise<{
    cacheEfficiency: boolean;
    agentCount: number;
    powerCount: number;
    responseTime: number;
    status: 'optimal' | 'good' | 'degraded';
  }> {
    const startTime = Date.now();
    
    // Test cache performance
    const testAgentId = 'percy-agent';
    const powers = this.getAgentPowers(testAgentId);
    
    const responseTime = Date.now() - startTime;
    const cacheEfficient = responseTime < 50; // Should be under 50ms
    
    const totalAgents = this.agentLeague.getAllAgents().length;
    const totalPowers = Array.from(this.powerCache.values()).reduce((sum, powers) => sum + powers.length, 0);
    
    let status: 'optimal' | 'good' | 'degraded' = 'optimal';
    if (responseTime > 100) status = 'degraded';
    else if (responseTime > 50) status = 'good';
    
    return {
      cacheEfficiency: cacheEfficient,
      agentCount: totalAgents,
      powerCount: totalPowers,
      responseTime,
      status
    };
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

// =============================================================================
// ENHANCED N8N WORKFLOW INTEGRATION
// =============================================================================

/**
 * Enhanced N8N workflow trigger with full agent personality and context injection
 */
export async function triggerAgentWorkflow(
  agentId: string, 
  payload: any,
  context: WorkflowExecutionContext
): Promise<PowerExecutionResult> {
  
  const startTime = Date.now();
  const executionId = `workflow_${Date.now()}_${agentId}_${Math.random().toString(36).substr(2, 6)}`;
  
  try {
    console.log(`[PowerEngine] Triggering workflow for agent ${agentId}`);
    
    // Get comprehensive workflow configuration
    const workflowConfig = getAgentWorkflowConfig(agentId);
    if (!workflowConfig) {
      throw new Error(`Workflow configuration not found for agent: ${agentId}`);
    }
    
    if (!workflowConfig.hasWorkflow) {
      console.warn(`[PowerEngine] Agent ${agentId} has no workflow configured, using mock mode`);
      return createMockWorkflowResult(agentId, workflowConfig, executionId, payload, context);
    }
    
    // Check premium requirements
    if (workflowConfig.requiresPremium && !hasPremiumAccess(context.userRole)) {
      throw new Error(`Agent ${workflowConfig.superheroName} requires premium access`);
    }
    
    // Prepare enhanced payload with full agent personality injection
    const enhancedPayload = {
      // Core execution data
      executionId,
      agentId: workflowConfig.agentId,
      agentName: workflowConfig.agentName,
      superheroName: workflowConfig.superheroName,
      
      // User request and context
      userPrompt: context.userPrompt,
      userId: context.userId,
      userRole: context.userRole,
      sessionId: context.sessionId,
      timestamp: context.requestTimestamp,
      
      // Workflow-specific data
      workflowCapabilities: workflowConfig.workflowCapabilities,
      estimatedDuration: workflowConfig.estimatedDuration,
      
      // Original payload and file data
      payload: payload || {},
      fileData: context.fileData,
      
      // Handoff context (if applicable)
      previousAgent: context.previousAgent,
      handoffReason: context.handoffReason,
      
      // Platform metadata
      platform: 'skrbl-ai-v2',
      source: 'enhanced-power-engine',
      version: '2.0.0'
    };
    
    // Trigger the N8N workflow
    const n8nResult = await triggerN8nWorkflow(workflowConfig.n8nWorkflowId!, enhancedPayload);
    
    // Calculate estimated completion time
    const estimatedCompletion = new Date(
      Date.now() + (workflowConfig.estimatedDuration * 60 * 1000)
    ).toISOString();
    
    // Log execution to database
    await logWorkflowExecution(executionId, agentId, workflowConfig, context, n8nResult);
    
    // Prepare result
    const result: PowerExecutionResult = {
      success: n8nResult.success,
      executionId,
      agentId: workflowConfig.agentId,
      powerId: 'workflow-execution',
      powerName: `${workflowConfig.superheroName} Workflow`,
      status: n8nResult.status as any || 'running',
      data: n8nResult.data,
      error: n8nResult.error,
      estimatedCompletion,
      metrics: {
        executionTime: Date.now() - startTime,
        cost: calculateWorkflowCost(workflowConfig, context.userRole)
      }
    };
    
    console.log(`[PowerEngine] Workflow triggered successfully: ${executionId}`);
    return result;
    
  } catch (error: any) {
    console.error(`[PowerEngine] Workflow trigger failed for ${agentId}:`, error);
    
    return {
      success: false,
      executionId,
      agentId,
      powerId: 'workflow-execution',
      powerName: 'Workflow Execution',
      status: 'failed',
      error: error.message || 'Unknown workflow error',
      metrics: {
        executionTime: Date.now() - startTime
      }
    };
  }
}

/**
 * Create mock workflow result for agents without configured workflows
 */
function createMockWorkflowResult(
  agentId: string,
  config: AgentWorkflowConfig,
  executionId: string,
  payload: any,
  context: WorkflowExecutionContext
): PowerExecutionResult {
  const mockData = {
    message: `${config.superheroName} has been activated! (Mock Mode)`,
    agent: config.agentName,
    capabilities: config.workflowCapabilities,
    userRequest: context.userPrompt,
    timestamp: new Date().toISOString(),
    mode: 'mock',
    note: 'This is a simulated response. Connect n8n workflow for real automation.'
  };
  
  return {
    success: true,
    executionId,
    agentId,
    powerId: 'mock-workflow',
    powerName: `${config.superheroName} (Mock)`,
    status: 'completed',
    data: mockData,
    metrics: {
      executionTime: 1000, // 1 second for mock
      cost: 0
    }
  };
}

/**
 * Log workflow execution to database
 */
async function logWorkflowExecution(
  executionId: string,
  agentId: string,
  config: AgentWorkflowConfig,
  context: WorkflowExecutionContext,
  n8nResult: any
): Promise<void> {
  try {
    await supabase.from('agent_workflow_executions').insert({
      execution_id: executionId,
      agent_id: agentId,
      agent_name: config.agentName,
      superhero_name: config.superheroName,
      n8n_workflow_id: config.n8nWorkflowId,
      user_id: context.userId,
      user_role: context.userRole,
      session_id: context.sessionId,
      user_prompt: context.userPrompt,
      workflow_capabilities: config.workflowCapabilities,
      estimated_duration: config.estimatedDuration,
      status: n8nResult.status || 'triggered',
      success: n8nResult.success,
      error_message: n8nResult.error || null,
      previous_agent: context.previousAgent || null,
      handoff_reason: context.handoffReason || null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[PowerEngine] Failed to log workflow execution:', error);
    // Don't fail the main workflow if logging fails
  }
}

/**
 * Calculate workflow execution cost
 */
function calculateWorkflowCost(config: AgentWorkflowConfig, userRole: string): number {
  let baseCost = config.estimatedDuration * 0.15; // $0.15 per minute
  
  // Role-based pricing tiers
  if (userRole === 'all_star' || userRole === 'enterprise') baseCost *= 0.6; // 40% discount
  else if (userRole === 'star') baseCost *= 0.75; // 25% discount
  else if (userRole === 'starter' || userRole === 'pro') baseCost *= 0.85; // 15% discount
  
  // Premium agent surcharge
  if (config.requiresPremium) baseCost *= 1.3;
  
  return Number(baseCost.toFixed(2));
}

/**
 * Check premium access
 */
function hasPremiumAccess(userRole: string): boolean {
  return ['starter', 'star', 'all_star', 'pro', 'enterprise', 'vip', 'admin'].includes(userRole);
}

console.log('[PowerEngine] System initialized - Powers ready for action! ⚡'); 