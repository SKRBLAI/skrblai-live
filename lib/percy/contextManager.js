/* global Map */
/**
 * Percy Context Manager - Smart user behavior tracking and conversation memory
 * Builds upon existing memory utilities and PercyProvider infrastructure
 */

import { supabase } from '@/utils/supabase';
import { saveIntentMemory, clearPercyMemory } from '@/utils/memory';
import { logPercyMessage, getPercyMessageHistory } from '@/utils/percy/logPercyMessage';
import { trackPercyEvent } from '@/lib/analytics/percyAnalytics';
import { FREE_AGENTS, CONVERSATION_PHASES } from '@/lib/percy/intelligenceEngine';

/**
 * User behavior tracking categories
 */
export const BEHAVIOR_TYPES = {
  AGENT_VIEW: 'agent_view',
  AGENT_CLICK: 'agent_click',
  LOCKED_AGENT_CLICK: 'locked_agent_click',
  SUBSCRIPTION_INQUIRY: 'subscription_inquiry',
  MESSAGE_SENT: 'message_sent',
  PAGE_VISIT: 'page_visit',
  FILE_UPLOAD: 'file_upload',
  UPGRADE_INTEREST: 'upgrade_interest',
  PRICING_PAGE_VISIT: 'pricing_page_visit'
};

/**
 * Context persistence strategies
 */
export const PERSISTENCE_STRATEGIES = {
  SESSION_ONLY: 'session', // localStorage only
  AUTHENTICATED: 'authenticated', // database for logged-in users
  HYBRID: 'hybrid' // localStorage + database sync
};

/**
 * Percy Context Manager Class
 */
export class PercyContextManager {
  constructor() {
    this.sessionContext = new Map();
    this.behaviorQueue = [];
    this.persistenceStrategy = PERSISTENCE_STRATEGIES.HYBRID;
    this.syncInterval = 30000; // 30 seconds
    
    // Start periodic sync for authenticated users
    if (typeof window !== 'undefined') {
      setInterval(() => this.syncToDatabase(), this.syncInterval);
    }
  }

  /**
   * Initialize user context (called when user starts interaction)
   * @param {string} userId - User ID or session ID
   * @param {boolean} isAuthenticated - Whether user is logged in
   * @param {Object} initialData - Initial context data
   */
  async initializeContext(userId, isAuthenticated = false, initialData = {}) {
    const contextKey = this.getContextKey(userId);
    
    // Load existing context
    let existingContext = await this.loadExistingContext(userId, isAuthenticated);
    
    const context = {
      userId,
      sessionId: contextKey,
      isAuthenticated,
      sessionStart: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      
      // Behavior tracking
      behaviors: existingContext?.behaviors || [],
      exploredAgents: existingContext?.exploredAgents || [],
      lockedAgentClicks: existingContext?.lockedAgentClicks || [],
      subscriptionInquiries: existingContext?.subscriptionInquiries || 0,
      
      // Conversation state
      conversationPhase: existingContext?.conversationPhase || CONVERSATION_PHASES.SUBTLE,
      messageCount: existingContext?.messageCount || 0,
      lastPercyResponse: existingContext?.lastPercyResponse || null,
      
      // Intent tracking
      statedGoals: existingContext?.statedGoals || [],
      inferredInterests: existingContext?.inferredInterests || [],
      businessType: existingContext?.businessType || null,
      
      // Conversion tracking
      conversionScore: existingContext?.conversionScore || 0,
      upgradeInterestLevel: existingContext?.upgradeInterestLevel || 0,
      
      // Custom data
      ...initialData,
      ...existingContext
    };
    
    this.sessionContext.set(contextKey, context);
    
    // Track initialization
    await this.trackBehavior(userId, BEHAVIOR_TYPES.PAGE_VISIT, {
      page: 'percy_initialization',
      isReturningUser: !!existingContext,
      sessionLength: existingContext ? this.getSessionLength(existingContext.sessionStart) : 0
    });
    
    return context;
  }

