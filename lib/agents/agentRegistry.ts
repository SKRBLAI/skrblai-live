import { Agent } from '@/types/agent';
import { getDefaultOrbitParams, getAgentImageSlug, validateAgents } from '@/utils/agentUtils';

// Import all agents
import adCreativeAgent from '@/ai-agents/adCreativeAgent';
import analyticsAgent from '@/ai-agents/analyticsAgent';
import bizAgent from '@/ai-agents/bizAgent';
import brandingAgent from '@/ai-agents/brandingAgent';
import clientSuccessAgent from '@/ai-agents/clientSuccessAgent';
import contentCreatorAgent from '@/ai-agents/contentCreatorAgent';
import paymentManagerAgent from '@/ai-agents/paymentManagerAgent';
import percyAgent from '@/ai-agents/percyAgent';
import percySyncAgent from '@/ai-agents/percySyncAgent';
import proposalGeneratorAgent from '@/ai-agents/proposalGeneratorAgent';
import publishingAgent from '@/ai-agents/publishingAgent';
import sitegenAgent from '@/ai-agents/sitegenAgent';
import socialBotAgent from '@/ai-agents/socialBotAgent';
import videoContentAgent from '@/ai-agents/videoContentAgent';

// Debug log on import (this executes during module initialization)
console.log('AgentRegistry module initializing...');

const genderMap = [
  'female', 'male', 'female', 'male', 'female', 'male', 'female', 'male', 'female', 'male', 'female', 'male', 'male', 'male'
] as const;

// Create array of all available agents (including hidden ones)
const allAgents: Agent[] = [
  adCreativeAgent,
  analyticsAgent,
  bizAgent,
  brandingAgent,
  clientSuccessAgent,
  contentCreatorAgent,
  paymentManagerAgent,
  percyAgent,
  percySyncAgent,
  proposalGeneratorAgent,
  publishingAgent,
  sitegenAgent,
  socialBotAgent,
  videoContentAgent
].map((agent, idx) => {
  const imageSlug = agent.imageSlug || getAgentImageSlug(agent);
  const hoverSummary = agent.hoverSummary || agent.description || '';
  const route = agent.route || `/dashboard/${agent.id}`;
  const orbit = agent.orbit || getDefaultOrbitParams(idx);
  // Normalize gender to 'male' | 'female' | 'neutral', fallback to genderMap for invalid or missing values
  const rawGender = (agent as any).gender as string | undefined;
  let gender: 'male' | 'female' | 'neutral';
  switch (rawGender) {
    case 'male':
    case 'female':
    case 'neutral':
      gender = rawGender;
      break;
    case 'masculine':
      gender = 'male';
      break;
    case 'feminine':
      gender = 'female';
      break;
    default:
      gender = genderMap[idx % genderMap.length];
  }
  // Audit for missing metadata
  const missing = [];
  if (!gender) missing.push('gender');
  if (!imageSlug) missing.push('imageSlug');
  if (!route) missing.push('route');
  if (!hoverSummary) missing.push('hoverSummary');
  if (!orbit) missing.push('orbit');
  if (missing.length > 0) {
    console.warn(`[AgentRegistry] Agent ${agent.name || agent.id} missing metadata:`, missing);
  }
  return {
    ...agent,
    orbit,
    hoverSummary,
    imageSlug,
    route,
    gender,
  };
});

// Development-only metadata validation
if (process.env.NODE_ENV === 'development') {
  validateAgents(allAgents);
}

// Log out the agents for debugging
console.log(`All agents loaded: ${allAgents.length}`);
if (allAgents.some(a => a === undefined || a === null)) {
  console.error('Some agents failed to load properly');
  const problemAgents = allAgents
    .map((agent, index) => agent ? null : index)
    .filter(idx => idx !== null);
  console.error('Problem agents at indices:', problemAgents);
}

// Ensure all agents have category and add roleRequired where needed
// Example: If an agent should be gated, add roleRequired: 'pro' or 'admin' in its definition file
// (No code change needed here if all agent files are correct, but add a runtime check for missing category)

allAgents.forEach(agent => {
  if (!agent.category) {
    console.error(`Agent missing category: ${agent.name || agent.id}`);
  }
  if (!agent.agentCategory || !Array.isArray(agent.agentCategory)) {
    console.warn(`Agent missing agentCategory array: ${agent.name || agent.id}. Defaulting to [category].`);
    agent.agentCategory = agent.category ? [agent.category.toLowerCase()] : [];
  }
});

// Create the visible registry (only show visible agents)
const agentRegistry: Agent[] = allAgents.filter(agent => agent && agent.visible !== false);
console.log(`Visible agents: ${agentRegistry.length}`);

// Dashboard-ready export: only the fields needed for the dashboard
export const agentDashboardList = Array.from(
  new Map(
    allAgents
      .filter(agent => agent && agent.id && agent.name)
      .map(agent => [agent.id, {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        visible: agent.visible,
        usageCount: agent.usageCount,
        lastRun: agent.lastRun,
        performanceScore: agent.performanceScore
      }])
  ).values()
);

export default agentRegistry;
