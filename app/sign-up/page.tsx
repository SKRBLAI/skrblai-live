'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '@/utils/supabase';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [vipCode, setVipCode] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('[AUTH] Attempting sign-up for:', email);
      
      // Step 1: Create account with Supabase directly first
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            displayName: email.split('@')[0]
          }
        }
      });

      if (authError) {
        console.error('[AUTH] Supabase sign-up failed:', authError.message);
        
        // Handle specific Supabase error cases
        let errorMessage = authError.message;
        if (errorMessage.includes('already registered') || errorMessage.includes('already exists')) {
          errorMessage = 'This email is already registered. Please sign in or use a different email.';
        } else if (errorMessage.includes('invalid email')) {
          errorMessage = 'Invalid email address. Please enter a valid email.';
        } else if (errorMessage.includes('password')) {
          errorMessage = 'Password is too weak. Please choose a stronger password with at least 6 characters.';
        } else if (errorMessage.includes('not allowed') || errorMessage.includes('signup')) {
          errorMessage = 'Account creation is currently unavailable. Please contact support or try again later.';
        }
        
        setError(errorMessage);
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError('Account creation failed. Please try again.');
        setLoading(false);
        return;
      }

      console.log('[AUTH] Supabase sign-up successful:', authData.user.id);

      // Check if email confirmation is required
      if (!authData.session && authData.user && !authData.user.email_confirmed_at) {
        setSuccess('Account created! Please check your email to verify your account before signing in.');
        setLoading(false);
        
        // Redirect to sign-in after showing success message
        setTimeout(() => {
          router.push('/sign-in');
        }, 3000);
        return;
      }

      // Step 2: If we have promo/VIP codes and the user is confirmed, redeem them via our API
      if ((promoCode || vipCode) && authData.session) {
        try {
          console.log('[AUTH] Processing promo/VIP code for new user...');
          const response = await fetch('/api/auth/dashboard-signin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authData.session.access_token}`
            },
            body: JSON.stringify({
              email,
              password,
              confirm: confirmPassword,
              mode: 'signup',
              promoCode: promoCode || undefined,
              vipCode: vipCode || undefined,
              marketingConsent
            }),
          });

          const data = await response.json();
          console.log('[AUTH] Promo/VIP code processing result:', data);

          if (data.success && (data.promoRedeemed || data.vipStatus?.isVIP)) {
            // Show enhanced success message for codes
            if (data.vipStatus?.isVIP) {
              setSuccess('VIP account created! Welcome to premium access.');
            } else if (data.promoRedeemed) {
              setSuccess('Account created with promo benefits! Enhanced features unlocked.');
            }
          } else if (!data.success) {
            // Code redemption failed, but account created - warn user
            console.warn('[AUTH] Code redemption failed:', data.error);
            setSuccess('Account created successfully, but code redemption failed: ' + data.error);
          }
        } catch (codeError) {
          console.error('[AUTH] Code processing error:', codeError);
          setSuccess('Account created successfully, but there was an issue with your code. Please contact support.');
        }
      } else {
        setSuccess('Account created successfully! Redirecting to dashboard...');
      }

      // Step 3: Log session details for debugging
      if (authData.session) {
        console.log('[AUTH] Session established:', {
          userId: authData.user.id,
          email: authData.user.email,
          accessToken: authData.session.access_token ? 'Present' : 'Missing',
          expiresAt: authData.session.expires_at
        });

        // Step 4: Wait a moment for session to be fully established, then redirect
        setTimeout(() => {
          console.log('[AUTH] Redirecting to dashboard...');
          router.push('/dashboard');
        }, 1000);
      }

    } catch (err: any) {
      console.error('[AUTH] Sign-up error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCodeField = () => {
    if (promoCode) {
      setPromoCode('');
    } else if (vipCode) {
      setVipCode('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0D1117] py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-[#161B22] p-8 rounded-lg shadow-xl"
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Or{' '}
            <Link
              href="/sign-in"
              className="font-medium text-electric-blue hover:text-electric-blue/80"
            >
              sign in to your account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-[#0D1117] placeholder-gray-500 text-white rounded-md focus:outline-none focus:ring-electric-blue focus:border-electric-blue focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-[#0D1117] placeholder-gray-500 text-white rounded-md focus:outline-none focus:ring-electric-blue focus:border-electric-blue focus:z-10 sm:text-sm"
                placeholder="Password (min 6 characters)"
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-[#0D1117] placeholder-gray-500 text-white rounded-md focus:outline-none focus:ring-electric-blue focus:border-electric-blue focus:z-10 sm:text-sm"
                placeholder="Confirm Password"
              />
            </div>

            {/* Promo/VIP Code Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-gray-400">
                  Have a promo or VIP code?
                </label>
                <button
                  type="button"
                  onClick={toggleCodeField}
                  className="text-xs text-electric-blue hover:text-electric-blue/80"
                >
                  {promoCode || vipCode ? 'Remove' : 'Add Code'}
                </button>
              </div>
              
              {(promoCode !== '' || vipCode !== '' || (!promoCode && !vipCode)) && (
                <div className="space-y-2">
                  <input
                    id="promoCode"
                    name="promoCode"
                    type="text"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value);
                      if (e.target.value && vipCode) setVipCode('');
                    }}
                    disabled={!!vipCode}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-[#0D1117] placeholder-gray-500 text-white rounded-md focus:outline-none focus:ring-sky-400 focus:border-sky-400 sm:text-sm disabled:opacity-50"
                    placeholder="Promo code (optional)"
                  />
                  <input
                    id="vipCode"
                    name="vipCode"
                    type="text"
                    value={vipCode}
                    onChange={(e) => {
                      setVipCode(e.target.value);
                      if (e.target.value && promoCode) setPromoCode('');
                    }}
                    disabled={!!promoCode}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-[#0D1117] placeholder-gray-500 text-white rounded-md focus:outline-none focus:ring-fuchsia-400 focus:border-fuchsia-400 sm:text-sm disabled:opacity-50"
                    placeholder="VIP code (optional)"
                  />
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-md p-3" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="text-green-500 text-sm text-center bg-green-500/10 border border-green-500/20 rounded-md p-3">
              {success}
            </div>
          )}

          {/* Marketing Consent Checkbox */}
          <div className="flex items-start space-x-3">
            <div className="flex items-center h-5">
              <input
                id="marketing-consent"
                name="marketing-consent"
                type="checkbox"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                className="w-4 h-4 text-electric-blue bg-[#0D1117] border-gray-600 rounded focus:ring-electric-blue focus:ring-2"
              />
            </div>
            <div className="text-sm">
              <label htmlFor="marketing-consent" className="text-gray-300">
                I agree to receive marketing communications, product updates, and promotional offers from SKRBL AI. You can unsubscribe at any time.
              </label>
            </div>
          </div>

          <div>
            <motion.button
               type="submit"
               aria-label="Create account"
               disabled={loading}
               whileHover={{ scale: loading ? 1 : 1.04, boxShadow: loading ? '0 0 0' : '0 0 16px #00ffe7' }}
               whileTap={{ scale: loading ? 1 : 0.97 }}
               className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-electric-blue hover:bg-electric-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-electric-blue transition-all duration-150 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
             >
               {loading ? 'Creating account...' : 'Create account'}
             </motion.button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-electric-blue hover:text-electric-blue/80">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-electric-blue hover:text-electric-blue/80">
                Privacy Policy
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
} 