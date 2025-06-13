'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '@/utils/supabase';
import toast, { Toaster } from 'react-hot-toast';

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

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) router.replace('/dashboard');
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (session) router.replace('/dashboard');
    });
    return () => subscription?.unsubscribe();
  }, [router]);

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
          emailRedirectTo: `${window.location.origin}/dashboard`,
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
        let redeemToast: string | undefined;
        try {
          redeemToast = toast.loading('Applying code...');
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
            if (redeemToast) toast.success('Code redeemed!', { id: redeemToast });
          } else if (!data.success) {
            // Code redemption failed, but account created - warn user
            console.warn('[AUTH] Code redemption failed:', data.error);
            setSuccess('Account created successfully, but code redemption failed: ' + data.error);
            if (redeemToast) toast.error('Code validation failed', { id: redeemToast });
          }
        } catch (codeError) {
          console.error('[AUTH] Code processing error:', codeError);
          setSuccess('Account created successfully, but there was an issue with your code. Please contact support.');
          toast.error('Code validation failed', { id: redeemToast });
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

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (oauthError) {
        setError(oauthError.message);
        setLoading(false);
      }
    } catch (err: any) {
      console.error('[AUTH] Google auth error:', err);
      setError(err.message || 'Google authentication failed');
      setLoading(false);
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

        {/* Google Sign-Up */}
        <button
          type="button"
          onClick={handleGoogleAuth}
          className="w-full flex justify-center items-center gap-2 px-4 py-2 rounded-md bg-white text-gray-800 hover:bg-gray-100 font-medium shadow mb-6"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.6-5.6C34.8 6.5 29.7 4 24 4 12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20c0-1.3-.1-2.6-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C15 16 18.2 14 22 14c2.9 0 5.5 1.1 7.4 2.9l5.6-5.6C31.6 8.5 27.1 6 22 6 14.5 6 8 10.2 6.3 14.7z"/><path fill="#4CAF50" d="M22 44c5.2 0 9.8-2 13.2-5.3l-6-4.9C27.5 35.9 24.9 37 22 37c-5.3 0-9.7-3.4-11.3-8H4.1l-6.1 4.8C3.9 39.8 12 44 22 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 2.9-3 5-5.4 6.5l6 4.9C39 35.2 44 30 44 24c0-1.3-.1-2.6-.4-3.5z"/></svg>
          Continue with Google
        </button>

        <form className="space-y-6" onSubmit={handleSubmit}>
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

        <Toaster position="top-center" reverseOrder={false} />
      </motion.div>
    </div>
  );
} 