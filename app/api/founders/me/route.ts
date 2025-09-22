/**
 * Founder User Info API
 * GET /api/founders/me
 * Returns current user's founder roles and access level
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getUserRoleInfo } from '@/lib/founders/roles';
import { logFounderAction } from '@/lib/founders/codes';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({
        roles: [],
        founderAccess: false,
        highestRole: 'user'
      }, { status: 200 });
    }

    const userId = session.user.id;

    // Get comprehensive role information
    const roleInfo = await getUserRoleInfo(userId);

    if (!roleInfo) {
      return NextResponse.json({
        roles: [],
        founderAccess: false,
        highestRole: 'user'
      }, { status: 200 });
    }

    // Log access check (for audit trail)
    if (roleInfo.hasFounderAccess) {
      await logFounderAction({
        userId,
        action: 'access.role_check',
        meta: {
          highestRole: roleInfo.highestRole,
          founderRoles: roleInfo.founderRoles.map(r => r.role),
          timestamp: new Date().toISOString()
        }
      });
    }

    // Return role information (safe for client)
    return NextResponse.json({
      roles: roleInfo.founderRoles.map(membership => ({
        role: membership.role,
        status: membership.status,
        codeLabel: membership.code_label,
        agentLikeness: membership.agent_likeness,
        redeemedAt: membership.redeemed_at
      })),
      founderAccess: roleInfo.hasFounderAccess,
      highestRole: roleInfo.highestRole,
      isCreator: roleInfo.isCreator,
      isFounder: roleInfo.isFounder,
      isHeir: roleInfo.isHeir,
      isVip: roleInfo.isVip
    });

  } catch (error) {
    console.error('[FOUNDERS API] Error in me endpoint:', error);
    
    return NextResponse.json({
      roles: [],
      founderAccess: false,
      highestRole: 'user',
      error: 'Failed to fetch role information'
    }, { status: 500 });
  }
}