import { supabase } from '@/utils/supabase';
import { validateAgentInput, callOpenAI, callOpenAIWithFallback } from '@/utils/agentUtils';
import type { Agent, AgentInput as BaseAgentInput, AgentFunction, AgentResponse } from '@/types/agent';

// Define input interface for Client Success Agent
interface ClientSuccessInput extends Omit<BaseAgentInput, 'goal'> {
  userId: string;
  projectId?: string;
  clientId: string;
  requestType: 'question' | 'issue' | 'feedback' | 'feature_request' | 'billing' | 'general';
  subject: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
  attachments?: string[];
  previousInteractions?: string[];
  customInstructions?: string;
}

// Add this interface at the top of the file
interface ClientAction {
  action: string;
  description: string;
  assignedTo: string;
  priority: string;
}

// Add these interfaces at the top of the file
interface HelpfulResource {
  title: string;
  description: string;
  url: string;
  type: string;
}

// Helper functions

/**
 * Determine priority based on request type and content
 * @param requestType - Type of support request
 * @param description - Request description
 * @returns Appropriate priority level
 */
const getPriorityFromContent = (requestType: string, description: string): 'low' | 'medium' | 'high' | 'urgent' => {
  const lowercaseDesc = description.toLowerCase();
  
  // Check for urgent keywords
  if (
    lowercaseDesc.includes('urgent') ||
    lowercaseDesc.includes('emergency') ||
    lowercaseDesc.includes('critical') ||
    lowercaseDesc.includes('broken') ||
    lowercaseDesc.includes('not working') ||
    lowercaseDesc.includes('can\'t access')
  ) {
    return 'urgent';
  }
  
  // Check for high priority keywords
  if (
    lowercaseDesc.includes('important') ||
    lowercaseDesc.includes('error') ||
    lowercaseDesc.includes('issue') ||
    lowercaseDesc.includes('problem') ||
    lowercaseDesc.includes('bug') ||
    requestType === 'issue'
  ) {
    return 'high';
  }
  
  // Check for medium priority keywords
  if (
    lowercaseDesc.includes('help') ||
    lowercaseDesc.includes('question') ||
    lowercaseDesc.includes('how to') ||
    lowercaseDesc.includes('need assistance') ||
    requestType === 'question'
  ) {
    return 'medium';
  }
  
  // Default to low priority
  return 'low';
}

/**
 * Determine category based on request type and content
 * @param requestType - Type of support request
 * @param description - Request description
 * @returns Appropriate category
 */
const getCategoryFromContent = (requestType: string, description: string): string => {
  const lowercaseDesc = description.toLowerCase();
  
  // Check for technical issues
  if (
    lowercaseDesc.includes('error') ||
    lowercaseDesc.includes('bug') ||
    lowercaseDesc.includes('not working') ||
    lowercaseDesc.includes('broken') ||
    lowercaseDesc.includes('crash')
  ) {
    return 'technical_issue';
  }
  
  // Check for account-related issues
  if (
    lowercaseDesc.includes('account') ||
    lowercaseDesc.includes('login') ||
    lowercaseDesc.includes('password') ||
    lowercaseDesc.includes('sign in') ||
    lowercaseDesc.includes('access')
  ) {
    return 'account';
  }
  
  // Check for billing-related issues
  if (
    lowercaseDesc.includes('billing') ||
    lowercaseDesc.includes('payment') ||
    lowercaseDesc.includes('invoice') ||
    lowercaseDesc.includes('charge') ||
    lowercaseDesc.includes('subscription') ||
    requestType === 'billing'
  ) {
    return 'billing';
  }
  
  // Check for feature-related issues
  if (
    lowercaseDesc.includes('feature') ||
    lowercaseDesc.includes('functionality') ||
    lowercaseDesc.includes('capability') ||
    lowercaseDesc.includes('add') ||
    lowercaseDesc.includes('enhance') ||
    requestType === 'feature_request'
  ) {
    return 'feature';
  }
  
  // Check for usage questions
  if (
    lowercaseDesc.includes('how to') ||
    lowercaseDesc.includes('how do i') ||
    lowercaseDesc.includes('can i') ||
    lowercaseDesc.includes('tutorial') ||
    lowercaseDesc.includes('guide')
  ) {
    return 'usage';
  }
  
  // Default based on request type
  switch (requestType) {
    case 'question':
      return 'general_inquiry';
    case 'issue':
      return 'technical_issue';
    case 'feedback':
      return 'product_feedback';
    case 'feature_request':
      return 'feature';
    case 'billing':
      return 'billing';
    default:
      return 'general';
  }
}

