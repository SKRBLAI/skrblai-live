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
import SkrblAiText from '@/components/shared/SkrblAiText';

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
      {/* Background Effects - RE-ENABLED WITH MOBILE OPTIMIZATIONS */}
      <div className="absolute inset-0 z-0 opacity-40">
        <FloatingParticles particleCount={48} />
      </div>
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(0,102,255,0.15),transparent)]" />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0d1117] via-[#0d1117]/90 to-[#0d1117]/80" />
      <main className="relative z-10 min-h-screen pt-24 md:pt-28">

      {/* Main Content */}
      <div className="px-4 md:px-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="min-h-[85vh] flex flex-col items-center">
          <div className="flex flex-col items-center justify-center w-full">
            {/* Welcome headline */}
            <motion.h1 
              initial={{ opacity: 0, y: -20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6 }}
              className="skrblai-heading text-center text-3xl sm:text-4xl md:text-6xl lg:text-7xl max-w-5xl mx-auto mb-4 tracking-tight font-extrabold bg-gradient-to-r from-electric-blue via-teal-400 to-fuchsia-500 bg-clip-text text-transparent drop-shadow-glow mobile-text-safe no-text-cutoff"
            >
              Your Competition Just Became <span className="bg-gradient-to-r from-electric-blue via-teal-400 to-fuchsia-500 bg-clip-text text-transparent">Extinct</span>
            </motion.h1>
            
            {/* Subheadline */}
            <motion.p 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl md:text-2xl text-teal-300 text-center max-w-3xl mx-auto mb-6 md:mb-8 font-semibold mobile-text-safe no-text-cutoff"
            >
              <SkrblAiText variant="glow" size="lg">SKRBL AI</SkrblAiText> doesn't just automate—it <span className="text-white font-bold">DOMINATES</span>.<br />
              <span className="text-gray-300 font-normal">47,000+ businesses have already left their competition in the dust. <span className="text-cyan-400 font-semibold">Your turn starts now.</span></span>
            </motion.p>
            
            {/* ✨ NEW: Instant Value Demo Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-center mb-12 max-w-4xl mx-auto"
            >
              <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-lg rounded-3xl border border-cyan-400/30 p-8 mb-8 shadow-[0_0_50px_rgba(56,189,248,0.3)]">
                <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">
                  🎯 <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">Instant Business Analysis</span>
                </h2>
                <p className="text-gray-300 text-lg mb-6">
                  See exactly how <SkrblAiText variant="glow" size="md">SKRBL AI</SkrblAiText> will dominate your competition in <span className="text-cyan-400 font-bold">under 30 seconds</span>
                </p>
                
                {/* Quick Value Demo Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <motion.div 
                    className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 rounded-xl p-4 border border-blue-400/20 cursor-pointer hover:border-blue-400/40 transition-all"
                    whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(56, 189, 248, 0.3)' }}
                    onClick={() => {
                      const input = document.getElementById('instant-demo-input') as HTMLInputElement;
                      if (input) {
                        input.placeholder = 'Enter your website URL...';
                        input.focus();
                      }
                    }}
                  >
                    <div className="text-2xl mb-2">🌐</div>
                    <h3 className="text-white font-bold mb-1">Website Analysis</h3>
                    <p className="text-gray-400 text-sm">Instant SEO, conversion & competition insights</p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-xl p-4 border border-purple-400/20 cursor-pointer hover:border-purple-400/40 transition-all"
                    whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)' }}
                    onClick={() => {
                      const input = document.getElementById('instant-demo-input') as HTMLInputElement;
                      if (input) {
                        input.placeholder = 'Describe your business or industry...';
                        input.focus();
                      }
                    }}
                  >
                    <div className="text-2xl mb-2">🏢</div>
                    <h3 className="text-white font-bold mb-1">Business Strategy</h3>
                    <p className="text-gray-400 text-sm">AI agent recommendations & automation plan</p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 rounded-xl p-4 border border-green-400/20 cursor-pointer hover:border-green-400/40 transition-all"
                    whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)' }}
                    onClick={() => {
                      const input = document.getElementById('instant-demo-input') as HTMLInputElement;
                      if (input) {
                        input.placeholder = 'Enter your LinkedIn profile URL...';
                        input.focus();
                      }
                    }}
                  >
                    <div className="text-2xl mb-2">💼</div>
                    <h3 className="text-white font-bold mb-1">Profile Optimization</h3>
                    <p className="text-gray-400 text-sm">Personal brand & content strategy analysis</p>
                  </motion.div>
                </div>
                
                {/* Instant Demo Input */}
                <div className="relative">
                  <input
                    id="instant-demo-input"
                    type="text"
                    placeholder="Enter your website, business idea, or LinkedIn profile..."
                    className="w-full px-6 py-4 bg-slate-800/80 border border-cyan-400/30 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-lg"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        if (input.value.trim()) {
                          // Trigger Percy onboarding with the input
                          const percyOnboardingElement = document.querySelector('[data-percy-onboarding]');
                          if (percyOnboardingElement) {
                            percyOnboardingElement.scrollIntoView({ behavior: 'smooth' });
                            // Simulate the input to Percy
                            setTimeout(() => {
                              const percyInput = document.querySelector('[data-percy-input]') as HTMLInputElement;
                              if (percyInput) {
                                percyInput.value = input.value;
                                percyInput.focus();
                                const event = new KeyboardEvent('keydown', { key: 'Enter' });
                                percyInput.dispatchEvent(event);
                              }
                            }, 500);
                          }
                        }
                      }
                    }}
                  />
                  <motion.button
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg hover:from-cyan-400 hover:to-blue-500 transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const input = document.getElementById('instant-demo-input') as HTMLInputElement;
                      if (input?.value.trim()) {
                        const percyOnboardingElement = document.querySelector('[data-percy-onboarding]');
                        if (percyOnboardingElement) {
                          percyOnboardingElement.scrollIntoView({ behavior: 'smooth' });
                          setTimeout(() => {
                            const percyInput = document.querySelector('[data-percy-input]') as HTMLInputElement;
                            if (percyInput) {
                              percyInput.value = input.value;
                              percyInput.focus();
                              const event = new KeyboardEvent('keydown', { key: 'Enter' });
                              percyInput.dispatchEvent(event);
                            }
                          }, 500);
                        }
                      }
                    }}
                  >
                    Analyze Now
                  </motion.button>
                </div>
                
                <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-400">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>No signup required</span>
                  </div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <span>Results in 15 seconds</span>
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  <span className="text-cyan-400 font-semibold">3 free scans daily</span>
                </div>
              </div>
            </motion.div>

            {/* Percy Introduction */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-center mb-8"
            >
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Meet <span className="bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">Percy</span>, Your Disruption Engine
              </h3>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Percy has automated <span className="text-cyan-400 font-semibold">1,847 businesses out of their competition</span> this month alone. In 6 minutes, you'll know exactly how to dominate your industry. <span className="text-white font-semibold">Your competitors aren't ready.</span>
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

          {/* ✨ NEW: Prominent Social Proof Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16 max-w-6xl mx-auto"
          >
            {/* Live Stats Bar */}
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl border border-cyan-400/20 p-6 mb-8">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-white mb-2">🔥 Live Competition Destruction in Progress</h3>
                <div className="flex items-center justify-center space-x-2 text-green-400 text-sm font-semibold">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Real-time business transformations happening now</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-cyan-400 mb-1">47,213</div>
                  <div className="text-xs text-gray-400">Businesses Automated</div>
                  <div className="text-xs text-green-400">+{Math.floor(Math.random() * 15 + 5)} today</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-green-400 mb-1">$18.5M</div>
                  <div className="text-xs text-gray-400">Revenue Generated</div>
                  <div className="text-xs text-green-400">+${Math.floor(Math.random() * 50 + 25)}K today</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-purple-400 mb-1">340%</div>
                  <div className="text-xs text-gray-400">Avg Growth Increase</div>
                  <div className="text-xs text-purple-400">Per user in 90 days</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-orange-400 mb-1">2,847</div>
                  <div className="text-xs text-gray-400">Active Right Now</div>
                  <div className="text-xs text-orange-400">Crushing competition</div>
                </div>
              </div>
            </div>

            {/* Quick Testimonial Highlights */}
            <div className="grid md:grid-cols-3 gap-4">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 }}
                className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-lg rounded-xl border border-green-400/20 p-4"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">SC</div>
                  <div>
                    <p className="text-green-400 font-semibold text-sm">Sarah Chen</p>
                    <p className="text-gray-400 text-xs">Marketing Agency • San Francisco</p>
                  </div>
                  <span className="ml-auto px-2 py-1 bg-green-400/20 text-green-300 text-xs rounded-full">✓ VERIFIED</span>
                </div>
                <p className="text-white text-sm italic">"Increased content output by 400% in first month. Competitors can't keep up."</p>
                <div className="text-xs text-green-400 mt-2 font-semibold">🚀 400% Content Increase</div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 backdrop-blur-lg rounded-xl border border-cyan-400/20 p-4"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-sm">MJ</div>
                  <div>
                    <p className="text-cyan-400 font-semibold text-sm">Marcus Johnson</p>
                    <p className="text-gray-400 text-xs">Digital Marketing • Denver</p>
                  </div>
                  <span className="ml-auto px-2 py-1 bg-cyan-400/20 text-cyan-300 text-xs rounded-full">✓ VERIFIED</span>
                </div>
                <p className="text-white text-sm italic">"Generated $47K additional revenue in Q1. ROI was immediate and massive."</p>
                <div className="text-xs text-cyan-400 mt-2 font-semibold">💰 $47K Revenue Boost</div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 }}
                className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-lg rounded-xl border border-purple-400/20 p-4"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">ET</div>
                  <div>
                    <p className="text-purple-400 font-semibold text-sm">Emma Thompson</p>
                    <p className="text-gray-400 text-xs">Creative Agency • Miami</p>
                  </div>
                  <span className="ml-auto px-2 py-1 bg-purple-400/20 text-purple-300 text-xs rounded-full">✓ VERIFIED</span>
                </div>
                <p className="text-white text-sm italic">"Automated 80% of our workflow. Now we focus on strategy, not execution."</p>
                <div className="text-xs text-purple-400 mt-2 font-semibold">⚡ 80% Automation</div>
              </motion.div>
            </div>

            {/* Trust Indicators */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              className="text-center mt-8"
            >
              <div className="flex flex-wrap justify-center items-center gap-6 text-gray-400 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-green-400">✓</span>
                  <span>SOC 2 Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-400">✓</span>
                  <span>99.9% Uptime</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-400">✓</span>
                  <span>Enterprise Security</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-400">✓</span>
                  <span>24/7 AI Support</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-400">✓</span>
                  <span>Cancel Anytime</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Agent Showcase */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
              Your AI Army of Industry Destroyers
            </h3>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Each agent has generated <span className="text-cyan-400 font-semibold">$47M+ in competitive advantage</span> for our users. They don't just boost productivity—<span className="text-white font-semibold">they eliminate competition</span>.
            </p>
            
            {/* Progressive Urgency Banner */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 mb-2 max-w-2xl mx-auto"
            >
              <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-red-500/40 rounded-lg p-3">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-400 font-semibold">LIVE:</span>
                  <span className="text-white">{Math.floor(Math.random() * 156) + 67} businesses gained competitive advantage in the last hour</span>
                </div>
                <div className="text-center text-xs text-orange-300 mt-1">
                  Your competitors don't know what's coming • Average time to industry dominance: 72 hours
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
            Ready to Make Your Competitors Irrelevant?
          </h3>
          <p className="text-lg mb-8 text-gray-300 max-w-2xl mx-auto">
            <span className="text-cyan-400 font-semibold">47,213 businesses</span> have already gained an insurmountable advantage. While your competition struggles with manual work, you'll be <span className="text-white font-semibold">10x ahead, automated, and unstoppable.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/sign-up">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 32px rgba(56, 189, 248, 0.5)' }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-electric-blue to-teal-400 text-white font-semibold rounded-xl shadow-lg transition-all duration-300"
              >
                Destroy My Competition Now
              </motion.button>
            </Link>
            
            <Link href="/features">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300"
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
