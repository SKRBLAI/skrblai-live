// DEPRECATED: Legacy marketing page. Redirects to /services/branding via next.config.js. Use /services/[agentId] instead.
'use client';

import React, { useState, useEffect } from 'react';
import type { JSX } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import PageLayout from 'components/layout/PageLayout';
import GlassmorphicCard from '../../../components/shared/GlassmorphicCard';
import CosmicButton from '../../../components/shared/CosmicButton';
import CosmicHeading from '../../../components/shared/CosmicHeading';
import Link from 'next/link';
import { TrendingUp, Clock, Users, Target, Zap, DollarSign, BarChart3, Rocket, Palette, Eye, Star, Crown } from 'lucide-react';
import SkrblAiText from '../../../components/shared/SkrblAiText';

export default function BrandingPage(): JSX.Element {
  const [liveMetrics, setLiveMetrics] = useState({
    brandsTransformed: 3942,
    revenueGenerated: 8473291,
    brandRecognition: 347,
    competitorsDestroyed: 2847
  });

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 50]);

  // Live metrics animation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics(prev => ({
        brandsTransformed: prev.brandsTransformed + Math.floor(Math.random() * 4),
        revenueGenerated: prev.revenueGenerated + Math.floor(Math.random() * 7500),
        brandRecognition: prev.brandRecognition + Math.floor(Math.random() * 3),
        competitorsDestroyed: prev.competitorsDestroyed + Math.floor(Math.random() * 2)
      }));
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  return (
    <PageLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <div className="space-y-16">
          
          {/* Hero Section */}
          <div className="pt-12">
            
            {/* Live Activity Banner */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 text-center"
            >
              <div className="inline-flex items-center bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full px-6 py-2 mb-4">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse mr-3"></div>
                <span className="text-purple-400 font-semibold">LIVE: {liveMetrics.brandsTransformed.toLocaleString()} brands transformed this quarter</span>
              </div>
            </motion.div>

            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-16"
            >
              <CosmicHeading level={1} className="text-5xl md:text-7xl font-black mb-6">
                BRAND <span className="text-gradient bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">DOMINATION</span>
              </CosmicHeading>
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
                While competitors spend months and tens of thousands on generic branding, you'll have a <span className="text-purple-400 font-bold">market-dominating brand identity</span> in 48-72 hours
              </p>
              
              {/* Live Brand Impact Counter */}
              <motion.div
                style={{ y: y1 }}
                className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-6 mb-8 max-w-md mx-auto"
              >
                <h3 className="text-purple-400 font-bold mb-2">BRAND IMPACT GENERATED</h3>
                <div className="text-3xl font-black text-white">
                  {liveMetrics.brandRecognition}% AVG INCREASE
                </div>
                <p className="text-sm text-gray-400">in brand recognition & revenue</p>
              </motion.div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <CosmicButton size="lg" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  <Palette className="w-6 h-6 mr-2" />
                  Activate Brand Domination
                </CosmicButton>
                <Link href="/pricing" className="text-purple-400 hover:text-purple-300 font-semibold underline">
                  View Branding Arsenal →
                </Link>
              </div>
            </motion.div>

            {/* Live Performance Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              <GlassmorphicCard className="p-6 text-center border-purple-500/20">
                <div className="text-3xl font-bold text-purple-400 mb-2">{liveMetrics.brandsTransformed.toLocaleString()}</div>
                <div className="text-gray-400">Brands Transformed</div>
                <div className="text-sm text-green-400">+{Math.floor(Math.random() * 8 + 12)} today</div>
              </GlassmorphicCard>
              
              <GlassmorphicCard className="p-6 text-center border-pink-500/20">
                <div className="text-3xl font-bold text-pink-400 mb-2">${(liveMetrics.revenueGenerated / 1000000).toFixed(1)}M</div>
                <div className="text-gray-400">Revenue Generated</div>
                <div className="text-sm text-green-400">+$47k today</div>
              </GlassmorphicCard>
              
              <GlassmorphicCard className="p-6 text-center border-blue-500/20">
                <div className="text-3xl font-bold text-blue-400 mb-2">48-72</div>
                <div className="text-gray-400">Hours to Launch</div>
                <div className="text-sm text-blue-400">vs 3-6 months DIY</div>
              </GlassmorphicCard>
              
              <GlassmorphicCard className="p-6 text-center border-orange-500/20">
                <div className="text-3xl font-bold text-orange-400 mb-2">287%</div>
                <div className="text-gray-400">Avg ROI Increase</div>
                <div className="text-sm text-orange-400">vs generic brands</div>
              </GlassmorphicCard>
            </motion.div>
          </div>

          {/* Competitive Advantage Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <CosmicHeading level={2} className="text-4xl md:text-5xl font-bold text-center mb-12">
              BRANDING <span className="text-purple-400">WARFARE</span>
            </CosmicHeading>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* DIY Branding Hell */}
              <GlassmorphicCard className="p-8 border-red-500/30 bg-red-500/5">
                <h3 className="text-2xl font-bold text-red-400 mb-6 text-center">DIY Branding Disaster</h3>
                <div className="space-y-4">
                  <div className="flex items-center text-red-300">
                    <span className="text-red-500 mr-3">✗</span>
                    3-6 months of struggle
                  </div>
                  <div className="flex items-center text-red-300">
                    <span className="text-red-500 mr-3">✗</span>
                    $8,000-25,000 wasted
                  </div>
                  <div className="flex items-center text-red-300">
                    <span className="text-red-500 mr-3">✗</span>
                    Generic, forgettable results
                  </div>
                  <div className="flex items-center text-red-300">
                    <span className="text-red-500 mr-3">✗</span>
                    No market research
                  </div>
                  <div className="flex items-center text-red-300">
                    <span className="text-red-500 mr-3">✗</span>
                    12% brand recognition
                  </div>
                </div>
              </GlassmorphicCard>

              {/* Agency Branding Overpay */}
              <GlassmorphicCard className="p-8 border-yellow-500/30 bg-yellow-500/5">
                <h3 className="text-2xl font-bold text-yellow-400 mb-6 text-center">Traditional Agency</h3>
                <div className="space-y-4">
                  <div className="flex items-center text-yellow-300">
                    <span className="text-yellow-500 mr-3">~</span>
                    2-4 months waiting
                  </div>
                  <div className="flex items-center text-yellow-300">
                    <span className="text-yellow-500 mr-3">~</span>
                    $25,000-75,000 cost
                  </div>
                  <div className="flex items-center text-yellow-300">
                    <span className="text-yellow-500 mr-3">~</span>
                    Template-based approach
                  </div>
                  <div className="flex items-center text-yellow-300">
                    <span className="text-yellow-500 mr-3">~</span>
                    Limited revisions
                  </div>
                  <div className="flex items-center text-yellow-300">
                    <span className="text-yellow-500 mr-3">~</span>
                    34% brand recognition
                  </div>
                </div>
              </GlassmorphicCard>

              {/* SKRBL AI Domination */}
              <GlassmorphicCard className="p-8 border-green-500/30 bg-green-500/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 text-sm font-bold shadow-lg border border-white/20">
                  DOMINATION MODE
                </div>
                <h3 className="text-2xl font-bold text-green-400 mb-6 text-center"><SkrblAiText variant="glow" size="md">SKRBL AI</SkrblAiText> Branding</h3>
                <div className="space-y-4">
                  <div className="flex items-center text-green-300">
                    <span className="text-green-400 mr-3">✓</span>
                    48-72 hours delivery
                  </div>
                  <div className="flex items-center text-green-300">
                    <span className="text-green-400 mr-3">✓</span>
                    $497-1,997 investment
                  </div>
                  <div className="flex items-center text-green-300">
                    <span className="text-green-400 mr-3">✓</span>
                    AI-powered uniqueness
                  </div>
                  <div className="flex items-center text-green-300">
                    <span className="text-green-400 mr-3">✓</span>
                    Unlimited iterations
                  </div>
                  <div className="flex items-center text-green-300">
                    <span className="text-green-400 mr-3">✓</span>
                    287% brand recognition
                  </div>
                </div>
              </GlassmorphicCard>
            </div>
          </motion.div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6 }}
            className="text-center"
          >
            <CosmicHeading level={2} className="text-4xl md:text-5xl font-bold mb-8">
              READY TO <span className="text-purple-400">DOMINATE</span>?
            </CosmicHeading>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
              <CosmicButton size="xl" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                <Crown className="w-8 h-8 mr-3" />
                ACTIVATE BRAND DOMINATION
              </CosmicButton>
              <div className="text-center">
                <p className="text-sm text-gray-400">or</p>
                <Link href="/agents/branding" className="text-purple-400 hover:text-purple-300 font-semibold underline">
                  Meet Our Branding Agent
                </Link>
              </div>
            </div>

            <div className="flex flex-row gap-4 justify-center">
              <Link href="/">
                <button className="cosmic-btn-secondary px-5 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-fuchsia-500 shadow-cosmic">
                  ← Back to Home
                </button>
              </Link>
              <Link href="/features">
                <button className="cosmic-btn-secondary px-5 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-cyan-400 to-teal-400 shadow-cosmic">
                  View All Features
                </button>
              </Link>
            </div>
          </motion.div>

        </div>
      </motion.div>
    </PageLayout>
  );
} 