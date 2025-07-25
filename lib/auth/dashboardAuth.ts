import { createClient } from '@supabase/supabase-js';
import { 
  logSignInAttempt, 
  logSignInSuccess, 
  logSignInFailure,
  logPromoRedemption,
  logSecurityViolation
} from './authAuditLogger';

// Initialize Supabase client with service role for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface DashboardAuthRequest {
  email: string;
  password: string;
  promoCode?: string;
  vipCode?: string;
  marketingConsent?: boolean;
}

export interface DashboardAuthResponse {
  success: boolean;
  user?: any;
  accessLevel?: 'free' | 'promo' | 'vip';
  promoRedeemed?: boolean;
  vipStatus?: any;
  error?: string;
  benefits?: any;
  message?: string;
  rateLimited?: boolean;
}

export interface PromoCodeValidation {
  isValid: boolean;
  type: 'PROMO' | 'VIP';
  benefits: any;
  error?: string;
}

/**
 * Main dashboard authentication handler
 * Handles email/password auth + promo/VIP code validation
 */
export async function authenticateForDashboard(
  request: DashboardAuthRequest,
  metadata: { ip?: string; userAgent?: string } = {}
): Promise<DashboardAuthResponse> {
  try {
    console.log('[DashboardAuth] Authenticating user:', request.email);

    // Enhanced audit logging for sign-in attempt
    await logSignInAttempt(request.email, {
      ...metadata,
      promoCode: request.promoCode,
      vipCode: request.vipCode
    });

    // Step 1: Check rate limiting before authentication
    const rateLimitCheck = await supabase.rpc('check_rate_limit', {
      p_identifier: metadata.ip || request.email,
      p_identifier_type: metadata.ip ? 'ip' : 'email',
      p_event_type: 'signin_attempt',
      p_max_attempts: 5,
      p_window_minutes: 15,
      p_block_minutes: 60
    });

    if (rateLimitCheck.data && !rateLimitCheck.data.allowed) {
      await logSecurityViolation('rate_limit_exceeded', {
        email: request.email,
        ip: metadata.ip,
        details: rateLimitCheck.data
      });
      
      return {
        success: false,
        error: 'Too many attempts. Please try again later.',
        rateLimited: true
      };
    }

    // Step 2: Authenticate user with email/password
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: request.email,
      password: request.password,
    });

    if (authError || !authData.user) {
      console.error('[DashboardAuth] Authentication failed:', authError?.message);
      
      // Enhanced failure logging
      await logSignInFailure(
        request.email, 
        authError?.message || 'Invalid email or password',
        { 
          ...metadata,
          attempt: (rateLimitCheck.data?.attempts_in_window || 0) + 1
        }
      );
      
      return {
        success: false,
        error: authError?.message || 'Invalid email or password'
      };
    }

    const user = authData.user;
    console.log('[DashboardAuth] User authenticated successfully:', user.id);

    // Step 2: Check existing dashboard access
    const existingAccess = await getUserDashboardAccess(user.id);
    
    // Step 3: Handle promo code if provided
    let promoRedeemed = false;
    let promoCodeBenefits = null;
    
    const codeToRedeem = request.promoCode || request.vipCode;
    if (codeToRedeem) {
      console.log('[DashboardAuth] Validating code:', codeToRedeem);
      
      const promoResult = await validateAndRedeemCode(
        codeToRedeem, 
        user.id, 
        user.email!
      );
      
      if (promoResult.success) {
        promoRedeemed = true;
        promoCodeBenefits = promoResult.benefits;
        console.log('[DashboardAuth] Code redeemed successfully:', promoResult.codeType);
        
        // Log successful promo redemption
        await logPromoRedemption(
          user.id,
          user.email!,
          codeToRedeem,
          true,
          {
            codeType: promoResult.codeType,
            benefits: promoResult.benefits
          }
        );
      } else {
        console.warn('[DashboardAuth] Code redemption failed:', promoResult.error);
        
        // Log failed promo redemption
        await logPromoRedemption(
          user.id,
          user.email!,
          codeToRedeem,
          false,
          {
            errorMessage: promoResult.error
          }
        );
        // Don't fail auth if code is invalid - just log the issue
      }
    }

    // Step 4: Handle marketing consent if provided during signin
    if (request.marketingConsent !== undefined) {
      try {
        console.log('[DashboardAuth] Recording marketing consent during signin:', request.marketingConsent);
        
        const consentResult = await supabase.rpc('update_marketing_consent', {
          p_user_id: user.id,
          p_email: user.email!,
          p_consent_given: request.marketingConsent,
          p_source: 'signin',
          p_ip_address: metadata.ip || null,
          p_user_agent: metadata.userAgent || null
        });

        if (consentResult.error) {
          console.error('[DashboardAuth] Failed to record marketing consent during signin:', consentResult.error);
        } else {
          console.log('[DashboardAuth] Marketing consent recorded successfully during signin');
        }
      } catch (consentError: any) {
        console.error('[DashboardAuth] Marketing consent error during signin:', consentError);
        // Don't fail signin for consent issues - this is non-critical
      }
    }

    // Step 5: Check VIP status
    const vipStatus = await checkVIPStatus(user.email!);

    // Step 6: Determine final access level
    const finalAccess = await getUserDashboardAccess(user.id);
    const accessLevel = finalAccess?.access_level || 'free';

    console.log('[DashboardAuth] Final access level:', accessLevel);

    // Enhanced success logging
    await logSignInSuccess(
      user.id,
      user.email!,
      accessLevel,
      {
        ...metadata,
        promoRedeemed,
        vipStatus: vipStatus?.isVIP || false
      }
    );

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
        access_token: authData.session?.access_token
      },
      accessLevel: accessLevel as 'free' | 'promo' | 'vip',
      promoRedeemed,
      vipStatus,
      benefits: finalAccess?.benefits || promoCodeBenefits,
      message: promoRedeemed ? 'Promo code redeemed successfully!' : 'Authentication successful'
    };

  } catch (error: any) {
    console.error('[DashboardAuth] Unexpected error:', error);
    return {
      success: false,
      error: 'Authentication service temporarily unavailable'
    };
  }
}

