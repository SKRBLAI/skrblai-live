'use client';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getBrowserSupabase } from '@/lib/supabase';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';

type AuthMode = 'password' | 'magic-link';

export default function SignInPage() {
  const [authMode, setAuthMode] = useState<AuthMode>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [ready, setReady] = useState(false);
  const [supabase, setSupabase] = useState<any>(null);
  const [showGoogleButton, setShowGoogleButton] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  const reason = searchParams.get('reason');

  useEffect(() => {
    // Initialize Supabase client only on client after mount
    // Progressive enhancement: always render UI, show status inline if unavailable
    try {
      const client = getBrowserSupabase();
      setSupabase(client);
      setReady(true);
      
      // Check if Google OAuth is configured (don't block on failure)
      const hasGoogleClient = !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      setShowGoogleButton(hasGoogleClient);
    } catch (error) {
      console.error('Failed to initialize Supabase:', error);
      // Still set ready=true so UI renders with inline status
      setReady(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!supabase) {
        setError('Authentication service is not available. Please check your configuration.');
        return;
      }

      if (authMode === 'magic-link') {
        // Magic link sign-in - use NEXT_PUBLIC_SITE_URL if available
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
        const redirectTo = `${siteUrl}/auth/callback${from ? `?from=${encodeURIComponent(from)}` : ''}`;
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: redirectTo,
          },
        });

        if (error) {
          setError(error.message);
          return;
        }

        setSuccess('Magic link sent! Check your email to complete sign-in.');
      } else {
        // Password sign-in
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setError(error.message);
          return;
        }

        // Redirect to auth/redirect to handle role-based routing
        const redirectUrl = '/auth/redirect' + (from ? `?from=${encodeURIComponent(from)}` : '');
        window.location.href = redirectUrl;
      }
      
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!supabase) {
      setError('Authentication service is not available.');
      return;
    }

    try {
      // Use NEXT_PUBLIC_SITE_URL if available, otherwise window.location.origin
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const redirectTo = `${siteUrl}/auth/callback${from ? `?from=${encodeURIComponent(from)}` : ''}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      });

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('Failed to initiate Google sign-in.');
    }
  };

  // Progressive enhancement: always render, show inline status if unavailable
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-700/50">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-300">
              Sign in to your account to continue
            </p>
            {reason === 'session-expired' && (
              <div className="mt-4 p-3 bg-orange-500/20 border border-orange-500/30 rounded-lg">
                <p className="text-orange-300 text-sm">Your session has expired. Please sign in again.</p>
              </div>
            )}
            {!supabase && ready && (
              <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-300 text-sm">⚠️ Auth service unavailable. Check configuration.</p>
              </div>
            )}
          </div>

          {/* Auth Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setAuthMode('password')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                authMode === 'password'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                  : 'bg-slate-700/30 text-gray-400 border border-slate-600/50 hover:bg-slate-700/50'
              }`}
            >
              <Lock className="w-4 h-4 inline mr-2" />
              Password
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('magic-link')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                authMode === 'magic-link'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                  : 'bg-slate-700/30 text-gray-400 border border-slate-600/50 hover:bg-slate-700/50'
              }`}
            >
              <Sparkles className="w-4 h-4 inline mr-2" />
              Magic Link
            </button>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
              <p className="text-green-300 text-sm">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field (only for password mode) */}
            {authMode === 'password' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-12 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Magic Link Hint */}
            {authMode === 'magic-link' && (
              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <p className="text-purple-300 text-sm">
                  ✨ We'll send a magic link to your email. Click it to sign in instantly!
                </p>
              </div>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading || !supabase}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:from-gray-600 disabled:to-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {authMode === 'magic-link' ? 'Send Magic Link' : 'Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Google OAuth (conditional) */}
          {showGoogleButton && supabase && (
            <>
              <div className="my-6 flex items-center gap-4">
                <div className="flex-1 h-px bg-slate-600"></div>
                <span className="text-gray-400 text-sm">or</span>
                <div className="flex-1 h-px bg-slate-600"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </>
          )}

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link 
                href={`/sign-up${from ? `?from=${encodeURIComponent(from)}` : ''}`}
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
              >
                Sign up here
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link 
              href="/"
              className="text-gray-500 hover:text-gray-400 text-sm transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}