import { useState } from 'react';
import agentRegistry from '@/lib/agents/agentRegistry';
import PageLayout from '@/components/layout/PageLayout';
import Link from 'next/link';
import AgentModal from '@/components/percy/AgentModal';

const categories = ['All', 'Branding', 'Content', 'Automation', 'Support', 'Strategy', 'Marketing'];

export default function AgentDirectory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  type Agent = {
    id: string;
    name: string;
    category: string;
    description: string;
    route: string | null;
    intent: string | null;
    visible: boolean;
  };
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const visibleAgents = agentRegistry.filter(agent => agent.visible);

  const filteredAgents = visibleAgents.filter(agent => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      activeCategory === 'All' || agent.category.toLowerCase() === activeCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <PageLayout title="Meet Your AI Agents">
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-white text-center mb-6">SKRBL AI Agents</h1>

        {/* 🔍 Search Input */}
        <input
          type="text"
          placeholder="Search agents..."
          className="w-full max-w-md mx-auto block mb-6 p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

        {/* 🧩 Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm border ${
                activeCategory === category
                  ? 'bg-teal-500 text-white border-teal-500'
                  : 'text-gray-300 border-white/20 hover:bg-white/10'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* 🧠 Filtered Agent Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {filteredAgents.map(agent => (
            <div
              key={agent.id}
              className="bg-white/10 backdrop-blur border border-white/20 p-6 rounded-2xl shadow-xl hover:bg-white/20 transition"
            >
              <h2 className="text-xl font-bold text-white">{agent.name}</h2>
              <p className="text-sm text-teal-300 mb-2">{agent.category}</p>
              <p className="text-sm text-gray-300 mb-4">{agent.description}</p>
              <div className="flex gap-2">
                {agent.route && agent.intent && (
                  <Link
                    href={agent.route}
                    className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 text-sm"
                    onClick={() => localStorage.setItem('lastUsedAgent', agent.intent as string)}
                  >
                    Try Now
                  </Link>
                )}
                <button
                  onClick={() => setSelectedAgent(agent.route && agent.intent ? agent : null)}
                  className="border border-white text-white px-4 py-2 rounded-md text-sm hover:bg-white hover:text-black"
                  disabled={!agent.route || !agent.intent}
                >
                  Learn More
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* Modal Render */}
        {selectedAgent && <AgentModal agent={selectedAgent} onClose={() => setSelectedAgent(null)} />}

      </section>
    </PageLayout>
  );
}
