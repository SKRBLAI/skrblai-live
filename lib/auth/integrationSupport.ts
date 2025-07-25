import { createClient } from '@supabase/supabase-js';
import { authAuditLogger } from './authAuditLogger';
import { 
  authenticateForDashboard,
  validatePromoCode,
  checkVIPStatus,
  getUserDashboardAccess
} from './dashboardAuth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface AuthDebugInfo {
  userExists: boolean;
  vipStatus: any;
  dashboardAccess: any;
  promoCodeStatus?: any;
  rateLimitStatus?: any;
  recentActivity: any[];
  suggestions: string[];
}

export interface AuthHealthCheck {
  overall: 'healthy' | 'warning' | 'error';
  database: 'connected' | 'error';
  rateLimit: 'normal' | 'elevated' | 'critical';
  auditLogging: 'active' | 'inactive' | 'error';
  recentErrors: number;
  performance: {
    avgResponseTime: number;
    errorRate: number;
  };
}

/**
 * Comprehensive authentication debugging for integration support
 * Helps Windsurf team debug auth issues during development
 */
export class AuthIntegrationSupport {
  
  /**
   * Debug authentication flow for a specific user
   * Provides detailed information about user state and potential issues
   */
  static async debugUserAuth(email: string, promoCode?: string): Promise<AuthDebugInfo> {
    const debugInfo: AuthDebugInfo = {
      userExists: false,
      vipStatus: null,
      dashboardAccess: null,
      recentActivity: [],
      suggestions: []
    };

    try {
      // Check if user exists in Supabase Auth
      const { data: users, error: userError } = await supabase.auth.admin.listUsers();
      const user = users?.users?.find(u => u.email === email);
      debugInfo.userExists = !!user;

      if (!user) {
        debugInfo.suggestions.push('User does not exist in Supabase Auth - ensure user has signed up');
        return debugInfo;
      }

      // Check VIP status
      debugInfo.vipStatus = await checkVIPStatus(email);

      // Check dashboard access
      debugInfo.dashboardAccess = await getUserDashboardAccess(user.id);

      // Check promo code if provided
      if (promoCode) {
        debugInfo.promoCodeStatus = await validatePromoCode(promoCode);
        if (!debugInfo.promoCodeStatus.isValid) {
          debugInfo.suggestions.push(`Promo code '${promoCode}' is invalid: ${debugInfo.promoCodeStatus.error}`);
        }
      }

      // Check rate limiting status
      const { data: rateLimitData } = await supabase.rpc('check_rate_limit', {
        p_identifier: email,
        p_identifier_type: 'email',
        p_event_type: 'signin_attempt',
        p_max_attempts: 5,
        p_window_minutes: 15,
        p_block_minutes: 60
      });
      debugInfo.rateLimitStatus = rateLimitData;

      if (rateLimitData && !rateLimitData.allowed) {
        debugInfo.suggestions.push('User is rate limited - wait before attempting again');
      }

      // Get recent activity
      const { data: recentActivity } = await supabase
        .from('auth_audit_logs')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(10);

      debugInfo.recentActivity = recentActivity || [];

      // Generate suggestions based on state
      if (!debugInfo.dashboardAccess) {
        debugInfo.suggestions.push('User has no dashboard access record - first sign-in will create one');
      }

      if (debugInfo.vipStatus?.isVIP && debugInfo.dashboardAccess?.access_level !== 'vip') {
        debugInfo.suggestions.push('User is VIP but dashboard access level is not VIP - may need sync');
      }

      const recentFailures = debugInfo.recentActivity.filter(
        activity => activity.event_type === 'signin_failure'
      ).length;

      if (recentFailures >= 3) {
        debugInfo.suggestions.push('Multiple recent sign-in failures - check credentials');
      }

    } catch (error: any) {
      debugInfo.suggestions.push(`Debug error: ${error.message}`);
    }

    return debugInfo;
  }

