'use client';

import React, { useState, useEffect } from 'react';
import type { JSX } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import PageLayout from 'components/layout/PageLayout';
import FloatingParticles from '@/components/ui/FloatingParticles';
import GlassmorphicCard from '@/components/shared/GlassmorphicCard';
import CosmicButton from '@/components/shared/CosmicButton';
import CosmicHeading from '@/components/shared/CosmicHeading';
import Link from 'next/link';
import { TrendingUp, Clock, Users, Target, Zap, DollarSign, BarChart3, Rocket, BookOpen, PenTool, Share2, Award } from 'lucide-react';
import SkrblAiText from '@/components/shared/SkrblAiText';
import PublishingAssistantPanel from '@/components/book-publishing/PublishingAssistantPanel';

export default function BookPublishingPage(): JSX.Element {
  const [liveMetrics, setLiveMetrics] = useState({
    booksPublished: 2847,
    authorsLaunched: 1623,
    revenueGenerated: 4792341,
    competitorsLeft: 8429
  });

  const [publishingStats] = useState({
    traditionalPublishing: { time: "18-24 months", cost: "$15,000-50,000", success: "2%" },
    manualSelfPublishing: { time: "6-12 months", cost: "$5,000-15,000", success: "8%" },
    skrblPublishing: { time: "7-14 days", cost: "$297-997", success: "94%" }
  });

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -50]);

  // Live metrics animation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics(prev => ({
        booksPublished: prev.booksPublished + Math.floor(Math.random() * 3),
        authorsLaunched: prev.authorsLaunched + Math.floor(Math.random() * 2),
        revenueGenerated: prev.revenueGenerated + Math.floor(Math.random() * 5000),
        competitorsLeft: prev.competitorsLeft - Math.floor(Math.random() * 2)
      }));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <PageLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <div className="relative min-h-screen w-full bg-gradient-to-b from-[#0d1117] to-[#161b22] overflow-x-hidden">
          <FloatingParticles />
          
          {/* Hero Section */}
          <div className="relative z-10 pt-32 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              {/* Live Activity Banner */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 text-center"
              >
                <div className="inline-flex items-center bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full px-6 py-2 mb-4">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-3"></div>
                  <span className="text-green-400 font-semibold">LIVE: {liveMetrics.booksPublished.toLocaleString()} books published this month</span>
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
                  PUBLISHING <span className="text-gradient bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">DOMINATION</span>
                </CosmicHeading>
                <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
                  While others wait 2+ years for traditional publishers, you'll have your book live in <span className="text-orange-400 font-bold">7-14 days</span> and earning revenue immediately
                </p>
                
                {/* Live Revenue Counter */}
                <motion.div
                  style={{ y: y1 }}
                  className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-2xl p-6 mb-8 max-w-md mx-auto"
                >
                  <h3 className="text-orange-400 font-bold mb-2">AUTHORS' REVENUE GENERATED</h3>
                  <div className="text-3xl font-black text-white">
                    ${liveMetrics.revenueGenerated.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-400">...and counting every second</p>
                </motion.div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <CosmicButton size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                    <BookOpen className="w-6 h-6 mr-2" />
                    Launch My Publishing Empire
                  </CosmicButton>
                  <Link href="/pricing" className="text-orange-400 hover:text-orange-300 font-semibold underline">
                    View Domination Pricing →
                  </Link>
                </div>
              </motion.div>

              {/* Live Performance Metrics */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mobile-metrics-container md:grid md:grid-cols-4 gap-4 md:gap-6 mb-12 md:mb-16"
              >
              <GlassmorphicCard variant="floating" className="border-orange-500/20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-orange-400 mb-1 md:mb-2 no-text-cutoff">{liveMetrics.booksPublished.toLocaleString()}</div>
                    <div className="text-sm md:text-base text-gray-400 no-text-cutoff">Books Published</div>
                    <div className="text-xs md:text-sm text-green-400 no-text-cutoff">+{Math.floor(Math.random() * 10 + 15)} today</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-emerald-400 mb-1 md:mb-2 no-text-cutoff">{liveMetrics.authorsLaunched.toLocaleString()}</div>
                    <div className="text-sm md:text-base text-gray-400 no-text-cutoff">Authors Launched</div>
                    <div className="text-xs md:text-sm text-green-400 no-text-cutoff">+{Math.floor(Math.random() * 5 + 8)} today</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-blue-400 mb-1 md:mb-2 no-text-cutoff">7-14</div>
                    <div className="text-sm md:text-base text-gray-400 no-text-cutoff">Days to Launch</div>
                    <div className="text-xs md:text-sm text-blue-400 no-text-cutoff">vs 18+ months traditional</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-red-400 mb-1 md:mb-2 no-text-cutoff">94%</div>
                    <div className="text-sm md:text-base text-gray-400 no-text-cutoff">Success Rate</div>
                    <div className="text-xs md:text-sm text-red-400 no-text-cutoff">vs 2% traditional</div>
                  </div>
                </div>
              </GlassmorphicCard>
              </motion.div>

              {/* Competitive Advantage Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mb-16"
              >
                <CosmicHeading level={2} className="text-4xl md:text-5xl font-bold text-center mb-12">
                  PUBLISHING <span className="text-orange-400">WARFARE</span>
                </CosmicHeading>
                
                <div className="grid md:grid-cols-3 gap-8">
                  {/* Traditional Publishing Hell */}
                  <GlassmorphicCard variant="floating" className="border-red-500/30 bg-red-500/5">
                    <h3 className="text-2xl font-bold text-red-400 mb-6 text-center">Traditional Publishing</h3>
                    <div className="space-y-4">
                      <div className="flex items-center text-red-300">
                        <span className="text-red-500 mr-3">✗</span>
                        18-24 months waiting
                      </div>
                      <div className="flex items-center text-red-300">
                        <span className="text-red-500 mr-3">✗</span>
                        $15,000-50,000 investment
                      </div>
                      <div className="flex items-center text-red-300">
                        <span className="text-red-500 mr-3">✗</span>
                        2% acceptance rate
                      </div>
                      <div className="flex items-center text-red-300">
                        <span className="text-red-500 mr-3">✗</span>
                        No creative control
                      </div>
                      <div className="flex items-center text-red-300">
                        <span className="text-red-500 mr-3">✗</span>
                        8-15% royalties only
                      </div>
                    </div>
                  </GlassmorphicCard>

                  {/* Manual Self-Publishing Struggle */}
                  <GlassmorphicCard variant="floating" className="border-yellow-500/30 bg-yellow-500/5">
                    <h3 className="text-2xl font-bold text-yellow-400 mb-6 text-center">Manual Self-Publishing</h3>
                    <div className="space-y-4">
                      <div className="flex items-center text-yellow-300">
                        <span className="text-yellow-500 mr-3">~</span>
                        6-12 months of work
                      </div>
                      <div className="flex items-center text-yellow-300">
                        <span className="text-yellow-500 mr-3">~</span>
                        $5,000-15,000 costs
                      </div>
                      <div className="flex items-center text-yellow-300">
                        <span className="text-yellow-500 mr-3">~</span>
                        8% actually succeed
                      </div>
                      <div className="flex items-center text-yellow-300">
                        <span className="text-yellow-500 mr-3">~</span>
                        Manual everything
                      </div>
                      <div className="flex items-center text-yellow-300">
                        <span className="text-yellow-500 mr-3">~</span>
                        Zero marketing help
                      </div>
                    </div>
                  </GlassmorphicCard>

                  {/* SKRBL AI Domination */}
                  <GlassmorphicCard variant="floating" className="border-green-500/30 bg-green-500/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 text-sm font-bold shadow-lg border border-white/20">
                      DOMINATION MODE
                    </div>
                    <h3 className="text-2xl font-bold text-green-400 mb-6 text-center"><SkrblAiText variant="pulse" size="md">SKRBL AI</SkrblAiText> Publishing</h3>
                    <div className="space-y-4">
                      <div className="flex items-center text-green-300">
                        <span className="text-green-400 mr-3">✓</span>
                        7-14 days to market
                      </div>
                      <div className="flex items-center text-green-300">
                        <span className="text-green-400 mr-3">✓</span>
                        $297-997 total cost
                      </div>
                      <div className="flex items-center text-green-300">
                        <span className="text-green-400 mr-3">✓</span>
                        94% success rate
                      </div>
                      <div className="flex items-center text-green-300">
                        <span className="text-green-400 mr-3">✓</span>
                        100% creative control
                      </div>
                      <div className="flex items-center text-green-300">
                        <span className="text-green-400 mr-3">✓</span>
                        70% royalties + marketing
                      </div>
                    </div>
                  </GlassmorphicCard>
                </div>
              </motion.div>

              {/* ROI Calculation */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mb-16"
              >
                <GlassmorphicCard variant="floating" className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <h3 className="text-3xl font-bold text-orange-400 mb-4">ROI CALCULATION</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Investment:</span>
                          <span className="text-white font-bold">$997</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Time to Market:</span>
                          <span className="text-green-400 font-bold">14 days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Average Book Revenue/Month:</span>
                          <span className="text-white font-bold">$2,847</span>
                        </div>
                        <div className="border-t border-gray-600 pt-3 flex justify-between text-xl">
                          <span className="text-orange-400 font-bold">ROI in 30 days:</span>
                          <span className="text-green-400 font-black">285%</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-6xl font-black text-gradient bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent mb-4">
                        5,234%
                      </div>
                      <p className="text-xl text-gray-300">Annual ROI</p>
                      <p className="text-sm text-gray-400">Based on average author performance</p>
                    </div>
                  </div>
                </GlassmorphicCard>
              </motion.div>

              {/* Interactive Publishing Assistant Panel */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85 }}
                className="mb-16"
              >
                <PublishingAssistantPanel className="max-w-5xl mx-auto" />
              </motion.div>

              {/* Urgency Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="text-center mb-16"
              >
                <GlassmorphicCard variant="floating" className="border-red-500/30 bg-red-500/5">
                  <h3 className="text-2xl font-bold text-red-400 mb-4">⚠️ COMPETITIVE REALITY CHECK</h3>
                  <p className="text-xl text-gray-300 mb-6">
                    Every day you wait, <span className="text-red-400 font-bold">{Math.floor(Math.random() * 15 + 25)} more authors</span> launch their books and capture market share in your niche.
                  </p>
                  <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-lg p-4 mb-6">
                    <p className="text-orange-400 font-semibold">
                      "I waited 6 months to start my book project. By the time I launched, 3 competitors had already dominated my keywords." 
                      <span className="block text-sm text-gray-400 mt-2">- Former Traditional Publishing Victim</span>
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <CosmicButton size="lg" className="bg-gradient-to-r from-red-500 to-orange-500">
                      <Rocket className="w-6 h-6 mr-2" />
                      Secure My Market Position NOW
                    </CosmicButton>
                    <Link href="/contact" className="inline-flex items-center justify-center px-6 py-3 border border-gray-600 rounded-lg text-gray-300 hover:text-white hover:border-gray-500 transition-colors">
                      <Clock className="w-5 h-5 mr-2" />
                      Book Strategy Call
                    </Link>
                  </div>
                </GlassmorphicCard>
              </motion.div>

              {/* Success Stories */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="mb-16"
              >
                <CosmicHeading level={2} className="text-4xl font-bold text-center mb-12">
                  SUCCESS <span className="text-orange-400">STORIES</span>
                </CosmicHeading>
                
                <div className="grid md:grid-cols-3 gap-8">
                  <GlassmorphicCard variant="floating">
                    <div className="flex items-center mb-4">
                      <Award className="w-8 h-8 text-yellow-400 mr-3" />
                      <div>
                        <h4 className="font-bold text-white">Sarah M.</h4>
                        <p className="text-sm text-gray-400">Business Coach</p>
                      </div>
                    </div>
                    <p className="text-gray-300 mb-4">"$47,000 in book sales in my first 3 months. <SkrblAiText variant="glow" size="sm">SKRBL AI</SkrblAiText> handled everything - editing, cover design, marketing. I just focused on my expertise."</p>
                    <div className="text-sm">
                      <span className="text-green-400">📈 Revenue: $47,000</span><br/>
                      <span className="text-blue-400">⏱️ Time to Market: 9 days</span>
                    </div>
                  </GlassmorphicCard>

                  <GlassmorphicCard variant="floating">
                    <div className="flex items-center mb-4">
                      <Award className="w-8 h-8 text-yellow-400 mr-3" />
                      <div>
                        <h4 className="font-bold text-white">Marcus T.</h4>
                        <p className="text-sm text-gray-400">Tech Entrepreneur</p>
                      </div>
                    </div>
                    <p className="text-gray-300 mb-4">"Hit Amazon #1 bestseller in my category within 2 weeks. The AI marketing strategy was incredible - I couldn't have done this alone."</p>
                    <div className="text-sm">
                      <span className="text-orange-400">🏆 Amazon #1 Bestseller</span><br/>
                      <span className="text-purple-400">📚 3 books published since</span>
                    </div>
                  </GlassmorphicCard>

                  <GlassmorphicCard variant="floating">
                    <div className="flex items-center mb-4">
                      <Award className="w-8 h-8 text-yellow-400 mr-3" />
                      <div>
                        <h4 className="font-bold text-white">Jennifer L.</h4>
                        <p className="text-sm text-gray-400">Health Expert</p>
                      </div>
                    </div>
                    <p className="text-gray-300 mb-4">"From manuscript to published author in 11 days. The book became my best lead magnet - doubled my coaching business immediately."</p>
                    <div className="text-sm">
                      <span className="text-cyan-400">💼 Business Doubled</span><br/>
                      <span className="text-green-400">🎯 Premium Lead Magnet</span>
                    </div>
                  </GlassmorphicCard>
                </div>
              </motion.div>

              {/* Final CTA */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
                className="text-center"
              >
                <CosmicHeading level={2} className="text-4xl md:text-5xl font-bold mb-8">
                  READY TO <span className="text-orange-400">DOMINATE</span>?
                </CosmicHeading>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
                  <CosmicButton size="xl" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                    <BookOpen className="w-8 h-8 mr-3" />
                    ACTIVATE PUBLISHING DOMINATION
                  </CosmicButton>
                  <div className="text-center">
                    <p className="text-sm text-gray-400">or</p>
                    <Link href="/services/publishing" className="text-orange-400 hover:text-orange-300 font-semibold underline">
                      Learn About Our Publishing Agent
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
          </div>
        </div>
      </motion.div>
    </PageLayout>
  );
}
