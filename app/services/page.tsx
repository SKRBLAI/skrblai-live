'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageLayout from 'components/layout/PageLayout';
import GlassmorphicCard from '@/components/shared/GlassmorphicCard';
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
    description: "AI-powered analytics and marketing automation that identifies hidden revenue opportunities and converts them into profit.",
    agents: ['analytics', 'adcreative', 'social'],
    icon: <TrendingUp className="w-8 h-8" />,
    metrics: { successRate: 94, avgIncrease: "127%", timeToResults: "14 days" },
    href: '/analytics',
    primaryColor: 'from-green-600 to-emerald-500',
    liveActivity: { users: 47, status: "🔥 Hot" }
  },
  {
    problem: "Brand Confusion", 
    subheading: "Customers don't 'get' your brand",
    description: "Complete brand identity transformation with AI-powered logo design, voice development, and positioning strategy.",
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
    subheading: "Can't keep up with content demands",
    description: "AI content engine that creates engaging posts, articles, books, and campaigns across all platforms.",
    agents: ['contentcreation', 'social', 'book-publishing'],
    icon: <FilePenLine className="w-8 h-8" />,
    metrics: { successRate: 91, avgIncrease: "189%", timeToResults: "3 days" },
    href: '/content-automation',
    primaryColor: 'from-orange-600 to-red-500',
    liveActivity: { users: 29, status: "📝 Creating" }
  },
  {
    problem: "Marketing Chaos",
    subheading: "Campaigns that don't convert",
    description: "Data-driven marketing automation with AI audience targeting and campaign optimization for maximum ROI.",
    agents: ['adcreative', 'analytics', 'social'],
    icon: <Megaphone className="w-8 h-8" />,
    metrics: { successRate: 87, avgIncrease: "198%", timeToResults: "10 days" },
    href: '/marketing',
    primaryColor: 'from-fuchsia-600 to-purple-500',
    liveActivity: { users: 42, status: "🚀 Converting" }
  },
  {
    problem: "Authority Deficit",
    subheading: "No one sees you as the expert",
    description: "Publish a professional book, establish thought leadership, and become the go-to authority in your industry.",
    agents: ['book-publishing', 'contentcreation', 'branding'],
    icon: <BookOpen className="w-8 h-8" />,
    metrics: { successRate: 93, avgIncrease: "312%", timeToResults: "45 days" },
    href: '/book-publishing',
    primaryColor: 'from-indigo-600 to-blue-500',
    liveActivity: { users: 18, status: "📚 Publishing" }
  }
];

// Success Stories (rotating testimonials)
const successStories = [
  {
    business: "TechFlow Solutions",
    result: "$127K revenue increase in 90 days",
    solution: "Revenue Stalling → Analytics + Marketing Automation",
    quote: (<><SkrblAiText variant="pulse" size="sm">SKRBL AI</SkrblAiText> found $127K in hidden revenue opportunities we never knew existed.</>)
  },
  {
    business: "Creative Studio Labs", 
    result: "156% brand recognition boost",
    solution: "Brand Confusion → Complete Identity Transformation",
    quote: "Our rebrand generated more leads in 30 days than the previous year combined."
  },
  {
    business: "Nexus Consulting",
    result: "40 hours/week saved on automation",
    solution: "Manual Overwhelm → Complete Workflow Automation", 
    quote: "We went from drowning in busywork to focusing on what actually grows the business."
  }
];

