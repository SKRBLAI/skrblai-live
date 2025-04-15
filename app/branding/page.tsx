'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function BrandingPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen py-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-[0_0_4px_rgba(138,43,226,0.7)]"
          >
            AI-Powered Branding
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xl text-gray-400 max-w-3xl mx-auto"
          >
            Create a cohesive brand identity in minutes with our AI-powered branding platform
          </motion.p>
        </div>

        {/* Main features grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="glass-card p-6 rounded-2xl"
          >
            <div className="h-12 w-12 rounded-xl bg-electric-blue/20 flex items-center justify-center mb-4">
              <span className="text-2xl">🎨</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Logo Generation</h3>
            <p className="text-gray-400">Generate custom logos that align with your brand values and aesthetic preferences.</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="glass-card p-6 rounded-2xl"
          >
            <div className="h-12 w-12 rounded-xl bg-electric-blue/20 flex items-center justify-center mb-4">
              <span className="text-2xl">🎭</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Visual Identity</h3>
            <p className="text-gray-400">Develop a complete visual identity including color palettes, typography, and design elements.</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="glass-card p-6 rounded-2xl"
          >
            <div className="h-12 w-12 rounded-xl bg-electric-blue/20 flex items-center justify-center mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Brand Voice</h3>
            <p className="text-gray-400">Define your brand's tone, voice, and messaging strategy for consistent communication.</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="glass-card p-6 rounded-2xl"
          >
            <div className="h-12 w-12 rounded-xl bg-electric-blue/20 flex items-center justify-center mb-4">
              <span className="text-2xl">🚀</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Brand Guidelines</h3>
            <p className="text-gray-400">Generate comprehensive brand guidelines to ensure consistency across all channels.</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
            className="glass-card p-6 rounded-2xl"
          >
            <div className="h-12 w-12 rounded-xl bg-electric-blue/20 flex items-center justify-center mb-4">
              <span className="text-2xl">📱</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Social Media Kits</h3>
            <p className="text-gray-400">Create platform-specific branding assets optimized for each social media channel.</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            className="glass-card p-6 rounded-2xl"
          >
            <div className="h-12 w-12 rounded-xl bg-electric-blue/20 flex items-center justify-center mb-4">
              <span className="text-2xl">🔄</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Brand Evolution</h3>
            <p className="text-gray-400">AI-powered recommendations to evolve your brand based on market trends and performance.</p>
          </motion.div>
        </div>
        
        {/* Testimonial section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="glass-card p-8 rounded-2xl mb-16"
        >
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-electric-blue to-teal-400 rounded-full blur opacity-75"></div>
              <div className="relative h-20 w-20 rounded-full bg-gray-800 border-2 border-white/20 flex items-center justify-center">
                <span className="text-3xl">👩‍💼</span>
              </div>
            </div>
            <blockquote className="text-xl italic text-gray-300 mb-4">
              "SKRBL AI revolutionized our branding process. What used to take weeks with an agency now takes hours, and the quality is incredible."
            </blockquote>
            <p className="font-semibold text-white">Sarah Johnson</p>
            <p className="text-gray-400 text-sm">Marketing Director, TechVision</p>
          </div>
        </motion.div>
        
        {/* CTA section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="text-center"
        >
          <h2 className="text-white text-3xl font-bold mb-6 drop-shadow-[0_0_6px_rgba(165,120,255,0.75)]">Ready to Transform Your Brand?</h2>
          <Link href="/?intent=design_brand#percy">
            <button className="bg-electric-blue hover:shadow-lg text-white font-semibold px-6 py-3 rounded-lg transition-all
              duration-300 hover:drop-shadow-[0_0_8px_rgba(165,120,255,0.75)] transform hover:scale-105">
              Start Building Your Brand
            </button>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
} 