/* global Map, Promise */
/**
 * Agent Access Control System
 * Builds upon existing premium gating and subscription infrastructure
 */

import { supabase } from '@/utils/supabase';
import { checkPremiumAccess, ROLE_PERMISSIONS } from '@/lib/premiumGating';
import { FREE_AGENTS, SUBSCRIPTION_TIERS } from '@/lib/percy/intelligenceEngine';
import agentRegistry from '@/lib/agents/agentRegistry';

/**
 * Agent access levels
 */
export const ACCESS_LEVELS = {
  FREE: 'free',
  STARTER: 'starter', 
  PRO: 'pro',
  ENTERPRISE: 'enterprise'
};

/**
 * Agent categories and their required access levels
 */
export const AGENT_ACCESS_MATRIX = {
  // Always free agents
  'content-creation-agent': ACCESS_LEVELS.FREE,
  'business-strategy-agent': ACCESS_LEVELS.FREE,
  
  // Starter tier agents (5 total including free ones)
  'social-media-agent': ACCESS_LEVELS.STARTER,
  'analytics-agent': ACCESS_LEVELS.STARTER,
  'branding-agent': ACCESS_LEVELS.STARTER,
  
  // Pro tier agents (unlimited)
  'ad-creative-agent': ACCESS_LEVELS.PRO,
  'website-builder-agent': ACCESS_LEVELS.PRO,
  'publishing-agent': ACCESS_LEVELS.PRO,
  'video-content-agent': ACCESS_LEVELS.PRO,
  'client-success-agent': ACCESS_LEVELS.PRO,
  'payment-manager-agent': ACCESS_LEVELS.PRO,
  'sync-agent': ACCESS_LEVELS.PRO,
  'proposal-agent': ACCESS_LEVELS.PRO,
  
  // Enterprise tier agents (all + custom features)
  'custom-agent-builder': ACCESS_LEVELS.ENTERPRISE,
  'white-label-agent': ACCESS_LEVELS.ENTERPRISE,
  'api-integration-agent': ACCESS_LEVELS.ENTERPRISE
};

/**
 * Role to access level mapping
 */
export const ROLE_ACCESS_MAPPING = {
  'client': ACCESS_LEVELS.FREE,
  'starter': ACCESS_LEVELS.STARTER,
  'pro': ACCESS_LEVELS.PRO,
  'enterprise': ACCESS_LEVELS.ENTERPRISE,
  'admin': ACCESS_LEVELS.ENTERPRISE
};

/**
 * Agent Access Control Class
 */