  /**
   * Perform authentication system health check
   */
  static async performHealthCheck(): Promise<AuthHealthCheck> {
    const healthCheck: AuthHealthCheck = {
      overall: 'healthy',
      database: 'connected',
      rateLimit: 'normal',
      auditLogging: 'active',
      recentErrors: 0,
      performance: {
        avgResponseTime: 0,
        errorRate: 0
      }
    };

    try {
      // Test database connectivity
      const dbTestStart = Date.now();
      const { error: dbError } = await supabase
        .from('auth_audit_logs')
        .select('count(*)')
        .limit(1);

      if (dbError) {
        healthCheck.database = 'error';
        healthCheck.overall = 'error';
      } else {
        healthCheck.performance.avgResponseTime = Date.now() - dbTestStart;
      }

      // Check recent error rates
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: recentEvents } = await supabase
        .from('auth_audit_logs')
        .select('event_type, severity')
        .gte('created_at', oneHourAgo);

      if (recentEvents) {
        const totalEvents = recentEvents.length;
        healthCheck.recentErrors = recentEvents.filter(
          event => event.severity === 'error' || event.severity === 'critical'
        ).length;

        if (totalEvents > 0) {
          healthCheck.performance.errorRate = healthCheck.recentErrors / totalEvents;
        }

        // Determine rate limit status
        const rateLimitEvents = recentEvents.filter(
          event => event.event_type === 'rate_limit'
        ).length;

        if (rateLimitEvents > 10) {
          healthCheck.rateLimit = 'elevated';
          healthCheck.overall = 'warning';
        } else if (rateLimitEvents > 25) {
          healthCheck.rateLimit = 'critical';
          healthCheck.overall = 'error';
        }
      }

      // Check audit logging
      try {
        await authAuditLogger.logEvent({
          eventType: 'system_health_check',
          metadata: { component: 'integration_support' },
          severity: 'info',
          source: 'health_check'
        });
      } catch (auditError) {
        healthCheck.auditLogging = 'error';
        healthCheck.overall = 'warning';
      }

    } catch (error: any) {
      healthCheck.overall = 'error';
      healthCheck.database = 'error';
    }

