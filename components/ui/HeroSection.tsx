'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-20 flex flex-col md:flex-row items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="md:w-1/2 mb-10 md:mb-0">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Transform Your Marketing with 
            <span className="text-electric-blue block mt-2">AI-Powered Creativity</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-soft-gray/80">
            Create stunning content, build your brand, and grow your business with next-generation AI tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/signup" className="btn-primary pseudo-3d text-center">
              Get Started Free
            </Link>
            <Link href="/pricing" className="btn-secondary pseudo-3d text-center">
              View Pricing
            </Link>
          </div>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="md:w-1/2 relative h-[400px] md:h-[500px]">
          <div className="absolute inset-0 bg-gradient-to-r from-electric-blue/20 to-teal/20 rounded-xl overflow-hidden">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] opacity-70 blur-md">
              <div className="w-full h-full bg-gradient-conic from-electric-blue via-teal to-electric-blue animate-pulse-slow"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3/4 h-3/4 relative rounded-lg overflow-hidden neon-border">
                <Image
                  src="/images/ai-dashboard-preview.jpg"
                  alt="SKRBL AI Dashboard"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}