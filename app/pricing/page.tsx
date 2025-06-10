'use client';
import React from 'react';
import { motion } from 'framer-motion';
import PageLayout from 'components/layout/PageLayout';
import FloatingParticles from '@/components/ui/FloatingParticles';
import PricingCard from '@/components/ui/PricingCard';

const plans = [
  {
    title: 'Reserve',
      price: '$7.99',
    period: 'per month',
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
    title: 'Starter',
    price: '$19.99',
    period: 'per month',
    description: 'Perfect for creators and solopreneurs ready to scale.',
    features: [
      'Access to 5 AI Agents',
      'Limited Publishing',
      'Priority Percy Access',
      'Advanced Analytics',
      'Custom Workflows Access'
    ],
    gradient: 'from-amber-500 to-orange-500',
    cta: 'Upgrade Now',
    href: '/sign-up?plan=starter',
    popular: true
  },
  {
    title: 'Star',
    price: '$39.99',
    period: 'per month',
    description: 'For teams and small orgs needing enhanced automation.',
    features: [
      'Access to 10+ AI Agents',
      'Enhanced Publishing',
      'Priority Support',
      'Advanced Workflows',
      'Team Collaboration'
    ],
    gradient: 'from-purple-500 to-indigo-500',
    cta: 'Upgrade to Star',
    href: '/sign-up?plan=star'
  },
  {
    title: 'All-Star',
    price: '$99.99',
    period: 'per month',
    description: 'For enterprises needing full-scale automation and custom solutions.',
    features: [
      'Unlimited AI Agent Access',
      'Custom Agent Development',
      'White-label Options',
      'API Access & Integrations',
      'Dedicated Account Manager',
      'Custom Workflows & Automations'
    ],
    gradient: 'from-gradient-purple to-gradient-pink',
    cta: 'Contact Sales',
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-center items-stretch mt-16 max-w-7xl mx-auto px-4">
                <PricingCard
                  title="Reserve"
                  price="$7.99/mo"
                  features={["Access to Basic AI Agents", "Limited Publishing", "Community Support", "Basic Analytics"]}
                  ctaText="Start Reserve"
                  ctaHref="/sign-up?plan=reserve"
                  badge="Reserve"
                  description="Explore basic features and try out a few AI agents."
                />
                <PricingCard
                  title="Starter"
                  price="$19.99/mo"
                  features={["Access to 5 AI Agents", "Limited Publishing", "Priority Percy Access", "Advanced Analytics", "Custom Workflows Access"]}
                  ctaText="Upgrade to Starter"
                  ctaHref="/sign-up?plan=starter"
                  highlight
                  badge="Best Value"
                  description="Perfect for creators and solopreneurs ready to scale."
                />
                <PricingCard
                  title="Star"
                  price="$39.99/mo"
                  features={["Access to 10+ AI Agents", "Enhanced Publishing", "Priority Support", "Advanced Workflows", "Team Collaboration"]}
                  ctaText="Upgrade to Star"
                  ctaHref="/sign-up?plan=star"
                  badge="Star"
                  description="For teams and small orgs needing enhanced automation."
                />
                <PricingCard
                  title="All-Star"
                  price="$99.99/mo"
                  features={["Unlimited AI Agent Access", "Custom Agent Development", "White-label Options", "API Access & Integrations", "Dedicated Account Manager", "Custom Workflows"]}
                  ctaText="Contact Sales"
                  ctaHref="/contact"
                  badge="Enterprise"
                  description="For enterprises needing full-scale automation and custom solutions."
                />
              </div>
            </div>
          </div>
        </motion.div>
      </PageLayout>
    
  );
}

