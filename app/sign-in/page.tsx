'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [vipCode, setVipCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
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
      
      const response = await fetch('/api/auth/dashboard-signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      console.log('[AUTH] Sign-in response:', data);

      if (data.success) {
        setSuccess('Sign-in successful! Redirecting to dashboard...');
        
        // Show success message based on access level
        if (data.vipMode) {
          setSuccess('Welcome back, VIP! Redirecting to your premium dashboard...');
        } else if (data.promoMode) {
          setSuccess('Promo code applied! Redirecting to your enhanced dashboard...');
        } else {
          setSuccess('Welcome back! Redirecting to dashboard...');
        }

        // Log success details
        console.log('[AUTH] Sign-in successful:', {
          accessLevel: data.accessLevel,
          isVIP: data.vipStatus?.isVIP,
          promoRedeemed: data.promoRedeemed,
          benefits: data.benefits
        });

        // Redirect to dashboard after short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        // Handle specific error cases
        let errorMessage = data.error || 'Sign-in failed';
        
        if (data.rateLimited) {
          errorMessage = 'Too many sign-in attempts. Please try again later.';
        } else if (errorMessage.toLowerCase().includes('invalid login')) {
          errorMessage = 'Invalid email or password. Please check your credentials.';
        } else if (errorMessage.toLowerCase().includes('not confirmed')) {
          errorMessage = 'Please check your email and verify your account before signing in.';
        } else if (errorMessage.toLowerCase().includes('too many attempts')) {
          errorMessage = 'Account temporarily locked due to multiple failed attempts. Please try again later.';
        }

        setError(errorMessage);
        console.error('[AUTH] Sign-in failed:', data);
      }
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
      </motion.div>
    </div>
  );
} 