import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface AuthAuditEvent {
  eventType: 'signin_attempt' | 'signin_success' | 'signin_failure' | 'promo_redemption' | 'promo_validation' | 'vip_check' | 'security_violation' | 'rate_limit' | 'suspicious_activity';
  userId?: string;
  email?: string;
  sessionId?: string;
  metadata: {
    ip?: string;
    userAgent?: string;
    endpoint?: string;
    promoCode?: string;
    vipCode?: string;
    accessLevel?: string;
    errorMessage?: string;
    securityFlags?: string[];
    timestamp?: string;
    [key: string]: any;
  };
  severity: 'info' | 'warning' | 'error' | 'critical';
  source: string;
}

/**
 * Enhanced audit logging for authentication system
 * Supports real-time monitoring and security analysis
 */
export class AuthAuditLogger {
  private static instance: AuthAuditLogger;
  private logBuffer: AuthAuditEvent[] = [];
  private flushInterval: any = null;

  private constructor() {
    // Flush logs every 5 seconds
    this.flushInterval = setInterval(() => {
      this.flushLogs();
    }, 5000);
  }

  public static getInstance(): AuthAuditLogger {
    if (!AuthAuditLogger.instance) {
      AuthAuditLogger.instance = new AuthAuditLogger();
    }
    return AuthAuditLogger.instance;
  }

