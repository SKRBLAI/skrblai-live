import { db } from '@/utils/firebase';
import { collection, addDoc } from 'firebase/firestore';

// Define input interface for Video Content Agent
interface AgentInput {
  userId: string;
  projectId?: string;
  title: string;
  topic: string;
  videoType: 'explainer' | 'tutorial' | 'promotional' | 'educational' | 'storytelling' | 'testimonial' | 'product' | 'custom';
  duration?: number; // in seconds
  targetAudience?: string;
  tone?: 'professional' | 'casual' | 'friendly' | 'authoritative' | 'humorous' | 'technical';
  keyPoints?: string[];
  includeCallToAction?: boolean;
  brandGuidelines?: {
    tone?: string;
    colors?: string[];
    logoPlacement?: string;
  };
  customInstructions?: string;
}

// Define response interface
interface AgentResponse {
  success: boolean;
  message: string;
  data?: any;
}

interface ScriptSection {
  section: string;
  duration: number;
  narration: string;
  visualDescription: string;
  title?: string;
}

interface VideoParams {
  duration: number;
  tone?: string;
  targetAudience?: string;
  includeCallToAction?: boolean;
}

/**
 * Video Content Agent - Generates video scripts and storyboards
 * @param input - Video content generation parameters
 * @returns Promise with success status, message and optional data
 */