/**
 * Get client history from Supabase
 * @param clientId - Client identifier
 * @returns Client history data
 */
const getClientHistory = async (clientId: string): Promise<any> => {
  try {
    // Query previous support tickets
    const { data: tickets, error: ticketsError } = await supabase
      .from('support-tickets')
      .select('*')
      .eq('clientId', clientId)
      .order('createdAt', { ascending: false })
      .limit(10);
    
    if (ticketsError) throw ticketsError;
    
    // Query client information
    const { data: clientInfo, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('clientId', clientId)
      .limit(1);
    
    if (clientError) throw clientError;
    
    return {
      previousTickets: tickets || [],
      clientInfo: clientInfo && clientInfo.length > 0 ? clientInfo[0] : null,
      ticketCount: tickets ? tickets.length : 0,
      mostRecentTicket: tickets && tickets.length > 0 ? tickets[0] : null,
      commonCategories: getCommonCategories(tickets || [])
    };
  } catch (error) {
    console.error('Error fetching client history:', error);
    return {
      previousTickets: [],
      clientInfo: null,
      ticketCount: 0,
      mostRecentTicket: null,
      commonCategories: []
    };
  }
}

/**
 * Extract common categories from ticket history
 * @param tickets - Previous support tickets
 * @returns Array of common categories
 */
const getCommonCategories = (tickets: any[]): string[] => {
  if (!tickets || tickets.length === 0) {
    return [];
  }
  
  // Count categories
  const categoryCounts: Record<string, number> = {};
  
  tickets.forEach(ticket => {
    const category = ticket.params?.category || 'general';
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });
  
  // Sort by count and return top categories
  return Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0])
    .slice(0, 3);
}

/**
 * Generate initial response to client
 * @param requestType - Type of support request
 * @param subject - Request subject
 * @param description - Request description
 * @param priority - Request priority
 * @param category - Request category
 * @returns Generated initial response
 */
const generateInitialResponse = async (
  requestType: string,
  subject: string,
  description: string,
  priority: string,
  category: string
): Promise<string> => {
  const prompt = `Generate a customer support response.\nType: ${requestType}\nSubject: ${subject}\nDescription: ${description}\nPriority: ${priority}\nCategory: ${category}`;
  
  return await callOpenAIWithFallback<string>(
    prompt, 
    { maxTokens: 300 },
    () => {
      // Fallback to static response generation
      const greeting = 'Thank you for reaching out to our support team.';
      let mainResponse = '';
      let closing = 'Please let us know if you have any further questions or concerns.';
      
      switch (requestType) {
        case 'question':
          mainResponse = `We've received your question about "${subject}". Our team is reviewing your inquiry and will provide a detailed answer as soon as possible. In the meantime, you might find some helpful information in the resources we've included below.`;
          break;
        case 'issue':
          mainResponse = `We're sorry to hear you're experiencing an issue with "${subject}". Our technical team has been notified and is working to resolve this problem. We'll keep you updated on our progress and will follow up with a solution as quickly as possible.`;
          if (priority === 'urgent' || priority === 'high') {
            mainResponse += ' We understand this is a high-priority issue and are treating it accordingly.';
          }
          break;
        case 'feedback':
          mainResponse = `Thank you for sharing your feedback about "${subject}". We greatly value your input as it helps us improve our products and services. Your comments have been forwarded to our product team for consideration.`;
          break;
        case 'feature_request':
          mainResponse = `We appreciate your suggestion regarding "${subject}". Our product team regularly reviews feature requests to help prioritize our development roadmap. We'll evaluate your request and keep you informed about any updates related to this functionality.`;
          break;
        case 'billing':
          mainResponse = `We've received your billing inquiry about "${subject}". Our billing department will review your account and address your concerns. If we need any additional information, we'll reach out to you directly.`;
          break;
        default:
          mainResponse = `We've received your message about "${subject}" and are working to address it. A member of our team will review the details and get back to you shortly.`;
      }
      
      return `${greeting}\n\n${mainResponse}\n\n${closing}\n\nBest regards,\nThe Support Team`;
    }
  );
}

/**
 * Generate suggested actions for support team
 * @param requestType - Type of support request
 * @param description - Request description
 * @param category - Request category
 * @param clientHistory - Client's previous interactions
 * @returns Array of suggested actions
 */
