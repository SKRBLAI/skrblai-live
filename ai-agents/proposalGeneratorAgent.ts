import { logAgentActivity } from '@/utils/firebase';

interface ProposalAgentInput {
  userId: string;
  projectId?: string;
  clientName: string;
  clientIndustry: string;
  projectScope: string;
  projectTimeline: string;
  budget: string;
  services: string[];
  customRequirements?: string;
}

interface ProposalAgentResponse {
  success: boolean;
  data?: {
    executiveSummary: string;
    scopeOfWork: string;
    timeline: string;
    pricing: string;
    termsAndConditions: string;
  };
  error?: string;
}

export const proposalGeneratorAgent = {
  async runAgent(input: ProposalAgentInput): Promise<ProposalAgentResponse> {
    try {
      // Validate input
      if (!input.userId || !input.clientName || !input.clientIndustry || 
          !input.projectScope || !input.projectTimeline || !input.budget || 
          !input.services || input.services.length === 0) {
        throw new Error('Missing required fields');
      }

      // Generate proposal sections
      const proposal = {
        executiveSummary: `Strategic proposal for ${input.clientName} in the ${input.clientIndustry} industry.`,
        scopeOfWork: `Project scope includes: ${input.projectScope}\nServices: ${input.services.join(', ')}`,
        timeline: `Project Timeline: ${input.projectTimeline}`,
        pricing: `Budget Allocation: ${input.budget}`,
        termsAndConditions: 'Standard terms and conditions apply.'
      };

      // Log to Firestore
      await logAgentActivity({
        agentName: 'proposalGenerator',
        userId: input.userId,
        action: 'generate_proposal',
        status: 'success',
        timestamp: new Date().toISOString(),
        details: {
          clientName: input.clientName,
          projectId: input.projectId,
          services: input.services
        }
      });

      return {
        success: true,
        data: proposal
      };

    } catch (error) {
      // Log error to Firestore
      await logAgentActivity({
        agentName: 'proposalGenerator',
        userId: input.userId,
        action: 'generate_proposal',
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate proposal'
      };
    }
  }
};