export async function runAgent(input: AgentInput): Promise<AgentResponse> {
  try {
    // Validate input
    if (!input.userId || !input.title || !input.topic || !input.videoType) {
      throw new Error('Missing required fields: userId, title, topic, and videoType');
    }

    // Set defaults for optional parameters
    const videoParams: VideoParams = {
      duration: input.duration || getDefaultDuration(input.videoType),
      tone: input.tone || 'professional',
      targetAudience: input.targetAudience || 'general',
      includeCallToAction: input.includeCallToAction !== undefined ? input.includeCallToAction : true
    };

    // Generate video content based on type
    const videoContent = {
      script: generateScript(
        input.title,
        input.topic,
        input.videoType,
        videoParams
      ),
      storyboard: generateStoryboard(
        input.title,
        input.topic,
        input.videoType,
        videoParams
      ),
      metadata: {
        title: input.title,
        topic: input.topic,
        videoType: input.videoType,
        duration: videoParams.duration,
        targetAudience: videoParams.targetAudience,
        tone: videoParams.tone,
        createdAt: new Date().toISOString()
      }
    };

    // Log the video content generation to Firestore
    await addDoc(collection(db, 'agent-logs'), {
      agent: 'videoContentAgent',
      input,
      title: input.title,
      videoType: input.videoType,
      timestamp: new Date().toISOString()
    });

    // Save the generated video content to Firestore
    const videoRef = await addDoc(collection(db, 'video-content'), {
      userId: input.userId,
      projectId: input.projectId || 'general',
      title: input.title,
      topic: input.topic,
      videoType: input.videoType,
      content: videoContent,
      params: videoParams,
      createdAt: new Date().toISOString(),
      status: 'completed'
    });

    return {
      success: true,
      message: `Video content generated successfully for "${input.title}"`,
      data: {
        videoContentId: videoRef.id,
        content: videoContent
      }
    };
  } catch (error) {
    console.error('Video content agent failed:', error);
    return {
      success: false,
      message: `Video content agent failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Get default duration based on video type
 * @param videoType - Type of video
 * @returns Default duration in seconds
 */
function getDefaultDuration(videoType: string): number {
  switch (videoType) {
    case 'explainer':
      return 120; // 2 minutes
    case 'tutorial':
      return 300; // 5 minutes
    case 'promotional':
      return 60; // 1 minute
    case 'educational':
      return 240; // 4 minutes
    case 'storytelling':
      return 180; // 3 minutes
    case 'testimonial':
      return 90; // 1.5 minutes
    case 'product':
      return 60; // 1 minute
    default:
      return 120; // 2 minutes
  }
}

/**
 * Generate video script based on parameters
 * @param title - Video title
 * @param topic - Video topic
 * @param videoType - Type of video
 * @param params - Additional video parameters
 * @returns Generated script
 */
function generateScript(
  title: string,
  topic: string,
  videoType: string,
  params: VideoParams
): {
  title: string;
  totalDuration: number;
  targetAudience?: string;
  tone?: string;
  sections: ScriptSection[];
  totalWordCount: number;
} {
  const scriptSections: ScriptSection[] = [];
  
  // Introduction
  scriptSections.push({
    section: 'Introduction',
    duration: Math.round(params.duration * 0.15),
    narration: generateIntroduction(title, topic, videoType, params.tone),
    visualDescription: generateIntroVisuals(videoType, params.tone)
  });
  
  // Main content
  const mainContentSections = generateMainContent(title, topic, videoType, params);
  scriptSections.push(...mainContentSections);
  
  // Conclusion
  scriptSections.push({
    section: 'Conclusion',
    duration: Math.round(params.duration * 0.15),
    narration: generateConclusion(title, topic, videoType, params.tone, params.includeCallToAction ?? false),
    visualDescription: generateConclusionVisuals(videoType, params.includeCallToAction ?? false)
  });
  
  return {
    title,
    totalDuration: params.duration,
    targetAudience: params.targetAudience,
    tone: params.tone,
    sections: scriptSections,
    totalWordCount: calculateTotalWordCount(scriptSections)
  };
}

/**
 * Generate introduction for video script
 * @param title - Video title
 * @param topic - Video topic
 * @param videoType - Type of video
 * @param tone - Content tone
 * @returns Introduction narration
 */
function generateIntroduction(title: string, topic: string, videoType: string, tone: string | undefined): string {
  const defaultTone = tone || 'professional';
  return `Welcome to "${title}", where we'll explore ${topic} in a ${defaultTone} way.`;
}

/**
 * Generate introduction visuals description
 * @param videoType - Type of video
 * @param tone - Content tone
 * @returns Visual description
 */
function generateIntroVisuals(videoType: string, tone: string | undefined): string {
  const defaultTone = tone || 'professional';
  return `Opening visuals for ${videoType} video with ${defaultTone} style.`;
}

/**
 * Generate main content sections for video script
 * @param title - Video title
 * @param topic - Video topic
 * @param videoType - Type of video
 * @param params - Additional video parameters
 * @returns Array of main content sections
 */
function generateMainContent(
  title: string,
  topic: string,
  videoType: string,
  params: VideoParams
): ScriptSection[] {
  return [{
    section: 'Main Content',
    title: 'Key Points',
    duration: Math.round(params.duration * 0.7),
    narration: `Main content about ${topic}`,
    visualDescription: 'Visual representation of main points'
  }];
}

/**
 * Generate narration for a key point
 * @param point - Key point
 * @returns Narration for the point
 */
function generatePointNarration(point: string): string {
  return `Detailed explanation of: ${point}`;
}

/**
 * Generate visuals description for a key point
 * @param point - Key point
 * @param videoType - Type of video
 * @returns Visual description
 */
function generatePointVisuals(point: string, videoType: string): string {
  return `Visual representation of: ${point}`;
}

/**
 * Generate conclusion for video script
 * @param title - Video title
 * @param topic - Video topic
 * @param videoType - Type of video
 * @param tone - Content tone
 * @param includeCallToAction - Whether to include a call to action
 * @returns Conclusion narration
 */
function generateConclusion(
  title: string,
  topic: string,
  videoType: string,
  tone: string | undefined,
  includeCallToAction: boolean
): string {
  const defaultTone = tone || 'professional';
  const cta = includeCallToAction ? ' Please like, subscribe, and share!' : '';
  return `Thank you for watching our ${defaultTone} guide to ${topic}.${cta}`;
}

/**
 * Generate conclusion visuals description
 * @param videoType - Type of video
 * @param includeCallToAction - Whether to include a call to action
 * @returns Visual description
 */
function generateConclusionVisuals(videoType: string, includeCallToAction: boolean): string {
  const ctaVisual = includeCallToAction ? ' with call-to-action buttons' : '';
  return `Closing visuals for ${videoType} video${ctaVisual}`;
}

/**
 * Generate storyboard based on script and parameters
 * @param title - Video title
 * @param topic - Video topic
 * @param videoType - Type of video
 * @param params - Additional video parameters
 * @returns Generated storyboard
 */
function generateStoryboard(
  title: string,
  topic: string,
  videoType: string,
  params: VideoParams
): {
  title: string;
  scenes: Array<{
    section: string;
    duration: number;
    description: string;
  }>;
} {
  return {
    title,
    scenes: [
      {
        section: 'Opening',
        duration: Math.round(params.duration * 0.15),
        description: `Opening scene for ${topic}`
      },
      {
        section: 'Main Content',
        duration: Math.round(params.duration * 0.7),
        description: `Main content about ${topic}`
      },
      {
        section: 'Closing',
        duration: Math.round(params.duration * 0.15),
        description: `Closing scene for ${topic}`
      }
    ]
  };
}

/**
 * Calculate total word count from script sections
 * @param sections - Script sections
 * @returns Total word count
 */
function calculateTotalWordCount(sections: ScriptSection[]): number {
  let totalWords = 0;
  
  sections.forEach(section => {
    if (section.narration) {
      totalWords += section.narration.split(' ').length;
    }
  });
  
  return totalWords;
}

export const videoContentAgent = {
  generateVideoScript: async (topic: string) => {
    // Create a basic input with the topic
    const input: AgentInput = {
      userId: 'system',
      title: `All About ${topic}`,
      topic,
      videoType: 'educational'
    };
    
    return runAgent(input);
  }
};