/**
 * Validate and redeem a promo/VIP code
 */
export async function validateAndRedeemCode(
  code: string,
  userId: string,
  email: string
): Promise<{
  success: boolean;
  codeType?: 'PROMO' | 'VIP';
  benefits?: any;
  error?: string;
}> {
  try {
    // Use the Supabase function to validate and redeem
    const { data, error } = await supabase.rpc('redeem_promo_code', {
      p_code: code,
      p_user_id: userId,
      p_email: email
    });

    if (error) {
      console.error('[DashboardAuth] Code redemption error:', error);
      return {
        success: false,
        error: 'Failed to process promo code'
      };
    }

    if (!data.success) {
      return {
        success: false,
        error: data.error
      };
    }

    return {
      success: true,
      codeType: data.code_type,
      benefits: data.benefits
    };

  } catch (error: any) {
    console.error('[DashboardAuth] Code validation error:', error);
    return {
      success: false,
      error: 'Code validation service unavailable'
    };
  }
}

/**
 * Check if user has VIP recognition
 */
export async function checkVIPStatus(email: string): Promise<any> {
  try {
    const { data: vipData, error } = await supabase
      .from('vip_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (error) {
      console.error('[DashboardAuth] VIP status check error:', error);
      return null;
    }

    if (!vipData) {
      return { isVIP: false, vipLevel: 'standard' };
    }

    return {
      isVIP: vipData.is_vip || vipData.vip_level !== 'standard',
      vipLevel: vipData.vip_level,
      vipScore: vipData.vip_score,
      companyName: vipData.company_name,
      recognitionCount: vipData.recognition_count
    };

  } catch (error: any) {
    console.error('[DashboardAuth] VIP status error:', error);
    return null;
  }
}

/**
 * Get user's current dashboard access permissions
 */
export async function getUserDashboardAccess(userId: string): Promise<any> {
  try {
    const { data, error } = await supabase
      .from('user_dashboard_access')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('[DashboardAuth] Dashboard access check error:', error);
      return null;
    }

    return data;

  } catch (error: any) {
    console.error('[DashboardAuth] Dashboard access error:', error);
    return null;
  }
}

/**
 * Validate a promo code without redeeming it
 */
