import { Agent, AgentFunction } from '@/types/agent';

const exampleAgent: Agent = {
  id: 'example-agent',
  name: 'Example Agent',
  category: 'Demo',
  description: 'Does something cool',
  visible: true,
  config: {
    name: 'Example Agent',
    description: 'Does something cool',
    capabilities: ['Cool Stuff'],
  },
  runAgent: async (input) => {
    // ...logic...
  },
  // Add other optional fields if needed
};

export default exampleAgent; 