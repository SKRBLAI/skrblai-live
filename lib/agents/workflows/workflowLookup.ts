/**
 * Agent Workflow Lookup Utility
 * 
 * Central utility for fetching agent workflow configurations and managing
 * n8n workflow IDs and webhook URLs for all SKRBL AI agents.
 * 
 * @version 2.0.0
 * @author SKRBL AI Team
 */

import { agentBackstories, type AgentBackstory } from '../agentBackstories';
import { agentLeague, type AgentConfiguration } from '../agentLeague';

// =============================================================================
// WORKFLOW CONFIGURATION TYPES
// =============================================================================

export interface AgentWorkflowConfig {
  agentId: string;
  agentName: string;
  superheroName: string;
  n8nWorkflowId?: string;
  n8nWebhookUrl?: string;
  workflowCapabilities: string[];
  automationTriggers: string[];
  handoffPreferences: string[];
  hasWorkflow: boolean;
  fallbackBehavior: 'mock' | 'error' | 'redirect';
  estimatedDuration: number; // in minutes
  requiresPremium: boolean;
}

export interface WorkflowExecutionContext {
  userId: string;
  userRole: string;
  sessionId: string;
  requestTimestamp: string;
  userPrompt: string;
  fileData?: any;
  previousAgent?: string;
  handoffReason?: string;
}

// =============================================================================
// ENVIRONMENT CONFIGURATION
// =============================================================================

function getN8nBaseUrl(): string {
  return process.env.N8N_BASE_URL || process.env.NEXT_PUBLIC_N8N_BASE_URL || '';
} // Always call this at runtime


// =============================================================================
// CORE WORKFLOW LOOKUP FUNCTIONS
// =============================================================================

/**
 * Get complete workflow configuration for an agent
 */
export function getAgentWorkflowConfig(agentId: string): AgentWorkflowConfig | null {
  try {
    // Get agent configuration from league
    const agent = agentLeague.getAgent(agentId);
    if (!agent) {
      console.warn(`[WorkflowLookup] Agent not found: ${agentId}`);
      return null;
    }

    // Get backstory for workflow configuration
    const backstory = agentBackstories[agentId];
    if (!backstory) {
      console.warn(`[WorkflowLookup] No backstory found for agent: ${agentId}`);
      return createFallbackConfig(agent);
    }

    // Build complete workflow configuration
    const config: AgentWorkflowConfig = {
      agentId: agent.id,
      agentName: agent.name,
      superheroName: backstory.superheroName,
      n8nWorkflowId: backstory.n8nWorkflowId || agent.n8nWorkflowId,
      n8nWebhookUrl: backstory.n8nWebhookUrl || buildWebhookUrl(backstory.n8nWorkflowId || agent.n8nWorkflowId),
      workflowCapabilities: backstory.workflowCapabilities || [],
      automationTriggers: backstory.automationTriggers || [],
      handoffPreferences: backstory.handoffPreferences || [],
      hasWorkflow: !!(backstory.n8nWorkflowId || agent.n8nWorkflowId),
      fallbackBehavior: agent.fallbackBehavior || 'mock',
      estimatedDuration: calculateEstimatedDuration(agent),
      requiresPremium: agent.premium || false
    };

    console.log(`[WorkflowLookup] Configuration loaded for ${agentId}:`, {
      hasWorkflow: config.hasWorkflow,
      workflowId: config.n8nWorkflowId,
      capabilities: config.workflowCapabilities.length
    });

    return config;

  } catch (error) {
    console.error(`[WorkflowLookup] Error getting workflow config for ${agentId}:`, error);
    return null;
  }
}

/**
 * Get multiple agent workflow configurations
 */
export function getMultipleAgentWorkflowConfigs(agentIds: string[]): Record<string, AgentWorkflowConfig | null> {
  const configs: Record<string, AgentWorkflowConfig | null> = {};
  
  for (const agentId of agentIds) {
    configs[agentId] = getAgentWorkflowConfig(agentId);
  }
  
  return configs;
}

/**
 * Get all agents with active workflows
 */
export function getAgentsWithWorkflows(): AgentWorkflowConfig[] {
  const allAgents = agentLeague.getAllAgents();
  const agentsWithWorkflows: AgentWorkflowConfig[] = [];

  for (const agent of allAgents) {
    const config = getAgentWorkflowConfig(agent.id);
    if (config && config.hasWorkflow) {
      agentsWithWorkflows.push(config);
    }
  }

  return agentsWithWorkflows;
}

/**
 * Find agents by workflow capability
 */
export function findAgentsByCapability(capability: string): AgentWorkflowConfig[] {
  const allAgents = agentLeague.getAllAgents();
  const matchingAgents: AgentWorkflowConfig[] = [];

  for (const agent of allAgents) {
    const config = getAgentWorkflowConfig(agent.id);
    if (config && config.workflowCapabilities.includes(capability)) {
      matchingAgents.push(config);
    }
  }

  return matchingAgents;
}

/**
 * Find best agent for a trigger phrase
 */
export function findAgentByTrigger(triggerPhrase: string): AgentWorkflowConfig | null {
  const allAgents = agentLeague.getAllAgents();
  const lowerTrigger = triggerPhrase.toLowerCase();

  for (const agent of allAgents) {
    const config = getAgentWorkflowConfig(agent.id);
    if (!config || !config.hasWorkflow) continue;

    // Check if any automation triggers match
    for (const trigger of config.automationTriggers) {
      if (lowerTrigger.includes(trigger.toLowerCase())) {
        return config;
      }
    }
  }

  return null;
}

/**
 * Get handoff suggestions for an agent
 */
