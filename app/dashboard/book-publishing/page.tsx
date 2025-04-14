'use client';

export const dynamic = 'force-dynamic';

import { motion } from 'framer-motion';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DownloadCenter from '@/components/dashboard/DownloadCenter';

export default function BookPublishingDashboard() {
  return (
    <div className="min-h-screen bg-deep-navy">
      <DashboardHeader />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto"
          >
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl font-bold mb-6 bg-gradient-to-r from-electric-blue to-teal-400 bg-clip-text text-transparent"
            >
              Book Publishing
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-gray-300 mb-8"
            >
              Your book publishing journey starts here. Let's bring your story to life.
            </motion.p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="glass-card p-6 rounded-xl"
              >
                <h2 className="text-xl font-semibold mb-4 text-white">Publishing Steps</h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-electric-blue flex items-center justify-center mr-3">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Manuscript Review</h3>
                      <p className="text-gray-400 text-sm">Upload your manuscript for AI analysis</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Editing & Formatting</h3>
                      <p className="text-gray-400 text-sm">AI-powered editing and formatting</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Cover Design</h3>
                      <p className="text-gray-400 text-sm">Generate cover options with AI</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-3">
                      <span className="text-white font-bold">4</span>
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Publishing & Distribution</h3>
                      <p className="text-gray-400 text-sm">Get your book to market</p>
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="glass-card p-6 rounded-xl"
              >
                <h2 className="text-xl font-semibold mb-4 text-white">Quick Actions</h2>
                <div className="space-y-4">
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(56, 189, 248, 0.5)" }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-electric-blue to-teal-400 text-white font-medium"
                  >
                    Upload Manuscript
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 px-4 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20"
                  >
                    Generate Book Cover
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 px-4 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20"
                  >
                    Book Marketing Plan
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 px-4 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20"
                  >
                    Schedule Consultation
                  </motion.button>
                </div>
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="glass-card p-6 rounded-xl"
            >
              <h2 className="text-xl font-semibold mb-4 text-white">Resources & Downloads</h2>
              <DownloadCenter />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="glass-card p-6 rounded-xl mt-6 text-center"
            >
              <h2 className="text-xl font-semibold mb-4 text-white">Need More Publishing Services?</h2>
              <p className="text-gray-300 mb-4">Get a personalized publishing plan with our AI assistant</p>
              <a href="/?intent=publish_book#percy" className="inline-block">
                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 0 15px rgba(56, 189, 248, 0.5)" }}
                  whileTap={{ scale: 0.98 }}
                  className="py-3 px-6 rounded-lg bg-gradient-to-r from-electric-blue to-teal-400 text-white font-medium"
                >
                  Get Started
                </motion.button>
              </a>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
