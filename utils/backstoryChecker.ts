/**
 * Backstory Coverage Checker
 * Compares agent IDs in registry vs those in backstories
 */

import agentRegistry from '../lib/agents/agentRegistry';
import { agentBackstories } from '../lib/agents/agentBackstories';

export function checkBackstoryCoverage() {
  const registryIds = agentRegistry.map(agent => agent.id);
  const backstoryIds = Object.keys(agentBackstories);
  
  const missingBackstoryIds = registryIds.filter(id => 
    !backstoryIds.includes(id) && 
    !backstoryIds.includes(id.replace('-agent', '')) &&
    !backstoryIds.includes(id.replace('Agent', ''))
  );
  
  const extraBackstoryIds = backstoryIds.filter(id => 
    !registryIds.includes(id) && 
    !registryIds.includes(`${id}-agent`) &&
    !registryIds.includes(`${id}Agent`)
  );
  
  return {
    registryIds,
    backstoryIds,
    missingBackstoryIds,
    extraBackstoryIds,
    coverage: ((registryIds.length - missingBackstoryIds.length) / registryIds.length) * 100
  };
}

export function getMissingBackstoryIds(): string[] {
  return checkBackstoryCoverage().missingBackstoryIds;
}