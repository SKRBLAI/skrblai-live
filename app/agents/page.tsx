'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Star, Zap, Crown, TrendingUp, Lock } from 'lucide-react';
import AgentLeagueCard from '@/components/ui/AgentLeagueCard';
import { Agent } from '@/types/agent';
import PageLayout from '@/components/layout/ClientPageLayout';
import { agentLeague } from '@/lib/agents/agentLeague';
import { useAuth } from '@/components/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import ErrorBoundary from '@/components/layout/ErrorBoundary';

// Enhanced Agent type with access control
interface EnhancedAgent extends Agent {
  isLocked: boolean;
  usageCount: number;
  popularityScore: number;
}

export default function AgentsPage() {
  const router = useRouter();
  const { user, session, isLoading: authLoading } = useAuth();
  
  // State management
  const [agents, setAgents] = useState<EnhancedAgent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<EnhancedAgent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'popularity'>('popularity');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load agents from Agent League
  useEffect(() => {
    async function loadAgents() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get all visible agents from Agent League
        const visibleAgents = agentLeague.getVisibleAgents();
        
        // Transform to Agent format and add enhancement metadata
        const enhancedAgents: EnhancedAgent[] = visibleAgents.map((config, index) => ({
          // Core agent properties
          id: config.id,
          name: config.name,
          description: config.description,
          category: config.category,
          emoji: config.emoji,
          visible: config.visible,
          premium: config.premium,
          imageSlug: config.imageSlug,
          capabilities: config.capabilities.map(cap => cap.category),
          
          // Superhero fields from personality
          superheroName: config.personality?.superheroName,
          origin: config.personality?.origin,
          powers: config.personality?.powers,
          weakness: config.personality?.weakness,
          catchphrase: config.personality?.catchphrase,
          nemesis: config.personality?.nemesis,
          backstory: config.personality?.backstory,
          
          // Enhanced conversation capabilities
          canConverse: config.canConverse,
          recommendedHelpers: config.recommendedHelpers,
          handoffTriggers: config.handoffTriggers,
          conversationCapabilities: config.conversationCapabilities,
          
          // Technical fields
          n8nWorkflowId: config.n8nWorkflowId,
          primaryCapability: config.capabilities[0]?.category,
          
          // UI fields
          usageCount: Math.floor(Math.random() * 1000), // Simulate usage stats
          performanceScore: Math.floor(Math.random() * 100),
          unlocked: true,
          hasImage: !!config.imageSlug,
          roleRequired: config.roleRequired,
          upgradeRequired: config.premium ? 'premium' : null,
          
          // Access control
          isLocked: config.premium && !user, // Lock premium agents for non-authenticated users
          popularityScore: Math.floor(Math.random() * 100)
        }));

        setAgents(enhancedAgents);
        setFilteredAgents(enhancedAgents);
        
      } catch (error) {
        console.error('Error loading agents:', error);
        setError('Failed to load agents');
        toast.error('Failed to load agents');
      } finally {
        setIsLoading(false);
      }
    }

    loadAgents();
  }, [user]);

  // Filter and sort agents
  useEffect(() => {
    let filtered = agents.filter(agent => {
      const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (agent.superheroName && agent.superheroName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || agent.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort agents
    filtered = filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'popularity':
        default:
          // Prioritize unlocked agents
          if (!a.isLocked && b.isLocked) return -1;
          if (a.isLocked && !b.isLocked) return 1;
          return (b.popularityScore || 0) - (a.popularityScore || 0);
      }
    });

    setFilteredAgents(filtered);
  }, [agents, searchTerm, selectedCategory, sortBy]);

  // Get unique categories from agents
  const categories = useMemo(() => {
    const cats = ['All', ...Array.from(new Set(agents.map(agent => agent.category)))];
    return cats;
  }, [agents]);

  // Agent interaction handlers
  const handleAgentInfo = (agent: EnhancedAgent) => {
    router.push(`/agent-backstory/${agent.id}`);
  };

  const handleAgentChat = (agent: EnhancedAgent) => {
    if (agent.isLocked) {
      toast.error('Please sign in to chat with premium agents');
      return;
    }
    router.push(`/agent-backstory/${agent.id}`);
  };

  const handleAgentLaunch = (agent: EnhancedAgent) => {
    if (agent.isLocked) {
      toast.error('Please sign in to launch premium agents');
      return;
    }
    router.push(`/services/${agent.id}`);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  if (authLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <ErrorBoundary>
      <PageLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 px-4"
          >
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Agent League
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Meet your AI superhero team - each with unique powers and personalities
              </p>
              
              {/* Search and Filter Controls */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-center mb-8">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search agents..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none w-64"
                  />
                </div>
                
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
            </div>
          </motion.div>

          {/* Agents Grid */}
          <div className="max-w-7xl mx-auto px-4 pb-16">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-4 text-gray-400">Loading agents...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-white mb-2">Error Loading Agents</h3>
                <p className="text-gray-400">{error}</p>
              </div>
            ) : (
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
                    className="relative"
                  >
                    <AgentLeagueCard
                      agent={agent}
                      index={index}
                      onInfo={() => handleAgentInfo(agent)}
                      onChat={() => handleAgentChat(agent)}
                      onLaunch={() => handleAgentLaunch(agent)}
                      isRecommended={!agent.isLocked && agent.popularityScore > 80}
                      userProgress={agent.usageCount / 10}
                      userMastery={Math.floor(agent.popularityScore / 20)}
                      showIntelligence={true}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Empty State */}
            {filteredAgents.length === 0 && !isLoading && !error && (
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
        </div>
      </PageLayout>
    </ErrorBoundary>
  );
}
