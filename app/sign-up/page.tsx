'use client';

import React, { useState } from 'react';
import { getErrorMessage } from '@/utils/errorUtils';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createUser } from '@/utils/auth';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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

    setLoading(true);
    setError('');

    try {
      const userData = {
        displayName: email.split('@')[0],
        role: 'user',
        createdAt: new Date().toISOString()
      };
      const result = await createUser(email, password, userData);
      if (result.success) {
        router.push('/dashboard');
      } else {
        // Handle Supabase error object
        let message = 'Failed to create account.';
        if (result.error) {
          // Check if result.error is an object with message property
          const errorMessage = typeof result.error === 'string' 
            ? result.error 
            : getErrorMessage(result.error);
          
          if (errorMessage.includes('already registered')) {
            message = 'This email is already registered. Please log in or use a different email.';
          } else if (errorMessage.includes('invalid email')) {
            message = 'Invalid email address. Please enter a valid email.';
          } else if (errorMessage.includes('password')) {
            message = 'Password is too weak. Please choose a stronger password.';
          } else if (errorMessage.includes('not allowed')) {
            message = 'Signups are currently unavailable. Please contact support or try again later.';
          } else {
            message = errorMessage;
          }
        }
        setError(message);
      }
    } catch (err: any) {
      // Handle unexpected errors
      const errorMessage = typeof err.message === 'string' 
        ? err.message 
        : 'An unexpected error occurred.';
      
      let message = errorMessage;
      if (errorMessage.includes('not allowed')) {
        message = 'Signups are currently unavailable. Please contact support or try again later.';
      }
      setError(message);
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
                placeholder="Password"
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
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center" role="alert">{error}</div>
          )}

          <div>
            <motion.button
               type="submit"
               aria-label="Sign up"
               disabled={loading}
               whileHover={{ scale: 1.04, boxShadow: '0 0 16px #00ffe7' }}
               whileTap={{ scale: 0.97 }}
               className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-electric-blue hover:bg-electric-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-electric-blue transition-all duration-150 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
             >
               {loading ? 'Creating account...' : 'Sign up'}
             </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
} 