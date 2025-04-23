import React from 'react';
import Link from 'next/link';

type Agent = {
  id: string;
  name: string;
  category: string;
  description: string;
  route: string | null;
  intent: string | null;
  visible: boolean;
};

interface AgentModalProps {
  agent: Agent;
  onClose: () => void;
}

export default function AgentModal({ agent, onClose }: AgentModalProps) {
  if (!agent) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-lg text-white p-6 rounded-xl border border-white/20 w-full max-w-md shadow-xl">
        <h2 className="text-2xl font-bold mb-2">{agent.name}</h2>
        <p className="text-sm text-teal-300 mb-1">{agent.category}</p>
        <p className="text-sm text-gray-200 mb-4">{agent.description}</p>
        {/* Future: useCases, screenshots, links */}
        <div className="flex justify-end gap-2">
          {agent.route && agent.intent && (
            <Link
              href={agent.route}
              className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-md text-sm"
              onClick={() => localStorage.setItem('lastUsedAgent', agent.intent as string)}
            >
              Try Now
            </Link>
          )}
          <button
            onClick={onClose}
            className="border border-white text-white px-4 py-2 rounded-md hover:bg-white hover:text-black text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
