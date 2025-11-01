/**
 * Founder Roles System - Role Guards and Utilities
 * Provides role-based access control for creator, founder, heir, vip, user
 * Role precedence: creator > heir > founder > vip > user
 */

import { getServerSupabaseAdmin } from '@/lib/supabase';

export type FounderRole = 'creator' | 'founder' | 'heir';
export type UserRole = 'creator' | 'founder' | 'heir' | 'vip' | 'user';

export interface FounderMembership {
  role: FounderRole;
  status: 'active' | 'revoked' | 'suspended';
  redeemed_at: string;
  code_label: string;
  agent_likeness: string;
}

export interface UserRoleInfo {
  userId: string;
  email?: string;
  founderRoles: FounderMembership[];
  highestRole: UserRole;
  hasFounderAccess: boolean;
  isCreator: boolean;
  isFounder: boolean;
  isHeir: boolean;
  isVip: boolean;
}

/**
 * Get role precedence value (lower = higher precedence)
 */
function getRolePrecedence(role: UserRole): number {
  switch (role) {
    case 'creator': return 1;
    case 'heir': return 2;
    case 'founder': return 3;
    case 'vip': return 4;
    case 'user': return 5;
    default: return 6;
  }
}

/**
 * Determine highest role from multiple roles
 */
export function getHighestRole(roles: UserRole[]): UserRole {
  if (roles.length === 0) return 'user';
  
  return roles.reduce((highest, current) => {
    return getRolePrecedence(current) < getRolePrecedence(highest) ? current : highest;
  }, 'user');
}

/**
 * Get comprehensive user role information
 * Combines founder roles with existing VIP status
 */
export async function getUserRoleInfo(userId: string): Promise<UserRoleInfo | null> {
  const supabase = getServerSupabaseAdmin();
  if (!supabase) {
    console.warn('[FOUNDERS] Server Supabase not available for role check');
    return null;
  }

  try {
    // Get founder roles
    const { data: founderRoles, error: founderError } = await supabase
      .rpc('get_user_founder_roles', { user_uuid: userId });

    if (founderError) {
      console.error('[FOUNDERS] Error fetching founder roles:', founderError);
    }

    // Get VIP status from existing system
    const { data: vipStatus, error: vipError } = await supabase
      .from('user_dashboard_access')
      .select('is_vip, access_level')
      .eq('user_id', userId)
      .maybeSingle();

    if (vipError && vipError.code !== 'PGRST116') {
      console.error('[FOUNDERS] Error fetching VIP status:', vipError);
    }

    // Get user email
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    const email = userData?.user?.email;

    if (userError) {
      console.warn('[FOUNDERS] Could not fetch user email:', userError);
    }

    // Determine all roles
    const allRoles: UserRole[] = [];
    const founderMemberships: FounderMembership[] = founderRoles || [];

    // Add founder roles
    founderMemberships.forEach(membership => {
      allRoles.push(membership.role);
    });

    // Add VIP role if applicable
    if (vipStatus?.is_vip || vipStatus?.access_level === 'vip') {
      allRoles.push('vip');
    }

    // Default to user if no special roles
    if (allRoles.length === 0) {
      allRoles.push('user');
    }

    const highestRole = getHighestRole(allRoles);
    const hasFounderAccess = ['creator', 'founder', 'heir'].includes(highestRole);

    return {
      userId,
      email,
      founderRoles: founderMemberships,
      highestRole,
      hasFounderAccess,
      isCreator: allRoles.includes('creator'),
      isFounder: allRoles.includes('founder'),
      isHeir: allRoles.includes('heir'),
      isVip: allRoles.includes('vip')
    };

  } catch (error) {
    console.error('[FOUNDERS] Error in getUserRoleInfo:', error);
    return null;
  }
}

/**
 * Role guard functions
 */
export async function isCreator(userId: string): Promise<boolean> {
  const roleInfo = await getUserRoleInfo(userId);
  return roleInfo?.isCreator || false;
}

export async function isFounder(userId: string): Promise<boolean> {
  const roleInfo = await getUserRoleInfo(userId);
  return roleInfo?.isFounder || false;
}

export async function isHeir(userId: string): Promise<boolean> {
  const roleInfo = await getUserRoleInfo(userId);
  return roleInfo?.isHeir || false;
}

export async function hasFounderAccess(userId: string): Promise<boolean> {
  const roleInfo = await getUserRoleInfo(userId);
  return roleInfo?.hasFounderAccess || false;
}

/**
 * Check if user has at least the specified role level
 */
export async function hasRoleLevel(userId: string, requiredRole: UserRole): Promise<boolean> {
  const roleInfo = await getUserRoleInfo(userId);
  if (!roleInfo) return false;

  const userPrecedence = getRolePrecedence(roleInfo.highestRole);
  const requiredPrecedence = getRolePrecedence(requiredRole);

  return userPrecedence <= requiredPrecedence;
}

/**
 * Creator allowlist check (fallback for admin endpoints)
 * Checks against CREATOR_EMAILS environment variable
 */
export function isCreatorByEmail(email: string): boolean {
  const creatorEmails = process.env.CREATOR_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
  return creatorEmails.includes(email.toLowerCase());
}

/**
 * Validate creator access for admin endpoints
 * Checks both founder role and email allowlist
 */
export async function validateCreatorAccess(userId: string, email?: string): Promise<boolean> {
  // Check founder role first
  if (await isCreator(userId)) {
    return true;
  }

  // Fallback to email allowlist
  if (email && isCreatorByEmail(email)) {
    return true;
  }

  return false;
}