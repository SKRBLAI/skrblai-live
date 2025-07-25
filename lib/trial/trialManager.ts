/**
 * SKRBL AI 3-Day Trial Management System
 * Comprehensive trial management with access control and upgrade prompts
 */

import { supabase } from '../../utils/supabase';

export interface TrialStatus {
  isTrialUser: boolean;
  trialActive: boolean;
  trialExpired: boolean;
  daysRemaining: number;
  trialStartDate?: string;
  trialEndDate?: string;
  agentsUsedToday: number;
  scansUsedToday: number;
  agentLimit: number;
  scanLimit: number;
  canAccessAgent: boolean;
  canPerformScan: boolean;
  upgradeRequired: boolean;
  upgradeReason?: string;
}

export interface TrialLimits {
  agentsPerDay: number;
  scansPerDay: number;
  trialDays: number;
}

export interface UpgradePrompt {
  type: 'trial_expired' | 'agent_limit' | 'scan_limit' | 'day_1' | 'day_2' | 'day_3';
  title: string;
  message: string;
  ctaText: string;
  urgency: 'low' | 'medium' | 'high';
  showDiscount?: boolean;
  discountPercent?: number;
}

// Trial configuration
export const TRIAL_CONFIG: TrialLimits = {
  agentsPerDay: 3,
  scansPerDay: 3,
  trialDays: 3
};

// Free agents that don't count toward limits
export const FREE_AGENTS = [
  'percy'
];

