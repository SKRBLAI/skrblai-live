import { db } from '@/utils/firebase';
import { collection, addDoc } from 'firebase/firestore';

// Define input interface for Percy Agent
interface AgentInput {
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

// Define response interface
interface AgentResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Percy Agent - Main AI assistant that handles user inquiries and form intake
 * @param input - Text input or form data
 * @returns Promise with success status, message and optional data
 */
export async function runAgent(input: AgentInput): Promise<AgentResponse> {
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

    // Log the agent execution to Firestore
    await addDoc(collection(db, 'agent-logs'), {
      agent: 'percyAgent',
      input,
      result,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      message: 'Percy agent completed successfully',
      data: result
    };
  } catch (error) {
    console.error('Percy agent failed:', error);
    return {
      success: false,
      message: `Percy agent failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Process text input from user
 * @param text - User's text query
 * @returns Processed response
 */
async function processTextInput(text: string): Promise<any> {
  // Analyze the user's query to determine intent and context
  const intent = analyzeIntent(text);
  
  // Generate appropriate response based on intent
  const response = {
    intent,
    response: generateResponse(text, intent),
    suggestions: generateSuggestions(intent)
  };
  
  return response;
}

/**
 * Process form data submitted by user
 * @param formData - User's form submission
 * @returns Processing result
 */
async function processFormData(formData: FormData): Promise<any> {
  // Validate form data
  if (!formData.name || !formData.email || !formData.service) {
    throw new Error('Missing required form fields');
  }
  
  // Save lead information to Firestore
  const docRef = await addDoc(collection(db, 'leads'), {
    ...formData,
    source: 'percy-intake',
    status: 'new',
    createdAt: new Date().toISOString()
  });
  
  return {
    leadId: docRef.id,
    service: formData.service,
    nextSteps: determineNextSteps(formData.service)
  };
}

/**
 * Analyze the intent of user's query
 * @param text - User's text input
 * @returns Identified intent
 */
function analyzeIntent(text: string): string {
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
function generateResponse(text: string, intent: string): string {
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
function generateSuggestions(intent: string): string[] {
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
function determineNextSteps(service: string): any {
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