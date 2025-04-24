import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import agentRegistry from "@/lib/agents/agentRegistry";
const AgentModal = dynamic(() => import("@/components/agents/AgentModal"), { ssr: false });
import Link from "next/link";

// Emoji map for quick visual categories (fallbacks)
const categoryIcons: Record<string, string> = {
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
};

const categories = [
  "All",
  ...Array.from(new Set(agentRegistry.filter(a => a.visible).map(a => a.category)))
];

export default function ServicesPage() {
  const [filter, setFilter] = useState("All");
  const [suggested, setSuggested] = useState<string[]>([]); // Agent IDs
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAgent, setModalAgent] = useState<string | null>(null);

  // TODO: Pull Percy memory/onboarding from Firestore/localStorage for personalization
  useEffect(() => {
    // Example: Fetch last used or onboarding goal from localStorage
    const lastUsed = localStorage.getItem("lastUsedAgent");
    const onboardingGoal = localStorage.getItem("userGoal");
    let rec: string[] = [];
    if (lastUsed) rec.push(lastUsed);
    if (onboardingGoal) {
      const match = agentRegistry.find(a => a.category?.toLowerCase().includes(onboardingGoal.toLowerCase()));
      if (match) rec.push(match.id);
    }
    setSuggested(rec);
  }, []);

  const filteredAgents = agentRegistry.filter(a => a.visible && (filter === "All" || a.category === filter));

  return (
    <div className="min-h-screen bg-[#0d1117] py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-10 bg-gradient-to-r from-electric-blue to-teal-400 bg-clip-text text-transparent">Our AI Services</h1>
        {/* Percy suggestion chips */}
        {suggested.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {suggested.map(id => {
              const agent = agentRegistry.find(a => a.id === id);
              return agent ? (
                <span key={id} className="px-4 py-1 rounded-full bg-teal-600/20 border border-teal-400 text-teal-200 font-semibold text-sm shadow-glow animate-pulse">
                  Recommended: {agent.name}
                </span>
              ) : null;
            })}
          </div>
        )}
        {/* Filter buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2 rounded-lg font-medium border transition-all duration-200
                ${filter === cat ? "border-teal-500 text-teal-300 bg-white/10 shadow-glow" : "border-white/10 text-gray-300 hover:text-teal-400 hover:border-teal-400"}
              `}
            >
              {cat}
            </button>
          ))}
        </div>
        {/* Agent grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {filteredAgents.map((agent, idx) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.04, boxShadow: "0 0 24px 4px #14ffe9" }}
              transition={{ duration: 0.4, delay: idx * 0.07 }}
              viewport={{ once: true }}
              className={`glass-card border-glass border-2 p-7 rounded-2xl shadow-xl transition-transform duration-300 relative group hover:shadow-glow`}
            >
              {/* Premium badge if agent.premium */}
              {('premium' in agent && agent.premium) && (
                <span className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-pink-400 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                  <span role="img" aria-label="Premium">🔒</span> Premium
                </span>
              )}
              {/* Emoji/Icon */}
              <div className="text-4xl mb-3">
                {categoryIcons[agent.category] || "🤖"}
              </div>
              <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-electric-blue to-teal-400 bg-clip-text text-transparent">
                {agent.name}
              </h2>
              <p className="text-gray-300 mb-6 min-h-[48px]">{agent.description}</p>
              <button
                className="inline-block mt-auto px-5 py-2 rounded-lg bg-gradient-to-r from-electric-blue to-teal-400 text-white font-semibold shadow-glow hover:scale-105 hover:shadow-xl transition-all duration-200"
                onClick={() => {
                  setModalAgent(agent.id);
                  setModalOpen(true);
                }}
              >
                Learn More
              </button>
            </motion.div>
          ))}
        </div>
      </div>
      <AgentModal
        agentId={modalAgent}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onTry={(intent: string) => {
          if (typeof window !== 'undefined') {
            localStorage.setItem('lastUsedAgent', modalAgent || '');
            window.location.href = '/ask-percy?intent=' + encodeURIComponent(intent);
          }
        }}
      />
    </div>
  );
}
