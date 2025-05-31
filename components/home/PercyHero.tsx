"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from 'next/image';
import AgentConstellation from "../agents/AgentConstellation";
import AgentCarousel from "../agents/AgentCarousel";
import type { Agent } from '@/types/agent';
import { useRouter } from "next/navigation";
import { usePercyTimeline } from "@/components/hooks/usePercyTimeline";
import { agentDashboardList } from '@/lib/agents/agentRegistry';
import { getBestAgents } from '@/utils/agentUtils';
import { saveToSupabase } from '@/utils/supabase';
import { trackPercyInteraction } from '@/lib/analytics/userJourney';
import { createClient } from '@supabase/supabase-js';

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
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const handleExploreFeatures = () => {
    handlePercyInteraction('button_click', { action: 'explore_features' });
    router.push("/features");
  };

  const handleSeeFeatures = () => {
    handlePercyInteraction('button_click', { action: 'see_features' });
    router.push("/features");
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

  const handlePercyInteraction = (interactionType: string, data: any) => {
    const userRole = localStorage.getItem('userRole') || 'client';
    trackPercyInteraction(interactionType, data, user?.id, userRole);
    
    // Existing interaction logic...
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (file) {
        handlePercyInteraction('file_upload', { fileName: file.name, fileType: file.type });
        const route = '/dashboard/publishing-agent';
        await logPercyEvent('file_upload', file.name, { fileType: file.type, fileSize: file.size });
        router.push(route);
        return;
      }
      if (inputValue.trim()) {
        handlePercyInteraction('prompt_submit', { prompt: inputValue });
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
    <div id="percy-hero" className="relative flex flex-col items-center justify-center min-h-[80vh] py-6 px-2 sm:px-4 md:py-10 z-10 bg-transparent">
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
      <div className="relative flex flex-col items-center w-full max-w-3xl mx-auto mb-4 sm:mb-6">
  {/* Percy Avatar, headline, and value prop */}
  <motion.div
    className="relative z-10 flex flex-col items-center justify-center w-full"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ type: "spring", stiffness: 120, delay: 0.2 }}
  >
    <div className="relative w-40 h-56 sm:w-56 sm:h-80 md:w-72 md:h-96 animate-float flex items-end justify-center mx-auto">
      <Image
        src="/images/agents-percy-fullbody-nobg-skrblai.png"
        alt="Percy, your AI Concierge"
        fill
        className="object-contain drop-shadow-[0_0_60px_#2dd4bf]"
        priority
        sizes="(max-width: 640px) 176px, (max-width: 1024px) 224px, 288px"
        draggable={false}
      />
    </div>
    <span className="block text-4xl md:text-5xl font-extrabold text-center tracking-tight animate-pulse-subtle shadow-glow mt-4 mb-1 bg-gradient-to-r from-[#1E90FF] via-[#30D5C8] to-[#1E90FF] bg-clip-text text-transparent drop-shadow-[0_0_32px_#30D5C8]">
      League of Digital Superheroes
    </span>
    <h2 className="text-xl md:text-2xl font-semibold text-center bg-gradient-to-r from-[#1E90FF] to-[#30D5C8] bg-clip-text text-transparent mt-2 mb-1 drop-shadow-[0_0_12px_#1E90FF]">
      Percy, Your Premium AI Concierge
    </h2>
    <p className="text-base md:text-lg text-center text-white/90 mb-2 max-w-xl mx-auto">
      Unlock creative superpowers, automate your workflow, and grow your brand with the world's most advanced digital agents.
    </p>
    <p className="text-sm text-center mb-2 max-w-lg mx-auto">
      <span className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-[#1E90FF]/70 to-[#30D5C8]/70 text-white font-bold shadow-[0_0_12px_#1E90FF] border border-[#30D5C8]/60 tracking-wide">AI Concierge</span>
      <span className="text-white/80"> &mdash; Personalized, always-on help for your business and creative goals.</span>
    </p>
  </motion.div>
  {/* Agent preview (3-4 cards, not constellation) */}
  <div className="w-full flex flex-row justify-center gap-3 sm:gap-4 mt-4 sm:mt-6 mb-2 flex-wrap">
    {visibleAgents.slice(0, 4).map((agent, idx) => (
      <div key={agent.id} className="min-w-[160px] sm:min-w-[200px] max-w-xs flex-1">
        <motion.div
          className={
            `bg-[#0B132B]/70 backdrop-blur-lg border border-[#30D5C8]/50 rounded-xl p-3 sm:p-4 shadow-[0_0_16px_#1E90FF40] transition-all duration-200 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#1E90FF]/60 hover:bg-[#1E90FF]/10 hover:agent-card-glow-blue ${agent.premium ? 'relative' : ''}`
          }
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push(agent.route || `/dashboard/${agent.id}`)}
        >
          {/* Premium badge for locked/premium agents */}
          {agent.premium && (
            <span className="absolute top-2 right-2 px-3 py-1 rounded-full bg-gradient-to-r from-[#1E90FF] to-[#30D5C8] text-white text-xs font-bold shadow-[0_0_10px_#1E90FF80] select-none z-10">
              Premium
            </span>
          )}
          <h3 className="text-white font-extrabold text-sm sm:text-base mb-1 tracking-tight bg-gradient-to-r from-[#1E90FF] to-[#30D5C8] bg-clip-text text-transparent drop-shadow-[0_0_8px_#1E90FF] group-hover:drop-shadow-[0_0_16px_#30D5C8]">
            {agent.name.replace('Agent', '')}
          </h3>
          <p className="text-gray-200 text-xs sm:text-sm font-medium group-hover:text-white transition-colors duration-150">
            {agent.description || agent.hoverSummary}
          </p>
        </motion.div>
      </div>
    ))}
  </div>
</div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full justify-center mt-2">
  <motion.button
    whileHover={{ scale: 1.09, boxShadow: '0 0 24px #1E90FF, 0 0 48px #30D5C8' }}
    whileTap={{ scale: 0.97 }}
    onClick={() => {
      handlePercyInteraction('modal_open', { modal: 'intake' });
      setShowIntake(true);
    }}
    className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gradient-to-r from-[#1E90FF] via-[#30D5C8] to-[#1E90FF] text-white font-extrabold text-base sm:text-lg shadow-[0_0_32px_#1E90FF] focus:outline-none focus:ring-4 focus:ring-[#30D5C8]/40 transition-all duration-200 hover:brightness-110 hover:shadow-xl border border-[#30D5C8]/60"
    aria-label="Start onboarding with Percy"
  >
    <span className="inline-flex items-center gap-2">
      <span className="w-7 h-7 inline-flex items-center justify-center rounded-full bg-[#0B132B]/80 border border-[#30D5C8]/60">
        <Image
          src="/images/agents-percy-skrblai.png"
          alt="Percy mini logo"
          width={28}
          height={28}
          className="object-contain"
          draggable={false}
        />
      </span>
      Join the League
    </span>
  </motion.button>
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={handleExploreFeatures}
    className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white/10 text-white font-semibold text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-[#30D5C8]/60 transition-all duration-200 hover:bg-white/20 hover:text-[#1E90FF]"
    aria-label="Explore Features"
  >
    Explore Features
  </motion.button>
</div>

      {/* See What SKRBL AI Can Do Demo CTA */}
<div className="flex w-full justify-center mt-3 sm:mt-4 mb-2">
  <motion.button
    whileHover={{ scale: 1.06 }}
    whileTap={{ scale: 0.97 }}
    onClick={() => {
      handlePercyInteraction('modal_open', { modal: 'agents_demo' });
      setShowAgentsModal(true);
    }}
    className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gradient-to-r from-[#1E90FF] via-[#30D5C8] to-[#1E90FF] text-white font-bold text-base sm:text-lg shadow-[0_0_24px_#1E90FF] focus:outline-none focus:ring-4 focus:ring-[#30D5C8]/40 animate-pulse-subtle transition-all duration-200 hover:brightness-110 hover:shadow-xl border border-[#30D5C8]/60"
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
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-2xl max-w-lg sm:max-w-2xl w-full relative"
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
              <AgentCarousel 
                agents={visibleAgents.slice(0, 8)} 
                onLaunch={(agent) => {
                  handlePercyInteraction('agent_select', { agentId: agent.id, agentName: agent.name, source: 'agents_modal' });
                  setSelectedAgent(agent);
                }} 
              />
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
      <div className="relative bg-white/20 backdrop-blur-lg rounded-2xl shadow-2xl p-4 sm:p-8 max-w-xs sm:max-w-lg w-full flex flex-col items-center gap-4 sm:gap-6 animate__animated animate__fadeInDown">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-teal-400 text-2xl focus:outline-none focus:ring-2 focus:ring-teal-400/40 rounded"
          onClick={() => setShowIntake(false)}
          aria-label="Close onboarding modal"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold text-center text-white mb-2">Welcome! What do you want to accomplish today?</h2>
        <div className="w-full overflow-x-visible pb-2">
          {visibleAgents.length > 0 ? (
            <AgentCarousel
              agents={visibleAgents}
              onLaunch={(agent) => {
                handlePercyInteraction('agent_select', { agentId: agent.id, agentName: agent.name, source: 'intake_modal' });
                setSelectedAgent(agent);
                setTimeout(() => setShowIntake(false), 900);
              }}
              selectedAgentId={selectedAgent?.id}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-10 cosmic-glass cosmic-gradient rounded-xl shadow-[0_0_24px_#30D5C880] border-2 border-teal-400/40 mx-auto max-w-xs animate-fade-in" role="status" aria-live="polite">
  <span className="text-4xl mb-3 animate-float">🪐</span>
  <p className="text-lg font-bold bg-gradient-to-r from-electric-blue via-teal-400 to-electric-blue bg-clip-text text-transparent drop-shadow mb-2">No starter agents available</p>
  <span className="text-teal-300 text-sm mb-4">Your cosmic journey awaits. Unlock premium agents to get started!</span>
  <a
    href="/pricing"
    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#1E90FF] to-[#30D5C8] text-white font-bold shadow-glow hover:from-[#30D5C8] hover:to-[#1E90FF] transition mb-2"
  >
    <span className="text-lg">🚀</span> Explore Premium Agents
  </a>
  <span className="px-3 py-1 rounded-full bg-teal-600/80 text-xs text-white shadow-glow select-none mt-2">Premium Journey</span>
</div>
          )}
        </div>
      </div>
    </motion.div>
  )}
</AnimatePresence>
    </div>
  );
}
