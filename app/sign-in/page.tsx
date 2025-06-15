'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { useBanner } from '@/components/context/BannerContext';
import AuthProviderButton from '@/components/ui/AuthProviderButton';
import { useAuth } from '@/components/context/AuthContext';
import SessionAlert from '@/components/alerts/SessionAlert';
import { addAuthDebugButton, attemptAuthFix } from '@/lib/auth/authDebugger';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [vipCode, setVipCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [magicSent, setMagicSent] = useState(false);
  const [providerLoading, setProviderLoading] = useState<string | null>(null);
  const { showBanner } = useBanner();
  const { user, session, isLoading, signIn, signInWithOAuth, signInWithOtp, error: authError } = useAuth();
  const [error, setError] = useState('');

  // Show auth errors from context
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  // Check for session expired param
  useEffect(() => {
    const reason = searchParams?.get('reason');
    if (reason === 'session-expired') {
      toast.error('Your session has expired. Please sign in again.');
    }
  }, [searchParams]);

  // Auto-redirect if user is already logged in
  useEffect(() => {
    if (user && session) {
      console.log('[SIGN-IN] User already authenticated, redirecting to dashboard');
      router.replace('/dashboard');
    }
  }, [user, session, router]);

  // Attempt to fix auth issues if coming from a session expired redirect
  useEffect(() => {
    const reason = searchParams?.get('reason');
    if (reason === 'session-expired') {
      toast.error('Your session has expired. Please sign in again.');
      
      // Try to fix auth issues
      attemptAuthFix().then(result => {
        if (result.success && result.fixed) {
          toast.success('Session restored! Redirecting...');
          router.push('/dashboard');
        }
      });
    }
  }, [searchParams, router]);

  // Google OAuth sign-in
  const handleGoogleSignIn = async () => {
    setProviderLoading('google');
    setError('');
    
    const { success, error } = await signInWithOAuth('google');
    
    if (!success && error) {
      setError(error);
      toast.error(error);
      setProviderLoading(null);
    }
    // Supabase will redirect, so we don't manually push
  };

  // Magic-link sign-in (password-less)
  const handleMagicLink = async () => {
    if (!email) {
      setError('Enter an email to receive a magic link');
      return;
    }
    setProviderLoading('magic');
    setError('');
    
    const { success, error } = await signInWithOtp(email);
    
    if (!success && error) {
      setError(error);
      toast.error(error);
    } else {
      setMagicSent(true);
      toast.success('Magic link sent! Check your email to complete sign-in.');
    }
    
    setProviderLoading(null);
  };

  // Email/password sign-in
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Validate inputs
      if (!email || !password) {
        setError('Email and password are required');
        setLoading(false);
        return;
      }

      // Attempt sign in
      const { success, error } = await signIn(email, password);

      if (!success && error) {
        setError(error);
        setLoading(false);
        return;
      }
      
      // Handle promo or VIP code if provided
      if (promoCode || vipCode) {
        try {
          const codeType = promoCode ? 'promo' : 'vip';
          const codeValue = promoCode || vipCode;
          
          // Apply code via API
          const response = await fetch('/api/auth/apply-code', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code: codeValue,
              codeType
            })
          });
          
          const data = await response.json();
          
          if (!data.success) {
            console.error('[AUTH] Code application error:', data.error);
            // Don't block sign-in for code errors, just notify
            toast.error(`Failed to apply ${codeType} code: ${data.error}`);
          } else {
            toast.success(`${codeType.toUpperCase()} code applied successfully!`);
          }
        } catch (codeErr) {
          console.error('[AUTH] Code application exception:', codeErr);
          toast.error('Failed to apply code');
        }
      }

      // Redirect to dashboard on success
      setSuccess('Sign-in successful! Redirecting...');
      toast.success('Sign-in successful!');
      
      // Force a small delay to ensure the auth state is updated
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
      
    } catch (err: any) {
      console.error('[AUTH] Sign-in exception:', err);
      setError(err.message || 'An unexpected error occurred');
      toast.error(err.message || 'An unexpected error occurred');
      setLoading(false);
    }
  };

  // Toggle promo/VIP code field visibility
  const toggleCodeField = () => {
    if (promoCode || vipCode) {
      setPromoCode('');
      setVipCode('');
    }
  };

  // Add debug button in development mode
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      addAuthDebugButton();
    }
  }, []);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D1117]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-electric-blue border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0D1117] py-12 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-center" />
      <div className="w-full max-w-md mb-4">
        <SessionAlert />
      </div>
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
          <AuthProviderButton
            provider="google"
            loading={providerLoading === 'google'}
            onClick={handleGoogleSignIn}
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
                <button
                  type="button"
                  onClick={toggleCodeField}
                  className="text-sm text-electric-blue hover:text-electric-blue/80 focus:outline-none"
                >
                  {promoCode || vipCode ? 'Remove code' : 'Have a promo or VIP code?'}
                </button>
              </div>
              
              {(promoCode || vipCode || (!promoCode && !vipCode)) && (
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
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-[#0D1117] placeholder-gray-500 text-white rounded-md focus:outline-none focus:ring-electric-blue focus:border-electric-blue sm:text-sm disabled:opacity-50"
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
              Sign in
            </button>
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
      </motion.div>
    </div>
  );
} 