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
      <div className="text-center py-12 text-slate-400">Loading agents...</div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-400">{error}</div>
    );
  }

  if (!agents || agents.length === 0) {
    // Minimal placeholder or nothing for empty state (no agents)
    return null;
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6"
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
