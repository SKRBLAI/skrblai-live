'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import BrandingCard from '@/components/branding/BrandingCard';
import PageLayout from '@/components/layouts/PageLayout';
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
    icon: '🖌️',
    intent: 'visual-identity'
  },
  {
    title: 'Brand Voice',
    description: 'Define your brand\'s tone, voice, and messaging strategy for consistent communication.',
    icon: '🗣️',
    intent: 'brand-voice'
  },
  {
    title: 'Brand Guidelines',
    description: 'Generate comprehensive brand guidelines to ensure consistency across all channels.',
    icon: '📖',
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
    icon: '🚀',
    intent: 'brand-strategy'
  }
];

export default function BrandingPage() {
  return (
    <PageLayout title="AI-Powered Branding">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            AI-Powered Branding
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Create a powerful brand identity with our AI-driven branding tools
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {brandingServices.map((service, index) => (
            <BrandingCard
              key={service.intent}
              {...service}
              index={index}
            />
          ))}
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-center text-gray-400 mb-16 max-w-3xl mx-auto"
      >
        Create a cohesive brand identity in minutes with our AI-powered branding platform
      </motion.p>

      {/* Desktop Grid */}
      <div className="hidden md:grid grid-cols-3 gap-8 mb-16">
        {brandingServices.map((service, index) => (
          <BrandingCard
            key={service.intent}
            title={service.title}
            description={service.description}
            icon={service.icon}
            intent={service.intent}
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
                title={service.title}
                description={service.description}
                icon={service.icon}
                intent={service.intent}
                index={index}
              />
            </motion.div>
          ))}
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
      </motion.div>
    </PageLayout>
  );
}
