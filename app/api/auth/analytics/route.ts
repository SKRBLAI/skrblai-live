import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { authAuditLogger } from '../../../../lib/auth/authAuditLogger';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/auth/analytics
 * 
 * Provides authentication analytics and monitoring data
 * Supports real-time monitoring of auth system health
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get('timeRange') as '1h' | '24h' | '7d' || '24h';
    const detailed = searchParams.get('detailed') === 'true';
    
    // Check authorization (for admin/monitoring access)
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authorization required' },
        { status: 401 }
      );
    }

    // Verify user has admin access or is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid authorization' },
        { status: 401 }
      );
    }

    // Get basic analytics using audit logger
    const analytics = await authAuditLogger.getAuthAnalytics(timeRange);

    if (detailed) {
      // Get additional detailed analytics using database function
      const hoursBack = timeRange === '1h' ? 1 : timeRange === '24h' ? 24 : 168;
      
      const { data: detailedAnalytics, error: analyticsError } = await supabase
        .rpc('get_auth_analytics', { p_hours_back: hoursBack });

      if (analyticsError) {
        console.error('[API] Analytics error:', analyticsError);
        return NextResponse.json({
          success: true,
          analytics,
          detailed: null,
          warning: 'Detailed analytics unavailable'
        });
      }

      // Get recent security events
      const { data: securityEvents, error: securityError } = await supabase
        .from('auth_audit_logs')
        .select('*')
        .in('event_type', ['security_violation', 'suspicious_activity', 'rate_limit'])
        .gte('created_at', new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(50);

      // Get rate limiting status
      const { data: rateLimitData, error: rateLimitError } = await supabase
        .from('auth_rate_limits')
        .select('*')
        .not('blocked_until', 'is', null)
        .gte('blocked_until', new Date().toISOString())
        .order('last_attempt', { ascending: false })
        .limit(20);

      return NextResponse.json({
        success: true,
        analytics,
        detailed: detailedAnalytics,
        securityEvents: securityEvents || [],
        activeRateLimits: rateLimitData || [],
        timestamp: new Date().toISOString(),
        metadata: {
          timeRange,
          user: user.email,
          requestId: crypto.randomUUID()
        }
      });
    }

    return NextResponse.json({
      success: true,
      analytics,
      timestamp: new Date().toISOString(),
      metadata: {
        timeRange,
        user: user.email
      }
    });

  } catch (error: any) {
    console.error('[API] Auth analytics error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Analytics service temporarily unavailable',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth/analytics/alert
 * 
 * Creates security alerts based on authentication patterns
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { alertType, threshold, metadata } = body;

    // Basic validation
    if (!alertType || typeof threshold !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Alert type and threshold required' },
        { status: 400 }
      );
    }

    // Check authorization
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authorization required' },
        { status: 401 }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid authorization' },
        { status: 401 }
      );
    }

    let alertTriggered = false;
    let alertData = {};

    // Implement different alert types
    switch (alertType) {
      case 'failed_login_spike': {
        // Check for spike in failed logins
        const { data: recentFailures } = await supabase
          .from('auth_audit_logs')
          .select('count(*)')
          .eq('event_type', 'signin_failure')
          .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString()); // Last 15 minutes

        if ((recentFailures as any)?.[0]?.count >= threshold) {
          alertTriggered = true;
          alertData = { 
            failureCount: (recentFailures as any)?.[0]?.count,
            threshold,
            timeWindow: '15 minutes'
          };
        }
        break;
      }

      case 'security_violations': {
        // Check for security violations
        const { data: violations } = await supabase
          .from('auth_audit_logs')
          .select('count(*)')
          .eq('event_type', 'security_violation')
          .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()); // Last hour

        if ((violations as any)?.[0]?.count >= threshold) {
          alertTriggered = true;
          alertData = { 
            violationCount: (violations as any)?.[0]?.count,
            threshold,
            timeWindow: '1 hour'
          };
        }
        break;
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown alert type' },
          { status: 400 }
        );
    }

    if (alertTriggered) {
      // Log the alert
      await supabase.from('auth_audit_logs').insert({
        event_type: 'security_violation',
        severity: 'warning',
        source: 'alert_system',
        metadata: {
          alertType,
          alertData,
          triggeredBy: user.email,
          ...metadata
        }
      });

      // In a production system, you might also:
      // - Send email notifications
      // - Trigger Slack/Discord webhooks
      // - Update monitoring dashboards
      // - Escalate to security team
    }

    return NextResponse.json({
      success: true,
      alertTriggered,
      alertType,
      threshold,
      alertData,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[API] Auth alert error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Alert service temporarily unavailable',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 