const generateSuggestedActions = (
  requestType: string,
  description: string,
  category: string,
  clientHistory: any
): any[] => {
  // In a real implementation, this would generate tailored actions
  // For now, we'll generate placeholder actions based on request type and category
  
  const actions: ClientAction[] = [];
  
  // Add standard actions based on request type
  switch (requestType) {
    case 'question':
      actions.push({
        action: 'Research answer',
        description: 'Look up relevant documentation or knowledge base articles',
        assignedTo: 'Support specialist',
        priority: 'High'
      });
      break;
    case 'issue':
      actions.push({
        action: 'Investigate issue',
        description: 'Reproduce the problem and identify root cause',
        assignedTo: 'Technical support',
        priority: 'High'
      });
      break;
    case 'feedback':
      actions.push({
        action: 'Categorize feedback',
        description: 'Tag and organize feedback for product team review',
        assignedTo: 'Support specialist',
        priority: 'Low'
      });
      break;
    case 'feature_request':
      actions.push({
        action: 'Evaluate request',
        description: 'Assess feasibility and alignment with product roadmap',
        assignedTo: 'Product manager',
        priority: 'Medium'
      });
      break;
    case 'billing':
      actions.push({
        action: 'Review account',
        description: 'Check billing records and payment history',
        assignedTo: 'Billing specialist',
        priority: 'Medium'
      });
      break;
    default:
      actions.push({
        action: 'Review request',
        description: 'Determine appropriate next steps based on content',
        assignedTo: 'Support specialist',
        priority: 'Medium'
      });
  }
  
  // Add category-specific actions
  if (category === 'technical_issue') {
    actions.push({
      action: 'Check system status',
      description: 'Verify if this is related to any known system issues',
      assignedTo: 'Technical support',
      priority: 'High'
    });
  } else if (category === 'account') {
    actions.push({
      action: 'Verify identity',
      description: 'Confirm customer identity before making account changes',
      assignedTo: 'Security team',
      priority: 'High'
    });
  }
  
  // Add actions based on client history
  if (clientHistory && clientHistory.ticketCount > 3) {
    actions.push({
      action: 'Review account history',
      description: 'Check previous interactions for context and patterns',
      assignedTo: 'Support specialist',
      priority: 'Medium'
    });
    
    if (clientHistory.ticketCount > 10) {
      actions.push({
        action: 'Schedule account review',
        description: 'Comprehensive review of client needs and satisfaction',
        assignedTo: 'Account manager',
        priority: 'Medium'
      });
    }
  }
  
  return actions;
}

/**
 * Generate helpful resources for client
 * @param requestType - Type of support request
 * @param category - Request category
 * @returns Array of helpful resources
 */
const generateHelpfulResources = (
  requestType: string,
  category: string
): HelpfulResource[] => {
  const resources: HelpfulResource[] = [];
  
  // Add standard resources based on request type
  switch (requestType) {
    case 'question':
      resources.push(
        {
          title: 'Knowledge Base',
          description: 'Browse our comprehensive knowledge base for answers to common questions',
          url: '/help/knowledge-base',
          type: 'article_collection'
        },
        {
          title: 'Video Tutorials',
          description: 'Step-by-step video guides for using our platform',
          url: '/help/video-tutorials',
          type: 'video_collection'
        }
      );
      break;
    case 'issue':
      resources.push(
        {
          title: 'Troubleshooting Guide',
          description: 'Common issues and their solutions',
          url: '/help/troubleshooting',
          type: 'guide'
        },
        {
          title: 'System Status',
          description: 'Check the current status of our services',
          url: '/system-status',
          type: 'tool'
        }
      );
      break;
    case 'feature_request':
      resources.push(
        {
          title: 'Product Roadmap',
          description: 'See what features we\'re currently working on',
          url: '/product/roadmap',
          type: 'page'
        },
        {
          title: 'Feature Request Community',
          description: 'Browse and vote on feature requests from other users',
          url: '/community/feature-requests',
          type: 'forum'
        }
      );
      break;
    case 'billing':
      resources.push(
        {
          title: 'Billing FAQ',
          description: 'Answers to common billing questions',
          url: '/help/billing-faq',
          type: 'article'
        },
        {
          title: 'Pricing Plans',
          description: 'Compare our different pricing plans',
          url: '/pricing',
          type: 'page'
        }
      );
      break;
    default:
      resources.push(
        {
          title: 'Help Center',
          description: 'Browse all help resources',
          url: '/help',
          type: 'page'
        }
      );
  }
  
  // Add category-specific resources
  switch (category) {
    case 'technical_issue':
      resources.push({
        title: 'Technical Support Guide',
        description: 'Detailed technical documentation for troubleshooting',
        url: '/help/technical-support',
        type: 'guide'
      });
      break;
    case 'account':
      resources.push({
        title: 'Account Management',
        description: 'Learn how to manage your account settings',
        url: '/help/account-management',
        type: 'article'
      });
      break;
    case 'usage':
      resources.push({
        title: 'Getting Started Guide',
        description: 'Everything you need to know to get up and running',
        url: '/help/getting-started',
        type: 'guide'
      });
      break;
  }
  
  return resources;
}

