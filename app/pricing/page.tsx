'use client';

import React from 'react';
import { motion } from 'framer-motion';
import PageLayout from '@/components/layout/PageLayout';
import CosmicBackground from '@/components/shared/CosmicBackground';
import CosmicHeading from '@/components/shared/CosmicHeading';
import GlassmorphicCard from '@/components/shared/GlassmorphicCard';
import CosmicButton from '@/components/shared/CosmicButton';

const plans = [
  {
    title: 'Gateway',
    price: 'FREE',
    period: 'forever',
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
    badge: 'Get Addicted'
  },
  {
    title: 'Starter Hustler',
    price: '$27',
    period: 'per month',
    description: 'Content creators & solo entrepreneurs: Your automation empire starts here.',
    features: [
      '6 Content Creator Agents',
      'Percy Unlimited Access',
      '50 Tasks per Agent/Month',
      'Social Media Automation',
      'Brand Development Kit',
      'Priority Support'
    ],
    gradient: 'from-blue-600 to-cyan-500',
    cta: 'Become a Hustler',
    href: '/sign-up?plan=starter',
    popular: true,
    badge: 'Perfect for Creators'
  },
  {
    title: 'Business Dominator',
    price: '$67',
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
    badge: 'Revenue Multiplier'
  },
  {
    title: 'Industry Crusher',
    price: '$147',
    period: 'per month',
    description: 'Enterprise disruptors: The complete arsenal for market domination.',
    features: [
      'Complete Agent Arsenal (14+ Agents)',
      'Percy + Predictive Intelligence',
      'Unlimited Tasks & Processing',
      'Custom Agent Builder',
      'White-label Options',
      'API Integration Access',
      'Dedicated Success Manager',
      'Revenue Guarantee Program'
    ],
    gradient: 'from-purple-600 to-pink-600',
    cta: 'Crush Your Industry',
    href: '/sign-up?plan=all_star',
    enterprise: true,
    badge: 'Complete Annihilation'
  }
];

export default function PricingPage() {
  return (
    <PageLayout>
      <div className="relative min-h-screen">
        <CosmicBackground />
        
        <div className="container mx-auto px-4 py-24 relative z-10">
          {/* Hero Section */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <CosmicHeading level={1}>Choose Your Domination Level</CosmicHeading>
            
            <motion.p
              className="text-xl text-electric-blue leading-relaxed mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              From content creators to industry crushers, SKRBL AI delivers the firepower your competitors fear.
            </motion.p>
            
            <motion.p
              className="text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Stop playing small. Choose the tier that matches your ambition and watch your competition become extinct.
              Every plan includes Percy's cosmic intelligence and starts with our risk-free trial.
            </motion.p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <GlassmorphicCard
                key={plan.title}
                className={`p-8 text-center ${plan.popular ? 'border-2 border-electric-blue' : ''}`}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  {plan.badge && (
                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 text-sm text-electric-blue bg-electric-blue/10 rounded-full">
                        {plan.badge}
                      </span>
                    </div>
                  )}
                  
                  <h3 className="text-2xl font-bold text-electric-blue mb-2">{plan.title}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-400 ml-1">{plan.period}</span>
                  </div>
                  
                  <p className="text-gray-300 mb-6">{plan.description}</p>
                  
                  <ul className="space-y-3 mb-8 text-left">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center text-gray-300">
                        <span className="text-electric-blue mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <CosmicButton
                    href={plan.href}
                    variant={plan.enterprise ? 'outline' : plan.popular ? 'primary' : 'secondary'}
                    size="lg"
                    className={`w-full ${plan.enterprise ? 'hover:bg-electric-blue/10' : ''}`}
                  >
                    {plan.cta}
                  </CosmicButton>
                  
                  {plan.popular && (
                    <div className="mt-4">
                      <span className="inline-block px-3 py-1 text-sm text-yellow-400 bg-yellow-400/10 rounded-full">
                        Revenue Accelerator
                      </span>
                    </div>
                  )}
                </motion.div>
              </GlassmorphicCard>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
