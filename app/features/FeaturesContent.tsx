'use client';

import React, { JSX, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageLayout from 'components/layout/PageLayout';
import GlassmorphicCard from '../../components/shared/GlassmorphicCard';
import CosmicButton from '../../components/shared/CosmicButton';
import CosmicHeading from '../../components/shared/CosmicHeading';
import Image from 'next/image';
import Link from 'next/link';
import { TrendingUp, Clock, Users, Target, Zap, DollarSign, BarChart3, Rocket, BookOpen, Palette, FilePenLine, Megaphone, Crown } from 'lucide-react';
import SkrblAiText from '../../components/shared/SkrblAiText';
import PercySuggestionModal from '../../components/percy/PercySuggestionModal';

// Business-Focused Features with metrics like Services page
const businessFeatures = [
  {
    title: 'AI Branding Empire',
    subheading: 'Legendary brand identities that dominate',
    description: 'Complete brand identity transformation with AI-powered logo design, color psychology, voice development, and positioning strategy that makes competitors weep.',
    agents: ['branding', 'contentcreation', 'design'],
    icon: <Palette className="w-8 h-8" />,
    metrics: { successRate: 89, avgIncrease: "156%", timeToResults: "24 hours" },
    href: '/branding',
    primaryColor: 'from-pink-600 to-rose-500',
    liveActivity: { users: 33, status: "🎯 Trending" }
  },
  {
    title: 'Publishing Domination',
    subheading: 'Transform ideas into bestsellers',
    description: 'AI-powered manuscript development, editing, cover design, and complete publishing pipeline that establishes you as the industry authority.',
    agents: ['book-publishing', 'contentcreation', 'branding'],
    icon: <BookOpen className="w-8 h-8" />,
    metrics: { successRate: 93, avgIncrease: "312%", timeToResults: "7 days" },
    href: '/book-publishing',
    primaryColor: 'from-indigo-600 to-blue-500',
    liveActivity: { users: 18, status: "📚 Publishing" }
  },
  {
    title: 'Marketing Warfare',
    subheading: 'Campaigns that obliterate competition',
    description: 'Data-driven marketing automation with viral social content, conversion-optimized proposals, and intelligence-driven analytics for maximum ROI.',
    agents: ['adcreative', 'analytics', 'social'],
    icon: <Megaphone className="w-8 h-8" />,
    metrics: { successRate: 87, avgIncrease: "198%", timeToResults: "48 hours" },
    href: '/marketing',
    primaryColor: 'from-fuchsia-600 to-purple-500',
    liveActivity: { users: 42, status: "🚀 Converting" }
  },
  {
    title: 'Content Automation',
    subheading: 'Never run out of engaging content',
    description: 'AI content engine that creates engaging posts, articles, books, and campaigns across all platforms automatically and consistently.',
    agents: ['contentcreation', 'social', 'book-publishing'],
    icon: <FilePenLine className="w-8 h-8" />,
    metrics: { successRate: 91, avgIncrease: "189%", timeToResults: "3 days" },
    href: '/content-automation',
    primaryColor: 'from-orange-600 to-red-500',
    liveActivity: { users: 29, status: "📝 Creating" }
  },
  {
    title: 'Revenue Analytics',
    subheading: 'Unlock hidden profit opportunities',
    description: 'AI-powered analytics and business intelligence that identifies revenue leaks, optimization opportunities, and growth strategies automatically.',
    agents: ['analytics', 'biz', 'sync'],
    icon: <BarChart3 className="w-8 h-8" />,
    metrics: { successRate: 94, avgIncrease: "127%", timeToResults: "14 days" },
    href: '/analytics',
    primaryColor: 'from-green-600 to-emerald-500',
    liveActivity: { users: 47, status: "🔥 Hot" }
  },
  {
    title: 'Workflow Automation',
    subheading: 'Eliminate manual overwhelm forever',
    description: 'Complete workflow automation that handles your busywork while you focus on strategy and growth. Transform into an efficiency machine.',
    agents: ['sync', 'biz', 'percy'],
    icon: <Zap className="w-8 h-8" />,
    metrics: { successRate: 96, avgIncrease: "234%", timeToResults: "7 days" },
    href: '/content-automation',
    primaryColor: 'from-blue-600 to-cyan-500',
    liveActivity: { users: 61, status: "⚡ Active" }
  }
];

// Success Stories (rotating testimonials) - matching Services pattern
const successStories = [
  {
    business: "TechFlow Solutions",
    result: "$127K revenue increase in 90 days",
    solution: "Revenue Analytics → Hidden Opportunities Discovered",
    quote: (<><SkrblAiText variant="pulse" size="sm">SKRBL AI</SkrblAiText> found $127K in hidden revenue opportunities we never knew existed.</>)
  },
  {
    business: "Rose Ladon Collective", 
    result: "156% brand recognition boost",
    solution: "Branding Empire → Complete Identity Transformation",
    quote: "Our AI rebrand generated more leads in 30 days than the previous year combined."
  },
  {
    business: "Nexus Consulting",
    result: "40 hours/week saved on automation",
    solution: "Workflow Automation → Complete Business Transformation", 
    quote: "We went from drowning in busywork to focusing on what actually grows the business."
  }
];

export default function FeaturesContent(): JSX.Element {
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null);
  const [percySuggestionOpen, setPercySuggestionOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState<typeof businessFeatures[0] | null>(null);
  const [liveMetrics, setLiveMetrics] = useState({ totalUsers: 247, featuresActive: 23 });
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  // Live activity updates - matching Services pattern
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics(prev => ({
        totalUsers: prev.totalUsers + Math.floor(Math.random() * 3) - 1,
        featuresActive: Math.max(5, prev.featuresActive + Math.floor(Math.random() * 2) - 1)
      }));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Rotating testimonials - matching Services pattern
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % successStories.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // NEW: Percy Suggestion Modal Logic
  const handleFeatureActivation = (featureIndex: number) => {
    setSelectedFeature(featureIndex);
    const feature = businessFeatures[featureIndex];
    setActiveFeature(feature);
    setPercySuggestionOpen(true);
    
    // Analytics tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'feature_activation_started', {
        feature_name: feature.title,
        feature_category: feature.primaryColor
      });
    }
  };

  // Handle Percy suggestion engagement tracking
  const handlePercyEngagement = (action: string, data?: any) => {
    console.log('Percy engagement:', action, data);
    
    // Analytics tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'percy_suggestion_engagement', {
        action,
        feature_name: activeFeature?.title,
        ...data
      });
    }
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
          
          {/* Hero Section with Live Activity - Matching Services */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                🔥 LIVE: {liveMetrics.totalUsers} businesses using features now
              </div>
              <div className="flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-bold">
                ⚡ {liveMetrics.featuresActive} active features this hour
              </div>
            </div>
            
            <CosmicHeading className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl mb-4 md:mb-6 mobile-text-safe no-text-cutoff">
              Your Digital <span className="text-electric-blue">Weapons Arsenal</span>
            </CosmicHeading>
            <p className="text-lg sm:text-xl text-teal-300 max-w-3xl mx-auto mb-6 md:mb-8 font-semibold leading-relaxed mobile-text-safe no-text-cutoff">
              These aren't just "features" - they're <span className="text-white font-bold">competitive annihilation tools</span> that transform businesses into market dominators.
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
                <div className="text-white font-bold">Percy's Feature Intelligence</div>
                <div className="text-cyan-400 text-sm">🧠 Analyzing your perfect feature match...</div>
              </div>
            </div>
          </motion.div>

          {/* Features Arsenal Grid - Matching Services */}
          <motion.div
  variants={container}
  initial="hidden"
  animate="show"
  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16"
>
  {businessFeatures.map((feature, index) => (
    <motion.div
      key={feature.title}
      variants={item}
      whileHover={{ scale: 1.045, y: -10, boxShadow: "0 0 40px 12px #0fffcf55, 0 0 80px 24px #a21caf55" }}
      animate={selectedFeature === index ? { scale: 1.06, boxShadow: "0 0 64px 24px #67e8f9cc, 0 0 128px 32px #f472b6bb" } : {}}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      onClick={() => handleFeatureActivation(index)}
      className={`relative group cursor-pointer transition-all duration-400 flex flex-col min-h-[410px] md:min-h-[410px] lg:min-h-[430px] ${
        selectedFeature === index ? 'ring-4 ring-cyan-400/60 z-20 shadow-[0_0_80px_24px_rgba(56,189,248,0.25)]' : 'shadow-[0_0_40px_8px_rgba(56,189,248,0.13)]'
      }`}
    >
      {/* Animated cosmic highlight border for selected */}
      {selectedFeature === index && (
        <motion.div
          layoutId="cosmic-feature-ring"
          className="absolute inset-0 rounded-3xl border-4 border-cyan-400/70 pointer-events-none animate-pulse"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      )}
      <GlassmorphicCard className="flex flex-col justify-between h-full p-8 relative overflow-hidden border-teal-400/70 backdrop-blur-2xl bg-white/10 shadow-[0_0_48px_8px_rgba(56,189,248,0.17),0_0_80px_24px_rgba(168,85,247,0.15)] transition-all duration-400">
        {/* Live Activity Badge */}
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full text-xs border border-teal-400/30">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 font-bold">{feature.liveActivity.users}</span>
                  </div>
                  
                  {/* Feature Header */}
                  <div className="flex flex-col items-center mb-2">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${feature.primaryColor} shadow-glow mb-2 group-hover:scale-110 transition-transform`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white min-h-[2.5rem] break-words text-center mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 text-sm text-center mb-2">
                      {feature.subheading}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 mb-4 line-clamp-2 text-center">
                    {feature.description}
                  </p>

                  {/* Separated Stat Block (Premium Style) */}
                  <div className="mt-auto pt-4 border-t border-cyan-400/20">
                    <div className="flex flex-row gap-6 justify-center">
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-bold text-green-400">{feature.metrics.successRate}%</span>
                        <span className="text-xs text-gray-400">Success Rate</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-bold text-cyan-400">{feature.metrics.avgIncrease}</span>
                        <span className="text-xs text-gray-400">Avg Increase</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-bold text-purple-400">{feature.metrics.timeToResults}</span>
                        <span className="text-xs text-gray-400">To Results</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Agent Team Preview */}
                  <div className="mb-4">
                    <div className="text-sm text-gray-400 mb-2">AI Agent Team:</div>
                    <div className="flex gap-2 flex-wrap">
                      {feature.agents.map((agentId) => (
                        <span key={agentId} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs">
                          {agentId.replace('-agent', '').replace('-', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <CosmicButton 
                    variant="glass" 
                    className="w-full group-hover:shadow-xl transition-all"
                  >
                    🎯 Activate This Feature
                  </CosmicButton>
                  
                  {/* Hover Glow Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.primaryColor} opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-xl pointer-events-none`}></div>
                </GlassmorphicCard>
              </motion.div>
            ))}
          </motion.div>

          {/* NEW: Percy Suggestion Modal */}
          <PercySuggestionModal
            isOpen={percySuggestionOpen}
            onClose={() => {
              setPercySuggestionOpen(false);
              setSelectedFeature(null);
              setActiveFeature(null);
            }}
            featureName={activeFeature?.title || ""}
            featureDescription={activeFeature?.description || ""}
            primaryColor={activeFeature?.primaryColor || "from-cyan-500 to-blue-600"}
            customCopy={{
              benefits: [
                `${activeFeature?.metrics.successRate}% success rate with real businesses`,
                `Average ${activeFeature?.metrics.avgIncrease} increase in results`,
                `See results in just ${activeFeature?.metrics.timeToResults}`
              ]
            }}
            onEngagement={handlePercyEngagement}
          />

          {/* Live Success Stories - Matching Services */}
          <motion.div
            className="max-w-6xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              Live Feature Success Stories
            </h2>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <GlassmorphicCard className="p-8 text-center backdrop-blur-xl">
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

          {/* Competitive Advantage Section - Enhanced */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="max-w-7xl mx-auto mb-16"
          >
            <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Why Competitors Can't Keep Up
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <GlassmorphicCard className="p-8 backdrop-blur-xl border-red-500/30">
                <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                  <Clock className="w-6 h-6" />
                  Your Competition (Manual Hell)
                </h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 font-bold">❌</span>
                    <span className="text-gray-300">Weeks to create basic branding materials</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 font-bold">❌</span>
                    <span className="text-gray-300">Months to write and publish content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 font-bold">❌</span>
                    <span className="text-gray-300">Expensive agencies and freelancers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 font-bold">❌</span>
                    <span className="text-gray-300">Inconsistent quality and messaging</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 font-bold">❌</span>
                    <span className="text-gray-300">Limited scalability and automation</span>
                  </li>
                </ul>
              </GlassmorphicCard>
              
              <GlassmorphicCard className="p-8 backdrop-blur-xl border-green-500/30">
                <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                  <Rocket className="w-6 h-6" />
                  You (AI-Powered Dominance)
                </h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 font-bold">✅</span>
                    <span>Professional branding in <strong>24 hours</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 font-bold">✅</span>
                    <span>Books and content in <strong>days not months</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 font-bold">✅</span>
                    <span>Fraction of traditional costs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 font-bold">✅</span>
                    <span>AI-consistent quality and voice</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 font-bold">✅</span>
                    <span className="text-teal-200">Infinite scalability and automation</span>
                  </li>
                </ul>
              </GlassmorphicCard>
            </div>
          </motion.div>

          {/* CTA Section - Matching Services */}
          <motion.div
            className="max-w-5xl mx-auto text-center mb-24"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-transparent backdrop-blur-xl rounded-2xl p-12 border-2 border-teal-400/70 shadow-[0_8px_32px_rgba(0,212,255,0.18)]">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready To Activate Your Arsenal?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Join {liveMetrics.totalUsers}+ businesses already using <SkrblAiText variant="glow" size="md">SKRBL AI</SkrblAiText> features to dominate their industries.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <CosmicButton href="/" variant="glass" size="lg" className="shadow-[0_8px_32px_rgba(0,212,255,0.28)]">
                  🚀 Start Free Trial (No Credit Card)
                </CosmicButton>
                <CosmicButton href="/agents" variant="glass" size="lg">
                  👥 Meet Your Agent League
                </CosmicButton>
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
