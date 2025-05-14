import agentRegistry from '@/lib/agents/agentRegistry';

export function getAgentsByRole(userRole: string) {
  return agentRegistry.filter(agent => !agent.roleRequired || agent.roleRequired === userRole);
} 