export default function ServicesPage() {
  const [selectedSolution, setSelectedSolution] = useState<number | null>(null);
  const [percyResponse, setPercyResponse] = useState<string>("");
  const [liveMetrics, setLiveMetrics] = useState({ totalUsers: 247, urgentSpots: 23 });
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  // Live activity updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics(prev => ({
        totalUsers: prev.totalUsers + Math.floor(Math.random() * 3) - 1,
        urgentSpots: Math.max(5, prev.urgentSpots + Math.floor(Math.random() * 2) - 1)
      }));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Rotating testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % successStories.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Percy Quiz Logic
  const handlePercyQuiz = (problemIndex: number) => {
    setSelectedSolution(problemIndex);
    const solution = businessSolutions[problemIndex];
    setPercyResponse(`🎯 Perfect match! Based on your "${solution.problem}" challenge, I've assembled the ideal agent team: ${solution.agents.map(id => id.replace('-agent', '').replace('-', ' ')).join(', ')}. Ready to see ${solution.metrics.avgIncrease} average results in ${solution.metrics.timeToResults}?`);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <PageLayout>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.5 }}
        className="min-h-screen relative"
      >
        <div className="relative z-10 pt-16 sm:pt-20 lg:pt-24 px-4 md:px-8 lg:px-12">
          
          {/* Hero Section with Live Activity */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                🔥 LIVE: {liveMetrics.totalUsers} businesses transforming now
              </div>
              <div className="flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-bold">
                ⚡ {liveMetrics.urgentSpots} urgent spots left this week
              </div>
            </div>
            
            <CosmicHeading className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl mb-4 md:mb-6 mobile-text-safe no-text-cutoff">
              What's Your Biggest Business Challenge?
            </CosmicHeading>
            <p className="text-lg sm:text-xl text-teal-300 max-w-3xl mx-auto mb-6 md:mb-8 font-semibold leading-relaxed mobile-text-safe no-text-cutoff">
              Percy analyzes your challenge and assembles the perfect AI agent team to solve it. <span className="text-white font-bold">Real solutions, real results, real fast.</span>
            </p>
            
            <div className="flex items-center justify-center gap-4 mb-8">
              <Image
                src="/images/agents-percy-nobg-skrblai.webp"
                alt="Percy the AI Concierge"
                width={80}
                height={80}
                className="rounded-full shadow-cosmic bg-white/10 border-2 border-cyan-400/30"
                priority
              />
              <div className="text-left">
                <div className="text-white font-bold">Percy's Business Intelligence</div>
                <div className="text-cyan-400 text-sm">🧠 Analyzing your perfect solution...</div>
              </div>
            </div>
          </motion.div>

          {/* Problem-Solution Grid */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto mb-16"
          >
            {businessSolutions.map((solution, index) => (
              <motion.div
                key={solution.problem}
                variants={item}
                whileHover={{ scale: 1.02, y: -5 }}
                onClick={() => handlePercyQuiz(index)}
                className={`relative group cursor-pointer transition-all duration-300 ${
                  selectedSolution === index ? 'ring-4 ring-cyan-400/50' : ''
                }`}
              >
                <GlassmorphicCard className="h-full p-6 relative overflow-hidden">
                  {/* Live Activity Badge */}
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/40 px-2 py-1 rounded-full text-xs">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 font-bold">{solution.liveActivity.users}</span>
                  </div>
                  
                  {/* Problem Header */}
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${solution.primaryColor} shadow-glow mr-4 group-hover:scale-110 transition-transform`}>
                      {solution.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {solution.problem}
                      </h3>
                      <p className="text-gray-400 text-sm">{solution.subheading}</p>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-gray-300 mb-6 flex-grow leading-relaxed">
                    {solution.description}
                  </p>
                  
                  {/* Success Metrics */}
                  <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-black/20 rounded-lg">
                    <div className="text-center">
                      <div className="text-green-400 font-bold text-lg">{solution.metrics.successRate}%</div>
                      <div className="text-xs text-gray-400">Success Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-cyan-400 font-bold text-lg">{solution.metrics.avgIncrease}</div>
                      <div className="text-xs text-gray-400">Avg Increase</div>
                    </div>
                    <div className="text-center">
                      <div className="text-purple-400 font-bold text-lg">{solution.metrics.timeToResults}</div>
                      <div className="text-xs text-gray-400">To Results</div>
                    </div>
                  </div>
                  
                  {/* Agent Team Preview */}
                  <div className="mb-4">
                    <div className="text-sm text-gray-400 mb-2">AI Agent Team:</div>
                    <div className="flex gap-2 flex-wrap">
                      {solution.agents.map((agentId) => (
                        <span key={agentId} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs">
                          {agentId.replace('-agent', '').replace('-', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <CosmicButton 
                    variant="primary" 
                    className="w-full group-hover:shadow-xl transition-all"
                  >
                    🎯 Solve This Problem
                  </CosmicButton>
                  
                  {/* Hover Glow Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${solution.primaryColor} opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-xl pointer-events-none`}></div>
                </GlassmorphicCard>
              </motion.div>
            ))}
          </motion.div>

          {/* Percy's Analysis Response */}
          <AnimatePresence>
            {percyResponse && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto mb-16"
              >
                <GlassmorphicCard className="p-8 border-2 border-cyan-400/50 shadow-2xl">
                  <div className="flex items-start gap-4">
                    <Image
                      src="/images/agents-percy-nobg-skrblai.webp"
                      alt="Percy"
                      width={60}
                      height={60}
                      className="rounded-full border-2 border-cyan-400/50"
                    />
                    <div className="flex-1">
                      <div className="text-cyan-400 font-bold mb-2">Percy's Analysis:</div>
                      <p className="text-white text-lg leading-relaxed mb-4">{percyResponse}</p>
                      <div className="flex gap-4">
                        <Link href="/agents" className="cosmic-btn-primary px-6 py-3 rounded-xl font-bold">
                          Meet The Agent Team
                        </Link>
                        <Link href="/sign-up" className="cosmic-btn-secondary px-6 py-3 rounded-xl font-bold">
                          Start Free Trial
                        </Link>
                      </div>
                    </div>
                  </div>
                </GlassmorphicCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Live Success Stories */}
          <motion.div
            className="max-w-6xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              Live Success Stories
            </h2>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <GlassmorphicCard className="p-8 text-center">
                  <div className="text-green-400 font-bold text-2xl mb-2">
                    {successStories[currentTestimonial].result}
                  </div>
                  <div className="text-gray-400 mb-4">
                    {successStories[currentTestimonial].business} • {successStories[currentTestimonial].solution}
                  </div>
                  <blockquote className="text-white text-lg italic">
                    "{successStories[currentTestimonial].quote}"
                  </blockquote>
                </GlassmorphicCard>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            className="max-w-5xl mx-auto text-center mb-24"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-2xl p-12 border border-purple-500/30">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready To Transform Your Business?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join {liveMetrics.totalUsers}+ businesses already using <SkrblAiText variant="glow" size="md">SKRBL AI</SkrblAiText> to dominate their industries.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/sign-up" className="cosmic-btn-primary px-8 py-4 rounded-xl font-bold text-lg shadow-2xl">
                  🚀 Start Free Trial (No Credit Card)
                </Link>
                <Link href="/agents" className="cosmic-btn-secondary px-8 py-4 rounded-xl font-bold text-lg">
                  👥 Meet Your Agent League
                </Link>
              </div>
              <div className="mt-6 text-sm text-gray-400">
                ⚡ Setup in under 5 minutes • 🎯 See results in 7 days • 💰 Cancel anytime
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </PageLayout>
  );
}
