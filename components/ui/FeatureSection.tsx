'use client';

import { motion } from 'framer-motion';

const features = [
  {
    id: 1,
    title: 'AI Publishing',
    description: 'Automate content creation and scheduling across all platforms',
    icon: '📝'
  },
  {
    id: 2,
    title: 'AI Branding',
    description: 'Generate stunning brand assets and style guides instantly',
    icon: '🎨'
  },
  {
    id: 3,
    title: 'Web Automation',
    description: 'Build and optimize websites with AI-powered tools',
    icon: '🌐'
  }
];

export function FeatureSection() {
  return (
    <section className="container mx-auto px-4 py-20">
      <h2 className="text-3xl font-bold text-center mb-12 text-electric-blue">
        Our Core Features
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            viewport={{ once: true }}
          >
            <div className="bg-deep-navy/80 p-8 rounded-xl border border-electric-blue/20">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-soft-gray/80">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
} 