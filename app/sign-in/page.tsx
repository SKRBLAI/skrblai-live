'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/utils/supabase';
import toast, { Toaster } from 'react-hot-toast';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [vipCode, setVipCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [magicSent, setMagicSent] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('[AUTH] Attempting sign-in for:', email);
      
      // Step 1: Authenticate with Supabase directly first
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError || !authData.user || !authData.session) {
        console.error('[AUTH] Supabase authentication failed:', authError?.message);
        setError(authError?.message || 'Invalid email or password');
        setLoading(false);
        return;
      }

      console.log('[AUTH] Supabase authentication successful:', authData.user.id);

      // Step 2: If we have promo/VIP codes, redeem them via our API
      if (promoCode || vipCode) {
        try {
          console.log('[AUTH] Processing promo/VIP code...');
          const response = await fetch('/api/auth/dashboard-signin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authData.session.access_token}`
            },
            body: JSON.stringify({
              email,
              password,
              mode: 'signin',
              promoCode: promoCode || undefined,
              vipCode: vipCode || undefined
            }),
          });

          const data = await response.json();
          console.log('[AUTH] Promo/VIP code processing result:', data);

          if (data.success && (data.promoRedeemed || data.vipStatus?.isVIP)) {
            // Show enhanced success message for codes
            if (data.vipStatus?.isVIP) {
              setSuccess('Welcome back, VIP! Your premium access is active.');
            } else if (data.promoRedeemed) {
              setSuccess('Promo code applied successfully! Enhanced features unlocked.');
            }
          } else if (!data.success) {
            // Code redemption failed, but auth succeeded - warn user
            console.warn('[AUTH] Code redemption failed:', data.error);
            setSuccess('Sign-in successful, but code redemption failed: ' + data.error);
          }
        } catch (codeError) {
          console.error('[AUTH] Code processing error:', codeError);
          setSuccess('Sign-in successful, but there was an issue with your code. Please contact support.');
        }
      } else {
        setSuccess('Sign-in successful! Redirecting to dashboard...');
      }

      // Step 3: Log session details for debugging
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

    } catch (err: any) {
      console.error('[AUTH] Sign-in error:', err);
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

  // Google OAuth sign-in
  const handleGoogleSignIn = async () => {
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
      // Supabase will redirect, so we don't manually push
    } catch (err: any) {
      console.error('[AUTH] Google sign-in error:', err);
      setError(err.message || 'Google sign-in failed');
      setLoading(false);
    }
  };

  // Magic-link sign-in (password-less)
  const handleMagicLink = async () => {
    if (!email) {
      setError('Enter an email to receive a magic link');
      return;
    }
    setLoading(true);
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
        setMagicSent(true);
        toast.success('Magic link sent! Check your email to complete sign-in.');
      }
    } catch (err: any) {
      console.error('[AUTH] Magic link error:', err);
      setError(err.message || 'Failed to send magic link');
    } finally {
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
            Welcome back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Or{' '}
            <Link
              href="/sign-up"
              className="font-medium text-electric-blue hover:text-electric-blue/80"
            >
              create a new account
            </Link>
          </p>
        </div>

        {/* --- OAuth / Magic Link options --- */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex justify-center items-center gap-2 px-4 py-2 rounded-md bg-white text-gray-800 hover:bg-gray-100 font-medium shadow"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.6-5.6C34.8 6.5 29.7 4 24 4 12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20c0-1.3-.1-2.6-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C15 16 18.2 14 22 14c2.9 0 5.5 1.1 7.4 2.9l5.6-5.6C31.6 8.5 27.1 6 22 6 14.5 6 8 10.2 6.3 14.7z"/><path fill="#4CAF50" d="M22 44c5.2 0 9.8-2 13.2-5.3l-6-4.9C27.5 35.9 24.9 37 22 37c-5.3 0-9.7-3.4-11.3-8H4.1l-6.1 4.8C3.9 39.8 12 44 22 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 2.9-3 5-5.4 6.5l6 4.9C39 35.2 44 30 44 24c0-1.3-.1-2.6-.4-3.5z"/></svg>
            Continue with Google
          </button>
          <button
            type="button"
            onClick={handleMagicLink}
            className="w-full flex justify-center items-center px-4 py-2 rounded-md bg-electric-blue text-white hover:bg-electric-blue/90 font-medium shadow"
          >
            {magicSent ? 'Resend Magic Link' : 'Send Magic Link'}
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
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
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-[#0D1117] placeholder-gray-500 text-white rounded-md focus:outline-none focus:ring-electric-blue focus:border-electric-blue focus:z-10 sm:text-sm"
                placeholder="Password"
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

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium text-electric-blue hover:text-electric-blue/80">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <motion.button
              type="submit"
              aria-label="Sign in"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.04, boxShadow: loading ? '0 0 0' : '0 0 16px #00ffe7' }}
              whileTap={{ scale: loading ? 1 : 0.97 }}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-electric-blue hover:bg-electric-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-electric-blue transition-all duration-150 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </motion.button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our{' '}
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