/**
 * Agent Guards - Utilities to check agent capabilities and permissions
 */

import agentRegistry from './agentRegistry';
import type { Agent } from '@/types/agent';

/**
 * Check if an agent supports chat functionality
 * @param agentId - The agent ID to check
 * @returns true if the agent supports chat, false otherwise
 */
export function agentSupportsChat(agentId: string): boolean {
  const agent = agentRegistry.find(a => a.id === agentId);
  
  if (!agent) {
    console.warn(`[agentSupportsChat] Agent not found: ${agentId}`);
    return false;
  }

  // Check if chatEnabled is explicitly set, default to true if not specified
  if (typeof agent.chatEnabled === 'boolean') {
    return agent.chatEnabled;
  }

  // Check canConverse property
  if (typeof agent.canConverse === 'boolean') {
    return agent.canConverse;
  }

  // Default to true - all agents should support chat unless explicitly disabled
  return true;
}

/**
 * Check if an agent is available/visible
 * @param agentId - The agent ID to check
 * @returns true if the agent is visible and available
 */
export function isAgentAvailable(agentId: string): boolean {
  const agent = agentRegistry.find(a => a.id === agentId);
  return agent ? agent.visible !== false : false;
}

/**
 * Get agent by ID with null safety
 * @param agentId - The agent ID to get
 * @returns Agent object or null if not found
 */
export function getAgentById(agentId: string): Agent | null {
  return agentRegistry.find(a => a.id === agentId) || null;
}

/**
 * Check if an agent has required permissions for user
 * @param agentId - The agent ID to check
 * @param userRole - User role (optional, defaults to 'user')
 * @returns true if user has access to the agent
 */
export function hasAgentAccess(agentId: string, userRole: string = 'user'): boolean {
  const agent = agentRegistry.find(a => a.id === agentId);
  
  if (!agent) {
    return false;
  }

  // Check role requirements
  if (agent.roleRequired) {
    switch (agent.roleRequired) {
      case 'pro':
        return ['pro', 'enterprise', 'admin'].includes(userRole);
      case 'enterprise':
        return ['enterprise', 'admin'].includes(userRole);
      case 'admin':
        return userRole === 'admin';
      default:
        return true;
    }
  }

  return true;
}

/**
 * Get all chat-enabled agents
 * @returns Array of agents that support chat
 */
export function getChatEnabledAgents(): Agent[] {
  return agentRegistry.filter(agent => 
    agent.visible !== false && agentSupportsChat(agent.id)
  );
}