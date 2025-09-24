/**
 * Agent Routing Utilities
 * 
 * Provides canonical routing functions for agent paths across the application.
 * Ensures consistent navigation to agent pages from modals, cards, and CTAs.
 */

import type { Agent } from '@/types/agent';

/**
 * Generate canonical agent path from agent ID or route with optional view
 */
export function agentPath(agentIdOrRoute: string, view?: 'home' | 'backstory' | 'chat'): string {
  if (!agentIdOrRoute) {
    console.warn('[agentPath] Empty agent ID provided, falling back to /agents');
    return '/agents';
  }

  // If already a full path, return as-is (unless view is specified)
  if (agentIdOrRoute.startsWith('/agents/') && !view) {
    return agentIdOrRoute;
  }

  // If it's just an agent ID, construct the path
  const cleanId = agentIdOrRoute.startsWith('/agents/') 
    ? agentIdOrRoute.replace('/agents/', '').split('?')[0].split('#')[0]
    : agentIdOrRoute
        .toLowerCase()
        .replace(/-agent$/, '')  // Remove -agent suffix
        .replace(/agent$/, '');  // Remove Agent suffix

  const basePath = `/agents/${cleanId}`;

  // Handle different views
  switch (view) {
    case 'backstory':
      return `${basePath}/backstory`;
    case 'chat':
      return `${basePath}?view=chat`;
    case 'home':
      return basePath;
    default:
      // Default to backstory for League context when no view specified
      return basePath;
  }
}

/**
 * Safe version of agentPath that handles null/undefined gracefully
 */
export function safeAgentPath(agentIdOrRoute?: string | null): string {
  if (!agentIdOrRoute) {
    return '/agents';
  }
  
  try {
    return agentPath(agentIdOrRoute);
  } catch (error) {
    console.warn('[safeAgentPath] Error generating agent path:', error);
    return '/agents';
  }
}

/**
 * Generate agent path from Agent object with optional view
 */
export function agentPathFromObject(agent: Agent, view?: 'home' | 'backstory' | 'chat'): string {
  // Prefer explicit route if available and no view specified
  if (agent.route && agent.route.startsWith('/') && !view) {
    return agent.route;
  }
  
  // Use agent ID with view
  return agentPath(agent.id, view);
}

/**
 * Safe version for Agent objects with optional view
 */
export function safeAgentPathFromObject(agent?: Agent | null, view?: 'home' | 'backstory' | 'chat'): string {
  if (!agent) {
    return '/agents';
  }
  
  try {
    return agentPathFromObject(agent, view);
  } catch (error) {
    console.warn('[safeAgentPathFromObject] Error generating agent path:', error);
    return '/agents';
  }
}

/**
 * Get agent league (overview) path
 */
export function agentLeaguePath(): string {
  return '/agents';
}

/**
 * Get agent path with specific action/tab
 */
export function agentPathWithAction(agentIdOrRoute: string, action: string): string {
  const basePath = agentPath(agentIdOrRoute);
  return `${basePath}?action=${encodeURIComponent(action)}`;
}

/**
 * Validate if a path is a valid agent route
 */
export function isValidAgentPath(path: string): boolean {
  if (!path || typeof path !== 'string') {
    return false;
  }
  
  // Must start with /agents/
  if (!path.startsWith('/agents/')) {
    return path === '/agents'; // League page is valid
  }
  
  // Extract agent ID and validate format
  const agentId = path.replace('/agents/', '').split('?')[0].split('#')[0];
  return agentId.length > 0 && /^[a-z0-9-]+$/.test(agentId);
}

/**
 * Extract agent ID from agent path
 */
export function extractAgentId(path: string): string | null {
  if (!isValidAgentPath(path)) {
    return null;
  }
  
  if (path === '/agents') {
    return null; // League page, no specific agent
  }
  
  const agentId = path.replace('/agents/', '').split('?')[0].split('#')[0];
  return agentId || null;
}

/**
 * Common agent IDs mapping for quick reference
 */
export const AGENT_IDS = {
  PERCY: 'percy',
  SKILLSMITH: 'skillsmith',
  BUSINESS: 'biz',
  CONTENT: 'contentcreation',
  SOCIAL: 'social',
  ANALYTICS: 'analytics',
  BRANDING: 'branding',
  PUBLISHING: 'publishing',
  VIDEO: 'videocontent',
  SITE: 'site',
  PROPOSAL: 'proposal',
  PAYMENT: 'payment',
  CLIENT_SUCCESS: 'clientsuccess',
  SYNC: 'sync',
  AD_CREATIVE: 'adcreative'
} as const;

/**
 * Get popular agent paths for quick access
 */
export function getPopularAgentPaths(): { name: string; path: string; description: string }[] {
  return [
    {
      name: 'Percy AI Concierge',
      path: agentPath(AGENT_IDS.PERCY),
      description: 'Your intelligent business advisor'
    },
    {
      name: 'SkillSmith Sports',
      path: agentPath(AGENT_IDS.SKILLSMITH),
      description: 'Athletic performance optimization'
    },
    {
      name: 'Business Automation',
      path: agentPath(AGENT_IDS.BUSINESS),
      description: 'Streamline operations and growth'
    },
    {
      name: 'Content Creation',
      path: agentPath(AGENT_IDS.CONTENT),
      description: 'Generate engaging content at scale'
    },
    {
      name: 'Social Media',
      path: agentPath(AGENT_IDS.SOCIAL),
      description: 'Amplify your social presence'
    }
  ];
}