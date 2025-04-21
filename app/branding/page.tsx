'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import BrandingCard from '@/components/branding/BrandingCard';
import '@/styles/shared/layout.css';

const brandingServices = [
  {
    title: 'Logo Generation',
    description: 'Generate custom logos that align with your brand values and aesthetic preferences.',
    icon: '🎨',
    intent: 'logo-design'
  },
  {
    title: 'Visual Identity',
    description: 'Develop a complete visual identity including color palettes, typography, and design elements.',
    icon: '🎭',
    intent: 'visual-identity'
  },
  {
    title: 'Brand Voice',
    description: 'Define your brand\'s tone, voice, and messaging strategy for consistent communication.',
    icon: '📝',
    intent: 'brand-voice'
  },
  {
    title: 'Brand Guidelines',
    description: 'Generate comprehensive brand guidelines to ensure consistency across all channels.',
    icon: '🚀',
    intent: 'brand-guidelines'
  },
  {
    title: 'Social Media Kits',
    description: 'Create platform-specific branding assets optimized for each social media channel.',
    icon: '📱',
    intent: 'social-kit'
  },
  {
    title: 'Brand Strategy',
    description: 'Develop a comprehensive brand strategy aligned with your business goals.',
    icon: '🎯',
    intent: 'brand-strategy'
  }
];

export default function BrandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  return (
    <div ref={containerRef} className="page-container">
      {/* Animated background */}
      <motion.div
        className="floating-particles"
        style={{ y: backgroundY }}
        aria-hidden="true"
      />

      <div className="page-content">
        <div className="responsive-container py-20">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-[0_0_4px_rgba(138,43,226,0.7)]"
          >
            AI-Powered Branding
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xl text-gray-400 max-w-3xl mx-auto"
          >
            Create a cohesive brand identity in minutes with our AI-powered branding platform
          </motion.p>
        </div>

        {/* Main features grid */}
        {/* Desktop Grid */}
        <div className="hidden md:grid grid-cols-3 gap-8 mb-16">
          {brandingServices.map((service, index) => (
            <BrandingCard
              key={service.intent}
              {...service}
              index={index}
            />
          ))}
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden carousel-container">
          <motion.div 
            className="carousel-track"
            drag="x"
            dragConstraints={{ left: -1200, right: 0 }}
          >
            {brandingServices.map((service, index) => (
              <motion.div
                key={service.intent}
                className="min-w-[300px]"
              >
                <BrandingCard
                  {...service}
                  index={index}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="glass-card p-6 rounded-2xl"
          >
            <div className="h-12 w-12 rounded-xl bg-electric-blue/20 flex items-center justify-center mb-4">
              <span className="text-2xl">🎨</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Logo Generation</h3>
            <p className="text-gray-400">Generate custom logos that align with your brand values and aesthetic preferences.</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="glass-card p-6 rounded-2xl"
          >
            <div className="h-12 w-12 rounded-xl bg-electric-blue/20 flex items-center justify-center mb-4">
              <span className="text-2xl">🎭</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Visual Identity</h3>
            <p className="text-gray-400">Develop a complete visual identity including color palettes, typography, and design elements.</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="glass-card p-6 rounded-2xl"
          >
            <div className="h-12 w-12 rounded-xl bg-electric-blue/20 flex items-center justify-center mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Brand Voice</h3>
            <p className="text-gray-400">Define your brand's tone, voice, and messaging strategy for consistent communication.</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="glass-card p-6 rounded-2xl"
          >
            <div className="h-12 w-12 rounded-xl bg-electric-blue/20 flex items-center justify-center mb-4">
              <span className="text-2xl">🚀</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Brand Guidelines</h3>
            <p className="text-gray-400">Generate comprehensive brand guidelines to ensure consistency across all channels.</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
            className="glass-card p-6 rounded-2xl"
          >
            <div className="h-12 w-12 rounded-xl bg-electric-blue/20 flex items-center justify-center mb-4">
              <span className="text-2xl">📱</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Social Media Kits</h3>
            <p className="text-gray-400">Create platform-specific branding assets optimized for each social media channel.</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            className="glass-card p-6 rounded-2xl"
          >
            <div className="h-12 w-12 rounded-xl bg-electric-blue/20 flex items-center justify-center mb-4">
              <span className="text-2xl">🔄</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Brand Evolution</h3>
            <p className="text-gray-400">AI-powered recommendations to evolve your brand based on market trends and performance.</p>
          </motion.div>
        </div>
        
        {/* Call to action */}
        <Link href="/dashboard/branding" className="block mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="glass-card p-6 rounded-2xl text-center hover:bg-electric-blue/10 transition-all cursor-pointer"
          >
            <h3 className="text-xl font-semibold text-white mb-2">Ready to elevate your brand?</h3>
            <p className="text-gray-400">Access our full suite of branding tools in the dashboard</p>
          </motion.div>
        </Link>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-gray-400 mb-6">
            Ready to transform your brand? Select a service above to get started with Percy, your AI branding assistant.
          </p>
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="text-center"
        >
          <h2 className="text-white text-3xl font-bold mb-6 drop-shadow-[0_0_6px_rgba(165,120,255,0.75)]">Ready to Transform Your Brand?</h2>
          <Link href="/?intent=design_brand#percy">
            <button className="bg-electric-blue hover:shadow-lg text-white font-semibold px-6 py-3 rounded-lg transition-all
              duration-300 hover:drop-shadow-[0_0_8px_rgba(165,120,255,0.75)] transform hover:scale-105">
              Start Building Your Brand
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  </div>
  );
}