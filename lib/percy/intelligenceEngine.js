/* global Map */
/**
 * Percy Intelligence Engine - Smart conversation and subscription steering
 * Builds upon existing PercyProvider infrastructure
 */

import { supabase } from '@/utils/supabase';
import agentRegistry from '@/lib/agents/agentRegistry';

/**
 * Percy's conversation phases: subtle → hint → direct
 */
export const CONVERSATION_PHASES = {
  SUBTLE: 'subtle',
  HINT: 'hint', 
  DIRECT: 'direct'
};

/**
 * Free agents that don't require subscription
 */
export const FREE_AGENTS = [
  'percy-agent',
  'content-creator-agent'
];

/**
 * Subscription tiers and their benefits
 */
export const SUBSCRIPTION_TIERS = {
  RESERVE: {
    name: 'Reserve',
    price: 7.99,
    agents: 3,
    features: ['Access to Basic AI Agents', 'Limited Publishing', 'Community Support', 'Basic Analytics']
  },
  STARTER: {
    name: 'Starter',
    price: 19.99,
    agents: 5,
    features: ['Access to 5 AI Agents', 'Limited Publishing', 'Priority Percy Access', 'Advanced Analytics', 'Custom Workflows Access']
  },
  STAR: {
    name: 'Star', 
    price: 39.99,
    agents: 10, // More agents than starter but not unlimited
    features: ['Access to 10+ AI Agents', 'Enhanced Publishing', 'Priority Support', 'Advanced Workflows', 'Team Collaboration']
  },
  ALL_STAR: {
    name: 'All-Star',
    price: 99.99,
    agents: -1, // unlimited
    features: ['Enhanced AI Concierge Access', 'Custom Agent Development Discount', 'Team Access & Collaboration', 'Priority Support', 'Custom Integrations', 'White-label Options', 'API Access']
  }
};

/**
 * Percy Intelligence Engine Class
 */
export class PercyIntelligenceEngine {
  constructor() {
    this.userContext = new Map();
    this.conversationHistory = new Map();
  }

  /**
   * Analyze user interaction and determine conversation phase
   * @param {string} userId - User ID (or session ID for anonymous)
   * @param {Object} interaction - Current interaction data
   * @returns {string} - Current conversation phase
   */
  getConversationPhase(userId, interaction = {}) {
    const context = this.getUserContext(userId);
    const history = this.getConversationHistory(userId);
    
    // Count meaningful interactions
    const meaningfulInteractions = history.filter(h => 
      h.type === 'agent_explore' || 
      h.type === 'locked_agent_click' || 
      h.type === 'subscription_inquiry'
    ).length;

    // Count locked agent interactions
    const lockedAgentInteractions = history.filter(h => h.type === 'locked_agent_click').length;

    // Determine phase based on engagement level
    if (meaningfulInteractions === 0) {
      return CONVERSATION_PHASES.SUBTLE;
    } else if (meaningfulInteractions < 3 && lockedAgentInteractions === 0) {
      return CONVERSATION_PHASES.SUBTLE;
    } else if (meaningfulInteractions < 5 || lockedAgentInteractions < 2) {
      return CONVERSATION_PHASES.HINT;
    } else {
      return CONVERSATION_PHASES.DIRECT;
    }
  }

  /**
   * Generate Percy response based on context and phase
   * @param {string} userId - User ID
   * @param {string} userMessage - User's message
   * @param {Object} context - Additional context (agent clicked, etc.)
   * @returns {Object} - Percy's response with potential subscription steering
   */
  generatePercyResponse(userId, userMessage, context = {}) {
    const phase = this.getConversationPhase(userId, context);
    const userContext = this.getUserContext(userId);
    
    // Track this interaction
    this.trackInteraction(userId, {
      type: 'message',
      message: userMessage,
      context,
      phase,
      timestamp: new Date().toISOString()
    });

    // Agent-specific responses
    if (context.agentId) {
      return this.generateAgentResponse(userId, context.agentId, phase);
    }

    // Subscription inquiry responses
    if (this.isSubscriptionInquiry(userMessage)) {
      return this.generateSubscriptionResponse(userId, phase);
    }

    // General conversation responses
    return this.generateGeneralResponse(userId, userMessage, phase);
  }

