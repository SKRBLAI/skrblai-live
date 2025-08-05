'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../components/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
// 🚨 EMERGENCY FIX: Removed performance-heavy imports
// import FloatingParticles from '../components/ui/FloatingParticles';
import PercyOnboardingRevolution from '../components/home/PercyOnboardingRevolution';
import AgentsGrid from '../components/agents/AgentsGrid';
import AgentPreviewSection from '../components/home/AgentPreviewSection';
// import InteractiveFloatingElements from '../components/ui/InteractiveFloatingElements';
import EmpowermentBanner from '../components/ui/EmpowermentBanner';
// import AnimatedBackground from './AnimatedBackground';
// import PercyHelpBubble from '../components/ui/PercyHelpBubble';
// import TypewriterText from '../components/shared/TypewriterText';
// import CosmicStarfield from '../components/background/CosmicStarfield';
import { Pseudo3DFeature } from '../components/shared/Pseudo3DCard';
import toast from 'react-hot-toast';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, session, isLoading, isEmailVerified } = useAuth();
  
  // 🚨 EMERGENCY FIX: Removed scroll transforms causing constant repaints and white screen
  // const { scrollY } = useScroll();
  // const scale = useTransform(scrollY, [0, 300], [1, 0.8]);

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
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative text-white">
      {/* Static background gradients only - MUCH lighter performance */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-900 via-gray-900 to-black" />
      <div className="absolute inset-0 z-5 bg-[radial-gradient(circle_at_center,rgba(0,102,255,0.08),transparent)]" />
      <div className="absolute inset-0 z-5 bg-gradient-to-b from-[#0d1117]/60 via-[#0d1117]/80 to-[#0d1117]/90" />
      
      <main className="relative z-10 min-h-screen pt-28 sm:pt-32 md:pt-36 lg:pt-40">
        
        {/* Main Content - Unified Responsive Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Removed scroll-scale wrapper here to keep hero text unscaled */}
          {/* Hero Section - Mobile Optimized with Enhanced Spacing */}
          <section className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center pt-8 sm:pt-12 md:pt-16">
            <div className="flex flex-col items-center justify-center w-full max-w-7xl mx-auto relative z-20">
              {/* Main Hero Statement - Single Static Tagline */}
              <motion.div 
                className="text-center mb-12 w-full" 
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl max-w-5xl mx-auto mb-4 sm:mb-6 tracking-tight font-extrabold bg-gradient-to-r from-electric-blue via-teal-400 to-fuchsia-500 bg-clip-text text-transparent leading-tight px-2 subpixel-antialiased">
                  {/* 🚨 EMERGENCY FIX: Removed motion animation causing performance issues */}
                  Your Competition Just Became Extinct
                </h1>
                
                {/* Static Subheading */}
                <motion.p 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-center text-sm sm:text-base lg:text-xl text-gray-200 max-w-2xl lg:max-w-4xl mx-auto mb-8 px-2 leading-relaxed"
                >
                  SKRBL AI does not just automate—it <span className="text-electric-blue font-bold">DOMINATES</span>. 
                  While your competitors are still figuring out AI, you will be deploying the arsenal that makes them extinct.
                  <br className="hidden sm:block" />
                  <span className="text-teal-400 font-semibold">
                    No contracts. No limits. Just pure automation domination.
                  </span>
                </motion.p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }} className="text-center mt-6">
  <motion.button
    onClick={() => {
      const el = document.getElementById('onboarding');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="px-8 py-4 bg-gradient-to-r from-electric-blue via-teal-400 to-fuchsia-500 text-white text-lg font-semibold rounded-lg shadow-lg transition-all"
  >
    Start My Free Scan
  </motion.button>
</motion.div>

{/* Percy Onboarding Section - Enhanced with 3D and Micro-animations */}
              {/* FIXED: Percy onboarding now ALWAYS shows on homepage for ALL users */}
              <div id="onboarding" className="w-full max-w-4xl mx-auto">
                {/* 🚨 EMERGENCY FIX: Removed motion animations and Pseudo3DFeature causing performance issues */}
                <PercyOnboardingRevolution />
              </div>
            </div>

            {/* Social Proof Section removed – stats now live inside unified Percy component */}
          </section>

          {/* Agent League – Dynamic Rendering with 3D Enhancement */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20"
          >
            <Pseudo3DFeature>
              <AgentPreviewSection />
              <AgentsGrid />
            </Pseudo3DFeature>
          </motion.div>

          {/* Enhanced Banner Component with 3D and Stagger Animation */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-24"
          >
            <Pseudo3DFeature>
              <EmpowermentBanner />
            </Pseudo3DFeature>
          </motion.div>

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
        </div>

        {/* 🚨 EMERGENCY FIX: Removed AnimatedBackground causing CPU overheating */}
        {/* <AnimatedBackground /> */}
      </main>
    </div>
  );
}
