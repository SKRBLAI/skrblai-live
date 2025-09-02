/**
 * Cross-Agent Handoff System
 * 
 * Manages intelligent handoffs between agents based on user intent,
 * workflow completion status, and cross-agent collaboration patterns.
 * 
 * @version 2.0.0
 * @author SKRBL AI Team
 */

import { agentLeague, type AgentConfiguration, type CrossAgentHandoff } from '../agentLeague';
import { powerEngine, type PowerExecutionResult, type HandoffSuggestion } from '../powerEngine';
import { getOptionalServerSupabase } from '../../supabase/server';
import { runAgentWorkflow } from '../runAgentWorkflow';

// =============================================================================
// HANDOFF TYPES & INTERFACES
// =============================================================================

export interface HandoffContext {
  sourceAgentId: string;
  sourceExecutionId: string;
  userPrompt: string;
  executionResult: PowerExecutionResult;
  userPreferences: UserPreferences;
  sessionData: SessionData;
}

export interface UserPreferences {
  autoHandoffs: boolean;
  preferredAgents: string[];
  workflowStyle: 'manual' | 'guided' | 'automated';
  notificationLevel: 'minimal' | 'standard' | 'detailed';
}

export interface SessionData {
  userId: string;
  sessionId: string;
  userRole: string;
  timestamp: string;
  agentHistory: AgentInteraction[];
  workflowGoal?: string;
}

export interface AgentInteraction {
  agentId: string;
  agentName: string;
  timestamp: string;
  powersUsed: string[];
  result: 'success' | 'failed' | 'partial';
  handoffInitiated: boolean;
}

export interface HandoffRecommendation {
  targetAgentId: string;
  targetAgentName: string;
  superheroName: string;
  confidence: number;
  reasoning: string;
  suggestedAction: string;
  estimatedValue: number; // 1-10 scale of value to user
  priority: 'low' | 'medium' | 'high' | 'critical';
  autoExecute: boolean;
  prerequisites: string[];
  expectedOutcome: string;
}

export interface HandoffExecution {
  id: string;
  sourceAgentId: string;
  targetAgentId: string;
  userPrompt: string;
  executionStatus: 'pending' | 'running' | 'completed' | 'failed';
  result?: PowerExecutionResult;
  chainedHandoffs: string[];
  totalValue: number;
  userSatisfaction?: number;
}

// =============================================================================
// SUPABASE CLIENT HELPER
// =============================================================================

function getSupabase() {
  return getOptionalServerSupabase();
}

// =============================================================================
// HANDOFF SYSTEM CLASS
// =============================================================================

export class HandoffSystem {
  private static instance: HandoffSystem;
  private activeHandoffs: Map<string, HandoffExecution> = new Map();
  
  private constructor() {}
  
  public static getInstance(): HandoffSystem {
    if (!HandoffSystem.instance) {
      HandoffSystem.instance = new HandoffSystem();
    }
    return HandoffSystem.instance;
  }
  
  /**
   * Analyze handoff opportunities after agent execution
   */
  public async analyzeHandoffOpportunities(context: HandoffContext): Promise<HandoffRecommendation[]> {
    console.log(`[HandoffSystem] Analyzing handoff opportunities for ${context.sourceAgentId}`);
    
    const recommendations: HandoffRecommendation[] = [];
    
    try {
      // Get direct handoff configurations
      const directHandoffs = await this.getDirectHandoffs(context);
      recommendations.push(...directHandoffs);
      
      // Get intelligent recommendations based on context
      const intelligentHandoffs = await this.getIntelligentHandoffs(context);
      recommendations.push(...intelligentHandoffs);
      
      // Get workflow-based recommendations
      const workflowHandoffs = await this.getWorkflowHandoffs(context);
      recommendations.push(...workflowHandoffs);
      
      // Sort by priority and confidence
      recommendations.sort((a, b) => {
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return b.confidence - a.confidence;
      });
      
      // Log recommendations
      await this.logHandoffAnalysis(context, recommendations);
      
      return recommendations.slice(0, 3); // Return top 3 recommendations
      
    } catch (error) {
      console.error('[HandoffSystem] Error analyzing handoffs:', error);
      return [];
    }
  }
  
