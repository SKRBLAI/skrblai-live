import { Agent } from '@/types/agent';

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
];

// Log out the agents for debugging
console.log(`All agents loaded: ${allAgents.length}`);
if (allAgents.some(a => a === undefined || a === null)) {
  console.error('Some agents failed to load properly');
  const problemAgents = allAgents
    .map((agent, index) => agent ? null : index)
    .filter(idx => idx !== null);
  console.error('Problem agents at indices:', problemAgents);
}

// Create the visible registry (only show visible agents)
const agentRegistry: Agent[] = allAgents.filter(agent => agent && agent.visible !== false);
console.log(`Visible agents: ${agentRegistry.length}`);

export default agentRegistry;
