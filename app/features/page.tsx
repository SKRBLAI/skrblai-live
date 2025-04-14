'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface Feature {
  id: string;
  title: string;
  description: string;
  stat: string;
  statDescription: string;
  icon: string;
}

const features: Feature[] = [
  {
    id: 'publishing',
    title: 'AI Publishing',
    description: 'Automate your content publishing workflow across all major platforms with intelligent scheduling and optimization.',
    stat: '10+',
    statDescription: 'hours saved per week',
    icon: '📱'
  },
  {
    id: 'branding',
    title: 'Branding Automation',
    description: 'Generate consistent brand assets and marketing materials in seconds, maintaining your unique brand identity.',
    stat: '5x',
    statDescription: 'faster brand asset creation',
    icon: '✨'
  },
  {
    id: 'ads',
    title: 'Ad Creative Generation',
    description: 'Create high-converting ad creatives with AI-powered design and copy suggestions based on performance data.',
    stat: '23%',
    statDescription: 'increase in click-through rate',
    icon: '🎯'
  }
];

export default function FeaturesPage() {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen py-20"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-[0_0_4px_rgba(138,43,226,0.7)]"
          >
            Supercharge Your Content Creation
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xl text-gray-400"
          >
            Powerful features to help you create, publish, and scale your content
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              onHoverStart={() => setHoveredFeature(feature.id)}
              onHoverEnd={() => setHoveredFeature(null)}
              className={`glass-card p-8 relative overflow-hidden transition-all duration-300 ${hoveredFeature === feature.id ? 'transform scale-105' : ''}`}
            >
              <div className="relative z-10">
                <span className="text-4xl mb-4 block">{feature.icon}</span>
                <h3 className="text-2xl font-bold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-400 mb-6">{feature.description}</p>
                
                <div className="bg-electric-blue/10 rounded-lg p-4">
                  <div className="text-3xl font-bold text-electric-blue mb-1">
                    {feature.stat}
                  </div>
                  <div className="text-sm text-gray-400">
                    {feature.statDescription}
                  </div>
                </div>
              </div>

              <div 
                className={`absolute inset-0 bg-gradient-to-r from-electric-blue/10 to-teal-400/10 transition-opacity duration-300 ${hoveredFeature === feature.id ? 'opacity-100' : 'opacity-0'}`}
              />
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-16"
        >
          <a
            href="/?intent=launch_website#percy"
            className="inline-block px-8 py-4 bg-electric-blue hover:bg-electric-blue/90 text-white rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            Get Started with SKRBL AI
          </a>
        </motion.div>
      </div>
    </motion.div>
  );
}