  /**
   * Get direct handoff configurations from agent league
   */
  private async getDirectHandoffs(context: HandoffContext): Promise<HandoffRecommendation[]> {
    const recommendations: HandoffRecommendation[] = [];
    const handoffs = agentLeague.getHandoffTargets(context.sourceAgentId);
    
    for (const handoff of handoffs) {
      const matchScore = this.calculateHandoffMatch(handoff, context.userPrompt);
      
      if (matchScore > 0.3) { // 30% minimum match threshold
        const targetAgent = agentLeague.getAgent(handoff.targetAgentId);
        if (targetAgent) {
          recommendations.push({
            targetAgentId: handoff.targetAgentId,
            targetAgentName: targetAgent.name,
            superheroName: targetAgent.personality.superheroName,
            confidence: Math.min(95, handoff.confidence * matchScore),
            reasoning: `Direct handoff configured: ${handoff.handoffMessage}`,
            suggestedAction: this.generateActionFromHandoff(handoff, targetAgent),
            estimatedValue: this.estimateHandoffValue(handoff, context),
            priority: this.determinePriority(handoff, context),
            autoExecute: handoff.autoTrigger && context.userPreferences.autoHandoffs,
            prerequisites: [],
            expectedOutcome: targetAgent.capabilities[0]?.primaryOutput || 'Enhanced workflow results'
          });
        }
      }
    }
    
    return recommendations;
  }
  
  /**
   * Get intelligent handoff recommendations based on AI analysis
   */
  private async getIntelligentHandoffs(context: HandoffContext): Promise<HandoffRecommendation[]> {
    const recommendations: HandoffRecommendation[] = [];
    
    // Analyze user prompt for intent patterns
    const intentPatterns = this.analyzeIntentPatterns(context.userPrompt);
    
    // Get all available agents
    const availableAgents = agentLeague.getVisibleAgents()
      .filter(agent => agent.id !== context.sourceAgentId);
    
    for (const agent of availableAgents) {
      const relevanceScore = this.calculateAgentRelevance(agent, intentPatterns, context);
      
      if (relevanceScore > 0.4) { // 40% relevance threshold
        recommendations.push({
          targetAgentId: agent.id,
          targetAgentName: agent.name,
          superheroName: agent.personality.superheroName,
          confidence: Math.min(85, relevanceScore * 100),
          reasoning: `AI analysis suggests ${agent.personality.superheroName} can enhance your workflow`,
          suggestedAction: this.generateIntelligentAction(agent, context),
          estimatedValue: this.estimateIntelligentValue(agent, context),
          priority: relevanceScore > 0.7 ? 'high' : 'medium',
          autoExecute: false, // Intelligent handoffs require user confirmation
          prerequisites: this.getAgentPrerequisites(agent, context),
          expectedOutcome: agent.capabilities[0]?.primaryOutput || 'Additional capabilities'
        });
      }
    }
    
    return recommendations;
  }
  
  /**
   * Get workflow-based handoff recommendations
   */
  private async getWorkflowHandoffs(context: HandoffContext): Promise<HandoffRecommendation[]> {
    const recommendations: HandoffRecommendation[] = [];
    
    // Check if this is part of a known workflow pattern
    const workflowPattern = this.identifyWorkflowPattern(context);
    
    if (workflowPattern) {
      const nextSteps = this.getWorkflowNextSteps(workflowPattern, context);
      
      for (const step of nextSteps) {
        const targetAgent = agentLeague.getAgent(step.agentId);
        if (targetAgent) {
          recommendations.push({
            targetAgentId: step.agentId,
            targetAgentName: targetAgent.name,
            superheroName: targetAgent.personality.superheroName,
            confidence: step.confidence,
            reasoning: `Part of ${workflowPattern.name} workflow: ${step.reasoning}`,
            suggestedAction: step.action,
            estimatedValue: step.value,
            priority: step.priority,
            autoExecute: step.autoExecute,
            prerequisites: step.prerequisites,
            expectedOutcome: step.expectedOutcome
          });
        }
      }
    }
    
    return recommendations;
  }
  
