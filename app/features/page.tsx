import React from 'react';
import type { JSX } from 'react';
import { motion } from 'framer-motion';
import BrandLogo from '@/components/ui/BrandLogo';
import PercyProvider from '../../components/assistant/PercyProvider';
import PageLayout from 'components/layout/PageLayout';
import FloatingParticles from '@/components/ui/FloatingParticles';
import Link from 'next/link';
import { Metadata } from 'next';

const features = [
  {
    title: 'Branding',
    description: 'Create stunning brand identities with AI-powered logo design, color palette generation, and brand voice development.',
    icon: '🎨',
    href: '/branding',
    color: 'from-pink-500 to-rose-500'
  },
  {
    title: 'Publishing',
    description: 'Transform your manuscript into a published book with our AI-powered publishing pipeline.',
    icon: '📚',
    href: '/book-publishing',
    color: 'from-purple-500 to-indigo-500'
  },
  {
    title: 'Marketing',
    description: 'Generate engaging social content, compelling proposals, and deep analytics insights.',
    icon: '📈',
    href: '/services',
    color: 'from-sky-500 to-cyan-500'
  },
  {
    title: 'Web & Funnels',
    description: 'Build high-converting landing pages and sales funnels powered by AI.',
    icon: '🌐',
    href: '/services',
    color: 'from-teal-500 to-emerald-500'
  },
  {
    title: 'Custom AI Agents',
    description: 'Design and deploy your own AI agents tailored to your specific needs.',
    icon: '🤖',
    href: '/services',
    color: 'from-amber-500 to-orange-500'
  }
];

export const metadata: Metadata = {
  title: 'Features - SKRBL AI',
  description: 'Explore the powerful AI agents and automation features of SKRBL AI',
};

export default function FeaturesPage(): JSX.Element {
  return (
    <PageLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative min-h-screen w-full overflow-x-hidden"
      >
        <FloatingParticles />
      
        <div className="container relative z-10 mx-auto px-4 md:px-8 lg:px-12 py-16">
        <div className="flex flex-col items-center mb-8">
          <BrandLogo className="skrblai-heading text-center" />
          <span className="sr-only">Features</span>
        </div>
        
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          {features.map((feature, index) => (
            <Link href={feature.href} key={index} className="group">
              <motion.div 
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="cosmic-float-card shadow-cosmic rounded-2xl p-6 sm:p-8 h-full flex flex-col justify-between transition-all duration-300 bg-white/5 backdrop-blur-xl bg-clip-padding border-2 border-teal-400/20"
              >
                <div>
                  <div className="text-4xl mb-4 drop-shadow-glow">{feature.icon}</div>
                  <h3 className="skrblai-heading text-lg mb-3">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
                <div className="mt-6 flex justify-end">
                  <span className="text-sm text-cyan-400 flex items-center">
                    Explore <span className="ml-1">→</span>
                  </span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <Link href="/services/agents" className="inline-block">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="cosmic-btn-primary px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold shadow-cosmic"
            >
              Meet Our AI Agents
            </motion.button>
          </Link>
        </div>
        </div>
      </motion.div>
    </PageLayout>
  );
} 
