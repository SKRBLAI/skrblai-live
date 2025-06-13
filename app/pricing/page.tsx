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
    description: 'Kick-start your adventure with essential AI side-kick powers—perfect for curious creators.',
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
    description: 'Recruit a mighty squad of 5 AI heroes and watch your workflow soar.',
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
    description: 'Deploy a full team of AI specialists to automate and amplify your business.',
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
    description: 'Command the entire SKRBL AI league with custom powers, integrations and white-label control.',
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

export default function PricingPage() {
  return (
    
      <PageLayout>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <div className="relative min-h-screen overflow-hidden">
            <FloatingParticles />
            <div className="flex flex-col items-center justify-center min-h-[80vh] py-16 z-10 relative">
              {/* Headline & Tagline */}
              <motion.h1
                className="skrblai-heading text-3xl md:text-5xl text-center mb-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                Choose Your AI Superpower Plan
              </motion.h1>
              <motion.p 
                className="text-center max-w-2xl text-[#30D5C8]"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                From solo creators to growing teams, SKRBL AI offers a league of digital superheroes to help you create, automate, and scale—faster than ever. Pick the plan that fits your journey. All tiers come with Percy’s cosmic guidance and a risk-free 3-Day Free Trial.
              </motion.p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-center items-stretch mt-16 max-w-7xl mx-auto px-4">
                <PricingCard
                  title="Reserve"
                  price="$7.99/mo"
                  features={["Access to Basic AI Agents", "Limited Publishing", "Community Support", "Basic Analytics"]}
                  ctaText="Start Reserve"
                  ctaHref="/sign-up?plan=reserve"
                  badge="Reserve"
                  description="Kick-start your adventure with essential AI side-kick powers—perfect for curious creators."
                />
                <PricingCard
                  title="Starter"
                  price="$19.99/mo"
                  features={["Access to 5 AI Agents", "Limited Publishing", "Priority Percy Access", "Advanced Analytics", "Custom Workflows Access"]}
                  ctaText="Upgrade to Starter"
                  ctaHref="/sign-up?plan=starter"
                  highlight
                  badge="Best Value"
                  description="Recruit a mighty squad of 5 AI heroes and watch your workflow soar." 
                />
                <PricingCard
                  title="Star"
                  price="$39.99/mo"
                  features={["Access to 10+ AI Agents", "Enhanced Publishing", "Priority Support", "Advanced Workflows", "Team Collaboration"]}
                  ctaText="Upgrade to Star"
                  ctaHref="/sign-up?plan=star"
                  badge="Star"
                  description="Deploy a full team of AI specialists to automate and amplify your business." 
                />
                <PricingCard
                  title="All-Star"
                  price="$299.99/mo"
                  features={["Unlimited AI Agent Access", "Custom Agent Development", "White-label Options", "API Access & Integrations", "Dedicated Account Manager", "Custom Workflows"]}
                  ctaText="Contact Sales"
                  ctaHref="/contact"
                  badge="Enterprise"
                  description="Command the entire SKRBL AI league with custom powers, integrations and white-label control." 
                />
              </div>
            </div>
          </div>
        </motion.div>
      </PageLayout>
    
  );
}
