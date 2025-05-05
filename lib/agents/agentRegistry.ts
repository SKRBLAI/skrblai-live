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

// Create the registry array with all agents
const agentRegistry: Agent[] = [
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
].filter(agent => agent.visible); // Only show visible agents

export default agentRegistry;