  /**
   * Execute a handoff recommendation
   */
  public async executeHandoff(
    recommendation: HandoffRecommendation,
    context: HandoffContext,
    userConfirmation: boolean = false
  ): Promise<HandoffExecution> {
    const handoffId = `handoff_${context.sourceExecutionId}_${recommendation.targetAgentId}`;
    
    const execution: HandoffExecution = {
      id: handoffId,
      sourceAgentId: context.sourceAgentId,
      targetAgentId: recommendation.targetAgentId,
      userPrompt: context.userPrompt,
      executionStatus: 'running',
      chainedHandoffs: [context.sourceAgentId],
      totalValue: recommendation.estimatedValue,
    };

    this.activeHandoffs.set(handoffId, execution);
    await this.logHandoffExecution(execution, 'executed', context);

    try {
      // Extract context from the previous agent's execution result
      const continuationPayload = this.extractContinuationData(context);
      
      const payload = {
        ...continuationPayload,
        user_prompt: context.userPrompt,
        source_agent_id: context.sourceAgentId,
        source_execution_id: context.sourceExecutionId
      };

      // Run the target agent's workflow
      const result = await runAgentWorkflow(
        recommendation.targetAgentId,
        payload,
        context.sessionData.userRole
      );

      execution.result = result as any;
      if (result.status === 'success') {
        execution.executionStatus = 'completed';
      } else {
        execution.executionStatus = 'failed';
      }

      await this.logHandoffExecution(execution, execution.executionStatus, context, result.status !== 'success' ? result.result : undefined);
      
      // Here you could analyze for a chained handoff
      
      return execution;

    } catch (error: any) {
      console.error(`[HandoffSystem] Handoff execution failed for ${handoffId}:`, error);
      execution.executionStatus = 'failed';
      await this.logHandoffExecution(execution, 'failed', context, error.message);
      this.activeHandoffs.delete(handoffId);
      throw error; // Re-throw to be handled by the caller
    }
  }
  
  /**
   * Process chained handoffs (handoffs that trigger more handoffs)
   */
  private async processChainedHandoffs(
    parentExecution: HandoffExecution,
    suggestions: HandoffSuggestion[],
    originalContext: HandoffContext
  ): Promise<void> {
    
    console.log(`[HandoffSystem] Processing ${suggestions.length} chained handoffs`);
    
    for (const suggestion of suggestions) {
      if (suggestion.autoTrigger && suggestion.confidence > 80) {
        try {
          const chainedRecommendation: HandoffRecommendation = {
            targetAgentId: suggestion.targetAgentId,
            targetAgentName: suggestion.targetAgentName,
            superheroName: suggestion.targetAgentName, // Using name as superhero name fallback
            confidence: suggestion.confidence,
            reasoning: `Chained handoff: ${suggestion.suggestion}`,
            suggestedAction: suggestion.suggestion,
            estimatedValue: 7, // Medium-high value for chained handoffs
            priority: 'medium',
            autoExecute: true,
            prerequisites: [],
            expectedOutcome: 'Continued workflow enhancement'
          };
          
          const chainedExecution = await this.executeHandoff(
            chainedRecommendation,
            originalContext,
            true // Auto-confirmed for chained handoffs
          );
          
          parentExecution.chainedHandoffs.push(chainedExecution.id);
          
        } catch (error) {
          console.error('[HandoffSystem] Chained handoff failed:', error);
        }
      }
    }
  }
  
