'use client';

import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, scaleIn } from '@/utils/animations';
import Image from 'next/image';

const features = [
  {
    id: 1,
    title: 'AI Publishing',
    description: 'Automated content creation + scheduling that saves hours weekly.',
    icon: '📝',
    image: '/images/ai-publishing.jpg'
  },
  {
    id: 2,
    title: 'AI Branding',
    description: 'Generate logos, social media content, and brand kits instantly.',
    icon: '🎨',
    image: '/images/ai-branding.jpg'
  },
  {
    id: 3,
    title: 'Web Automation',
    description: 'Auto-build and maintain SEO-optimized websites with AI assistance.',
    icon: '🌐',
    image: '/images/web-automation.jpg'
  }
];

const FeatureSection = () => {
  return (
    <section className="bg-gradient-to-b from-black to-deep-navy text-white py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <motion.div 
        className="max-w-6xl mx-auto"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        viewport={{ once: true }}
      >
        <motion.div variants={fadeInUp} className="text-center mb-20">
          <h2 className="text-5xl font-bold mb-6 font-poppins bg-gradient-to-r from-electric-blue to-teal bg-clip-text text-transparent">
            Core Features
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto font-inter">
            Powerful AI tools to transform your business workflow
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <motion.div
              key={feature.id}
              variants={scaleIn}
              whileHover={{ 
                y: -10,
                transition: { duration: 0.3 }
              }}
              className="group"
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 h-full border border-white/10 hover:border-electric-blue/50 transition-all duration-300">
                <div className="relative h-48 mb-6 rounded-lg overflow-hidden">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-4xl">{feature.icon}</div>
                </div>
                <h3 className="text-2xl font-semibold mb-4 font-poppins text-electric-blue">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default FeatureSection;