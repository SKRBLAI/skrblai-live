'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Star, Zap, Crown, TrendingUp, Lock } from 'lucide-react';
import AgentCard from '@/components/AgentCard';
import AgentModal from '@/components/agents/AgentModal';
import { Agent } from '@/types/agent';
import PageLayout from '@/components/layout/ClientPageLayout';
import { getPublicAgents } from '@/lib/agents/agentIntelligence';
import { useAuth } from '@/components/context/AuthContext';
import { useRouter } from 'next/navigation';
import useUsageBasedPricing from '@/hooks/useUsageBasedPricing';
import RevenuePulseWidget from '@/components/ui/RevenuePulseWidget';
import { toast } from 'react-hot-toast';

// Enhanced Agent type with usage-based properties
interface EnhancedAgent extends Agent {
  isLocked: boolean;
  usageCount: number;
  popularityScore: number;
}

export default function AgentsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  
  // ✨ NEW: Usage-based pricing integration
  const {
    usage,
    currentTier,
    recommendation,
    upgradeUrgency,
    valueRealized,
    trackUsage,
    shouldShowUpgradePrompt,
    getUpgradeMessage
  } = useUsageBasedPricing();

  // State management
  const [agents, setAgents] = useState<EnhancedAgent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<EnhancedAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<EnhancedAgent | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'popularity'>('popularity');
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ✨ NEW: Usage pressure state
  const [showUsageBanner, setShowUsageBanner] = useState(false);

  // ✨ NEW: Track page view and usage patterns
  useEffect(() => {
    trackUsage('agents_page_view', {
      searchTerm,
      selectedCategory,
      sortBy,
      agentsViewCount: filteredAgents.length
    });

    // Show usage banner if approaching limits
    if (currentTier === 'free' && usage.agentsUsedToday >= 2) {
      setShowUsageBanner(true);
    }
  }, [trackUsage, searchTerm, selectedCategory, sortBy, filteredAgents.length, currentTier, usage.agentsUsedToday]);

  // Load agents
  useEffect(() => {
    async function loadAgents() {
      try {
        setIsLoading(true);
        const agentData = await getPublicAgents();
        
        // ✨ ENHANCED: Add usage-based metadata to agents
        const enhancedAgents: EnhancedAgent[] = agentData.map((agent: Agent) => ({
          ...agent,
          isLocked: currentTier === 'free' && (
            usage.agentsUsedToday >= 3 || 
            !['adCreativeAgent', 'analyticsAgent', 'bizAgent'].includes(agent.id)
          ),
          usageCount: Math.floor(Math.random() * 1000), // Simulate usage stats
          popularityScore: Math.floor(Math.random() * 100)
        }));

        setAgents(enhancedAgents);
        setFilteredAgents(enhancedAgents);
      } catch (error) {
        console.error('Error loading agents:', error);
        toast.error('Failed to load agents');
      } finally {
        setIsLoading(false);
      }
    }

    loadAgents();
  }, [currentTier, usage.agentsUsedToday]);

  // ✨ ENHANCED: Filter and sort with usage awareness
  useEffect(() => {
    let filtered = agents.filter(agent => {
      const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           agent.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || agent.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // ✨ NEW: Sort with usage-based priority
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'popularity':
        default:
          // Prioritize unlocked agents for free users
          if (currentTier === 'free') {
            if (!a.isLocked && b.isLocked) return -1;
            if (a.isLocked && !b.isLocked) return 1;
          }
          return (b.popularityScore || 0) - (a.popularityScore || 0);
      }
    });

    setFilteredAgents(filtered);
  }, [agents, searchTerm, selectedCategory, sortBy, currentTier]);

  // Get unique categories from agents
  const categories = useMemo(() => {
    const cats = ['All', ...Array.from(new Set(agents.map(agent => agent.category)))];
    return cats;
  }, [agents]);

  // ✨ ENHANCED: Handle agent selection with usage tracking
  const handleAgentSelect = (agent: EnhancedAgent) => {
    setSelectedAgent(agent);
    setShowModal(true);
    
    // Track agent selection
    trackUsage('agent_selected', {
      agentId: agent.id,
      agentName: agent.name,
      category: agent.category,
      isLocked: agent.isLocked,
      searchTerm,
      selectedCategory
    });
  };

  // ✨ ENHANCED: Handle agent launch with usage limits
  const handleAgentTry = async (agent: EnhancedAgent) => {
    if (!user) {
      toast.error('Please sign in to use agents');
      router.push('/sign-in');
      return;
    }

    // Check usage limits
    if (currentTier === 'free' && usage.agentsUsedToday >= 3) {
      trackUsage('usage_limit_hit', { 
        agentId: agent.id,
        attemptedUsage: usage.agentsUsedToday + 1 
      });
      
      toast.error('Daily agent limit reached! Upgrade to continue.');
      router.push('/pricing?offer=agent_limit');
      return;
    }

    try {
      // Track successful agent launch
      trackUsage('agent_launch', {
        agentId: agent.id,
        agentName: agent.name,
        category: agent.category,
        source: 'agents_page',
        usageToday: usage.agentsUsedToday + 1
      });

      // Navigate to agent
      router.push(`/agents/${agent.id}`);
      
      // Show usage milestones
      if (usage.agentsUsedToday + 1 === 2) {
        toast.success('🎉 Building momentum! One more free agent remaining today.');
      } else if (usage.agentsUsedToday + 1 === 3) {
        toast.success('🔥 Last free agent used! Upgrade for unlimited access.');
      }

    } catch (error) {
      console.error('Error launching agent:', error);
      toast.error('Failed to launch agent');
    }
  };

  const handleUpgrade = () => {
    trackUsage('upgrade_click', { 
      source: 'agents_page_banner',
      urgencyScore: upgradeUrgency,
      valueScore: valueRealized
    });
    router.push('/pricing?offer=agents_page');
  };

  // ✨ NEW: Handle search with usage tracking
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    trackUsage('agents_search', { 
      searchTerm: term,
      resultsCount: filteredAgents.filter(a => 
        a.name.toLowerCase().includes(term.toLowerCase()) ||
        a.description.toLowerCase().includes(term.toLowerCase())
      ).length
    });
  };

  if (authLoading || isLoading) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        
        {/* ✨ NEW: Enhanced Usage Banner with dynamic messaging */}
        {showUsageBanner && currentTier === 'free' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-b border-orange-500/30 p-4"
          >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold">
                    {usage.agentsUsedToday >= 3 ? '🚨 Daily Limit Reached!' : 
                     usage.agentsUsedToday === 2 ? '⚡ Last Free Agent Remaining!' :
                     '🔥 Upgrade for Unlimited Access'}
                  </h3>
                  <p className="text-orange-200 text-sm">
                    {usage.agentsUsedToday >= 3 ? 
                      'Upgrade to Starter Hustler for 6 agents + unlimited scans.' :
                      `${usage.agentsUsedToday}/3 agents used today. Unlock 11+ more with Starter Hustler.`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right text-xs text-orange-300">
                  <div>Urgency Score: {upgradeUrgency}%</div>
                  <div>Value Realized: {valueRealized}%</div>
                </div>
                <button
                  onClick={handleUpgrade}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                >
                  Upgrade Now ($27/mo)
                </button>
                <button
                  onClick={() => setShowUsageBanner(false)}
                  className="text-orange-300 hover:text-white text-xl"
                >
                  ×
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-6">
              AI Agent Arsenal
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Choose from our collection of specialized AI agents designed to automate and optimize every aspect of your business.
            </p>
            
            {/* ✨ NEW: Enhanced stats with usage indicators */}
            <div className="flex justify-center gap-8 text-center">
              <div>
                <div className="text-2xl font-bold text-white">{agents.length}</div>
                <div className="text-gray-400 text-sm">Total Agents</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">
                  {currentTier === 'free' ? `${3 - usage.agentsUsedToday}` : '∞'}
                </div>
                <div className="text-gray-400 text-sm">
                  {currentTier === 'free' ? 'Remaining Today' : 'Unlimited Access'}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">{usage.consecutiveDaysActive}</div>
                <div className="text-gray-400 text-sm">Day Streak</div>
              </div>
            </div>
          </motion.div>

          {/* Search and Filter Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 space-y-4"
          >
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap justify-center gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'category' | 'popularity')}
                className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="popularity">Most Popular</option>
                <option value="name">Name A-Z</option>
                <option value="category">Category</option>
              </select>
            </div>
          </motion.div>

          {/* ✨ NEW: Usage momentum indicator */}
          {upgradeUrgency > 50 && currentTier === 'free' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full text-green-400">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">
                  High automation momentum detected! ({upgradeUrgency}% urgency score)
                </span>
              </div>
            </motion.div>
          )}

          {/* Agents Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredAgents.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div 
                  onClick={() => handleAgentSelect(agent)}
                  className={`cursor-pointer ${agent.isLocked ? 'opacity-75 relative' : ''}`}
                >
                  <AgentCard agent={agent} />
                  {agent.isLocked && (
                    <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                      <div className="text-center">
                        <Lock className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                        <div className="text-orange-400 text-sm font-medium">Upgrade to Unlock</div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Empty State */}
          {filteredAgents.length === 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-white mb-2">No agents found</h3>
              <p className="text-gray-400">Try adjusting your search or filter criteria</p>
            </motion.div>
          )}
        </div>

        {/* Agent Modal */}
        {selectedAgent && (
          <AgentModal
            agent={selectedAgent as Agent}
            open={showModal}
            onClose={() => {
              setShowModal(false);
              setSelectedAgent(null);
            }}
            onTry={(agent: Agent) => handleAgentTry(agent as EnhancedAgent)}
          />
        )}

        {/* ✨ NEW: Revenue Pulse Widget */}
        <RevenuePulseWidget 
          currentTier={currentTier}
          agentsUsedToday={usage.agentsUsedToday}
          scansUsedToday={usage.scansUsedToday}
          className="agents-page-revenue-pulse"
        />
      </div>
    </PageLayout>
  );
}
