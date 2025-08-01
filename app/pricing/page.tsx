'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import ClientPageLayout from '../../components/layout/ClientPageLayout';
import CosmicHeading from '../../components/shared/CosmicHeading';
import CosmicButton from '../../components/shared/CosmicButton';
import GlassmorphicCard from '../../components/shared/GlassmorphicCard';
import PercyAvatar from '../../components/home/PercyAvatar';
import SkrblAiText from '../../components/shared/SkrblAiText';
import BillingToggle from '../../components/pricing/BillingToggle';
import PricingCard from '../../components/pricing/PricingCard';
import Link from 'next/link';
import { 
  Check, Shield, Sparkles, Crown, Zap, Rocket, 
  Star, MessageCircle, ArrowRight, Users, TrendingUp 
} from 'lucide-react';
import { 
  pricingPlans, 
  liveMetrics, 
  BillingPeriod, 
  LiveMetric,
  URGENCY_TIMER_INITIAL,
  METRICS_UPDATE_INTERVAL,
  TIMER_UPDATE_INTERVAL
} from '../../lib/config/pricing';

// Pricing page now uses centralized config
// Types and data imported from lib/config/pricing.ts

export default function PricingPage() {
  // Billing period state
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  
  // Live metrics state
  const [metrics, setMetrics] = useState(liveMetrics);
  const [urgencyTimer, setUrgencyTimer] = useState(URGENCY_TIMER_INITIAL);

/*
OLD HARDCODED PLANS - Now using pricingPlans from config
const oldPlans: any[] = [
  {
    id: 'gateway',
    title: 'Gateway',
    monthlyPrice: 0,
    annualPrice: 0,
    period: '3-Days Free',
    description: 'Taste the power. See what domination feels like.',
    features: [
      '3 Strategic Agents',
      'Percy Concierge Access',
      '10 Tasks/Agent/Month',
      'Community Support',
      'Basic Analytics'
    ],
    gradient: 'from-gray-600 to-gray-500',
    cta: 'Start Your Domination',
    href: '/sign-up',
    badge: 'Get Addicted',
    agentCount: 3,
    icon: <Zap className="w-6 h-6" />
  },
  {
    id: 'hustler',
    title: 'Starter Hustler',
    monthlyPrice: 27,
    annualPrice: 22,
    period: 'per month',
    description: 'Content creators & entrepreneurs: automation empire starts here.',
    features: [
      '6 Content Creator Agents',
      'Percy Basic Access',
      '50 Tasks/Agent/Month',
      'Social Media Automation',
      'Priority Support',
      'Advanced Analytics'
    ],
    gradient: 'from-blue-600 to-cyan-500',
    cta: 'Become a Hustler',
    href: '/sign-up?plan=starter',
    popular: true,
    badge: 'Perfect for Creators',
    agentCount: 6,
    icon: <Rocket className="w-6 h-6" />,
    savings: 'Save $60/year'
  },
  {
    id: 'dominator',
    title: 'Business Dominator',
    monthlyPrice: 69,
    annualPrice: 55,
    period: 'per month',
    description: 'Growing businesses: deploy the arsenal that makes competitors cry.',
    features: [
      '10 Growth Business Agents',
      'Percy + Advanced Analytics',
      '200 Tasks/Agent/Month',
      'Client Success Automation',
      'Video Content Machine',
      'Custom Workflows'
    ],
    gradient: 'from-yellow-500 to-orange-500',
    cta: 'Dominate Your Market',
    href: '/sign-up?plan=star',
    badge: 'Revenue Multiplier',
    agentCount: 10,
    icon: <Crown className="w-6 h-6" />,
    savings: 'Save $168/year'
  },
  {
    id: 'crusher',
    title: 'Industry Crusher',
    monthlyPrice: 269,
    annualPrice: 215,
    period: 'per month',
    description: 'Enterprise: complete arsenal for market domination.',
    features: [
      'Complete Agent Arsenal (14+)',
      'Percy + Predictive Intelligence',
      'Unlimited Tasks & Processing',
      'Custom Agent Builder',
      'White-label Options',
      'Dedicated Success Manager',
      'API Access',
      'Custom Integrations'
    ],
    gradient: 'from-purple-600 to-pink-600',
    cta: 'Crush Your Industry',
    href: '/sign-up?plan=all_star',
    enterprise: true,
    badge: 'Complete Annihilation',
    agentCount: 14,
    icon: <Star className="w-6 h-6" />,
    savings: 'Save $648/year'
  }
];

// Live social proof metrics
const socialProofMetrics = [
  { label: 'Businesses Automated Today', value: 1247, icon: <Users className="w-5 h-5" /> },
  { label: 'Revenue Generated This Month', value: '$2.8M', icon: <TrendingUp className="w-5 h-5" /> },
  { label: 'Competitors Eliminated', value: 89, icon: <Zap className="w-5 h-5" /> }
];
*/

  // Handle billing period change
  const handleBillingPeriodChange = (period: BillingPeriod) => {
    setBillingPeriod(period);
  };

  // Urgency timer
  useEffect(() => {
    const timer = setInterval(() => {
      setUrgencyTimer(prev => prev > 0 ? prev - 1 : URGENCY_TIMER_INITIAL);
    }, TIMER_UPDATE_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Live metrics animation
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.value + Math.floor(Math.random() * metric.increment) + 1
      })));
    }, METRICS_UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return (
    <ClientPageLayout>
      <div className="relative min-h-screen">
  
        
        <div className="container mx-auto px-4 py-24 relative z-10">
          {/* Disruption Hero Section */}
          <div className="max-w-6xl mx-auto text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="inline-flex flex-wrap sm:flex-nowrap items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full border border-orange-400/30 mb-6 max-w-full">
                <span className="text-2xl animate-pulse">🔥</span>
                <span className="text-orange-300 font-bold whitespace-nowrap">INDUSTRY DISRUPTION IN PROGRESS</span>
                <span className="text-orange-400 font-mono whitespace-nowrap">{formatTime(urgencyTimer)}</span>
              </div>
            </motion.div>

            <CosmicHeading level={1} className="mb-6">
              Stop Playing Small.<br />Choose Your Domination Level.
            </CosmicHeading>
            
            <motion.p
              className="text-xl text-electric-blue leading-relaxed mb-6 font-bold"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              While your competitors are still figuring out AI, you'll be deploying the arsenal that makes them extinct.
            </motion.p>
            
            <motion.p
              className="text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Every tier includes Percy's cosmic intelligence, N8N automation, and starts with our risk-free trial.
              <span className="text-cyan-400 font-semibold"> No contracts. No limits. Just pure automation domination.</span>
            </motion.p>

            {/* Live Metrics Dashboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12"
            >
              {metrics.map((metric, index) => (
                <div key={metric.label} className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 backdrop-blur-xl rounded-xl p-4 border border-cyan-400/30">
                  <div className="text-2xl font-bold text-cyan-400">
                    {metric.formatter 
                      ? metric.formatter(metric.value)
                      : metric.value.toLocaleString()
                    }
                  </div>
                  <div className="text-sm text-gray-400">{metric.label}</div>
                  <div className="text-xs text-green-400 font-semibold">🔥 Live updating</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="max-w-4xl mx-auto text-center mb-12"
          >
            <BillingToggle
              currentPeriod={billingPeriod}
              onPeriodChange={handleBillingPeriodChange}
              className="mb-8"
            />
          </motion.div>

          {/* Percy Intro */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-4xl mx-auto text-center mb-16"
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <Image
                src="/images/agents-percy-nobg-skrblai.webp"
                alt="Percy the Cosmic Concierge"
                width={80}
                height={80}
                className="rounded-full border-2 border-cyan-400/50 shadow-glow"
                priority
              />
              <div className="text-left">
                <h3 className="text-2xl font-bold text-cyan-400">Meet Percy</h3>
                <p className="text-gray-300">Your Cosmic Concierge & Automation Orchestrator</p>
              </div>
            </div>
            <p className="text-lg text-gray-300">
              <span className="text-cyan-400 font-bold">"Every plan includes me as your personal guide."</span> I'll connect you to the perfect agents, orchestrate your workflows, and ensure your competition becomes a distant memory.
            </p>
          </motion.div>

          {/* Enhanced Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 max-w-7xl mx-auto mb-16">
            {pricingPlans.map((plan, index) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                billingPeriod={billingPeriod}
                animationDelay={0.5 + index * 0.1}
                isHighlighted={plan.isPopular}
              />
            ))}
          </div>

          {/* Disruption Guarantee */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="max-w-4xl mx-auto text-center mb-16"
          >
            <GlassmorphicCard className="p-8 bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-2 border-green-400/30">
              <h3 className="text-2xl font-bold text-green-400 mb-4">🛡️ Zero-Risk Domination Guarantee</h3>
              <p className="text-lg text-gray-300 mb-4">
                <span className="text-green-400 font-bold">30-day money-back guarantee.</span> If <SkrblAiText variant="glow" size="sm">SKRBL AI</SkrblAiText> doesn't give you an unfair advantage over your competition, we'll refund every penny.
              </p>
              <p className="text-gray-400">
                Plus: Cancel anytime. No contracts. No commitments. Just pure automation power.
              </p>
            </GlassmorphicCard>
          </motion.div>

          {/* Partner/Sponsor Call-to-Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <GlassmorphicCard className="p-8 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-2 border-purple-400/30">
              <h3 className="text-2xl font-bold text-purple-400 mb-4">🤝 Looking to Partner or Sponsor?</h3>
              <p className="text-lg text-gray-300 mb-6">
                Want to be part of the AI automation revolution? We're disrupting industries and looking for visionary partners and sponsors who want to ride the wave.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <CosmicButton
                  href="/contact"
                  variant="outline"
                  size="lg"
                  className="border-purple-400 text-purple-400 hover:bg-purple-500/20"
                >
                  Partner With Us 🚀
                </CosmicButton>
                <CosmicButton
                  href="/contact"
                  variant="secondary"
                  size="lg"
                  className="border-cyan-400 text-cyan-400"
                >
                  Sponsor Innovation 💡
                </CosmicButton>
              </div>
            </GlassmorphicCard>
          </motion.div>
        </div>
      </div>
      
      {/* Sticky Percy Help Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, type: 'spring', stiffness: 300 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          className="group relative bg-gradient-to-r from-teal-500 to-cyan-500 p-4 rounded-full shadow-[0_0_30px_rgba(45,212,191,0.6)] border-2 border-teal-400/50 backdrop-blur-xl transition-all duration-300 hover:shadow-[0_0_50px_rgba(45,212,191,0.8)]"
          onClick={() => {
            // Add Percy help modal logic here
            console.log('Percy help activated!');
          }}
          aria-label="Get help from Percy AI"
        >
          <div className="relative w-12 h-12 flex items-center justify-center">
            {/* Percy Avatar */}
            <motion.div
              animate={{ 
                y: [0, -2, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-2xl"
            >
              🤖
            </motion.div>
            
            {/* Pulsing Ring */}
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full border-2 border-white/50"
            />
          </div>
          
          {/* Help Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="bg-[rgba(21,23,30,0.95)] backdrop-blur-xl border border-teal-400/30 rounded-lg px-3 py-2 text-sm text-white whitespace-nowrap shadow-lg">
              Need help choosing? Ask Percy! 💡
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-teal-400/30" />
            </div>
          </div>
        </motion.button>
      </motion.div>
    </ClientPageLayout>
  );
}
