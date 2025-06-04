'use client';

import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, scaleIn } from '@/utils/animations';
import Image from 'next/image';

const features = [
  {
    id: 1,
    title: 'AI Publishing',
    description: 'Unleash cosmic creativity—AI crafts, schedules, and launches your content while you sleep among the stars!',
    icon: '📝',
    image: '/images/ai-publishing.jpg',
    premium: false
  },
  {
    id: 2,
    title: 'AI Branding',
    description: 'Summon legendary brands! Instantly conjure logos, social posts, and a brand voice that’s out of this world.',
    icon: '🎨',
    image: '/images/ai-branding.jpg',
    premium: true
  },
  {
    id: 3,
    title: 'Web Automation',
    description: 'Your web presence, supercharged: AI builds, optimizes, and maintains your site at light speed.',
    icon: '🌐',
    image: '/images/web-automation.jpg',
    premium: false
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
          <h2 className="text-5xl font-extrabold mb-6 font-poppins bg-gradient-to-r from-[#1E90FF] via-[#30D5C8] to-[#1E90FF] bg-clip-text text-transparent drop-shadow-[0_0_18px_#1E90FF]">
            Core Features
          </h2>
          <p className="text-xl text-[#30D5C8] max-w-2xl mx-auto font-inter">
            Powerful AI tools to transform your business workflow
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <motion.div
              key={feature.id}
              variants={scaleIn}
              whileHover={{ 
                y: -16,
                scale: 1.04,
                boxShadow: '0 0 48px 12px #a21caf99',
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.98 }}
              className="group"
              tabIndex={0}
              aria-label={`${feature.title} feature card`}
              role="button"
            >
              <div className="cosmic-glass cosmic-gradient cosmic-glow rounded-2xl p-8 h-full border-2 border-[#30D5C8] group-hover:border-[#a21caf] shadow-[0_0_32px_#a21caf40] transition-all duration-300 relative">
                {/* Premium badge and lock for premium features */}
                {feature.premium && (
                  <span className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 rounded-full bg-[#1E90FF] text-white text-xs font-bold shadow-[0_0_10px_#1E90FF80] z-10" title="This feature unlocks cosmic-level powers!">
                    <span className="mr-1" aria-hidden="true">🌟</span> Premium
                    <span className="ml-1" aria-label="Locked feature">🔒</span>
                  </span>
                )}
                <div className="relative h-48 mb-6 rounded-lg overflow-hidden cosmic-glass cosmic-glow">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-4xl">{feature.icon}</div>
                </div>
                <h3 className="text-2xl font-extrabold mb-4 font-poppins bg-gradient-to-r from-[#1E90FF] via-[#30D5C8] to-[#1E90FF] bg-clip-text text-transparent drop-shadow-[0_0_10px_#1E90FF]" aria-label={`Feature: ${feature.title}`}
                  tabIndex={0}
                >
                  {feature.title}
                  {feature.premium && <span className="ml-2 align-middle text-[#30D5C8]" title="Premium feature" aria-label="Premium feature">🔒</span>}
                </h3>
                <p className="text-[#30D5C8] leading-relaxed" aria-label={`Feature description: ${feature.description}`}
                  tabIndex={0}
                >
                  {feature.description}
                </p>
                <span className="sr-only">Press Enter or tap for more cosmic details.</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default FeatureSection;