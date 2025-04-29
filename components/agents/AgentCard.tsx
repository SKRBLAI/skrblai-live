import React from 'react';
import { motion } from 'framer-motion';

export interface Agent {
  id: string;
  name: string;
  category: string;
  description: string;
  route: string;
  intent: string;
  visible: boolean;
  premium?: boolean;
  icon?: React.ReactNode;
}

interface AgentCardProps {
  agent: Agent;
  onClick: (agent: Agent) => void;
  isPremiumLocked?: boolean;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, onClick, isPremiumLocked }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group cursor-pointer rounded-2xl glass-card p-5 flex flex-col items-center shadow-lg hover:shadow-xl transition border border-white/10 relative overflow-hidden"
      onClick={() => onClick(agent)}
      tabIndex={0}
      aria-label={`View details for ${agent.name}`}
    >
      <div className="w-16 h-16 mb-3 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-700 to-purple-700 text-white text-3xl shadow-lg">
        {agent.icon ? agent.icon : agent.name.charAt(0)}
      </div>
      <h2 className="text-lg font-semibold text-white mb-1 text-center">{agent.name}</h2>
      <p className="text-sm text-slate-300 text-center mb-2 line-clamp-2">{agent.description}</p>
      {agent.premium && isPremiumLocked && (
        <span className="absolute top-2 right-2 bg-gradient-to-br from-yellow-400 to-yellow-600 text-xs px-2 py-1 rounded-full text-white font-bold flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 17l-5 3 1.9-5.6L4 10.5l5.7-.5L12 5l2.3 5 5.7.5-4.9 3.9L17 20z" /></svg>
          Premium
        </span>
      )}
      <div className="absolute inset-0 pointer-events-none group-hover:bg-white/10 transition-all duration-300 rounded-2xl" />
    </motion.div>
  );
};

export default AgentCard;
