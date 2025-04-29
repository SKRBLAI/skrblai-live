'use client';
import React from "react";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import agentRegistry from "@/lib/agents/agentRegistry";
const AgentModal = dynamic(() => import("@/components/agents/AgentModal"), { ssr: false });
import Link from "next/link";
import { useRouter } from "next/navigation";
import { checkUserRole } from "@/lib/auth/checkUserRole";
import FloatingParticles from "@/components/ui/FloatingParticles";

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

// Define AgentSuggestion interface for type safety
interface AgentSuggestion {
  id: string;
  name: string;
  intent: string;
}

// Type guard for premium property
function isPremiumAgent(agent: any): agent is { premium: boolean } {
  return typeof agent === 'object' && agent !== null && 'premium' in agent && typeof agent.premium === 'boolean';
}

export default function ServicesPage() {
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("Recommended");
  const [suggested, setSuggested] = useState<AgentSuggestion[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAgent, setModalAgent] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'free' | 'premium'>('free');
  const router = useRouter();

  useEffect(() => {
    // Example: Fetch last used or onboarding goal from localStorage
    const lastUsed = localStorage.getItem("lastUsedAgent");
    const onboardingGoal = localStorage.getItem("userGoal");
    let rec: AgentSuggestion[] = [];
    if (lastUsed) {
      const agent = agentRegistry.find(a => a.id === lastUsed || a.intent === lastUsed);
      if (agent && agent.id && agent.name && agent.intent) {
        rec.push({ id: agent.id, name: agent.name, intent: agent.intent });
      }
    }
    if (onboardingGoal) {
      const match = agentRegistry.find(a => a.category?.toLowerCase().includes(onboardingGoal.toLowerCase()));
      if (match && match.id && match.name && match.intent && !rec.find(r => r.id === match.id)) {
        rec.push({ id: match.id, name: match.name, intent: match.intent });
      }
    }
    setSuggested(rec);
    // Check user role
    checkUserRole().then(setUserRole);
  }, []);

  let filteredAgents = agentRegistry.filter(a => a.visible && (filter === "All" || a.category === filter));
  // Sort logic
  if (sort === "Most Popular") {
    filteredAgents = [...filteredAgents].sort((a, b) => {
      const aCount = typeof (a as any).usageCount === 'number' ? (a as any).usageCount : 0;
      const bCount = typeof (b as any).usageCount === 'number' ? (b as any).usageCount : 0;
      return bCount - aCount;
    });
  } else if (sort === "Newest") {
    filteredAgents = [...filteredAgents].sort((a, b) => {
      const aCreated = typeof (a as any).createdAt === 'number' ? (a as any).createdAt : 0;
      const bCreated = typeof (b as any).createdAt === 'number' ? (b as any).createdAt : 0;
      return bCreated - aCreated;
    });
  } // else Recommended = registry order

  return (
    <div className="min-h-screen bg-[#0d1117] py-16 px-2 sm:px-4 relative">
      {/* FloatingParticles background */}
      <div className="absolute inset-0 -z-10 pointer-events-none opacity-60">
        <FloatingParticles />
      </div>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-10 bg-gradient-to-r from-electric-blue to-teal-400 bg-clip-text text-transparent drop-shadow-glow">
          Agent Marketplace
        </h1>
        {/* Percy smart recommendations - inline, mobile friendly */}
        {suggested.length > 0 && (
          <motion.div
            className="flex flex-wrap justify-center gap-2 mb-6"
            initial="hidden"
            animate="visible"
          >
            {suggested.map((agent, idx) => (
              <motion.button
                key={agent.id}
                className="px-4 py-1 rounded-full bg-white/10 backdrop-blur-md border border-teal-400 text-teal-200 font-semibold text-sm shadow-glow hover:shadow-glow hover:border-electric-blue focus:outline-none transition-all glass-card"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.12, duration: 0.5, type: 'spring' }}
                whileHover={{ scale: 1.08, boxShadow: '0 0 16px #14ffe9, 0 0 8px #a259ff', borderColor: '#14ffe9' }}
                whileTap={{ scale: 0.97 }}
                style={{ minWidth: 120 }}
                onClick={() => router.push(`/ask-percy?intent=${agent.intent}`)}
              >
                <span className="hidden sm:inline">Percy recommends:</span> {agent.name}
              </motion.button>
            ))}
          </motion.div>
        )}
        {/* Filter + Sort - mobile responsive */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 items-center">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-lg font-medium border transition-all duration-200 text-sm sm:text-base
                  ${filter === cat ? "border-teal-500 text-teal-300 bg-white/10 shadow-glow" : "border-white/10 text-gray-300 hover:text-teal-400 hover:border-teal-400"}
                `}
              >
                {cat}
              </button>
            ))}
          </div>
          {/* Accessible label for sort dropdown */}
          <label htmlFor="sort-agents" className="sr-only">Sort agents</label>
          <select
            id="sort-agents"
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="ml-0 sm:ml-4 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white font-medium focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm sm:text-base"
          >
            <option>Recommended</option>
            <option>Most Popular</option>
            <option>Newest</option>
          </select>
        </div>
        {/* Agent grid - responsive */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {filteredAgents.map((agent, idx) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.06, boxShadow: "0 0 32px 4px #14ffe9" }}
              transition={{ duration: 0.4, delay: idx * 0.07 }}
              viewport={{ once: true }}
              className={`glass-card border-glass border-2 p-6 sm:p-7 rounded-2xl shadow-xl transition-transform duration-300 relative group hover:shadow-glow flex flex-col`}
            >
              {/* Premium badge if agent.premium */}
              {isPremiumAgent(agent) && agent.premium && (
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
              <div className="text-xs text-teal-200 mb-1">{agent.category}</div>
              <p className="text-gray-300 mb-6 min-h-[48px]">{agent.description}</p>
              <motion.button
                whileHover={{ scale: 1.12, y: -2, boxShadow: "0 0 24px #ffd700, 0 0 8px #14ffe9" }}
                whileTap={{ scale: 0.97 }}
                className={`inline-block mt-auto px-5 py-2 rounded-lg font-semibold shadow-glow hover:scale-105 hover:shadow-xl transition-all duration-200 text-base sm:text-lg ${('premium' in agent && agent.premium && userRole === 'free') ? 'bg-gradient-to-r from-yellow-400 to-pink-400 text-white' : 'bg-gradient-to-r from-electric-blue to-teal-400 text-white'}`}
                onClick={() => {
                  if ('premium' in agent && agent.premium && userRole === 'free') {
                    setModalAgent(agent.id);
                    setModalOpen(true);
                  } else {
                    router.push(`/ask-percy?intent=${agent.intent}`);
                  }
                }}
              >
                {('premium' in agent && agent.premium && userRole === 'free') ? (
                  <span className="flex items-center gap-2"><span role="img" aria-label="Lock">🔒</span> Try Demo</span>
                ) : 'Try Demo'}
              </motion.button>
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
