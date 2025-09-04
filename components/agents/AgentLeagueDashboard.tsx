import React, { useEffect, useState } from 'react';
import PercyFigure from '../home/PercyFigure';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import AgentLeagueCard from '../ui/AgentLeagueCard';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import type { Agent } from '@/types/agent';
import { toSafeAgent, type SafeAgent } from '@/utils/safeAgent';
import { Toaster } from 'react-hot-toast';
// import { useMediaQuery } from 'react-responsive'; // Commented out - using window.innerWidth instead
import '../../styles/components/agent-card.css';
import '../../styles/components/AgentLeagueDashboard.css';

// Fetch Agent League data from the backend
async function fetchAgentLeagueData(token?: string) {
  const query = new URLSearchParams({
    action: 'list',
    visible: 'true',
  }).toString();

  const res = await fetch(`/api/agents/league?${query}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    throw new Error(`Failed to load Agent League data – ${res.status}`);
  }

  return res.json();
}

export default function AgentLeagueDashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { session } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [handoffSuggestions, setHandoffSuggestions] = useState<any[]>([]);

  // Phase 3: Mock user data for demonstration
  const [userAgentData] = useState({
    recommended: ['social', 'analytics', 'branding'],
    progress: {
      'social': 75,
      'analytics': 45,
      'branding': 90,
      'contentcreation': 60,
      'proposal': 30,
    } as Record<string, number>,
    mastery: {
      'social': 3,
      'analytics': 2,
      'branding': 3,
      'contentcreation': 2,
      'proposal': 1,
    } as Record<string, number>
  });

  // Replace useMediaQuery with simple window width check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const loadAgents = async () => {
      try {
        if (session?.access_token) {
          // Try to fetch from API if authenticated
          const data = await fetchAgentLeagueData(session.access_token);
          setAgents(data.agents);
          setRecommendations(data.recommendations || []);
        } else {
          // Fallback: Load directly from agentLeague for unauthenticated users
          const { agentLeague } = await import('../../lib/agents/agentLeague');
          const visibleAgents = agentLeague.getVisibleAgents();
          
          // Convert AgentConfiguration to Agent format
          const convertedAgents = visibleAgents.map(config => ({
            id: config.id,
            name: config.name,
            category: config.category,
            description: config.description,
            visible: config.visible,
            premium: config.premium,
            imageSlug: config.imageSlug,
            capabilities: config.capabilities.map(cap => cap.category),
            superheroName: config.personality?.superheroName,
            emoji: config.emoji,
            // Required fields for Agent type
            canConverse: config.canConverse ?? true,
            recommendedHelpers: config.recommendedHelpers ?? [],
            handoffTriggers: config.handoffTriggers ?? []
          }));
          
          setAgents(convertedAgents);
          setRecommendations([]);
        }
      } catch (error: any) {
        console.error('[CRITICAL][AgentLeagueDashboard] Error loading agents:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadAgents();
  }, [session]);

  // Show all agents including Percy in the grid
  const percy = agents.find(a => a.id === 'percy' || a.name === 'Percy');
  const allVisibleAgents = agents; // Show all agents in the grid

  // Mobile slider controls
  const agentsPerPage = isMobile ? 1 : allVisibleAgents.length;
  const totalSlides = isMobile ? allVisibleAgents.length : 1;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Recommendation handoff logic
  function handleHandoff(agent: SafeAgent) {
    setSelectedAgent(agent);
    if (process.env.NODE_ENV === 'development') {
      console.log('[AgentLeagueDashboard] Handoff to:', agent.name);
    }
  }

  // Navigation to unified agent service page
  function handleAgentInfo(agent: SafeAgent) {
    router.push(`/agents/${agent.id}`);
    if (process.env.NODE_ENV === 'development') {
      console.log('[AgentLeagueDashboard] View info for:', agent.name);
    }
  }

  // Chat with agent - route to unified page with chat tab
  function handleAgentChat(agent: SafeAgent) {
    router.push(`/agents/${agent.id}?tab=chat`);
    if (process.env.NODE_ENV === 'development') {
      console.log('[AgentLeagueDashboard] Chat with:', agent.name);
    }
  }

  // Launch agent functionality: trigger N8N workflow then navigate
  const handleAgentLaunch = async (agent: SafeAgent) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('[AgentLeagueDashboard] Triggering N8N workflow for:', agent.name);
      }
      const res = await fetch(`/api/agents/${agent.id}/trigger-n8n`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: {}, userPrompt: '', fileData: null })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Workflow trigger failed');
      router.push(`/agents/${agent.id}`);
    } catch (err: any) {
      console.error('[AgentLeagueDashboard] Launch error:', err);
      toast.error(err.message || 'Failed to launch agent. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
      {/* Toast container */}
      <Toaster position="bottom-right" />
      
      {/* Percy Centerpiece */}
      {percy && (
        <div className="relative mb-8 md:mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative w-24 h-24 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-600/30 blur-xl animate-pulse"></div>
              <div className="absolute inset-[2px] rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 p-1">
                <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                  <Image
                    src="/images/agents/percy.png"
                    alt="Percy - Cosmic Concierge"
                    width={88}
                    height={88}
                    className="agent-image object-contain w-full h-full"
                    style={{ transform: 'scale(0.85)' }}
                    priority
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.parentElement?.parentElement?.querySelector('.percy-fallback') as HTMLElement;
                      if (fallback) fallback.style.display = 'flex';
                    }}
                  />
                  <div className="percy-fallback absolute inset-0 hidden items-center justify-center text-cyan-400 text-2xl font-bold">
                    🎭
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20 animate-pulse"></div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to Percy's League of Superheroes</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Your cosmic concierge orchestrates the perfect AI team to dominate your industry
            </p>
          </motion.div>
        </div>
      )}

      {/* Agent League Header for when Percy is not available */}
      {!percy && (
        <div className="relative mb-8 md:mb-12">
          <div className="relative z-10 text-center mobile-text-safe py-8">
            <motion.h2 
              className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 no-text-cutoff"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                SKRBL AI League
              </span>
              {' '}of Digital Superheroes
            </motion.h2>
            <motion.p 
              className="text-sm md:text-base lg:text-lg text-gray-300 max-w-2xl mx-auto no-text-cutoff"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Your specialized AI team ready to automate and dominate your industry
            </motion.p>
          </div>
        </div>
      )}

      {/* Agent League - Mobile Slider / Desktop Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading Agent League...</p>
        </div>
      ) : error ? (
        <div className="text-center text-red-400 py-12">
          <p className="mobile-text-safe">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : agents.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <p className="mobile-text-safe">No agents available. Please try again later.</p>
        </div>
      ) : (
        <>
          {/* Debug info - show agent count */}
          <div className="text-center mb-6">
            <p className="text-cyan-400 font-semibold">
              {allVisibleAgents.length} Agents Available
            </p>
          </div>
          <div className="relative" role="region" aria-label="Agent League">
          {isMobile ? (
            <div className="relative">
              {/* Slider Navigation */}
              <div className="agent-league-nav-buttons">
                <button 
                  onClick={prevSlide}
                  disabled={currentSlide === 0}
                  className="agent-league-nav-button"
                  title="Previous agents"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={nextSlide}
                  disabled={currentSlide === totalSlides - 1}
                  className="agent-league-nav-button"
                  title="Next agents"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Slider */}
              <div className="agent-league-mobile-slider">
                <motion.div 
                  className="flex" 
                  animate={{ x: `-${currentSlide * 100}%` }} 
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  {allVisibleAgents.map((agent, index) => (
                    <div key={agent.id} className="agent-league-card-wrapper">
                      <AgentLeagueCard 
                        agent={toSafeAgent(agent)} 
                        index={index}
                        onInfo={handleAgentInfo}
                        onChat={handleAgentChat}
                        onLaunch={handleAgentLaunch}
                        onHandoff={handleHandoff}
                        isRecommended={recommendations.includes(agent.id)}
                        userProgress={userAgentData.progress[agent.id as keyof typeof userAgentData.progress] || 0}
                        userMastery={userAgentData.mastery[agent.id as keyof typeof userAgentData.mastery] || 0}
                        className="h-full"
                      />
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          ) : (
            /* Desktop Grid - Standardized Card Heights */
            <div className="agent-league-desktop-grid">
              {allVisibleAgents.map((agent, index) => (
                <AgentLeagueCard 
                  key={agent.id} 
                  agent={toSafeAgent(agent)} 
                  index={index}
                  onInfo={handleAgentInfo}
                  onChat={handleAgentChat}
                  onLaunch={handleAgentLaunch}
                  onHandoff={handleHandoff}
                  isRecommended={recommendations.includes(agent.id)}
                  userProgress={userAgentData.progress[agent.id as keyof typeof userAgentData.progress] || 0}
                  userMastery={userAgentData.mastery[agent.id as keyof typeof userAgentData.mastery] || 0}
                  className="h-full"
                />
              ))}
            </div>
          )}
          </div>
        </>
      )}

      {/* Cross-agent recommendations/handoff */}
      {recommendations.length > 0 && (
        <div className="mt-8 md:mt-12 mobile-text-safe">
          <h3 className="skrblai-heading text-xl md:text-2xl lg:text-3xl font-bold text-white mb-4 no-text-cutoff">
            Other agents who can help next
          </h3>
          <div className="mobile-button-container md:flex md:flex-wrap md:gap-4">
            {recommendations.map((agentId: string) => {
              const agent = agents.find(a => a.id === agentId);
              if (!agent) return null;
              return (
                <button
                  key={agent.id}
                  className="bg-teal-500 hover:bg-electric-blue text-white px-4 py-2 rounded-lg shadow font-medium transition-all text-sm md:text-base"
                  onClick={() => handleHandoff(agent)}
                >
                  {agent.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