export function getHandoffSuggestions(agentId: string, context?: string): AgentWorkflowConfig[] {
  const config = getAgentWorkflowConfig(agentId);
  if (!config) return [];

  const suggestions: AgentWorkflowConfig[] = [];

  for (const handoffAgentId of config.handoffPreferences) {
    const handoffConfig = getAgentWorkflowConfig(handoffAgentId);
    if (handoffConfig && handoffConfig.hasWorkflow) {
      suggestions.push(handoffConfig);
    }
  }

  return suggestions;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Build webhook URL from workflow ID
 */
function buildWebhookUrl(workflowId?: string): string | undefined {
  const baseUrl = getN8nBaseUrl();
  if (!workflowId || !baseUrl) return undefined;
  return `${baseUrl}/webhook/${workflowId}`;
}

/**
 * Returns the webhook URL for an agent, or null if not configured.
 */
export function ensureAgentWebhook(agentId: string): string | null {
  const config = getAgentWorkflowConfig(agentId);
  if (!config || !config.n8nWebhookUrl) return null;
  return config.n8nWebhookUrl;
}

/**
 * Create fallback configuration for agents without backstory
 */
function createFallbackConfig(agent: AgentConfiguration): AgentWorkflowConfig {
  return {
    agentId: agent.id,
    agentName: agent.name,
    superheroName: agent.name,
    n8nWorkflowId: agent.n8nWorkflowId,
    n8nWebhookUrl: buildWebhookUrl(agent.n8nWorkflowId),
    workflowCapabilities: [],
    automationTriggers: [],
    handoffPreferences: [],
    hasWorkflow: !!agent.n8nWorkflowId,
    fallbackBehavior: agent.fallbackBehavior || 'mock',
    estimatedDuration: 5,
    requiresPremium: agent.premium || false
  };
}

/**
 * Calculate estimated duration based on agent capabilities
 */
function calculateEstimatedDuration(agent: AgentConfiguration): number {
  // Base duration
  let duration = 5;

  // Adjust based on agent category
  if (agent.category === 'Analytics') duration = 15;
  else if (agent.category === 'Creative') duration = 20;
  else if (agent.category === 'Content') duration = 10;
  else if (agent.category === 'Social Media') duration = 8;

  // Adjust for premium features
  if (agent.premium) duration *= 1.5;

  return Math.ceil(duration);
}

/**
 * Validate workflow configuration
 */
export function validateWorkflowConfig(agentId: string): {
  valid: boolean;
  issues: string[];
  recommendations: string[];
} {
  const config = getAgentWorkflowConfig(agentId);
  const issues: string[] = [];
  const recommendations: string[] = [];

  if (!config) {
    return {
      valid: false,
      issues: ['Agent configuration not found'],
      recommendations: ['Check agent ID and ensure agent exists in agentLeague']
    };
  }

  // Check for missing workflow ID
  if (!config.n8nWorkflowId) {
    issues.push('No n8n workflow ID configured');
    recommendations.push('Add n8nWorkflowId to agent backstory or league configuration');
  }

  // Check for missing webhook URL
  if (!config.n8nWebhookUrl) {
    issues.push('No webhook URL configured');
    recommendations.push('Ensure N8N_BASE_URL environment variable is set');
  }

  // Check for missing capabilities
  if (config.workflowCapabilities.length === 0) {
    recommendations.push('Add workflowCapabilities to improve agent discoverability');
  }

  // Check for missing triggers
  if (config.automationTriggers.length === 0) {
    recommendations.push('Add automationTriggers to improve agent routing');
  }

  return {
    valid: issues.length === 0,
    issues,
    recommendations
  };
}

/**
 * Get workflow statistics
 */
export function getWorkflowStatistics(): {
  totalAgents: number;
  agentsWithWorkflows: number;
  agentsWithoutWorkflows: number;
  averageCapabilities: number;
  mostCapableAgent: string;
  coveragePercentage: number;
} {
  const allAgents = agentLeague.getAllAgents();
  const workflowConfigs = allAgents.map(agent => getAgentWorkflowConfig(agent.id)).filter(Boolean) as AgentWorkflowConfig[];
  
  const agentsWithWorkflows = workflowConfigs.filter(config => config.hasWorkflow);
  const totalCapabilities = workflowConfigs.reduce((sum, config) => sum + config.workflowCapabilities.length, 0);
  
  let mostCapableAgent = '';
  let maxCapabilities = 0;
  
  for (const config of workflowConfigs) {
    if (config.workflowCapabilities.length > maxCapabilities) {
      maxCapabilities = config.workflowCapabilities.length;
      mostCapableAgent = config.superheroName;
    }
  }

  return {
    totalAgents: allAgents.length,
    agentsWithWorkflows: agentsWithWorkflows.length,
    agentsWithoutWorkflows: allAgents.length - agentsWithWorkflows.length,
    averageCapabilities: workflowConfigs.length > 0 ? totalCapabilities / workflowConfigs.length : 0,
    mostCapableAgent,
    coveragePercentage: (agentsWithWorkflows.length / allAgents.length) * 100
  };
}

// =============================================================================
// LEGACY COMPATIBILITY
// =============================================================================

/**
 * Legacy function for backward compatibility
 */
export function getWorkflowIdForAgent(agentId: string): string | undefined {
  const config = getAgentWorkflowConfig(agentId);
  return config?.n8nWorkflowId;
}

/**
 * Legacy function for backward compatibility
 */
export function getWebhookUrlForAgent(agentId: string): string | undefined {
  const config = getAgentWorkflowConfig(agentId);
  return config?.n8nWebhookUrl;
} 