'use client';

import React, { useState, useEffect } from 'react';
import type { JSX } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import PageLayout from 'components/layout/PageLayout';
import FloatingParticles from '@/components/ui/FloatingParticles';
import GlassmorphicCard from '@/components/shared/GlassmorphicCard';
import CosmicButton from '@/components/shared/CosmicButton';
import CosmicHeading from '@/components/shared/CosmicHeading';
import WorkflowLaunchButton from '@/components/agents/WorkflowLaunchButton';
import Link from 'next/link';
import { Trophy, Zap, Target, TrendingUp, Clock, Users, BarChart3, Heart, Shield, Brain, Dumbbell, Timer, Star } from 'lucide-react';
import SkrblAiText from '@/components/shared/SkrblAiText';

export default function SportsPage(): JSX.Element {
  const [liveMetrics, setLiveMetrics] = useState({
    athletesTransformed: 12847,
    performanceImprovement: 73,
    injuriesPrevented: 2156,
    recordsBroken: 847
  });

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 50]);

  // Live metrics animation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics(prev => ({
        athletesTransformed: prev.athletesTransformed + Math.floor(Math.random() * 3),
        performanceImprovement: Math.min(99, prev.performanceImprovement + Math.floor(Math.random() * 2)),
        injuriesPrevented: prev.injuriesPrevented + Math.floor(Math.random() * 2),
        recordsBroken: prev.recordsBroken + Math.floor(Math.random() * 1)
      }));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const quickWins = [
    {
      icon: <Target className="w-8 h-8" />,
      title: "Performance Analysis",
      description: "AI-powered assessment of your current athletic performance",
      time: "15 minutes",
      price: "FREE",
      color: "from-blue-500 to-cyan-500",
      benefits: ["Strength assessment", "Speed analysis", "Endurance metrics"]
    },
    {
      icon: <Dumbbell className="w-8 h-8" />,
      title: "Custom Training Plan",
      description: "Personalized workout program designed for your goals",
      time: "30 minutes",
      price: "$67",
      color: "from-orange-500 to-red-500",
      benefits: ["Goal-specific routines", "Progressive overload", "Recovery planning"]
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Nutrition Blueprint",
      description: "Optimized meal plans for peak athletic performance",
      time: "20 minutes",
      price: "$47",
      color: "from-green-500 to-emerald-500",
      benefits: ["Macro optimization", "Timing strategies", "Supplement guide"]
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Injury Prevention",
      description: "Proactive strategies to keep you in the game",
      time: "25 minutes",
      price: "$57",
      color: "from-purple-500 to-pink-500",
      benefits: ["Risk assessment", "Mobility routines", "Strength imbalances"]
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Mental Edge Coaching",
      description: "Sports psychology for peak mental performance",
      time: "35 minutes",
      price: "$77",
      color: "from-indigo-500 to-purple-500",
      benefits: ["Confidence building", "Focus techniques", "Pressure management"]
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Progress Tracking",
      description: "Advanced analytics to monitor your athletic journey",
      time: "10 minutes",
      price: "$37",
      color: "from-teal-500 to-blue-500",
      benefits: ["Performance metrics", "Goal tracking", "Trend analysis"]
    }
  ];

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
                <div className="inline-flex items-center bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-full px-6 py-2 mb-4">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse mr-3"></div>
                  <span className="text-orange-400 font-semibold">LIVE: {liveMetrics.athletesTransformed.toLocaleString()} athletes training with AI this month</span>
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
                  FORGE YOUR <span className="text-gradient bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">VICTORY</span>
                </CosmicHeading>
                <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
                  Meet <span className="text-orange-400 font-bold">Skill Smith</span>, your AI sports performance forger. Get professional-grade training, nutrition, and coaching in minutes, not months.
                </p>
                
                {/* Performance Impact Counter */}
                <motion.div
                  style={{ y: y1 }}
                  className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-2xl p-6 mb-8 max-w-md mx-auto"
                >
                  <h3 className="text-orange-400 font-bold mb-2">PERFORMANCE IMPROVEMENT</h3>
                  <div className="text-3xl font-black text-white">
                    {liveMetrics.performanceImprovement}% AVERAGE
                  </div>
                  <p className="text-sm text-gray-400">in athletic performance within 30 days</p>
                </motion.div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <WorkflowLaunchButton
                    agentId="skillsmith"
                    agentName="Skill Smith"
                    superheroName="Skill Smith the Sports Performance Forger"
                    hasWorkflow={true}
                    requiresPremium={false}
                    workflowCapabilities={['performance_analysis', 'training_programs', 'nutrition_planning', 'injury_prevention', 'mental_coaching']}
                    variant="primary"
                    size="lg"
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    initialPrompt="I want to optimize my athletic performance. Please analyze my current fitness level and create a personalized training and nutrition plan."
                  />
                  <Link href="/services/skillsmith" className="text-orange-400 hover:text-orange-300 font-semibold underline">
                    Meet Skill Smith →
                  </Link>
                </div>
              </motion.div>

              {/* Live Performance Metrics */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
              >
                <GlassmorphicCard className="p-6 text-center border-orange-500/20">
                  <div className="text-3xl font-bold text-orange-400 mb-2">{liveMetrics.athletesTransformed.toLocaleString()}</div>
                  <div className="text-gray-400">Athletes Transformed</div>
                  <div className="text-sm text-green-400">+{Math.floor(Math.random() * 12 + 8)} today</div>
                </GlassmorphicCard>
                
                <GlassmorphicCard className="p-6 text-center border-red-500/20">
                  <div className="text-3xl font-bold text-red-400 mb-2">{liveMetrics.performanceImprovement}%</div>
                  <div className="text-gray-400">Performance Boost</div>
                  <div className="text-sm text-green-400">avg in 30 days</div>
                </GlassmorphicCard>
                
                <GlassmorphicCard className="p-6 text-center border-blue-500/20">
                  <div className="text-3xl font-bold text-blue-400 mb-2">{liveMetrics.injuriesPrevented.toLocaleString()}</div>
                  <div className="text-gray-400">Injuries Prevented</div>
                  <div className="text-sm text-blue-400">with AI analysis</div>
                </GlassmorphicCard>
                
                <GlassmorphicCard className="p-6 text-center border-yellow-500/20">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">{liveMetrics.recordsBroken}</div>
                  <div className="text-gray-400">Personal Records</div>
                  <div className="text-sm text-yellow-400">broken this month</div>
                </GlassmorphicCard>
              </motion.div>

              {/* Quick Wins Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mb-16"
              >
                <CosmicHeading level={2} className="text-4xl md:text-5xl font-bold text-center mb-12">
                  QUICK <span className="text-orange-400">WINS</span>
                </CosmicHeading>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {quickWins.map((win, index) => (
                    <motion.div
                      key={win.title}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                    >
                      <GlassmorphicCard className={`p-6 border-2 border-transparent bg-gradient-to-br ${win.color} bg-opacity-10 hover:bg-opacity-20 transition-all duration-300 cursor-pointer group`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className={`p-3 rounded-xl bg-gradient-to-br ${win.color}`}>
                            {win.icon}
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-white">{win.price}</div>
                            <div className="text-sm text-gray-400">{win.time}</div>
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-bold text-white mb-2">{win.title}</h3>
                        <p className="text-gray-300 mb-4">{win.description}</p>
                        
                        <div className="space-y-2 mb-4">
                          {win.benefits.map((benefit, idx) => (
                            <div key={idx} className="flex items-center text-sm text-gray-400">
                              <Star className="w-3 h-3 text-yellow-400 mr-2" />
                              {benefit}
                            </div>
                          ))}
                        </div>
                        
                        <WorkflowLaunchButton
                          agentId="skillsmith"
                          agentName="Skill Smith"
                          superheroName="Skill Smith the Sports Performance Forger"
                          hasWorkflow={true}
                          requiresPremium={win.price !== "FREE"}
                          workflowCapabilities={[win.title.toLowerCase().replace(/\s+/g, '_')]}
                          variant="primary"
                          size="sm"
                          className={`w-full bg-gradient-to-r ${win.color} group-hover:scale-105 transition-transform`}
                          initialPrompt={`I need help with ${win.title.toLowerCase()}: ${win.description}`}
                          requiredTier={win.price === "FREE" ? "starter" : "star"}
                        />
                      </GlassmorphicCard>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Upload Integration Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="mb-16"
              >
                <GlassmorphicCard className="p-8 border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-red-500/10">
                  <div className="text-center">
                    <Trophy className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                    <h3 className="text-3xl font-bold text-white mb-4">Upload Your Training Data</h3>
                    <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                      Got existing workout logs, nutrition data, or performance metrics? Upload them and let Skill Smith create a personalized optimization plan in minutes.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <Link href="/sports/upload">
                        <CosmicButton size="lg" className="bg-gradient-to-r from-orange-500 to-red-500">
                          <Target className="w-6 h-6 mr-2" />
                          Upload Training Data
                        </CosmicButton>
                      </Link>
                      <div className="text-sm text-gray-400">
                        Supports: CSV, PDF, Images, Videos
                      </div>
                    </div>
                  </div>
                </GlassmorphicCard>
              </motion.div>

              {/* Competitive Edge Section */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
                className="mb-16"
              >
                <CosmicHeading level={2} className="text-4xl md:text-5xl font-bold text-center mb-12">
                  YOUR <span className="text-orange-400">COMPETITIVE EDGE</span>
                </CosmicHeading>
                
                <div className="grid md:grid-cols-3 gap-8">
                  {/* Traditional Training */}
                  <GlassmorphicCard className="p-8 border-red-500/30 bg-red-500/5">
                    <h3 className="text-2xl font-bold text-red-400 mb-6 text-center">Traditional Training</h3>
                    <div className="space-y-4">
                      <div className="flex items-center text-red-300">
                        <span className="text-red-500 mr-3">✗</span>
                        Generic workout plans
                      </div>
                      <div className="flex items-center text-red-300">
                        <span className="text-red-500 mr-3">✗</span>
                        Slow progress tracking
                      </div>
                      <div className="flex items-center text-red-300">
                        <span className="text-red-500 mr-3">✗</span>
                        High injury risk
                      </div>
                      <div className="flex items-center text-red-300">
                        <span className="text-red-500 mr-3">✗</span>
                        $200-500/month coaching
                      </div>
                    </div>
                  </GlassmorphicCard>

                  {/* Personal Trainer */}
                  <GlassmorphicCard className="p-8 border-yellow-500/30 bg-yellow-500/5">
                    <h3 className="text-2xl font-bold text-yellow-400 mb-6 text-center">Personal Trainer</h3>
                    <div className="space-y-4">
                      <div className="flex items-center text-yellow-300">
                        <span className="text-yellow-500 mr-3">~</span>
                        Limited availability
                      </div>
                      <div className="flex items-center text-yellow-300">
                        <span className="text-yellow-500 mr-3">~</span>
                        $80-150/session
                      </div>
                      <div className="flex items-center text-yellow-300">
                        <span className="text-yellow-500 mr-3">~</span>
                        Experience varies
                      </div>
                      <div className="flex items-center text-yellow-300">
                        <span className="text-yellow-500 mr-3">~</span>
                        Basic tracking
                      </div>
                    </div>
                  </GlassmorphicCard>

                  {/* Skill Smith AI */}
                  <GlassmorphicCard className="p-8 border-green-500/30 bg-green-500/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-orange-500 text-white px-3 py-1 text-sm font-bold shadow-lg">
                      AI POWERED
                    </div>
                    <h3 className="text-2xl font-bold text-green-400 mb-6 text-center">
                      <SkrblAiText variant="glow" size="md">Skill Smith</SkrblAiText> AI
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center text-green-300">
                        <span className="text-green-400 mr-3">✓</span>
                        Personalized optimization
                      </div>
                      <div className="flex items-center text-green-300">
                        <span className="text-green-400 mr-3">✓</span>
                        24/7 availability
                      </div>
                      <div className="flex items-center text-green-300">
                        <span className="text-green-400 mr-3">✓</span>
                        Advanced analytics
                      </div>
                      <div className="flex items-center text-green-300">
                        <span className="text-green-400 mr-3">✓</span>
                        $47-77 one-time
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
                  READY TO <span className="text-orange-400">DOMINATE</span>?
                </CosmicHeading>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
                  <WorkflowLaunchButton
                    agentId="skillsmith"
                    agentName="Skill Smith"
                    superheroName="Skill Smith the Sports Performance Forger"
                    hasWorkflow={true}
                    requiresPremium={false}
                    workflowCapabilities={['performance_analysis', 'training_programs', 'nutrition_planning', 'injury_prevention', 'mental_coaching']}
                    variant="primary"
                    size="xl"
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    initialPrompt="I'm ready to dominate my sport! Help me create a comprehensive performance optimization plan including training, nutrition, and mental coaching."
                  />
                  <div className="text-center">
                    <p className="text-sm text-gray-400">or</p>
                    <Link href="/services/skillsmith" className="text-orange-400 hover:text-orange-300 font-semibold underline">
                      Explore All Sports Features
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