  /**
   * Generate response when user interacts with an agent
   * @param {string} userId - User ID
   * @param {string} agentId - Agent they're interested in
   * @param {string} phase - Current conversation phase
   * @returns {Object} - Percy's response
   */
  generateAgentResponse(userId, agentId, phase) {
    const agent = agentRegistry.find(a => a.id === agentId);
    if (!agent) {
      return { message: "I couldn't find that agent. Let me help you find the right one!", hasSubscriptionOffer: false };
    }

    const isLocked = !FREE_AGENTS.includes(agentId);
    
    if (!isLocked) {
      // Free agent - build value and hint at premium
      switch (phase) {
        case CONVERSATION_PHASES.SUBTLE:
          return {
            message: `Excellent choice! The ${agent.name} is perfect for your needs. It can help with ${agent.description}. Feel free to explore and see what it can do!`,
            hasSubscriptionOffer: false
          };
        
        case CONVERSATION_PHASES.HINT:
          return {
            message: `The ${agent.name} is a great start! Once you see how powerful it is, you might be interested in our other specialized agents that can take your results even further.`,
            hasSubscriptionOffer: false,
            hint: 'More agents available with Pro'
          };
        
        case CONVERSATION_PHASES.DIRECT:
          return {
            message: `The ${agent.name} is just the beginning! With our Pro plan, you'd have access to ALL our agents for complete workflow automation. Ready to unlock the full suite?`,
            hasSubscriptionOffer: true,
            subscriptionCTA: 'Upgrade to Pro for $49/month'
          };
      }
    } else {
      // Locked agent - subscription steering based on phase
      switch (phase) {
        case CONVERSATION_PHASES.SUBTLE:
          return {
            message: `The ${agent.name} looks interesting! This is one of our premium agents that offers advanced ${agent.description}. It's part of our Pro plan.`,
            hasSubscriptionOffer: false,
            hint: 'Premium agent - Pro plan required'
          };
        
        case CONVERSATION_PHASES.HINT:
          return {
            message: `I can see you're really interested in the ${agent.name}! It's one of our most powerful agents. For just $49/month, you could unlock this plus all our other premium agents. Want to see what you'd get?`,
            hasSubscriptionOffer: true,
            subscriptionCTA: 'See Pro Features'
          };
        
        case CONVERSATION_PHASES.DIRECT:
          return {
            message: `You've been exploring several premium agents - I can tell you're serious about taking your business to the next level! The ${agent.name} alone would save you hours every week. Ready to unlock everything for $49/month?`,
            hasSubscriptionOffer: true,
            subscriptionCTA: 'Upgrade to Pro Now',
            urgency: true
          };
      }
    }
  }

  /**
   * Generate subscription-focused response
   * @param {string} userId - User ID
   * @param {string} phase - Current conversation phase
   * @returns {Object} - Percy's subscription response
   */
  generateSubscriptionResponse(userId, phase) {
    const context = this.getUserContext(userId);
    const exploredAgents = context.exploredAgents || [];
    const lockedAgentsViewed = exploredAgents.filter(id => !FREE_AGENTS.includes(id)).length;

    const baseResponse = {
      message: '',
      hasSubscriptionOffer: true,
      subscriptionDetails: SUBSCRIPTION_TIERS.PRO
    };

    if (lockedAgentsViewed >= 3) {
      baseResponse.message = `Perfect timing! I can see you've explored ${lockedAgentsViewed} premium agents. Our Pro plan gives you unlimited access to ALL agents for $49/month. You'd literally save more than that in the first week!`;
      baseResponse.subscriptionCTA = 'Start Pro Trial';
    } else if (lockedAgentsViewed >= 1) {
      baseResponse.message = `Great question! Our Pro plan unlocks all ${agentRegistry.length - FREE_AGENTS.length} premium agents for $49/month. Based on what you've been looking at, you'd probably use 3-4 agents regularly - that's incredible value!`;
      baseResponse.subscriptionCTA = 'See All Pro Agents';
    } else {
      baseResponse.message = `Our Pro plan gives you access to all our premium agents - think of it as having an entire AI team for your business. At $49/month, it pays for itself with just one automated workflow!`;
      baseResponse.subscriptionCTA = 'Explore Pro Features';
    }

    return baseResponse;
  }

  /**
   * Generate general conversation response
   * @param {string} userId - User ID  
   * @param {string} message - User's message
   * @param {string} phase - Current conversation phase
   * @returns {Object} - Percy's response
   */
  generateGeneralResponse(userId, message, phase) {
    // Simple keyword-based routing for now
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('content') || lowerMessage.includes('writing')) {
      return {
        message: "I'd recommend our Content Creation Agent! It's one of our free agents, perfect for getting started with AI-powered content.",
        suggestedAction: 'show_content_agent'
      };
    }
    
    if (lowerMessage.includes('business') || lowerMessage.includes('strategy')) {
      return {
        message: "Our Business Strategy Agent can help with that! It's also free to try and gives great insights into business planning.",
        suggestedAction: 'show_business_agent'
      };
    }

    // Default helpful response with gentle steering based on phase
    const responses = {
      [CONVERSATION_PHASES.SUBTLE]: "I'm here to help you find the perfect AI agents for your needs. What's your main goal today?",
      [CONVERSATION_PHASES.HINT]: "I've got several agents that might be perfect for your situation. Some are free to try, others unlock with our Pro plan.",
      [CONVERSATION_PHASES.DIRECT]: "Based on our conversation, I think you'd get tremendous value from our Pro plan. Want me to show you exactly how it would help your specific needs?"
    };