    return healthCheck;
  }

  /**
   * Simulate authentication flow for testing
   * Useful for Windsurf to test different scenarios
   */
  static async simulateAuthFlow(
    email: string,
    password: string,
    options: {
      promoCode?: string;
      vipCode?: string;
      simulateFailure?: boolean;
      simulateRateLimit?: boolean;
    } = {}
  ): Promise<{
    success: boolean;
    result?: any;
    debugInfo: AuthDebugInfo;
    healthCheck: AuthHealthCheck;
    recommendations: string[];
  }> {
    const recommendations: string[] = [];

    // Get debug info first
    const debugInfo = await this.debugUserAuth(email, options.promoCode || options.vipCode);
    const healthCheck = await this.performHealthCheck();

    if (options.simulateFailure) {
      recommendations.push('Simulated failure - check error handling in UI');
      return {
        success: false,
        debugInfo,
        healthCheck,
        recommendations
      };
    }

    if (options.simulateRateLimit) {
      // Temporarily trigger rate limit for testing
      await authAuditLogger.logEvent({
        eventType: 'rate_limit',
        email,
        metadata: { simulated: true },
        severity: 'warning',
        source: 'simulation'
      });

      recommendations.push('Simulated rate limit - check rate limit handling in UI');
      return {
        success: false,
        debugInfo,
        healthCheck,
        recommendations
      };
    }

    try {
      // Attempt actual authentication
      const authResult = await authenticateForDashboard({
        email,
        password,
        promoCode: options.promoCode,
        vipCode: options.vipCode
      }, {
        ip: 'simulation',
        userAgent: 'integration-test'
      });

      if (authResult.success) {
        recommendations.push('Authentication successful - ready for UI integration');
      } else {
        recommendations.push(`Authentication failed: ${authResult.error}`);
        recommendations.push('Check credentials and user setup');
      }

      return {
        success: authResult.success,
        result: authResult,
        debugInfo,
        healthCheck,
        recommendations
      };

    } catch (error: any) {
      recommendations.push(`Simulation error: ${error.message}`);
      return {
        success: false,
        debugInfo,
        healthCheck,
        recommendations
      };
    }
  }

  /**
   * Reset user authentication state for testing
   * Useful for clearing rate limits and test data
   */
  static async resetUserAuthState(email: string): Promise<{
    success: boolean;
    actionsPerformed: string[];
    warnings: string[];
  }> {
    const actionsPerformed: string[] = [];
    const warnings: string[] = [];

    try {
      // Clear rate limits
      const { error: rateLimitError } = await supabase
        .from('auth_rate_limits')
        .delete()
        .eq('identifier', email);

      if (!rateLimitError) {
        actionsPerformed.push('Cleared rate limits');
      } else {
        warnings.push('Failed to clear rate limits');
      }

      // Reset dashboard access to free tier
      const { data: users } = await supabase.auth.admin.listUsers();
      const user = users?.users?.find(u => u.email === email);

      if (user) {
        const { error: accessError } = await supabase
          .from('user_dashboard_access')
          .upsert({
            user_id: user.id,
            email: email.toLowerCase(),
            access_level: 'free',
            is_vip: false,
            benefits: {},
            metadata: { reset_at: new Date().toISOString() },
            updated_at: new Date().toISOString()
          });

        if (!accessError) {
          actionsPerformed.push('Reset dashboard access to free tier');
        } else {
          warnings.push('Failed to reset dashboard access');
        }
      }

      // Log the reset action
      await authAuditLogger.logEvent({
        eventType: 'system_health_check',
        email,
        metadata: { 
          action: 'reset_user_auth_state',
          actionsPerformed,
          warnings
        },
        severity: 'info',
        source: 'integration_support'
      });

      return {
        success: warnings.length === 0,
        actionsPerformed,
        warnings
      };

    } catch (error: any) {
      warnings.push(`Reset error: ${error.message}`);
      return {
        success: false,
        actionsPerformed,
        warnings
      };
    }
  }

  /**
   * Generate test promo codes for integration testing
   */
  static async generateTestPromoCodes(count: number = 5): Promise<{
    success: boolean;
    codes: Array<{ code: string; type: string; benefits: any }>;
    error?: string;
  }> {
    try {
      const testCodes = [];

      for (let i = 0; i < count; i++) {
        const code = `TEST_${Date.now()}_${i}`;
        const type = i % 2 === 0 ? 'PROMO' : 'VIP';
        const benefits = type === 'VIP' 
          ? { dashboard_access: true, vip_level: 'gold', features: ['full_vip_access'] }
          : { dashboard_access: true, duration_days: 30, features: ['premium_agents'] };

        const { error } = await supabase
          .from('promo_codes')
          .insert({
            code,
            type,
            status: 'active',
            usage_limit: 10,
            benefits,
            metadata: { 
              generated_for: 'integration_testing',
              created_by: 'integration_support'
            }
          });

        if (!error) {
          testCodes.push({ code, type, benefits });
        }
      }

      return {
        success: true,
        codes: testCodes
      };

    } catch (error: any) {
      return {
        success: false,
        codes: [],
        error: error.message
      };
    }
  }
}

// Export convenience functions
export const debugUserAuth = AuthIntegrationSupport.debugUserAuth.bind(AuthIntegrationSupport);
export const performHealthCheck = AuthIntegrationSupport.performHealthCheck.bind(AuthIntegrationSupport);
export const simulateAuthFlow = AuthIntegrationSupport.simulateAuthFlow.bind(AuthIntegrationSupport);
export const resetUserAuthState = AuthIntegrationSupport.resetUserAuthState.bind(AuthIntegrationSupport);
export const generateTestPromoCodes = AuthIntegrationSupport.generateTestPromoCodes.bind(AuthIntegrationSupport); 