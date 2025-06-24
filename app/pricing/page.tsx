'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PageLayout from '@/components/layout/PageLayout';
import CosmicBackground from '@/components/shared/CosmicBackground';
import CosmicHeading from '@/components/shared/CosmicHeading';
import GlassmorphicCard from '@/components/shared/GlassmorphicCard';
import CosmicButton from '@/components/shared/CosmicButton';
import Image from 'next/image';
import SkrblAiText from '@/components/shared/SkrblAiText';

const plans = [
  {
    title: 'Gateway',
    price: 'FREE TRIAL',
    period: '3-Days',
    description: 'Taste the power with 3 strategic agents. See what industry domination feels like.',
    features: [
      '3 Strategic Agents (AdCreative, Analytics, Biz)',
      'Percy Concierge Access',
      '10 Tasks per Agent/Month',
      'Community Support',
      'Taste the Revolution'
    ],
    gradient: 'from-gray-600 to-gray-500',
    cta: 'Start Your Domination',
    href: '/sign-up',
    badge: 'Get Addicted',
    agentCount: 3,
    icon: '🎯'
  },
  {
    title: 'Starter Hustler',
    price: '$27',
    period: 'per month',
    description: 'Content creators & solo entrepreneurs: Your automation empire starts here.',
    features: [
      '6 Content Creator Agents',
      'Percy Basic Access',
      '50 Tasks per Agent/Month',
      'Social Media Automation',
      'Brand Development Kit',
      'Priority Support'
    ],
    gradient: 'from-blue-600 to-cyan-500',
    cta: 'Become a Hustler',
    href: '/sign-up?plan=starter',
    popular: true,
    badge: 'Perfect for Creators',
    agentCount: 6,
    icon: '⚡'
  },
  {
    title: 'Business Dominator',
    price: '$69',
    period: 'per month',
    description: 'Growing businesses: Deploy the arsenal that makes competitors cry.',
    features: [
      '10 Growth Business Agents',
      'Percy + Advanced Analytics',
      '200 Tasks per Agent/Month',
      'Client Success Automation',
      'Payment Processing Engine',
      'Video Content Machine',
      'Dedicated Success Support'
    ],
    gradient: 'from-yellow-500 to-orange-500',
    cta: 'Dominate Your Market',
    href: '/sign-up?plan=star',
    badge: 'Revenue Multiplier',
    agentCount: 10,
    icon: '🔥'
  },
  {
    title: 'Industry Crusher',
    price: '$269',
    period: 'per month',
    description: 'Enterprise disruptors: The complete arsenal for market domination.',
    features: [
      'Complete Agent Arsenal (14+ Agents)',
      'Percy + Predictive Intelligence',
      'Unlimited Tasks & Processing',
      'Custom Agent Builder Consultation',
      'White-label Options',
      'API Integration Access',
      'Dedicated Success Manager',
      'Revenue Guarantee Program'
    ],
    gradient: 'from-purple-600 to-pink-600',
    cta: 'Crush Your Industry',
    href: '/sign-up?plan=all_star',
    enterprise: true,
    badge: 'Complete Annihilation',
    agentCount: 14,
    icon: '👑'
  }
];

// Live metrics for engagement
const liveMetrics = [
  { label: 'Businesses Automated Today', value: 1247, increment: 3 },
  { label: 'Competitors Eliminated', value: 89, increment: 1 },
  { label: 'Revenue Generated', value: 2847291, increment: 1500 }
];

