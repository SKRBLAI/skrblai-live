import { supabase } from '@/utils/supabase';
import { validateAgentInput, callOpenAI } from '@/utils/agentUtils';
import type { Agent, AgentInput as BaseAgentInput, AgentFunction } from '@/types/agent';

interface ProposalAgentInput extends BaseAgentInput {
  clientName: string;
  clientIndustry: string;
  projectScope: string;
  projectTimeline: string;
  budget: string;
  services: string[];
  customRequirements?: string;
}

/**
 * OpenAI Integration: Uses callOpenAI for executive summary and scope generation. If OpenAI fails, falls back to static/template logic.
 * Fallback is always logged and gracefully handled.
 */

// Supabase helper function to replace Firebase's logAgentActivity
const logAgentActivity = async (activityData: any) => {
  const { error } = await supabase
    .from('agent-activities')
    .insert({
      ...activityData,
      created_at: new Date().toISOString()
    });
  if (error) throw error;
};

const proposalGeneratorAgent: Agent = {
  id: 'proposal-generator-agent',
  name: 'Proposal Generator',
  category: 'Business',
  description: 'AI-powered business proposal generation',
  visible: true,
  agentCategory: ['business', 'proposal'],
  config: {
    name: 'Proposal Generator',
    description: 'AI-powered business proposal generation',
    capabilities: ['Executive Summary', 'Scope Definition', 'Timeline Planning', 'Budget Allocation']
  },
  roleRequired: "any",
  runAgent: async (input: BaseAgentInput) => {
    // Use the validateAgentInput helper for proposal fields
    const extendedInput = input as unknown as Record<string, any>;
    
    const proposalFields = validateAgentInput(
      extendedInput,
      ['clientName', 'clientIndustry', 'projectScope', 'projectTimeline', 'budget', 'services', 'customRequirements'],
      {
        // Type validation functions
        clientName: (val) => typeof val === 'string',
        clientIndustry: (val) => typeof val === 'string',
        projectScope: (val) => typeof val === 'string',
        projectTimeline: (val) => typeof val === 'string',
        budget: (val) => typeof val === 'string',
        services: (val) => Array.isArray(val),
        customRequirements: (val) => typeof val === 'string'
      },
      {
        // Default values
        clientName: '',
        clientIndustry: '',
        projectScope: '',
        projectTimeline: '',
        budget: '',
        services: [],
        customRequirements: undefined
      }
    );
    
    // Create the final input with both base and extended fields
    const proposalInput: ProposalAgentInput = {
      userId: input.userId,
      goal: input.goal,
      content: input.content,
      context: input.context,
      options: input.options,
      ...proposalFields
    };

    try {
      // Validate input
      if (!proposalInput.clientName || !proposalInput.clientIndustry || 
          !proposalInput.projectScope || !proposalInput.projectTimeline || 
          !proposalInput.budget || !proposalInput.services || 
          proposalInput.services.length === 0) {
        throw new Error('Missing required fields');
      }

      // Try OpenAI for executive summary and scope
      try {
        const prompt = `Write an executive summary and scope of work for a proposal.\nClient: ${proposalInput.clientName}\nIndustry: ${proposalInput.clientIndustry}\nScope: ${proposalInput.projectScope}\nServices: ${proposalInput.services.join(', ')}\nBudget: ${proposalInput.budget}`;
        const aiProposal = await callOpenAI(prompt, { maxTokens: 600 });
        return {
          success: true,
          message: 'Proposal generated successfully (OpenAI)',
          data: { executiveSummary: aiProposal, scopeOfWork: aiProposal }
        };
      } catch (err) {
        // Fallback to static logic
        // Generate proposal sections
        const proposal = {
          executiveSummary: `Strategic proposal for ${proposalInput.clientName} in the ${proposalInput.clientIndustry} industry.`,
          scopeOfWork: `Project scope includes: ${proposalInput.projectScope}\nServices: ${proposalInput.services.join(', ')}`,
          timeline: `Project Timeline: ${proposalInput.projectTimeline}`,
          pricing: `Budget Allocation: ${proposalInput.budget}`,
          termsAndConditions: 'Standard terms and conditions apply.'
        };

        // Log to Supabase
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
          data: proposal
        };
      }

    } catch (error) {
      // Log error to Supabase
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
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};

proposalGeneratorAgent.usageCount = undefined;
proposalGeneratorAgent.lastRun = undefined;
proposalGeneratorAgent.performanceScore = undefined;

// Agent capabilities
const capabilities = 'Generates business proposals, executive summaries, and scopes of work.';

export function getCapabilities() {
  return capabilities;
}

// Test function for agent
export async function testProposalGeneratorAgent(simulateFailure = false) {
  const mockInput = {
    userId: 'test-user',
    clientName: 'Acme Corp',
    clientIndustry: 'technology',
    projectScope: 'Develop a new SaaS platform',
    projectTimeline: '6 months',
    budget: '$100,000',
    services: ['development', 'design', 'QA']
  };
  if (simulateFailure) {
    process.env.OPENAI_API_KEY = 'sk-invalid';
  }
  try {
    const result = await proposalGeneratorAgent.runAgent(mockInput);
    console.log('[ProposalGeneratorAgent Test]', result);
  } catch (err) {
    console.error('[ProposalGeneratorAgent Test] Fallback triggered:', err);
  }
}

export { proposalGeneratorAgent };
export default proposalGeneratorAgent;