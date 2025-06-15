'use client';
import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import AgentCard from '@/components/ui/AgentCard';
import AgentInputModal from './AgentInputModal';
import { Agent } from '@/types/agent';
import { agentBackstories } from '@/lib/agents/agentBackstories';

// Remove agentRegistry import and static usage

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

// --- Cosmic Marketplace Copy ---
const CosmicMarketplaceHeader = () => (
  <div className="w-full flex flex-col items-center mb-10 mt-4">
    <h1 className="text-3xl md:text-4xl font-extrabold text-center bg-gradient-to-r from-fuchsia-400 via-electric-blue to-teal-400 bg-clip-text text-transparent drop-shadow-lg mb-2">
      Summon Your Cosmic AI Hero
    </h1>
    <p className="text-lg md:text-xl text-center text-fuchsia-200 max-w-2xl mb-2">
      Meet the League: Each agent is ready to power up your workflow.<br />
      Tap a card to reveal their superpowers, or chat to get started.
    </p>
    <p className="text-base text-center text-teal-300 max-w-xl">
      Choose your champion and unlock cosmic productivity.<br />
      <span className="text-fuchsia-400">Interactive. Premium. Legendary.</span>
    </p>
  </div>
);


const AgentMarketplace: React.FC<AgentMarketplaceProps> = ({ userRole, recommendedAgents, agents: agentsProp }) => {
  // --- Cosmic Header is rendered above the grid ---

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sort, setSort] = useState<string>('popular');
  const router = useRouter();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch agents from API on mount
  React.useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/agents');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const fetchedAgents = Array.isArray(data.agents) ? data.agents : [];
        setAgents(fetchedAgents.filter((a: Agent) => a.visible !== false));
      } catch (err) {
        setError('Failed to load agents. Please try again later.');
        setAgents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  const categories = React.useMemo(() => getCategories(agents), [agents]);

  // Filtered/sorted agents
  const filteredAgents = React.useMemo(() => {
    let list = agents;
    if (selectedCategory !== 'All') {
      list = list.filter(a => a.category === selectedCategory);
    }
    // Placeholder sort logic
    if (sort === 'popular') return list;
    if (sort === 'newest') return [...list].reverse();
    if (sort === 'recommended' && recommendedAgents?.length) {
      return recommendedAgents.concat(list.filter(a => !recommendedAgents.some((r: any) => r.id === a.id)));
    }
    return list;
  }, [agents, selectedCategory, sort, recommendedAgents]);

  const handleAgentClick = (agent: Agent) => {
    setSelectedAgent(agent);
  };

  const handleAgentInfo = (agent: Agent) => {
    router.push(`/agent-backstory/${agent.id}`);
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
          {recommendedAgents.slice(0, 3).map(agent => {
            // Get backstory data if available
            const backstory = agentBackstories[agent.id] || 
                             agentBackstories[agent.id.replace('-agent', '')] || 
                             agentBackstories[agent.id.replace('Agent', '')];
            
            return (
              <AgentCard 
                key={agent.id} 
                agent={{...agent, ...backstory}}
                onClick={() => handleAgentClick(agent)}
                onInfo={() => handleAgentInfo(agent)}
                isPremiumUnlocked={!(agent.premium && userRole === 'free')}
                className="w-full h-full"
              />
            );
          })}
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
          {loading ? (
            <motion.div className="col-span-full text-center text-slate-400 py-12">Loading agents...</motion.div>
          ) : error ? (
            <motion.div className="col-span-full text-center text-red-400 py-12">{error}</motion.div>
          ) : filteredAgents.length > 0 ? (
            filteredAgents.map(agent => {
              const isLocked = agent.unlocked === false;
              // Get backstory data if available
              const backstory = agentBackstories[agent.id] || 
                               agentBackstories[agent.id.replace('-agent', '')] || 
                               agentBackstories[agent.id.replace('Agent', '')];
              
              return (
                <AgentCard
                  key={agent.id}
                  agent={{...agent, ...backstory}}
                  onClick={() => handleAgentClick(agent)}
                  onInfo={() => handleAgentInfo(agent)}
                  isPremiumUnlocked={!(agent.premium && userRole === 'free')}
                  className="w-full h-full"
                />
              );
            })
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
