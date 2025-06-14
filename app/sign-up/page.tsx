'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast from 'react-hot-toast';
import { useBanner } from '@/components/context/BannerContext';
import AuthProviderButton from '@/components/ui/AuthProviderButton';
import Spinner from '@/components/ui/Spinner';

export default function SignUpPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [vipCode, setVipCode] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [providerLoading, setProviderLoading] = useState<string | null>(null);
  const { showBanner } = useBanner();

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) router.replace('/dashboard');
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (session) router.replace('/dashboard');
    });
    return () => subscription?.unsubscribe();
  }, [router, supabase]);

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
      
      // Step 1: Create account with Supabase directly
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
        showBanner('Sign-up successful! Check your email to verify.', 'success');
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
          
          const { error: codeError } = await supabase
            .from('user_codes')
            .insert({
              user_id: authData.user.id,
              code: promoCode || vipCode,
              code_type: promoCode ? 'promo' : 'vip',
              applied_at: new Date().toISOString()
            });
          
          if (codeError) {
            console.error('[AUTH] Code application error:', codeError);
            if (redeemToast) toast.error('Code validation failed', { id: redeemToast });
            setSuccess('Account created successfully, but code redemption failed.');
          } else {
            if (redeemToast) toast.success('Code applied successfully!', { id: redeemToast });
            setSuccess('Account created with promo benefits! Enhanced features unlocked.');
            showBanner('Promo/VIP benefits unlocked 🎉', 'success');
          }
        } catch (codeError) {
          console.error('[AUTH] Code processing error:', codeError);
          setSuccess('Account created successfully, but there was an issue with your code. Please contact support.');
          if (redeemToast) toast.error('Code validation failed', { id: redeemToast });
        }
      } else {
        setSuccess('Account created successfully! Redirecting to dashboard...');
        showBanner('Welcome! You\'re in 🎉', 'success');
      }

      // Save marketing consent if provided
      if (marketingConsent && authData.user) {
        try {
          await supabase
            .from('user_preferences')
            .insert({
              user_id: authData.user.id,
              marketing_consent: true,
              consent_date: new Date().toISOString()
            });
        } catch (prefError) {
          console.error('[AUTH] Failed to save marketing preferences:', prefError);
        }
      }

      // Redirect to dashboard if session exists
      if (authData.session) {
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
    if (promoCode || vipCode) {
      setPromoCode('');
      setVipCode('');
    }
  };

  const handleGoogleSignUp = async () => {
    setProviderLoading('google');
    setError('');
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo: `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        },
      });
      if (oauthError) {
        setError(oauthError.message);
        setProviderLoading(null);
      }
    } catch (err: any) {
      console.error('[AUTH] Google sign-up error:', err);
      setError(err.message || 'Google authentication failed');
      setProviderLoading(null);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setError('Enter an email to receive a magic link');
      return;
    }
    setProviderLoading('magic');
    setError('');
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (otpError) {
        setError(otpError.message);
      } else {
        toast.success('Magic link sent! Check your email to complete sign-up.');
      }
    } catch (err: any) {
      console.error('[AUTH] Magic link error:', err);
      setError(err.message || 'Failed to send magic link');
    } finally {
      setProviderLoading(null);
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
              sign in to your existing account
            </Link>
          </p>
        </div>

        {/* --- OAuth / Magic Link options --- */}
        <div className="space-y-4">
          <AuthProviderButton
            provider="google"
            loading={providerLoading === 'google'}
            onClick={handleGoogleSignUp}
          />
          <AuthProviderButton
            provider="magic"
            loading={providerLoading === 'magic'}
            onClick={handleMagicLink}
          />
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#161B22] text-gray-400">Or continue with</span>
          </div>
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
                placeholder="Password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-[#0D1117] placeholder-gray-500 text-white rounded-md focus:outline-none focus:ring-electric-blue focus:border-electric-blue focus:z-10 sm:text-sm"
                placeholder="Confirm password"
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

            {/* Marketing Consent */}
            <div className="flex items-center">
              <input
                id="marketingConsent"
                name="marketingConsent"
                type="checkbox"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                className="h-4 w-4 text-electric-blue focus:ring-electric-blue border-gray-700 rounded bg-[#0D1117]"
              />
              <label htmlFor="marketingConsent" className="ml-2 block text-sm text-gray-400">
                I agree to receive marketing emails about new features and promotions
              </label>
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

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-electric-blue hover:bg-electric-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-electric-blue"
              disabled={loading}
            >
              {loading ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              ) : null}
              Sign up
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}