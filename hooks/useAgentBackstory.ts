import { useMemo } from 'react';
import { agentBackstories } from '../lib/agents/agentBackstories';
import type { Agent } from '@/types/agent';

/**
 * Custom hook for accessing agent backstory data
 * Provides a consistent way to access agent backstories across components
 * 
 * @param agent The agent object or agent ID
 * @returns An enriched agent object with backstory data
 */
export function useAgentBackstory(agent: Agent | string): Agent | null {
  return useMemo(() => {
    if (!agent) return null;
    
    // Get agent ID
    const agentId = typeof agent === 'string' ? agent : agent.id;
    if (!agentId) return null;
    
    // Get backstory data with fallbacks
    const backstory = agentBackstories[agentId] || 
                     agentBackstories[agentId.replace('-agent', '')] || 
                     agentBackstories[agentId.replace('Agent', '')];
    
    if (!backstory) {
      console.warn(`No backstory found for agent: ${agentId}`);
      return typeof agent === 'string' ? null : agent;
    }
    
    // If agent is a string ID, we don't have the agent object to merge with
    if (typeof agent === 'string') {
      return {
        id: agent,
        name: backstory.superheroName || agent,
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
    
    // Merge agent data with backstory
    return {
      ...agent,
      ...backstory,
      // Ensure these fields are preserved from the agent object if they exist
      name: agent.name || backstory.superheroName,
      description: agent.description || backstory.backstory,
      capabilities: agent.capabilities || backstory.powers || [],
    };
  }, [agent]);
}

/**
 * Get an array of enriched agents with backstory data
 * 
 * @param agents Array of agent objects
 * @returns Array of enriched agent objects with backstory data
 */
export function useAgentBackstories(agents: Agent[]): Agent[] {
  return useMemo(() => {
    if (!agents || !Array.isArray(agents)) return [];
    
    return agents.map(agent => {
      const enrichedAgent = useAgentBackstory(agent);
      return enrichedAgent || agent;
    });
  }, [agents]);
}

export default useAgentBackstory; 