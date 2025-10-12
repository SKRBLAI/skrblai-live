/**
 * SKRBL AI Trial Management - Simplified
 * Thin wrapper around Supabase trial RPC functions
 */

import { getServerSupabaseAdmin } from '@/lib/supabase';

export interface TrialCheckResult {
  canAccess: boolean;
  reason?: string;
}

export class TrialManager {
  /**
   * Get Supabase client with error handling
   */
  private static getSupabase() {
    const supabase = getServerSupabaseAdmin();
    if (!supabase) {
      throw new Error('Supabase client unavailable');
    }
    return supabase;
  }

  /**
   * Get comprehensive trial status for a user
   * Delegates to Supabase RPC function
   */
  static async getTrialStatus(userId: string): Promise<any> {
    try {
      const supabase = this.getSupabase();
      
      // Get user profile with trial information
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('subscription_status, trial_start_date, trial_end_date, trial_status')
        .eq('id', userId)
        .single();

      if (error || !profile) {
        // Return default trial status
        return {
          isTrialUser: true,
          trialActive: false,
          trialExpired: true,
          daysRemaining: 0,
          canAccessFeatures: false
        };
      }

      // Check if user has active subscription
      if (profile.subscription_status === 'active') {
        return {
          isTrialUser: false,
          trialActive: false,
          trialExpired: false,
          daysRemaining: 0,
          canAccessFeatures: true
        };
      }

      // Calculate trial status
      const now = new Date();
      const trialEnd = profile.trial_end_date ? new Date(profile.trial_end_date) : null;
      const trialExpired = trialEnd ? now > trialEnd : false;
      const daysRemaining = trialEnd 
        ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) 
        : 0;

      return {
        isTrialUser: true,
        trialActive: !trialExpired && profile.trial_status === 'active',
        trialExpired,
        daysRemaining,
        canAccessFeatures: !trialExpired
      };
    } catch (error) {
      console.error('Error getting trial status:', error);
      return {
        isTrialUser: true,
        trialActive: false,
        trialExpired: true,
        daysRemaining: 0,
        canAccessFeatures: false
      };
    }
  }

  /**
   * Initialize trial for a new user
   * Delegates to Supabase RPC function
   */
  static async initializeTrial(userId: string, email?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = this.getSupabase();
      
      // Call Supabase RPC function that handles trial initialization
      const { data, error } = await supabase.rpc('initialize_user_trial', {
        p_user_id: userId,
        p_email: email
      });

      if (error) {
        console.error('Error initializing trial:', error);
        return { success: false, error: error.message };
      }

      return data || { success: true };
    } catch (error: any) {
      console.error('Error in initializeTrial:', error);
      return { success: false, error: error.message || 'Failed to initialize trial' };
    }
  }

  /**
   * Check if user can perform a scan
   * Delegates to Supabase RPC function
   */
  static async canPerformScan(userId: string): Promise<TrialCheckResult> {
    try {
      const supabase = this.getSupabase();
      
      // Call Supabase RPC function that handles all trial logic
      const { data, error } = await supabase.rpc('check_trial_limits', {
        p_user_id: userId,
        p_check_type: 'scan'
      });

      if (error) {
        console.error('Error checking scan limits:', error);
        return { canAccess: false, reason: 'error_checking_limits' };
      }

      return {
        canAccess: data?.can_access || false,
        reason: data?.message || data?.reason
      };
    } catch (error) {
      console.error('Error in canPerformScan:', error);
      return { canAccess: false, reason: 'error' };
    }
  }

  /**
   * Check if user can access an agent
   * Delegates to Supabase RPC function
   */
  static async canAccessAgent(userId: string, agentId: string): Promise<TrialCheckResult> {
    try {
      // Free agents (like Percy) are always accessible
      const FREE_AGENTS = ['percy'];
      if (FREE_AGENTS.includes(agentId)) {
        return { canAccess: true };
      }

      const supabase = this.getSupabase();
      
      // Call Supabase RPC function
      const { data, error } = await supabase.rpc('check_trial_limits', {
        p_user_id: userId,
        p_check_type: 'agent'
      });

      if (error) {
        console.error('Error checking agent limits:', error);
        return { canAccess: false, reason: 'error_checking_limits' };
      }

      return {
        canAccess: data?.can_access || false,
        reason: data?.message || data?.reason
      };
    } catch (error) {
      console.error('Error in canAccessAgent:', error);
      return { canAccess: false, reason: 'error' };
    }
  }

  /**
   * Record usage of an agent or scan
   * Delegates to Supabase RPC function
   */
  static async recordUsage(
    userId: string,
    type: 'agent' | 'scan' | 'feature',
    agentId?: string,
    featureName?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = this.getSupabase();
      
      // Call Supabase RPC function
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

      return data || { success: true };
    } catch (error: any) {
      console.error('Error in recordUsage:', error);
      return { success: false, error: error.message || 'Failed to record usage' };
    }
  }
}