  /**
   * Log authentication event with automatic batching
   */
  async logEvent(event: AuthAuditEvent): Promise<void> {
    const enrichedEvent = {
      ...event,
      metadata: {
        ...event.metadata,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      }
    };

    // Add to buffer for batching
    this.logBuffer.push(enrichedEvent);

    // For critical events, flush immediately
    if (event.severity === 'critical' || event.severity === 'error') {
      await this.flushLogs();
    }

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[AuthAudit ${event.severity.toUpperCase()}]`, {
        type: event.eventType,
        user: event.email || event.userId,
        source: event.source,
        metadata: event.metadata
      });
    }
  }

  /**
   * Flush buffered logs to database
   */
  private async flushLogs(): Promise<void> {
    if (this.logBuffer.length === 0) return;

    const logsToFlush = [...this.logBuffer];
    this.logBuffer = [];

    try {
      const { error } = await supabase.from('auth_audit_logs').insert(
        logsToFlush.map(event => ({
          event_type: event.eventType,
          user_id: event.userId || null,
          email: event.email || null,
          session_id: event.sessionId || null,
          severity: event.severity,
          source: event.source,
          metadata: event.metadata,
          created_at: new Date().toISOString()
        }))
      );

      if (error) {
        console.error('[AuthAuditLogger] Failed to flush logs:', error);
        // Re-add failed logs to buffer for retry
        this.logBuffer.unshift(...logsToFlush);
      }
    } catch (error) {
      console.error('[AuthAuditLogger] Flush error:', error);
      // Re-add failed logs to buffer for retry
      this.logBuffer.unshift(...logsToFlush);
    }
  }

  /**
   * Log sign-in attempt with security analysis
   */
  async logSignInAttempt(
    email: string, 
    metadata: { ip?: string; userAgent?: string; promoCode?: string; vipCode?: string }
  ): Promise<void> {
    const securityFlags = this.analyzeSecurityFlags(email, metadata);
    
    await this.logEvent({
      eventType: 'signin_attempt',
      email,
      metadata: {
        ...metadata,
        securityFlags,
        hasPromoCode: !!metadata.promoCode,
        hasVipCode: !!metadata.vipCode
      },
      severity: securityFlags.length > 0 ? 'warning' : 'info',
      source: 'dashboard_auth'
    });
  }

  /**
   * Log successful authentication
   */
  async logSignInSuccess(
    userId: string,
    email: string,
    accessLevel: string,
    metadata: { promoRedeemed?: boolean; vipStatus?: any; ip?: string }
  ): Promise<void> {
    await this.logEvent({
      eventType: 'signin_success',
      userId,
      email,
      metadata: {
        ...metadata,
        accessLevel,
        sessionStart: new Date().toISOString()
      },
      severity: 'info',
      source: 'dashboard_auth'
    });
  }

  /**
   * Log authentication failure with threat analysis
   */
  async logSignInFailure(
    email: string,
    errorMessage: string,
    metadata: { ip?: string; userAgent?: string; attempt?: number }
  ): Promise<void> {
    const severity = this.calculateFailureSeverity(email, metadata.attempt || 1);
    
    await this.logEvent({
      eventType: 'signin_failure',
      email,
      metadata: {
        ...metadata,
        errorMessage,
        possibleBruteForce: (metadata.attempt || 1) >= 3
      },
      severity,
      source: 'dashboard_auth'
    });
  }

  /**
   * Log promo code redemption events
   */
  async logPromoRedemption(
    userId: string,
    email: string,
    promoCode: string,
    success: boolean,
    metadata: { codeType?: string; benefits?: any; errorMessage?: string }
  ): Promise<void> {
    await this.logEvent({
      eventType: 'promo_redemption',
      userId,
      email,
      metadata: {
        ...metadata,
        promoCode,
        redemptionSuccess: success,
        redemptionTimestamp: new Date().toISOString()
      },
      severity: success ? 'info' : 'warning',
      source: 'promo_system'
    });
  }

  /**
   * Log security violations
   */
  async logSecurityViolation(
    type: string,
    metadata: { email?: string; ip?: string; details?: any }
  ): Promise<void> {
    await this.logEvent({
      eventType: 'security_violation',
      email: metadata.email,
      metadata: {
        ...metadata,
        violationType: type,
        securityAlert: true
      },
      severity: 'critical',
      source: 'security_monitor'
    });
  }

  /**
   * Analyze security flags for suspicious activity
   */
  private analyzeSecurityFlags(email: string, metadata: any): string[] {
    const flags: string[] = [];

    // Check for suspicious email patterns
    if (email.includes('+') && email.split('+').length > 2) {
      flags.push('suspicious_email_pattern');
    }

    // Check for multiple codes in single request
    if (metadata.promoCode && metadata.vipCode) {
      flags.push('multiple_codes_attempted');
    }

    // Check for rapid requests (would need additional tracking)
    // This could be enhanced with Redis or in-memory tracking

    return flags;
  }

  /**
   * Calculate failure severity based on patterns
   */
  private calculateFailureSeverity(email: string, attemptNumber: number): AuthAuditEvent['severity'] {
    if (attemptNumber >= 5) return 'critical';
    if (attemptNumber >= 3) return 'error';
    if (attemptNumber >= 2) return 'warning';
    return 'info';
  }

  /**
   * Get authentication analytics for monitoring
   */
  async getAuthAnalytics(timeRange: '1h' | '24h' | '7d' = '24h'): Promise<{
    totalSignIns: number;
    successfulSignIns: number;
    failedSignIns: number;
    promoRedemptions: number;
    securityViolations: number;
    topFailureReasons: Array<{ reason: string; count: number }>;
  }> {
    const hoursBack = timeRange === '1h' ? 1 : timeRange === '24h' ? 24 : 168;
    const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

    try {
      const { data: logs, error } = await supabase
        .from('auth_audit_logs')
        .select('event_type, severity, metadata')
        .gte('created_at', since);

      if (error) throw error;

      const analytics = {
        totalSignIns: 0,
        successfulSignIns: 0,
        failedSignIns: 0,
        promoRedemptions: 0,
        securityViolations: 0,
        topFailureReasons: [] as Array<{ reason: string; count: number }>
      };

      const failureReasons: Record<string, number> = {};

      logs?.forEach(log => {
        switch (log.event_type) {
          case 'signin_attempt': {
            analytics.totalSignIns++;
            break;
          }
          case 'signin_success': {
            analytics.successfulSignIns++;
            break;
          }
          case 'signin_failure': {
            analytics.failedSignIns++;
            const reason = log.metadata?.errorMessage || 'Unknown error';
            failureReasons[reason] = (failureReasons[reason] || 0) + 1;
            break;
          }
          case 'promo_redemption': {
            analytics.promoRedemptions++;
            break;
          }
          case 'security_violation': {
            analytics.securityViolations++;
            break;
          }
        }
      });

      analytics.topFailureReasons = Object.entries(failureReasons)
        .map(([reason, count]) => ({ reason, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return analytics;
    } catch (error) {
      console.error('[AuthAuditLogger] Analytics error:', error);
      throw error;
    }
  }

  /**
   * Cleanup method for graceful shutdown
   */
  async cleanup(): Promise<void> {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    await this.flushLogs();
  }
}

// Export singleton instance
export const authAuditLogger = AuthAuditLogger.getInstance();

// Export helper functions for common logging patterns
export const logAuthEvent = authAuditLogger.logEvent.bind(authAuditLogger);
export const logSignInAttempt = authAuditLogger.logSignInAttempt.bind(authAuditLogger);
export const logSignInSuccess = authAuditLogger.logSignInSuccess.bind(authAuditLogger);
export const logSignInFailure = authAuditLogger.logSignInFailure.bind(authAuditLogger);
export const logPromoRedemption = authAuditLogger.logPromoRedemption.bind(authAuditLogger);
export const logSecurityViolation = authAuditLogger.logSecurityViolation.bind(authAuditLogger); 