'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function BookPublishingPage() {
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
            AI-Powered Book Publishing
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xl text-gray-400 max-w-3xl mx-auto"
          >
            Turn your manuscript into a published book with our cutting-edge AI publishing platform
          </motion.p>
        </div>

        {/* Main content section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-card p-8 rounded-2xl"
          >
            <h2 className="text-2xl font-bold mb-4 text-white">How It Works</h2>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-electric-blue/20 flex items-center justify-center text-electric-blue font-bold">
                  1
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-medium text-white">Upload Your Manuscript</h3>
                  <p className="mt-1 text-gray-400">Upload your manuscript in any format. Our AI will analyze and prepare it for publishing.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-electric-blue/20 flex items-center justify-center text-electric-blue font-bold">
                  2
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-medium text-white">AI Enhancement</h3>
                  <p className="mt-1 text-gray-400">Our AI will suggest formatting improvements, cover designs, and metadata optimization.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-electric-blue/20 flex items-center justify-center text-electric-blue font-bold">
                  3
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-medium text-white">Global Distribution</h3>
                  <p className="mt-1 text-gray-400">Publish your book across all major platforms like Amazon, Apple Books, and more with one click.</p>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="glass-card p-8 rounded-2xl"
          >
            <h2 className="text-2xl font-bold mb-4 text-white">Platform Features</h2>
            <ul className="space-y-4">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-electric-blue mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">AI-powered cover design generation</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-electric-blue mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">Automated formatting and typesetting</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-electric-blue mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">SEO-optimized book descriptions</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-electric-blue mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">Metadata optimization for discoverability</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-electric-blue mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">Multi-platform publishing with one click</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-electric-blue mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">Real-time sales dashboard and analytics</span>
              </li>
            </ul>
          </motion.div>
        </div>
        
        {/* CTA section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold mb-6 text-white">Ready to Publish Your Book?</h2>
          <Link href="/signup">
            <button className="px-8 py-4 bg-gradient-to-r from-electric-blue to-teal-400 text-white font-semibold rounded-lg
              hover:from-teal-400 hover:to-electric-blue transition-all duration-300 shadow-lg hover:shadow-electric-blue/20
              transform hover:scale-105">
              Start Publishing Now
            </button>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
} 