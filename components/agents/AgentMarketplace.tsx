'use client';
import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import AgentCard from '@/components/ui/AgentCard';
import agentRegistry from '@/lib/agents/agentRegistry';
import AgentInputModal from './AgentInputModal';
import { Agent } from '@/types/agent';

const getCategories = (agents: Agent[]): string[] => {
  const categories = agents.map(agent => agent.category);
  return ['All', ...Array.from(new Set(categories))];
};

const sortOptions = [
  { label: 'Most Popular', value: 'popular' },
  { label: 'Newest', value: 'newest' },
  { label: 'Recommended', value: 'recommended' },
];

interface AgentMarketplaceProps {
  userRole: 'free' | 'premium';
  recommendedAgents?: Agent[];
  agents?: Agent[];
}

const AgentMarketplace: React.FC<AgentMarketplaceProps> = ({ userRole, recommendedAgents, agents: agentsProp }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sort, setSort] = useState<string>('popular');
  const router = useRouter();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // Only show visible agents, using prop if provided
  const agents = useMemo(() => (agentsProp ? agentsProp : agentRegistry.filter(a => a.visible !== false)), [agentsProp]);
  const categories = useMemo(() => getCategories(agents), [agents]);

  // Filtered/sorted agents
  const filteredAgents = useMemo(() => {
    let list = agents;
    if (selectedCategory !== 'All') {
      list = list.filter(a => a.category === selectedCategory);
    }
    // Placeholder sort logic
    if (sort === 'popular') return list;
    if (sort === 'newest') return [...list].reverse();
    if (sort === 'recommended' && recommendedAgents?.length) {
      return recommendedAgents.concat(list.filter(a => !recommendedAgents.some(r => r.id === a.id)));
    }
    return list;
  }, [agents, selectedCategory, sort, recommendedAgents]);

  const handleAgentClick = (agent: Agent) => {
    setSelectedAgent(agent);
  };

  const handleCloseModal = () => {
    setSelectedAgent(null);
  };

  const handleRunAgent = async (input: string) => {
    if (!selectedAgent) return;

    try {
      // Use optional chaining to safely access runAgent
      if (typeof selectedAgent?.runAgent !== 'function') {
        console.error('Agent does not have a runAgent method');
        return;
      }

      // TypeScript will allow this now since we've checked if it's a function
      const result = await selectedAgent.runAgent({
        userId: 'demo', // TODO: Get actual userId
        input,
        agentId: selectedAgent.id
      });

      console.log('Agent result:', result);
      // TODO: Handle agent response (show in UI, save to history, etc.)
    } catch (error) {
      console.error('Error running agent:', error);
      // TODO: Show error message to user
    }

    handleCloseModal();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2 md:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-wrap gap-2 justify-center mb-6">
        {categories.map(category => (
          <button
            key={category}
            className={`px-4 py-1 rounded-full font-medium text-sm border border-white/10 transition glass-card text-white/80 hover:text-white hover:bg-white/10 ${selectedCategory === category ? 'bg-white/10 text-white font-bold shadow' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </motion.div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }} className="flex items-center gap-2 mb-4">
        <label htmlFor="sort-select" className="sr-only">Sort agents</label>
        <select
          id="sort-select"
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="rounded-lg px-3 py-2 bg-white/20 backdrop-blur text-sm text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="popular">Most Popular</option>
          <option value="new">Newest</option>
          <option value="premium">Premium</option>
        </select>
      </motion.div>
      {/* Recommended Section (optional) */}
      {recommendedAgents && recommendedAgents.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }} className="mb-8 flex flex-wrap gap-4 justify-center">
          {recommendedAgents.slice(0, 3).map(agent => (
            <AgentCard 
              key={agent.id} 
              agent={agent} 
              onClick={() => handleAgentClick(agent)} 
              isPremiumUnlocked={!(agent.premium && userRole === 'free')}
              className="w-full h-full"
            />
          ))}
        </motion.div>
      )}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.08,
            },
          },
        }}
      >
        <AnimatePresence>
          {filteredAgents.length > 0 ? (
            filteredAgents.map(agent => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleAgentClick(agent)}
                className="glass-card p-6 rounded-xl backdrop-blur-lg border border-sky-500/10 cursor-pointer"
              >
                <h3 className="text-xl font-semibold text-white mb-2">{agent.name}</h3>
                <p className="text-gray-300 text-sm mb-4">{agent.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-teal-400 text-sm">{agent.category}</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-sky-400 to-teal-300 text-deep-navy font-semibold shadow-lg hover:shadow-teal-500/20"
                  >
                    Use Agent
                  </motion.button>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div className="col-span-full text-center text-slate-400 py-12">No agents found for this category.</motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AgentInputModal
        agent={selectedAgent}
        onClose={handleCloseModal}
        onSubmit={handleRunAgent}
      />
    </div>
  );
};

export default AgentMarketplace;
