'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import AuthProviderButton from '@/components/ui/AuthProviderButton';
import { useAuth } from '@/components/context/AuthContext';
import SessionAlert from '@/components/alerts/SessionAlert';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [magicSent, setMagicSent] = useState(false);
  const [providerLoading, setProviderLoading] = useState<string | null>(null);
  const [showFullForm, setShowFullForm] = useState(false);
  const { user, session, isLoading, signUp, signInWithOAuth, signInWithOtp, error: authError } = useAuth();

  // Show auth errors from context and handle special offers
  useEffect(() => {
    if (authError) {
      setError(authError);
    }

    // ✨ NEW: Check for special offers from URL params
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const offer = urlParams.get('offer');
      const emailParam = urlParams.get('email');
      
      if (emailParam) {
        setEmail(emailParam);
      }
      
      if (offer === 'launch40') {
        toast.success('🎉 40% Launch Discount Applied! Complete signup to claim your savings.', { duration: 6000 });
      } else if (offer === 'exit_capture') {
        toast.success('🚀 Welcome back! Your free competitive analysis is waiting.', { duration: 5000 });
      }
    }
  }, [authError]);

  // Auto-redirect if user is already logged in
  useEffect(() => {
    if (user && session) {
      console.log('[SIGN-UP] User already authenticated, redirecting to dashboard');
      router.replace('/dashboard');
    }
  }, [user, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate inputs
      if (!email) {
        setError('Email is required');
        setLoading(false);
        return;
      }

      if (!password) {
        setError('Password is required');
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        setLoading(false);
        return;
      }

      // Attempt sign up
      const { success, error, needsEmailConfirmation } = await signUp(email, password);

      if (!success && error) {
        setError(error);
        setLoading(false);
        return;
      }

      // Store marketing consent if provided
      if (marketingConsent) {
        try {
          await fetch('/api/marketing-consent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, consent: true })
          });
        } catch (err) {
          console.error('[MARKETING] Failed to store consent:', err);
        }
      }

      // Check if email confirmation is required
      if (needsEmailConfirmation) {
        setSuccess('Account created! Please check your email to verify your account before signing in.');
        toast.success('Sign-up successful! Check your email to verify.');
        setLoading(false);
        
        // Redirect to sign-in after showing success message
        setTimeout(() => {
          router.push('/sign-in');
        }, 3000);
        return;
      }

      // Apply promo code if provided
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
      setSuccess('Account created! Redirecting to dashboard...');
      toast.success('Account created successfully!');
      
    } catch (err: any) {
      console.error('[AUTH] Sign-up exception:', err);
      setError(err.message || 'An unexpected error occurred');
      toast.error(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setProviderLoading('google');
    setError('');
    
    const { success, error } = await signInWithOAuth('google');
    
    if (!success && error) {
      setError(error);
      toast.error(error);
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
    
    const { success, error } = await signInWithOtp(email);
    
    if (!success && error) {
      setError(error);
      toast.error(error);
    } else {
      setMagicSent(true);
      toast.success('Magic link sent! Check your email to complete sign-up.');
    }
    
    setProviderLoading(null);
  };

  // ✨ NEW: Quick Start Handler - Email-only signup
  const handleQuickStart = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      // Generate temporary password for email-only signup
      const tempPassword = `SKRBL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { success, error, needsEmailConfirmation } = await signUp(email, tempPassword);

      if (!success && error) {
        setError(error);
        setLoading(false);
        return;
      }

      // Store marketing consent if checked
      if (marketingConsent) {
        try {
          await fetch('/api/marketing-consent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, consent: true })
          });
        } catch (err) {
          console.error('[MARKETING] Failed to store consent:', err);
        }
      }

      if (needsEmailConfirmation) {
        setSuccess('🚀 Almost there! Check your email and click the verification link to activate your 3-day trial.');
        toast.success('Verification email sent! Check your inbox to activate your trial.');
        setLoading(false);
      } else {
        // Direct success - redirect to dashboard
        toast.success('🎉 Welcome to SKRBL AI! Your trial has started.');
        router.push('/dashboard');
      }
      
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
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
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-900/20 border border-green-500 text-green-400 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{success}</span>
              </div>
            )}
            
            {/* ✨ NEW: Simplified Email-Only Quick Start */}
            {!showFullForm ? (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">🚀 Start Your 3-Day Trial</h3>
                  <p className="text-cyan-400 text-sm">
                    Get instant access to all 14 AI agents. No payment required.
                  </p>
                </div>
                
                <div>
                  <input
                    id="email-quick"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none relative block w-full px-4 py-4 border border-gray-700 placeholder-gray-500 text-white rounded-xl bg-[#0D1117] focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-electric-blue focus:z-10 text-lg"
                    placeholder="Enter your email to start"
                  />
                </div>
                
                <button
                  type="button"
                  onClick={handleQuickStart}
                  disabled={loading || !email}
                  className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-lg font-bold rounded-xl text-white bg-gradient-to-r from-electric-blue to-cyan-500 hover:from-electric-blue/90 hover:to-cyan-500/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-electric-blue transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-6 h-6 rounded-full border-2 border-white border-t-transparent animate-spin mx-auto"></div>
                  ) : (
                    <>
                      🚀 Start Free Trial (30 Seconds)
                      <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                    </>
                  )}
                </button>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowFullForm(true)}
                    className="text-sm text-gray-400 hover:text-electric-blue transition-colors"
                  >
                    Prefer to set a password? Use full signup form
                  </button>
                </div>
                
                <div className="flex items-center justify-center space-x-4 text-xs text-green-400">
                  <span>✓ No payment required</span>
                  <span>•</span>
                  <span>✓ Cancel anytime</span>
                  <span>•</span>
                  <span>✓ Full access</span>
                </div>
              </div>
            ) : (
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
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-3 border border-gray-700 placeholder-gray-500 text-white rounded-md bg-[#0D1117] focus:outline-none focus:ring-electric-blue focus:border-electric-blue focus:z-10 sm:text-sm"
                    placeholder="Password (min. 8 characters)"
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
                    className="appearance-none relative block w-full px-3 py-3 border border-gray-700 placeholder-gray-500 text-white rounded-md bg-[#0D1117] focus:outline-none focus:ring-electric-blue focus:border-electric-blue focus:z-10 sm:text-sm"
                    placeholder="Confirm password"
                  />
                </div>
                <div>
                  <label htmlFor="promoCode" className="sr-only">
                    Promo Code (Optional)
                  </label>
                  <input
                    id="promoCode"
                    name="promoCode"
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-3 border border-gray-700 placeholder-gray-500 text-white rounded-md bg-[#0D1117] focus:outline-none focus:ring-electric-blue focus:border-electric-blue focus:z-10 sm:text-sm"
                    placeholder="Promo code (optional)"
                  />
                </div>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowFullForm(false)}
                    className="text-sm text-gray-400 hover:text-electric-blue transition-colors"
                  >
                    ← Switch to quick email signup
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center">
              <input
                id="marketing-consent"
                name="marketing-consent"
                type="checkbox"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                className="h-4 w-4 text-electric-blue focus:ring-electric-blue border-gray-700 rounded bg-[#0D1117]"
              />
              <label htmlFor="marketing-consent" className="ml-2 block text-sm text-gray-400">
                I agree to receive marketing emails (optional)
              </label>
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
                  '🔒 Create Secure Account'
                )}
              </button>
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
        )}
      </motion.div>
    </div>
  );
}