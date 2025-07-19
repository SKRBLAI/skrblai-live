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
import TypewriterText from '@/components/shared/TypewriterText';
import CosmicStarfield from '@/components/background/CosmicStarfield';
import Pseudo3DCard, { Pseudo3DHero, Pseudo3DFeature } from '@/components/shared/Pseudo3DCard';
import toast from 'react-hot-toast';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, session, isLoading, isEmailVerified, shouldShowOnboarding } = useAuth();
  
  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [0, 300], [1, 0.8]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const intent = searchParams?.get('intent');
    if (intent === 'launch_website') {
      toast.success('Ready to launch your website! Scroll down to explore the agents.');
    }
  }, [searchParams]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1117] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative text-white bg-[#0d1117] overflow-hidden">
      {/* Enhanced Cosmic Starfield Background */}
      <CosmicStarfield 
        starCount={120}
        parallax={true}
        speed={0.8}
        twinkling={true}
        optimized={true}
        className="z-0"
      />
      
      {/* Floating Percy Help Bubble - TEMPORARILY DISABLED FOR DEBUGGING */}
      {/* <PercyHelpBubble /> */}
      
      {/* Enhanced Background Effects - Mobile Optimized */}
      <div className="absolute inset-0 z-5 opacity-10 sm:opacity-15">
        <FloatingParticles particleCount={18} />
      </div>
      
      {/* Interactive Empowerment Elements - TEMPORARILY DISABLED FOR DEBUGGING */}
      {/* <InteractiveFloatingElements 
        count={6} 
        mouseFollow={true} 
        className="hidden sm:block pointer-events-auto"
      /> */}
      
      <div className="absolute inset-0 z-5 bg-[radial-gradient(circle_at_center,rgba(0,102,255,0.08),transparent)]" />
      <div className="absolute inset-0 z-5 bg-gradient-to-b from-[#0d1117]/60 via-[#0d1117]/80 to-[#0d1117]/90" />
      
      <main className="relative z-10 min-h-screen pt-20 sm:pt-24 md:pt-28">
        
        {/* Main Content - Unified Responsive Container */}
        <motion.div 
          style={{ scale }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          {/* Hero Section - Mobile Optimized */}
          <section className="min-h-[85vh] flex flex-col items-center">
            <div className="flex flex-col items-center justify-center w-full">
              {/* Welcome headline with Typewriter Effect - Mobile Safe */}
              <Pseudo3DHero className="text-center mb-8 w-full">
                <motion.h1 
                  initial={{ opacity: 0, y: -20 }} 
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl max-w-5xl mx-auto mb-4 sm:mb-6 tracking-tight font-extrabold bg-gradient-to-r from-electric-blue via-teal-400 to-fuchsia-500 bg-clip-text text-transparent leading-tight px-2 antialiased"
                >
                  <TypewriterText 
                    words={[
                      'Your Competition Just Became Extinct',
                      'AI Automation That DOMINATES',
                      'Business Intelligence UNLEASHED',
                      'Your Empire Starts NOW'
                    ]}
                    typeSpeed={120}
                    deleteSpeed={80}
                    delaySpeed={3000}
                    className="block"
                    actionWords={['DOMINATES', 'Extinct', 'UNLEASHED', 'NOW']}
                    cosmicMode={true}
                  />
                </motion.h1>
                
                {/* Subheading - Mobile Typography */}
                <motion.p 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-center text-sm sm:text-base lg:text-xl text-gray-300 max-w-2xl lg:max-w-4xl mx-auto mb-6 sm:mb-8 px-2 leading-relaxed"
                >
                  SKRBL AI does not just automate—it <span className="text-electric-blue font-bold">DOMINATES</span>. 
                  While your competitors are still figuring out AI, you will be deploying the arsenal that makes them extinct.
                  <br className="hidden sm:block" />
                  <span className="text-teal-400 font-semibold">
                    No contracts. No limits. Just pure automation domination.
                  </span>
                </motion.p>
              </Pseudo3DHero>

              {/* Percy Onboarding Section - Enhanced with 3D */}
              {shouldShowOnboarding ? (
                <Pseudo3DFeature className="w-full max-w-4xl mx-auto">
                  <PercyOnboardingRevolution />
                </Pseudo3DFeature>
              ) : (
                // Show alternative content for verified users or when onboarding is complete
                <Pseudo3DFeature className="text-center py-8">
                  <p className="text-gray-400 mb-4">Welcome back to SKRBL AI</p>
                  <button 
                    onClick={() => router.push('/dashboard')}
                    className="bg-electric-blue hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Go to Dashboard
                  </button>
                </Pseudo3DFeature>
              )}
            </div>

            {/* Social Proof Section removed – stats now live inside unified Percy component */}
          </section>

          {/* Agent League – Dynamic Rendering with 3D Enhancement */}
          <Pseudo3DFeature>
            <AgentsGrid />
          </Pseudo3DFeature>

          {/* Enhanced Banner Component with 3D */}
          <Pseudo3DFeature className="mt-16">
            <EmpowermentBanner />
          </Pseudo3DFeature>

          {/* Loading state with enhanced styling */}
          {isLoading && (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-electric-blue border-t-transparent animate-spin"></div>
                  <div className="absolute inset-2 rounded-full border-2 border-teal-400 border-b-transparent animate-spin animate-reverse"></div>
                </div>
                <p className="text-lg text-gray-300 animate-pulse">Initializing AI systems...</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Animated Background */}
        <AnimatedBackground />
      </main>
    </div>
  );
}
