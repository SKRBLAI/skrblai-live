import { logAgentActivity } from '@/utils/firebase';

import { Agent, AgentInput as BaseAgentInput, AgentFunction } from '@/types/agent';

interface ProposalAgentInput extends BaseAgentInput {
  clientName: string;
  clientIndustry: string;
  projectScope: string;
  projectTimeline: string;
  budget: string;
  services: string[];
  customRequirements?: string;
}

const proposalGeneratorAgent: Agent = {
  id: 'proposal-generator-agent',
  name: 'Proposal Generator',
  category: 'Business',
  description: 'AI-powered business proposal generation',
  visible: true,
  config: {
    name: 'Proposal Generator',
    description: 'AI-powered business proposal generation',
    capabilities: ['Executive Summary', 'Scope Definition', 'Timeline Planning', 'Budget Allocation']
  },
  runAgent: async (input: BaseAgentInput) => {
    // Cast the base input to proposal agent input with required fields
    const proposalInput: ProposalAgentInput = {
      ...input,
      clientName: (input as any).clientName || '',
      clientIndustry: (input as any).clientIndustry || '',
      projectScope: (input as any).projectScope || '',
      projectTimeline: (input as any).projectTimeline || '',
      budget: (input as any).budget || '',
      services: (input as any).services || [],
      customRequirements: (input as any).customRequirements
    };

    try {
      // Validate input
      if (!proposalInput.clientName || !proposalInput.clientIndustry || 
          !proposalInput.projectScope || !proposalInput.projectTimeline || 
          !proposalInput.budget || !proposalInput.services || 
          proposalInput.services.length === 0) {
        throw new Error('Missing required fields');
      }

      // Generate proposal sections
      const proposal = {
        executiveSummary: `Strategic proposal for ${proposalInput.clientName} in the ${proposalInput.clientIndustry} industry.`,
        scopeOfWork: `Project scope includes: ${proposalInput.projectScope}\nServices: ${proposalInput.services.join(', ')}`,
        timeline: `Project Timeline: ${proposalInput.projectTimeline}`,
        pricing: `Budget Allocation: ${proposalInput.budget}`,
        termsAndConditions: 'Standard terms and conditions apply.'
      };

      // Log to Firestore
      await logAgentActivity({
        agentName: 'proposalGenerator',
        userId: proposalInput.userId,
        action: 'generate_proposal',
        status: 'success',
        timestamp: new Date().toISOString(),
        details: {
          clientName: proposalInput.clientName,
          services: proposalInput.services
        }
      });

      return {
        success: true,
        message: 'Proposal generated successfully',
        agentName: 'proposalGenerator',
        data: proposal
      };

    } catch (error) {
      // Log error to Firestore
      await logAgentActivity({
        agentName: 'proposalGenerator',
        userId: proposalInput.userId,
        action: 'generate_proposal',
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate proposal',
        agentName: 'proposalGenerator'
      };
    }
  }
};

export { proposalGeneratorAgent };
export default proposalGeneratorAgent;