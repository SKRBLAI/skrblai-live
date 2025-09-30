// @deprecated (2025-09-26): superseded by HomeHeroScanFirst. Kept for reference.
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Clock, TrendingUp, Users, Zap, ArrowUp, Star } from 'lucide-react';

const LIVE_RESULTS = [
  {
    id: 'revenue-spike',
    metric: '+$47K',
    timeframe: 'First 60 Days',
    business: 'E-commerce Store',
    improvement: 'Monthly Revenue',
    details: 'Automated email sequences + content marketing',
    icon: DollarSign,
    color: 'text-green-400',
    gradient: 'from-green-500 to-emerald-600'
  },
  {
    id: 'time-freedom',
    metric: '43 Hours',
    timeframe: 'Per Week',
    business: 'Marketing Agency',
    improvement: 'Time Saved',
    details: 'Client reports, social media, lead nurturing automated',
    icon: Clock,
    color: 'text-blue-400', 
    gradient: 'from-blue-500 to-cyan-600'
  },
  {
    id: 'lead-explosion',
    metric: '+520%',
    timeframe: 'Lead Increase',
    business: 'B2B SaaS',
    improvement: 'Qualified Leads',
    details: 'AI content + LinkedIn automation + email funnels',
    icon: TrendingUp,
    color: 'text-purple-400',
    gradient: 'from-purple-500 to-pink-600'
  },
  {
    id: 'team-multiplier',
    metric: '10x Output',
    timeframe: 'Same Team Size',
    business: 'Consulting Firm',
    improvement: 'Productivity',
    details: 'Proposal automation + client communication + reporting',
    icon: Users,
    color: 'text-orange-400',
    gradient: 'from-orange-500 to-red-600'
  }
];

const SUCCESS_STORIES = [
  {
    name: 'Sarah K.',
    business: 'Online Course Creator',
    result: 'Went from $12K to $89K monthly revenue in 4 months',
    beforeAfter: { before: '$12K/mo', after: '$89K/mo' },
    timespan: '4 months',
    keyWin: 'Automated entire funnel + content creation'
  },
  {
    name: 'Marcus T.',
    business: 'Local Service Business', 
    result: 'Eliminated 35 hours of weekly admin work',
    beforeAfter: { before: '60 hrs/week', after: '25 hrs/week' },
    timespan: '6 weeks',
    keyWin: 'Customer service + booking + follow-up automated'
  },
  {
    name: 'Jennifer L.',
    business: 'E-commerce Brand',
    result: 'Tripled conversion rate and doubled average order value',
    beforeAfter: { before: '2.1% conversion', after: '6.7% conversion' },
    timespan: '3 months',
    keyWin: 'AI-powered email marketing + personalization'
  }
];

interface BusinessResultsShowcaseProps {
  useAiAutomationHomepage?: boolean;
}

