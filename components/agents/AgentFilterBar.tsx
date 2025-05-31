import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import agentRegistry from 'lib/agents/agentRegistry';

interface AgentFilterBarProps {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
}

const getCategories = (): string[] => {
  // agentRegistry should provide categories; fallback to static
  if (agentRegistry && Array.isArray(agentRegistry)) {
    const cats = agentRegistry.map(agent => agent.category).filter(Boolean);
    return ['All', ...Array.from(new Set(cats))];
  }
  return ['All'];
};

const AgentFilterBar: React.FC<AgentFilterBarProps> = ({ selectedCategory, setSelectedCategory }) => {
  const [categories, setCategories] = useState<string[]>(['All']);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setCategories(getCategories());
  }, []);

  return (
    <nav
      className="w-full flex flex-col items-center mb-6"
      aria-label="Agent category filter bar"
    >
      {/* Mobile toggle */}
      <div className="md:hidden w-full flex justify-center mb-2">
        <button
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-fuchsia-700/80 to-teal-700/80 text-white font-semibold shadow-glow focus:outline-none focus-visible:ring-4 focus-visible:ring-fuchsia-400 transition-all"
          aria-expanded={mobileOpen ? 'true' : 'false'}
          aria-controls="agent-filter-bar-categories"
          onClick={() => setMobileOpen(v => !v)}
        >
          {mobileOpen ? 'Hide Categories' : 'Show Categories'}
        </button>
      </div>
      <AnimatePresence>
        {(mobileOpen || typeof window === 'undefined' || window.innerWidth >= 768) && (
          <motion.div
            id="agent-filter-bar-categories"
            className="flex flex-wrap justify-center gap-2 glass-card px-4 py-2 rounded-xl shadow-glow backdrop-blur border border-white/10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.32 }}
            role="tablist"
            aria-label="Agent categories"
          >
            {categories.map(category => (
              <button
                key={category}
                className={`px-4 py-1 rounded-full font-medium text-sm border border-white/10 transition glass-card text-white/80 hover:text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400 ${selectedCategory === category ? 'bg-white/10 text-white font-bold shadow' : ''}`}
                aria-selected={selectedCategory === category ? 'true' : 'false'}
                aria-label={`Filter agents by category: ${category}`}
                tabIndex={0}
                onClick={() => setSelectedCategory(category)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') setSelectedCategory(category);
                }}
                role="tab"
              >
                {category}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default AgentFilterBar;