  /**
   * Update user context
   * @param {string} userId - User ID
   * @param {Object} updates - Context updates
   */
  async updateContext(userId, updates) {
    const contextKey = this.getContextKey(userId);
    const context = this.sessionContext.get(contextKey);
    
    if (!context) {
      console.warn(`No context found for user ${userId}`);
      return;
    }
    
    const updatedContext = {
      ...context,
      ...updates,
      lastActivity: new Date().toISOString()
    };
    
    this.sessionContext.set(contextKey, updatedContext);
    
    // Queue for database sync if authenticated
    if (updatedContext.isAuthenticated) {
      this.queueForSync(userId, updatedContext);
    }
    
    return updatedContext;
  }

  /**
   * Track user behavior
   * @param {string} userId - User ID
   * @param {string} behaviorType - Type of behavior
   * @param {Object} data - Behavior data
   */
  async trackBehavior(userId, behaviorType, data = {}) {
    const context = await this.getContext(userId);
    if (!context) return;
    
    const behavior = {
      type: behaviorType,
      timestamp: new Date().toISOString(),
      data,
      sessionId: context.sessionId
    };
    
    // Add to context
    const updatedBehaviors = [...(context.behaviors || []), behavior].slice(-50); // Keep last 50
    
    // Update specific tracking based on behavior type
    const updates = {
      behaviors: updatedBehaviors,
      lastActivity: behavior.timestamp
    };
    
    switch (behaviorType) {
      case BEHAVIOR_TYPES.AGENT_VIEW:
        if (data.agentId && !context.exploredAgents.includes(data.agentId)) {
          updates.exploredAgents = [...context.exploredAgents, data.agentId];
        }
        break;
        
      case BEHAVIOR_TYPES.LOCKED_AGENT_CLICK:
        updates.lockedAgentClicks = [...context.lockedAgentClicks, {
          agentId: data.agentId,
          timestamp: behavior.timestamp
        }];
        updates.upgradeInterestLevel = Math.min((context.upgradeInterestLevel || 0) + 10, 100);
        break;
        
      case BEHAVIOR_TYPES.SUBSCRIPTION_INQUIRY:
        updates.subscriptionInquiries = (context.subscriptionInquiries || 0) + 1;
        updates.upgradeInterestLevel = Math.min((context.upgradeInterestLevel || 0) + 20, 100);
        break;
        
      case BEHAVIOR_TYPES.PRICING_PAGE_VISIT:
        updates.upgradeInterestLevel = Math.min((context.upgradeInterestLevel || 0) + 15, 100);
        break;
        
      case BEHAVIOR_TYPES.MESSAGE_SENT:
        updates.messageCount = (context.messageCount || 0) + 1;
        break;
    }
    
    // Update conversation phase based on behavior
    updates.conversationPhase = this.calculateConversationPhase(context, updates);
    updates.conversionScore = this.calculateConversionScore(context, updates);
    
    await this.updateContext(userId, updates);
    
    // Track with Percy analytics
    await this.trackWithPercyAnalytics(userId, behaviorType, data);
  }

  /**
   * Calculate conversation phase based on user behavior
   * @param {Object} context - Current context
   * @param {Object} updates - Pending updates
   * @returns {string} - Conversation phase
   */
  calculateConversationPhase(context, updates = {}) {
    const mergedContext = { ...context, ...updates };
    
    const lockedClicks = mergedContext.lockedAgentClicks?.length || 0;
    const subscriptionInquiries = mergedContext.subscriptionInquiries || 0;
    const exploredAgents = mergedContext.exploredAgents?.length || 0;
    const messageCount = mergedContext.messageCount || 0;
    
    // Direct phase triggers
    if (lockedClicks >= 3 || subscriptionInquiries >= 2 || exploredAgents >= 5) {
      return CONVERSATION_PHASES.DIRECT;
    }
    
    // Hint phase triggers
    if (lockedClicks >= 1 || subscriptionInquiries >= 1 || exploredAgents >= 3 || messageCount >= 5) {
      return CONVERSATION_PHASES.HINT;
    }
    
    // Default to subtle
    return CONVERSATION_PHASES.SUBTLE;
  }