/**
 * Generate follow-up questions for client
 * @param requestType - Type of support request
 * @param description - Request description
 * @param category - Request category
 * @returns Array of follow-up questions
 */
const generateFollowUpQuestions = (
  requestType: string,
  description: string,
  category: string
): string[] => {
  const questions: string[] = [];
  
  // Add standard questions based on request type
  switch (requestType) {
    case 'question':
      questions.push(
        'Could you provide more details about what you\'re trying to accomplish?',
        'Have you already tried any solutions or workarounds?',
        'Which specific part of the process are you having trouble with?'
      );
      break;
    case 'issue':
      questions.push(
        'When did you first notice this issue?',
        'Can you consistently reproduce the problem? If so, what steps do you take?',
        'Have you made any recent changes to your account or settings?',
        'What browser and device are you using?'
      );
      break;
    case 'feedback':
      questions.push(
        'What specific aspects do you like or dislike?',
        'How would you rate your overall satisfaction on a scale of 1-10?',
        'Is there anything specific you would change or improve?'
      );
      break;
    case 'feature_request':
      questions.push(
        'How would this feature benefit your workflow?',
        'Are there any existing workarounds you\'re currently using?',
        'How important is this feature to your continued use of our product?'
      );
      break;
    case 'billing':
      questions.push(
        'Which specific charge or invoice are you inquiring about?',
        'Have you reviewed your billing statement in your account dashboard?',
        'Would you like to discuss alternative payment options or plans?'
      );
      break;
    default:
      questions.push(
        'Could you provide more details about your request?',
        'Is there anything specific we should know to better assist you?'
      );
  }
  
  // Add category-specific questions
  switch (category) {
    case 'technical_issue':
      questions.push(
        'Have you tried clearing your cache and cookies?',
        'Are you experiencing this issue on multiple devices?'
      );
      break;
    case 'account':
      questions.push(
        'When was the last time you successfully accessed your account?',
        'Have you recently changed any of your account information?'
      );
      break;
    case 'usage':
      questions.push(
        'Which specific feature are you trying to use?',
        'Have you completed our onboarding process?'
      );
      break;
  }
  
  return questions;
}

/**
 * Generate internal notes for support team
 * @param clientId - Client identifier
 * @param requestType - Type of support request
 * @param priority - Request priority
 * @param clientHistory - Client's previous interactions
 * @returns Internal notes for support team
 */
