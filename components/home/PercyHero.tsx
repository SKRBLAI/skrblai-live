"use client";
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PercyAvatar from "./PercyAvatar";
import PercyFigure from "./PercyFigure";
import AgentConstellation from "../agents/AgentConstellation";
import { useRouter } from "next/navigation";
import { usePercyTimeline } from "@/components/hooks/usePercyTimeline";
import { agentDashboardList } from '@/lib/agents/agentRegistry';
import { getBestAgents } from '@/utils/agentUtils';
import { saveToSupabase } from '@/utils/supabase';

export default function PercyHero() {
  const router = useRouter();
  const [showIntake, setShowIntake] = useState(false);
  const [showAgentsModal, setShowAgentsModal] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLSelectElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [suggestedAgents, setSuggestedAgents] = useState<any[]>([]);

  const handleExplore = () => {
    const el = document.getElementById("features");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/features");
    }
  };

  const [timeline, refreshTimeline] = usePercyTimeline();

  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('percy_session_id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).slice(2) + Date.now();
      sessionStorage.setItem('percy_session_id', sessionId);
    }
    return sessionId;
  };

  const logPercyEvent = async (type: string, value: any, meta: any = {}) => {
    // Try to extract agentId, agentSlug, gender, route from meta or value
    let agentId = meta.agentId;
    let agentSlug = meta.agentSlug;
    let gender = meta.gender;
    let route = meta.route;
    let fallbackTriggered = meta.fallbackTriggered;
    if (typeof value === 'object' && value !== null) {
      agentId = agentId || value.id;
      agentSlug = agentSlug || value.imageSlug || value.slug;
      gender = gender || value.gender;
      route = route || value.route;
    }
    // If agentId is an array (agent_matches), use first
    if (Array.isArray(agentId)) agentId = agentId[0];
    // Validate required metadata
    const sessionId = getSessionId();
    const timestamp = new Date().toISOString();
    const missing = [];
    if (type !== 'prompt' && !agentId) missing.push('agentId');
    if (!route && type !== 'prompt') missing.push('route');
    if (!agentSlug && type !== 'prompt') missing.push('agentSlug');
    if (!gender && type !== 'prompt') missing.push('gender');
    if (!sessionId) missing.push('sessionId');
    if (missing.length > 0) {
      console.warn(`[PercyLog] Missing metadata for event '${type}':`, missing, { value, meta });
    }
    const log = {
      type,
      value,
      meta: {
        ...meta,
        agentId,
        agentSlug,
        gender,
        route,
        sessionId,
        fallbackTriggered,
      },
      timestamp,
    };
    try {
      await saveToSupabase('percy_logs', log);
    } catch (err) {
      // Fallback: store in sessionStorage and warn
      try {
        const logs = JSON.parse(sessionStorage.getItem('percy_logs') || '[]');
        logs.push(log);
        sessionStorage.setItem('percy_logs', JSON.stringify(logs));
      } catch (storageErr) {}
      console.warn('[Percy Memory] Failed to log to Supabase:', err, log);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (file) {
        const route = '/dashboard/publishing-agent';
        await logPercyEvent('file_upload', file.name, { fileType: file.type, fileSize: file.size });
        console.log("Routing to: ", route);
        router.push(route);
        return;
      }
      if (inputValue.trim()) {
        await logPercyEvent('prompt', inputValue);
        // Get best matching agents for the prompt
        const agents = getBestAgents(inputValue);
        setSuggestedAgents(agents);
        await logPercyEvent('agent_matches', agents.map(a => a.id), { agents });
        console.log('Suggested agents:', agents);
      }
    } catch (err) {
      console.warn('PercyHero routing error:', err);
      // Optionally show a toast or message here
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div id="percy-hero" className="relative flex flex-col items-center justify-center min-h-[80vh] py-8 px-4 z-10 bg-transparent">
      {/* Pronunciation badge next to logo (top-left, small, animated in) */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.7 }}
        className="absolute left-2 top-2 z-30"
      >
        <div className="scale-75 origin-left">
          {require('@/components/ui/SatisfactionBadge').default()}
        </div>
      </motion.div>

      {/* Cosmic Constellation + Percy Hero Integration */}
      <div className="relative flex flex-col items-center w-full max-w-3xl mx-auto mb-4">
        {/* Constellation behind Percy, visually centered - hidden on xs screens */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 w-full hidden sm:flex items-center justify-center pointer-events-none select-none">
          <AgentConstellation />
        </div>

        {/* Percy Avatar with cosmic glow and floating */}
        <motion.div
          className="relative z-10 flex flex-col items-center justify-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1, filter: "drop-shadow(0 0 60px #2dd4bf) drop-shadow(0 0 36px #38bdf8)" }}
          transition={{ type: "spring", stiffness: 120, delay: 0.2 }}
        >
          {/* Responsive PercyFigure size */}
          <div className="block sm:hidden"><PercyFigure size="md" animate showGlow /></div>
          <div className="hidden sm:block"><PercyFigure size="lg" animate showGlow /></div>
          <span className="block text-4xl md:text-5xl font-black text-white text-center drop-shadow-[0_0_24px_#2dd4bf] tracking-tight animate-pulse-subtle shadow-glow mt-4 mb-1">
            SKRBL AI
          </span>
          <span className="block text-lg sm:text-xl md:text-2xl font-light text-center text-gradient-blue mb-1">
            Meet Our League of Digital Superheroes
          </span>
        </motion.div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col md:flex-row gap-4 w-full justify-center mt-2">
        <motion.button
          whileHover={{ scale: 1.07, boxShadow: "0 0 24px 8px #2dd4bf" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            const el = document.getElementById('percy-hero');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            setShowIntake(true);
          }}
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

      {/* Intake Modal */}
      <AnimatePresence>
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
                    className="mt-1 px-4 py-2 rounded bg-electric-blue text-white font-semibold shadow-glow hover:bg-teal-400 hover:shadow-[0_0_12px_rgba(0,255,255,0.6)] hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400/60"
                    onClick={() => window.open(`/services/${selectedAgentId}`, '_blank')}
                    tabIndex={0}
                    aria-label={`Launch ${agentDashboardList.find(a => a.id === selectedAgentId)?.name}`}
                  >
                    Launch Agent
                  </button>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <label htmlFor="percy-prompt" className="sr-only">Ask Percy anything</label>
                <input
                  id="percy-prompt"
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask Percy anything..."
                  aria-label="Ask Percy anything"
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-electric-blue focus:border-transparent"
                />
                <label htmlFor="file-upload" className="sr-only">Upload a file</label>
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt"
                  aria-label="Upload a file"
                  className="w-full mt-2 p-3 rounded-lg border border-gray-300"
                />
                <button
                  type="submit"
                  className="w-full mt-2 py-3 px-4 rounded-lg bg-gradient-to-r from-electric-blue to-teal-400 text-white font-bold shadow-glow hover:bg-teal-400/90 focus:outline-none focus:ring-4 focus:ring-electric-blue/40"
                >
                  Submit
                </button>
              </form>
              
              {suggestedAgents.length > 0 && (
                <div className="w-full mt-4">
                  <h3 className="text-white font-semibold mb-2">Recommended Agents:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {suggestedAgents.map(agent => (
                      <div key={agent.id} className="bg-gradient-to-br from-gray-900/80 to-teal-900/60 border border-teal-400 rounded-xl p-4 flex justify-between items-center">
                        <div>
                          <span className="text-white font-bold">{agent.name}</span>
                          {agent.description && <p className="text-gray-200 text-sm">{agent.description}</p>}
                        </div>
                        <button
                          onClick={async () => {
                            await logPercyEvent('agent_selected', agent.id, { agent });
                            const agentRoute = (agent as any).route || `/dashboard/${agent.id}`;
                            router.push(agentRoute);
                          }}
                          className="px-3 py-1 bg-electric-blue text-white font-semibold rounded shadow-glow hover:bg-teal-400 hover:shadow-[0_0_12px_rgba(0,255,255,0.6)] hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400/40"
                          aria-label={`Launch ${agent.name}`}
                        >
                          Launch
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
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
      </AnimatePresence>

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
                      className="mt-2 px-4 py-2 rounded bg-electric-blue text-white font-semibold shadow-glow hover:bg-teal-400 hover:shadow-[0_0_12px_rgba(0,255,255,0.6)] hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400/60"
                      onClick={async () => {
                        await logPercyEvent('agent_selected', agent.id, { agent });
                        // Type assertion to handle missing route property
                        const agentRoute = (agent as any).route || `/dashboard/${agent.id}`;
                        router.push(agentRoute);
                      }}
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
    </div>
  );
}
