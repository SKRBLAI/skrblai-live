'use client';

import React, { useState, useEffect } from 'react';
import { motion, useTransform, useScroll } from 'framer-motion';
import { useAuth } from '@/components/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import FloatingParticles from '@/components/ui/FloatingParticles';
import PercyOnboardingRevolution from '@/components/home/PercyOnboardingRevolution';
import AgentsGrid from '@/components/agents/AgentsGrid';
import InteractiveFloatingElements from '@/components/ui/InteractiveFloatingElements';
import EmpowermentBanner from '@/components/ui/EmpowermentBanner';
import AnimatedBackground from './AnimatedBackground';
import PercyHelpBubble from '@/components/ui/PercyHelpBubble';
import toast from 'react-hot-toast';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, session, isLoading, isEmailVerified, shouldShowOnboarding } = useAuth();
  
  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [0, 300], [1, 0.8]);

  // Safe mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle redirects from middleware
  useEffect(() => {
    if (mounted && searchParams) {
      const reason = searchParams.get('reason');
      if (reason === 'email-not-verified') {
        toast.error('Please verify your email to access the dashboard');
      }
    }
  }, [mounted, searchParams]);

  // Redirect verified users to dashboard if they try to access homepage
  useEffect(() => {
    if (!isLoading && user && session && isEmailVerified) {
      console.log('[HOMEPAGE] Verified user accessing homepage - redirecting to dashboard');
      router.replace('/dashboard');
    }
  }, [user, session, isLoading, isEmailVerified, router]);

  if (!mounted) {
    return null;
  }

  // Show loading state while auth is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen relative text-white bg-[#0d1117] overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-blue mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative text-white bg-[#0d1117] overflow-hidden">
      {/* Floating Percy Help Bubble - TEMPORARILY DISABLED FOR DEBUGGING */}
      {/* <PercyHelpBubble /> */}
      {/* Background Effects - Mobile Optimized */}
      <div className="absolute inset-0 z-0 opacity-30 sm:opacity-40">
        <FloatingParticles particleCount={24} />
      </div>
      
      {/* Interactive Empowerment Elements - TEMPORARILY DISABLED FOR DEBUGGING */}
      {/* <InteractiveFloatingElements 
        count={6} 
        mouseFollow={true} 
        className="hidden sm:block pointer-events-auto"
      /> */}
      
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(0,102,255,0.15),transparent)]" />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0d1117] via-[#0d1117]/90 to-[#0d1117]/80" />
      
      <main className="relative z-10 min-h-screen pt-20 sm:pt-24 md:pt-28">
        
        {/* Main Content - Unified Responsive Container */}
        <motion.div 
          style={{ scale }}
          className="relative z-10 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto"
        >
          {/* Hero Section - Mobile Optimized */}
          <section className="min-h-[85vh] flex flex-col items-center">
            <div className="flex flex-col items-center justify-center w-full">
              {/* Welcome headline - Mobile Safe */}
              <motion.h1 
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl max-w-5xl mx-auto mb-4 sm:mb-6 tracking-tight font-extrabold bg-gradient-to-r from-electric-blue via-teal-400 to-fuchsia-500 bg-clip-text text-transparent leading-tight px-2"
              >
                Your Competition Just Became{' '}
                <span className="block sm:inline bg-gradient-to-r from-electric-blue via-teal-400 to-fuchsia-500 bg-clip-text text-transparent">
                  Extinct
                </span>
              </motion.h1>

              {/* Subheading - Mobile Typography */}
              <motion.p 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center text-sm sm:text-base lg:text-xl text-gray-300 max-w-2xl lg:max-w-4xl mx-auto mb-6 sm:mb-8 px-2 leading-relaxed"
              >
                SKRBL AI doesn't just automate—it <span className="text-electric-blue font-bold">DOMINATES</span>. 
                While your competitors are still figuring out AI, you'll be deploying the arsenal that makes them extinct.
                <br className="hidden sm:block" />
                <span className="text-teal-400 font-semibold">
                  No contracts. No limits. Just pure automation domination.
                </span>
              </motion.p>

              {/* Percy Onboarding Section - Only show for unverified users */}
              {shouldShowOnboarding ? (
                <PercyOnboardingRevolution />
              ) : (
                // Show alternative content for verified users or when onboarding is complete
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">Welcome back to SKRBL AI</p>
                  <button 
                    onClick={() => router.push('/dashboard')}
                    className="bg-electric-blue hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Go to Dashboard
                  </button>
                </div>
              )}
            </div>

            {/* Social Proof Section removed – stats now live inside unified Percy component */}
          </section>

          {/* Agent League – Dynamic Rendering */}
          <AgentsGrid />
        </motion.div>
      </main>
      
      {/* Empowerment Banner */}
      <EmpowermentBanner />

      {/* Animated Background */}
      <AnimatedBackground />
    </div>
  );
}
