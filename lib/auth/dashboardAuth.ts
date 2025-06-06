import { createClient } from '@supabase/supabase-js';

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
  request: DashboardAuthRequest
): Promise<DashboardAuthResponse> {
  try {
    console.log('[DashboardAuth] Authenticating user:', request.email);

    // Step 1: Authenticate user with email/password
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: request.email,
      password: request.password,
    });

    if (authError || !authData.user) {
      console.error('[DashboardAuth] Authentication failed:', authError?.message);
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
      } else {
        console.warn('[DashboardAuth] Code redemption failed:', promoResult.error);
        // Don't fail auth if code is invalid - just log the issue
      }
    }

    // Step 4: Check VIP status
    const vipStatus = await checkVIPStatus(user.email!);

    // Step 5: Determine final access level
    const finalAccess = await getUserDashboardAccess(user.id);
    const accessLevel = finalAccess?.access_level || 'free';

    console.log('[DashboardAuth] Final access level:', accessLevel);

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