export default function BusinessResultsShowcase({ useAiAutomationHomepage = true }: BusinessResultsShowcaseProps): React.JSX.Element | null {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [liveMetrics, setLiveMetrics] = useState({
    businessesTransformed: 2847,
    revenueGenerated: 18500000,
    hoursReclaimed: 127000,
    activeAutomations: 15600
  });

  // Rotate success stories
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStoryIndex((prev) => (prev + 1) % SUCCESS_STORIES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Update live metrics for dynamic feel
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics(prev => ({
        businessesTransformed: prev.businessesTransformed + Math.floor(Math.random() * 3),
        revenueGenerated: prev.revenueGenerated + Math.floor(Math.random() * 5000),
        hoursReclaimed: prev.hoursReclaimed + Math.floor(Math.random() * 50),
        activeAutomations: prev.activeAutomations + Math.floor(Math.random() * 10)
      }));
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  const handleGetScanClick = () => {
    const el = document.getElementById('onboarding');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (!useAiAutomationHomepage) {
    return null; // Hide when using old homepage
  }

  const currentStory = SUCCESS_STORIES[currentStoryIndex];

  return (
    <section className="w-full relative py-16">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 relative z-10"
      >
        <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-electric-blue via-teal-400 to-fuchsia-500 mb-4">
          Real Results From Real Businesses
        </h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">
          <span className="text-teal-400 font-semibold">{liveMetrics.businessesTransformed.toLocaleString()}</span> businesses already crushing their competition with Super Agents
        </p>
      </motion.div>

      {/* Live Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto px-4 mb-16">
        {LIVE_RESULTS.map((result, index) => {
          const Icon = result.icon;
          return (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, rotateY: 5 }}
              className={`relative rounded-xl bg-gradient-to-br from-black/40 via-gray-900/50 to-black/60 backdrop-blur-xl border-2 border-gradient-to-r ${result.gradient} p-6 shadow-[0_0_30px_rgba(0,0,0,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] transition-all duration-300`}
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${result.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>

              {/* Metric */}
              <div className="mb-3">
                <div className={`text-2xl font-bold ${result.color} flex items-center gap-1`}>
                  {result.metric}
                  <ArrowUp className="w-4 h-4" />
                </div>
                <div className="text-sm text-gray-400">{result.timeframe}</div>
              </div>

              {/* Business Type */}
              <div className="text-white font-semibold text-sm mb-1">
                {result.business}
              </div>
              <div className="text-gray-400 text-xs mb-3">
                {result.improvement}
              </div>

              {/* Details */}
              <div className="text-xs text-gray-500 leading-tight">
                {result.details}
              </div>

              {/* Hover glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${result.gradient} opacity-0 hover:opacity-10 rounded-xl transition-opacity duration-300`} />
            </motion.div>
          );
        })}
      </div>

      {/* Rotating Success Story */}
      <motion.div
        className="max-w-4xl mx-auto px-4 mb-16"
        key={currentStoryIndex}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.8 }}
      >
        <div className="bg-gradient-to-br from-purple-900/30 via-pink-900/20 to-purple-900/30 backdrop-blur-xl border border-purple-500/40 rounded-2xl p-8 shadow-[0_0_40px_rgba(147,51,234,0.3)]">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-white font-bold text-lg">
                {currentStory.name.charAt(0)}
              </span>
            </div>

            {/* Story Content */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-4 mb-3">
                <h3 className="text-xl font-bold text-white">{currentStory.name}</h3>
                <span className="px-3 py-1 bg-purple-500/20 rounded-full text-purple-400 text-sm font-semibold">
                  {currentStory.business}
                </span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>

              <p className="text-gray-300 text-lg mb-4 leading-relaxed">
                "{currentStory.result}"
              </p>

              {/* Before/After */}
              <div className="flex items-center gap-6 bg-black/30 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-red-400 text-sm font-semibold mb-1">Before</div>
                  <div className="text-white font-bold">{currentStory.beforeAfter.before}</div>
                </div>
                <ArrowUp className="w-6 h-6 text-green-400 rotate-45" />
                <div className="text-center">
                  <div className="text-green-400 text-sm font-semibold mb-1">After</div>
                  <div className="text-white font-bold">{currentStory.beforeAfter.after}</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-gray-400 text-sm">Timespan</div>
                  <div className="text-cyan-400 font-semibold">{currentStory.timespan}</div>
                </div>
              </div>

              {/* Key Win */}
              <div className="mt-3">
                <span className="text-teal-400 font-semibold text-sm">Key Win: </span>
                <span className="text-gray-300 text-sm">{currentStory.keyWin}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Live Statistics Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="max-w-5xl mx-auto px-4 mb-12"
      >
        <div className="bg-gradient-to-r from-gray-900/80 via-black/60 to-gray-900/80 backdrop-blur-xl border border-cyan-400/30 rounded-2xl p-6 shadow-[0_0_40px_rgba(48,213,200,0.2)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-green-400">
                ${(liveMetrics.revenueGenerated / 1000000).toFixed(1)}M+
              </div>
              <div className="text-sm text-gray-400">Revenue Generated</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {(liveMetrics.hoursReclaimed / 1000).toFixed(0)}K+
              </div>
              <div className="text-sm text-gray-400">Hours Reclaimed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {liveMetrics.activeAutomations.toLocaleString()}+
              </div>
              <div className="text-sm text-gray-400">Active Automations</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-400">
                {liveMetrics.businessesTransformed.toLocaleString()}+
              </div>
              <div className="text-sm text-gray-400">Businesses Transformed</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Final CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="text-center"
      >
        <div className="max-w-3xl mx-auto bg-gradient-to-r from-red-900/40 via-orange-900/30 to-red-900/40 backdrop-blur-lg border border-red-500/50 rounded-2xl p-8 shadow-[0_0_50px_rgba(239,68,68,0.3)]">
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready To Join These Success Stories?
          </h3>
          <p className="text-gray-300 text-lg mb-6 leading-relaxed">
            Get your <span className="text-teal-400 font-semibold">FREE Business Scan</span> and discover which Super Agents 
            can transform your business. Takes 2 minutes, gives you a custom roadmap.
          </p>
          
          <motion.button
            onClick={handleGetScanClick}
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 0 60px rgba(34,197,94,0.6), 0 0 100px rgba(59,130,246,0.4), 0 0 140px rgba(147,51,234,0.3)'
            }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-5 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white font-bold text-xl rounded-xl shadow-[0_0_40px_rgba(34,197,94,0.5)] border border-green-400/30 transition-all duration-300"
          >
            <span className="flex items-center gap-3">
              <Zap className="w-6 h-6" />
              GET MY FREE BUSINESS SCAN NOW
              <ArrowUp className="w-6 h-6 rotate-45" />
            </span>
          </motion.button>
          
          <p className="text-gray-400 text-sm mt-4">
            Join <span className="text-cyan-400 font-semibold">{liveMetrics.businessesTransformed.toLocaleString()}+</span> businesses already dominating with AI Super Agents
          </p>
        </div>
      </motion.div>
    </section>
  );
}