'use client';
// @ts-nocheck

import React, { useState, useEffect } from 'react';
import { motion, useTransform, useScroll } from 'framer-motion';
import Image from 'next/image';
import PercyFigure from '@/components/home/PercyFigure';
import FloatingParticles from '@/components/ui/FloatingParticles';
import StatCounter from '@/components/features/StatCounter';
import PercyOnboardingRevolution from '@/components/home/PercyOnboardingRevolution';
import AgentsGrid from '@/components/agents/AgentsGrid';
import InteractiveFloatingElements from '@/components/ui/InteractiveFloatingElements';
import AIEmpowermentCoach from '@/components/ui/AIEmpowermentCoach';
import AnimatedBackground from './AnimatedBackground';

const percyAgent = {
  name: 'Percy',
  description: 'Your AI Concierge',
  image: '/images/agents-percy-nobg-skrblai.webp'
};

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [liveUsers, setLiveUsers] = useState(1251);
  const [agentsDeployed, setAgentsDeployed] = useState(92);
  const [revenueGenerated, setRevenueGenerated] = useState(2849718);
  
  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [0, 300], [1, 0.8]);

  // Safe mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen relative text-white bg-[#0d1117] overflow-hidden">
      {/* Background Effects - Mobile Optimized */}
      <div className="absolute inset-0 z-0 opacity-30 sm:opacity-40">
        <FloatingParticles particleCount={24} />
      </div>
      
      {/* Interactive Empowerment Elements - Now properly integrated */}
      <InteractiveFloatingElements 
        count={6} 
        mouseFollow={true} 
        className="hidden sm:block pointer-events-auto"
      />
      
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

              {/* Percy Section */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.6, type: 'spring', stiffness: 100 }}
                className="relative my-4 sm:my-6 md:my-8 flex justify-center"
              >
                <div className="relative w-32 h-32 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-600/30 blur-xl animate-pulse"></div>
                  <div className="absolute inset-[2px] rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 p-1">
                    <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden relative">
                      <Image
                        src="/images/agents-percy-nobg-skrblai.webp"
                        alt="Percy AI Concierge"
                        width={300}
                        height={300}
                        priority={true}
                        className="w-full h-full object-contain scale-90"
                      />
                    </div>
                  </div>
                  
                  {/* Glow effects */}
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20 animate-pulse"></div>
                  <div className="absolute inset-0 rounded-full border border-blue-500/10 animate-ping"></div>
                </div>
              </motion.div>
              
              {/* Percy Onboarding Revolution */}
              <PercyOnboardingRevolution />
            </div>

            {/* Social Proof Section - Mobile Optimized */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="w-full mt-8 sm:mt-12 md:mt-16"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
                <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                  <div className="text-2xl sm:text-3xl font-bold text-electric-blue mb-1">
                    <StatCounter end={liveUsers} duration={2} />
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400">Businesses Transformed Today</div>
                  <div className="text-xs text-teal-400 mt-1">▲ Still climbing</div>
                </div>

                <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                  <div className="text-2xl sm:text-3xl font-bold text-teal-400 mb-1">
                    <StatCounter end={agentsDeployed} duration={2} />
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400">Competitors Eliminated</div>
                  <div className="text-xs text-electric-blue mt-1">▲ Per minute</div>
                </div>

                <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                  <div className="text-2xl sm:text-3xl font-bold text-fuchsia-400 mb-1">
                    $<StatCounter end={Math.floor(revenueGenerated/1000)} duration={2} />K+
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400">Revenue Generated</div>
                  <div className="text-xs text-fuchsia-400 mt-1">▲ This month</div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Agent League – Dynamic Rendering */}
          <AgentsGrid />
        </motion.div>
      </main>
      
      {/* AI Empowerment Coach - Now properly positioned */}
      <AIEmpowermentCoach 
        triggerEvents={['scroll', 'hover', 'click']}
        className="z-50"
      />

      {/* Animated Background */}
      <AnimatedBackground />
    </div>
  );
}
