'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { Agent } from '@/types/agent'; // Corrected import path for Agent type

interface AgentServiceClientProps {
  agent: Agent | undefined;
  params: { agent: string }; // Keep params if needed for fallback or other client logic
}

export default function AgentServiceClient({ agent, params }: AgentServiceClientProps) {
  if (!agent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0d1117]">
        <motion.div 
          initial={{ opacity: 0, y: 40 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }} 
          className="glass-card p-10 rounded-2xl text-center max-w-lg"
        >
          <h1 className="text-3xl font-bold mb-4 text-electric-blue">Percy can't find this agent!</h1>
          <p className="text-gray-300 mb-6">Looks like this agent (ID: {params.agent}) doesn't exist or isn't available right now.</p>
          <Link href="/services" className="text-teal-400 hover:underline">Back to Services</Link>
        </motion.div>
      </div>
    );
  }

  const emojiMap: { [key: string]: string } = {
    "Brand Development": "🎨",
    "Ebook Creation": "📚",
    "Paid Marketing": "💸",
    "Business Intelligence": "📊",
    "Strategy & Growth": "🚀",
    "Support Automation": "🤖",
    "Sales Enablement": "📈",
    "Short-Form Video": "🎬",
    "Copywriting": "✍️",
    "Automation": "⚡",
    "Social Media Automation": "📱",
    "Web Automation": "🌐",
    "Back Office": "💼",
    "Concierge": "🤖",
    "Orchestration": "🔗",
  };
  const emoji = emojiMap[agent.category] || "🤖";

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center py-16 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 40 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }} 
        className="glass-card max-w-2xl w-full p-10 rounded-2xl shadow-xl mb-10"
      >
        <div className="flex items-center gap-4 mb-6">
          <span className="text-5xl">{emoji}</span>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-electric-blue to-teal-400 bg-clip-text text-transparent mb-1">{agent.name}</h1>
            <div className="text-teal-300 font-semibold text-lg">{agent.category}</div>
          </div>
        </div>
        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.25, duration: 0.5 }} 
          className="text-gray-300 text-lg mb-6"
        >
          {agent.description}
        </motion.p>
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <button
            className="px-8 py-3 rounded-lg bg-gradient-to-r from-electric-blue to-teal-400 text-white font-semibold shadow-glow hover:scale-105 hover:shadow-xl transition-all duration-200"
            onClick={() => {
              // Client-side navigation logic
              localStorage.setItem('lastUsedAgent', agent.id);
              window.location.href = '/ask-percy?intent=' + encodeURIComponent(agent.intent || agent.id);
            }}
          >
            Try This Agent Now
          </button>
        </motion.div>
        {/* Optional: Demo preview (stub) */}
        <div className="mt-8 text-center text-gray-400 italic text-sm">Demo preview coming soon...</div>
      </motion.div>
    </div>
  );
}
