'use client';
import React from 'react';
import type { JSX } from 'react';
import { motion } from 'framer-motion';
import PageLayout from 'components/layout/PageLayout';
import FloatingParticles from '@/components/ui/FloatingParticles';
import AgentMarketplace from 'components/agents/AgentMarketplace';
import AgentsGrid from '@/components/agents/AgentsGrid';
import agentRegistry from 'lib/agents/agentRegistry';

export default function ServicesPage(): JSX.Element {
  return (
    <PageLayout>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.5 }}
        className="min-h-screen relative"
      >
        {/* Cosmic Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d1117] via-[#0d1117]/95 to-[#0d1117]" />
          <FloatingParticles />
        </div>

        {/* Content */}
        <div className="relative z-10 pt-24">
          <AgentsGrid />
        </div>
      </motion.div>
    </PageLayout>
  );
}

