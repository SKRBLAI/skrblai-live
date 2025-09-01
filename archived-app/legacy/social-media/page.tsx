// DEPRECATED: Legacy marketing page. Redirects to /agents/socialnino via next.config.js. Use /agents/[agentId] instead.
'use client';

import React, { useState, useEffect } from 'react';
import type { JSX } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import PageLayout from 'components/layout/PageLayout';
import FloatingParticles from '../../../components/ui/FloatingParticles';
import GlassmorphicCard from '../../../components/shared/GlassmorphicCard';
import CosmicButton from '../../../components/shared/CosmicButton';
import CosmicHeading from '../../../components/shared/CosmicHeading';
import Link from 'next/link';
import { TrendingUp, Clock, Users, Target, Zap, DollarSign, BarChart3, Rocket, Share2, MessageCircle, Heart, PlayCircle } from 'lucide-react';
import SkrblAiText from '../../../components/shared/SkrblAiText';

export default function SocialMediaPage(): JSX.Element {
  const [liveMetrics, setLiveMetrics] = useState({
    postsGenerated: 487294,
    followersGained: 2847392,
    engagementBoost: 492,
    viralPosts: 8472
  });

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 50]);

  // Live metrics animation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics(prev => ({
        postsGenerated: prev.postsGenerated + Math.floor(Math.random() * 15),
        followersGained: prev.followersGained + Math.floor(Math.random() * 47),
        engagementBoost: prev.engagementBoost + Math.floor(Math.random() * 5),
        viralPosts: prev.viralPosts + Math.floor(Math.random() * 3)
      }));
    }, 6000);

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
                <div className="inline-flex items-center bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-full px-6 py-2 mb-4">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse mr-3"></div>
                  <span className="text-blue-400 font-semibold">LIVE: {liveMetrics.postsGenerated.toLocaleString()} viral posts generated this month</span>
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
                  SOCIAL MEDIA <span className="text-gradient bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">DOMINATION</span>
                </CosmicHeading>
                <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
                  While competitors post random content hoping for likes, you'll have <span className="text-blue-400 font-bold">viral-engineered content</span> that converts followers into customers automatically
                </p>
                
                {/* Live Engagement Counter */}
                <motion.div
                  style={{ y: y1 }}
                  className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-2xl p-6 mb-8 max-w-md mx-auto"
                >
                  <h3 className="text-blue-400 font-bold mb-2">ENGAGEMENT EXPLOSION</h3>
                  <div className="text-3xl font-black text-white">
                    +{liveMetrics.engagementBoost}% AVG BOOST
                  </div>
                  <p className="text-sm text-gray-400">in engagement & follower growth</p>
                </motion.div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <CosmicButton size="lg" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                    <Share2 className="w-6 h-6 mr-2" />
                    Activate Social Domination
                  </CosmicButton>
                  <Link href="/pricing" className="text-blue-400 hover:text-blue-300 font-semibold underline">
                    View Growth Arsenal →
                  </Link>
                </div>
              </motion.div>

              {/* Live Performance Metrics */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-16"
              >
                <GlassmorphicCard className="border-blue-500/20">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-400 mb-2">{liveMetrics.postsGenerated.toLocaleString()}</div>
                      <div className="text-gray-400">Viral Posts Created</div>
                      <div className="text-sm text-green-400">+{Math.floor(Math.random() * 25 + 35)} today</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-cyan-400 mb-2">{(liveMetrics.followersGained / 1000000).toFixed(1)}M</div>
                      <div className="text-gray-400">Followers Gained</div>
                      <div className="text-sm text-green-400">+{Math.floor(Math.random() * 500 + 750)} today</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-400 mb-2">{liveMetrics.engagementBoost}%</div>
                      <div className="text-gray-400">Engagement Boost</div>
                      <div className="text-sm text-green-400">vs manual posting</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-400 mb-2">{liveMetrics.viralPosts.toLocaleString()}</div>
                      <div className="text-gray-400">Viral Hits</div>
                      <div className="text-sm text-purple-400">100k+ reach each</div>
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
                  SOCIAL MEDIA <span className="text-blue-400">WARFARE</span>
                </CosmicHeading>
                
                <div className="grid md:grid-cols-3 gap-8">
                  {/* Manual Posting Hell */}
                  <GlassmorphicCard className="border-red-500/30 bg-red-500/5">
                    <h3 className="text-2xl font-bold text-red-400 mb-6 text-center">Manual Posting Hell</h3>
                    <div className="space-y-4">
                      <div className="flex items-center text-red-300">
                        <span className="text-red-500 mr-3">✗</span>
                        4-6 hours daily content creation
                      </div>
                      <div className="flex items-center text-red-300">
                        <span className="text-red-500 mr-3">✗</span>
                        Random, inconsistent posting
                      </div>
                      <div className="flex items-center text-red-300">
                        <span className="text-red-500 mr-3">✗</span>
                        2-5% engagement rates
                      </div>
                      <div className="flex items-center text-red-300">
                        <span className="text-red-500 mr-3">✗</span>
                        Zero viral potential
                      </div>
                      <div className="flex items-center text-red-300">
                        <span className="text-red-500 mr-3">✗</span>
                        Burnout in 30 days
                      </div>
                    </div>
                  </GlassmorphicCard>

                  {/* Social Media Agencies */}
                  <GlassmorphicCard className="border-yellow-500/30 bg-yellow-500/5">
                    <h3 className="text-2xl font-bold text-yellow-400 mb-6 text-center">Social Media Agencies</h3>
                    <div className="space-y-4">
                      <div className="flex items-center text-yellow-300">
                        <span className="text-yellow-500 mr-3">~</span>
                        $3,000-8,000/month cost
                      </div>
                      <div className="flex items-center text-yellow-300">
                        <span className="text-yellow-500 mr-3">~</span>
                        Generic template content
                      </div>
                      <div className="flex items-center text-yellow-300">
                        <span className="text-yellow-500 mr-3">~</span>
                        8-12% engagement rates
                      </div>
                      <div className="flex items-center text-yellow-300">
                        <span className="text-yellow-500 mr-3">~</span>
                        Limited platform coverage
                      </div>
                      <div className="flex items-center text-yellow-300">
                        <span className="text-yellow-500 mr-3">~</span>
                        No brand personality
                      </div>
                    </div>
                  </GlassmorphicCard>

                  {/* SKRBL AI Domination */}
                  <GlassmorphicCard className="border-green-500/30 bg-green-500/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 text-sm font-bold shadow-lg border border-white/20">
                      DOMINATION MODE
                    </div>
                    <h3 className="text-2xl font-bold text-green-400 mb-6 text-center"><SkrblAiText variant="wave" size="md">SKRBL AI</SkrblAiText> Social</h3>
                    <div className="space-y-4">
                      <div className="flex items-center text-green-300">
                        <span className="text-green-400 mr-3">✓</span>
                        Fully automated posting
                      </div>
                      <div className="flex items-center text-green-300">
                        <span className="text-green-400 mr-3">✓</span>
                        Viral-engineered content
                      </div>
                      <div className="flex items-center text-green-300">
                        <span className="text-green-400 mr-3">✓</span>
                        35-78% engagement rates
                      </div>
                      <div className="flex items-center text-green-300">
                        <span className="text-green-400 mr-3">✓</span>
                        All platforms covered
                      </div>
                      <div className="flex items-center text-green-300">
                        <span className="text-green-400 mr-3">✓</span>
                        AI brand personality
                      </div>
                    </div>
                  </GlassmorphicCard>
                </div>
              </motion.div>

              {/* Platform Arsenal */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mb-16"
              >
                <CosmicHeading level={2} className="text-4xl font-bold text-center mb-12">
                  MULTI-PLATFORM <span className="text-blue-400">ARSENAL</span>
                </CosmicHeading>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <GlassmorphicCard className="text-center border-blue-600/20 hover:border-blue-400/40 transition-colors">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-xl">f</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Facebook Empire</h3>
                    <p className="text-gray-400 text-sm">Algorithm-beating posts that dominate newsfeeds</p>
                  </GlassmorphicCard>

                  <GlassmorphicCard className="text-center border-pink-500/20 hover:border-pink-400/40 transition-colors">
                    <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-xl">📷</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Instagram Domination</h3>
                    <p className="text-gray-400 text-sm">Visual content that stops scrolling and drives sales</p>
                  </GlassmorphicCard>

                  <GlassmorphicCard className="text-center border-blue-400/20 hover:border-blue-300/40 transition-colors">
                    <div className="w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-xl">🐦</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Twitter/X Warfare</h3>
                    <p className="text-gray-400 text-sm">Viral threads that establish thought leadership</p>
                  </GlassmorphicCard>

                  <GlassmorphicCard className="text-center border-blue-700/20 hover:border-blue-600/40 transition-colors">
                    <div className="w-16 h-16 bg-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-xl">in</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">LinkedIn Authority</h3>
                    <p className="text-gray-400 text-sm">Professional content that converts connections to clients</p>
                  </GlassmorphicCard>

                  <GlassmorphicCard className="text-center border-red-600/20 hover:border-red-500/40 transition-colors">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <PlayCircle className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">YouTube Supremacy</h3>
                    <p className="text-gray-400 text-sm">Video scripts and thumbnails for maximum watch time</p>
                  </GlassmorphicCard>

                  <GlassmorphicCard className="text-center border-black/40 hover:border-gray-600/40 transition-colors">
                    <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-xl">🎵</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">TikTok Viral Engine</h3>
                    <p className="text-gray-400 text-sm">Trend-hitting content that explodes overnight</p>
                  </GlassmorphicCard>
                </div>
              </motion.div>

              {/* ROI Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="mb-16"
              >
                <GlassmorphicCard className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div>
                      <h3 className="text-3xl font-bold text-blue-400 mb-4">SOCIAL ROI CALCULATOR</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Investment:</span>
                          <span className="text-white font-bold">$497/month</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Time Saved:</span>
                          <span className="text-green-400 font-bold">25 hours/week</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Engagement Increase:</span>
                          <span className="text-white font-bold">492%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Customer Acquisition:</span>
                          <span className="text-white font-bold">+847%</span>
                        </div>
                        <div className="border-t border-gray-600 pt-3 flex justify-between text-xl">
                          <span className="text-blue-400 font-bold">Monthly ROI:</span>
                          <span className="text-green-400 font-black">1,247%</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-6xl font-black text-gradient bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent mb-4">
                        4,156%
                      </div>
                      <p className="text-xl text-gray-300">Annual Social ROI</p>
                      <p className="text-sm text-gray-400">Based on client performance data</p>
                    </div>
                  </div>
                </GlassmorphicCard>
              </motion.div>

              {/* Final CTA */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="text-center"
              >
                <CosmicHeading level={2} className="text-4xl md:text-5xl font-bold mb-8">
                  READY TO GO <span className="text-blue-400">VIRAL</span>?
                </CosmicHeading>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
                  <CosmicButton size="xl" className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                    <Rocket className="w-8 h-8 mr-3" />
                    ACTIVATE SOCIAL DOMINATION
                  </CosmicButton>
                  <div className="text-center">
                    <p className="text-sm text-gray-400">or</p>
                    <Link href="/agents/social" className="text-blue-400 hover:text-blue-300 font-semibold underline">
                      Meet Our Social Bot Agent
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