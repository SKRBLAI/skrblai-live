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
