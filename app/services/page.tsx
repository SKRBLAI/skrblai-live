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
        <FloatingParticles
          particleCount={35}
          speed={0.35}
          size={2.5}
          colors={['#38bdf8', '#f472b6', '#0ea5e9', '#22d3ee']}
          glowIntensity={0.5}
        />

        {/* Content */}
        <div className="relative z-10 pt-16 sm:pt-20 lg:pt-24 flex flex-col items-center px-4 md:px-8 lg:px-12">
          {/* Hero Section */}
          <div className="w-full flex flex-col items-center mb-10">
            <BrandLogo className="skrblai-heading text-center mb-4" />
            <h2 className="skrblai-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-center mb-4 max-w-4xl mx-auto px-4 bg-gradient-to-r from-electric-blue via-teal-400 to-fuchsia-500 bg-clip-text text-transparent drop-shadow-glow">
              Discover Your Digital Superheroes
            </h2>
            <p className="text-xl text-teal-300 text-center max-w-2xl mx-auto mb-4 px-4 font-semibold">
              Meet Percy and the SKRBL AI constellation—ready to automate, create, and elevate your brand.
            </p>
            <div className="flex flex-col md:flex-row items-center gap-4 w-full max-w-2xl mx-auto mb-4 px-4">
              <motion.div
                className="w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}>
                <Image
                  src="/images/agents-percy-nobg-skrblai.png"
                  alt="Percy the AI Concierge"
                  width={96}
                  height={96}
                  className="rounded-full shadow-cosmic bg-[#0d1117] transform hover:scale-105 transition-transform duration-300"
                  priority
                />
              </motion.div>
              <motion.div
                className="flex-1 w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}>
                <UniversalPromptBar
                  title="Ask Percy Anything"
                  description="How can SKRBL AI assist you today? Type a prompt or upload a file—Percy will guide you!"
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
              </motion.div>
            </div>
            <p className="text-base text-teal-300 text-center max-w-xl mx-auto mb-8 px-4">
              Percy is your AI concierge—always ready to help you explore, automate, and create at scale with confidence.
            </p>
          </div>

          {/* Filter Bar & Agents Grid (floating, glassy, no sidebar) */}
          <motion.div 
            className="w-full flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="w-full max-w-7xl mx-auto">
              <AgentFilterBar selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
              <AgentsGrid agents={agents} />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </PageLayout>
  );
}