export default function PricingPage() {
  const [metrics, setMetrics] = useState(liveMetrics);
  const [urgencyTimer, setUrgencyTimer] = useState(23 * 60 + 47); // 23:47

  // Live metrics animation
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.value + Math.floor(Math.random() * metric.increment) + 1
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Urgency timer
  useEffect(() => {
    const timer = setInterval(() => {
      setUrgencyTimer(prev => prev > 0 ? prev - 1 : 23 * 60 + 59);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <PageLayout>
      <div className="relative min-h-screen">
        <CosmicBackground />
        
        <div className="container mx-auto px-4 py-24 relative z-10">
          {/* Disruption Hero Section */}
          <div className="max-w-6xl mx-auto text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full border border-orange-400/30 mb-6">
                <span className="text-2xl animate-pulse">🔥</span>
                <span className="text-orange-300 font-bold">INDUSTRY DISRUPTION IN PROGRESS</span>
                <span className="text-orange-400 font-mono">{formatTime(urgencyTimer)}</span>
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
                    {metric.label.includes('Revenue') 
                      ? `$${metric.value.toLocaleString()}`
                      : metric.value.toLocaleString()
                    }
                  </div>
                  <div className="text-sm text-gray-400">{metric.label}</div>
                  <div className="text-xs text-green-400 font-semibold">🔥 Live updating</div>
                </div>
              ))}
            </motion.div>
          </div>

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
            {plans.map((plan, index) => (
              <motion.div
                key={plan.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-full text-sm font-bold animate-pulse">
                      🏆 MOST POPULAR
                    </div>
                  </div>
                )}
                
                <GlassmorphicCard
                  className={`p-8 text-center h-full relative overflow-hidden ${
                    plan.popular ? 'border-2 border-yellow-400/50 shadow-2xl' : 
                    plan.enterprise ? 'border-2 border-purple-400/50' : ''
                  }`}
                >
                  {/* Agent Count Indicator */}
                  <div className="absolute top-4 right-4">
                    <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-3 py-1 rounded-full border border-cyan-400/30">
                      <span className="text-cyan-400 text-sm font-bold">{plan.agentCount} Agents</span>
                    </div>
                  </div>

                  {plan.badge && (
                    <div className="mb-4">
                      <span className="inline-flex items-center gap-2 px-3 py-1 text-sm text-electric-blue bg-electric-blue/10 rounded-full border border-electric-blue/30">
                        <span className="text-lg">{plan.icon}</span>
                        {plan.badge}
                      </span>
                    </div>
                  )}
                  
                  <h3 className="text-3xl font-bold text-electric-blue mb-2">{plan.title}</h3>
                  <div className="mb-4">
                    <span className="text-5xl font-bold text-white">{plan.price}</span>
                    {plan.price !== 'FREE' && <span className="text-gray-400 ml-1 text-lg">/{plan.period.split(' ')[1]}</span>}
                  </div>
                  
                  <p className="text-gray-300 mb-6 font-semibold">{plan.description}</p>
                  
                  <ul className="space-y-3 mb-8 text-left">
                    {plan.features.map((feature, idx) => (
                      <li key={feature} className="flex items-start text-gray-300">
                        <span className="text-green-400 mr-3 text-lg font-bold">✓</span>
                        <span className="flex-1">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <CosmicButton
                    href={plan.href}
                    variant={plan.enterprise ? 'outline' : plan.popular ? 'primary' : 'secondary'}
                    size="lg"
                    className={`w-full font-bold ${
                      plan.popular ? 'animate-pulse' : ''
                    } ${plan.enterprise ? 'hover:bg-purple-500/20 border-purple-400' : ''}`}
                  >
                    {plan.cta} {plan.icon}
                  </CosmicButton>
                  
                  {plan.popular && (
                    <div className="mt-4">
                      <span className="inline-block px-3 py-1 text-sm text-yellow-400 bg-yellow-400/10 rounded-full border border-yellow-400/30">
                        💰 Revenue Accelerator
                      </span>
                    </div>
                  )}

                  {plan.enterprise && (
                    <div className="mt-4">
                      <span className="inline-block px-3 py-1 text-sm text-purple-400 bg-purple-400/10 rounded-full border border-purple-400/30">
                        👑 Enterprise Arsenal
                      </span>
                    </div>
                  )}
                </GlassmorphicCard>
              </motion.div>
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
    </PageLayout>
  );
}
