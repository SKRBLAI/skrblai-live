'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import GlassmorphicCard from '../shared/GlassmorphicCard';

interface AskPercyProps {
  className?: string;
}

export default function AskPercy({ className = '' }: AskPercyProps) {
  const handleAskPercy = () => {
    // Try to open the prompt panel via custom event
    const event = new CustomEvent('openPromptPanel');
    window.dispatchEvent(event);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`max-w-4xl mx-auto ${className}`}
    >
      <GlassmorphicCard className="p-8 text-center bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-2 border-cyan-400/30">
        <div className="flex items-center justify-center gap-6 mb-6">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="group cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400/50 rounded-full"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300" />
              <Image
                src="/images/agents-percy-nobg-skrblai.webp"
                alt="Percy the Cosmic Concierge"
                width={80}
                height={80}
                className="relative rounded-full border-3 border-cyan-400/60 shadow-[0_0_40px_#22d3ee66] group-hover:border-cyan-400/80 group-hover:shadow-[0_0_60px_#22d3ee88] transition-all duration-300"
                priority
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </motion.div>
          
          <div className="text-left">
            <h3 className="text-2xl font-bold text-cyan-400 mb-2">
              Need Help Choosing?
            </h3>
            <p className="text-lg text-gray-300">
              Ask Percy for personalized recommendations
            </p>
          </div>
        </div>
        
        <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
          <span className="text-cyan-400 font-bold">"I'll analyze your needs and recommend the perfect plan."</span> 
          Get instant guidance from your cosmic concierge and automation orchestrator.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAskPercy}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            🤖 Ask Percy
          </motion.button>
          
          <Link
            href="#ask-percy"
            className="bg-transparent border border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 font-bold py-3 px-6 rounded-lg transition-all duration-200"
          >
            💬 Chat Below
          </Link>
        </div>
      </GlassmorphicCard>
    </motion.div>
  );
}