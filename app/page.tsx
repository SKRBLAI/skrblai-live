'use client';

import { useEffect } from 'react';
import PercyHero from '@/components/home/PercyHero';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePercyContext } from '@/components/assistant/PercyProvider';
import FloatingParticles from '@/components/ui/FloatingParticles';
import Image from 'next/image';
import { useState } from 'react';
import type { Agent } from '@/types/agent';

export default function HomePage() {
  const { setPercyIntent, closePercy } = usePercyContext();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [demoAgent, setDemoAgent] = useState<Agent | null>(null);

  // Fetch agents from API or registry (add useEffect if needed)
  // For now, assume agents are fetched elsewhere or passed as props
  // If you want to fetch here, uncomment and implement fetch logic
  // useEffect(() => { ... }, []);

  // Filtered agents (all agents for now, can add category logic)
  const filteredAgents: Agent[] = agents;

  useEffect(() => {
    closePercy();
    setPercyIntent('');
  }, [closePercy, setPercyIntent]);

  return (
    <div className="min-h-screen relative text-white bg-[#0d1117] pt-16 overflow-hidden">
      {/* Hero Background */}
      <div className="absolute inset-0 z-0 opacity-40">
        <FloatingParticles />
      </div>
      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0d1117] via-[#0d1117]/90 to-[#0d1117]/80" />

      {/* Main Content */}
      <div className="relative z-10 pt-8 px-4 md:px-8 max-w-7xl mx-auto">
        {/* PercyHero: Includes agent constellation that pulls from registry and filters correctly */}
        <section className="mb-8">
          <div className="flex flex-col items-center justify-center">
            {/* Only one fullbody Percy, glowing, cosmic */}
            <PercyHero />
            <h1 className="mt-6 skrblai-heading text-center text-4xl md:text-6xl max-w-4xl mx-auto" aria-label="Welcome to SKRBL AI">
              Welcome to SKRBL AI
            </h1>
            <p className="mt-4 text-lg md:text-xl text-gray-300 text-center max-w-2xl mx-auto">
              Your gateway to intelligent automation. Discover our suite of AI agents ready to transform your digital experience.
            </p>
          </div>
        </section>

        {/* Agent Constellation: Centered, floating, no sidebar/grid */}
        <div className="relative mt-16 flex flex-col items-center justify-center">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="opacity-40">
              <FloatingParticles particleCount={32} />
            </div>
            <div
              className="absolute inset-0 animate-cosmic-gradient bg-[radial-gradient(ellipse_at_60%_40%,rgba(56,189,248,0.16)_0%,rgba(244,114,182,0.09)_60%,transparent_100%)] blend-mode-screen"
            />
          </div>
          {/* Centered constellation/cards, no filter bar or category grid */}
          <div className="relative z-10 flex flex-col items-center w-full">
            {/* AgentConstellation component or similar here (assumes it floats all agents/cards) */}
            {/* If you have a dedicated AgentConstellation, use it here. Otherwise, float the cards as below. */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-4 flex flex-wrap justify-center gap-8 w-full"
            >
              {filteredAgents.map(agent => {
                let badge = null;
                if (agent.roleRequired === 'pro') badge = 'Pro';
                if (agent.id === 'paymentManagerAgent') badge = 'Pro';
                if (agent.id === 'percySyncAgent') badge = 'Beta';
                if (agent.id === 'videoContentAgent') badge = 'New';
                return (
                  <motion.div
                    key={agent.id}
                    whileHover={{ y: -8, scale: 1.06, boxShadow: '0 0 48px 8px #38bdf8cc, 0 0 24px #f472b6cc' }}
                    whileTap={{ scale: 0.98 }}
                    className="cosmic-float-card flex flex-col items-center p-6 transition-all duration-300 relative w-full max-w-xs mx-auto shadow-glow"
                  >
                    {/* Badge */}
                    {badge && (
                      <motion.span
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        className={`absolute top-3 right-3 text-xs px-3 py-1 rounded-full font-bold shadow-glow z-10 ${badge==='Pro' ? 'bg-gradient-to-r from-fuchsia-500 to-electric-blue text-white' : badge==='Beta' ? 'bg-gradient-to-r from-yellow-400 to-pink-400 text-white' : 'bg-gradient-to-r from-teal-400 to-fuchsia-400 text-white'}`}
                      >{badge}</motion.span>
                    )}
                    <motion.div
                      className="mb-4 flex items-center justify-center"
                      whileHover={{ scale: 1.08, rotate: -2 }}
                      transition={{ type: 'spring', stiffness: 80 }}
                    >
                      <div className="relative w-24 h-24 agent-image-container">
                        <Image
                          src={`/images/agents-${agent.imageSlug || agent.id}-nobg-skrblai.png`}
                          alt={agent.name}
                          fill
                          className="agent-image object-contain"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = '';
                            target.alt = '🤖';
                            target.style.background = '#222';
                            target.style.display = 'flex';
                            target.style.alignItems = 'center';
                            target.style.justifyContent = 'center';
                            target.style.fontSize = '2rem';
                          }}
                        />
                      </div>
                    </motion.div>
                    <h3 className="text-xl font-bold mb-2 text-center bg-gradient-to-r from-electric-blue to-teal-400 bg-clip-text text-transparent drop-shadow-glow">
                      {agent.name}
                    </h3>
                    <p className="text-gray-300 text-sm mb-4 text-center min-h-[48px]">
                      {agent.hoverSummary || agent.description || 'AI Agent'}
                    </p>
                    <div className="flex gap-2 w-full">
                      <button
                        className="cosmic-btn-primary w-full px-5 py-2 rounded-lg font-semibold group"
                        onClick={() => setDemoAgent(agent)}
                        tabIndex={0}
                        aria-label={`Try a live demo of ${agent.name}`}
                      >
                        Try Demo
                        <motion.span
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.18 }}
                        />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-16 mb-24 text-center"
        >
          <p className="text-lg mb-8 text-teal-300 max-w-2xl mx-auto bg-[#0d1117]/80 backdrop-blur-sm p-4 rounded-lg">
            Ready to experience creative freedom? Explore our features or chat with Percy—your personal AI concierge—right now.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/services/agents">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 cosmic-btn-primary text-white font-semibold rounded-lg cosmic-glow transition-all duration-300"
              >
                <span className="text-glow">Get 7-Day Free Trial</span>
              </motion.button>
            </Link>
            <Link href="/features">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-white/5 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300"
              >
                <span className="text-glow">See Features</span>
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
