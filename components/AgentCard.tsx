import React from 'react';
import { useRouter } from 'next/navigation';
import type { Agent } from '@/types/agent';

export default function AgentCard({ agent }: { agent: Agent }) {
  const router = useRouter();

  const handleLearn = () => {
    router.push(`/agent-backstory/${agent.id}`);
  };

  const handleChat = () => {
    router.push(`/chat/${agent.id}`);
  };

  const handleLaunch = () => {
    const targetRoute = agent.route || `/services/${agent.id}`;
    router.push(targetRoute);
  };

  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow bg-slate-800/30 backdrop-blur-md">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-2xl">{agent.emoji || '🤖'}</div>
        <div className="min-w-0">
          <h3 className="font-semibold truncate text-white">{agent.name}</h3>
          <p className="text-xs text-gray-400 truncate">{agent.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={handleLearn}
          className="px-2 py-1 text-xs font-bold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-300"
        >
          LEARN
        </button>
        <button
          onClick={handleChat}
          className="px-2 py-1 text-xs font-bold rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-300"
        >
          CHAT
        </button>
        <button
          onClick={handleLaunch}
          className="px-2 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-300"
        >
          LAUNCH
        </button>
      </div>
    </div>
  );
} 