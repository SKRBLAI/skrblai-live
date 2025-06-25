'use client';

import { motion, AnimatePresence, Variants } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import FloatingBackground from './FloatingBackground';
import SkrblAiText from '@/components/shared/SkrblAiText';

const emojiVariants: Variants = {
  animate: {
    rotate: [0, 10, 0],
    transition: {
      duration: 0.5,
      repeat: Infinity,
      repeatDelay: 2,
    },
  },
};

const transitionProps = {
  duration: 0.5,
  ease: [0.43, 0.13, 0.23, 0.96] as const
};

const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { type: "tween", ...transitionProps }
  }
};

const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      type: "tween"
    }
  }
};

const hoverScale = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 }
};

const HeroSection = () => {

  return (
    <section className="min-h-screen flex items-center justify-center text-white px-4 relative overflow-hidden pt-16 pb-20">
      <FloatingBackground />
      
      <motion.div 
        className="max-w-4xl text-center z-10"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={fadeInUp}>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 font-poppins">
            Automate. Publish. Scale.{' '}
            <motion.span 
              className="inline-block text-electric-blue"
              variants={emojiVariants}
              animate="animate"
            >
              ⚡
            </motion.span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto font-inter">
            <SkrblAiText variant="glow" size="2xl">SKRBL AI</SkrblAiText> helps you automate content, branding, and website building — all powered by AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <motion.div {...hoverScale}>
              <Link href="/sign-up" className="block">
                <button className="px-8 py-4 bg-gradient-to-r from-electric-blue to-teal hover:from-teal hover:to-electric-blue transition-all duration-300 rounded-lg text-lg font-semibold shadow-xl hover:shadow-2xl w-full sm:w-auto">
                  Try It Free
                </button>
              </Link>
            </motion.div>
            <motion.div {...hoverScale}>
              <Link href="/pricing" className="block">
                <button className="px-8 py-4 bg-transparent hover:bg-white/10 border-2 border-white/30 hover:border-white/50 transition-all duration-300 rounded-lg text-lg font-semibold w-full sm:w-auto">
                  View Pricing
                </button>
              </Link>
            </motion.div>

          </div>
        </motion.div>
        
        <motion.div
          variants={fadeInUp}
          className="mt-16 relative max-w-3xl mx-auto"
        >
          <motion.div 
            className="relative w-full h-[400px] rounded-xl overflow-hidden shadow-2xl border border-white/10 glass-card"
            whileHover={{ 
              scale: 1.02,
              filter: 'drop-shadow(0 0 30px rgba(56, 189, 248, 0.2))'
            }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src="/images/ai-dashboard-preview.jpg"
              alt="SKRBL AI Dashboard"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-electric-blue/10 to-teal-500/10"
              animate={{
                opacity: [0, 0.5, 0],
                x: ['0%', '100%', '0%']
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: 'linear' as const
              }}
            />
          </motion.div>
        </motion.div>
      </motion.div>

    </section>
  );
};

export default HeroSection;