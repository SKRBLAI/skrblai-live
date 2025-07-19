'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClientPageLayout from '@/components/layout/ClientPageLayout';
import GlassmorphicCard from '@/components/shared/GlassmorphicCard';
import Pseudo3DCard, { Pseudo3DHero, Pseudo3DFeature, Pseudo3DStats } from '@/components/shared/Pseudo3DCard';
import CosmicButton from '@/components/shared/CosmicButton';
import CosmicHeading from '@/components/shared/CosmicHeading';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, Palette, FilePenLine, Megaphone, BarChart2, LayoutDashboard, Users, TrendingUp, Zap, Crown, DollarSign, Clock } from 'lucide-react';
import SkrblAiText from '@/components/shared/SkrblAiText';

// Business Problem-Focused Services
const businessSolutions = [
  {
    problem: "Revenue Stalling",
    subheading: "Break through growth plateaus",
    description: "AI powered analytics and marketing automation that identifies hidden revenue opportunities and converts them into profit.",
    agents: ['analytics', 'adcreative', 'social'],
    icon: <TrendingUp className="w-8 h-8" />,
    metrics: { successRate: 94, avgIncrease: "127%", timeToResults: "14 days" },
    href: '/analytics',
    primaryColor: 'from-green-600 to-emerald-500',
    liveActivity: { users: 47, status: "🔥 Hot" }
  },
  {
    problem: "Brand Confusion", 
    subheading: "Customers dont get your brand",
    description: "Complete brand identity transformation with AI powered logo design, voice development, and positioning strategy.",
    agents: ['branding', 'contentcreation', 'book-publishing'],
    icon: <Palette className="w-8 h-8" />,
    metrics: { successRate: 89, avgIncrease: "156%", timeToResults: "21 days" },
    href: '/branding',
    primaryColor: 'from-purple-600 to-pink-500',
    liveActivity: { users: 33, status: "🎯 Trending" }
  },
  {
    problem: "Manual Overwhelm",
    subheading: "Drowning in repetitive tasks",
    description: "Complete workflow automation that handles your busywork while you focus on strategy and growth.",
    agents: ['sync', 'biz', 'percy'],
    icon: <Zap className="w-8 h-8" />,
    metrics: { successRate: 96, avgIncrease: "234%", timeToResults: "7 days" },
    href: '/content-automation',
    primaryColor: 'from-blue-600 to-cyan-500',
    liveActivity: { users: 61, status: "⚡ Active" }
  },
  {
    problem: "Content Drought",
    subheading: "Running out of content ideas",
    description: "AI powered content engine that creates unlimited engaging content across all platforms and formats.",
    agents: ['contentcreation', 'social', 'videocontent'],
    icon: <FilePenLine className="w-8 h-8" />,
    metrics: { successRate: 92, avgIncrease: "189%", timeToResults: "10 days" },
    href: '/content-automation',
    primaryColor: 'from-orange-600 to-red-500',
    liveActivity: { users: 78, status: "📈 Growing" }
  },
  {
    problem: "Authority Absence",
    subheading: "Nobody knows you exist",
    description: "Complete thought leadership strategy with book publishing, speaking opportunities, and industry recognition.",
    agents: ['publishing', 'contentcreation', 'proposal'],
    icon: <BookOpen className="w-8 h-8" />,
    metrics: { successRate: 87, avgIncrease: "167%", timeToResults: "30 days" },
    href: '/book-publishing',
    primaryColor: 'from-indigo-600 to-purple-500',
    liveActivity: { users: 29, status: "📚 Expert" }
  },
  {
    problem: "Sales Chaos",
    subheading: "Leads falling through cracks",
    description: "Complete sales automation with lead nurturing, proposal generation, and client success management.",
    agents: ['proposal', 'clientsuccess', 'analytics'],
    icon: <DollarSign className="w-8 h-8" />,
    metrics: { successRate: 91, avgIncrease: "198%", timeToResults: "14 days" },
    href: '/dashboard/analytics',
    primaryColor: 'from-green-600 to-teal-500',
    liveActivity: { users: 52, status: "💰 Profitable" }
  }
];

// Live metrics data
const globalMetrics = {
  totalProblems: 147,
  problemsSolved: 139,
  avgTimeToSolution: "12 days",
  clientSatisfaction: "97.3%"
};

