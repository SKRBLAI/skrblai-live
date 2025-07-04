/**
 * Cross-Agent Handoff & Workflow Chaining System
 * 
 * Enables intelligent handoffs between agents based on context,
 * user intent, and agent capabilities for seamless multi-agent workflows.
 */

import { getAgent, getAllAgents } from '@/lib/agents/agentLeague';
import { trackFunnelEvent } from '@/lib/analytics/userFunnelTracking';

interface HandoffContext {
  sourceAgentId: string;
  targetAgentId?: string;
  userIntent: string;
  currentWorkflowData?: any;
  userPreferences?: {
    preferredAgents?: string[];
    avoidedAgents?: string[];
    workflowStyle?: 'fast' | 'thorough' | 'creative';
  };
  sessionContext: {
    userId: string;
    sessionId: string;
    userTier: string;
    previousAgents: string[];
    totalHandoffs: number;
  };
}

interface HandoffRecommendation {
  agentId: string;
  agentName: string;
  superheroName: string;
  confidence: number; // 0-100
  reasoning: string;
  estimatedDuration: number; // minutes
  requiredTier: string;
  handoffType: 'sequential' | 'parallel' | 'conditional';
  prerequisites?: string[];
  expectedOutputs: string[];
}

interface WorkflowChain {
  id: string;
  name: string;
  description: string;
  agents: Array<{
    agentId: string;
    order: number;
    conditions?: string[];
    parallelWith?: string[];
    outputMapping?: Record<string, string>;
  }>;
  estimatedDuration: number;
  requiredTier: string;
  successRate: number;
  userRating: number;
}

interface HandoffResult {
  success: boolean;
  targetAgent?: HandoffRecommendation;
  alternativeAgents?: HandoffRecommendation[];
  workflowChain?: WorkflowChain;
  error?: string;
  handoffId: string;
}

/**
 * Analyze user intent and recommend the best agent handoff
 */