export class AgentAccessController {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Check if user has access to a specific agent
   * @param {string} userId - User ID
   * @param {string} agentId - Agent ID to check
   * @returns {Object} - Access check result
   */
  async checkAgentAccess(userId, agentId) {
    // Check cache first
    const cacheKey = `${userId}:${agentId}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.result;
    }

    try {
      // Get user role
      const userRole = await this.getUserRole(userId);
      const userAccessLevel = ROLE_ACCESS_MAPPING[userRole] || ACCESS_LEVELS.FREE;
      
      // Check agent access requirements
      const requiredAccessLevel = AGENT_ACCESS_MATRIX[agentId] || ACCESS_LEVELS.PRO;
      const hasAccess = this.compareAccessLevels(userAccessLevel, requiredAccessLevel);
      
      const result = {
        hasAccess,
        userRole,
        userAccessLevel,
        requiredAccessLevel,
        agentId,
        canUpgrade: !hasAccess,
        upgradeTarget: hasAccess ? null : this.getUpgradeTarget(userAccessLevel, requiredAccessLevel),
        reason: hasAccess ? 'access_granted' : 'subscription_required'
      };

      // Cache the result
      this.cache.set(cacheKey, {
        result,
        timestamp: Date.now()
      });

      return result;
      
    } catch (error) {
      console.error('Error checking agent access:', error);
      return {
        hasAccess: false,
        reason: 'error',
        error: error.message
      };
    }
  }

  /**
   * Get user's current subscription role
   * @param {string} userId - User ID
   * @returns {string} - User role
   */
  async getUserRole(userId) {
    try {
      const { data: userData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('userId', userId)
        .maybeSingle();
      
      return userData?.role || 'client';
    } catch (error) {
      console.error('Error fetching user role:', error);
      return 'client';
    }
  }

  /**
   * Compare access levels to determine if user can access agent
   * @param {string} userLevel - User's access level
   * @param {string} requiredLevel - Required access level
   * @returns {boolean} - True if user has sufficient access
   */
  compareAccessLevels(userLevel, requiredLevel) {
    const levels = [ACCESS_LEVELS.FREE, ACCESS_LEVELS.STARTER, ACCESS_LEVELS.PRO, ACCESS_LEVELS.ENTERPRISE];
    const userIndex = levels.indexOf(userLevel);
    const requiredIndex = levels.indexOf(requiredLevel);
    
    return userIndex >= requiredIndex;
  }

  /**
   * Get upgrade target for user to access agent
   * @param {string} currentLevel - User's current access level
   * @param {string} requiredLevel - Required access level
   * @returns {Object} - Upgrade recommendation
   */
  getUpgradeTarget(currentLevel, requiredLevel) {
    const upgradeMap = {
      [ACCESS_LEVELS.FREE]: {
        [ACCESS_LEVELS.STARTER]: { plan: 'starter', price: 19 },
        [ACCESS_LEVELS.PRO]: { plan: 'pro', price: 49 },
        [ACCESS_LEVELS.ENTERPRISE]: { plan: 'enterprise', price: 99 }
      },
      [ACCESS_LEVELS.STARTER]: {
        [ACCESS_LEVELS.PRO]: { plan: 'pro', price: 49 },
        [ACCESS_LEVELS.ENTERPRISE]: { plan: 'enterprise', price: 99 }
      },
      [ACCESS_LEVELS.PRO]: {
        [ACCESS_LEVELS.ENTERPRISE]: { plan: 'enterprise', price: 99 }
      }
    };

    return upgradeMap[currentLevel]?.[requiredLevel] || { plan: 'pro', price: 49 };
  }

  /**
   * Filter agents list based on user access
   * @param {string} userId - User ID
   * @param {Array} agents - List of agents to filter
   * @returns {Array} - Filtered agents with access metadata
   */
  async filterAgentsByAccess(userId, agents = agentRegistry) {
    const userRole = await this.getUserRole(userId);
    const userAccessLevel = ROLE_ACCESS_MAPPING[userRole] || ACCESS_LEVELS.FREE;

    const filteredAgents = await Promise.all(
      agents.map(async (agent) => {
        const accessCheck = await this.checkAgentAccess(userId, agent.id);
        
        return {
          ...agent,
          isLocked: !accessCheck.hasAccess,
          accessLevel: accessCheck.requiredAccessLevel,
          upgradeTarget: accessCheck.upgradeTarget,
          lockReason: accessCheck.reason
        };
      })
    );

    return filteredAgents;
  }

  /**
   * Get agents available to user by access level
   * @param {string} userId - User ID
   * @returns {Object} - Categorized agents by access
   */
  async getAgentsByAccess(userId) {
    const userRole = await this.getUserRole(userId);
    const userAccessLevel = ROLE_ACCESS_MAPPING[userRole] || ACCESS_LEVELS.FREE;
    
    const availableAgents = [];
    const lockedAgents = [];
    
    for (const agent of agentRegistry) {
      const requiredLevel = AGENT_ACCESS_MATRIX[agent.id] || ACCESS_LEVELS.PRO;
      const hasAccess = this.compareAccessLevels(userAccessLevel, requiredLevel);
      
      if (hasAccess) {
        availableAgents.push({
          ...agent,
          accessLevel: requiredLevel
        });
      } else {
        lockedAgents.push({
          ...agent,
          accessLevel: requiredLevel,
          upgradeTarget: this.getUpgradeTarget(userAccessLevel, requiredLevel)
        });
      }
    }

    return {
      available: availableAgents,
      locked: lockedAgents,
      userAccessLevel,
      userRole,
      totalAgents: agentRegistry.length,
      availableCount: availableAgents.length,
      lockedCount: lockedAgents.length
    };
  }

  /**
   * Generate upgrade recommendation based on user behavior
   * @param {string} userId - User ID
   * @param {Array} requestedAgents - Agents user has tried to access
   * @returns {Object} - Upgrade recommendation
   */
  generateUpgradeRecommendation(userId, requestedAgents = []) {
    const lockedAgents = requestedAgents.filter(agentId => 
      !FREE_AGENTS.includes(agentId)
    );
    
    if (lockedAgents.length === 0) {
      return {
        recommended: false,
        reason: 'No premium agents requested'
      };
    }

    // Determine best upgrade path
    const requiredLevels = lockedAgents.map(agentId => 
      AGENT_ACCESS_MATRIX[agentId] || ACCESS_LEVELS.PRO
    );
    
    const highestRequired = requiredLevels.includes(ACCESS_LEVELS.ENTERPRISE) 
      ? ACCESS_LEVELS.ENTERPRISE 
      : ACCESS_LEVELS.PRO;

    const tierInfo = Object.values(SUBSCRIPTION_TIERS).find(tier => 
      tier.name.toLowerCase() === highestRequired
    );

    return {
      recommended: true,
      targetTier: highestRequired,
      tierInfo,
      lockedAgentsCount: lockedAgents.length,
      estimatedMonthlySavings: lockedAgents.length * 50, // Rough estimate
      reason: `Access ${lockedAgents.length} premium agents`
    };
  }

  /**
   * Track agent access attempts for analytics
   * @param {string} userId - User ID
   * @param {string} agentId - Agent ID
   * @param {boolean} hasAccess - Whether access was granted
   * @param {string} reason - Access result reason
   */
  async trackAccessAttempt(userId, agentId, hasAccess, reason) {
    try {
      await supabase
        .from('agent_access_logs')
        .insert({
          userId,
          agentId,
          hasAccess,
          reason,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error logging access attempt:', error);
    }
  }

  /**
   * Clear user cache (useful for subscription changes)
   * @param {string} userId - User ID
   */
  clearUserCache(userId) {
    for (const [key] of this.cache) {
      if (key.startsWith(`${userId}:`)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get subscription upgrade URL for user
   * @param {string} userId - User ID
   * @param {string} targetPlan - Target subscription plan
   * @returns {string} - Upgrade URL
   */
  getUpgradeUrl(userId, targetPlan = 'pro') {
    const baseUrl = '/pricing';
    const params = new URLSearchParams({
      plan: targetPlan,
      source: 'agent_access',
      user: userId
    });
    
    return `${baseUrl}?${params.toString()}`;
  }
}

// Export singleton instance
export const agentAccessController = new AgentAccessController();

// Export helper functions
export const checkAgentAccess = (userId, agentId) => 
  agentAccessController.checkAgentAccess(userId, agentId);

export const filterAgentsByAccess = (userId, agents) => 
  agentAccessController.filterAgentsByAccess(userId, agents);

export const getAgentsByAccess = (userId) => 
  agentAccessController.getAgentsByAccess(userId);

export const generateUpgradeRecommendation = (userId, requestedAgents) => 
  agentAccessController.generateUpgradeRecommendation(userId, requestedAgents);

export const trackAgentAccessAttempt = (userId, agentId, hasAccess, reason) => 
  agentAccessController.trackAccessAttempt(userId, agentId, hasAccess, reason); 