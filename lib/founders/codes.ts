/**
 * Founder Codes System - Code Verification and Redemption
 * Handles secure bcrypt-based code verification and redemption tracking
 * NEVER stores or logs plaintext codes
 */

import bcrypt from 'bcryptjs';
import { getServerSupabaseAdmin } from '@/lib/supabase/server';
import type { FounderRole } from './roles';

export interface FounderCode {
  id: string;
  label: string;
  role: FounderRole;
  agent_likeness: string;
  code_hash: string;
  max_redemptions: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface RedemptionResult {
  success: boolean;
  role?: FounderRole;
  codeLabel?: string;
  agentLikeness?: string;
  error?: string;
}

export interface UsageLogEntry {
  userId: string;
  action: string;
  meta?: Record<string, any>;
}

/**
 * Hash a plaintext code using bcrypt
 * Used for seeding and testing - never store plaintext
 */
export async function hashFounderCode(plainCode: string): Promise<string> {
  const saltRounds = 12; // High security for founder codes
  return await bcrypt.hash(plainCode, saltRounds);
}

/**
 * Verify a plaintext code against stored hash
 * Returns the founder code record if valid, null if invalid
 */
export async function verifyFounderCode(plainCode: string): Promise<FounderCode | null> {
  const supabase = getServerSupabaseAdmin();
  if (!supabase) {
    console.error('[FOUNDERS] Server Supabase not available for code verification');
    return null;
  }

  try {
    // Get all active, non-expired codes
    const { data: codes, error } = await supabase
      .from('founder_codes')
      .select('*')
      .eq('is_active', true)
      .or('expires_at.is.null,expires_at.gt.now()');

    if (error) {
      console.error('[FOUNDERS] Error fetching founder codes:', error);
      return null;
    }

    if (!codes || codes.length === 0) {
      return null;
    }

    // Check each code hash against the plaintext
    for (const code of codes) {
      try {
        const isValid = await bcrypt.compare(plainCode, code.code_hash);
        if (isValid) {
          return code as FounderCode;
        }
      } catch (bcryptError) {
        console.error('[FOUNDERS] Bcrypt comparison error for code:', code.label, bcryptError);
        continue;
      }
    }

    return null;
  } catch (error) {
    console.error('[FOUNDERS] Error in verifyFounderCode:', error);
    return null;
  }
}

/**
 * Redeem a founder code for a user
 * Validates all constraints and creates membership record
 */
export async function redeemFounderCode({ 
  userId, 
  plainCode 
}: { 
  userId: string; 
  plainCode: string; 
}): Promise<RedemptionResult> {
  const supabase = getServerSupabaseAdmin();
  if (!supabase) {
    return { success: false, error: 'Service temporarily unavailable' };
  }

  try {
    // Verify the code
    const founderCode = await verifyFounderCode(plainCode);
    if (!founderCode) {
      await logFounderAction({ 
        userId, 
        action: 'redeem.code.invalid', 
        meta: { timestamp: new Date().toISOString() } 
      });
      return { success: false, error: 'Invalid or expired founder code' };
    }

    // Check if user already redeemed this specific code
    const { data: existingMembership, error: membershipError } = await supabase
      .from('founder_memberships')
      .select('id')
      .eq('user_id', userId)
      .eq('founder_code_id', founderCode.id)
      .maybeSingle();

    if (membershipError && membershipError.code !== 'PGRST116') {
      console.error('[FOUNDERS] Error checking existing membership:', membershipError);
      return { success: false, error: 'Error validating code redemption' };
    }

    if (existingMembership) {
      await logFounderAction({ 
        userId, 
        action: 'redeem.code.already_used', 
        meta: { codeLabel: founderCode.label } 
      });
      return { success: false, error: 'You have already redeemed this founder code' };
    }

    // Check redemption limit
    const { data: redemptionCount, error: countError } = await supabase
      .from('founder_memberships')
      .select('id', { count: 'exact' })
      .eq('founder_code_id', founderCode.id)
      .eq('status', 'active');

    if (countError) {
      console.error('[FOUNDERS] Error checking redemption count:', countError);
      return { success: false, error: 'Error validating code usage' };
    }

    const currentRedemptions = redemptionCount?.length || 0;
    if (currentRedemptions >= founderCode.max_redemptions) {
      await logFounderAction({ 
        userId, 
        action: 'redeem.code.limit_exceeded', 
        meta: { codeLabel: founderCode.label, limit: founderCode.max_redemptions } 
      });
      return { success: false, error: 'This founder code has reached its redemption limit' };
    }

    // Create the membership record
    const { error: insertError } = await supabase
      .from('founder_memberships')
      .insert({
        user_id: userId,
        founder_code_id: founderCode.id,
        role: founderCode.role,
        status: 'active'
      });

    if (insertError) {
      console.error('[FOUNDERS] Error creating founder membership:', insertError);
      return { success: false, error: 'Failed to activate founder access' };
    }

    // Log successful redemption
    await logFounderAction({ 
      userId, 
      action: 'redeem.code.success', 
      meta: { 
        codeLabel: founderCode.label, 
        role: founderCode.role,
        agentLikeness: founderCode.agent_likeness
      } 
    });

    return {
      success: true,
      role: founderCode.role,
      codeLabel: founderCode.label,
      agentLikeness: founderCode.agent_likeness
    };

  } catch (error) {
    console.error('[FOUNDERS] Error in redeemFounderCode:', error);
    await logFounderAction({ 
      userId, 
      action: 'redeem.code.error', 
      meta: { error: error instanceof Error ? error.message : 'Unknown error' } 
    });
    return { success: false, error: 'An unexpected error occurred' };
  }
}

/**
 * Log founder action for audit trail
 * All founder/heir/creator actions should be logged
 */
export async function logFounderAction({ userId, action, meta }: UsageLogEntry): Promise<void> {
  const supabase = getServerSupabaseAdmin();
  if (!supabase) {
    console.warn('[FOUNDERS] Cannot log action - Supabase not available:', action);
    return;
  }

  try {
    const { error } = await supabase
      .from('founder_usage_logs')
      .insert({
        user_id: userId,
        action,
        meta: meta || {}
      });

    if (error) {
      console.error('[FOUNDERS] Error logging action:', action, error);
    }
  } catch (error) {
    console.error('[FOUNDERS] Error in logFounderAction:', error);
  }
}

/**
 * Get recent founder usage logs (Creator dashboard)
 * Returns redacted logs for privacy
 */
export async function getRecentFounderLogs(limit: number = 100): Promise<any[]> {
  const supabase = getServerSupabaseAdmin();
  if (!supabase) {
    return [];
  }

  try {
    const { data: logs, error } = await supabase
      .from('founder_usage_logs')
      .select(`
        id,
        action,
        meta,
        created_at,
        user_id
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[FOUNDERS] Error fetching usage logs:', error);
      return [];
    }

    // Redact sensitive information
    return (logs || []).map(log => ({
      id: log.id,
      action: log.action,
      meta: {
        ...log.meta,
        // Remove any potentially sensitive data
        user_id: undefined,
        email: undefined,
        code: undefined
      },
      created_at: log.created_at,
      user_id: log.user_id.substring(0, 8) + '...' // Partial user ID for tracking
    }));
  } catch (error) {
    console.error('[FOUNDERS] Error in getRecentFounderLogs:', error);
    return [];
  }
}

/**
 * Validate if a code format looks like a founder code
 * Used for routing decisions in UI
 */
export function looksLikeFounderCode(code: string): boolean {
  if (!code || typeof code !== 'string') return false;
  
  // Founder codes typically have specific patterns
  // This is a heuristic - actual validation happens server-side
  const founderPatterns = [
    /^diggin_\d+$/i,           // diggin_420
    /^bmore_finest_\d+$/i,     // bmore_finest_365
    /^gold_glove_\d+$/i,       // gold_glove_92
    /^mstr_jay_\d+$/i,         // mstr_jay_12
    /^mstr_skrbl_\d+$/i,       // mstr_skrbl_3
  ];

  return founderPatterns.some(pattern => pattern.test(code));
}