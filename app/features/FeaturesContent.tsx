'use client';

import React, { JSX } from 'react';
import { motion } from 'framer-motion';
import PageLayout from 'components/layout/PageLayout';
import GlassmorphicCard from '@/components/shared/GlassmorphicCard';
import CosmicButton from '@/components/shared/CosmicButton';
import CosmicHeading from '@/components/shared/CosmicHeading';
import Link from 'next/link';

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

export default function FeaturesContent(): JSX.Element {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <PageLayout>
      <div className="min-h-screen relative z-10 pt-16 sm:pt-20 lg:pt-24 px-4 md:px-8 lg:px-12">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <CosmicHeading className="text-4xl md:text-5xl lg:text-6xl mb-6">
            Unleash Your Creative Potential
          </CosmicHeading>
          <p className="text-xl text-teal-300 max-w-2xl mx-auto font-semibold">
            Discover our suite of AI-powered tools designed to transform your creative process
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
        >
          {features.map((feature, index) => (
            <GlassmorphicCard
              key={feature.title}
              hoverEffect
              className="flex flex-col h-full"
            >
              <Link href={feature.href} className="flex flex-col h-full p-6 group">
                <div className={`w-12 h-12 rounded-lg mb-4 flex items-center justify-center text-2xl bg-gradient-to-r ${feature.color} shadow-glow transition-transform duration-300 group-hover:scale-110`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-electric-blue mb-3 transition-colors group-hover:text-teal-300">
                  {feature.title}
                </h3>
                <p className="text-gray-300 flex-grow">
                  {feature.description}
                </p>
                <div className="mt-4 flex items-center text-teal-300 group-hover:text-teal-400">
                  <span>Learn more</span>
                  <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </GlassmorphicCard>
          ))}
        </motion.div>
      </div>
    </PageLayout>
  );
}
