'use client';

import React from 'react';
import { motion } from 'framer-motion';
import PageLayout from 'components/layout/PageLayout';
import GlassmorphicCard from '@/components/shared/GlassmorphicCard';
import CosmicButton from '@/components/shared/CosmicButton';
import CosmicHeading from '@/components/shared/CosmicHeading';
import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, Palette, FilePenLine, Megaphone, BarChart2, LayoutDashboard } from 'lucide-react';

const services = [
  {
    title: 'Book Publishing',
    description: 'Transform your manuscript into a polished book with our AI-powered publishing pipeline.',
    icon: <BookOpen className="w-8 h-8" />,
    href: '/book-publishing'
  },
  {
    title: 'Brand Design',
    description: 'Create stunning brand identities with AI-powered logo design and brand voice development.',
    icon: <Palette className="w-8 h-8" />,
    href: '/branding'
  },
  {
    title: 'Content Creation',
    description: 'Generate engaging content across all platforms with our AI content specialists.',
    icon: <FilePenLine className="w-8 h-8" />,
    href: '/content-automation'
  },
  {
    title: 'Marketing',
    description: 'Launch powerful marketing campaigns with AI-driven insights and automation.',
    icon: <Megaphone className="w-8 h-8" />,
    href: '/marketing'
  },
  {
    title: 'Analytics',
    description: 'Get deep insights into your performance with AI-powered analytics.',
    icon: <BarChart2 className="w-8 h-8" />,
    href: '/analytics'
  },
  {
    title: 'Custom Solutions',
    description: 'Build tailored AI solutions for your unique business needs.',
    icon: <LayoutDashboard className="w-8 h-8" />,
    href: '/custom-solutions'
  }
];

export default function ServicesPage() {
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
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.5 }}
        className="min-h-screen relative"
      >
        {/* FloatingParticles - COMMENTED OUT FOR MOBILE SCROLL CRASH DEBUGGING */}
        {/* <FloatingParticles
          particleCount={35}
          speed={0.35}
          size={2.5}
          colors={['#38bdf8', '#f472b6', '#0ea5e9', '#22d3ee']}
          glowIntensity={0.5}
        /> */}

        <div className="relative z-10 pt-16 sm:pt-20 lg:pt-24 px-4 md:px-8 lg:px-12">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <CosmicHeading className="text-4xl md:text-5xl lg:text-6xl mb-6">
              Let Percy Orchestrate Your Brand's Next Level
            </CosmicHeading>
            <p className="text-xl text-teal-300 max-w-2xl mx-auto mb-8 font-semibold">
              SKRBL AI automates, creates, and scales your business with a league of digital superheroes—led by your personal AI concierge.
            </p>
            <Image
              src="/images/Agents-percy-Buttons.png"
              alt="Percy the AI Concierge"
              width={128}
              height={128}
              className="rounded-full shadow-cosmic bg-white/10 border-2 border-cyan-400/30"
              priority
            />
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
          >
            {services.map((service, index) => (
              <GlassmorphicCard
                key={service.title}
                hoverEffect
                className="flex flex-col h-full"
              >
                <div className="flex flex-col h-full p-6">
                  <div className="flex items-center mb-4">
                    <div className="p-3 rounded-lg bg-gradient-to-r from-electric-blue to-cyan-400 shadow-glow mr-4">
                      {service.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-electric-blue">
                      {service.title}
                    </h3>
                  </div>
                  <p className="text-gray-300 mb-6 flex-grow">
                    {service.description}
                  </p>
                  <Link href={service.href} className="mt-auto">
                    <CosmicButton variant="secondary" className="w-full">
                      Explore {service.title}
                    </CosmicButton>
                  </Link>
                </div>
              </GlassmorphicCard>
            ))}
          </motion.div>

          {/* Percy Callout */}
          <motion.div
            className="max-w-3xl text-center mb-16 px-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <p className="text-lg md:text-xl text-teal-300 font-medium">
              <span className="font-bold text-white">Percy personalizes the experience.</span> No guesswork, no overwhelm—Percy guides you step by step and assembles the perfect digital squad for your goals.
            </p>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            className="flex flex-col sm:flex-row items-center gap-4 mb-24"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <a
              href="/sign-up"
              className="cosmic-btn-primary px-8 py-3 rounded-full font-bold text-lg shadow-glow"
            >
              Start Free Trial
            </a>
            <a
              href="/agents"
              className="cosmic-btn-secondary px-8 py-3 rounded-full font-semibold text-lg border border-teal-400/70 backdrop-blur-md"
            >
              Meet the Agent League
            </a>
          </motion.div>
        </div>
      </motion.div>
    </PageLayout>
  );
}
