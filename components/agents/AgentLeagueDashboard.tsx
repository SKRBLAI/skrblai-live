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
import { Toaster } from 'react-hot-toast';
// import { useMediaQuery } from 'react-responsive'; // Commented out - using window.innerWidth instead

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
    if (!session?.access_token) return;
    fetchAgentLeagueData(session.access_token).then(data => {
      // Production-optimized logging
      if (process.env.NODE_ENV === 'development') {
        console.log('[AgentLeagueDashboard] Loaded agents:', data.agents); // TODO: REVIEW UNUSED
        console.log('[AgentLeagueDashboard] Agent count:', data.agents.length); // TODO: REVIEW UNUSED
        console.log('[AgentLeagueDashboard] Agent details:', data.agents.map((a: Agent) => ({ id: a.id, name: a.name, visible: a.visible }))); // TODO: REVIEW UNUSED
      }
      setAgents(data.agents);
      setRecommendations(data.recommendations || []);
    }).catch(error => {
      console.error('[CRITICAL][AgentLeagueDashboard] Error loading agents:', error);
      setError(error.message);
    }).finally(() => {
      setLoading(false);
    });
  }, [session]);

  // Percy centerpiece logic: filter out Percy from agent display
  const percy = agents.find(a => a.id === 'percy' || a.name === 'Percy');
  const otherAgents = agents.filter(a => a.id !== 'percy' && a.name !== 'Percy');

  // Mobile slider controls
  const agentsPerPage = isMobile ? 1 : otherAgents.length;
  const totalSlides = isMobile ? otherAgents.length : 1;

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
  function handleHandoff(agent: Agent) {
    setSelectedAgent(agent);
    if (process.env.NODE_ENV === 'development') {
      console.log('[AgentLeagueDashboard] Handoff to:', agent.name);
    }
  }

  // Navigation to unified agent service page
  function handleAgentInfo(agent: Agent) {
    router.push(`/services/${agent.id}`);
    if (process.env.NODE_ENV === 'development') {
      console.log('[AgentLeagueDashboard] View info for:', agent.name);
    }
  }

  // Chat with agent - route to unified page with chat tab
  function handleAgentChat(agent: Agent) {
    router.push(`/services/${agent.id}?tab=chat`);
    if (process.env.NODE_ENV === 'development') {
      console.log('[AgentLeagueDashboard] Chat with:', agent.name);
    }
  }

  // Launch agent functionality: trigger N8N workflow then navigate
  const handleAgentLaunch = async (agent: Agent) => {
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
      router.push(`/services/${agent.id}`);
    } catch (err: any) {
      console.error('[AgentLeagueDashboard] Launch error:', err);
      toast.error(err.message || 'Failed to launch agent. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
      {/* Toast container */}
      <Toaster position="bottom-right" />
      
      {/* New Header with Percy Background Treatment */}
      <div className="relative mb-8 md:mb-12">
        {/* Background Percy Hero - Subtle and Large */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
          <Image
            src="/images/percy-hero.png"
            alt="Percy Background"
            width={400}
            height={400}
            className="animate-pulse"
            style={{ 
              filter: 'blur(1px)',
              transform: 'scale(1.2)',
            }}
          />
        </div>
        
        {/* Header Content */}
        <div className="relative z-10 text-center mobile-text-safe py-8">
          <motion.h2 
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 no-text-cutoff"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Percy And the{' '}
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
            Your cosmic concierge orchestrates the perfect AI team to dominate your industry
          </motion.p>
        </div>
      </div>

      {/* Agent League - Mobile Slider / Desktop Grid */}
      {agents.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <p className="mobile-text-safe">No agents available. Please try again later.</p>
        </div>
      ) : (
        <div className="relative" role="region" aria-label="Agent League">
          {isMobile ? (
            <div className="relative">
              {/* Slider Navigation */}
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={prevSlide}
                  className="p-2 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 transition-all min-w-[44px] min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/80"
                  disabled={currentSlide === 0}
                  aria-label="Previous agent"
                  tabIndex={0}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="text-center">
                  <span className="text-sm text-gray-400">
                    {currentSlide + 1} of {totalSlides}
                  </span>
                </div>
                
                <button
                  onClick={nextSlide}
                  className="p-2 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 transition-all min-w-[44px] min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/80"
                  disabled={currentSlide === totalSlides - 1}
                  aria-label="Next agent"
                  tabIndex={0}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Agent Slider */}
              <div className="overflow-x-auto overflow-y-visible w-full scrollbar-thin scrollbar-thumb-cyan-700/30" style={{ WebkitOverflowScrolling: 'touch' }}>
                <motion.div
                  className="flex"
                  animate={{ x: `-${currentSlide * 100}%` }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  {otherAgents.map((agent, index) => (
                    <div key={agent.id} className="w-full flex-shrink-0 px-1">
                      <AgentLeagueCard
                        agent={agent}
                        index={index}
                        onInfo={handleAgentInfo}
                        onChat={handleAgentChat}
                        onLaunch={handleAgentLaunch}
                        onHandoff={handleHandoff}
                        selected={selectedAgent?.id === agent.id}
                        isRecommended={userAgentData.recommended.includes(agent.id)}
                        userProgress={userAgentData.progress[agent.id] || 0}
                        userMastery={userAgentData.mastery[agent.id] || 0}
                      />
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          ) : (
            /* Desktop Grid - Standardized Card Heights */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6" style={{ gridAutoRows: '320px' }}>
              {otherAgents.map((agent, index) => (
                <AgentLeagueCard
                  key={agent.id}
                  agent={agent}
                  index={index}
                  onInfo={handleAgentInfo}
                  onChat={handleAgentChat}
                  onLaunch={handleAgentLaunch}
                  onHandoff={handleHandoff}
                  selected={selectedAgent?.id === agent.id}
                  isRecommended={userAgentData.recommended.includes(agent.id)}
                  userProgress={userAgentData.progress[agent.id] || 0}
                  userMastery={userAgentData.mastery[agent.id] || 0}
                />
              ))}
            </div>
          )}
        </div>
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
