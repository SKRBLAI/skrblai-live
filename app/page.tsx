'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { Agent } from '@/types/agent';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePercyContext } from '@/components/assistant/PercyProvider';
import { heroConfig } from '@/lib/config/heroConfig';
import FloatingParticles from '@/components/ui/FloatingParticles';
import ConversationalPercyOnboarding from '@/components/home/ConversationalPercyOnboarding';
import CloudinaryImage from '@/components/ui/CloudinaryImage';
import AgentsGrid from '@/components/agents/AgentsGrid';

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
    <div className="min-h-screen relative text-white bg-[#0d1117] pt-16 overflow-hidden">
      {/* Background Effects - RE-ENABLED WITH MOBILE OPTIMIZATIONS */}
      <div className="absolute inset-0 z-0 opacity-40">
        <FloatingParticles particleCount={48} />
      </div>
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(0,102,255,0.15),transparent)]" />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0d1117] via-[#0d1117]/90 to-[#0d1117]/80" />

      {/* Main Content */}
      <div className="relative z-10 pt-8 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="min-h-[85vh] flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full">
            {/* Welcome headline */}
            <motion.h1 
              initial={{ opacity: 0, y: -20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6 }}
              className="skrblai-heading text-center text-4xl md:text-6xl lg:text-7xl max-w-5xl mx-auto mb-4 tracking-tight font-extrabold bg-gradient-to-r from-electric-blue via-teal-400 to-fuchsia-500 bg-clip-text text-transparent drop-shadow-glow"
            >
              Welcome to <span className="bg-gradient-to-r from-electric-blue via-teal-400 to-fuchsia-500 bg-clip-text text-transparent">SKRBL AI</span>
            </motion.h1>
            
            {/* Subheadline */}
            <motion.p 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-teal-300 text-center max-w-3xl mx-auto mb-8 font-semibold"
            >
              Your gateway to intelligent automation.<br />
              <span className="text-gray-300 font-normal">Meet Percy and the SKRBL AI constellation—digital superheroes ready to elevate your business and creativity.</span>
            </motion.p>
            
            {/* Percy Introduction */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-center mb-8"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Meet <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">Percy</span>, Your AI Concierge
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Let Percy guide you to the perfect AI solution for your business. No overwhelm, no confusion - just personalized recommendations.
              </p>
            </motion.div>
            
            {/* Percy Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.6, type: 'spring', stiffness: 100 }}
              className="relative my-6 md:my-8 flex justify-center"
            >
              <div className="relative w-48 h-48 md:w-56 md:h-56 lg:w-64 lg:h-64">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-600/30 blur-xl animate-pulse"></div>
                <div className="absolute inset-[2px] rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 p-1">
                  <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                    <CloudinaryImage
                      agent={percyAgent}
                      alt="Percy AI Concierge"
                      width={256}
                      height={256}
                      priority={true}
                      className="w-full h-full object-cover"
                      useCloudinary={true}
                      quality={90}
                      webp={true}
                      cloudinaryTransformation="ar_1:1,c_fill,g_face"
                      fallbackToLocal={true}
                      fallbackImagePath="/images/agents-percy-nobg-skrblai.webp"
                    />
                  </div>
                </div>
                
                {/* Glow effects */}
                <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20 animate-pulse"></div>
                <div className="absolute inset-0 rounded-full border border-blue-500/10 animate-ping"></div>
              </div>
            </motion.div>
            
            {/* Conversational Percy Onboarding */}
            <ConversationalPercyOnboarding />
          </div>
        </section>

        {/* Agent Showcase */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
              Discover Our AI Agents
            </h3>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Each agent is specialized for specific tasks, ready to transform your workflow and boost productivity.
            </p>
            {recommendedAgentIds.length > 0 && (
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-cyan-400 text-sm mt-2"
              >
                ✨ Percy recommends the highlighted agents for your goals
              </motion.p>
            )}
            
            {/* Agent Backstory Links for Testing */}
            <div className="mt-8 p-4 bg-gray-800/50 rounded-xl max-w-2xl mx-auto">
              <h4 className="text-lg font-semibold text-white mb-3">Agent Backstory Pages</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Link href="/agent-backstory/percy-agent" className="px-3 py-2 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 rounded-lg transition-colors">
                  Percy Backstory
                </Link>
                <Link href="/agent-backstory/branding-agent" className="px-3 py-2 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 rounded-lg transition-colors">
                  Branding Agent
                </Link>
                <Link href="/agent-backstory/content-creator-agent" className="px-3 py-2 bg-green-600/30 hover:bg-green-600/50 text-green-300 rounded-lg transition-colors">
                  Content Creator
                </Link>
                <Link href="/agent-backstory/social-bot-agent" className="px-3 py-2 bg-pink-600/30 hover:bg-pink-600/50 text-pink-300 rounded-lg transition-colors">
                  Social Bot
                </Link>
                <Link href="/agent-backstory/analytics-agent" className="px-3 py-2 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 rounded-lg transition-colors">
                  Analytics Agent
                </Link>
                <Link href="/agent-backstory/sitegen-agent" className="px-3 py-2 bg-teal-600/30 hover:bg-teal-600/50 text-teal-300 rounded-lg transition-colors">
                  SiteGen Agent
                </Link>
              </div>
              <p className="text-xs text-gray-400 mt-3">These links are for testing the new agent backstory pages</p>
            </div>
          </div>
          
          {/* Agent Constellation - RE-ENABLED WITH MOBILE ROTATION FIX */}
          <div className="mb-16 relative">
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
              <FloatingParticles particleCount={20} />
            </div>
            <div className="relative z-10">
              <AgentsGrid />
            </div>
          </div>
          
          <div className="mt-8 mb-12 text-center">
            <Link 
              href="/services" 
              className="cosmic-btn-secondary inline-flex items-center gap-2 px-6 py-3 rounded-xl"
            >
              <span>View All Agents</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </section>

        {/* Bottom CTA Section */}
        <section className="text-center py-16 mb-24">
          <h3 className="text-2xl md:text-3xl font-bold mb-6 text-white">
            Ready to Transform Your Business?
          </h3>
          <p className="text-lg mb-8 text-gray-300 max-w-2xl mx-auto">
            Join thousands of businesses already using SKRBL AI to automate workflows, 
            generate content, and accelerate growth.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/sign-up">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 32px rgba(56, 189, 248, 0.5)' }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-electric-blue to-teal-400 text-white font-semibold rounded-xl shadow-lg transition-all duration-300"
              >
                Start Free Trial
              </motion.button>
            </Link>
            
            <Link href="/features">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300"
              >
                Learn More
              </motion.button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
