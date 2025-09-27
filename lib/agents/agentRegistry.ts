import { Agent } from '../../types/agent';
import { getDefaultOrbitParams, getAgentImageSlug, validateAgents, validateOrbitAgentAvatars } from '../../utils/agentUtils';
import { agentBackstories } from './agentBackstories';

// Import all agents
import adCreativeAgent from '../../ai-agents/adCreativeAgent';
import analyticsAgent from '../../ai-agents/analyticsAgent';
import bizAgent from '../../ai-agents/bizAgent';
import brandingAgent from '../../ai-agents/brandingAgent';
import clientSuccessAgent from '../../ai-agents/clientSuccessAgent';
import contentCreatorAgent from '../../ai-agents/contentCreatorAgent';
import paymentManagerAgent from '../../ai-agents/paymentManagerAgent';
import percyAgent from '../../ai-agents/percyAgent';
import percySyncAgent from '../../ai-agents/percySyncAgent';
import proposalGeneratorAgent from '../../ai-agents/proposalGeneratorAgent';
import publishingAgent from '../../ai-agents/publishingAgent';
import sitegenAgent from '../../ai-agents/sitegenAgent';
import socialBotAgent from '../../ai-agents/socialBotAgent';
import videoContentAgent from '../../ai-agents/videoContentAgent';
import skillSmithAgent from '../../ai-agents/skillSmithAgent';

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
  skillSmithAgent,
  socialBotAgent,
  videoContentAgent
].map((agent, idx) => {
  const imageSlug = agent.imageSlug || getAgentImageSlug(agent);
  const hoverSummary = agent.hoverSummary || agent.description || '';
  const route = agent.route || `/agents/${agent.id}`;
  const orbit = agent.orbit || getDefaultOrbitParams(idx);
  
  // Get backstory for this agent
  const backstory = agentBackstories[agent.id] || agentBackstories[agent.id.replace('-agent', '')] || {};
  
  // N8N integration mapping - primary capabilities and outputs
  const n8nMapping = {
    'adcreative': {
      primaryCapability: 'Ad Creative Generation',
      primaryOutput: 'High-converting ad creatives and copy',
      n8nWorkflowId: 'ad-creative-workflow'
    },
    'analytics': {
      primaryCapability: 'Data Analysis & Insights',
      primaryOutput: 'Analytics reports and performance insights',
      n8nWorkflowId: 'analytics-workflow'
    },
    'biz': {
      primaryCapability: 'Business Strategy Development',
      primaryOutput: 'Strategic business plans and recommendations',
      n8nWorkflowId: 'business-strategy-workflow'
    },
    'branding': {
      primaryCapability: 'Brand Identity Creation',
      primaryOutput: 'Complete brand identity packages',
      n8nWorkflowId: 'branding-workflow'
    },
    'clientsuccess': {
      primaryCapability: 'Client Relationship Management',
      primaryOutput: 'Client success strategies and communications',
      n8nWorkflowId: 'client-success-workflow'
    },
    'contentcreation': {
      primaryCapability: 'Content Creation & SEO',
      primaryOutput: 'SEO-optimized content and articles',
      n8nWorkflowId: 'content-creation-workflow'
    },
    'payment': {
      primaryCapability: 'Payment Processing & Analytics',
      primaryOutput: 'Payment processing and revenue insights',
      n8nWorkflowId: 'payments-workflow'
    },
    'percy': {
      primaryCapability: 'AI Concierge & Orchestration',
      primaryOutput: 'Coordinated agent responses and workflows',
      n8nWorkflowId: 'percy-orchestration-workflow'
    },
    'proposal': {
      primaryCapability: 'Business Proposal Generation',
      primaryOutput: 'Professional business proposals',
      n8nWorkflowId: 'proposal-workflow'
    },
    'publishing': {
      primaryCapability: 'Content Publishing & Distribution',
      primaryOutput: 'Published content across platforms',
      n8nWorkflowId: 'publishing-workflow'
    },
    'site': {
      primaryCapability: 'Website Generation & Optimization',
      primaryOutput: 'Complete website builds and optimizations',
      n8nWorkflowId: 'sitegen-workflow'
    },
    'social': {
      primaryCapability: 'Social Media Management',
      primaryOutput: 'Social media content and engagement',
      n8nWorkflowId: 'social-media-workflow'
    },
    'sync': {
      primaryCapability: 'Data Synchronization',
      primaryOutput: 'Synchronized data across platforms',
      n8nWorkflowId: 'sync-workflow'
    },
    'videocontent': {
      primaryCapability: 'Video Content Creation',
      primaryOutput: 'Video content and multimedia assets',
      n8nWorkflowId: 'video-content-workflow'
    },
    'skillsmith': {
      primaryCapability: 'Skill Development & Training',
      primaryOutput: 'Personalized training plans and skill analysis',
      n8nWorkflowId: 'skillsmith-workflow'
    }
  };
  
  const n8nConfig = n8nMapping[agent.id as keyof typeof n8nMapping] || {
    primaryCapability: agent.capabilities[0] || 'General AI Assistance',
    primaryOutput: 'AI-generated content and insights',
    n8nWorkflowId: undefined
  };
  
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
    displayOrder: idx,
    // Add superhero backstory fields
    superheroName: backstory.superheroName || agent.name,
    origin: backstory.origin,
    powers: backstory.powers,
    weakness: backstory.weakness,
    catchphrase: backstory.catchphrase,
    nemesis: backstory.nemesis,
    backstory: backstory.backstory,
    // Add N8N integration fields
    primaryCapability: n8nConfig.primaryCapability,
    primaryOutput: n8nConfig.primaryOutput,
    n8nWorkflowId: n8nConfig.n8nWorkflowId,
    displayInOrbit: typeof agent.displayInOrbit === 'boolean' ? agent.displayInOrbit : (agent.visible !== false),
    premiumFeature: agent.roleRequired === 'pro' ? 'premium-agents' : undefined,
    upgradeRequired: agent.roleRequired === 'pro' ? 'pro' : 
                    agent.roleRequired === 'enterprise' ? 'enterprise' : null,
    // Enable chat for all agents by default unless explicitly disabled
    chatEnabled: typeof agent.chatEnabled === 'boolean' ? agent.chatEnabled : true
  };
});

// Development-only metadata validation
if (process.env.NODE_ENV === 'development') {
  validateAgents(allAgents);
  validateOrbitAgentAvatars(allAgents);
}

// Log out the agents for debugging
console.log(`All agents loaded: ${allAgents.length}`);
console.log('Agent list details:', allAgents.map(a => ({ id: a.id, name: a.name, visible: a.visible })));
if (allAgents.some((a: any) => a === undefined || a === null)) {
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
  // Ensure visibility is true by default if not explicitly set
  if (agent.visible === undefined) {
    agent.visible = true;
    console.log(`Setting visible=true for agent: ${agent.name || agent.id}`);
  }
  
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
      .map(agent => [agent.id, agent])
  ).values()
);

export default agentRegistry;
