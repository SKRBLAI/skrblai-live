import { supabase } from '@/utils/supabase';
import { validateAgentInput, callOpenAI, callOpenAIWithFallback } from '@/utils/agentUtils';
import type { Agent, AgentInput as BaseAgentInput, AgentFunction } from '@/types/agent';

// Define input interface for Ad Creative Agent
interface AdCreativeInput extends BaseAgentInput {
  productName: string;
  productDescription: string;
  targetAudience: string;
  platform: 'facebook' | 'instagram' | 'google' | 'linkedin' | 'twitter' | 'tiktok' | 'pinterest' | 'youtube' | 'general';
  adType?: 'image' | 'video' | 'carousel' | 'text' | 'mixed';
  budget?: number;
  campaignGoal?: 'awareness' | 'consideration' | 'conversion';
  keySellingPoints?: string[];
  brandGuidelines?: {
    tone?: string;
    colors?: string[];
    restrictions?: string[];
  };
  customInstructions?: string;
}

/**
 * Ad Creative Agent - Generates advertising creative content for various platforms
 * @param input - Ad creation parameters
 * @returns Promise with success status, message and optional data
 */
const runAdCreative = async (input: AdCreativeInput) => {
  try {
    // Validate input
    if (!input.userId || !input.productName || !input.productDescription || !input.targetAudience || !input.platform) {
      throw new Error('Missing required fields: userId, productName, productDescription, targetAudience, and platform');
    }

    // Set defaults for optional parameters
    const adParams = {
      adType: input.adType || 'mixed',
      budget: input.budget || 1000,
      campaignGoal: input.campaignGoal || 'consideration',
      keySellingPoints: input.keySellingPoints || [],
      brandGuidelines: input.brandGuidelines || {},
      customInstructions: input.customInstructions || ''
    };

    // Generate ad creative based on platform and parameters
    const adCreative = await generateAdCreative(
      input.productName,
      input.targetAudience,
      input.platform,
      adParams
    );

    // Log the ad creation to Supabase
    const { error: logError } = await supabase
      .from('agent-logs')
      .insert({
        agent: 'adCreativeAgent',
        input,
        productName: input.productName,
        platform: input.platform,
        timestamp: new Date().toISOString()
      });
    if (logError) throw logError;

    // Save the generated ad creative to Supabase
    const { data: adData, error: adError } = await supabase
      .from('ad-creatives')
      .insert({
        userId: input.userId,
        productName: input.productName,
        platform: input.platform,
        adCreative,
        params: adParams,
        createdAt: new Date().toISOString(),
        status: 'completed'
      })
      .select();
    if (adError) throw adError;

    return {
      success: true,
      message: `Ad creative generated successfully for ${input.productName} on ${input.platform}`,
      data: {
        adCreativeId: adData[0].id,
        adCreative,
        metadata: {
          productName: input.productName,
          platform: input.platform,
          adType: adParams.adType,
          campaignGoal: adParams.campaignGoal
        }
      }
    };
  } catch (error) {
    console.error('Ad creative agent failed:', error);
    return {
      success: false,
      message: `Ad creative agent failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Generate ad creative based on product details and platform
 * @param productName - Name of the product
 * @param targetAudience - Target audience description
 * @param platform - Ad platform
 * @param params - Additional ad parameters
 * @returns Generated ad creative
 */
async function generateAdCreative(
  productName: string,
  targetAudience: string,
  platform: string,
  params: {
    adType: string;
    budget: number;
    campaignGoal: string;
    keySellingPoints: string[];
    brandGuidelines: any;
    customInstructions: string;
  }
): Promise<any> {
  // In a real implementation, this would call an AI service for ad generation
  // For now, we'll generate placeholder ad content based on the platform
  
  // Simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Extract key selling points or generate default ones
  const sellingPoints = params.keySellingPoints.length > 0 
    ? params.keySellingPoints 
    : generateDefaultSellingPoints('');
  
  // Generate platform-specific ad content
  switch (platform.toLowerCase()) {
    case 'facebook':
      return generateFacebookAd(productName, '', targetAudience, sellingPoints, params);
    case 'instagram':
      return generateInstagramAd(productName, '', targetAudience, sellingPoints, params);
    case 'google':
      return generateGoogleAd(productName, '', targetAudience, sellingPoints, params);
    case 'linkedin':
      return generateLinkedInAd(productName, '', targetAudience, sellingPoints, params);
    case 'twitter':
      return generateTwitterAd(productName, '', targetAudience, sellingPoints, params);
    default:
      return generateGenericAd(productName, '', targetAudience, sellingPoints, params);
  }
}

/**
 * Generate default selling points from product description
 * @param productDescription - Description of the product
 * @returns Array of selling points
 */
function generateDefaultSellingPoints(productDescription: string): string[] {
  // In a real implementation, this would use NLP to extract key points
  // For now, we'll return generic selling points
  return [
    'High quality and durable',
    'Excellent customer satisfaction',
    'Competitive pricing',
    'Innovative features'
  ];
}

/**
 * Generate Facebook ad creative
 * @param productName - Name of the product
 * @param productDescription - Description of the product
 * @param targetAudience - Target audience description
 * @param sellingPoints - Key selling points
 * @param params - Additional ad parameters
 * @returns Facebook ad creative
 */
function generateFacebookAd(
  productName: string,
  productDescription: string,
  targetAudience: string,
  sellingPoints: string[],
  params: any
): any {
  const headline = `Introducing ${productName}: Perfect for ${targetAudience}`;
  const shortDescription = productDescription.length > 100 
    ? productDescription.substring(0, 97) + '...' 
    : productDescription;
  
  return {
    platform: 'facebook',
    adType: params.adType,
    primaryText: `${shortDescription} Designed specifically for ${targetAudience}.`,
    headline,
    description: `Discover why ${productName} is the choice for ${targetAudience}. ${sellingPoints[0]}.`,
    callToAction: params.campaignGoal === 'conversion' ? 'Shop Now' : 'Learn More',
    imageDescription: `Image showing ${productName} being used by ${targetAudience}, highlighting its key features.`,
    adFormats: [
      {
        name: 'Single Image Ad',
        specs: '1200 x 628 pixels',
        aspectRatio: '1.91:1',
        recommendedText: `${headline}\n\n${sellingPoints.join(' • ')}\n\nLimited time offer for ${targetAudience}!`
      },
      {
        name: 'Carousel Ad',
        specs: '1080 x 1080 pixels',
        aspectRatio: '1:1',
        cards: sellingPoints.map((point, index) => ({
          headline: index === 0 ? headline : `${productName}: ${point}`,
          description: point,
          callToAction: params.campaignGoal === 'conversion' ? 'Shop Now' : 'Learn More'
        }))
      }
    ],
    targetingRecommendations: {
      interests: generateInterestsFromAudience(targetAudience),
      ageRange: '25-54',
      placementRecommendations: ['Facebook Feed', 'Facebook Marketplace', 'Facebook Stories']
    }
  };
}

/**
 * Generate Instagram ad creative
 * @param productName - Name of the product
 * @param productDescription - Description of the product
 * @param targetAudience - Target audience description
 * @param sellingPoints - Key selling points
 * @param params - Additional ad parameters
 * @returns Instagram ad creative
 */
function generateInstagramAd(
  productName: string,
  productDescription: string,
  targetAudience: string,
  sellingPoints: string[],
  params: any
): any {
  return {
    platform: 'instagram',
    adType: params.adType,
    caption: `Introducing ${productName} 🚀\n\nDesigned for ${targetAudience} who want ${sellingPoints[0].toLowerCase()}.\n\n✨ ${sellingPoints.join('\n✨ ')}\n\nTap the link in bio to learn more! #${productName.replace(/\s+/g, '')} #${targetAudience.replace(/\s+/g, '')}`,
    imageDescription: `Lifestyle image of ${productName} in a visually appealing setting that resonates with ${targetAudience}.`,
    adFormats: [
      {
        name: 'Instagram Feed',
        specs: '1080 x 1080 pixels',
        aspectRatio: '1:1',
        recommendedCaption: `Introducing ${productName} 🚀\n\nDesigned for ${targetAudience} who want ${sellingPoints[0].toLowerCase()}.\n\n✨ ${sellingPoints.join('\n✨ ')}\n\nTap the link in bio to learn more!`
      },
      {
        name: 'Instagram Stories',
        specs: '1080 x 1920 pixels',
        aspectRatio: '9:16',
        recommendedCaption: `Swipe up to discover ${productName}!`
      }
    ],
    hashtags: [
      productName.replace(/\s+/g, ''),
      targetAudience.replace(/\s+/g, ''),
      'NewProduct',
      'MustHave',
      'Innovation'
    ],
    targetingRecommendations: {
      interests: generateInterestsFromAudience(targetAudience),
      ageRange: '18-34',
      placementRecommendations: ['Instagram Feed', 'Instagram Explore', 'Instagram Stories']
    }
  };
}

/**
 * Generate Google ad creative
 * @param productName - Name of the product
 * @param productDescription - Description of the product
 * @param targetAudience - Target audience description
 * @param sellingPoints - Key selling points
 * @param params - Additional ad parameters
 * @returns Google ad creative
 */
function generateGoogleAd(
  productName: string,
  productDescription: string,
  targetAudience: string,
  sellingPoints: string[],
  params: any
): any {
  // Create concise headlines and descriptions for Google Ads
  const headlines = [
    `${productName} for ${targetAudience}`,
    `${sellingPoints[0]}`,
    `${params.campaignGoal === 'conversion' ? 'Shop Now' : 'Learn More'}`
  ];
  
  const descriptions = [
    `${productDescription.substring(0, 90)}...`,
    `Perfect for ${targetAudience}. ${sellingPoints.length > 1 ? sellingPoints[1] : ''}`
  ];
  
  return {
    platform: 'google',
    adType: 'search',
    headlines,
    descriptions,
    callToAction: params.campaignGoal === 'conversion' ? 'Shop Now' : 'Learn More',
    adFormats: [
      {
        name: 'Responsive Search Ad',
        headlines: [
          `${productName} for ${targetAudience}`,
          `Discover ${productName}`,
          `${sellingPoints[0]}`,
          `Premium ${productName}`,
          `${productName} - ${sellingPoints.length > 1 ? sellingPoints[1] : sellingPoints[0]}`
        ],
        descriptions: [
          `${productDescription.substring(0, 90)}...`,
          `Perfect for ${targetAudience}. ${sellingPoints.length > 1 ? sellingPoints[1] : ''}`,
          `${sellingPoints.join('. ')}. Limited offer available now.`
        ]
      },
      {
        name: 'Display Ad',
        specs: '300 x 250 pixels',
        headline: `${productName} for ${targetAudience}`,
        description: `${sellingPoints[0]}. Click to learn more.`,
        imageDescription: `Clean, professional image of ${productName} with minimal text.`
      }
    ],
    keywordRecommendations: [
      `${productName}`,
      `${productName} for ${targetAudience}`,
      `best ${productName}`,
      `${productName} ${sellingPoints[0].split(' ').slice(0, 2).join(' ')}`,
      `${targetAudience} ${productName}`
    ],
    targetingRecommendations: {
      interests: generateInterestsFromAudience(targetAudience),
      ageRange: '25-65+',
      placementRecommendations: ['Search Network', 'Display Network', 'YouTube']
    }
  };
}

/**
 * Generate LinkedIn ad creative
 * @param productName - Name of the product
 * @param productDescription - Description of the product
 * @param targetAudience - Target audience description
 * @param sellingPoints - Key selling points
 * @param params - Additional ad parameters
 * @returns LinkedIn ad creative
 */
function generateLinkedInAd(
  productName: string,
  productDescription: string,
  targetAudience: string,
  sellingPoints: string[],
  params: any
): any {
  return {
    platform: 'linkedin',
    adType: params.adType,
    headline: `${productName}: Empowering ${targetAudience}`,
    text: `Introducing ${productName}, designed to help ${targetAudience} achieve their professional goals.\n\n${productDescription}\n\nKey benefits:\n• ${sellingPoints.join('\n• ')}\n\nLearn how ${productName} can transform your business. #${productName.replace(/\s+/g, '')} #Professional`,
    imageDescription: `Professional image showing ${productName} in a business context relevant to ${targetAudience}.`,
    callToAction: params.campaignGoal === 'conversion' ? 'Try Now' : 'Learn More',
    adFormats: [
      {
        name: 'Single Image Ad',
        specs: '1200 x 627 pixels',
        aspectRatio: '1.91:1',
        recommendedText: `Introducing ${productName}, designed specifically for ${targetAudience}.\n\nKey benefits:\n• ${sellingPoints.join('\n• ')}\n\nConnect with us to learn more.`
      },
      {
        name: 'Carousel Ad',
        specs: '1080 x 1080 pixels',
        aspectRatio: '1:1',
        cards: sellingPoints.map(point => ({
          headline: `${productName}: Professional Solution`,
          description: point,
          callToAction: 'Learn More'
        }))
      }
    ],
    targetingRecommendations: {
      jobTitles: generateJobTitlesFromAudience(targetAudience),
      industries: generateIndustriesFromAudience(targetAudience),
      companySize: ['11-50', '51-200', '201-500', '501-1000', '1001+'],
      placementRecommendations: ['LinkedIn Feed', 'LinkedIn Sidebar', 'LinkedIn InMail']
    }
  };
}

/**
 * Generate Twitter ad creative
 * @param productName - Name of the product
 * @param productDescription - Description of the product
 * @param targetAudience - Target audience description
 * @param sellingPoints - Key selling points
 * @param params - Additional ad parameters
 * @returns Twitter ad creative
 */
function generateTwitterAd(
  productName: string,
  productDescription: string,
  targetAudience: string,
  sellingPoints: string[],
  params: any
): any {
  // Create concise tweet copy (280 character limit)
  const tweetCopy = `Introducing ${productName}: ${sellingPoints[0]}. Perfect for ${targetAudience}. Learn more: [LINK] #${productName.replace(/\s+/g, '')}`;
  
  return {
    platform: 'twitter',
    adType: params.adType,
    tweetCopy,
    imageDescription: `Eye-catching image of ${productName} that stands out in a Twitter feed.`,
    adFormats: [
      {
        name: 'Image Tweet',
        specs: '1200 x 675 pixels',
        aspectRatio: '16:9',
        recommendedTweet: tweetCopy
      },
      {
        name: 'Carousel',
        specs: '800 x 418 pixels',
        aspectRatio: '1.91:1',
        cards: sellingPoints.slice(0, 3).map(point => ({
          headline: `${productName}`,
          description: point,
          imageDescription: `Image highlighting "${point}" feature of ${productName}`
        }))
      }
    ],
    hashtags: [
      productName.replace(/\s+/g, ''),
      targetAudience.replace(/\s+/g, ''),
      'NewProduct',
      'Innovation'
    ],
    targetingRecommendations: {
      interests: generateInterestsFromAudience(targetAudience),
      keywords: [
        productName,
        ...sellingPoints.map(point => point.split(' ').slice(0, 2).join(' '))
      ],
      placementRecommendations: ['Timeline', 'Profile', 'Search']
    }
  };
}

/**
 * Generate generic ad creative
 * @param productName - Name of the product
 * @param productDescription - Description of the product
 * @param targetAudience - Target audience description
 * @param sellingPoints - Key selling points
 * @param params - Additional ad parameters
 * @returns Generic ad creative
 */
function generateGenericAd(
  productName: string,
  productDescription: string,
  targetAudience: string,
  sellingPoints: string[],
  params: any
): any {
  return {
    platform: 'multi-platform',
    adType: params.adType,
    headline: `${productName}: The Perfect Solution for ${targetAudience}`,
    shortDescription: productDescription.length > 100 
      ? productDescription.substring(0, 97) + '...' 
      : productDescription,
    sellingPoints,
    callToAction: params.campaignGoal === 'conversion' ? 'Buy Now' : 'Learn More',
    imageDescription: `High-quality image of ${productName} that appeals to ${targetAudience}.`,
    adFormats: [
      {
        name: 'Standard Display',
        specs: '1200 x 628 pixels',
        aspectRatio: '1.91:1',
        headline: `${productName}: The Perfect Solution for ${targetAudience}`,
        description: `${sellingPoints[0]}. ${sellingPoints.length > 1 ? sellingPoints[1] : ''}`
      },
      {
        name: 'Square Format',
        specs: '1080 x 1080 pixels',
        aspectRatio: '1:1',
        headline: `Introducing ${productName}`,
        description: `Designed for ${targetAudience}. ${sellingPoints[0]}.`
      }
    ],
    targetingRecommendations: {
      demographics: {
        ageRange: '25-54',
        interests: generateInterestsFromAudience(targetAudience)
      },
      platforms: recommendPlatformsForAudience(targetAudience)
    }
  };
}

/**
 * Generate interests based on target audience
 * @param targetAudience - Target audience description
 * @returns Array of interests
 */
function generateInterestsFromAudience(targetAudience: string): string[] {
  // In a real implementation, this would use NLP to extract relevant interests
  // For now, we'll return generic interests based on simple keyword matching
  const audienceLower = targetAudience.toLowerCase();
  
  if (audienceLower.includes('professional') || audienceLower.includes('business')) {
    return ['Business', 'Technology', 'Innovation', 'Leadership', 'Entrepreneurship'];
  } else if (audienceLower.includes('parent') || audienceLower.includes('mom') || audienceLower.includes('dad')) {
    return ['Parenting', 'Family', 'Education', 'Child Development', 'Home Management'];
  } else if (audienceLower.includes('student') || audienceLower.includes('education')) {
    return ['Education', 'Learning', 'Academic', 'Student Life', 'Career Development'];
  } else if (audienceLower.includes('tech') || audienceLower.includes('developer')) {
    return ['Technology', 'Programming', 'Software Development', 'Innovation', 'Gadgets'];
  } else {
    return ['Lifestyle', 'Innovation', 'Technology', 'Quality', 'Value'];
  }
}

/**
 * Generate job titles based on target audience
 * @param targetAudience - Target audience description
 * @returns Array of job titles
 */
function generateJobTitlesFromAudience(targetAudience: string): string[] {
  // Simple keyword matching for job titles
  const audienceLower = targetAudience.toLowerCase();
  
  if (audienceLower.includes('executive') || audienceLower.includes('ceo') || audienceLower.includes('director')) {
    return ['CEO', 'CFO', 'CTO', 'COO', 'Director', 'Vice President', 'Executive'];
  } else if (audienceLower.includes('marketing')) {
    return ['Marketing Manager', 'Marketing Director', 'CMO', 'Digital Marketing Specialist', 'Brand Manager'];
  } else if (audienceLower.includes('developer') || audienceLower.includes('engineer')) {
    return ['Software Engineer', 'Developer', 'CTO', 'IT Manager', 'Systems Architect', 'DevOps Engineer'];
  } else if (audienceLower.includes('hr') || audienceLower.includes('human resources')) {
    return ['HR Manager', 'Talent Acquisition', 'CHRO', 'HR Director', 'People Operations'];
  } else {
    return ['Manager', 'Director', 'Specialist', 'Coordinator', 'Consultant', 'Analyst'];
  }
}

/**
 * Generate industries based on target audience
 * @param targetAudience - Target audience description
 * @returns Array of industries
 */
function generateIndustriesFromAudience(targetAudience: string): string[] {
  // Simple keyword matching for industries
  const audienceLower = targetAudience.toLowerCase();
  
  if (audienceLower.includes('tech') || audienceLower.includes('software')) {
    return ['Technology', 'Software', 'IT Services', 'Information Technology', 'Computer Software'];
  } else if (audienceLower.includes('finance') || audienceLower.includes('banking')) {
    return ['Financial Services', 'Banking', 'Investment Management', 'Insurance', 'Fintech'];
  } else if (audienceLower.includes('healthcare') || audienceLower.includes('medical')) {
    return ['Healthcare', 'Hospital & Health Care', 'Medical Practice', 'Pharmaceuticals', 'Biotechnology'];
  } else if (audienceLower.includes('education') || audienceLower.includes('academic')) {
    return ['Education', 'Higher Education', 'E-Learning', 'Educational Technology', 'Research'];
  } else {
    return ['Business Supplies and Equipment', 'Management Consulting', 'Professional Services', 'Consumer Goods', 'Retail'];
  }
}

/**
 * Recommend platforms based on target audience
 * @param targetAudience - Target audience description
 * @returns Array of recommended platforms
 */
function recommendPlatformsForAudience(targetAudience: string): string[] {
  // Simple keyword matching for platform recommendations
  const audienceLower = targetAudience.toLowerCase();
  
  if (audienceLower.includes('professional') || audienceLower.includes('business')) {
    return ['LinkedIn', 'Google', 'Facebook', 'Twitter'];
  } else if (audienceLower.includes('young') || audienceLower.includes('teen')) {
    return ['Instagram', 'TikTok', 'Snapchat', 'YouTube'];
  } else if (audienceLower.includes('parent') || audienceLower.includes('mom')) {
    return ['Facebook', 'Pinterest', 'Instagram', 'Google'];
  } else if (audienceLower.includes('senior') || audienceLower.includes('elder')) {
    return ['Facebook', 'Google', 'YouTube', 'Pinterest'];
  } else {
    return ['Facebook', 'Instagram', 'Google', 'YouTube', 'Twitter'];
  }
}

async function generateAdCopyOpenAI(product: string, audience: string, tone: string, platform: string): Promise<string> {
  const prompt = `Write a compelling ad for ${product} targeted at ${audience} with a ${tone} tone for ${platform} platform.`;
  return await callOpenAIWithFallback<string>(
    prompt, 
    { maxTokens: 200 },
    () => {
      // Fallback to static ad copy if OpenAI fails
      return `Introducing ${product}! The perfect solution for ${audience}. Try it today and see the difference for yourself.`;
    }
  );
}

const adCreativeAgent: Agent = {
  canConverse: false,
  recommendedHelpers: [],
  handoffTriggers: [],
  id: 'adcreative',
  name: 'Ad Creative Agent',
  category: 'Marketing',
  description: 'Helps generate engaging ad copy and visuals.',
  imageSlug: 'adcreative',
  visible: true,
  agentCategory: ['marketing', 'ads', 'creative'],
  config: {
    name: 'Ad Creative',
    description: 'Boosts your brand with AI-generated ad content',
    capabilities: ['copywriting', 'imagery', 'brand voice'],
  },
  capabilities: ['copywriting', 'imagery', 'brand voice'],
  roleRequired: "any",
  runAgent: async (input: BaseAgentInput) => {
    // Use the validateAgentInput helper for ad creative fields
    const extendedInput = input as unknown as Record<string, any>;
    
    const adFields = validateAgentInput(
      extendedInput,
      ['productName', 'productDescription', 'targetAudience', 'platform', 'adType', 'budget', 'campaignGoal', 'keySellingPoints', 'brandGuidelines'],
      {
        // Type validation functions
        productName: (val) => typeof val === 'string',
        productDescription: (val) => typeof val === 'string',
        targetAudience: (val) => typeof val === 'string',
        platform: (val) => typeof val === 'string',
        adType: (val) => ['image', 'video', 'carousel', 'text', 'mixed'].includes(val),
        budget: (val) => typeof val === 'number',
        campaignGoal: (val) => ['awareness', 'consideration', 'conversion'].includes(val),
        keySellingPoints: (val) => Array.isArray(val),
        brandGuidelines: (val) => typeof val === 'object'
      },
      {
        // Default values
        productName: '',
        productDescription: '',
        targetAudience: '',
        platform: 'general',
        adType: 'mixed',
        budget: 1000,
        campaignGoal: 'consideration',
        keySellingPoints: [],
        brandGuidelines: {}
      }
    );
    
    // Create the final input with both base and extended fields
    const adCreativeInput: AdCreativeInput = {
      userId: input.userId,
      goal: input.goal,
      content: input.content,
      context: input.context,
      options: input.options,
      ...adFields
    };
    
    return runAdCreative(adCreativeInput);
  }
};

export { adCreativeAgent };
export default adCreativeAgent;