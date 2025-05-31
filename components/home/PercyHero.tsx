"use client";
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import AgentConstellation from "../agents/AgentConstellation";
import AgentCarousel from "../agents/AgentCarousel";
import type { Agent } from '@/types/agent';
import { useRouter } from "next/navigation";
import { usePercyTimeline } from "@/components/hooks/usePercyTimeline";
import { agentDashboardList } from '@/lib/agents/agentRegistry';
import { getBestAgents } from '@/utils/agentUtils';
import { saveToSupabase } from '@/utils/supabase';

// Only include agents that are not Percy for all agent grid/carousel logic
const visibleAgents = agentDashboardList.filter(
  a => a.visible !== false && a.id && a.name && a.id !== 'percy-agent'
);

export default function PercyHero() {
  const router = useRouter();
  const [showIntake, setShowIntake] = useState(false);
  const [showAgentsModal, setShowAgentsModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [suggestedAgents, setSuggestedAgents] = useState<Agent[]>([]);
  const [timeline] = usePercyTimeline();

  const handleExplore = () => {
    const el = document.getElementById("features");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/features");
    }
  };

  // Logging/analytics logic (unchanged)
  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('percy_session_id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).slice(2) + Date.now();
      sessionStorage.setItem('percy_session_id', sessionId);
    }
    return sessionId;
  };

  const logPercyEvent = async (type: string, value: any, meta: any = {}) => {
    // ... same as before
    const sessionId = getSessionId();
    const timestamp = new Date().toISOString();
    const log = {
      type,
      value,
      meta: { ...meta, sessionId },
      timestamp,
    };
    try {
      await saveToSupabase('percy_logs', log);
    } catch (err) {/* non-critical */}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (file) {
        const route = '/dashboard/publishing-agent';
        await logPercyEvent('file_upload', file.name, { fileType: file.type, fileSize: file.size });
        router.push(route);
        return;
      }
      if (inputValue.trim()) {
        await logPercyEvent('prompt', inputValue);
        const agents = getBestAgents(inputValue);
        setSuggestedAgents(agents);
        await logPercyEvent('agent_matches', agents.map(a => a.id), { agents });
      }
    } catch (err) {
      console.warn('PercyHero routing error:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // ----------- RENDER --------------
  return (
    <div id="percy-hero" className="relative flex flex-col items-center justify-center min-h-[80vh] py-8 px-4 z-10 bg-transparent">
      {/* Pronunciation badge or satisfaction badge */}
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

      {/* Cosmic Constellation + Percy Hero */}
      <div className="relative flex flex-col items-center w-full max-w-3xl mx-auto mb-6">
        <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none select-none">
          {/* Percy is NOT a selectable agent! */}
          <AgentConstellation
            selectedAgent={selectedAgent}
            setSelectedAgent={setSelectedAgent}
            agents={visibleAgents}
          />
        </div>

        {/* Single Percy Avatar */}
        <motion.div
          className="relative z-10 flex flex-col items-center justify-center w-full"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1, filter: "drop-shadow(0 0 60px #2dd4bf) drop-shadow(0 0 36px #38bdf8)" }}
          transition={{ type: "spring", stiffness: 120, delay: 0.2 }}
        >
          <div className="relative w-40 h-56 sm:w-56 sm:h-80 md:w-72 md:h-96 animate-float flex items-end justify-center mx-auto">
            <Image
              src="/images/agents-percy-fullbody-nobg-skrblai.png"
              alt="Percy full body"
              fill
              className="object-contain drop-shadow-[0_0_60px_#2dd4bf]"
              priority
              sizes="(max-width: 640px) 176px, (max-width: 1024px) 224px, 288px"
              draggable={false}
            />
          </div>
          <span className="block text-4xl md:text-5xl font-black text-white text-center drop-shadow-[0_0_24px_#2dd4bf] tracking-tight animate-pulse-subtle shadow-glow mt-4 mb-1">
            SKRBL AI
          </span>
          <h2 className="text-xl md:text-2xl font-semibold text-center text-teal-200 mt-2 mb-1 drop-shadow-[0_0_8px_#2dd4bf]">
            The Ultimate AI Platform for Content, Branding, and Automation
          </h2>
          <p className="text-base md:text-lg text-center text-white/80 mb-2 max-w-xl mx-auto">
            Unlock creative superpowers, automate your workflow, and grow your brand with the world's most advanced digital agents.
          </p>
        </motion.div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col md:flex-row gap-4 w-full justify-center mt-2">
        <motion.button
          whileHover={{ scale: 1.07, boxShadow: "0 0 24px 8px #2dd4bf" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowIntake(true)}
          className="px-8 py-3 rounded-lg bg-gradient-to-r from-teal-400 to-purple-500 text-white font-bold text-lg shadow-glow focus:outline-none focus:ring-4 focus:ring-teal-400/60"
          aria-label="Start onboarding with Percy"
        >
          <span className="inline-flex items-center gap-2">
            <span className="w-7 h-7 inline-flex items-center justify-center rounded-full bg-black/20">
              <Image
                src="/images/agents-percy-skrblai.png"
                alt="Percy mini logo"
                width={28}
                height={28}
                className="object-contain"
                draggable={false}
              />
            </span>
            Let's Get Started
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

      {/* See What SKRBL AI Can Do Demo CTA */}
      <div className="flex w-full justify-center mt-4 mb-2">
        <motion.button
          whileHover={{ scale: 1.06, boxShadow: "0 0 32px 8px #38bdf8" }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowAgentsModal(true)}
          className="px-8 py-3 rounded-lg bg-gradient-to-r from-electric-blue to-teal-400 text-white font-bold text-lg shadow-glow focus:outline-none focus:ring-4 focus:ring-electric-blue/60 animate-pulse-subtle"
          aria-label="See What SKRBL AI Can Do"
        >
          <span className="inline-flex items-center gap-2">
            <svg className="w-6 h-6 animate-spin-slow" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v4m0 8v4m8-8h-4m-8 0H4m15.07-7.07l-2.83 2.83M6.34 17.66l-2.83 2.83m0-16.97l2.83 2.83m10.6 10.6l2.83 2.83" /></svg>
            See What SKRBL AI Can Do
          </span>
        </motion.button>
      </div>

      {/* Agents Modal */}
      <AnimatePresence>
        {showAgentsModal && (
          <motion.div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAgentsModal(false)}
            aria-modal="true"
            role="dialog"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl max-w-2xl w-full relative"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-3 right-3 text-white text-2xl font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 rounded-full w-10 h-10 flex items-center justify-center bg-black/20"
                aria-label="Close demo modal"
                onClick={() => setShowAgentsModal(false)}
                tabIndex={0}
              >
                ×
              </button>
              <h3 className="text-2xl font-bold mb-4 text-center text-white">Top SKRBL AI Agents</h3>
              <AgentCarousel agents={visibleAgents.slice(0, 8)} onLaunch={setSelectedAgent} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              <h2 className="text-2xl font-bold text-center text-white mb-2">Welcome to SKRBL AI, What brings you to us today?</h2>
              <div className="w-full overflow-x-visible pb-2">
                {visibleAgents.length > 0 ? (
                  <AgentCarousel
                    agents={visibleAgents}
                    onLaunch={(agent) => {
                      setSelectedAgent(agent);
                      setTimeout(() => setShowIntake(false), 900);
                    }}
                    selectedAgentId={selectedAgent?.id}
                  />
                ) : (
                  <p className="text-center text-white/80 py-4">No starter agents available at the moment.</p>
                )}
              </div>
              {/* ...rest of intake form unchanged... */}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
