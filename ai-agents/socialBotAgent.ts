import { db, collection, addDoc } from '@/utils/firebase';

import { Agent, AgentInput as BaseAgentInput, AgentFunction } from '@/types/agent';

// Define input interface for Social Bot Agent
interface SocialBotInput extends BaseAgentInput {
  businessName: string;
  industry: string;
  platforms: ('instagram' | 'twitter' | 'facebook' | 'linkedin' | 'tiktok' | 'pinterest')[];
  contentType?: 'image' | 'video' | 'carousel' | 'text' | 'mixed';
  postCount?: number;
  tone?: 'professional' | 'casual' | 'friendly' | 'authoritative' | 'humorous' | 'technical';
  topics?: string[];
  targetAudience?: string;
  brandGuidelines?: {
    tone?: string;
    colors?: string[];
    hashtags?: string[];
  };
  includeHashtags?: boolean;
  schedulePosts?: boolean;
  customInstructions?: string;
}

// Define post interface
interface Post {
  type: string;
  content?: string;
  caption?: string;
  title?: string;
  description?: string;
  imageDescription?: string;
  videoDescription?: string;
  recommendedTime: string;
}

// Define platform content interface
interface PlatformContent {
  platform: string;
  posts: Post[];
}

// Define schedule item interface
interface ScheduleItem {
  platform: string;
  postIndex: number;
  scheduledTime: string;
}

/**
 * Social Bot Agent - Generates social media content for various platforms
 * @param input - Social media content generation parameters
 * @returns Promise with success status, message and optional data
 */
