'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Star, Zap, Crown, TrendingUp, Lock } from 'lucide-react';
import AgentLeagueCard from '@/components/ui/AgentLeagueCard';
import { Agent } from '@/types/agent';
import PageLayout from '@/components/layout/PageLayout';
import GlassmorphicCard from '@/components/shared/GlassmorphicCard';
import CosmicHeading from '@/components/shared/CosmicHeading';
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
  const [liveMetrics, setLiveMetrics] = useState({ totalAgents: 247, liveUsers: 89 });

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

  // Live metrics updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics(prev => ({
        totalAgents: prev.totalAgents + Math.floor(Math.random() * 3) - 1,
        liveUsers: prev.liveUsers + Math.floor(Math.random() * 5) - 2
      }));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
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
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.5 }}
          className="min-h-screen relative"
        >
          <div className="relative z-10 pt-16 sm:pt-20 lg:pt-24 px-4 md:px-8 lg:px-12">
            
            {/* Hero Section with Live Activity */}
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="flex items-center gap-2 bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                  🤖 LIVE: {liveMetrics.totalAgents} AI agents active
                </div>
                <div className="flex items-center gap-2 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-bold">
                  ⚡ {liveMetrics.liveUsers} users training now
                </div>
              </div>
              
              <CosmicHeading className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl mb-4 md:mb-6 mobile-text-safe no-text-cutoff">
                Agent League
              </CosmicHeading>
              <p className="text-lg sm:text-xl text-teal-300 max-w-3xl mx-auto mb-6 md:mb-8 font-semibold leading-relaxed mobile-text-safe no-text-cutoff">
                Meet your AI superhero team - each with unique powers and personalities. <span className="text-white font-bold">Real agents, real results, real fast.</span>
              </p>
              
              {/* Search and Filter Controls */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-center mb-8 max-w-4xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search agents..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none w-64 backdrop-blur-sm"
                  />
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none backdrop-blur-sm"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'category' | 'popularity')}
                  className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none backdrop-blur-sm"
                >
                  <option value="popularity">Most Popular</option>
                  <option value="name">Name A-Z</option>
                  <option value="category">Category</option>
                </select>
              </div>
            </motion.div>

            {/* Agent League Grid */}
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto mb-16 agent-league-grid"
            >
              {isLoading ? (
                <div className="col-span-full flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-400">Loading agents...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="col-span-full text-center py-16">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Error Loading Agents</h3>
                  <p className="text-gray-400">{error}</p>
                </div>
              ) : filteredAgents.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <div className="text-6xl mb-4">🤖</div>
                  <h3 className="text-xl font-semibold text-white mb-2">No agents found</h3>
                  <p className="text-gray-400">Try adjusting your search or filter criteria</p>
                </div>
              ) : (
                filteredAgents.map((agent, index) => (
                  <motion.div
                    key={agent.id}
                    variants={item}
                    className="relative"
                  >
                    <GlassmorphicCard className="h-full p-6 relative overflow-hidden">
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
                        className="w-full h-full bg-transparent border-0 shadow-none p-0 rounded-none"
                      />
                    </GlassmorphicCard>
                  </motion.div>
                ))
              )}
            </motion.div>

            {/* CTA Section */}
            <motion.div
              className="max-w-5xl mx-auto text-center mb-24"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <GlassmorphicCard className="p-12 border-2 border-purple-500/30">
                <h2 className="text-4xl font-bold text-white mb-4">
                  Ready To Unleash Your AI Superhero Team?
                </h2>
                <p className="text-xl text-gray-300 mb-8">
                  Join {liveMetrics.liveUsers}+ users already training with these powerful AI agents.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={() => router.push('/sign-up')}
                    className="cosmic-btn-primary px-8 py-4 rounded-xl font-bold text-lg shadow-2xl"
                  >
                    🚀 Start Free Trial (No Credit Card)
                  </button>
                  <button
                    onClick={() => router.push('/services')}
                    className="cosmic-btn-secondary px-8 py-4 rounded-xl font-bold text-lg"
                  >
                    🎯 See Business Solutions
                  </button>
                </div>
                <div className="mt-6 text-sm text-gray-400">
                  ⚡ Setup in under 5 minutes • 🎯 See results in 7 days • 💰 Cancel anytime
                </div>
              </GlassmorphicCard>
            </motion.div>
          </div>
        </motion.div>
      </PageLayout>
    </ErrorBoundary>
  );
}
