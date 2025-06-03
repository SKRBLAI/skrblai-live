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
      aria-label="Agent categories"
      role="navigation"
    >
      {/* Mobile toggle */}
      <div className="md:hidden w-full flex justify-center mb-4 px-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full max-w-xs px-4 py-2 rounded-xl cosmic-btn-primary shadow-cosmic font-medium text-white/90 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50 transition-all duration-300"
          aria-expanded={mobileOpen ? 'true' : 'false'}
          aria-controls="agent-filter-bar-categories"
          onClick={() => setMobileOpen(v => !v)}
        >
          {mobileOpen ? 'Hide Categories' : 'Show Categories'}
        </motion.button>
      </div>
      <AnimatePresence>
        {(mobileOpen || typeof window === 'undefined' || window.innerWidth >= 768) && (
          <motion.div
            id="agent-filter-bar-categories"
            className="flex flex-wrap justify-center gap-2 cosmic-float-card px-4 py-3 rounded-xl shadow-cosmic backdrop-blur-xl border-2 border-teal-400/20 mx-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.32 }}
            role="group"
            aria-label="Filter by category"
          >
            {categories.map(category => (
              <button
                key={category}
                className={`px-4 py-1.5 rounded-full font-medium text-sm transition-all duration-300 backdrop-blur-md
                  ${selectedCategory === category 
                    ? 'bg-teal-400/20 text-white border-2 border-teal-400/40 shadow-cosmic' 
                    : 'border-2 border-white/10 text-white/80 hover:border-teal-400/20 hover:text-white hover:bg-white/5'}
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/50`}
                aria-pressed={selectedCategory === category ? 'true' : 'false'}
                aria-label={`Filter agents by category: ${category}`}
                tabIndex={0}
                onClick={() => setSelectedCategory(category)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') setSelectedCategory(category);
                }}
                role="button"
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
