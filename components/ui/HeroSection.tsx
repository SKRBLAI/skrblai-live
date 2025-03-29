'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export function HeroSection() {
  return (
    <section className="h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0f2e] to-[#000] text-white px-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-electric-blue/30 rounded-full filter blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-teal/30 rounded-full filter blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
      </div>
      
      <div className="max-w-4xl text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Automate. Publish. Scale. <span className="text-electric-blue">⚡</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            SKRBL AI helps you automate content, branding, and website building — all powered by AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link href="/signup">
              <button className="px-8 py-3 bg-teal-500 hover:bg-teal-400 transition-all duration-300 rounded-lg text-lg font-semibold shadow-xl w-full sm:w-auto">
                Try It Free
              </button>
            </Link>
            <Link href="/pricing">
              <button className="px-8 py-3 bg-transparent hover:bg-white/10 border border-white/30 transition-all duration-300 rounded-lg text-lg font-semibold w-full sm:w-auto mt-3 sm:mt-0">
                View Pricing
              </button>
            </Link>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 relative max-w-2xl mx-auto"
        >
          <div className="relative w-full h-[300px] rounded-xl overflow-hidden shadow-2xl border border-white/10">
            <Image
              src="/images/ai-dashboard-preview.jpg"
              alt="SKRBL AI Dashboard"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}