  /**
   * Calculate conversion score based on behavior
   * @param {Object} context - Current context
   * @param {Object} updates - Pending updates
   * @returns {number} - Conversion score (0-100)
   */
  calculateConversionScore(context, updates = {}) {
    const mergedContext = { ...context, ...updates };
    
    let score = 0;
    
    // Agent exploration
    score += Math.min((mergedContext.exploredAgents?.length || 0) * 5, 25);
    
    // Locked agent interest
    score += Math.min((mergedContext.lockedAgentClicks?.length || 0) * 10, 30);
    
    // Subscription inquiries
    score += Math.min((mergedContext.subscriptionInquiries || 0) * 15, 30);
    
    // Session engagement
    const sessionMinutes = this.getSessionLength(mergedContext.sessionStart) / (1000 * 60);
    if (sessionMinutes > 5) score += 5;
    if (sessionMinutes > 15) score += 10;
    
    // Message engagement
    if ((mergedContext.messageCount || 0) > 3) score += 5;
    if ((mergedContext.messageCount || 0) > 10) score += 5;
    
    return Math.min(score, 100);
  }

  /**
   * Get user context
   * @param {string} userId - User ID
   * @returns {Object} - User context
   */
  async getContext(userId) {
    const contextKey = this.getContextKey(userId);
    let context = this.sessionContext.get(contextKey);
    
    if (!context) {
      // Try to load from storage
      context = await this.loadExistingContext(userId, false);
      if (context) {
        this.sessionContext.set(contextKey, context);
      }
    }
    
    return context;
  }

