'use client';
import React from 'react';
import { motion } from 'framer-motion';
import PageLayout from 'components/layout/PageLayout';
import PercyProvider from '../../components/assistant/PercyProvider';
import FloatingParticles from '@/components/ui/FloatingParticles';
import Link from 'next/link';

const plans = [
  {
    title: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Explore basic features and try out a few AI agents.',
    features: [
      'Access to 3 AI Agents',
      'Limited Publishing',
      'Community Support',
      'Basic Analytics'
    ],
    gradient: 'from-sky-400 to-teal-300',
    cta: 'Start Free',
    href: '/auth/signup'
  },
  {
    title: 'Pro',
    price: '$19',
    period: 'per month',
    description: 'Perfect for creators and solopreneurs ready to scale.',
    features: [
      'All AI Agents',
      'Unlimited Publishing',
      'Priority Percy Access',
      'Advanced Analytics',
      'Custom Workflows'
    ],
    gradient: 'from-amber-500 to-orange-500',
    cta: 'Upgrade Now',
    href: '/auth/signup?plan=pro',
    popular: true
  },
  {
    title: 'Enterprise',
    price: 'Custom',
    period: 'per month',
    description: 'For teams and orgs needing full-scale automation.',
    features: [
      'Dedicated AI Concierge',
      'Custom Agent Development',
      'Team Access & Collaboration',
      'Priority Support',
      'Custom Integrations'
    ],
    gradient: 'from-purple-500 to-indigo-500',
    cta: 'Talk to Percy',
    href: '/contact'
  }
];

export default function PricingPage() {
  return (
    <PercyProvider>
      <PageLayout>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <div className="relative min-h-screen bg-gradient-to-b from-[#0d1117] to-[#161b22] overflow-hidden">
            <FloatingParticles />
            <div className="max-w-7xl mx-auto px-4 py-16 z-10 relative">
              <div className="text-center mb-16">
                <motion.h1 
                  className="text-4xl font-bold text-white mb-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Choose Your Plan
                </motion.h1>
                <motion.p 
                  className="text-lg text-gray-300"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Whether you're starting out or scaling up, SKRBL AI has a plan for you.
                </motion.p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan, idx) => (
                  <motion.div
                    key={plan.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 + 0.4 }}
                    className={`glass-card p-6 rounded-xl backdrop-blur-lg border ${
                      plan.popular ? 'border-teal-400/50 shadow-teal-400/20' : 'border-sky-500/10'
                    } relative`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="bg-teal-400 text-deep-navy px-3 py-1 rounded-full text-sm font-semibold">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <h2 className="text-2xl font-semibold text-white mb-2">{plan.title}</h2>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-white">{plan.price}</span>
                      <span className="text-gray-400 ml-2">/{plan.period}</span>
                    </div>
                    <p className="text-gray-300 mb-6">{plan.description}</p>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="text-gray-300 flex items-center">
                          <span className="text-teal-400 mr-2">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link href={plan.href}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-full px-4 py-2 rounded-lg bg-gradient-to-r ${plan.gradient} text-deep-navy font-semibold shadow-lg hover:shadow-teal-500/20`}
                      >
                        {plan.cta}
                      </motion.button>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </PageLayout>
    </PercyProvider>
  );
}
