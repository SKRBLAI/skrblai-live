'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '@/components/context/AuthContext';
import AuthProviderButton from '@/components/ui/AuthProviderButton';
import SessionAlert from '@/components/alerts/SessionAlert';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [providerLoading, setProviderLoading] = useState<string | null>(null);
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
      
      // Handle promo code if provided
      if (promoCode) {
        try {
          // Apply code via API
          const response = await fetch('/api/auth/apply-code', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              code: promoCode,
              codeType: 'promo'
            })
          });
          
          const data = await response.json();
          
          if (!data.success) {
            console.error('[AUTH] Code application error:', data.error);
            toast.error(`Failed to apply promo code: ${data.error}`);
          } else {
            toast.success(`Promo code applied successfully!`);
          }
        } catch (codeErr) {
          console.error('[AUTH] Code application exception:', codeErr);
          toast.error('Failed to apply code');
        }
      }

      // Redirect to dashboard on success (will happen automatically via effect)
      toast.success('Sign-in successful!');
      
    } catch (err: any) {
      console.error('[AUTH] Sign-in exception:', err);
      setError(err.message || 'An unexpected error occurred');
      toast.error(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

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
        className="max-w-md w-full space-y-8 bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#0d1117] p-8 rounded-xl shadow-glow border border-electric-blue/30 backdrop-blur-xl"
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

        {/* Show success message for magic link */}
        {magicSent ? (
          <div className="text-center py-4">
            <p className="text-green-500 mb-4">Magic link sent! Check your email inbox.</p>
            <p className="text-gray-400 text-sm">
              Didn&apos;t receive an email?{' '}
              <button
                type="button"
                onClick={handleMagicLink}
                className="text-electric-blue hover:text-electric-blue/80"
                disabled={providerLoading === 'magic'}
              >
                Send again
              </button>
            </p>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSignIn}>
            {error && (
              <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            
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
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-700 placeholder-gray-500 text-white rounded-md bg-[#0D1117] focus:outline-none focus:ring-electric-blue focus:border-electric-blue focus:z-10 sm:text-sm"
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
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-700 placeholder-gray-500 text-white rounded-md bg-[#0D1117] focus:outline-none focus:ring-electric-blue focus:border-electric-blue focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
              <div>
                <label htmlFor="promo" className="sr-only">
                  Promo Code (Optional)
                </label>
                <input
                  id="promo"
                  name="promo"
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-700 placeholder-gray-500 text-white rounded-md bg-[#0D1117] focus:outline-none focus:ring-electric-blue focus:border-electric-blue focus:z-10 sm:text-sm"
                  placeholder="Promo Code (Optional)"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-electric-blue focus:ring-electric-blue border-gray-700 rounded bg-[#0D1117]"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link href="/forgot-password" className="font-medium text-electric-blue hover:text-electric-blue/80">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-electric-blue hover:bg-electric-blue/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-electric-blue"
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin mx-auto"></div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
} 