  /**
   * Load existing context from storage
   * @param {string} userId - User ID
   * @param {boolean} isAuthenticated - Whether user is authenticated
   * @returns {Object|null} - Existing context or null
   */
  async loadExistingContext(userId, isAuthenticated) {
    try {
      // Try localStorage first
      if (typeof window !== 'undefined') {
        const sessionData = localStorage.getItem(`percy_context_${userId}`);
        if (sessionData) {
          const parsed = JSON.parse(sessionData);
          
          // Check if data is recent (within 24 hours)
          const dataAge = Date.now() - new Date(parsed.sessionStart).getTime();
          if (dataAge < 24 * 60 * 60 * 1000) {
            return parsed;
          }
        }
      }
      
      // Try database for authenticated users
      if (isAuthenticated) {
        const { data } = await supabase
          .from('percy_contexts')
          .select('*')
          .eq('userId', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (data) {
          return JSON.parse(data.contextData);
        }
      }
      
    } catch (error) {
      console.error('Error loading existing context:', error);
    }
    
    return null;
  }

  /**
   * Save context to localStorage
   * @param {string} userId - User ID
   * @param {Object} context - Context to save
   */
  saveToLocalStorage(userId, context) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`percy_context_${userId}`, JSON.stringify(context));
      } catch (error) {
        console.error('Error saving context to localStorage:', error);
      }
    }
  }

  /**
   * Queue context for database sync
   * @param {string} userId - User ID
   * @param {Object} context - Context to sync
   */
  queueForSync(userId, context) {
    this.behaviorQueue.push({
      userId,
      context,
      timestamp: Date.now()
    });
    
    // Also save to localStorage immediately
    this.saveToLocalStorage(userId, context);
  }

  /**
   * Sync queued contexts to database
   */
  async syncToDatabase() {
    if (this.behaviorQueue.length === 0) return;
    
    const batch = this.behaviorQueue.splice(0, 10); // Process in batches
    
    for (const item of batch) {
      try {
        await supabase
          .from('percy_contexts')
          .upsert({
            userId: item.userId,
            contextData: JSON.stringify(item.context),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'userId'
          });
      } catch (error) {
        console.error('Error syncing context to database:', error);
        // Re-queue failed items
        this.behaviorQueue.push(item);
      }
    }
  }

  /**
   * Track behavior with Percy analytics
   * @param {string} userId - User ID
   * @param {string} behaviorType - Behavior type
   * @param {Object} data - Behavior data
   */
  async trackWithPercyAnalytics(userId, behaviorType, data) {
    try {
      await trackPercyEvent({
        event_type: behaviorType,
        user_choice: data.agentId || data.message || behaviorType,
        session_id: `percy-${userId}`,
        timestamp: new Date().toISOString(),
        metadata: data
      });
    } catch (error) {
      console.error('Error tracking with Percy analytics:', error);
    }
  }

  /**
   * Get context key for user
   * @param {string} userId - User ID
   * @returns {string} - Context key
   */
  getContextKey(userId) {
    return `percy_${userId}_${Date.now()}`;
  }

  /**
   * Get session length in milliseconds
   * @param {string} sessionStart - Session start timestamp
   * @returns {number} - Session length in ms
   */
  getSessionLength(sessionStart) {
    return Date.now() - new Date(sessionStart).getTime();
  }

  /**
   * Clear user context
   * @param {string} userId - User ID
   */
  async clearContext(userId) {
    const contextKey = this.getContextKey(userId);
    this.sessionContext.delete(contextKey);
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`percy_context_${userId}`);
    }
    
    // Clear database context for authenticated users
    try {
      await supabase
        .from('percy_contexts')
        .delete()
        .eq('userId', userId);
    } catch (error) {
      console.error('Error clearing database context:', error);
    }
  }

  /**
   * Get conversion recommendations for user
   * @param {string} userId - User ID
   * @returns {Object} - Conversion recommendations
   */
  async getConversionRecommendations(userId) {
    const context = await this.getContext(userId);
    if (!context) return null;
    
    const score = context.conversionScore || 0;
    const phase = context.conversationPhase || CONVERSATION_PHASES.SUBTLE;
    const lockedClicks = context.lockedAgentClicks?.length || 0;
    
    return {
      score,
      phase,
      readyForUpgrade: score > 60,
      recommendedApproach: phase,
      personalizedMessage: this.generatePersonalizedMessage(context),
      urgencyLevel: lockedClicks >= 3 ? 'high' : lockedClicks >= 1 ? 'medium' : 'low'
    };
  }

  /**
   * Generate personalized message based on context
   * @param {Object} context - User context
   * @returns {string} - Personalized message
   */
  generatePersonalizedMessage(context) {
    const lockedClicks = context.lockedAgentClicks?.length || 0;
    const exploredAgents = context.exploredAgents?.length || 0;
    
    if (lockedClicks >= 3) {
      return `I can see you're seriously interested in our premium agents! You've explored ${lockedClicks} locked agents - that shows you're ready to take your business to the next level. Ready to unlock everything?`;
    } else if (lockedClicks >= 1) {
      return `You've shown interest in our premium agents - that's exciting! For just $49/month, you could access all our advanced tools. Want to see what you'd get?`;
    } else if (exploredAgents >= 3) {
      return `You're really exploring our platform! I can tell you're serious about finding the right AI solutions. Have you considered what our premium agents could do for your business?`;
    } else {
      return `I'm here to help you find the perfect AI agents for your goals. What's the biggest challenge you're trying to solve today?`;
    }
  }
}

// Export singleton instance
export const percyContextManager = new PercyContextManager();

// Export helper functions
export const initializePercyContext = (userId, isAuthenticated, initialData) => 
  percyContextManager.initializeContext(userId, isAuthenticated, initialData);

export const trackPercyBehavior = (userId, behaviorType, data) => 
  percyContextManager.trackBehavior(userId, behaviorType, data);

export const getPercyContext = (userId) => 
  percyContextManager.getContext(userId);

export const updatePercyContext = (userId, updates) => 
  percyContextManager.updateContext(userId, updates);

export const getConversionRecommendations = (userId) => 
  percyContextManager.getConversionRecommendations(userId);

export const clearPercyContext = (userId) => 
  percyContextManager.clearContext(userId); 