const runSocialBot = async (input: SocialBotInput) =>  {
  try {
    // Validate input
    if (!input.userId || !input.businessName || !input.industry || !input.platforms || input.platforms.length === 0) {
      throw new Error('Missing required fields: userId, businessName, industry, and platforms');
    }

    // Set defaults for optional parameters
    const socialParams = {
      contentType: input.contentType || 'mixed',
      postCount: input.postCount || 5,
      tone: input.tone || 'professional',
      topics: input.topics || ['industry news', 'tips', 'company updates', 'product features'],
      targetAudience: input.targetAudience || 'general',
      brandGuidelines: input.brandGuidelines || {},
      includeHashtags: input.includeHashtags !== undefined ? input.includeHashtags : true,
      schedulePosts: input.schedulePosts !== undefined ? input.schedulePosts : false,
      customInstructions: input.customInstructions || ''
    };

    // Generate social media content for each platform
    const socialContent = {
      businessName: input.businessName,
      industry: input.industry,
      platforms: input.platforms.map(platform => ({
        platform,
        posts: generatePosts(
          platform,
          input.businessName,
          input.industry,
          socialParams.topics,
          socialParams.tone,
          socialParams.postCount,
          socialParams.includeHashtags
        )
      })) as PlatformContent[],
      schedule: socialParams.schedulePosts ? generatePostSchedule(input.platforms, socialParams.postCount) : null
    };

    // Log the social content generation to Firestore
    await addDoc(collection(db, 'agent-logs'), {
      agent: 'socialBotAgent',
      input,
      businessName: input.businessName,
      platforms: input.platforms,
      timestamp: new Date().toISOString()
    });

    // Save the generated social content to Firestore
    const socialRef = await addDoc(collection(db, 'social-content'), {
      userId: input.userId,
      businessName: input.businessName,
      industry: input.industry,
      content: socialContent,
      params: socialParams,
      createdAt: new Date().toISOString(),
      status: 'completed'
    });

    return {
      success: true,
      message: `Social media content generated successfully for ${input.businessName} on ${input.platforms.join(', ')}`,
      data: {
        socialContentId: socialRef.id,
        content: socialContent,
        metadata: {
          businessName: input.businessName,
          platforms: input.platforms,
          postCount: socialParams.postCount,
          tone: socialParams.tone
        }
      }
    };
  } catch (error) {
    console.error('Social bot agent failed:', error);
    return {
      success: false,
      message: `Social bot agent failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Generate posts for a specific platform
 * @param platform - Social media platform
 * @param businessName - Name of the business
 * @param industry - Business industry
 * @param topics - Content topics
 * @param tone - Content tone
 * @param postCount - Number of posts to generate
 * @param includeHashtags - Whether to include hashtags
 * @returns Array of generated posts
 */
function generatePosts(
  platform: string,
  businessName: string,
  industry: string,
  topics: string[],
  tone: string,
  postCount: number,
  includeHashtags: boolean
): Post[] {
  const posts: Post[] = [];
  
  for (let i = 0; i < postCount; i++) {
    // Select a topic for this post
    const topic = topics[i % topics.length];
    
    // Generate post based on platform
    switch (platform) {
      case 'instagram':
        posts.push(generateInstagramPost(businessName, industry, topic, tone, includeHashtags));
        break;
      case 'twitter':
        posts.push(generateTwitterPost(businessName, industry, topic, tone, includeHashtags));
        break;
      case 'facebook':
        posts.push(generateFacebookPost(businessName, industry, topic, tone, includeHashtags));
        break;
      case 'linkedin':
        posts.push(generateLinkedInPost(businessName, industry, topic, tone, includeHashtags));
        break;
      case 'tiktok':
        posts.push(generateTikTokPost(businessName, industry, topic, tone, includeHashtags));
        break;
      case 'pinterest':
        posts.push(generatePinterestPost(businessName, industry, topic, tone, includeHashtags));
        break;
      default:
        posts.push(generateGenericPost(businessName, industry, topic, tone, includeHashtags));
    }
  }
  
  return posts;
}

/**
 * Generate Instagram post
 */
function generateInstagramPost(businessName: string, industry: string, topic: string, tone: string, includeHashtags: boolean): Post {
  const caption = `✨ ${getPostIntro(topic, tone)}\n\n${getPostBody(businessName, industry, topic, tone)}\n\n${getPostCta(tone)}`;
  
  return {
    type: 'image',
    caption: includeHashtags ? `${caption}\n\n${getHashtags(industry, topic, 5)}` : caption,
    imageDescription: `Image related to ${topic} in the ${industry} industry`,
    recommendedTime: getRecommendedTime('instagram')
  };
}

/**
 * Generate Twitter post
 */
function generateTwitterPost(businessName: string, industry: string, topic: string, tone: string, includeHashtags: boolean): Post {
  // Twitter has character limit, so keep it concise
  const tweetText = `${getPostIntro(topic, tone, true)} ${getPostCta(tone, true)}`;
  
  return {
    type: 'text',
    content: includeHashtags ? `${tweetText} ${getHashtags(industry, topic, 2)}` : tweetText,
    recommendedTime: getRecommendedTime('twitter')
  };
}

/**
 * Generate Facebook post
 */
function generateFacebookPost(businessName: string, industry: string, topic: string, tone: string, includeHashtags: boolean): Post {
  const content = `${getPostIntro(topic, tone)}\n\n${getPostBody(businessName, industry, topic, tone)}\n\n${getPostCta(tone)}`;
  
  return {
    type: 'text',
    content: includeHashtags ? `${content}\n\n${getHashtags(industry, topic, 3)}` : content,
    imageDescription: `Image related to ${topic} in the ${industry} industry`,
    recommendedTime: getRecommendedTime('facebook')
  };
}

/**
 * Generate LinkedIn post
 */
function generateLinkedInPost(businessName: string, industry: string, topic: string, tone: string, includeHashtags: boolean): Post {
  // LinkedIn posts are more professional
  const content = `${getPostIntro(topic, 'professional')}\n\n${getPostBody(businessName, industry, topic, 'professional', true)}\n\n${getPostCta('professional')}`;
  
  return {
    type: 'text',
    content: includeHashtags ? `${content}\n\n${getHashtags(industry, topic, 3, true)}` : content,
    recommendedTime: getRecommendedTime('linkedin')
  };
}

/**
 * Generate TikTok post
 */
function generateTikTokPost(businessName: string, industry: string, topic: string, tone: string, includeHashtags: boolean): Post {
  // TikTok is more casual and brief
  const content = `${getPostIntro(topic, 'casual', true)}`;
  
  return {
    type: 'video',
    caption: includeHashtags ? `${content} ${getHashtags(industry, topic, 4, false, true)}` : content,
    videoDescription: `Short video about ${topic} in the ${industry} industry`,
    recommendedTime: getRecommendedTime('tiktok')
  };
}

/**
 * Generate Pinterest post
 */
function generatePinterestPost(businessName: string, industry: string, topic: string, tone: string, includeHashtags: boolean): Post {
  const title = `${topic.charAt(0).toUpperCase() + topic.slice(1)} Tips for ${industry}`;
  const hashtags = includeHashtags ? getHashtags(industry, topic, 3, true) : '';
  
  return {
    type: 'image',
    title,
    description: `${getPostIntro(topic, tone, true)}${hashtags ? '\n\n' + hashtags : ''}`,
    imageDescription: `Visually appealing image related to ${topic} in the ${industry} industry`,
    recommendedTime: getRecommendedTime('pinterest')
  };
}

/**
 * Generate generic post
 */
function generateGenericPost(businessName: string, industry: string, topic: string, tone: string, includeHashtags: boolean): Post {
  const content = `${getPostIntro(topic, tone)}\n\n${getPostBody(businessName, industry, topic, tone)}\n\n${getPostCta(tone)}`;
  
  return {
    type: 'text',
    content: includeHashtags ? `${content}\n\n${getHashtags(industry, topic, 3)}` : content,
    recommendedTime: new Date().toISOString()
  };
}

/**
 * Generate post introduction
 */
function getPostIntro(topic: string, tone: string, brief: boolean = false): string {
  if (brief) {
    return `Check out our latest insights on ${topic}!`;
  }
  
  switch (tone) {
    case 'professional':
      return `We're excited to share our latest insights on ${topic}.`;
    case 'casual':
      return `Hey there! Let's talk about ${topic} today.`;
    case 'friendly':
      return `Hi friends! We've been thinking a lot about ${topic} lately.`;
    case 'authoritative':
      return `Here's what you need to know about ${topic} in today's market.`;
    case 'humorous':
      return `Ever wondered why ${topic} makes everyone go crazy? We did too!`;
    case 'technical':
      return `Analyzing the key components of ${topic} reveals interesting patterns.`;
    default:
      return `Let's explore ${topic} together.`;
  }
}

/**
 * Generate post body
 */
function getPostBody(businessName: string, industry: string, topic: string, tone: string, detailed: boolean = false): string {
  if (detailed) {
    return `At ${businessName}, we've been researching ${topic} extensively and have identified three key trends that are reshaping the ${industry} industry:\n\n1. Increased focus on sustainability\n2. Digital transformation acceleration\n3. Customer experience prioritization\n\nOur team has developed innovative solutions to address these trends.`;
  }
  
  return `${businessName} has been at the forefront of ${topic} in the ${industry} industry. We believe that staying informed about the latest developments helps us serve our clients better.`;
}

/**
 * Generate post call-to-action
 */
function getPostCta(tone: string, brief: boolean = false): string {
  if (brief) {
    return 'Learn more on our website!';
  }
  
  switch (tone) {
    case 'professional':
      return 'Contact us today to learn how we can help your business grow.';
    case 'casual':
      return 'Drop us a message if you want to chat more about this!';
    case 'friendly':
      return "We'd love to hear your thoughts! Comment below or reach out to us directly.";
    case 'authoritative':
      return 'Schedule a consultation with our experts to implement these strategies in your business.';
    case 'humorous':
      return "Still reading? You must be interested! Let's connect and talk more.";
    case 'technical':
      return 'For a detailed analysis, download our comprehensive report from our website.';
    default:
      return 'Get in touch to learn more!';
  }
}

/**
 * Generate hashtags
 */
function getHashtags(industry: string, topic: string, count: number, professional: boolean = false, trending: boolean = false): string {
  const industryTag = `#${industry.replace(/\s+/g, '')}`;
  const topicTag = `#${topic.replace(/\s+/g, '')}`;
  
  const generalTags = professional 
    ? ['#Innovation', '#Leadership', '#Growth', '#Strategy', '#Business']
    : ['#TipsAndTricks', '#MustKnow', '#Trending', '#NewPost', '#FollowUs'];
    
  const trendingTags = ['#viral', '#trending', '#fyp', '#foryou', '#foryoupage'];
  
  const tags = [industryTag, topicTag];
  
  // Add additional tags
  const additionalTags = trending ? trendingTags : generalTags;
  for (let i = 0; i < Math.min(count - 2, additionalTags.length); i++) {
    tags.push(additionalTags[i]);
  }
  
  return tags.join(' ');
}

/**
 * Get recommended posting time for a platform
 */
function getRecommendedTime(platform: string): string {
  // In a real implementation, this would use analytics to determine optimal posting times
  // For now, return a time in the near future
  const now = new Date();
  
  switch (platform) {
    case 'instagram':
      // Instagram: Evenings and weekends
      now.setHours(now.getHours() + 18);
      break;
    case 'twitter':
      // Twitter: Mornings and early afternoons
      now.setHours(now.getHours() + 10);
      break;
    case 'facebook':
      // Facebook: Afternoons
      now.setHours(now.getHours() + 15);
      break;
    case 'linkedin':
      // LinkedIn: Business hours
      now.setHours(now.getHours() + 11);
      break;
    case 'tiktok':
      // TikTok: Evenings
      now.setHours(now.getHours() + 19);
      break;
    case 'pinterest':
      // Pinterest: Evenings and weekends
      now.setHours(now.getHours() + 20);
      break;
    default:
      now.setHours(now.getHours() + 24);
  }
  
  return now.toISOString();
}

/**
 * Generate a posting schedule for multiple platforms
 */
function generatePostSchedule(platforms: string[], postCount: number): ScheduleItem[] {
  const schedule: ScheduleItem[] = [];
  const now = new Date();
  
  // Create a schedule for the next 30 days
  for (let i = 0; i < postCount; i++) {
    for (const platform of platforms) {
      const postDate = new Date(now);
      // Spread posts over the next 30 days
      postDate.setDate(postDate.getDate() + Math.floor(i / platforms.length) * 2);
      
      // Stagger posting times based on platform
      switch (platform) {
        case 'instagram':
          postDate.setHours(18, 0, 0);
          break;
        case 'twitter':
          postDate.setHours(10, 0, 0);
          break;
        case 'facebook':
          postDate.setHours(15, 0, 0);
          break;
        case 'linkedin':
          postDate.setHours(11, 0, 0);
          break;
        case 'tiktok':
          postDate.setHours(19, 0, 0);
          break;
        case 'pinterest':
          postDate.setHours(20, 0, 0);
          break;
      }
      
      schedule.push({
        platform,
        postIndex: i,
        scheduledTime: postDate.toISOString()
      });
    }
  }
  
  return schedule;
}

export const socialBotAgent: Agent = {
  config: {
    name: 'Social Bot',
    description: 'AI-powered social media content generation and management',
    capabilities: ['Content Generation', 'Post Scheduling', 'Multi-Platform Support', 'Hashtag Generation']
  },
  runAgent: (async (input: BaseAgentInput) => {
    // Cast the base input to social bot input with required fields
    const socialBotInput: SocialBotInput = {
      ...input,
      businessName: (input as any).businessName || '',
      industry: (input as any).industry || '',
      platforms: (input as any).platforms || ['instagram', 'twitter', 'facebook']
    };
    return runSocialBot(socialBotInput);
  }) as AgentFunction
};