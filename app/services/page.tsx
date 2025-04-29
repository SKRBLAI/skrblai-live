'use client';
// Needed for JSX.Element return type
import React from 'react';
import { motion } from 'framer-motion';
import PercyProvider from 'components/assistant/PercyProvider';
import PageLayout from 'components/layout/PageLayout';
import FloatingParticles from '@/components/ui/FloatingParticles';
import nextDynamic from 'next/dynamic';
import AgentMarketplace from 'components/agents/AgentMarketplace';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function ServicesPage(): JSX.Element {
  return (
    <PercyProvider>
      <PageLayout>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
                  <AgentMarketplace userRole="free" />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </PageLayout>
    </PercyProvider>
  );
}
