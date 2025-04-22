'use client';

import React from 'react';
import PublishingAssistantPanel from '@/components/book-publishing/PublishingAssistantPanel';
import PageLayout from '@/components/layouts/PageLayout';
import { motion } from 'framer-motion';

export default function BookPublishingPage() {
  return (
    <PageLayout title="AI-Powered Book Publishing">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Transform your manuscript into a published book with our cutting-edge AI platform
          </p>
        </motion.div>

        <PublishingAssistantPanel />

        <motion.div 
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold text-white mb-3">AI Enhancement</h3>
            <p className="text-gray-300">Our AI analyzes your manuscript and suggests improvements for style, structure, and engagement.</p>
          </div>
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold text-white mb-3">Smart Formatting</h3>
            <p className="text-gray-300">Automated formatting and typesetting optimized for multiple publishing platforms.</p>
          </div>
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold text-white mb-3">Global Distribution</h3>
            <p className="text-gray-300">Publish your book across major platforms like Amazon, Apple Books, and more.</p>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
}