export async function validatePromoCode(code: string): Promise<PromoCodeValidation> {
  try {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code)
      .eq('status', 'active')
      .maybeSingle();

    if (error) {
      console.error('[DashboardAuth] Promo validation error:', error);
      return {
        isValid: false,
        type: 'PROMO',
        benefits: null,
        error: 'Code validation failed'
      };
    }

    if (!data) {
      return {
        isValid: false,
        type: 'PROMO',
        benefits: null,
        error: 'Invalid or expired code'
      };
    }

    // Check if code has expired
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return {
        isValid: false,
        type: data.type,
        benefits: null,
        error: 'Code has expired'
      };
    }

    // Check if code has reached usage limit
    if (data.usage_limit && data.current_usage >= data.usage_limit) {
      return {
        isValid: false,
        type: data.type,
        benefits: null,
        error: 'Code usage limit reached'
      };
    }

    return {
      isValid: true,
      type: data.type,
      benefits: data.benefits
    };

  } catch (error: any) {
    console.error('[DashboardAuth] Promo validation error:', error);
    return {
      isValid: false,
      type: 'PROMO',
      benefits: null,
      error: 'Validation service unavailable'
    };
  }
}

/**
 * Update user access level and benefits
 */
export async function updateUserDashboardAccess(
  userId: string,
  email: string,
  accessLevel: 'free' | 'promo' | 'vip',
  benefits: any = {},
  metadata: any = {}
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_dashboard_access')
      .upsert({
        user_id: userId,
        email: email.toLowerCase(),
        access_level: accessLevel,
        is_vip: accessLevel === 'vip',
        benefits,
        metadata,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('[DashboardAuth] Access update error:', error);
      return false;
    }

    return true;

  } catch (error: any) {
    console.error('[DashboardAuth] Access update error:', error);
    return false;
  }
}

/**
 * Log authentication events for analytics
 */
export async function logAuthEvent(
  userId: string,
  email: string,
  event: string,
  metadata: any = {}
): Promise<void> {
  try {
    await supabase.from('user_journey_events').insert({
      user_id: userId,
      session_id: `auth_${Date.now()}`,
      event_type: 'conversion',
      event_data: {
        auth_event: event,
        email,
        ...metadata
      },
      timestamp: new Date().toISOString(),
      user_role: 'client',
      source: 'dashboard',
      metadata: {
        userAgent: 'server',
        ip: '0.0.0.0',
        pathname: '/api/auth/dashboard-signin'
      }
    });
  } catch (error) {
    console.error('[DashboardAuth] Failed to log auth event:', error);
  }
}

/**
 * Register a new user for dashboard access with optional promo/VIP code
 */
