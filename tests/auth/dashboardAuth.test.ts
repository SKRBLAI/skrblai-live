/**
 * Dashboard Authentication Test Suite
 * Tests all combinations of auth scenarios for SKRBL AI dashboard
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { 
  authenticateForDashboard, 
  validatePromoCode, 
  checkVIPStatus,
  registerUserForDashboard 
} from '@/lib/auth/dashboardAuth';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn()
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn()
    })),
    rpc: jest.fn()
  }))
}));

describe('Dashboard Authentication System', () => {
  const testUser = {
    id: 'test-user-123',
    email: 'test@example.com',
    user_metadata: {}
  };

  const testSession = {
    access_token: 'test-access-token-123'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Authentication', () => {
    it('should authenticate valid user without promo code', async () => {
      // Mock successful auth
      const mockSupabase = require('@supabase/supabase-js').createClient();
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: testUser, session: testSession },
        error: null
      });
      
      mockSupabase.from().maybeSingle.mockResolvedValue({
        data: null,
        error: null
      });

      const result = await authenticateForDashboard({
        email: 'test@example.com',
        password: 'validpassword'
      });

      expect(result.success).toBe(true);
      expect(result.user?.id).toBe(testUser.id);
      expect(result.accessLevel).toBe('free');
      expect(result.promoRedeemed).toBe(false);
    });

    it('should fail authentication with invalid credentials', async () => {
      const mockSupabase = require('@supabase/supabase-js').createClient();
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' }
      });

      const result = await authenticateForDashboard({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid login credentials');
    });

    it('should handle missing email or password', async () => {
      const result1 = await authenticateForDashboard({
        email: '',
        password: 'password'
      });

      const result2 = await authenticateForDashboard({
        email: 'test@example.com',
        password: ''
      });

      expect(result1.success).toBe(false);
      expect(result2.success).toBe(false);
    });
  });

  describe('Promo Code Validation', () => {
    it('should validate active promo code', async () => {
      const mockSupabase = require('@supabase/supabase-js').createClient();
      mockSupabase.from().maybeSingle.mockResolvedValue({
        data: {
          code: 'WELCOME2025',
          type: 'PROMO',
          status: 'active',
          usage_limit: 100,
          current_usage: 50,
          benefits: { dashboard_access: true, duration_days: 30 },
          expires_at: null
        },
        error: null
      });

      const result = await validatePromoCode('WELCOME2025');

      expect(result.isValid).toBe(true);
      expect(result.type).toBe('PROMO');
      expect(result.benefits.dashboard_access).toBe(true);
    });

    it('should reject invalid promo code', async () => {
      const mockSupabase = require('@supabase/supabase-js').createClient();
      mockSupabase.from().maybeSingle.mockResolvedValue({
        data: null,
        error: null
      });

      const result = await validatePromoCode('INVALID_CODE');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid or expired code');
    });

    it('should reject expired promo code', async () => {
      const mockSupabase = require('@supabase/supabase-js').createClient();
      mockSupabase.from().maybeSingle.mockResolvedValue({
        data: {
          code: 'EXPIRED_CODE',
          type: 'PROMO',
          status: 'active',
          expires_at: '2023-01-01T00:00:00Z' // Past date
        },
        error: null
      });

      const result = await validatePromoCode('EXPIRED_CODE');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Code has expired');
    });

    it('should reject code at usage limit', async () => {
      const mockSupabase = require('@supabase/supabase-js').createClient();
      mockSupabase.from().maybeSingle.mockResolvedValue({
        data: {
          code: 'LIMIT_REACHED',
          type: 'PROMO',
          status: 'active',
          usage_limit: 10,
          current_usage: 10
        },
        error: null
      });

      const result = await validatePromoCode('LIMIT_REACHED');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Code usage limit reached');
    });
  });

  describe('VIP Code Validation', () => {
    it('should validate VIP code and upgrade user', async () => {
      const mockSupabase = require('@supabase/supabase-js').createClient();
      
      // Mock successful auth
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: testUser, session: testSession },
        error: null
      });

      // Mock VIP code redemption
      mockSupabase.rpc.mockResolvedValue({
        data: {
          success: true,
          code_type: 'VIP',
          benefits: { vip_level: 'gold', full_vip_access: true }
        },
        error: null
      });

      // Mock dashboard access update
      mockSupabase.from().maybeSingle
        .mockResolvedValueOnce({ data: null, error: null }) // Initial access check
        .mockResolvedValueOnce({ // Final access check
          data: {
            access_level: 'vip',
            is_vip: true,
            benefits: { vip_level: 'gold', full_vip_access: true }
          },
          error: null
        });

      const result = await authenticateForDashboard({
        email: 'test@example.com',
        password: 'validpassword',
        vipCode: 'VIP_PREVIEW'
      });

      expect(result.success).toBe(true);
      expect(result.accessLevel).toBe('vip');
      expect(result.promoRedeemed).toBe(true);
    });
  });

  describe('VIP Status Check', () => {
    it('should return VIP status for recognized user', async () => {
      const mockSupabase = require('@supabase/supabase-js').createClient();
      mockSupabase.from().maybeSingle.mockResolvedValue({
        data: {
          email: 'ceo@microsoft.com',
          is_vip: true,
          vip_level: 'enterprise',
          vip_score: 95,
          company_name: 'Microsoft Corporation',
          recognition_count: 1
        },
        error: null
      });

      const result = await checkVIPStatus('ceo@microsoft.com');

      expect(result.isVIP).toBe(true);
      expect(result.vipLevel).toBe('enterprise');
      expect(result.vipScore).toBe(95);
      expect(result.companyName).toBe('Microsoft Corporation');
    });

    it('should return standard status for non-VIP user', async () => {
      const mockSupabase = require('@supabase/supabase-js').createClient();
      mockSupabase.from().maybeSingle.mockResolvedValue({
        data: null,
        error: null
      });

      const result = await checkVIPStatus('user@example.com');

      expect(result.isVIP).toBe(false);
      expect(result.vipLevel).toBe('standard');
    });
  });

  describe('Combined Authentication Scenarios', () => {
    it('should authenticate existing VIP user with additional promo code', async () => {
      const mockSupabase = require('@supabase/supabase-js').createClient();
      
      // Mock successful auth
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: testUser, session: testSession },
        error: null
      });

      // Mock existing VIP access
      mockSupabase.from().maybeSingle
        .mockResolvedValueOnce({
          data: {
            access_level: 'vip',
            is_vip: true,
            benefits: { vip_level: 'gold' }
          },
          error: null
        })
        .mockResolvedValueOnce({ // VIP status check
          data: {
            is_vip: true,
            vip_level: 'gold',
            vip_score: 85
          },
          error: null
        });

      // Mock promo code redemption
      mockSupabase.rpc.mockResolvedValue({
        data: {
          success: true,
          code_type: 'PROMO',
          benefits: { additional_features: true }
        },
        error: null
      });

      const result = await authenticateForDashboard({
        email: 'vip@example.com',
        password: 'validpassword',
        promoCode: 'EXTRA_FEATURES'
      });

      expect(result.success).toBe(true);
      expect(result.accessLevel).toBe('vip');
      expect(result.vipStatus?.isVIP).toBe(true);
      expect(result.promoRedeemed).toBe(true);
    });

    it('should handle promo code redemption failure gracefully', async () => {
      const mockSupabase = require('@supabase/supabase-js').createClient();
      
      // Mock successful auth
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: testUser, session: testSession },
        error: null
      });

      // Mock promo code failure
      mockSupabase.rpc.mockResolvedValue({
        data: {
          success: false,
          error: 'Promo code already redeemed by this user'
        },
        error: null
      });

      // Mock dashboard access
      mockSupabase.from().maybeSingle.mockResolvedValue({
        data: { access_level: 'free', is_vip: false },
        error: null
      });

      const result = await authenticateForDashboard({
        email: 'test@example.com',
        password: 'validpassword',
        promoCode: 'ALREADY_USED'
      });

      // Should still authenticate successfully, just without promo benefits
      expect(result.success).toBe(true);
      expect(result.promoRedeemed).toBe(false);
      expect(result.accessLevel).toBe('free');
    });

    it('should handle database errors gracefully', async () => {
      const mockSupabase = require('@supabase/supabase-js').createClient();
      
      // Mock auth success but database error
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: testUser, session: testSession },
        error: null
      });

      mockSupabase.from().maybeSingle.mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed' }
      });

      const result = await authenticateForDashboard({
        email: 'test@example.com',
        password: 'validpassword'
      });

      expect(result.success).toBe(true);
      expect(result.accessLevel).toBe('free'); // Should default to free
    });
  });

  describe('Edge Cases and Security', () => {
    it('should handle malformed email addresses', async () => {
      const result = await authenticateForDashboard({
        email: 'not-an-email',
        password: 'password'
      });

      expect(result.success).toBe(false);
    });

    it('should handle SQL injection attempts in promo codes', async () => {
      const maliciousCode = "'; DROP TABLE promo_codes; --";
      
      const mockSupabase = require('@supabase/supabase-js').createClient();
      mockSupabase.from().maybeSingle.mockResolvedValue({
        data: null,
        error: null
      });

      const result = await validatePromoCode(maliciousCode);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid or expired code');
    });

    it('should handle extremely long promo codes', async () => {
      const longCode = 'A'.repeat(1000);
      
      const result = await validatePromoCode(longCode);

      expect(result.isValid).toBe(false);
    });

    it('should handle concurrent promo code redemptions', async () => {
      // This would require more complex testing with actual database
      // For now, we verify the function handles errors gracefully
      const mockSupabase = require('@supabase/supabase-js').createClient();
      mockSupabase.rpc.mockRejectedValue(new Error('Concurrent update conflict'));

      const result = await authenticateForDashboard({
        email: 'test@example.com',
        password: 'validpassword',
        promoCode: 'CONCURRENT_TEST'
      });

      // Should handle the error and not crash
      expect(result).toBeDefined();
    });
  });

  describe('User Registration', () => {
    it('should register new user without promo code', async () => {
      const mockSupabase = require('@supabase/supabase-js').createClient();
      
      // Mock successful registration
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: testUser, session: testSession },
        error: null
      });
      
      // Mock dashboard access creation
      mockSupabase.from().maybeSingle.mockResolvedValue({
        data: { access_level: 'free', is_vip: false },
        error: null
      });

      const result = await registerUserForDashboard({
        email: 'newuser@example.com',
        password: 'NewPassword123!'
      });

      expect(result.success).toBe(true);
      expect(result.user?.id).toBe(testUser.id);
      expect(result.accessLevel).toBe('free');
      expect(result.promoRedeemed).toBe(false);
      expect(result.message).toBe('Account created successfully!');
    });

    it('should register new user with valid promo code', async () => {
      const mockSupabase = require('@supabase/supabase-js').createClient();
      
      // Mock successful registration
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: testUser, session: testSession },
        error: null
      });

      // Mock promo code redemption
      mockSupabase.rpc.mockResolvedValue({
        data: {
          success: true,
          code_type: 'PROMO',
          benefits: { dashboard_access: true, duration_days: 30 }
        },
        error: null
      });

      // Mock dashboard access creation
      mockSupabase.from().maybeSingle.mockResolvedValue({
        data: { 
          access_level: 'promo', 
          is_vip: false,
          benefits: { dashboard_access: true, duration_days: 30 }
        },
        error: null
      });

      const result = await registerUserForDashboard({
        email: 'newuser@example.com',
        password: 'NewPassword123!',
        promoCode: 'WELCOME2025'
      });

      expect(result.success).toBe(true);
      expect(result.accessLevel).toBe('promo');
      expect(result.promoRedeemed).toBe(true);
      expect(result.message).toBe('Account created and promo code redeemed successfully!');
      expect(result.benefits?.dashboard_access).toBe(true);
    });

    it('should register new user with valid VIP code', async () => {
      const mockSupabase = require('@supabase/supabase-js').createClient();
      
      // Mock successful registration
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: testUser, session: testSession },
        error: null
      });

      // Mock VIP code redemption
      mockSupabase.rpc.mockResolvedValue({
        data: {
          success: true,
          code_type: 'VIP',
          benefits: { vip_level: 'gold', full_vip_access: true }
        },
        error: null
      });

      // Mock dashboard access creation
      mockSupabase.from().maybeSingle.mockResolvedValue({
        data: { 
          access_level: 'vip', 
          is_vip: true,
          benefits: { vip_level: 'gold', full_vip_access: true }
        },
        error: null
      });

      const result = await registerUserForDashboard({
        email: 'newvip@example.com',
        password: 'VipPassword123!',
        vipCode: 'VIP_PREVIEW'
      });

      expect(result.success).toBe(true);
      expect(result.accessLevel).toBe('vip');
      expect(result.promoRedeemed).toBe(true);
      expect(result.message).toBe('Account created and promo code redeemed successfully!');
      expect(result.benefits?.vip_level).toBe('gold');
    });

    it('should fail registration with invalid email', async () => {
      const result = await registerUserForDashboard({
        email: 'invalid-email',
        password: 'Password123!'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('email');
    });

    it('should fail registration with weak password', async () => {
      const result = await registerUserForDashboard({
        email: 'test@example.com',
        password: '123'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Password');
    });

    it('should handle registration failure from Supabase', async () => {
      const mockSupabase = require('@supabase/supabase-js').createClient();
      
      // Mock registration failure
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'User already registered' }
      });

      const result = await registerUserForDashboard({
        email: 'existing@example.com',
        password: 'Password123!'
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('User already registered');
    });

    it('should register user but handle invalid promo code gracefully', async () => {
      const mockSupabase = require('@supabase/supabase-js').createClient();
      
      // Mock successful registration
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: testUser, session: testSession },
        error: null
      });

      // Mock invalid promo code
      mockSupabase.rpc.mockResolvedValue({
        data: {
          success: false,
          error: 'Invalid or expired promo code'
        },
        error: null
      });

      // Mock dashboard access creation (free tier)
      mockSupabase.from().maybeSingle.mockResolvedValue({
        data: { access_level: 'free', is_vip: false },
        error: null
      });

      const result = await registerUserForDashboard({
        email: 'newuser@example.com',
        password: 'Password123!',
        promoCode: 'INVALID_CODE'
      });

      // Should succeed with registration but without promo benefits
      expect(result.success).toBe(true);
      expect(result.accessLevel).toBe('free');
      expect(result.promoRedeemed).toBe(false);
      expect(result.message).toBe('Account created successfully!');
    });

    it('should register VIP user based on email domain recognition', async () => {
      const mockSupabase = require('@supabase/supabase-js').createClient();
      
      // Mock successful registration
      mockSupabase.auth.signUp.mockResolvedValue({
        data: { user: { ...testUser, email: 'ceo@microsoft.com' }, session: testSession },
        error: null
      });

      // Mock VIP status check (pre-existing VIP recognition)
      mockSupabase.from().maybeSingle
        .mockResolvedValueOnce({ // Initial VIP check
          data: {
            is_vip: true,
            vip_level: 'enterprise',
            vip_score: 95,
            company_name: 'Microsoft'
          },
          error: null
        })
        .mockResolvedValueOnce({ // Final access level
          data: { 
            access_level: 'vip', 
            is_vip: true,
            benefits: { vip_level: 'enterprise' }
          },
          error: null
        });

      const result = await registerUserForDashboard({
        email: 'ceo@microsoft.com',
        password: 'EnterprisePassword123!'
      });

      expect(result.success).toBe(true);
      expect(result.accessLevel).toBe('vip');
      expect(result.vipStatus?.isVIP).toBe(true);
      expect(result.vipStatus?.vipLevel).toBe('enterprise');
    });

    it('should handle rate limiting during registration', async () => {
      const mockSupabase = require('@supabase/supabase-js').createClient();
      
      // Mock rate limit exceeded
      mockSupabase.rpc.mockResolvedValue({
        data: { allowed: false, blocked: true, reason: 'Too many signup attempts' },
        error: null
      });

      const result = await registerUserForDashboard({
        email: 'test@example.com',
        password: 'Password123!'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Too many signup attempts');
      expect(result.rateLimited).toBe(true);
    });
  });

  describe('VIP Recognition', () => {
  });
});

// Integration test data
export const testData = {
  validUser: {
    email: 'test@skrblai.com',
    password: 'TestPassword123!'
  },
  vipUser: {
    email: 'ceo@microsoft.com',
    password: 'VipPassword123!'
  },
  promoCodes: {
    valid: 'WELCOME2025',
    expired: 'EXPIRED2024',
    limitReached: 'MAXED_OUT',
    invalid: 'FAKE_CODE'
  },
  vipCodes: {
    valid: 'VIP_PREVIEW',
    enterprise: 'VIP_ENTERPRISE',
    invalid: 'FAKE_VIP'
  }
}; 