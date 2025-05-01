'use client';
import React from 'react';
import type { JSX } from 'react';
import { motion } from 'framer-motion';
import PercyProvider from '../../components/assistant/PercyProvider';
import PageLayout from 'components/layout/PageLayout';
import FloatingParticles from '@/components/ui/FloatingParticles';
import AgentMarketplace from 'components/agents/AgentMarketplace';
import agentRegistry from 'lib/agents/agentRegistry';

export default function ServicesPage(): JSX.Element {
  return (
    <PercyProvider>
      <PageLayout>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <div className="relative min-h-screen w-full bg-gradient-to-b from-[#0d1117] to-[#161b22] overflow-x-hidden">
            {/* Animated background */}
            <FloatingParticles />
            <h1 className="text-4xl font-bold text-white text-center mt-12">
              Meet Your AI Agents
            </h1>
            <div className="mt-8">
              {/* Agent Marketplace grid */}
              {/* TODO: Replace 'free' with actual userRole if available */}
              {typeof window !== 'undefined' && (
                <div className="relative z-10">
                  <AgentMarketplace userRole="free" agents={agentRegistry.filter(agent => agent.visible)} />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </PageLayout>
    </PercyProvider>
  );
}
