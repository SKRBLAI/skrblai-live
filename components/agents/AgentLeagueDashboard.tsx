import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/context/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import AgentLeagueCard from '../ui/AgentLeagueCard';

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
      console.log('[AgentLeagueDashboard] Loaded agents:', data.agents);
      setAgents(data.agents);
      setRecommendations(data.recommendations || []);
    });
  }, [session]);

  // Percy centerpiece logic: filter out Percy from agent display
  const percy = agents.find(a => a.id === 'percy-agent' || a.name === 'Percy');
  const otherAgents = agents.filter(a => a.id !== 'percy-agent' && a.name !== 'Percy');

  // Recommendation handoff logic
  function handleHandoff(agentId: string) {
    setSelectedAgent(agents.find(a => a.id === agentId) || null);
  }

  // Navigation to agent backstory page
  function handleAgentInfo(agent: Agent) {
    router.push(`/agent-backstory/${agent.id}`);
  }

  // Chat with agent
  function handleAgentChat(agent: Agent) {
    setSelectedAgent(agent);
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-12">
      {/* Toast container */}
      <Toaster position="bottom-right" />
      {/* Percy Centerpiece */}
      <div className="flex flex-col items-center mb-10">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-electric-blue via-fuchsia-500 to-teal-400 flex items-center justify-center text-4xl">
            🤖
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Welcome to the Digital Agent League</h2>
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
            console.log('[AgentLeagueDashboard] Rendering agent:', agent);
            return (
              <AgentLeagueCard
                key={agent.id}
                agent={agent}
                index={index}
                onChat={() => handleAgentChat(agent)}
                onInfo={() => handleAgentInfo(agent)}
                onHandoff={() => handleHandoff(agent.id)}
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
                  onClick={() => handleHandoff(agent.id)}
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
