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
      'Access to Basic Agents',
      'Limited Publishing',
      'Community Support',
      'Basic Analytics'
    ],
    gradient: 'from-sky-400 to-teal-300',
    cta: 'Start Free',
    href: '/sign-up'
  },
  {
    title: 'Pro',
    price: '$19',
    period: 'per month',
    description: 'Perfect for creators and solopreneurs ready to scale.',
    features: [
      'Access to 3 AI Agents',
      'Unlimited Publishing',
      'Simple Percy Access',
      'Basic Analytics',
      'Basic Workflows'
    ],
    gradient: 'from-amber-500 to-orange-500',
    cta: 'Upgrade Now',
    href: '/sign-up?plan=pro',
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

import BrandLogo from '@/components/ui/BrandLogo';

export default function PricingPage() {
  return (
    
      <PageLayout>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <div className="relative min-h-screen overflow-hidden">
            <FloatingParticles />
            <div className="flex flex-col items-center justify-center min-h-[80vh] py-16 z-10 relative">
              {/* Centered BrandLogo replacing any blurry text */}
              <BrandLogo className="skrblai-heading text-center mb-8 scale-125" animate />
              <motion.p 
                className="text-lg text-[#30D5C8]"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Whether you're starting out or scaling up, SKRBL AI has a plan for you.
              </motion.p>
              <div className="flex flex-col md:flex-row gap-12 md:gap-16 justify-center items-stretch mt-16">
                <PricingCard
                  title="Free"
                  price="$0"
                  features={["Access to Basic AI Agents", "Limited Publishing", "Community Support", "Basic Analytics"]}
                  ctaText="Explore Agents"
                  ctaHref="/services"
                  badge="Starter"
                  description="Explore basic features and try out a few AI agents."
                />
                <PricingCard
                  title="Pro"
                  price="$19/mo"
                  features={["Access to 3 AI Agents", "Unlimited Publishing", "Priority Percy Access", "Advanced Analytics", "Custom Workflows"]}
                  ctaText="Upgrade & Explore"
                  ctaHref="/services"
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

