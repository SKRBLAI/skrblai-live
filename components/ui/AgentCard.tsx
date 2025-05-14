"use client";
import { Agent } from '@/types/agent';
import { motion } from 'framer-motion';

// Helper function to get emoji based on agent category
function getAgentEmoji(category: string): string {
  const categoryEmojis: Record<string, string> = {
    'content': '✍️',
    'branding': '🎨',
    'social': '📱',
    'analytics': '📊',
    'video': '🎥',
    'assistant': '🤖',
    'publishing': '📚',
    'business': '💼',
    'website': '🌐',
  };
  
  return categoryEmojis[category.toLowerCase()] || '🤖';
}

interface AgentCardProps {
  agent: Agent;
  onClick: () => void;
}

export default function AgentCard({ agent, onClick }: AgentCardProps) {
  // Determine theme from document root class (set by parent theme provider)
  const isDark = typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false;

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className={`
        relative overflow-hidden rounded-xl p-6 cursor-pointer
        ${isDark ? 'bg-gray-800/60 hover:bg-gray-800/80' : 'bg-white hover:bg-gray-50'}
        border border-teal-500/20 hover:border-teal-500/40
        transition-colors duration-200
      `}
      style={{
        boxShadow: isDark 
          ? '0 0 20px rgba(20, 255, 233, 0.1)' 
          : '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Animated border effect */}
      <div className="absolute inset-0 border-2 border-transparent hover:border-teal-500/20 rounded-xl transition-colors duration-300" />
      
      {/* Agent Avatar/Image */}
      <div className="relative w-16 h-16 mb-4">
        <div className={`
          w-full h-full rounded-full 
          ${isDark ? 'bg-teal-500/20' : 'bg-teal-500/10'}
          flex items-center justify-center text-2xl
        `}>
          {/* Use category-based emoji fallback */}
          {getAgentEmoji(agent.category)}
        </div>
      </div>

      {/* Category Tag */}
      <div className={`
        inline-block px-3 py-1 rounded-full text-sm font-medium mb-3
        ${isDark 
          ? 'bg-teal-500/20 text-teal-300' 
          : 'bg-teal-100 text-teal-800'
        }
      `}>
        {agent.category}
      </div>

      {/* Agent Name */}
      <h3 className={`
        text-xl font-bold mb-2
        ${isDark ? 'text-white' : 'text-gray-900'}
      `}>
        {agent.name}
      </h3>

      {/* Description */}
      <p className={`
        text-sm
        ${isDark ? 'text-gray-300' : 'text-gray-600'}
      `}>
        {agent.description}
      </p>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/5 to-purple-500/0 opacity-0 hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
}
