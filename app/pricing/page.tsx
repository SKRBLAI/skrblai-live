'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface PricingTier {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  features: string[];
  badge?: string;
  isPopular?: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 99,
    yearlyPrice: 79,
    description: 'Perfect for individuals and small teams getting started with content automation.',
    features: [
      'Up to 100 AI generations per month',
      'Basic content scheduling',
      'Social media automation',
      'Email support',
      'Basic analytics'
    ]
  },
  {
    id: 'growth',
    name: 'Growth',
    monthlyPrice: 299,
    yearlyPrice: 239,
    description: 'Ideal for growing businesses looking to scale their content creation.',
    features: [
      'Unlimited AI generations',
      'Advanced scheduling & automation',
      'Custom branding templates',
      'Priority support',
      'Advanced analytics & reporting',
      'Team collaboration tools'
    ],
    badge: 'Most Popular',
    isPopular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'For large organizations requiring custom solutions and dedicated support.',
    features: [
      'Everything in Growth, plus:',
      'Custom AI model training',
      'Dedicated account manager',
      'API access',
      'SSO & advanced security',
      'Custom integrations',
      'SLA guarantees'
    ]
  }
];

import PercyProvider from 'components/assistant/PercyProvider';
import PageLayout from '@/components/layout/PageLayout';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [hoveredTier, setHoveredTier] = useState<string | null>(null);

  const handlePlanClick = (tierId: string) => {
    // This will be implemented later with proper routing
    alert(`Selected plan: ${tierId}. Sign up functionality coming soon!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen py-20"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-electric-blue to-teal-400 bg-clip-text text-transparent"
          >
            Choose Your Plan
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xl text-gray-400"
          >
            Scale your content creation with our flexible pricing options
          </motion.p>

          <motion.div 
            className="mt-8 inline-flex items-center bg-white/5 rounded-full p-1"
            animate={{ scale: [0.95, 1] }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                !isAnnual ? 'bg-electric-blue text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                isAnnual ? 'bg-electric-blue text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Annual
              <span className="ml-1 text-xs opacity-75">Save 20%</span>
            </button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              onHoverStart={() => setHoveredTier(tier.id)}
              onHoverEnd={() => setHoveredTier(null)}
              className={`glass-card p-8 relative overflow-hidden transition-all duration-300 ${
                hoveredTier === tier.id ? 'transform scale-105' : ''
              } ${tier.isPopular ? 'border-electric-blue' : ''}`}
            >
              {tier.badge && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-electric-blue text-white">
                    {tier.badge}
                  </span>
                </div>
              )}

              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-2 text-white">{tier.name}</h3>
                <motion.div 
                  className="mb-4"
                  key={isAnnual ? 'yearly' : 'monthly'}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="text-4xl font-bold text-white">
                    {tier.id === 'enterprise' ? 'Custom' : 
                      `$${isAnnual ? tier.yearlyPrice : tier.monthlyPrice}`
                    }
                  </span>
                  {tier.id !== 'enterprise' && (
                    <span className="text-gray-400 ml-2">{isAnnual ? '/year' : '/month'}</span>
                  )}
                </motion.div>
                <p className="text-gray-400 mb-6">{tier.description}</p>

                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-300">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.4 + featureIndex * 0.1 }}
                        className="flex items-center w-full"
                      >
                        <svg className="w-5 h-5 text-electric-blue mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{feature}</span>
                      </motion.div>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanClick(tier.id)}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
                    tier.isPopular
                      ? 'bg-gradient-to-r from-electric-blue to-teal-400 text-white hover:shadow-lg hover:shadow-electric-blue/20'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {tier.id === 'enterprise' ? 'Contact Sales' : 'Get Started'}
                </button>
              </div>

              <div 
                className={`absolute inset-0 bg-gradient-to-r from-electric-blue/10 to-teal-400/10 transition-opacity duration-300 ${
                  hoveredTier === tier.id ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
