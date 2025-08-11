'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../components/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import PercyWrapper from '../components/percy/PercyWrapper';
import NavBar from '../components/layout/Navbar';
import { useOnboarding } from '../contexts/OnboardingContext';
import AgentsGrid from '../components/agents/AgentsGrid';
import EmpowermentBanner from '../components/ui/EmpowermentBanner';
import CosmicStarfield from '../components/background/CosmicStarfield';
import { Pseudo3DFeature } from '../components/shared/Pseudo3DCard';
import toast from 'react-hot-toast';
import { FEATURE_FLAGS } from '../lib/config/featureFlags';
import SplitHero from '../components/home/SplitHero';
import Hero from '../components/home/Hero';
import Spotlight from '../components/home/Spotlight';

export default function HomePage() {
  const router = useRouter();
  const { setTrack, setCurrentStep } = useOnboarding();
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const { user, session, isLoading, isEmailVerified } = useAuth();

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

  // Check if we should use the new dual action homepage
  const useDualActionHomepage = FEATURE_FLAGS.AI_AUTOMATION_HOMEPAGE;

  return (
    <div className="min-h-screen relative text-white overflow-x-hidden">
      {/* Cosmic Starfield Background */}
      <CosmicStarfield 
        starCount={120}
        parallax={true}
        speed={0.8}
        optimized={true}
        className="fixed inset-0"
      />
      
      <div className="relative z-10 w-full">
        <NavBar />
        
        {useDualActionHomepage ? (
          <>
            {/* New Dual Action Homepage */}
            <SplitHero />
            
            {/* Single Percy Onboarding Section */}
            <div id="onboarding" className="w-full max-w-4xl mx-auto px-4 mt-8">
              <PercyWrapper 
                onAnalysisComplete={(results) => console.log('Percy analysis:', results)}
                onAgentSelection={(agentId) => console.log('Agent selected:', agentId)}
              />
            </div>

            {/* Clean Single CTA Section */}
            <section className="mx-auto max-w-6xl px-4 md:px-6 py-16 text-white">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  onClick={() => {
                    const el = document.getElementById('onboarding');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('homepage_cta_click', { detail: { where: 'scan' } }));
                    }
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-2xl px-8 py-4 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 transition-all duration-300 font-semibold shadow-2xl"
                >
                  🚀 Start My Free Scan
                </motion.button>
                <motion.a 
                  href="/pricing" 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-2xl px-8 py-4 border border-white/15 bg-white/5 backdrop-blur-xl text-center hover:border-white/25 hover:bg-white/10 transition-all duration-300 font-semibold"
                >
                  See Pricing & ROI
                </motion.a>
              </div>
            </section>
          </>
        ) : (
          <>
            {/* Legacy Homepage */}
            <div className="container mx-auto px-4">
              <PercyWrapper 
                className="mb-8"
                onAnalysisComplete={(results) => console.log('Percy analysis complete:', results)}
                onAgentSelection={(agentId) => console.log('Agent selected:', agentId)}
              />
              <Hero />
              <Spotlight />
              <AgentsGrid />
              <div className="relative max-w-5xl mx-auto p-6 flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push('/pricing')}
                  className="px-6 py-3 bg-transparent backdrop-blur-xl border-2 border-teal-400/30 text-white rounded-lg hover:border-teal-400/50 transition-all"
                >
                  See Pricing & ROI
                </button>
              </div>
            </div>
          </>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-2 border-purple-400 border-b-transparent animate-spin"></div>
              </div>
              <p className="text-lg text-gray-300 animate-pulse">Initializing AI systems...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
