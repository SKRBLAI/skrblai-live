'use client';
import React from 'react';
import type { JSX } from 'react';
import { motion } from 'framer-motion';
import PercyProvider from '../../components/assistant/PercyProvider';
import PageLayout from 'components/layout/PageLayout';
import FloatingParticles from '@/components/ui/FloatingParticles';

export default function BookPublishingPage(): JSX.Element {
  return (
    
      <PageLayout>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <div className="relative min-h-screen w-full bg-gradient-to-b from-[#0d1117] to-[#161b22] overflow-x-hidden">
            <FloatingParticles />
            <h1 className="text-4xl font-bold text-white text-center mt-12">
              AI-Powered Book Publishing
            </h1>
            {/* Publishing content here */}
          </div>
        </motion.div>
      </PageLayout>
    
  );
} 
