'use client';

import { motion } from 'framer-motion';

const features = [
  {
    id: 1,
    title: 'AI Publishing',
    description: 'Automated content creation + scheduling that saves hours weekly.',
    icon: '📝'
  },
  {
    id: 2,
    title: 'AI Branding',
    description: 'Generate logos, social media content, and brand kits instantly.',
    icon: '🎨'
  },
  {
    id: 3,
    title: 'Web Automation',
    description: 'Auto-build and maintain SEO-optimized websites with AI assistance.',
    icon: '🌐'
  }
];

export function FeatureSection() {
  return (
    <section className="bg-white text-gray-900 py-20 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-10">Core Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              whileHover={{ y: -5 }}
              className="p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}