  /**
   * Get handoff execution status
   */
  public getHandoffStatus(handoffId: string): HandoffExecution | undefined {
    return this.activeHandoffs.get(handoffId);
  }
  
  /**
   * Calculate handoff match score
   */
  private calculateHandoffMatch(handoff: CrossAgentHandoff, userPrompt: string): number {
    const lowerPrompt = userPrompt.toLowerCase();
    
    let matchCount = 0;
    for (const condition of handoff.triggerConditions) {
      if (lowerPrompt.includes(condition.toLowerCase())) {
        matchCount++;
      }
    }
    
    return matchCount / handoff.triggerConditions.length;
  }
  
  /**
   * Analyze intent patterns in user prompt
   */
  private analyzeIntentPatterns(userPrompt: string): string[] {
    const patterns: string[] = [];
    const lowerPrompt = userPrompt.toLowerCase();
    
    // Common patterns
    const patternMap = {
      'content': ['blog', 'article', 'write', 'content', 'post'],
      'design': ['design', 'visual', 'brand', 'logo', 'graphics'],
      'social': ['social', 'media', 'facebook', 'twitter', 'instagram'],
      'website': ['website', 'site', 'web', 'landing', 'page'],
      'marketing': ['market', 'campaign', 'promote', 'advertise'],
      'analytics': ['data', 'analytics', 'metrics', 'report', 'insights'],
      'automation': ['automate', 'workflow', 'process', 'efficient']
    };
    
    for (const [pattern, keywords] of Object.entries(patternMap)) {
      if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
        patterns.push(pattern);
      }
    }
    