const generateInternalNotes = (
  clientId: string,
  requestType: string,
  priority: string,
  clientHistory: any
): string => {
  // In a real implementation, this would generate tailored notes
  // For now, we'll generate placeholder notes based on request type and client history
  
  let notes = `Support ticket created for client ${clientId}. `;
  
  // Add priority note
  if (priority === 'urgent' || priority === 'high') {
    notes += `This is a ${priority} priority ticket that requires immediate attention. `;
  }
  
  // Add request type specific notes
  switch (requestType) {
    case 'issue':
      notes += 'Technical team should be looped in to investigate. ';
      break;
    case 'feature_request':
      notes += 'Forward to product team after initial response. ';
      break;
    case 'billing':
      notes += 'Billing department should review account details. ';
      break;
  }
  
  // Add notes based on client history
  if (clientHistory) {
    if (clientHistory.ticketCount > 0) {
      notes += `Client has submitted ${clientHistory.ticketCount} previous support requests. `;
      
      if (clientHistory.ticketCount > 5) {
        notes += 'Consider assigning a dedicated support representative. ';
      }
      
      if (clientHistory.commonCategories && clientHistory.commonCategories.length > 0) {
        notes += `Common support categories: ${clientHistory.commonCategories.join(', ')}. `;
      }
      
      if (clientHistory.mostRecentTicket) {
        const daysSinceLastTicket = Math.floor(
          (new Date().getTime() - new Date(clientHistory.mostRecentTicket.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (daysSinceLastTicket < 7) {
          notes += `Client submitted another ticket ${daysSinceLastTicket} days ago. Check for related issues. `;
        }
      }
    } else {
      notes += 'This is the client\'s first support request. ';
    }
  }
  
  return notes;
}

/**
 * Client Success Agent - Handles customer support requests
 * @param input - Support request parameters
 * @returns Promise with success status, message and optional data
 */
const runClientSuccessAgent = async (input: ClientSuccessInput): Promise<AgentResponse> => {
  try {
    // Validate input
    if (!input.userId || !input.clientId || !input.requestType || !input.subject || !input.description) {
      throw new Error('Missing required fields: userId, clientId, requestType, subject, and description');
    }

    // Set defaults for optional parameters
    const ticketParams = {
      priority: input.priority || getPriorityFromContent(input.requestType, input.description),
      category: input.category || getCategoryFromContent(input.requestType, input.description),
      attachments: input.attachments || [],
      previousInteractions: input.previousInteractions || [],
      customInstructions: input.customInstructions || ''
    };

    // Get client history
    const clientHistory = await getClientHistory(input.clientId);

    // Generate response components
    const initialResponse = await generateInitialResponse(
      input.requestType,
      input.subject,
      input.description,
      ticketParams.priority,
      ticketParams.category
    );
    
    const suggestedActions = generateSuggestedActions(
      input.requestType,
      input.description,
      ticketParams.category,
      clientHistory
    );
    
    const helpfulResources = generateHelpfulResources(
      input.requestType,
      ticketParams.category
    );
    
    const followUpQuestions = generateFollowUpQuestions(
      input.requestType,
      input.description,
      ticketParams.category
    );
    
    const internalNotes = generateInternalNotes(
      input.clientId,
      input.requestType,
      ticketParams.priority,
      clientHistory
    );

    // Create ticket in Supabase
    const { data: ticketData, error: ticketError } = await supabase
      .from('support-tickets')
      .insert({
        userId: input.userId,
        clientId: input.clientId,
        projectId: input.projectId || 'general',
        requestType: input.requestType,
        subject: input.subject,
        description: input.description,
        status: 'open',
        priority: ticketParams.priority,
        category: ticketParams.category,
        attachments: ticketParams.attachments,
        response: initialResponse,
        actions: suggestedActions,
        resources: helpfulResources,
        followUpQuestions: followUpQuestions,
        internalNotes: internalNotes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .select();
    
    if (ticketError) throw ticketError;

    // Log the ticket creation
    const { error: logError } = await supabase
      .from('agent-logs')
      .insert({
        agent: 'clientSuccessAgent',
        input: {
          clientId: input.clientId,
          requestType: input.requestType,
          subject: input.subject
        },
        timestamp: new Date().toISOString()
      });

    if (logError) throw logError;

    return {
      success: true,
      message: `Support ticket created successfully for "${input.subject}"`,
      data: {
        ticketId: ticketData[0].id,
        response: initialResponse,
        actions: suggestedActions,
        resources: helpfulResources,
        followUpQuestions: followUpQuestions,
        metadata: {
          priority: ticketParams.priority,
          category: ticketParams.category,
          status: 'open'
        }
      }
    };
  } catch (error) {
    console.error('Client success agent failed:', error);
    return {
      success: false,
      message: `Client success agent failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

const clientSuccessAgent: Agent = {
  id: 'client-success-agent',
  name: 'Client Success',
  category: 'Support',
  description: 'Handles client support requests and ticket management',
  visible: true,
  agentCategory: ['support'],
  config: {
    name: 'Client Success',
    description: 'Handles client support requests and ticket management',
    capabilities: ['Support Request Processing', 'Ticket Management', 'Client History Analysis', 'Resource Generation']
  },
  roleRequired: "any",
  runAgent: async (input: BaseAgentInput) => {
    // Use the validateAgentInput helper for client success fields
    const extendedInput = input as unknown as Record<string, any>;
    
    const clientFields = validateAgentInput(
      extendedInput,
      ['clientId', 'requestType', 'subject', 'description', 'priority', 'category', 'attachments', 'previousInteractions'],
      {
        // Type validation functions
        clientId: (val) => typeof val === 'string',
        requestType: (val) => typeof val === 'string',
        subject: (val) => typeof val === 'string',
        description: (val) => typeof val === 'string',
        priority: (val) => ['high', 'medium', 'low'].includes(val),
        category: (val) => typeof val === 'string',
        attachments: (val) => Array.isArray(val),
        previousInteractions: (val) => Array.isArray(val)
      },
      {
        // Default values
        clientId: '',
        requestType: 'general',
        subject: '',
        description: '',
        priority: undefined,
        category: undefined,
        attachments: undefined,
        previousInteractions: undefined
      }
    );
    
    // Create the final input with both base and extended fields
    const clientInput: ClientSuccessInput = {
      userId: input.userId,
      content: input.content,
      context: input.context,
      options: input.options,
      ...clientFields
    };
    
    return runClientSuccessAgent(clientInput);
  }
};

clientSuccessAgent.usageCount = undefined;
clientSuccessAgent.lastRun = undefined;
clientSuccessAgent.performanceScore = undefined;

export { clientSuccessAgent };
export default clientSuccessAgent;