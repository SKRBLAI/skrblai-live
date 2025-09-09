// Agent asset management utilities

export type AgentSlug = 
  | 'adcreative'
  | 'analytics' 
  | 'biz'
  | 'branding'
  | 'clientsuccess'
  | 'contentcreation'
  | 'ira'
  | 'payment'
  | 'percy'
  | 'proposal'
  | 'publishing'
  | 'site'
  | 'skillsmith'
  | 'social'
  | 'sync'
  | 'videocontent'
  | 'default';

export interface AgentImagePaths {
  webp: string;
  fallback: string;
}

/**
 * Get standardized image paths for an agent
 * @param slug - Agent slug identifier
 * @returns Object with webp and fallback image paths
 */
export function getAgentImagePaths(slug: AgentSlug): AgentImagePaths {
  // Special case for analytics (DonData) - has analytics-nobg.png fallback
  if (slug === 'analytics') {
    return {
      webp: `/images/agents/${slug}.webp`,
      fallback: `/images/agents/${slug}-nobg.png`
    };
  }
  
  // Standard pattern: {slug}.webp primary, {slug}-nobg.png fallback
  return {
    webp: `/images/agents/${slug}.webp`,
    fallback: `/images/agents/${slug}-nobg.png`
  };
}

/**
 * Validate if a string is a valid agent slug
 */
export function isValidAgentSlug(slug: string): slug is AgentSlug {
  const validSlugs: AgentSlug[] = [
    'adcreative', 'analytics', 'biz', 'branding', 'clientsuccess', 
    'contentcreation', 'ira', 'payment', 'percy', 'proposal', 
    'publishing', 'site', 'skillsmith', 'social', 'sync', 
    'videocontent', 'default'
  ];
  return validSlugs.includes(slug as AgentSlug);
}