    return patterns;
  }
  
  /**
   * Calculate agent relevance score
   */
  private calculateAgentRelevance(
    agent: AgentConfiguration,
    intentPatterns: string[],
    context: HandoffContext
  ): number {
    let score = 0;
    
    // Check category matches
    if (intentPatterns.includes(agent.category.toLowerCase())) {
      score += 0.4;
    }
    
    // Check capability matches
    for (const capability of agent.capabilities) {
      for (const skill of capability.skills) {
        if (intentPatterns.some(pattern => skill.toLowerCase().includes(pattern))) {
          score += 0.2;
        }
      }
    }
    
    // Check power matches
    for (const power of agent.powers) {
      if (power.triggerKeywords.some(keyword => 
        intentPatterns.some(pattern => keyword.toLowerCase().includes(pattern))
      )) {
        score += 0.3;
      }
    }
    
    // Avoid immediate loops (don't suggest the same agent that just ran)
    if (context.sessionData.agentHistory.some(interaction => 
      interaction.agentId === agent.id && 
      Date.now() - new Date(interaction.timestamp).getTime() < 60000 // Within last minute
    )) {
      score *= 0.5; // Reduce score by 50% for recent usage
    }
    
    return Math.min(1, score); // Cap at 1.0
  }
  
  /**
   * Extract continuation data from context
   */
  private extractContinuationData(context: HandoffContext): Record<string, any> {
    return {
      sourceAgent: context.sourceAgentId,
      sourceResult: context.executionResult.data,
      userGoal: context.sessionData.workflowGoal,
      sessionHistory: context.sessionData.agentHistory.slice(-3), // Last 3 interactions
      timestamp: context.sessionData.timestamp
    };
  }
  
  // Helper methods for generating recommendations
  private generateActionFromHandoff(handoff: CrossAgentHandoff, agent: AgentConfiguration): string {
    return `${handoff.handoffMessage} ${agent.personality.catchphrase}`;
  }
  
  private generateIntelligentAction(agent: AgentConfiguration, context: HandoffContext): string {
    return `Let ${agent.personality.superheroName} enhance your workflow with ${agent.capabilities[0]?.category || 'their powers'}`;
  }
  
  private estimateHandoffValue(handoff: CrossAgentHandoff, context: HandoffContext): number {
    return Math.max(5, Math.min(10, Math.floor(handoff.confidence / 10)));
  }
  
  private estimateIntelligentValue(agent: AgentConfiguration, context: HandoffContext): number {
    return agent.premium ? 8 : 6; // Premium agents provide higher value
  }
  
  private determinePriority(handoff: CrossAgentHandoff, context: HandoffContext): HandoffRecommendation['priority'] {
    if (handoff.confidence > 90) return 'critical';
    if (handoff.confidence > 75) return 'high';
    if (handoff.confidence > 50) return 'medium';
    return 'low';
  }
  
  private getAgentPrerequisites(agent: AgentConfiguration, context: HandoffContext): string[] {
    const prerequisites: string[] = [];
    
    if (agent.premium && context.sessionData.userRole === 'client') {
      prerequisites.push('Premium subscription required');
    }
    
    return prerequisites;
  }
  
  private identifyWorkflowPattern(context: HandoffContext): any {
    // Placeholder for workflow pattern identification
    return null;
  }
  
  private getWorkflowNextSteps(pattern: any, context: HandoffContext): any[] {
    // Placeholder for workflow next steps
    return [];
  }
  
  /**
   * Log handoff analysis to Supabase
   */
  private async logHandoffAnalysis(
    context: HandoffContext,
    recommendations: HandoffRecommendation[]
  ): Promise<void> {
    if (recommendations.length === 0) return;

    const handoffRecords = recommendations.map(rec => ({
      source_agent_id: context.sourceAgentId,
      target_agent_id: rec.targetAgentId,
      source_execution_id: context.sourceExecutionId,
      user_id: context.sessionData.userId,
      status: 'recommended',
      recommendation_details: rec as any,
    }));

    const supabase = getSupabase();
    if (!supabase) {
      console.warn('[HANDOFF_SYSTEM] Supabase not available, skipping handoff logging');
      return;
    }
    
    const { error } = await supabase.from('agent_handoffs').insert(handoffRecords);
    if (error) {
      console.error('[HandoffSystem] Error logging handoff analysis:', error);
    }
  }
  
  /**
   * Log the execution of a handoff
   */
  private async logHandoffExecution(
    execution: HandoffExecution,
    status: 'executed' | 'completed' | 'failed',
    context: HandoffContext,
    error?: string
  ): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) {
      console.warn('[HANDOFF_SYSTEM] Supabase not available, skipping handoff execution logging');
      return;
    }
    
    const { data, error: updateError } = await supabase
      .from('agent_handoffs')
      .update({
        status: status,
        execution_details: { ...execution, error } as any,
      })
      .eq('source_agent_id', execution.sourceAgentId)
      .eq('target_agent_id', execution.targetAgentId)
      .eq('source_execution_id', context.sourceExecutionId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (updateError) {
      console.error(`[HandoffSystem] Error updating handoff execution log for ${execution.id}:`, updateError);
    }
  }
}

// =============================================================================
// EXPORT SINGLETON INSTANCE & UTILITIES
// =============================================================================

export const handoffSystem = HandoffSystem.getInstance();

/**
 * Helper function to analyze handoff opportunities
 */
export async function analyzeHandoffOpportunities(context: HandoffContext): Promise<HandoffRecommendation[]> {
  return handoffSystem.analyzeHandoffOpportunities(context);
}

/**
 * Helper function to execute handoff
 */
export async function executeHandoff(
  recommendation: HandoffRecommendation,
  context: HandoffContext,
  userConfirmation: boolean = false
): Promise<HandoffExecution> {
  return handoffSystem.executeHandoff(recommendation, context, userConfirmation);
}

/**
 * Helper function to get handoff status
 */
export function getHandoffStatus(handoffId: string): HandoffExecution | undefined {
  return handoffSystem.getHandoffStatus(handoffId);
}

console.log('[HandoffSystem] System initialized - Cross-agent collaboration ready! 🤝'); 