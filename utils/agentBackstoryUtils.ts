import { agentBackstories } from '@/lib/agents/agentBackstories';
import type { Agent } from '@/types/agent';

/**
 * Get backstory data for an agent with fallbacks
 * 
 * @param agentId The agent ID
 * @returns The backstory data or undefined if not found
 */
export function getAgentBackstory(agentId: string) {
  if (!agentId) return undefined;
  
  return agentBackstories[agentId] || 
         agentBackstories[agentId.replace('-agent', '')] || 
         agentBackstories[agentId.replace('Agent', '')];
}

/**
 * Enrich an agent object with backstory data
 * 
 * @param agent The agent object
 * @returns An enriched agent object with backstory data
 */
export function enrichAgentWithBackstory(agent: Agent): Agent {
  if (!agent || !agent.id) return agent;
  
  const backstory = getAgentBackstory(agent.id);
  if (!backstory) return agent;
  
  return {
    ...agent,
    ...backstory,
    // Ensure these fields are preserved from the agent object if they exist
    name: agent.name || backstory.superheroName,
    description: agent.description || backstory.backstory,
    capabilities: agent.capabilities || backstory.powers || [],
  };
}

/**
 * Enrich an array of agents with backstory data
 * 
 * @param agents Array of agent objects
 * @returns Array of enriched agent objects with backstory data
 */
export function enrichAgentsWithBackstory(agents: Agent[]): Agent[] {
  if (!agents || !Array.isArray(agents)) return [];
  
  return agents.map(agent => enrichAgentWithBackstory(agent));
}

/**
 * Create a basic agent object from an agent ID and backstory
 * 
 * @param agentId The agent ID
 * @returns A basic agent object with backstory data
 */
export function createAgentFromBackstory(agentId: string): Agent | null {
  if (!agentId) return null;
  
  const backstory = getAgentBackstory(agentId);
  if (!backstory) return null;
  
  return {
    id: agentId,
    name: backstory.superheroName || agentId,
    description: backstory.backstory || '',
    category: '',
    capabilities: backstory.powers || [],
    visible: true,
    canConverse: false,
    recommendedHelpers: [],
    handoffTriggers: [],
    ...backstory
  };
}

/**
 * Get the superhero name for an agent
 * 
 * @param agent The agent object or agent ID
 * @returns The superhero name or the agent name/ID if not found
 */
export function getAgentSuperheroName(agent: Agent | string): string {
  if (!agent) return '';
  
  const agentId = typeof agent === 'string' ? agent : agent.id;
  if (!agentId) return typeof agent === 'string' ? agent : agent.name || '';
  
  const backstory = getAgentBackstory(agentId);
  if (!backstory || !backstory.superheroName) {
    return typeof agent === 'string' ? agent : agent.name || agentId;
  }
  
  return backstory.superheroName;
} 