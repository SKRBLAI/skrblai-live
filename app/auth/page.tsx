'use client';
import React from 'react';
import { motion } from 'framer-motion';
import PercyProvider from '../../components/assistant/PercyProvider';
import PageLayout from 'components/layout/PageLayout';
import FloatingParticles from '@/components/ui/FloatingParticles';
import PercyAvatar from '@/components/home/PercyAvatar';
import Link from 'next/link';

export default function AuthPage() {
  return (
    
      <PageLayout>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <div className="relative min-h-screen bg-gradient-to-b from-[#0d1117] to-[#161b22] overflow-hidden">
            <FloatingParticles />
            <div className="max-w-md mx-auto px-4 py-16 z-10 relative">
              <div className="glass-card p-8 rounded-xl backdrop-blur-lg border border-sky-500/10">
                <div className="text-center mb-8">
                  <PercyAvatar size="lg" className="mx-auto mb-6" />
                  <motion.h1 
                    className="text-3xl font-bold text-white mb-4"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Welcome to SKRBL AI
                  </motion.h1>
                  <motion.p 
                    className="text-gray-300"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Sign in to access your AI agents and automation tools
                  </motion.p>
                </div>

                <div className="space-y-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-sky-400 to-teal-300 text-deep-navy font-semibold shadow-lg hover:shadow-teal-500/20 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M12 0C5.372 0 0 5.373 0 12s5.372 12 12 12c6.627 0 12-5.373 12-12S18.627 0 12 0zm.14 19.018c-3.868 0-7-3.14-7-7.018c0-3.878 3.132-7.018 7-7.018c1.89 0 3.47.697 4.682 1.829l-1.974 1.978c-.532-.511-1.467-1.102-2.708-1.102c-2.31 0-4.187 1.956-4.187 4.313c0 2.357 1.877 4.313 4.187 4.313c2.689 0 3.696-1.933 3.85-2.928H12.14v-2.602h6.79c.07.36.13.72.13 1.194c0 4.118-2.758 7.041-6.92 7.041z"/>
                    </svg>
                    Continue with Google
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-4 py-3 rounded-lg bg-white text-deep-navy font-semibold shadow-lg hover:bg-gray-50 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669c1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Continue with Facebook
                  </motion.button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 text-gray-400 bg-[#161b22]">Or continue with</span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold shadow-lg hover:shadow-purple-500/20 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                    Continue with Email
                  </motion.button>
                </div>

                <p className="mt-6 text-center text-sm text-gray-400">
                  By continuing, you agree to SKRBL AI's{' '}
                  <Link href="/terms" className="text-teal-400 hover:text-teal-300">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-teal-400 hover:text-teal-300">
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </PageLayout>
    
  );
} 
