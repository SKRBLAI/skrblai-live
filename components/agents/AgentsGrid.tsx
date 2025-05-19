'use client';
import { motion } from 'framer-motion';
import AgentCard from './AgentCard';

const agents = [
  { name: 'Percy', role: 'The Concierge', isPercy: true },
  { name: 'BrandingAgent', role: 'Brand Strategist' },
  { name: 'ContentCreatorAgent', role: 'Content Master' },
  { name: 'AnalyticsAgent', role: 'Data Analyst' },
  { name: 'PublishingAgent', role: 'Publishing Expert' },
  { name: 'SocialBotAgent', role: 'Social Media Guru' },
  { name: 'AdCreativeAgent', role: 'Ad Specialist' },
  { name: 'ProposalGeneratorAgent', role: 'Proposal Expert' },
  { name: 'PaymentManagerAgent', role: 'Finance Manager' },
  { name: 'ClientSuccessAgent', role: 'Success Manager' },
  { name: 'SiteGenAgent', role: 'Web Developer' },
  { name: 'BizAgent', role: 'Business Strategist' },
  { name: 'VideoContentAgent', role: 'Video Producer' },
  { name: 'PercyAgent', role: 'Assistant' },
  { name: 'PercySyncAgent', role: 'Sync Manager' },
];

export default function AgentsGrid() {
  // Function to alternate between male and female, with Percy always male
  const getGender = (index: number): 'male' | 'female' => {
    if (agents[index].isPercy) return 'male';
    return index % 2 === 0 ? 'male' : 'female';
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12">
      {/* Hero Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-gradient-blue">
          Meet the Agents of SKRBL AI
        </h1>
        <p className="text-xl text-teal-300">
          A League of Digital Superheroes, Ready to Serve.
        </p>
      </motion.div>

      {/* Orbiting Agents Constellation */}
      <div className="relative w-full flex flex-col items-center justify-center min-h-[600px] py-16">
        {/* Cosmic background particles */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {require('@/components/ui/FloatingParticles').default({ fullScreen: false, particleCount: 30 })}
        </div>
        {/* Orbit Container */}
        <motion.div
          className="relative mx-auto"
          style={{ width: '430px', height: '430px', maxWidth: '90vw', maxHeight: '90vw' }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 48, ease: 'linear' }}
        >
          {/* Percy in the center */}
          <div
            className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
          >
            {require('../home/PercyAvatar').default({ size: 'lg', animate: true })}
            <div className="text-center mt-2">
              <span className="block text-2xl font-bold text-gradient-blue">Percy</span>
              <span className="block text-teal-300 text-xs">The Concierge</span>
            </div>
          </div>
          {/* Orbiting Agents */}
          {agents.filter(a => !a.isPercy).map((agent, i, arr) => {
            const angle = (360 / arr.length) * i;
            const rad = (angle * Math.PI) / 180;
            const orbitRadius = 180;
            const x = Math.cos(rad) * orbitRadius;
            const y = Math.sin(rad) * orbitRadius;
            return (
              <motion.div
                key={agent.name}
                tabIndex={0}
                aria-label={agent.role || agent.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: i * 0.09 }}
                whileHover={{ scale: 1.12, boxShadow: '0 0 32px 8px #2dd4bf' }}
                whileFocus={{ scale: 1.12, boxShadow: '0 0 32px 8px #2dd4bf' }}
                className="absolute z-10 focus:outline-none"
                style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`, transform: 'translate(-50%, -50%)' }}
              >
                <div className="flex flex-col items-center group" tabIndex={0} aria-label={`${agent.name} - ${agent.role || ''}`}>
                  <AgentCard
                    name={agent.name}
                    isPercy={false}
                    gender={getGender(i)}
                    role={agent.role}
                  />
                  <span className="mt-2 text-xs text-teal-300 font-semibold" aria-label={agent.role}>{agent.role}</span>
                  <button
                    type="button"
                    tabIndex={0}
                    className="mt-1 px-3 py-1 rounded-full bg-gradient-to-r from-electric-blue to-teal-400 text-white text-xs font-bold shadow-glow opacity-80 group-hover:opacity-100 transition focus:outline-none focus:ring-2 focus:ring-teal-400/40"
                    aria-label={`Summon ${agent.name}`}
                  >
                    Summon
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
        {/* Mobile fallback: stack agents below Percy */}
        <div className="md:hidden mt-12 flex flex-wrap justify-center gap-4 z-10">
          {agents.filter(a => !a.isPercy).map((agent, i) => (
            <AgentCard
              key={agent.name}
              name={agent.name}
              isPercy={false}
              gender={getGender(i)}
              role={agent.role}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
