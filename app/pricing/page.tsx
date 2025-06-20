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
    title: 'Enterprise',
    price: 'Custom',
    period: 'per month',
    description: 'Command the entire SKRBL AI league with custom powers, integrations and white-label control.',
    features: [
      'Unlimited AI Agent Access',
      'Custom Agent Development',
      'White-label Options',
      'API Access & Integrations',
      'Dedicated Account Manager',
      'Custom Workflows & Automations',
      'SLA & Priority Support',
      'Custom Training & Onboarding'
    ],
    gradient: 'from-gradient-purple to-gradient-pink',
    cta: 'Contact Sales',
    href: '/contact',
    enterprise: true
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
            <CosmicHeading level={1}>Choose Your AI Superpower Plan</CosmicHeading>
            
            <motion.p
              className="text-xl text-electric-blue leading-relaxed mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              From solo creators to growing teams, SKRBL AI offers a league of digital superheroes.
            </motion.p>
            
            <motion.p
              className="text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Help you create, automate, and scale—faster than ever. Pick the plan that fits your journey.
              All tiers come with Percy's cosmic guidance and a risk-free 3-Day Free Trial.
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
                      <span className="inline-block px-3 py-1 text-sm text-electric-blue bg-electric-blue/10 rounded-full">
                        Most Popular
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