export class TrialManager {
  /**
   * Initialize trial for a new user
   */
  static async initializeTrial(userId: string, email?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('initialize_user_trial', {
        p_user_id: userId,
        p_email: email
      });

      if (error) {
        console.error('Error initializing trial:', error);
        return { success: false, error: error.message };
      }

      return data;
    } catch (error) {
      console.error('Error initializing trial:', error);
      return { success: false, error: 'Failed to initialize trial' };
    }
  }

  /**
   * Get comprehensive trial status for a user
   */
  static async getTrialStatus(userId: string): Promise<TrialStatus> {
    try {
      // Get user profile with trial information
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          subscription_status,
          trial_start_date,
          trial_end_date,
          trial_status,
          trial_agent_usage_count
        `)
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        // New user - initialize trial
        await this.initializeTrial(userId);
        return this.getTrialStatus(userId);
      }

      // Check if user has active subscription
      if (profile.subscription_status === 'active') {
        return {
          isTrialUser: false,
          trialActive: false,
          trialExpired: false,
          daysRemaining: 0,
          agentsUsedToday: 0,
          scansUsedToday: 0,
          agentLimit: -1, // Unlimited
          scanLimit: -1, // Unlimited
          canAccessAgent: true,
          canPerformScan: true,
          upgradeRequired: false
        };
      }

      // Check trial limits
      const { data: limitCheck } = await supabase.rpc('check_trial_limits', {
        p_user_id: userId,
        p_check_type: 'agent'
      });

      const { data: scanLimitCheck } = await supabase.rpc('check_trial_limits', {
        p_user_id: userId,
        p_check_type: 'scan'
      });

      const now = new Date();
      const trialEnd = profile.trial_end_date ? new Date(profile.trial_end_date) : null;
      const trialExpired = trialEnd ? now > trialEnd : false;
      const daysRemaining = trialEnd ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;

      return {
        isTrialUser: true,
        trialActive: !trialExpired && profile.trial_status === 'active',
        trialExpired,
        daysRemaining,
        trialStartDate: profile.trial_start_date,
        trialEndDate: profile.trial_end_date,
        agentsUsedToday: limitCheck?.agents_used_today || 0,
        scansUsedToday: scanLimitCheck?.scans_used_today || 0,
        agentLimit: TRIAL_CONFIG.agentsPerDay,
        scanLimit: TRIAL_CONFIG.scansPerDay,
        canAccessAgent: limitCheck?.can_access || false,
        canPerformScan: scanLimitCheck?.can_access || false,
        upgradeRequired: trialExpired || limitCheck?.limit_reached || scanLimitCheck?.limit_reached,
        upgradeReason: limitCheck?.message || scanLimitCheck?.message
      };
    } catch (error) {
      console.error('Error getting trial status:', error);
      // Return safe defaults
      return {
        isTrialUser: true,
        trialActive: false,
        trialExpired: true,
        daysRemaining: 0,
        agentsUsedToday: 0,
        scansUsedToday: 0,
        agentLimit: TRIAL_CONFIG.agentsPerDay,
        scanLimit: TRIAL_CONFIG.scansPerDay,
        canAccessAgent: false,
        canPerformScan: false,
        upgradeRequired: true,
        upgradeReason: 'Unable to verify trial status'
      };
    }
  }

  /**
   * Check if user can access a specific agent
   */
  static async canAccessAgent(userId: string, agentId: string): Promise<{
    canAccess: boolean;
    reason?: string;
    upgradePrompt?: UpgradePrompt;
  }> {
    // Always allow access to free agents
    if (FREE_AGENTS.includes(agentId)) {
      return { canAccess: true };
    }

    const trialStatus = await this.getTrialStatus(userId);

    // Subscription users have unlimited access
    if (!trialStatus.isTrialUser) {
      return { canAccess: true };
    }

    // Trial expired
    if (trialStatus.trialExpired) {
      return {
        canAccess: false,
        reason: 'trial_expired',
        upgradePrompt: this.getUpgradePrompt('trial_expired', trialStatus.daysRemaining)
      };
    }

    // Daily agent limit reached
    if (!trialStatus.canAccessAgent) {
      return {
        canAccess: false,
        reason: 'daily_limit_reached',
        upgradePrompt: this.getUpgradePrompt('agent_limit', trialStatus.daysRemaining)
      };
    }

    return { canAccess: true };
  }

  /**
   * Check if user can perform a scan
   */
  static async canPerformScan(userId: string): Promise<{
    canAccess: boolean;
    reason?: string;
    upgradePrompt?: UpgradePrompt;
  }> {
    const trialStatus = await this.getTrialStatus(userId);

    // Subscription users have unlimited access
    if (!trialStatus.isTrialUser) {
      return { canAccess: true };
    }

    // Trial expired
    if (trialStatus.trialExpired) {
      return {
        canAccess: false,
        reason: 'trial_expired',
        upgradePrompt: this.getUpgradePrompt('trial_expired', trialStatus.daysRemaining)
      };
    }

    // Daily scan limit reached
    if (!trialStatus.canPerformScan) {
      return {
        canAccess: false,
        reason: 'daily_limit_reached',
        upgradePrompt: this.getUpgradePrompt('scan_limit', trialStatus.daysRemaining)
      };
    }

    return { canAccess: true };
  }

  /**
   * Record usage of an agent or feature
   */
  static async recordUsage(
    userId: string,
    type: 'agent' | 'scan' | 'feature',
    agentId?: string,
    featureName?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('record_trial_usage', {
        p_user_id: userId,
        p_usage_type: type,
        p_agent_id: agentId,
        p_feature_name: featureName
      });

      if (error) {
        console.error('Error recording usage:', error);
        return { success: false, error: error.message };
      }

      return data;
    } catch (error) {
      console.error('Error recording usage:', error);
      return { success: false, error: 'Failed to record usage' };
    }
  }

  /**
   * Track upgrade prompt display
   */
  static async trackUpgradePrompt(
    userId: string,
    promptType: UpgradePrompt['type'],
    context?: string,
    clicked?: boolean,
    converted?: boolean
  ): Promise<void> {
    try {
      await supabase.from('upgrade_prompts').insert({
        user_id: userId,
        prompt_type: promptType,
        prompt_context: context,
        clicked: clicked || false,
        converted: converted || false,
        metadata: { timestamp: new Date().toISOString() }
      });
    } catch (error) {
      console.error('Error tracking upgrade prompt:', error);
    }
  }

  /**
   * Get appropriate upgrade prompt based on context
   */
  static getUpgradePrompt(type: UpgradePrompt['type'], daysRemaining: number): UpgradePrompt {
    const prompts: Record<UpgradePrompt['type'], UpgradePrompt> = {
      trial_expired: {
        type: 'trial_expired',
        title: '🚀 Your Gateway Experience Has Ended',
        message: 'Ready to dominate your industry? Upgrade to Starter Hustler ($27/month) for unlimited agent access and competitive advantage.',
        ctaText: 'Start Dominating ($27/month)',
        urgency: 'high',
        showDiscount: true,
        discountPercent: 20
      },
      agent_limit: {
        type: 'agent_limit',
        title: '🤖 Agent Domination Limit Reached',
        message: `You've tasted the power with 3 agents! Upgrade to Starter Hustler for 6 agents or Business Dominator for 10+ agents. Your competition isn't waiting.`,
        ctaText: 'Unlock More Firepower',
        urgency: 'medium',
        showDiscount: daysRemaining <= 1,
        discountPercent: 15
      },
      scan_limit: {
        type: 'scan_limit',
        title: '🔍 Intelligence Gathering Limit Reached',
        message: `You've used all 3 scans today! Upgrade to Starter Hustler ($27) for 50 scans/month or Business Dominator ($67) for 200 scans/month.`,
        ctaText: 'Upgrade Intelligence Access',
        urgency: 'medium',
        showDiscount: daysRemaining <= 1,
        discountPercent: 15
      },
      day_1: {
        type: 'day_1',
        title: '🎯 Welcome to Industry Disruption!',
        message: 'You have 2 days left to explore our agent arsenal. Lock in Starter Hustler pricing at $27/month before your trial ends!',
        ctaText: 'Lock in $27/month',
        urgency: 'low',
        showDiscount: true,
        discountPercent: 20
      },
      day_2: {
        type: 'day_2',
        title: '⏰ Final Day to Secure Domination!',
        message: 'Your trial ends tomorrow. Don\'t lose access to the agent firepower that\'s transforming your business. Upgrade now!',
        ctaText: 'Secure Agent Arsenal',
        urgency: 'high',
        showDiscount: true,
        discountPercent: 25
      },
      day_3: {
        type: 'day_3',
        title: '🚨 Trial Ending - Competition is Upgrading!',
        message: 'Your 3-day trial expires in hours. While you decide, your competitors are already using our Industry Crusher plan. Don\'t get left behind!',
        ctaText: 'Upgrade Before It\'s Too Late',
        urgency: 'high',
        showDiscount: true,
        discountPercent: 30
      }
    };

    return prompts[type];
  }

  /**
   * Check if user should see daily reminder prompt
   */
  static async shouldShowDailyPrompt(userId: string): Promise<{
    show: boolean;
    promptType?: UpgradePrompt['type'];
    prompt?: UpgradePrompt;
  }> {
    try {
      const trialStatus = await this.getTrialStatus(userId);

      if (!trialStatus.isTrialUser || trialStatus.trialExpired) {
        return { show: false };
      }

      // Check if we've already shown a prompt today
      const { data: todaysPrompts } = await supabase
        .from('upgrade_prompts')
        .select('id')
        .eq('user_id', userId)
        .gte('shown_at', new Date().toISOString().split('T')[0] + 'T00:00:00.000Z')
        .limit(1);

      if (todaysPrompts && todaysPrompts.length > 0) {
        return { show: false };
      }

      // Determine which prompt to show based on days remaining
      let promptType: UpgradePrompt['type'];
      if (trialStatus.daysRemaining <= 0) {
        promptType = 'day_3';
      } else if (trialStatus.daysRemaining <= 1) {
        promptType = 'day_2';
      } else {
        promptType = 'day_1';
      }

      return {
        show: true,
        promptType,
        prompt: this.getUpgradePrompt(promptType, trialStatus.daysRemaining)
      };
    } catch (error) {
      console.error('Error checking daily prompt:', error);
      return { show: false };
    }
  }

  /**
   * Convert trial user to paid subscription
   */
  static async convertTrial(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await supabase
        .from('profiles')
        .update({
          trial_status: 'converted',
          subscription_status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      // Track conversion
      await this.trackUpgradePrompt(userId, 'trial_expired', 'conversion', true, true);

      return { success: true };
    } catch (error) {
      console.error('Error converting trial:', error);
      return { success: false, error: 'Failed to convert trial' };
    }
  }

  /**
   * Get trial analytics for admin dashboard
   */
  static async getTrialAnalytics(timeframe: 'day' | 'week' | 'month' = 'week') {
    try {
      const { data, error } = await supabase
        .from('trial_metrics')
        .select('*');

      if (error) throw error;

      // Process analytics data
      const analytics = {
        totalTrialUsers: data.length,
        activeTrials: data.filter(t => t.current_trial_state === 'active').length,
        expiredTrials: data.filter(t => t.current_trial_state === 'expired').length,
        expiringTrials: data.filter(t => t.current_trial_state === 'expiring_soon').length,
        conversionRate: 0,
        averageUsage: 0
      };

      // Calculate conversion rate
      const convertedUsers = data.filter(t => t.trial_status === 'converted').length;
      analytics.conversionRate = analytics.totalTrialUsers > 0 
        ? (convertedUsers / analytics.totalTrialUsers) * 100 
        : 0;

      // Calculate average usage
      const totalUsage = data.reduce((sum, user) => sum + (user.agents_used_today || 0), 0);
      analytics.averageUsage = analytics.totalTrialUsers > 0 
        ? totalUsage / analytics.totalTrialUsers 
        : 0;

      return { success: true, data: analytics };
    } catch (error) {
      console.error('Error getting trial analytics:', error);
      return { success: false, error: 'Failed to get analytics' };
    }
  }
}