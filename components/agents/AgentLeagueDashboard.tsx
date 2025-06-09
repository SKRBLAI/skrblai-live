import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AgentCard from '../ui/AgentCard';
import AgentBackstoryModal from './AgentBackstoryModal';
import AgentCarousel from './AgentCarousel';
import type { Agent } from '@/types/agent';
// import { useMediaQuery } from 'react-responsive'; // Commented out - using window.innerWidth instead

// Fetch agentBackstories/config from backend or context (replace with actual data source)
async function fetchAgentLeagueData() {
  const res = await fetch('/api/agent-league');
  return res.json();
}

export default function AgentLeagueDashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  // Replace useMediaQuery with simple window width check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchAgentLeagueData().then(data => {
      setAgents(data.agents);
      setRecommendations(data.recommendations || []);
    });
  }, []);

  // Percy centerpiece logic: filter out Percy from agent display
  const percy = agents.find(a => a.id === 'percy-agent' || a.name === 'Percy');
  const otherAgents = agents.filter(a => a.id !== 'percy-agent' && a.name !== 'Percy');

  // Recommendation handoff logic
  function handleHandoff(agentId: string) {
    setSelectedAgent(agents.find(a => a.id === agentId) || null);
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-12">
      {/* Percy Centerpiece */}
      <div className="flex flex-col items-center mb-10">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-electric-blue via-fuchsia-500 to-teal-400 flex items-center justify-center text-4xl">
            🤖
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Percy's Agent League</h2>
          <p className="text-gray-300">Your cosmic concierge is ready to coordinate the perfect team</p>
        </div>
      </div>
      {/* Agent League Grid or Carousel */}
      {isMobile ? (
        <AgentCarousel
          agents={otherAgents}
          onLaunch={setSelectedAgent}
          selectedAgentId={selectedAgent?.id}
          showPremiumBadges={true}
          showDetailedCards={true}
        />
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
          initial="hidden"
          animate="visible"
        >
          {otherAgents.map((agent, index) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              index={index}
              onClick={() => setSelectedAgent(agent)}
              className="cursor-pointer"
            />
          ))}
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
      {/* Agent Backstory Modal */}
      <AnimatePresence>
        {selectedAgent && (
          <AgentBackstoryModal
            agent={selectedAgent}
            isOpen={!!selectedAgent}
            onClose={() => setSelectedAgent(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
