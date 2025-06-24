import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import AgentLeagueCard from '../ui/AgentLeagueCard';
import Image from 'next/image';

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
  const { session } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [handoffSuggestions, setHandoffSuggestions] = useState<any[]>([]);

  // Phase 3: Mock user data for demonstration
  const [userAgentData] = useState({
    recommended: ['social-agent', 'analytics-agent', 'branding-agent'],
    progress: {
      'social-agent': 75,
      'analytics-agent': 45,
      'branding-agent': 90,
      'content-creation-agent': 60,
      'proposal-generator-agent': 30,
    } as Record<string, number>,
    mastery: {
      'social-agent': 3,
      'analytics-agent': 2,
      'branding-agent': 3,
      'content-creation-agent': 2,
      'proposal-generator-agent': 1,
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
        console.log('[AgentLeagueDashboard] Loaded agents:', data.agents);
        console.log('[AgentLeagueDashboard] Agent count:', data.agents.length);
        console.log('[AgentLeagueDashboard] Agent details:', data.agents.map((a: Agent) => ({ id: a.id, name: a.name, visible: a.visible })));
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
  const percy = agents.find(a => a.id === 'percy-agent' || a.name === 'Percy');
  const otherAgents = agents.filter(a => a.id !== 'percy-agent' && a.name !== 'Percy');

  // Recommendation handoff logic
  function handleHandoff(agent: Agent) {
    setSelectedAgent(agent);
    if (process.env.NODE_ENV === 'development') {
      console.log('[AgentLeagueDashboard] Handoff to:', agent.name);
    }
  }

  // Navigation to agent backstory page
  function handleAgentInfo(agent: Agent) {
    router.push(`/agent-backstory/${agent.id}`);
    if (process.env.NODE_ENV === 'development') {
      console.log('[AgentLeagueDashboard] View info for:', agent.name);
    }
  }

  // Chat with agent
  function handleAgentChat(agent: Agent) {
    setSelectedAgent(agent);
    if (process.env.NODE_ENV === 'development') {
      console.log('[AgentLeagueDashboard] Chat with:', agent.name);
    }
  }

  // Launch agent functionality
  function handleAgentLaunch(agent: Agent) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[AgentLeagueDashboard] Launch agent:', agent.name);
    }
    // Navigate to agent's specific service page
    router.push(`/services/${agent.id}`);
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-12">
      {/* Toast container */}
      <Toaster position="bottom-right" />
      {/* Percy Centerpiece */}
      <div className="flex flex-col items-center mb-10">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-600/30 blur-xl animate-pulse"></div>
            <div className="absolute inset-[2px] rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 p-1">
              <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                <Image
                  src="/images/agents-percy-nobg-skrblai.webp"
                  alt="Percy - Cosmic Concierge"
                  width={88}
                  height={88}
                  className="agent-image object-contain w-full h-full"
                  style={{ transform: 'scale(0.85)' }}
                  priority
                />
              </div>
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20 animate-pulse"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to Percy's League of Superheroes</h2>
          <p className="text-gray-300">Your cosmic concierge is ready to coordinate the perfect team</p>
        </div>
      </div>
      {/* Agent League Grid or Carousel */}
      {agents.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <p>No agents available. Please try again later.</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
          initial="hidden"
          animate="visible"
        >
          {otherAgents.map((agent, index) => {
            if (process.env.NODE_ENV === 'development') {
              console.log('[AgentLeagueDashboard] Rendering agent:', agent);
            }
            return (
              <AgentLeagueCard
                key={agent.id}
                agent={agent}
                index={index}
                onChat={() => handleAgentChat(agent)}
                onInfo={() => handleAgentInfo(agent)}
                onHandoff={() => handleHandoff(agent)}
                onLaunch={() => handleAgentLaunch(agent)}
                isRecommended={userAgentData.recommended.includes(agent.id)}
                userProgress={userAgentData.progress[agent.id] || 0}
                userMastery={userAgentData.mastery[agent.id] || 0}
              />
            );
          })}
        </motion.div>
      )}
      {/* Cross-agent recommendations/handoff */}
      {recommendations.length > 0 && (
        <div className="mt-12">
          <h3 className="skrblai-heading text-2xl md:text-3xl font-bold text-white mb-4">Other agents who can help next</h3>
          <div className="flex flex-wrap gap-4">
            {recommendations.map((agentId: string) => {
              const agent = agents.find(a => a.id === agentId);
              if (!agent) return null;
              return (
                <button
                  key={agent.id}
                  className="bg-teal-500 hover:bg-electric-blue text-white px-4 py-2 rounded-lg shadow font-medium transition-all"
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
