'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Agent } from '@/types/agent';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePercyContext } from '@/components/assistant/PercyProvider';
import { heroConfig } from '@/lib/config/heroConfig';
import FloatingParticles from '@/components/ui/FloatingParticles';
import InteractiveFloatingElements from '@/components/ui/InteractiveFloatingElements';
import PercyOnboardingRevolution from '@/components/home/PercyOnboardingRevolution';
import CloudinaryImage from '@/components/ui/CloudinaryImage';

import SkrblAiText from '@/components/shared/SkrblAiText';
import AgentPreviewSection from '@/components/home/AgentPreviewSection';
import { agentBackstories } from '@/lib/agents/agentBackstories';
import { ArrowRight, Sparkles, Zap, Target, Users, TrendingUp, Globe, Building, User } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isOnboardingActive, setIsOnboardingActive] = useState(false);
  const [recommendedAgentIds, setRecommendedAgentIds] = useState<string[]>([]);

  // Percy context for cleanup
  const percyContext = usePercyContext();
  const { setPercyIntent, closePercy, setIsOnboardingActive: setGlobalOnboardingActive } = percyContext;

  // Safe mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Percy cleanup and onboarding state sync
  useEffect(() => {
    try {
      if (closePercy) closePercy();
      if (setPercyIntent) setPercyIntent('');
      if (setGlobalOnboardingActive) setGlobalOnboardingActive(isOnboardingActive);
    } catch (err) {
      console.error('Error in Percy cleanup:', err);
    }
  }, [closePercy, setPercyIntent, setGlobalOnboardingActive, isOnboardingActive]);

  // Handle onboarding activation
  const handleOnboardingStart = () => {
    setIsOnboardingActive(true);
  };

  // Handle onboarding completion
  const handleOnboardingComplete = (data: any) => {
    setIsOnboardingActive(false);
    console.log('Onboarding completed with data:', data);
  };

  // Handle agent recommendations
  const handleAgentsRecommended = (agentIds: string[]) => {
    setRecommendedAgentIds(agentIds);
    
    // Auto-highlight recommended agents in constellation
    setTimeout(() => {
      agentIds.forEach(agentId => {
        const element = document.querySelector(`[data-agent-id="${agentId}"]`);
        if (element) {
          element.classList.add('recommended-glow');
        }
      });
    }, 500);
  };

  const percyAgent: Agent = {
    id: 'percy',
    name: 'Percy AI',
    description: 'AI Concierge',
    category: 'assistant',
    capabilities: [],
    visible: true,
    canConverse: true,
    recommendedHelpers: [],
    handoffTriggers: [],
  };

  // Loading state
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d1117] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading SKRBL AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative text-white bg-[#0d1117] overflow-hidden">
      {/* Background Effects - Mobile Optimized */}
      <div className="absolute inset-0 z-0 opacity-30 sm:opacity-40">
        <FloatingParticles particleCount={24} />
      </div>
      
      {/* Interactive Empowerment Elements */}
      <InteractiveFloatingElements count={6} mouseFollow={true} className="hidden sm:block" />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(0,102,255,0.15),transparent)]" />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0d1117] via-[#0d1117]/90 to-[#0d1117]/80" />
      <main className="relative z-10 min-h-screen pt-20 sm:pt-24 md:pt-28">

      {/* Main Content - Unified Responsive Container */}
      <div className="relative z-10 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
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
            
            {/* Subheadline - Mobile Safe */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-teal-300 text-center max-w-4xl mx-auto mb-6 md:mb-8 font-semibold px-4"
            >
              <div className="mb-2">
                <SkrblAiText variant="glow" size="lg">SKRBL AI</SkrblAiText> doesn't just automate—it{' '}
                <span className="text-white font-bold whitespace-nowrap">DOMINATES</span>.
              </div>
              <div className="text-sm sm:text-base md:text-lg text-gray-300 font-normal leading-relaxed">
                47,000+ businesses have already left their competition in the dust.{' '}
                <span className="text-cyan-400 font-semibold whitespace-nowrap">Your turn starts now.</span>
              </div>
            </motion.div>

            {/* Percy Introduction - Mobile Optimized */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-center mb-6 sm:mb-8 px-4"
            >
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4">
                Meet{' '}
                <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                  Percy
                </span>
                , Your Disruption Engine
              </h3>
              <div className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
                <div className="mb-2">
                  Percy has automated{' '}
                  <span className="text-cyan-400 font-semibold whitespace-nowrap">
                    1,847 businesses
                  </span>{' '}
                  out of their competition this month alone.
                </div>
                <div>
                  In 6 minutes, you'll know exactly how to dominate your industry.{' '}
                  <span className="text-white font-semibold">Your competitors aren't ready.</span>
                </div>
              </div>
            </motion.div>
            
            {/* Percy Image - Oval Design with Enhanced Shadow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6, type: 'spring', stiffness: 100 }}
              className="relative my-4 sm:my-6 md:my-8 flex justify-center"
            >
              <div className="relative w-40 h-32 sm:w-60 sm:h-48 md:w-72 md:h-56 lg:w-80 lg:h-64">
                {/* Outer glow - oval shaped */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-600/30 blur-xl animate-pulse" style={{ borderRadius: '50%/40%' }}></div>
                
                {/* Main oval container */}
                <div className="absolute inset-[2px] bg-gradient-to-br from-cyan-400 to-blue-600 p-1" style={{ borderRadius: '50%/40%' }}>
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center overflow-hidden relative" style={{ borderRadius: '50%/40%' }}>
                    <CloudinaryImage
                      agent={percyAgent}
                      alt="Percy AI Concierge"
                      width={300}
                      height={300}
                      priority={true}
                      className="w-full h-full object-contain scale-90"
                      useCloudinary={true}
                      quality={90}
                      webp={true}
                      cloudinaryTransformation="ar_1:1,c_fit"
                      fallbackToLocal={true}
                      fallbackImagePath="/images/agents-percy-nobg-skrblai.webp"
                    />
                    
                    {/* Inner shadow for depth */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" style={{ borderRadius: '50%/40%' }}></div>
                  </div>
                </div>
                
                {/* Enhanced glow effects - oval shaped */}
                <div className="absolute inset-0 border-2 border-cyan-400/20 animate-pulse" style={{ borderRadius: '50%/40%' }}></div>
                <div className="absolute inset-0 border border-blue-500/10 animate-ping" style={{ borderRadius: '50%/40%' }}></div>
                
                {/* Additional floating light particles */}
                <div className="absolute -top-2 -right-2 w-2 h-2 bg-cyan-400 rounded-full animate-pulse opacity-60"></div>
                <div className="absolute -bottom-2 -left-2 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse opacity-40 animation-delay-500"></div>
                <div className="absolute top-1/2 -left-3 w-1 h-1 bg-teal-300 rounded-full animate-pulse opacity-50 animation-delay-1000"></div>
              </div>
            </motion.div>
            
            {/* Percy Onboarding Revolution */}
            <PercyOnboardingRevolution />
          </div>

          {/* Social Proof Section - Mobile Optimized */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-12 sm:mt-16 max-w-6xl mx-auto w-full"
          >
            {/* Live Stats Bar - Mobile Optimized */}
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl border border-cyan-400/20 p-4 sm:p-6 mb-6 sm:mb-8">
              <div className="text-center mb-3 sm:mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                  🔥 Live Competition Destruction
                </h3>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-green-400 text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Real-time business transformations</span>
                  </div>
                  <span className="hidden sm:inline">happening now</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-cyan-400 mb-1 whitespace-nowrap">
                    47,213
                  </div>
                  <div className="text-xs text-gray-400 leading-tight">
                    Businesses<br className="sm:hidden" /> Automated
                  </div>
                  <div className="text-xs text-green-400 whitespace-nowrap">
                    +{Math.floor(Math.random() * 15 + 5)} today
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-400 mb-1 whitespace-nowrap">
                    $18.5M
                  </div>
                  <div className="text-xs text-gray-400 leading-tight">
                    Revenue<br className="sm:hidden" /> Generated
                  </div>
                  <div className="text-xs text-green-400 whitespace-nowrap">
                    +${Math.floor(Math.random() * 50 + 25)}K today
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-400 mb-1 whitespace-nowrap">
                    340%
                  </div>
                  <div className="text-xs text-gray-400 leading-tight">
                    Avg Growth<br className="sm:hidden" /> Increase
                  </div>
                  <div className="text-xs text-purple-400 leading-tight">
                    Per user in<br className="sm:hidden" /> 90 days
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-400 mb-1 whitespace-nowrap">
                    2,847
                  </div>
                  <div className="text-xs text-gray-400 leading-tight">
                    Active Right<br className="sm:hidden" /> Now
                  </div>
                  <div className="text-xs text-orange-400 leading-tight">
                    Crushing<br className="sm:hidden" /> competition
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Testimonial Highlights - Mobile Optimized */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-6xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 }}
                className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-lg rounded-xl border border-green-400/20 p-3 sm:p-4"
              >
                <div className="flex items-start space-x-2 mb-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    SC
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-green-400 font-semibold text-sm">Sarah Chen</p>
                    <p className="text-gray-400 text-xs">Marketing Agency • SF</p>
                  </div>
                  <span className="px-2 py-1 bg-green-400/20 text-green-300 text-xs rounded-full whitespace-nowrap">
                    ✓ VERIFIED
                  </span>
                </div>
                <p className="text-white text-sm italic leading-relaxed mb-2">
                  "Increased content output by 400% in first month. Competitors can't keep up."
                </p>
                <div className="text-xs text-green-400 font-semibold whitespace-nowrap">
                  🚀 400% Content Increase
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 backdrop-blur-lg rounded-xl border border-cyan-400/20 p-3 sm:p-4"
              >
                <div className="flex items-start space-x-2 mb-2">
                  <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    MJ
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-cyan-400 font-semibold text-sm">Marcus Johnson</p>
                    <p className="text-gray-400 text-xs">Digital Marketing • Denver</p>
                  </div>
                  <span className="px-2 py-1 bg-cyan-400/20 text-cyan-300 text-xs rounded-full whitespace-nowrap">
                    ✓ VERIFIED
                  </span>
                </div>
                <p className="text-white text-sm italic leading-relaxed mb-2">
                  "Generated $47K additional revenue in Q1. ROI was immediate and massive."
                </p>
                <div className="text-xs text-cyan-400 font-semibold whitespace-nowrap">
                  💰 $47K Revenue Boost
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 }}
                className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-lg rounded-xl border border-purple-400/20 p-3 sm:p-4 sm:col-span-2 lg:col-span-1"
              >
                <div className="flex items-start space-x-2 mb-2">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    ET
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-purple-400 font-semibold text-sm">Emma Thompson</p>
                    <p className="text-gray-400 text-xs">Creative Agency • Miami</p>
                  </div>
                  <span className="px-2 py-1 bg-purple-400/20 text-purple-300 text-xs rounded-full whitespace-nowrap">
                    ✓ VERIFIED
                  </span>
                </div>
                <p className="text-white text-sm italic leading-relaxed mb-2">
                  "Automated 80% of our workflow. Now we focus on strategy, not execution."
                </p>
                <div className="text-xs text-purple-400 font-semibold whitespace-nowrap">
                  ⚡ 80% Automation
                </div>
              </motion.div>
            </div>

            {/* Trust Indicators - Mobile Optimized */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              className="text-center mt-6 sm:mt-8"
            >
              <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6 text-gray-400 text-xs sm:text-sm">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <span className="text-green-400">✓</span>
                  <span className="whitespace-nowrap">SOC 2 Compliant</span>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <span className="text-green-400">✓</span>
                  <span className="whitespace-nowrap">99.9% Uptime</span>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <span className="text-green-400">✓</span>
                  <span className="whitespace-nowrap">Enterprise Security</span>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <span className="text-green-400">✓</span>
                  <span className="whitespace-nowrap">24/7 AI Support</span>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <span className="text-green-400">✓</span>
                  <span className="whitespace-nowrap">Cancel Anytime</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Agent Showcase - Mobile Optimized */}
        <section className="py-12 sm:py-16">
          <div className="text-center mb-8 sm:mb-12 px-4">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
              Your AI Army of Industry Destroyers
            </h3>
            <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Each agent has generated{' '}
              <span className="text-cyan-400 font-semibold whitespace-nowrap">$47M+ in competitive advantage</span>{' '}
              for our users. They don't just boost productivity—
              <span className="text-white font-semibold">they eliminate competition</span>.
            </p>
            
            {/* Progressive Urgency Banner - Mobile Optimized */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 mb-2 max-w-xl mx-auto"
            >
              <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-red-500/40 rounded-lg p-3 max-w-full">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse flex-shrink-0"></div>
                    <span className="text-red-400 font-semibold">LIVE:</span>
                    <span className="text-white text-center">
                      {Math.floor(Math.random() * 156) + 67} businesses gained advantage
                    </span>
                  </div>
                  <span className="text-white text-center">in the last hour</span>
                </div>
                <div className="text-center text-xs text-orange-300 mt-2 leading-relaxed">
                  Your competitors don't know what's coming<br className="sm:hidden" /> • 
                  Average time to industry dominance: 72 hours
                </div>
              </div>
            </motion.div>

            {recommendedAgentIds.length > 0 && (
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-cyan-400 text-sm mt-2"
              >
                ✨ Percy recommends the highlighted agents for your goals
              </motion.p>
            )}
            
            {/* Live Agent Domination Dashboard */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 sm:mt-8 mb-8 sm:mb-12"
            >
              <AgentPreviewSection />
            </motion.div>

            {/* Agent Backstory Navigation - Mobile Optimized */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-6 sm:mt-8 mb-8 sm:mb-12 max-w-6xl mx-auto"
            >
              <div className="text-center mb-4 sm:mb-6">
                <h4 className="text-lg sm:text-xl font-bold text-white mb-2">🎭 Agent Origin Stories</h4>
                <p className="text-sm sm:text-base text-gray-400">Discover the epic backstories of your AI champions</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/agent-backstory/percy" className="block p-3 sm:p-4 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 hover:from-blue-600/30 hover:to-cyan-600/30 border border-blue-500/30 rounded-xl transition-all group">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">P</div>
                      <div className="min-w-0">
                        <h5 className="text-blue-300 font-semibold group-hover:text-blue-200 text-sm sm:text-base">Percy's Origin</h5>
                        <p className="text-xs text-gray-400">Cosmic Concierge</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/agent-backstory/branding" className="block p-3 sm:p-4 bg-gradient-to-br from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 border border-purple-500/30 rounded-xl transition-all group">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">B</div>
                      <div className="min-w-0">
                        <h5 className="text-purple-300 font-semibold group-hover:text-purple-200 text-sm sm:text-base">Brand Alexander</h5>
                        <p className="text-xs text-gray-400">Design Overlord</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/agent-backstory/contentcreation" className="block p-3 sm:p-4 bg-gradient-to-br from-green-600/20 to-emerald-600/20 hover:from-green-600/30 hover:to-emerald-600/30 border border-green-500/30 rounded-xl transition-all group">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">C</div>
                      <div className="min-w-0">
                        <h5 className="text-green-300 font-semibold group-hover:text-green-200 text-sm sm:text-base">Content Carltig</h5>
                        <p className="text-xs text-gray-400">Content Wizard</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/agent-backstory/social" className="block p-3 sm:p-4 bg-gradient-to-br from-pink-600/20 to-rose-600/20 hover:from-pink-600/30 hover:to-rose-600/30 border border-pink-500/30 rounded-xl transition-all group">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">S</div>
                      <div className="min-w-0">
                        <h5 className="text-pink-300 font-semibold group-hover:text-pink-200 text-sm sm:text-base">Social Nino</h5>
                        <p className="text-xs text-gray-400">Viral Master</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/agent-backstory/analytics" className="block p-3 sm:p-4 bg-gradient-to-br from-amber-600/20 to-orange-600/20 hover:from-amber-600/30 hover:to-orange-600/30 border border-amber-500/30 rounded-xl transition-all group">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">A</div>
                      <div className="min-w-0">
                        <h5 className="text-amber-300 font-semibold group-hover:text-amber-200 text-sm sm:text-base">Analytics Agent</h5>
                        <p className="text-xs text-gray-400">Data Oracle</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/agent-backstory/site" className="block p-3 sm:p-4 bg-gradient-to-br from-teal-600/20 to-cyan-600/20 hover:from-teal-600/30 hover:to-cyan-600/30 border border-teal-500/30 rounded-xl transition-all group">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">W</div>
                      <div className="min-w-0">
                        <h5 className="text-teal-300 font-semibold group-hover:text-teal-200 text-sm sm:text-base">Website Agent</h5>
                        <p className="text-xs text-gray-400">Site Builder</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
          
          {/* View All Services CTA - Mobile Optimized */}
          <div className="mt-6 sm:mt-8 mb-8 sm:mb-12 text-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Link 
                href="/services" 
                className="cosmic-btn-secondary inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:scale-105 transition-all"
              >
                <span>View All Services</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
              <p className="text-gray-400 text-xs sm:text-sm mt-3 max-w-lg mx-auto leading-relaxed">
                Explore our complete AI agent ecosystem and find your perfect automation solution
              </p>
            </motion.div>
          </div>
        </section>

        {/* Bottom CTA Section - Mobile Optimized */}
        <section className="text-center py-12 sm:py-16 mb-16 sm:mb-24 px-4">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-white leading-tight">
            Ready to Make Your Competitors Irrelevant?
          </h3>
          <div className="text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 text-gray-300 max-w-2xl mx-auto leading-relaxed">
            <span className="text-cyan-400 font-semibold whitespace-nowrap">47,213 businesses</span>{' '}
            have already gained an insurmountable advantage.{' '}
            <span className="block sm:inline mt-1 sm:mt-0">
              While your competition struggles with manual work, you'll be{' '}
              <span className="text-white font-semibold">10x ahead, automated, and unstoppable.</span>
            </span>
          </div>
          
          <div className="flex flex-col gap-4 items-center max-w-lg mx-auto">
            <Link href="/sign-up" className="w-full">
              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 0 32px rgba(56, 189, 248, 0.5)' }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-8 py-4 bg-gradient-to-r from-electric-blue to-teal-400 text-white font-bold rounded-xl shadow-lg transition-all duration-300 text-lg text-center"
              >
                Destroy My Competition Now
              </motion.button>
            </Link>
            
            <Link href="/features" className="w-full">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-all duration-300 text-lg text-center"
              >
                Show Me The Advantage
              </motion.button>
            </Link>
          </div>
        </section>
      </div>
      </main>
    </div>
  );
}
