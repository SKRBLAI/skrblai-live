'use client';

import React from 'react';
import type { JSX } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import CosmicBackground from '../shared/CosmicBackground';
import CosmicHeading from '../shared/CosmicHeading';
import GlassmorphicCard from '../shared/GlassmorphicCard';
import CosmicButton from '../shared/CosmicButton';

interface Feature {
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}

interface FeatureDisplayProps {
  features: Feature[];
}

export default function FeatureDisplay({ features }: FeatureDisplayProps): JSX.Element {
  return (
    <div className="relative min-h-screen">
      <CosmicBackground />
      
      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <CosmicHeading level={1}>Explore Our Features</CosmicHeading>
          
          <motion.p
            className="text-xl text-electric-blue leading-relaxed mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Unleash the power of AI with our suite of digital superpowers.
          </motion.p>
          
          <motion.p
            className="text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            From branding to publishing, our AI agents are here to help you create, automate, and scale your business.
          </motion.p>
        </div>
      
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <GlassmorphicCard
              key={feature.title}
              className="p-8 h-full flex flex-col justify-between hover:scale-[1.02] hover:-translate-y-2 transition-all duration-300"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <div className="text-5xl mb-6 drop-shadow-glow">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-electric-blue mb-4">{feature.title}</h3>
                <p className="text-gray-300 mb-8">{feature.description}</p>
                
                <CosmicButton
                  href={feature.href}
                  variant="secondary"
                  size="lg"
                  className="w-full"
                >
                  Explore {feature.title}
                </CosmicButton>
              </motion.div>
            </GlassmorphicCard>
          ))}
        </div>
        
        <div className="mt-20 flex flex-col items-center gap-8">
          <div className="flex flex-wrap gap-4 justify-center">
            <CosmicButton href="/" variant="outline">
              ← Back to Home
            </CosmicButton>
            <CosmicButton href="/agents" variant="primary">
              Meet Percy
            </CosmicButton>
          </div>
          
          <CosmicButton
            href="/sign-up"
            variant="primary"
            size="lg"
            className="w-full max-w-xs"
          >
            Start Free Trial
          </CosmicButton>
        </div>
      </div>
    </div>
  );
}