export default function ServicesPage() {
  const [liveMetrics, setLiveMetrics] = useState({
    totalUsers: 187,
    urgentSpots: 12,
    activeSolutions: 6
  });

  // Simulate live metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics(prev => ({
        totalUsers: prev.totalUsers + Math.floor(Math.random() * 3),
        urgentSpots: Math.max(5, prev.urgentSpots - Math.floor(Math.random() * 2)),
        activeSolutions: businessSolutions.length
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSolutionClick = (solution: typeof businessSolutions[0]) => {
    console.log(`User selected solution: ${solution.problem}`);
    // You can add tracking here
  };

  return (
    <ClientPageLayout>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.5 }}
        className="min-h-screen relative"
      >
        <div className="relative z-10 pt-16 sm:pt-20 lg:pt-24 px-4 md:px-8 lg:px-12">
          
          {/* Hero Section with Live Activity */}
          <Pseudo3DHero className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
                <div className="flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                  🔥 LIVE: {liveMetrics.totalUsers} businesses transforming now
                </div>
                <div className="flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-bold">
                  ⚡ {liveMetrics.urgentSpots} urgent spots left this week
                </div>
              </div>
              
              <CosmicHeading className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl mb-4 md:mb-6">
                What Is Your Biggest Business Challenge?
              </CosmicHeading>
              <p className="text-lg sm:text-xl text-teal-300 max-w-3xl mx-auto mb-6 md:mb-8 font-semibold leading-relaxed">
                Percy analyzes your challenge and assembles the perfect AI agent team to solve it. <span className="text-white font-bold">Real solutions, real results, real fast.</span>
              </p>
            </motion.div>
          </Pseudo3DHero>

          {/* Global Success Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
          >
            {Object.entries(globalMetrics).map(([key, value], index) => (
              <Pseudo3DStats key={key} className="text-center p-4">
                <div className="text-2xl md:text-3xl font-bold text-white mb-1">{value}</div>
                <div className="text-sm text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
              </Pseudo3DStats>
            ))}
          </motion.div>
          
          {/* Business Solutions Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-16"
          >
            {businessSolutions.map((solution, index) => (
              <Pseudo3DFeature
                key={solution.problem}
                className="group cursor-pointer relative overflow-hidden"
                onClick={() => handleSolutionClick(solution)}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative z-10"
                >
                  {/* Live Activity Badge */}
                  <div className="absolute top-4 right-4 z-20">
                    <div className="flex items-center gap-1 bg-black/30 rounded-full px-2 py-1 text-xs">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-300">{solution.liveActivity.users}</span>
                    </div>
                  </div>

                  {/* Icon with gradient background */}
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${solution.primaryColor} shadow-glow mb-2 group-hover:scale-110 transition-transform`}>
                    {solution.icon}
                  </div>

                  {/* Problem Title */}
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-teal-300 transition-colors">
                    {solution.problem}
                  </h3>

                  {/* Subheading */}
                  <p className="text-sm text-gray-400 mb-3">
                    {solution.subheading}
                  </p>

                  {/* Description */}
                  <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                    {solution.description}
                  </p>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                    <div className="text-center">
                      <div className="text-green-400 font-bold">{solution.metrics.successRate}%</div>
                      <div className="text-gray-500">Success</div>
                    </div>
                    <div className="text-center">
                      <div className="text-teal-400 font-bold">{solution.metrics.avgIncrease}</div>
                      <div className="text-gray-500">Growth</div>
                    </div>
                    <div className="text-center">
                      <div className="text-blue-400 font-bold">{solution.metrics.timeToResults}</div>
                      <div className="text-gray-500">Results</div>
                    </div>
                  </div>

                  {/* Agent Team */}
                  <div className="mb-4">
                    <div className="text-xs text-gray-400 mb-2">AI Agent Team:</div>
                    <div className="flex flex-wrap gap-1">
                      {solution.agents.map(agent => (
                        <span 
                          key={agent}
                          className="px-2 py-1 bg-teal-500/20 text-teal-300 rounded text-xs border border-teal-500/30"
                        >
                          {agent}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <Link href={solution.href}>
                    <CosmicButton size="sm" className="w-full group-hover:scale-105 transition-transform">
                      Solve This Problem
                    </CosmicButton>
                  </Link>
                </motion.div>

                {/* Hover gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-r ${solution.primaryColor} opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-xl pointer-events-none`}></div>
              </Pseudo3DFeature>
            ))}
          </motion.div>

          {/* Why Choose Us Section */}
          <Pseudo3DFeature className="text-center mb-16">
            <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              Why Businesses Choose <SkrblAiText variant="glow">SKRBL AI</SkrblAiText>
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto mb-8">
              We do not just compete - we redefine what AI automation can achieve.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                {
                  title: "Real Workflow Execution",
                  description: "While others offer workflows, we deliver entire business operations that run themselves.",
                  metric: "10x faster execution"
                },
                {
                  title: "Revenue Focused Design", 
                  description: "Every feature built to drive measurable business results.",
                  metric: "ROI within 14 days"
                },
                {
                  title: "No Code Accessibility",
                  description: "Advanced AI that requires zero technical expertise.",
                  metric: "99% user success rate"
                },
                {
                  title: "Enterprise Grade Security",
                  description: "Bank level security with enterprise level capability.",
                  metric: "SOC2 compliant"
                }
              ].map((feature, index) => (
                <Pseudo3DStats
                  key={feature.title}
                  className="text-left"
                >
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-300 text-sm mb-3">{feature.description}</p>
                  <div className="text-teal-400 font-bold text-sm">{feature.metric}</div>
                </Pseudo3DStats>
              ))}
            </div>
          </Pseudo3DFeature>

          {/* Final CTA Section */}
          <Pseudo3DHero className="text-center">
            <div className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-2xl p-12 border border-purple-500/30">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready To Transform Your Business?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join thousands of businesses already using <SkrblAiText variant="wave">SKRBL</SkrblAiText> to automate, scale, and dominate their industries.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/sign-up">
                  <CosmicButton size="lg" className="text-lg px-8 py-4">
                    Start Free Trial
                  </CosmicButton>
                </Link>
                <Link href="/about">
                  <CosmicButton variant="secondary" size="lg" className="text-lg px-8 py-4">
                    Learn More
                  </CosmicButton>
                </Link>
              </div>
            </div>
          </Pseudo3DHero>
        </div>
      </motion.div>
    </ClientPageLayout>
  );
}
