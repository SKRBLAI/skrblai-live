'use client';

import React from 'react';
import { motion } from 'framer-motion';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } }
};

const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.08
    }
  }
};
import AgentCard from './AgentCard';
import { usePercyContext } from '../assistant/PercyProvider';
import { Agent } from '@/types/agent';

interface AgentGridProps {
  agents?: Agent[];
}

export default function AgentGrid({ agents: agentsProp }: AgentGridProps) {
  const { routeToAgent } = usePercyContext();
  const [agents, setAgents] = React.useState<Agent[]>(agentsProp || []);
  const [loading, setLoading] = React.useState<boolean>(!agentsProp);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (agentsProp) return;
    const fetchAgents = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/agents');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setAgents(Array.isArray(data.agents) ? data.agents.filter((a: Agent) => a.visible !== false) : []);
      } catch (err) {
        setError('Failed to load agents. Please try again later.');
        setAgents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, [agentsProp]);

  if (loading) {
  return (
    <motion.div
      key="loading-agents"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center text-center py-16 cosmic-glass cosmic-gradient rounded-2xl shadow-[0_0_32px_#1E90FF40] border-2 border-teal-400/40 mx-auto max-w-lg"
      role="status"
      aria-live="polite"
    >
      <span className="text-4xl mb-4 animate-spin-slow">🪐</span>
      <p className="text-xl font-bold bg-gradient-to-r from-electric-blue via-teal-400 to-electric-blue bg-clip-text text-transparent drop-shadow mb-2">Loading agents...</p>
      <span className="text-teal-300 text-sm animate-pulse">Please wait while we fetch your cosmic crew.</span>
    </motion.div>
  );
}

  if (error) {
  return (
    <motion.div
      key="error-agents"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center text-center py-14 cosmic-glass rounded-2xl shadow-[0_0_24px_#FF4C4C80] border-2 border-red-400/60 mx-auto max-w-lg"
      role="alert"
      aria-live="assertive"
    >
      <span className="text-4xl mb-3">🚨</span>
      <p className="text-lg font-bold text-red-300 drop-shadow mb-1">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-3 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-orange-400 text-white font-semibold shadow hover:from-red-600 hover:to-orange-500 transition"
      >
        Retry
      </button>
    </motion.div>
  );
}

  if (!agents || agents.length === 0) {
  return (
    <motion.div
      key="empty-agents"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center text-center py-16 cosmic-glass cosmic-gradient rounded-2xl shadow-[0_0_32px_#1E90FF40] border-2 border-teal-400/40 mx-auto max-w-lg"
      role="status"
      aria-live="polite"
    >
      <span className="text-5xl mb-4 animate-float">✨</span>
      <p className="text-xl font-bold bg-gradient-to-r from-electric-blue via-teal-400 to-electric-blue bg-clip-text text-transparent drop-shadow mb-2">No agents found</p>
      <span className="text-teal-300 text-sm mb-4">Your cosmic grid is empty. Ready to unlock more?</span>
      <a
        href="/pricing"
        className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#1E90FF] to-[#30D5C8] text-white font-bold shadow-glow hover:from-[#30D5C8] hover:to-[#1E90FF] transition mb-2"
      >
        <span className="text-lg">🚀</span> Unlock Premium Agents
      </a>
      <span className="px-3 py-1 rounded-full bg-teal-600/80 text-xs text-white shadow-glow select-none mt-2">Premium Journey</span>
    </motion.div>
  );
}

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="cosmic-glass cosmic-gradient grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-3 sm:p-6 rounded-2xl shadow-[0_0_32px_#1E90FF20] max-w-7xl mx-auto w-full"
    >
      {agents.map((agent: Agent, idx: number) => {
        const isLocked = agent.unlocked === false;
        return (
          <motion.div
            key={agent.id}
            variants={fadeInUp}
            className={isLocked ? 'opacity-50 grayscale pointer-events-none' : ''}
            tabIndex={isLocked ? -1 : 0}
            aria-disabled={isLocked ? 'true' : 'false'}
          >
            <AgentCard
              agent={agent}
              onClick={() => !isLocked && agent.intent && routeToAgent(agent.intent)}
              index={idx}
              isPremiumUnlocked={agent.premium ? agent.unlocked : true}
            />
            {isLocked && (
              <span title="Locked agent" className="absolute top-2 right-2 text-lg">🔒</span>
            )}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
