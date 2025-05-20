'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePercyContext } from '@/components/assistant/PercyProvider';
import BrandLogo from '@/components/ui/BrandLogo';
import FloatingParticles from '@/components/ui/FloatingParticles';
import SatisfactionBadge from '@/components/ui/SatisfactionBadge';


export default function HomePage() {
  const { setPercyIntent, closePercy } = usePercyContext();
  useEffect(() => {
    closePercy();
    setPercyIntent('');
    console.log('[Percy] Reset on HomePage mount: isOpen=false, percyIntent=\'\'');
  }, [closePercy, setPercyIntent]);

  return (
    <main className="min-h-screen relative text-white bg-[#0d1117] pt-16 overflow-hidden">
      {/* Hero Background */}
      <div className="absolute inset-0 z-0 opacity-40">
        <FloatingParticles />
      </div>
      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0d1117] via-[#0d1117]/90 to-[#0d1117]/80" />

      {/* Main Content */}
      <div className="relative z-10 pt-8 px-4 md:px-8 max-w-7xl mx-auto">
        {/* PercyHero: Futuristic hero with animated Percy, tagline, and cosmic glassmorphism */}
        <section className="mb-8">
          {/* PercyHero is fully accessible, mobile-first, and cosmic-themed */}
          <div className="flex flex-col items-center justify-center">
            {/* PercyHero component (animated Percy, dropdown, onboarding, etc.) */}
            
            {require('@/components/home/PercyHero').default()}
          </div>
        </section>

        {/* Agent Preview Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <Link href="/services" className="inline-block group">
            <h2 className="text-2xl md:text-3xl font-light mb-8 text-gradient-blue group-hover:scale-105 transition-transform duration-300 bg-[#0d1117]/80 backdrop-blur-sm p-4 rounded-lg inline-block">
              Meet Our League of Digital Superheroes
            </h2>
            <div className="flex justify-center gap-4 overflow-hidden py-8">
              {/* Agent Silhouettes Preview */}
              <div className="flex space-x-[-30px] hover:space-x-2 transition-all duration-500">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div 
                    key={i}
                    className="w-16 h-16 rounded-full bg-gradient-to-b from-teal-500/20 to-electric-blue/20 border border-white/10 transform hover:scale-110 transition-all duration-300 shadow-glow"
                  />
                ))}
              </div>
            </div>
          </Link>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-16 mb-24 text-center"
        >
          <p className="text-lg mb-8 text-teal-300 max-w-2xl mx-auto bg-[#0d1117]/80 backdrop-blur-sm p-4 rounded-lg">
            Ready to experience creative freedom? Explore our features or chat with Percy—your personal AI concierge—right now.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/features">
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-electric-blue text-white font-semibold rounded-lg shadow-glow hover:shadow-electric-blue/50 transition-all duration-300"
              >
                Get 7-Day Free Trial
              </motion.button>
            </Link>
            <Link href="/services">
              <motion.button 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-white/5 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300"
              >
                See Features
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
