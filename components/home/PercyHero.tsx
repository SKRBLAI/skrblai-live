"use client";
import { motion, AnimatePresence } from "framer-motion";
import PercyAvatar from "./PercyAvatar";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { UniversalPromptBar, PercyTimeline, AgentStatsPanel } from "@/components/ui";
import { usePercyTimeline } from "@/components/hooks/usePercyTimeline";
import { agentDashboardList } from '@/lib/agents/agentRegistry';


export default function PercyHero() {
  const router = useRouter();
  const [showIntake, setShowIntake] = useState(false);
  const [showAgentsModal, setShowAgentsModal] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLSelectElement>(null);

  const handleExplore = () => {
    const el = document.getElementById("features");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/features");
    }
  };

  const [timeline, refreshTimeline] = usePercyTimeline();

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[80vh] py-8 px-4 z-10 bg-transparent">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 150, delay: 0.2 }}
        className="glass-card max-w-xl w-full mx-auto p-10 rounded-2xl shadow-2xl border border-teal-400/40 backdrop-blur-lg bg-white/10 flex flex-col items-center gap-6 relative z-10"
      >
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="text-4xl md:text-5xl font-extrabold text-center mb-2"
        >
          SKRBL AI: Unleash the Power of Automated Intelligence
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-lg md:text-xl text-gray-200 text-center mb-6"
        >
          Your next-gen platform for creative automation, smart business workflows, and effortless productivity—powered by AI, crafted for visionaries.
        </motion.p>
        <div className="flex flex-col md:flex-row gap-4 w-full justify-center mt-4">
          <motion.button
            whileHover={{ scale: 1.07, boxShadow: "0 0 24px 8px #2dd4bf" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowIntake(true)}
            className="px-8 py-3 rounded-lg bg-gradient-to-r from-teal-400 to-purple-500 text-white font-bold text-lg shadow-glow focus:outline-none focus:ring-4 focus:ring-teal-400/60"
            aria-label="Start onboarding with Percy"
          >
            <span className="inline-flex items-center gap-2">
              <PercyAvatar size="sm" animate /> Let's Get Started
            </span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExplore}
            className="px-8 py-3 rounded-lg bg-white/10 text-white font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-teal-400/60"
            aria-label="Explore Features"
          >
            Explore Features
          </motion.button>
        </div>
      </motion.div>
      {showIntake && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <div className="relative bg-white/20 backdrop-blur-lg rounded-2xl shadow-2xl p-8 max-w-lg w-full flex flex-col items-center gap-6 animate__animated animate__fadeInDown">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-teal-400 text-2xl focus:outline-none focus:ring-2 focus:ring-teal-400/40 rounded"
              onClick={() => setShowIntake(false)}
              aria-label="Close onboarding modal"
            >
              ×
            </button>
            <PercyAvatar size="lg" animate className="mx-auto mb-2 drop-shadow-glow" />
            <h2 className="text-2xl font-bold text-center text-white mb-2">Welcome! What do you want to accomplish today?</h2>
            <select
              ref={dropdownRef}
              className="w-full p-3 rounded-lg bg-gray-800/50 border border-teal-400 text-white mb-2 focus:outline-none focus:ring-2 focus:ring-teal-400/40 transition-all duration-150"
              aria-label="Quick actions"
              defaultValue=""
              onChange={e => {
                setSelectedAgentId(e.target.value);
                if (e.target.value) {
                  dropdownRef.current?.classList.add('ring-4', 'ring-electric-blue');
                  setTimeout(() => {
                    dropdownRef.current?.classList.remove('ring-4', 'ring-electric-blue');
                    setShowIntake(false);
                  }, 900);
                }
              }}
            >
              <option value="" disabled>Choose a quick action...</option>
              {agentDashboardList.filter(a => a.visible !== false).map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} — {agent.description}
                </option>
              ))}
            </select>
            {selectedAgentId && (
              <div className="w-full bg-teal-900/80 border border-teal-400 rounded-lg p-3 mb-2 animate-bounce-in text-white flex flex-col items-center" aria-live="polite">
                <span className="font-bold text-lg">
                  {agentDashboardList.find(a => a.id === selectedAgentId)?.name}
                </span>
                <span className="text-sm mb-2">
                  {agentDashboardList.find(a => a.id === selectedAgentId)?.description}
                </span>
                <button
                  className="mt-1 px-4 py-2 rounded bg-electric-blue text-white font-semibold shadow-glow hover:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/60"
                  onClick={() => window.open(`/services/${selectedAgentId}`, '_blank')}
                  tabIndex={0}
                  aria-label={`Launch ${agentDashboardList.find(a => a.id === selectedAgentId)?.name}`}
                >
                  Launch Agent
                </button>
              </div>
            )}
            <UniversalPromptBar
              title="Get Started with SKRBL AI"
              description="Tell us what you need or upload a file to get started."
              showPrompt={true}
              promptLabel="What would you like to accomplish?"
              placeholder="e.g., Create a content strategy, Generate social media posts..."
              theme="light"
              acceptedFileTypes=".pdf,.doc,.docx,.txt,.jpg,.png"
              onComplete={(data) => {
                console.log('Completed:', data);
                setTimeout(() => setShowIntake(false), 2000);
              }}
            />
            <button
              className="w-full mt-2 py-3 px-4 rounded-lg bg-gradient-to-r from-electric-blue to-teal-400 text-white font-bold shadow-glow hover:bg-teal-400/90 focus:outline-none focus:ring-4 focus:ring-electric-blue/40"
              onClick={() => setShowAgentsModal(true)}
              tabIndex={0}
              aria-label="Show all agent abilities"
            >
              Not sure? Show me what Percy can do
            </button>
          </div>
        </motion.div>
      )}
      {/* Agents Modal */}
      <AnimatePresence>
        {showAgentsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            aria-modal="true"
            role="dialog"
          >
            <div className="relative bg-white/20 backdrop-blur-lg rounded-2xl shadow-2xl p-8 max-w-2xl w-full animate__animated animate__fadeInDown">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-teal-400 text-2xl focus:outline-none focus:ring-2 focus:ring-teal-400/40 rounded"
                onClick={() => setShowAgentsModal(false)}
                aria-label="Close agent abilities modal"
              >
                ×
              </button>
              <h2 className="text-2xl font-bold text-center text-white mb-6">Percy Powers: All Available Agents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {agentDashboardList.filter(a => a.visible !== false).map(agent => (
                  <div key={agent.id} className="bg-gradient-to-br from-gray-900/80 to-teal-900/60 border border-teal-400 rounded-xl p-5 flex flex-col gap-2 shadow-xl">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-2xl" aria-hidden="true">{'emoji' in agent && typeof agent.emoji === 'string' ? agent.emoji : '🤖'}</span>
                      <span className="font-bold text-lg text-white">{agent.name}</span>
                    </div>
                    <span className="text-gray-200 text-sm mb-1">{agent.description}</span>
                    <span className="text-xs text-teal-300">{agent.performanceScore ? `Performance: ${agent.performanceScore}` : ''}</span>
                    <button
                      className="mt-2 px-4 py-2 rounded bg-electric-blue text-white font-semibold shadow-glow hover:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/60"
                      onClick={() => window.open(`/services/${agent.id}`, '_blank')}
                      tabIndex={0}
                      aria-label={`Launch ${agent.name}`}
                    >
                      Launch Agent
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