export async function registerUserForDashboard(
  request: DashboardAuthRequest,
  metadata: { ip?: string; userAgent?: string } = {}
): Promise<DashboardAuthResponse> {
  try {
    console.log('[DashboardAuth] Registering new user:', request.email);

    // Enhanced audit logging for signup attempt
    await logSignInAttempt(request.email, {
      ...metadata,
      promoCode: request.promoCode,
      vipCode: request.vipCode,
      isSignup: true
    });

    // Step 1: Check rate limiting before registration
    const rateLimitCheck = await supabase.rpc('check_rate_limit', {
      p_identifier: metadata.ip || request.email,
      p_identifier_type: metadata.ip ? 'ip' : 'email',
      p_event_type: 'signup_attempt',
      p_max_attempts: 3,
      p_window_minutes: 15,
      p_block_minutes: 60
    });

    if (rateLimitCheck.data && !rateLimitCheck.data.allowed) {
      await logSecurityViolation('rate_limit_exceeded', {
        email: request.email,
        ip: metadata.ip,
        details: rateLimitCheck.data,
        event: 'signup'
      });
      
      return {
        success: false,
        error: 'Too many signup attempts. Please try again later.',
        rateLimited: true
      };
    }

    // Step 2: Register user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: request.email,
      password: request.password,
      options: {
        data: {
          signup_source: 'dashboard',
          marketing_consent: request.marketingConsent,
          ip_address: metadata.ip || 'unknown',
          user_agent: metadata.userAgent || 'unknown'
        }
      }
    });

    if (authError || !authData.user) {
      console.error('[DashboardAuth] Signup failed:', authError?.message);
      await logSignInFailure(
        request.email, 
        authError?.message || 'Failed to create user',
        { ...metadata, isSignup: true }
      );
      return { success: false, error: authError?.message || 'Failed to create user' };
    }

    const user = authData.user;
    console.log('[DashboardAuth] User account created successfully:', user.id);

    // Log successful sign-up to auth_events
    await supabase.from('auth_events').insert({
      user_id: user.id,
      event_type: 'sign_up',
      provider: 'email',
      details: { email: user.email }
    });

    // Step 3: Handle promo code redemption
    let promoRedeemed = false;
    let promoCodeBenefits = null;
    
    const codeToRedeem = request.promoCode || request.vipCode;
    if (codeToRedeem) {
      console.log('[DashboardAuth] Redeeming code during registration:', codeToRedeem);
      
      const promoResult = await validateAndRedeemCode(
        codeToRedeem, 
        user.id, 
        user.email!
      );
      
      if (promoResult.success) {
        promoRedeemed = true;
        promoCodeBenefits = promoResult.benefits;
        console.log('[DashboardAuth] Code redeemed during registration:', promoResult.codeType);
        
        // Log successful promo redemption during signup
        await logPromoRedemption(
          user.id,
          user.email!,
          codeToRedeem,
          true,
          {
            codeType: promoResult.codeType,
            benefits: promoResult.benefits,
            isSignup: true
          }
        );
      } else {
        console.warn('[DashboardAuth] Code redemption failed during registration:', promoResult.error);
        
        // Log failed promo redemption during signup
        await logPromoRedemption(
          user.id,
          user.email!,
          codeToRedeem,
          false,
          {
            errorMessage: promoResult.error,
            isSignup: true
          }
        );
        // Don't fail registration if code is invalid - just log the issue
      }
    }

    // Step 4: Check VIP status (may exist from pre-registration)
    const vipStatus = await checkVIPStatus(user.email!);

    // Step 5: Handle marketing consent if provided
    if (request.marketingConsent !== undefined) {
      try {
        console.log('[DashboardAuth] Recording marketing consent:', request.marketingConsent);
        
        const consentResult = await supabase.rpc('update_marketing_consent', {
          p_user_id: user.id,
          p_email: user.email!,
          p_consent_given: request.marketingConsent,
          p_source: 'signup',
          p_ip_address: metadata.ip || null,
          p_user_agent: metadata.userAgent || null
        });

        if (consentResult.error) {
          console.error('[DashboardAuth] Failed to record marketing consent:', consentResult.error);
        } else {
          console.log('[DashboardAuth] Marketing consent recorded successfully');
        }
      } catch (consentError: any) {
        console.error('[DashboardAuth] Marketing consent error:', consentError);
        // Don't fail registration for consent issues - this is non-critical
      }
    }

    // Step 6: Create initial dashboard access record
    const accessLevel = promoRedeemed 
      ? (request.vipCode ? 'vip' : 'promo')
      : (vipStatus?.isVIP ? 'vip' : 'free');

    const createAccessResult = await updateUserDashboardAccess(
      user.id,
      user.email!,
      accessLevel as 'free' | 'promo' | 'vip',
      promoCodeBenefits || {},
      {
        signup_date: new Date().toISOString(),
        signup_ip: metadata.ip,
        initial_promo_code: codeToRedeem || null,
        marketing_consent: request.marketingConsent
      }
    );

    if (!createAccessResult) {
      console.error('[DashboardAuth] Failed to create dashboard access record');
      // Don't fail registration for this - the user can still access basic features
    }

    // Step 7: Get final access permissions
    const finalAccess = await getUserDashboardAccess(user.id);

    console.log('[DashboardAuth] Registration completed with access level:', finalAccess?.access_level || 'free');

    // Enhanced success logging for signup
    await logSignInSuccess(
      user.id,
      user.email!,
      finalAccess?.access_level || 'free',
      {
        ...metadata,
        promoRedeemed,
        vipStatus: vipStatus?.isVIP || false,
        isSignup: true
      }
    );

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
        access_token: authData.session?.access_token
      },
      accessLevel: (finalAccess?.access_level || 'free') as 'free' | 'promo' | 'vip',
      promoRedeemed,
      vipStatus,
      benefits: finalAccess?.benefits || promoCodeBenefits,
      message: promoRedeemed 
        ? 'Account created and promo code redeemed successfully!' 
        : 'Account created successfully!'
    };

  } catch (error: any) {
    console.error('[DashboardAuth] Registration error:', error);
    return {
      success: false,
      error: 'Registration service temporarily unavailable'
    };
  }
} 