export async function analyzeHandoffIntent(context: HandoffContext): Promise<HandoffResult> {
  try {
    const handoffId = `handoff_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('[Cross-Agent Handoff] Analyzing handoff intent:', {
      sourceAgent: context.sourceAgentId,
      userIntent: context.userIntent,
      sessionId: context.sessionContext.sessionId
    });

    // Get all available agents
    const allAgents = getAllAgents();
    const sourceAgent = getAgent(context.sourceAgentId);
    
    if (!sourceAgent) {
      return {
        success: false,
        error: 'Source agent not found',
        handoffId
      };
    }

    // Analyze user intent and generate recommendations
    const recommendations = await generateHandoffRecommendations(context, allAgents);
    
    if (recommendations.length === 0) {
      return {
        success: false,
        error: 'No suitable agents found for handoff',
        handoffId
      };
    }

    // Get the best recommendation
    const bestRecommendation = recommendations[0];
    const alternativeAgents = recommendations.slice(1, 4); // Top 3 alternatives

    // Check if we can create a workflow chain
    const workflowChain = await suggestWorkflowChain(context, recommendations);

    // Track the handoff analysis
    await trackFunnelEvent({
      event_type: 'feature_use',
      user_id: context.sessionContext.userId,
      session_id: context.sessionContext.sessionId,
      feature_name: 'cross_agent_handoff',
      agent_id: context.sourceAgentId,
      metadata: {
        target_agent: bestRecommendation.agentId,
        confidence: bestRecommendation.confidence,
        handoff_type: bestRecommendation.handoffType,
        user_intent: context.userIntent,
        handoff_id: handoffId
      }
    });

    return {
      success: true,
      targetAgent: bestRecommendation,
      alternativeAgents,
      workflowChain,
      handoffId
    };

  } catch (error) {
    console.error('[Cross-Agent Handoff] Error analyzing handoff:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      handoffId: `error_${Date.now()}`
    };
  }
}

/**
 * Generate handoff recommendations based on context and agent capabilities
 */
async function generateHandoffRecommendations(
  context: HandoffContext,
  allAgents: any[]
): Promise<HandoffRecommendation[]> {
  const recommendations: HandoffRecommendation[] = [];
  const sourceAgent = getAgent(context.sourceAgentId);
  
  if (!sourceAgent) return recommendations;

  // Intent analysis keywords
  const intentKeywords = context.userIntent.toLowerCase();
  const userTier = context.sessionContext.userTier;

  for (const agent of allAgents) {
    if (agent.id === context.sourceAgentId) continue; // Skip source agent
    if (context.sessionContext.previousAgents.includes(agent.id)) continue; // Avoid loops

    // Calculate confidence based on multiple factors
    let confidence = 0;
    let reasoning = '';

    // 1. Category matching (30% weight)
    if (agent.category && sourceAgent.category !== agent.category) {
      confidence += 30;
      reasoning += `Complementary expertise (${agent.category}). `;
    }

    // 2. Capability matching (40% weight)
    const capabilityMatch = calculateCapabilityMatch(intentKeywords, agent);
    confidence += capabilityMatch * 0.4;
    if (capabilityMatch > 50) {
      reasoning += `Strong capability match for "${context.userIntent}". `;
    }

    // 3. User preferences (20% weight)
    if (context.userPreferences?.preferredAgents?.includes(agent.id)) {
      confidence += 20;
      reasoning += 'User preferred agent. ';
    }
    if (context.userPreferences?.avoidedAgents?.includes(agent.id)) {
      confidence -= 30;
      reasoning += 'User avoided agent. ';
    }

    // 4. Tier compatibility (10% weight)
    const tierCompatible = checkTierCompatibility(userTier, agent.requiredTier || 'starter');
    if (tierCompatible) {
      confidence += 10;
    } else {
      confidence -= 50; // Heavy penalty for tier mismatch
      reasoning += `Requires ${agent.requiredTier} tier. `;
    }

    // 5. Historical success rate bonus
    confidence += getHistoricalSuccessRate(agent.id) * 0.1;

    // Only include agents with reasonable confidence
    if (confidence >= 30) {
      recommendations.push({
        agentId: agent.id,
        agentName: agent.name,
        superheroName: agent.superheroName || agent.name,
        confidence: Math.min(Math.round(confidence), 100),
        reasoning: reasoning.trim(),
        estimatedDuration: estimateAgentDuration(agent),
        requiredTier: agent.requiredTier || 'starter',
        handoffType: determineHandoffType(context, agent),
        prerequisites: getAgentPrerequisites(agent),
        expectedOutputs: getAgentExpectedOutputs(agent)
      });
    }
  }

  // Sort by confidence and return top recommendations
  return recommendations
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 8);
}

/**
 * Calculate how well an agent's capabilities match the user intent
 */
function calculateCapabilityMatch(intentKeywords: string, agent: any): number {
  let matchScore = 0;
  
  // Check against agent description
  if (agent.description) {
    const description = agent.description.toLowerCase();
    const words = intentKeywords.split(' ');
    
    for (const word of words) {
      if (word.length > 3 && description.includes(word)) {
        matchScore += 15;
      }
    }
  }

  // Check against agent capabilities
  if (agent.capabilities) {
    for (const capability of agent.capabilities) {
      if (intentKeywords.includes(capability.toLowerCase())) {
        matchScore += 25;
      }
    }
  }

  // Check against agent category
  if (agent.category && intentKeywords.includes(agent.category.toLowerCase())) {
    matchScore += 20;
  }

  return Math.min(matchScore, 100);
}

/**
 * Check if user tier is compatible with agent requirements
 */
function checkTierCompatibility(userTier: string, requiredTier: string): boolean {
  const tierHierarchy = ['client', 'starter', 'star', 'all_star', 'admin'];
  const userIndex = tierHierarchy.indexOf(userTier);
  const requiredIndex = tierHierarchy.indexOf(requiredTier);
  
  return userIndex >= requiredIndex;
}

/**
 * Get historical success rate for an agent (placeholder - would use real data)
 */
function getHistoricalSuccessRate(agentId: string): number {
  // Placeholder - would query agent_performance_metrics table
  const successRates: Record<string, number> = {
    'percy': 95,
    'content-creator': 88,
    'social-media-manager': 92,
    'email-marketer': 85,
    'seo-specialist': 90
  };
  
  return successRates[agentId] || 80;
}

/**
 * Estimate duration for agent workflow
 */
function estimateAgentDuration(agent: any): number {
  // Base duration by category
  const categoryDurations: Record<string, number> = {
    'Content Creation': 15,
    'Marketing': 10,
    'Analytics': 5,
    'Design': 20,
    'Development': 30,
    'Strategy': 12
  };
  
  return categoryDurations[agent.category] || 10;
}

/**
 * Determine the type of handoff based on context
 */
function determineHandoffType(context: HandoffContext, agent: any): 'sequential' | 'parallel' | 'conditional' {
  // Simple logic - could be more sophisticated
  if (context.userPreferences?.workflowStyle === 'fast') {
    return 'parallel';
  }
  
  if (agent.category === 'Analytics' || agent.category === 'Strategy') {
    return 'conditional';
  }
  
  return 'sequential';
}

/**
 * Get prerequisites for an agent
 */
function getAgentPrerequisites(agent: any): string[] {
  const prerequisites: Record<string, string[]> = {
    'seo-specialist': ['Website content', 'Target keywords'],
    'social-media-manager': ['Brand guidelines', 'Content calendar'],
    'email-marketer': ['Email list', 'Campaign objectives']
  };
  
  return prerequisites[agent.id] || [];
}

/**
 * Get expected outputs from an agent
 */
function getAgentExpectedOutputs(agent: any): string[] {
  const outputs: Record<string, string[]> = {
    'content-creator': ['Blog posts', 'Articles', 'Copy'],
    'social-media-manager': ['Social posts', 'Content calendar', 'Engagement strategy'],
    'seo-specialist': ['SEO audit', 'Keyword strategy', 'Optimization recommendations']
  };
  
  return outputs[agent.id] || ['Workflow results', 'Recommendations'];
}

/**
 * Suggest a workflow chain for complex multi-agent tasks
 */
async function suggestWorkflowChain(
  context: HandoffContext,
  recommendations: HandoffRecommendation[]
): Promise<WorkflowChain | undefined> {
  if (recommendations.length < 2) return undefined;

  // Predefined workflow chains for common scenarios
  const workflowChains: WorkflowChain[] = [
    {
      id: 'content-marketing-chain',
      name: 'Complete Content Marketing Workflow',
      description: 'End-to-end content creation, optimization, and promotion',
      agents: [
        { agentId: 'content-creator', order: 1 },
        { agentId: 'seo-specialist', order: 2 },
        { agentId: 'social-media-manager', order: 3 }
      ],
      estimatedDuration: 45,
      requiredTier: 'starter',
      successRate: 92,
      userRating: 4.7
    },
    {
      id: 'brand-launch-chain',
      name: 'Brand Launch Campaign',
      description: 'Complete brand launch with content, design, and marketing',
      agents: [
        { agentId: 'brand-strategist', order: 1 },
        { agentId: 'content-creator', order: 2, parallelWith: ['graphic-designer'] },
        { agentId: 'graphic-designer', order: 2, parallelWith: ['content-creator'] },
        { agentId: 'social-media-manager', order: 3 }
      ],
      estimatedDuration: 90,
      requiredTier: 'star',
      successRate: 88,
      userRating: 4.9
    }
  ];

  // Find matching workflow chain
  const intentKeywords = context.userIntent.toLowerCase();
  
  for (const chain of workflowChains) {
    const chainAgentIds = chain.agents.map(a => a.agentId);
    const recommendedAgentIds = recommendations.map(r => r.agentId);
    
    // Check if we have agents for this chain
    const hasRequiredAgents = chainAgentIds.every(agentId => 
      recommendedAgentIds.includes(agentId)
    );
    
    // Check tier compatibility
    const tierCompatible = checkTierCompatibility(
      context.sessionContext.userTier, 
      chain.requiredTier
    );
    
    if (hasRequiredAgents && tierCompatible) {
      // Check if intent matches chain purpose
      if (
        (chain.id === 'content-marketing-chain' && 
         (intentKeywords.includes('content') || intentKeywords.includes('marketing'))) ||
        (chain.id === 'brand-launch-chain' && 
         (intentKeywords.includes('brand') || intentKeywords.includes('launch')))
      ) {
        return chain;
      }
    }
  }

  return undefined;
}

/**
 * Execute a handoff to another agent
 */
export async function executeHandoff(
  handoffId: string,
  targetAgentId: string,
  context: HandoffContext,
  workflowData?: any
): Promise<{ success: boolean; executionId?: string; error?: string }> {
  try {
    console.log('[Cross-Agent Handoff] Executing handoff:', {
      handoffId,
      sourceAgent: context.sourceAgentId,
      targetAgent: targetAgentId,
      sessionId: context.sessionContext.sessionId
    });

    // Track the handoff execution
    await trackFunnelEvent({
      event_type: 'agent_launch',
      user_id: context.sessionContext.userId,
      session_id: context.sessionContext.sessionId,
      agent_id: targetAgentId,
      metadata: {
        handoff_id: handoffId,
        source_agent: context.sourceAgentId,
        handoff_type: 'cross_agent',
        workflow_data: workflowData ? Object.keys(workflowData) : []
      }
    });

    // Here you would integrate with your workflow execution system
    // For now, we'll simulate the handoff
    const executionId = `exec_${handoffId}_${targetAgentId}`;

    return {
      success: true,
      executionId
    };

  } catch (error) {
    console.error('[Cross-Agent Handoff] Error executing handoff:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get handoff history for a user session
 */
export async function getHandoffHistory(
  userId: string,
  sessionId?: string,
  limit: number = 10
): Promise<any[]> {
  // This would query the user_funnel_events table for handoff events
  // For now, return empty array
  return [];
}

/**
 * Rate a handoff experience
 */
export async function rateHandoff(
  handoffId: string,
  rating: number,
  feedback?: string
): Promise<void> {
  try {
    // This would store the rating in the database
    console.log('[Cross-Agent Handoff] Handoff rated:', {
      handoffId,
      rating,
      feedback
    });
  } catch (error) {
    console.error('[Cross-Agent Handoff] Error rating handoff:', error);
  }
} 