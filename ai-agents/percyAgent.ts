import { getServerSupabaseAdmin } from '@/lib/supabase';
import { validateAgentInput, callOpenAI, callOpenAIWithFallback } from '../utils/agentUtils';
import type { Agent, AgentInput as BaseAgentInput, AgentFunction, AgentResponse } from '@/types/agent';

// Enhanced Percy with global memory and orchestration capabilities

// Define input interface for Percy Agent
interface PercyAgentInput extends Omit<BaseAgentInput, 'goal'> {
  type: 'text' | 'form';
  data: string | FormData;
}

// Define form data interface
interface FormData {
  name: string;
  email: string;
  service: string;
  message?: string;
  company?: string;
}

/**
 * Percy Agent - Main AI assistant that handles user inquiries and form intake
 * @param input - Text input or form data
 * @returns Promise with success status, message and optional data
 */
const runPercyAgent = async (input: PercyAgentInput): Promise<AgentResponse> => {
  try {
    let result;

    // Process based on input type
    if (input.type === 'text') {
      result = await processTextInput(input.data as string);
    } else if (input.type === 'form') {
      result = await processFormData(input.data as FormData);
    } else {
      throw new Error('Invalid input type');
    }

    // Log the agent execution to Supabase
    const supabase = getServerSupabaseAdmin();
    if (!supabase) {
      throw new Error('Database unavailable - cannot execute agent');
    }
    
    const { error: logError } = await supabase
      .from('agent-logs')
      .insert({
        agent: 'percyAgent',
        input,
        result,
        timestamp: new Date().toISOString()
      });
    if (logError) throw logError;

    return {
      success: true,
      message: 'Percy agent completed successfully',
      data: result
    };
  } catch (error) {
    console.error('Percy agent failed:', error);
    return {
      success: false,
      message: `Percy agent failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Process text input from user
 * @param text - User's text query
 * @returns Processed response
 */
const processTextInput = async (text: string): Promise<any> => {
  // Analyze the user's query to determine intent and context
  const intent = analyzeIntent(text);
  
  const prompt = `You are Percy, an AI assistant for a digital agency. Respond to the following user query in a helpful, friendly, and professional way:\n${text}`;
  
  const aiResponse = await callOpenAIWithFallback<string>(
    prompt, 
    { maxTokens: 300 },
    () => generateResponse(text, intent) // Fallback to our static response generator
  );
  
  return {
    intent,
    response: aiResponse,
    suggestions: generateSuggestions(intent)
  };
}

/**
 * Process form data submitted by user
 * @param formData - User's form submission
 * @returns Processing result
 */
const processFormData = async (formData: FormData): Promise<any> => {
  // Validate form data
  if (!formData.name || !formData.email || !formData.service) {
    throw new Error('Missing required form fields');
  }
  
  // Save lead information to Supabase
  const supabase = getServerSupabaseAdmin();
  if (!supabase) {
    throw new Error('Database unavailable - cannot execute agent');
  }
  
  const { data, error } = await supabase
    .from('leads')
    .insert({
      ...formData,
      source: 'percy-intake',
      status: 'new',
      createdAt: new Date().toISOString()
    })
    .select();
  
  if (error) throw error;
  
  return {
    leadId: data[0].id,
    service: formData.service,
    nextSteps: determineNextSteps(formData.service)
  };
}

/**
 * Analyze the intent of user's query
 * @param text - User's text input
 * @returns Identified intent
 */
const analyzeIntent = (text: string): string => {
  const textLower = text.toLowerCase();
  
  if (textLower.includes('pricing') || textLower.includes('cost') || textLower.includes('price')) {
    return 'pricing';
  } else if (textLower.includes('portfolio') || textLower.includes('examples') || textLower.includes('work')) {
    return 'portfolio';
  } else if (textLower.includes('contact') || textLower.includes('talk') || textLower.includes('reach')) {
    return 'contact';
  } else if (textLower.includes('service') || textLower.includes('offer') || textLower.includes('provide')) {
    return 'services';
  } else {
    return 'general';
  }
}

/**
 * Generate response based on intent
 * @param text - Original user query
 * @param intent - Identified intent
 * @returns Generated response
 */
const generateResponse = (text: string, intent: string): string => {
  switch (intent) {
    case 'pricing':
      return "Our pricing varies based on project scope and requirements. We offer packages starting at $1,000 for basic services, with custom solutions available for larger projects. Would you like to discuss your specific needs?";
    case 'portfolio':
      return "We've worked with clients across various industries including tech, education, and e-commerce. You can view our portfolio on our website or I can share specific examples relevant to your industry.";
    case 'contact':
      return "You can reach our team via email at hello@skrbl.ai or schedule a consultation through our calendar. Would you like me to help set up a meeting?";
    case 'services':
      return "We offer a range of digital services including content creation, branding, website development, SEO optimization, and social media management. Which area are you most interested in?";
    case 'general':
      return "Thanks for reaching out to SKRBL AI! We're a digital agency specializing in AI-powered content and marketing solutions. How can I assist you today?";
    default:
      return "I'm Percy, your AI assistant at SKRBL. I'd be happy to help with any questions about our services or connect you with our team.";
  }
}

/**
 * Generate contextual suggestions based on intent
 * @param intent - Identified user intent
 * @returns Array of suggestions
 */
const generateSuggestions = (intent: string): string[] => {
  switch (intent) {
    case 'pricing':
      return ['Schedule a consultation', 'View service packages', 'Request a custom quote'];
    case 'portfolio':
      return ['View case studies', 'Filter by industry', 'See client testimonials'];
    case 'contact':
      return ['Schedule a call', 'Email the team', 'Submit a project brief'];
    case 'services':
      return ['Content creation', 'Website development', 'Branding services', 'SEO optimization'];
    case 'general':
      return ['Learn about our services', 'View our work', 'Contact us'];
    default:
      return ['Explore services', 'View portfolio', 'Contact us'];
  }
}

/**
 * Determine next steps based on selected service
 * @param service - Service selected by user
 * @returns Next steps information
 */
const determineNextSteps = (service: string): any => {
  const serviceLower = service.toLowerCase();

  if (serviceLower.includes('content') || serviceLower.includes('writing')) {
    return {
      recommendedAgent: 'contentCreatorAgent',
      nextAction: 'content_strategy_call',
      timeframe: '1-2 business days'
    };
  } else if (serviceLower.includes('website') || serviceLower.includes('web')) {
    return {
      recommendedAgent: 'sitegenAgent',
      nextAction: 'website_requirements_gathering',
      timeframe: '1-3 business days'
    };
  } else if (serviceLower.includes('brand') || serviceLower.includes('logo')) {
    return {
      recommendedAgent: 'brandingAgent',
      nextAction: 'branding_discovery_call',
      timeframe: '1-2 business days'
    };
  } else if (serviceLower.includes('social') || serviceLower.includes('media')) {
    return {
      recommendedAgent: 'socialBotAgent',
      nextAction: 'social_media_audit',
      timeframe: '2-3 business days'
    };
  } else if (serviceLower.includes('video') || serviceLower.includes('animation')) {
    return {
      recommendedAgent: 'videoContentAgent',
      nextAction: 'video_concept_discussion',
      timeframe: '2-4 business days'
    };
  } else {
    return {
      recommendedAgent: 'percySyncAgent',
      nextAction: 'general_consultation',
      timeframe: '1-2 business days'
    };
  }
}

/**
 * NEW: Recommend agents based on mission/intent
 * Universal recommendation engine for Percy
 * @param mission - The mission type (branding, marketing, sports, etc.)
 * @param type - The category type (business, sports, agent)
 * @returns Recommended agent IDs and routing info
 */
export const recommendAgentsForMission = (mission: string, type: 'business' | 'sports' | 'agent' = 'business'): {
  primaryAgent: string;
  supportingAgents: string[];
  route: string;
  reasoning: string;
} => {
  const missionLower = mission.toLowerCase();

  // Sports missions always route to SkillSmith
  if (type === 'sports' || missionLower.includes('sport') || missionLower.includes('athletic') || missionLower.includes('training')) {
    return {
      primaryAgent: 'skillsmith',
      supportingAgents: [],
      route: '/sports',
      reasoning: 'SkillSmith specializes in athletic performance and sports training'
    };
  }

  // Business mission routing
  const missionMap: Record<string, { primary: string; supporting: string[]; route: string; reasoning: string }> = {
    branding: {
      primary: 'branding',
      supporting: ['contentcreation', 'adcreative'],
      route: '/agents/branding/chat',
      reasoning: 'BrandAlexander specializes in brand identity, logos, and visual design'
    },
    publishing: {
      primary: 'publishing',
      supporting: ['contentcreation', 'branding'],
      route: '/agents/publishing/chat',
      reasoning: 'PublishPete handles book publishing, manuscripts, and content distribution'
    },
    marketing: {
      primary: 'social',
      supporting: ['adcreative', 'analytics'],
      route: '/agents/social/chat',
      reasoning: 'SocialNino is your viral marketing and social media expert'
    },
    content: {
      primary: 'contentcreation',
      supporting: ['social', 'publishing'],
      route: '/agents/contentcreation/chat',
      reasoning: 'ContentCarltig creates compelling content across all platforms'
    },
    automation: {
      primary: 'sync',
      supporting: ['biz', 'percy'],
      route: '/agents/sync/chat',
      reasoning: 'SyncMaster automates workflows and integrates your systems'
    },
    analytics: {
      primary: 'analytics',
      supporting: ['biz'],
      route: '/agents/analytics/chat',
      reasoning: 'The Don of Data provides insights and predictive analytics'
    },
    website: {
      primary: 'site',
      supporting: ['branding', 'contentcreation'],
      route: '/agents/site/chat',
      reasoning: 'SiteOnzite builds high-converting websites and landing pages'
    },
    proposal: {
      primary: 'proposal',
      supporting: ['biz', 'analytics'],
      route: '/agents/proposal/chat',
      reasoning: 'Pro Pose G4 crafts winning proposals and pitch decks'
    },
    ads: {
      primary: 'adcreative',
      supporting: ['analytics', 'social'],
      route: '/agents/adcreative/chat',
      reasoning: 'AdmEthen creates high-converting ad campaigns'
    },
    business: {
      primary: 'biz',
      supporting: ['analytics', 'proposal'],
      route: '/agents/biz/chat',
      reasoning: 'Biz Z. provides strategic business planning and growth strategies'
    }
  };

  // Find matching mission
  for (const [key, value] of Object.entries(missionMap)) {
    if (missionLower.includes(key)) {
      return {
        primaryAgent: value.primary,
        supportingAgents: value.supporting,
        route: value.route,
        reasoning: value.reasoning
      };
    }
  }

  // Default to Percy for general inquiries
  return {
    primaryAgent: 'percy',
    supportingAgents: [],
    route: '/agents/percy/chat',
    reasoning: "Percy will help you find the perfect agent for your needs"
  };
}

const percyAgent: Agent = {
  canConverse: true,
  recommendedHelpers: [],
  handoffTriggers: [],
  id: 'percy',
  name: 'Percy',
  category: 'Assistant',
  description: 'AI assistant that handles user inquiries and form intake',
  visible: true,
  agentCategory: ['assistant'],
  config: {
    name: 'Percy',
    description: 'AI assistant that handles user inquiries and form intake',
    capabilities: ['Text Processing', 'Form Processing', 'Intent Analysis', 'Response Generation']
  },
  capabilities: [
    'text processing',
    'form processing',
    'intent analysis',
    'response generation',
    'user inquiry handling',
    'form intake',
    'AI chat',
    'assistant tasks',
    'general Q&A'
  ],
  runAgent: async (input: BaseAgentInput) => {
    // Use the validateAgentInput helper for percy fields
    const extendedInput = input as unknown as Record<string, any>;
    
    const percyFields = validateAgentInput(
      extendedInput,
      ['type', 'data'],
      {
        // Type validation functions
        type: (val) => val === 'text' || val === 'form',
        data: (val) => typeof val === 'string' || val instanceof FormData
      },
      {
        // Default values
        type: 'text',
        data: ''
      }
    );
    
    // Create the final input with both base and extended fields
    const percyInput: PercyAgentInput = {
      userId: input.userId,
      content: input.content,
      context: input.context,
      options: input.options,
      ...percyFields
    };
    
    return runPercyAgent(percyInput);
  },
  roleRequired: 'any'
};

percyAgent.usageCount = undefined;
percyAgent.lastRun = undefined;
percyAgent.performanceScore = undefined;

export { percyAgent };
export default percyAgent;