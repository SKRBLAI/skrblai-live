import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import AgentCard, { Agent } from './AgentCard';
import agentRegistry from '@/lib/agents/agentRegistry';

const getCategories = (agents: Agent[]) => {
  const cats = Array.from(new Set(agents.map(agent => agent.category)));
  return ['All', ...cats];
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
    router.push(agent.route);
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
            <AgentCard key={agent.id} agent={agent} onClick={handleAgentClick} isPremiumLocked={agent.premium && userRole === 'free'} />
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
              <AgentCard
                key={agent.id}
                agent={agent}
                onClick={handleAgentClick}
                isPremiumLocked={agent.premium && userRole === 'free'}
              />
            ))
          ) : (
            <motion.div className="col-span-full text-center text-slate-400 py-12">No agents found for this category.</motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AgentMarketplace;