    return {
      message: responses[phase],
      hasSubscriptionOffer: phase === CONVERSATION_PHASES.DIRECT
    };
  }

  /**
   * Check if user message is asking about subscriptions/pricing
   * @param {string} message - User's message
   * @returns {boolean} - True if subscription inquiry
   */
  isSubscriptionInquiry(message) {
    const inquiryKeywords = ['price', 'cost', 'subscription', 'plan', 'upgrade', 'pro', 'premium', 'unlock', 'access'];
    const lowerMessage = message.toLowerCase();
    return inquiryKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  /**
   * Get user context for personalization
   * @param {string} userId - User ID
   * @returns {Object} - User context object
   */
  getUserContext(userId) {
    if (!this.userContext.has(userId)) {
      this.userContext.set(userId, {
        exploredAgents: [],
        subscriptionInquiries: 0,
        sessionStart: new Date().toISOString(),
        interests: []
      });
    }
    return this.userContext.get(userId);
  }

  /**
   * Get conversation history for user
   * @param {string} userId - User ID
   * @returns {Array} - Conversation history
   */
  getConversationHistory(userId) {
    if (!this.conversationHistory.has(userId)) {
      this.conversationHistory.set(userId, []);
    }
    return this.conversationHistory.get(userId);
  }

  /**
   * Track user interaction for intelligence building
   * @param {string} userId - User ID
   * @param {Object} interaction - Interaction data
   */
  trackInteraction(userId, interaction) {
    const context = this.getUserContext(userId);
    const history = this.getConversationHistory(userId);
    
    // Update context based on interaction
    if (interaction.context?.agentId) {
      if (!context.exploredAgents.includes(interaction.context.agentId)) {
        context.exploredAgents.push(interaction.context.agentId);
      }
    }
    
    if (interaction.type === 'subscription_inquiry') {
      context.subscriptionInquiries++;
    }
    
    // Add to history
    history.push(interaction);
    
    // Keep only last 50 interactions to prevent memory bloat
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }
    
    this.userContext.set(userId, context);
    this.conversationHistory.set(userId, history);
  }

  /**
   * Check if user has access to an agent
   * @param {string} userId - User ID
   * @param {string} agentId - Agent ID to check
   * @returns {Object} - Access check result
   */
  async checkAgentAccess(userId, agentId) {
    // Check if it's a free agent
    if (FREE_AGENTS.includes(agentId)) {
      return { hasAccess: true, reason: 'free_agent' };
    }
    
    // For authenticated users, check their subscription
    try {
      const { data: userData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('userId', userId)
        .maybeSingle();
      
      const userRole = userData?.role || 'client';
      
      if (userRole === 'pro' || userRole === 'enterprise' || userRole === 'admin') {
        return { hasAccess: true, reason: 'subscription', role: userRole };
      }
      
      return { 
        hasAccess: false, 
        reason: 'subscription_required',
        suggestedPlan: 'pro',
        message: 'Upgrade to Pro to unlock this agent'
      };
      
    } catch (error) {
      console.error('Error checking agent access:', error);
      return { 
        hasAccess: false, 
        reason: 'error',
        message: 'Unable to verify access. Please try again.'
      };
    }
  }

  /**
   * Generate subscription conversion score for analytics
   * @param {string} userId - User ID
   * @returns {number} - Conversion likelihood score (0-100)
   */
  getConversionScore(userId) {
    const context = this.getUserContext(userId);
    const history = this.getConversationHistory(userId);
    
    let score = 0;
    
    // Base score from agent exploration
    score += Math.min(context.exploredAgents.length * 10, 40);
    
    // Locked agent interactions increase score
    const lockedAgentViews = context.exploredAgents.filter(id => !FREE_AGENTS.includes(id)).length;
    score += Math.min(lockedAgentViews * 15, 30);
    
    // Subscription inquiries
    score += Math.min(context.subscriptionInquiries * 20, 20);
    
    // Time spent (session length)
    const sessionMinutes = (new Date() - new Date(context.sessionStart)) / (1000 * 60);
    if (sessionMinutes > 5) score += 10;
    if (sessionMinutes > 15) score += 10;
    
    return Math.min(score, 100);
  }
}

// Export singleton instance
export const percyIntelligence = new PercyIntelligenceEngine();

// Export helper functions for easier import
export const generatePercyResponse = (userId, message, context) => 
  percyIntelligence.generatePercyResponse(userId, message, context);

export const checkAgentAccess = (userId, agentId) => 
  percyIntelligence.checkAgentAccess(userId, agentId);

export const trackPercyInteraction = (userId, interaction) => 
  percyIntelligence.trackInteraction(userId, interaction); 