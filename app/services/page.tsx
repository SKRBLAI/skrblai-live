'use client';
import React from 'react';
import type { JSX } from 'react';
import { motion } from 'framer-motion';
import PageLayout from 'components/layout/PageLayout';
import FloatingParticles from '@/components/ui/FloatingParticles';
import BrandLogo from '@/components/ui/BrandLogo';
import AgentMarketplace from 'components/agents/AgentMarketplace';
import AgentsGrid from '@/components/agents/AgentsGrid';
import AgentFilterBar from '@/components/agents/AgentFilterBar';
import agentRegistry from 'lib/agents/agentRegistry';

export default function ServicesPage(): JSX.Element {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('All');
  // Filter agents by category
  const agents = React.useMemo(() => {
    if (!agentRegistry || !Array.isArray(agentRegistry)) return [];
    if (selectedCategory === 'All') return agentRegistry;
    return agentRegistry.filter(agent => agent.category === selectedCategory);
  }, [selectedCategory]);

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
          {/* Heading */}
          <h1 className="skrblai-heading text-center mb-6">Meet Our League of Digital Superheroes</h1>
          {/* Cosmic/Glass Filter Bar */}
          <AgentFilterBar selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
          <AgentsGrid agents={agents} />
        </div>
      </motion.div>
    </PageLayout>
  );
}

