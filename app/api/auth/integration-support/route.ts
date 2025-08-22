import { NextResponse } from 'next/server';
import { getBearer } from './getBearer';
import { getOptionalServerSupabase } from '../../../../lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import {
  debugUserAuth,
  performHealthCheck,
  simulateAuthFlow,
  resetUserAuthState,
  generateTestPromoCodes
} from '../../../../lib/auth/integrationSupport';

const DATABASE_ERROR_RESPONSE = NextResponse.json(
  { success: false, error: 'Database configuration error' },
  { status: 500 }
);

/**
 * GET /api/auth/integration-support
 * Provides debugging and support tools for authentication integration
 * Supports different operations via query parameters
 */
export async function GET(req: Request) {
  try {
    const token = await getBearer(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const supabase = await getOptionalServerSupabase();
    if (!supabase) {
      console.warn('[integration-support GET] Supabase not configured – 503');
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }
    const { searchParams } = new URL(req.url);
    const operation = searchParams.get('operation');
    const email = searchParams.get('email');
    const promoCode = searchParams.get('promoCode');

    // Development/staging only check
    if (
      process.env.NODE_ENV === 'production' &&
      process.env.ALLOW_INTEGRATION_SUPPORT !== 'true'
    ) {
      return NextResponse.json(
        { success: false, error: 'Integration support not available in production' },
        { status: 403 }
      );
    }

    switch (operation) {
      case 'health-check': {
        const healthCheck = await performHealthCheck();
        return NextResponse.json({
          success: true,
          operation: 'health-check',
          data: healthCheck,
          timestamp: new Date().toISOString()
        });
      }

      case 'debug-user': {
        if (!email) {
          return NextResponse.json(
            { success: false, error: 'Email parameter required for debug-user operation' },
            { status: 400 }
          );
        }

        const debugInfo = await debugUserAuth(email, promoCode || undefined);
        return NextResponse.json({
          success: true,
          operation: 'debug-user',
          email,
          data: debugInfo,
          timestamp: new Date().toISOString()
        });
      }

      case 'generate-test-codes': {
        const count = parseInt(searchParams.get('count') || '5');
        const testCodes = await generateTestPromoCodes(count);
        return NextResponse.json({
          success: testCodes.success,
          operation: 'generate-test-codes',
          data: testCodes,
          timestamp: new Date().toISOString()
        });
      }

      case 'list-recent-activity': {
        const hours = parseInt(searchParams.get('hours') || '24');
        const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

        const { data: recentActivity, error: activityError } = await supabase
          .from('auth_audit_logs')
          .select('*')
          .gte('created_at', since)
          .order('created_at', { ascending: false })
          .limit(100);

        if (activityError) {
          return NextResponse.json(
            { success: false, error: 'Failed to fetch recent activity' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          operation: 'list-recent-activity',
          data: {
            hours,
            count: recentActivity?.length || 0,
            activity: recentActivity || []
          },
          timestamp: new Date().toISOString()
        });
      }

      case 'check-promo-codes': {
        const { data: promoCodes, error: promoError } = await supabase
          .from('promo_codes')
          .select('code, type, status, current_usage, usage_limit, expires_at, benefits')
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (promoError) {
          return NextResponse.json(
            { success: false, error: 'Failed to fetch promo codes' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          operation: 'check-promo-codes',
          data: {
            totalActive: promoCodes?.length || 0,
            codes: promoCodes || []
          },
          timestamp: new Date().toISOString()
        });
      }

      default:
        return NextResponse.json({
          success: true,
          message: 'Integration Support API',
          availableOperations: [
            'health-check',
            'debug-user (requires email parameter)',
            'generate-test-codes (optional count parameter)',
            'list-recent-activity (optional hours parameter)',
            'check-promo-codes'
          ],
          timestamp: new Date().toISOString()
        });
    }
  } catch (error: any) {
    console.error('[API] Integration support error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Integration support service error',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/integration-support
 * Performs integration support actions that require POST requests
 */
export async function POST(req: Request) {
  try {
    const token = await getBearer(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const supabase = getOptionalServerSupabase();
    if (!supabase) {
      console.warn('[integration-support POST] Supabase not configured – 503');
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }
    const body = await req.json();
    const { operation, email, password, options = {} } = body;

    // Development/staging only check
    if (
      process.env.NODE_ENV === 'production' &&
      process.env.ALLOW_INTEGRATION_SUPPORT !== 'true'
    ) {
      return NextResponse.json(
        { success: false, error: 'Integration support not available in production' },
        { status: 403 }
      );
    }

    switch (operation) {
      case 'simulate-auth': {
        if (!email || !password) {
          return NextResponse.json(
            { success: false, error: 'Email and password required for simulate-auth operation' },
            { status: 400 }
          );
        }

        const simulation = await simulateAuthFlow(email, password, options);
        return NextResponse.json({
          success: true,
          operation: 'simulate-auth',
          data: simulation,
          timestamp: new Date().toISOString()
        });
      }

      case 'reset-user-state': {
        if (!email) {
          return NextResponse.json(
            { success: false, error: 'Email required for reset-user-state operation' },
            { status: 400 }
          );
        }

        const resetResult = await resetUserAuthState(email);
        return NextResponse.json({
          success: resetResult.success,
          operation: 'reset-user-state',
          email,
          data: resetResult,
          timestamp: new Date().toISOString()
        });
      }

      case 'bulk-test-setup': {
        // Create multiple test users and scenarios
        const testUsers = [
          { email: 'test.user1@example.com', scenario: 'basic_user' },
          { email: 'test.vip@example.com', scenario: 'vip_user' },
          { email: 'test.promo@example.com', scenario: 'promo_user' }
        ];

        const setupResults = [];

        for (const testUser of testUsers) {
          try {
            // Create user in Supabase Auth (if not exists)
            const { data: existingUser } = await supabase.auth.admin.listUsers();
            const userExists = existingUser?.users?.some(u => u.email === testUser.email);

            if (!userExists) {
              const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
                email: testUser.email,
                password: 'TestPassword123!',
                email_confirm: true
              });

              if (createError) {
                setupResults.push({
                  email: testUser.email,
                  success: false,
                  error: createError.message
                });
                continue;
              }
            }

            // Set up scenario-specific data
            if (testUser.scenario === 'vip_user') {
              await supabase.from('vip_users').upsert({
                email: testUser.email,
                is_vip: true,
                vip_level: 'gold',
                vip_score: 85,
                company_name: 'Test VIP Company'
              });
            }

            setupResults.push({
              email: testUser.email,
              scenario: testUser.scenario,
              success: true,
              message: 'Test user setup complete'
            });

          } catch (error: any) {
            setupResults.push({
              email: testUser.email,
              success: false,
              error: error.message
            });
          }
        }

        return NextResponse.json({
          success: true,
          operation: 'bulk-test-setup',
          data: {
            totalUsers: testUsers.length,
            results: setupResults,
            message: 'Bulk test setup completed'
          },
          timestamp: new Date().toISOString()
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown operation' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('[API] Integration support POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Integration support service error',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/integration-support
 * Cleanup operations for integration testing
 */
export async function DELETE(req: Request) {
  try {
    const token = await getBearer(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const supabase = getOptionalServerSupabase();
    if (!supabase) {
      console.warn('[integration-support DELETE] Supabase not configured – 503');
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }
    const { searchParams } = new URL(req.url);
    const operation = searchParams.get('operation');

    // Development/staging only check
    if (
      process.env.NODE_ENV === 'production' &&
      process.env.ALLOW_INTEGRATION_SUPPORT !== 'true'
    ) {
      return NextResponse.json(
        { success: false, error: 'Integration support not available in production' },
        { status: 403 }
      );
    }

    switch (operation) {
      case 'cleanup-test-data': {
        // Clean up test promo codes
        const { error: promoCleanupError } = await supabase
          .from('promo_codes')
          .delete()
          .like('code', 'TEST_%');

        // Clean up test audit logs
        const { error: auditCleanupError } = await supabase
          .from('auth_audit_logs')
          .delete()
          .eq('source', 'simulation');

        // Clean up rate limits for test users
        const { error: rateLimitCleanupError } = await supabase
          .from('auth_rate_limits')
          .delete()
          .like('identifier', 'test.%@example.com');

        const errors = [
          promoCleanupError,
          auditCleanupError,
          rateLimitCleanupError
        ].filter(Boolean);

        return NextResponse.json({
          success: errors.length === 0,
          operation: 'cleanup-test-data',
          data: {
            promoCodesCleanup: !promoCleanupError,
            auditLogsCleanup: !auditCleanupError,
            rateLimitsCleanup: !rateLimitCleanupError,
            errors: errors.map(e => e?.message)
          },
          timestamp: new Date().toISOString()
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown cleanup operation' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('[API] Integration support DELETE error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Integration support cleanup error',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
