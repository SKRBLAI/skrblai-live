import { logAgentActivity } from '@/utils/firebase';
import { Agent, AgentInput as BaseAgentInput, AgentFunction } from '@/types/agent';

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

const runPublishing = async (input: PublishingAgentInput) => {

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

      // Log to Firestore
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
      // Log error to Firestore
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
        error: error instanceof Error ? error.message : 'Failed to publish book'
      };
    }
};

export const publishingAgent: Agent = {
  config: {
    name: 'Publishing Agent',
    description: 'AI-powered book publishing and content distribution',
    capabilities: ['Manuscript Validation', 'Platform Integration', 'Metadata Management', 'Publishing Automation']
  },
  runAgent: (async (input: BaseAgentInput) => {
    // Cast the base input to publishing input with required fields
    const publishingInput: PublishingAgentInput = {
      ...input,
      manuscriptUrl: (input as any).manuscriptUrl || '',
      publishingPlatform: (input as any).publishingPlatform || 'Amazon',
      genre: (input as any).genre || '',
      bookTitle: (input as any).bookTitle || '',
      authorName: (input as any).authorName || '',
      description: (input as any).description || '',
      coverImageUrl: (input as any).coverImageUrl || '',
      keywords: (input as any).keywords || []
    };
    return runPublishing(publishingInput);
  }) as AgentFunction
};