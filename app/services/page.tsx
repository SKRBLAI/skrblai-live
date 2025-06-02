'use client';
import React from 'react';
import type { JSX } from 'react';
import { motion } from 'framer-motion';
import PageLayout from 'components/layout/PageLayout';
import FloatingParticles from '@/components/ui/FloatingParticles';
import BrandLogo from '@/components/ui/BrandLogo';
import Image from 'next/image';
import UniversalPromptBar from '@/components/ui/UniversalPromptBar';
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
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#0d1117] via-[#0d1117]/95 to-[#161b22]" />
          <FloatingParticles
            particleCount={40}
            speed={0.4}
            size={2.5}
            colors={['#38bdf8', '#f472b6', '#0ea5e9', '#22d3ee']}
            glowIntensity={0.4}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 pt-24 flex flex-col items-center">
          {/* Hero Section */}
          <div className="w-full flex flex-col items-center mb-10">
            <BrandLogo className="skrblai-heading text-center mb-4" />
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-electric-blue to-teal-400 bg-clip-text text-transparent drop-shadow-glow text-center mb-4 max-w-3xl mx-auto">
              Intelligent Automation for Your Business
            </h2>
            <p className="text-lg text-gray-300 text-center max-w-2xl mx-auto mb-4">
              SKRBL AI brings together a league of digital experts—ready to automate, create, and elevate your brand. Meet Percy, your friendly AI concierge, and discover what our agents can do for you.
            </p>
            {/* Interactive Percy Onboarding */}
            <div className="flex flex-col md:flex-row items-center gap-4 w-full max-w-2xl mx-auto mb-4">
              <div className="flex-shrink-0 flex items-center justify-center">
                <Image src="/images/agents-percy-nobg-skrblai.png" alt="Percy the AI Concierge" width={72} height={72} className="rounded-full shadow-glow bg-[#0d1117]" />
              </div>
              <div className="flex-1 w-full">
                <UniversalPromptBar
                  title="Ask Percy Anything"
                  description="What challenge can SKRBL AI solve for you today? Type a prompt or upload a file—Percy will guide you!"
                  icon={<Image src="/images/agents-percy-nobg-skrblai.png" alt="Percy" width={32} height={32} />}
                  acceptedFileTypes=".pdf,.doc,.docx,.txt,.csv,.xlsx,.png,.jpg,.jpeg"
                  fileCategory="document"
                  intentType="onboarding"
                  placeholder="Describe your business challenge or creative goal..."
                  promptLabel="Describe your request (optional):"
                  showPrompt={true}
                  buttonText="Send to Percy"
                  theme="dark"
                  compact
                />
              </div>
            </div>
            <p className="text-base text-teal-300 text-center max-w-xl mx-auto mb-6">
              Percy is your cosmic guide—always ready to help you explore, automate, and create at scale with confidence.
            </p>
          </div>

          {/* Filter Bar & Agents Grid (floating, glassy, no sidebar) */}
          <div className="w-full flex flex-col items-center">
            <AgentFilterBar selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
            <AgentsGrid agents={agents} />
          </div>
        </div>
      </motion.div>
    </PageLayout>
  );
}

