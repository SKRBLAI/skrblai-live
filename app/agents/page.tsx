'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Star, Zap, Crown, TrendingUp, Lock } from 'lucide-react';
import AgentLeagueCard from '../../components/ui/AgentLeagueCard';
import { toSafeAgent, type SafeAgent } from '../../utils/safeAgent';
import ClientPageLayout from '../../components/layout/ClientPageLayout';
import CosmicCard, { CosmicCardGlow, CosmicCardGlass } from '../../components/shared/CosmicCard';
import CosmicHeading from '../../components/shared/CosmicHeading';
import { agentLeague } from '../../lib/agents/agentLeague';
import { useAuth } from '../../components/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import ErrorBoundary from '../../components/layout/ErrorBoundary';

// Enhanced Agent type with access control
interface EnhancedAgent extends SafeAgent {
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

  // Agent interaction handlers - All route to unified agent page
  const handleAgentInfo = (agent: SafeAgent) => {
    router.push(`/agents/${agent.id}`);
  };

  const handleAgentChat = (agent: SafeAgent) => {
    if (agent.isLocked) {
      toast.error('Please sign in to chat with premium agents');
      return;
    }
    // Route to unified page with chat tab active
    router.push(`/agents/${agent.id}?tab=chat`);
  };

  const handleAgentLaunch = (agent: SafeAgent) => {
    if (agent.isLocked) {
      toast.error('Please sign in to launch premium agents');
      return;
    }
    router.push(`/agents/${agent.id}`);
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
      <ClientPageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading...</p>
          </div>
        </div>
      </ClientPageLayout>
    );
  }

  return (
    <ErrorBoundary>
      <ClientPageLayout>
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.5 }}
          className="min-h-screen relative"
        >
          <div className="relative z-10 pt-16 sm:pt-20 lg:pt-24 px-4 md:px-8 lg:px-12">
            
            {/* Hero Section */}
            <CosmicCardGlow size="xl" className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-full mb-8">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span className="text-green-300 font-bold">
                    LIVE: {liveMetrics.totalAgents} AI Agents • {liveMetrics.liveUsers} Active Users
                  </span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>

                <CosmicHeading className="text-4xl md:text-6xl lg:text-7xl mb-8">
                  Meet Your AI
                  <br />
                  <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    Superhero League
                  </span>
                </CosmicHeading>

                <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
                  14 specialized AI agents, each with unique superpowers designed to automate, 
                  optimize, and dominate every aspect of your business.
                </p>

              {/* Search and Filter Controls */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-center mb-8 max-w-4xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    aria-label="Search agents"
                    placeholder="Search agents..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none w-64 backdrop-blur-sm"
                  />
                </div>

                <select
                  aria-label="Filter by category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none backdrop-blur-sm"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                <select
                  aria-label="Sort agents"
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
            </CosmicCardGlow>

            {/* Agent League Grid */}
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto mb-16"
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
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="relative group cursor-pointer transition-all duration-300"
                  >
                    <CosmicCardGlass className="h-full p-6 relative overflow-hidden">
                      {/* Live Activity Badge */}
                      <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/40 px-2 py-1 rounded-full text-xs">
                        className="w-full h-full bg-transparent border-0 shadow-none p-0 rounded-none"
                      </div>
                    </CosmicCardGlass>
                  </motion.div>
                ))
              )}
            </motion.div>

            {/* CTA Section */}
            <motion.div
              className="relative max-w-5xl mx-auto text-center mb-24"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 90, damping: 18 }}
              viewport={{ once: true }}
            >
              {/* Cosmic background (subtle, behind card) */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-cyan-900/40 to-transparent rounded-2xl blur-2xl opacity-70"></div>
                <div className="absolute left-1/4 top-0 w-48 h-48 bg-fuchsia-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute right-1/4 bottom-0 w-60 h-40 bg-cyan-400/20 rounded-full blur-2xl animate-pulse-slow"></div>
              </div>
              {/* CTA Card */}
              <motion.div
                className="relative z-10 bg-gradient-to-r from-purple-700/30 to-cyan-700/20 rounded-2xl px-4 py-10 sm:px-12 sm:py-16 border border-purple-500/30 shadow-2xl flex flex-col items-center"
                initial={{ scale: 0.98, opacity: 0.8 }}
                whileHover={{ scale: 1.01, boxShadow: '0 0 64px 0 #7f1fff55' }}
                transition={{ type: 'spring', stiffness: 220, damping: 24 }}
              >
                <h2 className="text-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-electric-blue via-teal-400 to-fuchsia-500 bg-clip-text text-transparent mb-4 antialiased drop-shadow-lg">
                  Ready To Unleash Your AI Superhero Team?
                </h2>
                <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
                  Join <span className="text-electric-blue font-bold">{liveMetrics.liveUsers}+</span> users already training with these powerful AI agents.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-lg mx-auto mb-4">
                  <motion.button
                    onClick={() => router.push('/sign-up')}
                    className="flex-1 px-6 py-4 rounded-xl font-bold text-lg shadow-glow bg-gradient-to-r from-cyan-600/90 to-blue-600/90 hover:from-cyan-400 hover:to-blue-400 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/80 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    aria-label="Start Free Trial (No Credit Card)"
                  >
                    🚀 Start Free Trial (No Credit Card)
                  </motion.button>
                  <motion.button
                    onClick={() => router.push('/services')}
                    className="flex-1 px-6 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-fuchsia-600/80 to-purple-600/80 hover:from-fuchsia-400 hover:to-purple-400 text-white shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400/80 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    aria-label="See Business Solutions"
                  >
                    🎯 See Business Solutions
                  </motion.button>
                </div>
                <div className="mt-2 text-xs sm:text-sm text-gray-400">
                  ⚡ Setup in under 5 minutes • 🎯 See results in 7 days • 💰 Cancel anytime
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </ClientPageLayout>
    </ErrorBoundary>
  );
}
