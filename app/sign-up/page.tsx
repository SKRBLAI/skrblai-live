'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function SignUpPage() {
  const router = useRouter();

  // Redirect all sign-up requests to homepage for Percy onboarding
  useEffect(() => {
    console.log('[SIGN-UP] Redirecting to Percy onboarding on homepage');
    router.replace('/');
  }, [router]);

  // Show loading message while redirecting
  return (
    <div className="min-h-screen bg-deep-navy flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-electric-blue mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Welcome to SKRBL AI! 
        </h2>
        <p className="text-gray-400">
          Redirecting you to Percy for personalized onboarding...
        </p>
      </motion.div>
    </div>
  );
}