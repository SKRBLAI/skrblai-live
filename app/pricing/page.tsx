'use client';
import React from 'react';
import { motion } from 'framer-motion';
import PageLayout from 'components/layout/PageLayout';
import FloatingParticles from '@/components/ui/FloatingParticles';
import PricingCard from '@/components/ui/PricingCard';

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
    
      <PageLayout>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <div className="relative min-h-screen bg-gradient-to-b from-[#0d1117] to-[#161b22] overflow-hidden">
            <FloatingParticles />
            <div className="max-w-7xl mx-auto px-4 py-16 z-10 relative">
              <div className="text-center mb-16">
                <motion.h1 
                  className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-[#1E90FF] via-[#30D5C8] to-[#1E90FF] bg-clip-text text-transparent drop-shadow-[0_0_18px_#1E90FF]"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Choose Your Plan
                </motion.h1>
                <motion.p 
                  className="text-lg text-[#30D5C8]"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Whether you're starting out or scaling up, SKRBL AI has a plan for you.
                </motion.p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                <PricingCard
                  title="Free"
                  price="$0"
                  features={["Access to 3 AI Agents", "Limited Publishing", "Community Support", "Basic Analytics"]}
                  ctaText="Start Free"
                  ctaHref="/auth/signup"
                  badge="Starter"
                  description="Explore basic features and try out a few AI agents."
                />
                <PricingCard
                  title="Pro"
                  price="$19/mo"
                  features={["All AI Agents", "Unlimited Publishing", "Priority Percy Access", "Advanced Analytics", "Custom Workflows"]}
                  ctaText="Upgrade Now"
                  ctaHref="/auth/signup?plan=pro"
                  highlight
                  badge="Best Value"
                  description="Perfect for creators and solopreneurs ready to scale."
                />
                <PricingCard
                  title="Enterprise"
                  price="Custom"
                  features={["Dedicated AI Concierge", "Custom Agent Development", "Team Access & Collaboration", "Priority Support", "Custom Integrations"]}
                  ctaText="Talk to Percy"
                  ctaHref="/contact"
                  badge="Enterprise"
                  description="For teams and orgs needing full-scale automation."
                />
              </div>
            </div>
          </div>
        </motion.div>
      </PageLayout>
    
  );
}

