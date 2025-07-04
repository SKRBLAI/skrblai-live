'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import PercyAvatar from '@/components/ui/PercyAvatar';
import TrialButton from '@/components/ui/TrialButton';

export default function ContentAutomationPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen py-20"
    >
      <div className="absolute right-6 top-6 z-20 hidden md:block">
        <PercyAvatar className="w-20 h-20" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-[0_0_4px_rgba(138,43,226,0.7)]"
          >
            Content Automation
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-xl text-gray-400 max-w-3xl mx-auto"
          >
            Scale your content creation with AI-powered automation and intelligent distribution
          </motion.p>
        </div>

        {/* Main feature section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col justify-center"
          >
            <h2 className="text-3xl font-bold mb-6 text-white">Automate Your <span className="text-electric-blue">Entire Content Workflow</span></h2>
            <p className="text-xl text-gray-300 mb-8">Our AI content platform handles every step of the content process, from idea generation to distribution and analytics.</p>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-electric-blue/20 flex items-center justify-center mr-4 flex-shrink-0">
                  <svg className="w-5 h-5 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-300">Generate high-quality content for any platform or purpose</p>
              </div>
              
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-electric-blue/20 flex items-center justify-center mr-4 flex-shrink-0">
                  <svg className="w-5 h-5 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-300">Schedule and publish across all channels automatically</p>
              </div>
              
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-electric-blue/20 flex items-center justify-center mr-4 flex-shrink-0">
                  <svg className="w-5 h-5 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-300">Optimize content for engagement with AI-driven insights</p>
              </div>
              
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-electric-blue/20 flex items-center justify-center mr-4 flex-shrink-0">
                  <svg className="w-5 h-5 text-electric-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-300">Monitor performance and iterate for continuous improvement</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="glass-card p-8 rounded-2xl"
          >
            <div className="space-y-6">
              <div className="glass-card bg-white/5 p-4 rounded-xl">
                <h3 className="text-lg font-semibold mb-2 text-white">Content Types</h3>
                <div className="flex flex-wrap gap-2">
                  {['Blog Posts', 'Social Media', 'Email', 'Ad Copy', 'Product Descriptions', 'SEO Content', 'Video Scripts'].map((type) => (
                    <span key={type} className="px-3 py-1 rounded-full text-sm bg-electric-blue/20 text-electric-blue">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="glass-card bg-white/5 p-4 rounded-xl">
                <h3 className="text-lg font-semibold mb-2 text-white">Distribution Channels</h3>
                <div className="flex flex-wrap gap-2">
                  {['WordPress', 'Facebook', 'Twitter', 'LinkedIn', 'Instagram', 'Email Platforms', 'YouTube'].map((channel) => (
                    <span key={channel} className="px-3 py-1 rounded-full text-sm bg-teal-400/20 text-teal-400">
                      {channel}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="glass-card bg-white/5 p-4 rounded-xl">
                <h3 className="text-lg font-semibold mb-2 text-white">Analytics & Optimization</h3>
                <div className="flex flex-wrap gap-2">
                  {['Engagement Tracking', 'Conversion Analysis', 'A/B Testing', 'Audience Insights', 'Performance Dashboards'].map((feature) => (
                    <span key={feature} className="px-3 py-1 rounded-full text-sm bg-purple-400/20 text-purple-400">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Content workflow timeline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold mb-8 text-center text-white">Your Content <span className="text-electric-blue">Workflow</span></h2>
          
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-electric-blue to-teal-400 rounded-full"></div>
            
            <div className="space-y-12">
              {[
                { title: 'Ideation', description: 'AI generates content ideas based on trending topics and your audience interests', icon: '🔍' },
                { title: 'Creation', description: 'Content is automatically created in your brand voice with customizable parameters', icon: '✍️' },
                { title: 'Optimization', description: 'AI enhances content with SEO recommendations and engagement optimization', icon: '📊' },
                { title: 'Distribution', description: 'Automated publishing across all your channels with smart scheduling', icon: '🚀' },
                { title: 'Analytics', description: 'Comprehensive performance metrics and AI-driven recommendations', icon: '📈' }
              ].map((step, index) => (
                <div key={index} className={`relative flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'} items-center`}>
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-electric-blue to-teal-400 flex items-center justify-center border-4 border-[#0D1117]">
                    <span className="text-white font-bold">{index + 1}</span>
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 + (index * 0.1) }}
                    className={`glass-card p-6 rounded-xl ${index % 2 === 0 ? 'mr-12' : 'ml-12'} max-w-md`}
                  >
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">{step.icon}</span>
                      <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                    </div>
                    <p className="text-gray-400">{step.description}</p>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
        
        {/* CTA section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="text-center"
        >
          <h2 className="text-white text-3xl font-bold mb-6 drop-shadow-[0_0_6px_rgba(165,120,255,0.75)]">Ready to Automate Your Content?</h2>
          <Link href="/?intent=launch_website#percy">
            <button className="bg-electric-blue hover:shadow-lg text-white font-semibold px-6 py-3 rounded-lg transition-all
              duration-300 hover:drop-shadow-[0_0_8px_rgba(165,120,255,0.75)] transform hover:scale-105">
              Get Started
            </button>
          </Link>
        </motion.div>
        <div className="mt-16 flex flex-col items-center gap-6">
          <div className="flex flex-row gap-4 w-full justify-center">
            <Link href="/" aria-label="Back to Home">
              <button className="cosmic-btn-secondary px-5 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-fuchsia-500 shadow-cosmic focus:outline-none focus:ring-2 focus:ring-fuchsia-400/70 transition-all">
                ← Back to Home
              </button>
            </Link>
            <Link href="/services/agents" aria-label="Meet Percy">
              <button className="cosmic-btn-secondary px-5 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-cyan-400 to-teal-400 shadow-cosmic focus:outline-none focus:ring-2 focus:ring-cyan-400/70 transition-all">
                Meet Percy
              </button>
            </Link>
          </div>
          <TrialButton className="w-full max-w-xs" />
          <div className="mt-6 w-full" aria-live="polite" aria-atomic="true"></div>
        </div>
      </div>
    </motion.div>
  );
} 