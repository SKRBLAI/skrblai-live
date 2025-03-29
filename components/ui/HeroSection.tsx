'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { fadeInUp, staggerContainer, hoverScale } from '@/utils/animations';

const HeroSection = () => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-deep-navy to-black text-white px-4 relative overflow-hidden py-20">
      {/* Animated background gradients */}
      <motion.div 
        className="absolute inset-0 opacity-20"
        animate={{
          background: [
            'radial-gradient(circle, rgba(30,144,255,0.2) 0%, rgba(0,0,0,0) 50%)',
            'radial-gradient(circle, rgba(48,213,200,0.2) 0%, rgba(0,0,0,0) 50%)',
          ],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-electric-blue/30 rounded-full filter blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-teal/30 rounded-full filter blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
      </motion.div>
      
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
              animate={{ rotate: [0, 10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            >
              ⚡
            </motion.span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto font-inter">
            SKRBL AI helps you automate content, branding, and website building — all powered by AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <motion.div {...hoverScale}>
              <Link href="/signup" className="block">
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
            className="relative w-full h-[400px] rounded-xl overflow-hidden shadow-2xl border border-white/10"
            whileHover={{ scale: 1.02 }}
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
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;