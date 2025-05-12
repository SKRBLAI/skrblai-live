'use client';
import PageLayout from '@/components/layout/PageLayout';
import PercyHeroSection from '@/components/home/PercyHeroSection';
import FloatingParticles from '@/components/ui/FloatingParticles';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function HomePage() {
  return (
    <PageLayout>
      <div className="min-h-screen relative bg-gradient-to-b from-[#0d1117] to-[#161b22] text-white">
        {/* Navigation Bar - Placed at the top */}
        <Navbar />
        
        {/* Main Content Area with Percy-focused messaging */}
        <div className="pt-24 px-4 md:px-8 max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-electric-blue to-teal-400 bg-clip-text text-transparent">
              Meet Percy, Your AI Concierge
            </h1>
            <p className="mt-4 text-xl text-gray-300 max-w-3xl mx-auto">
              Let Percy guide you to the perfect AI solutions for your business needs
            </p>
          </motion.div>
          
          <FloatingParticles />
          <PercyHeroSection />
          
          {/* Call-to-action section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-16 text-center"
          >
            <p className="text-xl text-gray-300 mb-6">
              Need help with a specific task? Just ask Percy using the chat widget!
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/features">
                <motion.button 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-electric-blue text-white font-bold rounded-xl shadow-glow"
                >
                  Explore Features
                </motion.button>
              </Link>
              <Link href="/services">
                <motion.button 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 border-2 border-teal-400 text-teal-400 font-bold rounded-xl hover:bg-teal-400/10 transition-colors"
                >
                  View AI Agents
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
}
