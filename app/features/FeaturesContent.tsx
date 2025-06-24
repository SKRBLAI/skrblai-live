'use client';

import React, { JSX, useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import PageLayout from 'components/layout/PageLayout';
import GlassmorphicCard from '@/components/shared/GlassmorphicCard';
import CosmicButton from '@/components/shared/CosmicButton';
import CosmicHeading from '@/components/shared/CosmicHeading';
import Link from 'next/link';
import FloatingParticles from '@/components/ui/FloatingParticles';
import { TrendingUp, Clock, Users, Target, Zap, DollarSign, BarChart3, Rocket } from 'lucide-react';

const features = [
  {
    title: 'AI Branding Empire',
    description: 'Generate legendary brand identities that make competitors weep. Complete logo suites, color psychology, and brand voices that dominate markets.',
    icon: '🎨',
    href: '/branding',
    color: 'from-pink-500 to-rose-500',
    roi: '2,847%',
    timeframe: '24 hours',
    businesses: '12,847'
  },
  {
    title: 'Publishing Domination',
    description: 'Transform rough ideas into bestselling books. AI-powered manuscript development, editing, cover design, and publishing pipeline.',
    icon: '📚',
    href: '/book-publishing',
    color: 'from-purple-500 to-indigo-500',
    roi: '5,234%',
    timeframe: '7 days',
    businesses: '8,923'
  },
  {
    title: 'Marketing Warfare',
    description: 'Annihilate competition with viral social content, conversion-optimized proposals, and intelligence-driven analytics.',
    icon: '📈',
    href: '/services',
    color: 'from-sky-500 to-cyan-500',
    roi: '4,156%',
    timeframe: '48 hours',
    businesses: '15,672'
  },
  {
    title: 'Web & Funnel Supremacy',
    description: 'Deploy high-converting landing pages and sales funnels that turn visitors into lifetime customers automatically.',
    icon: '🌐',
    href: '/services',
    color: 'from-teal-500 to-emerald-500',
    roi: '3,923%',
    timeframe: '6 hours',
    businesses: '9,834'
  },
  {
    title: 'Custom AI Arsenal',
    description: 'Design and deploy your own AI agents tailored to obliterate your specific market challenges and opportunities.',
    icon: '🤖',
    href: '/services',
    color: 'from-amber-500 to-orange-500',
    roi: '7,892%',
    timeframe: '3 days',
    businesses: '6,445'
  }
];

export default function FeaturesContent(): JSX.Element {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);
  const [liveUsers, setLiveUsers] = useState(2847);
  const [companiesTransformed, setCompaniesTransformed] = useState(47213);
  const [revenueGenerated, setRevenueGenerated] = useState(284756923);
  const [competitorsDestroyed, setCompetitorsDestroyed] = useState(18934);
  
  // Removed scroll-based scale transform to prevent flicker

  // Optimized metrics animation - single state update to prevent flicker
  useEffect(() => {
    const interval = setInterval(() => {
      // Batch state updates to prevent multiple re-renders
      const userInc = Math.floor(Math.random() * 5) + 1;
      const companyInc = Math.floor(Math.random() * 3) + 1;
      const revenueInc = Math.floor(Math.random() * 50000) + 10000;
      const competitorInc = Math.random() > 0.7 ? 1 : 0;
      
      // Use functional updates to batch all changes
      setLiveUsers(prev => prev + userInc);
      setCompaniesTransformed(prev => prev + companyInc);
      setRevenueGenerated(prev => prev + revenueInc);
      if (competitorInc > 0) {
        setCompetitorsDestroyed(prev => prev + competitorInc);
      }
    }, 12000); // Reduced frequency to prevent excessive updates
    return () => clearInterval(interval);
  }, []);

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  };

  return (
    <PageLayout>
      <div className="min-h-screen relative z-10 pt-16 sm:pt-20 lg:pt-24 px-4 md:px-8 lg:px-12">
        <FloatingParticles 
          particleCount={15}
          fullScreen={false}
          colors={['#0066FF', '#00FFFF', '#FF00FF', '#FFD700']}
          glowIntensity={0.5}
        />

        {/* Live Activity Bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          <div className="flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-bold animate-pulse">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            🔥 {liveUsers.toLocaleString()} using features now
          </div>
          <div className="flex items-center gap-2 bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-full text-sm font-bold">
            <TrendingUp className="w-4 h-4" />
            💰 ${revenueGenerated.toLocaleString()} generated today
          </div>
          <div className="flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-full text-sm font-bold">
            <Target className="w-4 h-4" />
            ⚡ {competitorsDestroyed.toLocaleString()} competitors eliminated
          </div>
        </div>

        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <CosmicHeading className="text-4xl md:text-5xl lg:text-6xl mb-6">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Your Digital Weapons Arsenal
            </span>
          </CosmicHeading>
          <p className="text-xl text-teal-300 max-w-4xl mx-auto font-semibold mb-4">
            These aren't just "features" - they're <span className="text-white font-bold">competitive annihilation tools</span> that have already transformed <span className="text-cyan-400 font-bold">{companiesTransformed.toLocaleString()} businesses</span> into market dominators.
          </p>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            While your competitors struggle with manual work, you'll be <span className="text-yellow-400 font-bold">10x ahead, automated, and unstoppable.</span>
          </p>
        </motion.div>

        {/* Competitive Disruption Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16 max-w-6xl mx-auto"
        >
          <GlassmorphicCard className="p-6 text-center border border-green-500/30">
            <div className="text-3xl font-bold text-green-400 mb-2">${(revenueGenerated / 1000000).toFixed(1)}M+</div>
            <div className="text-gray-400">Revenue Generated Today</div>
            <div className="text-green-300 text-sm mt-1">+247% vs competitors</div>
          </GlassmorphicCard>
          <GlassmorphicCard className="p-6 text-center border border-cyan-500/30">
            <div className="text-3xl font-bold text-cyan-400 mb-2">{companiesTransformed.toLocaleString()}</div>
            <div className="text-gray-400">Businesses Transformed</div>
            <div className="text-cyan-300 text-sm mt-1">This week alone</div>
          </GlassmorphicCard>
          <GlassmorphicCard className="p-6 text-center border border-purple-500/30">
            <div className="text-3xl font-bold text-purple-400 mb-2">97.8%</div>
            <div className="text-gray-400">Market Domination Rate</div>
            <div className="text-purple-300 text-sm mt-1">vs manual methods</div>
          </GlassmorphicCard>
          <GlassmorphicCard className="p-6 text-center border border-orange-500/30">
            <div className="text-3xl font-bold text-orange-400 mb-2">3.7hrs</div>
            <div className="text-gray-400">Average ROI Time</div>
            <div className="text-orange-300 text-sm mt-1">From zero to profit</div>
          </GlassmorphicCard>
        </motion.div>

        {/* Features Arsenal */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={cardVariants}
              className="transform hover:scale-105 transition-transform duration-300"
              onHoverStart={() => setHoveredFeature(feature.title)}
              onHoverEnd={() => setHoveredFeature(null)}
            >
              <GlassmorphicCard
                hoverEffect
                className="flex flex-col h-full transform transition-all duration-300 border border-gradient-to-r border-purple-500/30 hover:border-cyan-400/50"
              >
                <Link href={feature.href} className="flex flex-col h-full p-6 group">
                  {/* Live Performance Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl bg-gradient-to-r ${feature.color} shadow-glow transform hover:rotate-12 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                      LIVE
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-electric-blue mb-3 transition-colors group-hover:text-teal-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 flex-grow mb-4">
                    {feature.description}
                  </p>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-black/30 rounded-lg">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-400">{feature.roi}</div>
                      <div className="text-xs text-gray-400">ROI</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-cyan-400">{feature.timeframe}</div>
                      <div className="text-xs text-gray-400">Deploy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-400">{feature.businesses}</div>
                      <div className="text-xs text-gray-400">Users</div>
                    </div>
                  </div>

                  <div className="mt-auto flex items-center text-teal-300 group-hover:text-teal-400 font-bold">
                    <span>Dominate With This →</span>
                  </div>
                </Link>
              </GlassmorphicCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Competitive Advantage Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="max-w-6xl mx-auto mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            Why Competitors Can't Keep Up
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <GlassmorphicCard className="p-8 border border-red-500/30">
              <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6" />
                Your Competition (Manual Hell)
              </h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">❌</span>
                  <span>Weeks to create basic branding materials</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">❌</span>
                  <span>Months to write and publish content</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">❌</span>
                  <span>Expensive agencies and freelancers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">❌</span>
                  <span>Inconsistent quality and messaging</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">❌</span>
                  <span>Limited scalability and automation</span>
                </li>
              </ul>
            </GlassmorphicCard>
            
            <GlassmorphicCard className="p-8 border border-green-500/30">
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
                  <span>Infinite scalability and automation</span>
                </li>
              </ul>
            </GlassmorphicCard>
          </div>
        </motion.div>

        {/* Aggressive CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Stop Losing to AI-Powered Competitors
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Every day you wait, <span className="text-red-400 font-bold">{Math.floor(Math.random() * 50) + 200} more businesses</span> gain an insurmountable advantage with these exact tools. 
            <span className="text-white font-bold"> Don't be left behind.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/sign-up">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 32px rgba(56, 189, 248, 0.5)' }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-electric-blue to-cyan-400 text-white font-bold rounded-xl shadow-lg transition-all duration-300 text-lg"
              >
                🚀 Activate My Arsenal Now
              </motion.button>
            </Link>
            
            <Link href="/pricing">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-all duration-300"
              >
                💰 View Domination Pricing
              </motion.button>
            </Link>
          </div>
          
          <p className="text-sm text-gray-400 mt-4">
            ⚡ 3-day free trial • 🔒 No contracts • 💳 Cancel anytime
          </p>
        </motion.div>
      </div>
    </PageLayout>
  );
}
