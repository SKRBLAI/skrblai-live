'use client';
import React from 'react';
import type { JSX } from 'react';
import { motion } from 'framer-motion';
import PageLayout from 'components/layout/PageLayout';
import FloatingParticles from '@/components/ui/FloatingParticles';
import AgentMarketplace from 'components/agents/AgentMarketplace';
import agentRegistry from 'lib/agents/agentRegistry';

export default function ServicesPage(): JSX.Element {
  return (
    
      <PageLayout>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <div className="relative min-h-screen w-full bg-gradient-to-b from-[#0d1117] to-[#161b22] overflow-x-hidden">
            {/* Animated background */}
            <FloatingParticles />
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <h1 className="text-4xl font-bold text-white text-center mt-12 mb-16">
                Meet Your AI Agents
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AgentMarketplace 
                  userRole="free" 
                  agents={agentRegistry} 
                />
              </div>
            </div>
          </div>
        </motion.div>
      </PageLayout>
    
  );
}

