import { supabase } from '@/utils/supabase';
import { validateAgentInput } from '@/utils/agentUtils';
import type { Agent, AgentInput as BaseAgentInput, AgentFunction, AgentResponse } from '@/types/agent';

interface PublishingAgentInput extends BaseAgentInput {
  manuscriptUrl: string;
  publishingPlatform: "Amazon" | "Apple Books" | "Google Play Books" | "Other";
  genre: string;
  bookTitle: string;
  authorName: string;
  description: string;
  coverImageUrl: string;
  keywords: string[];
}

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

const runPublishing = async (input: PublishingAgentInput): Promise<AgentResponse> => {
    try {
      // Validate input
      if (!input.userId || !input.manuscriptUrl || !input.publishingPlatform ||
          !input.genre || !input.bookTitle || !input.authorName ||
          !input.description || !input.coverImageUrl || !input.keywords) {
        throw new Error('Missing required fields');
      }

      // Simulate publishing steps
      const publishingSteps = [
        'Validating manuscript format',
        'Preparing metadata',
        `Submitting to ${input.publishingPlatform}`,
        'Initiating publishing process'
      ];

      // Log to Supabase
      await logAgentActivity({
        agentName: 'publishing',
        userId: input.userId,
        action: 'publish_book',
        status: 'success',
        timestamp: new Date().toISOString(),
        details: {
          platform: input.publishingPlatform,
          title: input.bookTitle,
          author: input.authorName
        }
      });

      return {
        success: true,
        message: 'Book publishing initiated successfully',
        data: {
          platformSubmissionId: `PUB-${Date.now()}`,
          estimatedPublishTime: '48 hours',
          publishingSteps,
          metadata: {
            platform: input.publishingPlatform,
            title: input.bookTitle,
            author: input.authorName,
            genre: input.genre
          }
        }
      };

    } catch (error) {
      // Log error to Supabase
      await logAgentActivity({
        agentName: 'publishing',
        userId: input.userId,
        action: 'publish_book',
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        message: `Failed to publish book: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
};

const publishingAgent: Agent = {
  id: 'publishing-agent',
  name: 'Publishing Agent',
  category: 'Publishing',
  description: 'AI-powered book publishing and content distribution',
  visible: true,
  agentCategory: ['publishing'],
  config: {
    name: 'Publishing Agent',
    description: 'AI-powered book publishing and content distribution',
    capabilities: ['Manuscript Validation', 'Platform Integration', 'Metadata Management', 'Publishing Automation']
  },
  runAgent: async (input: BaseAgentInput) => {
    // Use the validateAgentInput helper for publishing fields
    const extendedInput = input as unknown as Record<string, any>;
    
    const publishingFields = validateAgentInput(
      extendedInput,
      ['manuscriptUrl', 'publishingPlatform', 'genre', 'bookTitle', 'authorName', 'description', 'coverImageUrl', 'keywords'],
      {
        // Type validation functions
        manuscriptUrl: (val) => typeof val === 'string',
        publishingPlatform: (val) => typeof val === 'string',
        genre: (val) => typeof val === 'string',
        bookTitle: (val) => typeof val === 'string',
        authorName: (val) => typeof val === 'string',
        description: (val) => typeof val === 'string',
        coverImageUrl: (val) => typeof val === 'string',
        keywords: (val) => Array.isArray(val)
      },
      {
        // Default values
        manuscriptUrl: '',
        publishingPlatform: 'Amazon',
        genre: '',
        bookTitle: '',
        authorName: '',
        description: '',
        coverImageUrl: '',
        keywords: []
      }
    );
    
    // Create the final input with both base and extended fields
    const publishingInput: PublishingAgentInput = {
      userId: input.userId,
      goal: input.goal,
      content: input.content,
      context: input.context,
      options: input.options,
      ...publishingFields
    };
    
    return runPublishing(publishingInput);
  }
};

export { publishingAgent };
export default publishingAgent;