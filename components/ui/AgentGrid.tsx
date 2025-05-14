'use client';

import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/utils/animations';
import AgentCard from './AgentCard';
import { usePercyContext } from '../assistant/PercyProvider';
import { Agent } from '@/types/agent';
import agentRegistry from '@/lib/agents/agentRegistry';

interface AgentGridProps {
  agents?: Agent[];
}

export default function AgentGrid({ agents = agentRegistry }: AgentGridProps) {
  const { routeToAgent } = usePercyContext();

  if (!agents || agents.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">No Agents Available</h2>
        <p className="text-gray-500">Please check back later.</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6"
    >
      {agents.map((agent, index) => (
        <motion.div
          key={agent.id}
          variants={fadeInUp}
          transition={{ delay: index * 0.1 }}
        >
          <AgentCard
            agent={agent}
            onClick={() => agent.intent && routeToAgent(agent.intent)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
