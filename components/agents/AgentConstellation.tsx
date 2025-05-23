"use client";
import React, { useState, useEffect } from "react";
import type { Agent } from '@/types/agent';
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getAgentImagePath } from '@/utils/agentUtils';
import FocusTrap from 'focus-trap-react';

// Adjusted radii so agents fit fully inside rings (agent size/2 + margin < radius)
const TIER_RADII = {
  inner: 90,  // for 64px agent size, 90px keeps it inside
  mid: 165,  // for 80px agent size, 165px keeps it inside
  outer: 240 // for 96px agent size, 240px keeps it inside
} as const;

type OrbitTier = keyof typeof TIER_RADII;

type OrbitAgent = Agent & { tier: OrbitTier; role: string };

interface AgentConstellationProps {
  selectedAgent: Agent | null;
  setSelectedAgent: (agent: Agent | null) => void;
}

const AGENTS_PER_GROUP = 3;

const AgentConstellation: React.FC<AgentConstellationProps> = ({ selectedAgent, setSelectedAgent }) => {
  const [orbitingAgents, setOrbitingAgents] = useState<OrbitAgent[]>([]);
  const [currentGroup, setCurrentGroup] = useState(0);
  const groupCount = Math.ceil(orbitingAgents.length / AGENTS_PER_GROUP);

  // Calculate agents to display in current group
  const startIdx = currentGroup * AGENTS_PER_GROUP;
  const endIdx = startIdx + AGENTS_PER_GROUP;
  const visibleAgents = orbitingAgents.slice(startIdx, endIdx);
  const [isMobile, setIsMobile] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const router = useRouter();

  // Fetch agents from API, patching tier and role if needed
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch("/api/agents?grouped=1");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        // Defensive: data may be grouped or flat, so flatten if needed
        let agents: Agent[] = [];
        if (Array.isArray(data.agents)) {
          agents = data.agents;
        } else if (data.groups) {
          agents = Object.values(data.groups).flat();
        }
        const orbitAgents: OrbitAgent[] = (agents as Agent[]).map((agent) => {
          let tier: OrbitTier = ['inner', 'mid', 'outer'].includes((agent as any).tier as string)
            ? (agent as any).tier as OrbitTier
            : 'outer';
          if ((agent as any).tier !== tier && process.env.NODE_ENV === "development") {
            console.warn(`[AgentConstellation] Agent missing/invalid tier, defaulting to 'outer':`, agent);
          }
          return {
            ...agent,
            tier,
            role: (agent as any).role ?? '',
            category: agent.category ?? 'assistant',
            capabilities: agent.capabilities ?? [],
            visible: typeof agent.visible === "boolean" ? agent.visible : true,
            locked: typeof agent.locked === "boolean" ? agent.locked : false,
          };
        });
        const agentsToDisplay = orbitAgents.filter(agent => agent.visible !== false);
        setOrbitingAgents(agentsToDisplay);
      } catch (error) {
        console.error("Failed to fetch agents:", error);
        setOrbitingAgents([]);
      }
    };
    fetchAgents();
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedAgent) setSelectedAgent(null);
    };
    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, [selectedAgent, setSelectedAgent]);

  // Map agent name to route
  const getAgentRoute = (agentName: string) => {
    const routeMap: Record<string, string> = {
      BrandingAgent: "/dashboard/branding",
      ContentCreatorAgent: "/dashboard/content",
      AnalyticsAgent: "/dashboard/analytics",
      PublishingAgent: "/dashboard/publishing",
      SocialBotAgent: "/dashboard/social",
      AdCreativeAgent: "/dashboard/ads",
      ProposalGeneratorAgent: "/dashboard/proposals",
      PaymentManagerAgent: "/dashboard/payments",
      ClientSuccessAgent: "/dashboard/clients",
      SiteGenAgent: "/dashboard/sites",
      BizAgent: "/dashboard/business",
      VideoContentAgent: "/dashboard/video",
      PercyAgent: "/dashboard/percy",
      PercySyncAgent: "/dashboard/sync",
    };
    return routeMap[agentName] || "/dashboard";
  };

  return (
    <div className="relative mx-auto w-[430px] h-[430px] max-w-[90vw] max-h-[90vw] md:w-[600px] md:h-[600px]">
      {/* Percy in the center */}
      <motion.div
        className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, filter: "drop-shadow(0 0 32px #2dd4bf)" }}
        transition={{ type: "spring", stiffness: 120, delay: 0.2 }}
      >
        <div className="relative w-36 h-52 md:w-48 md:h-64 flex items-end justify-center animate-float">
          <Image
            src="/images/agents-percy-fullbody-nobg-skrblai.png"
            alt="Percy full body"
            fill
            className="object-contain drop-shadow-[0_0_40px_#2dd4bf]"
            priority
            sizes="(max-width: 768px) 144px, 192px"
          />
        </div>
        <motion.div
          className="text-center mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span className="block text-2xl font-bold text-gradient-blue">Percy</span>
          <span className="block text-teal-300 text-xs">The Concierge</span>
        </motion.div>
      </motion.div>

      {/* Orbiting Agents - Show only 3 at a time in a circle around Percy */}
      <div className="hidden md:block">
        <AnimatePresence mode="wait">
          {visibleAgents.map((agent, i) => {
            // Arrange 3 agents evenly in a circle
            const angle = (360 / AGENTS_PER_GROUP) * i - 90; // -90 to start at top
            const radius = TIER_RADII[agent.tier || 'outer'];
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;
            const size = agent.tier === 'inner' ? 64 : agent.tier === 'mid' ? 80 : 96;
            const isLocked = !!(agent.locked || agent.unlocked === false);
            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ delay: i * 0.08, type: shouldReduceMotion ? 'tween' : 'spring' }}
                style={{
                  position: 'absolute',
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  width: size,
                  height: size,
                  zIndex: isLocked ? 10 : 20,
                  filter: isLocked ? 'grayscale(1) brightness(0.7)' : '',
                  pointerEvents: isLocked ? 'none' : 'auto',
                }}
                className={`group cursor-pointer ${isLocked ? 'opacity-50' : ''}`}
                tabIndex={isLocked ? -1 : 0}
                aria-disabled={isLocked ? 'true' : 'false'}
                onClick={() => !isLocked && setSelectedAgent(agent)}
                onKeyDown={(e) => {
                  if (!isLocked && (e.key === 'Enter' || e.key === ' ')) setSelectedAgent(agent);
                }}
                whileHover={!isLocked ? { scale: 1.1 } : undefined}
                whileTap={!isLocked ? { scale: 0.97 } : undefined}
              >
                <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-teal-400 shadow-glow bg-deep-navy">
                  <Image
                    src={agent.imageSlug ? `/images/agents-${agent.imageSlug}-skrblai.png` : getAgentImagePath(agent)}
                    alt={agent.role || agent.name}
                    fill
                    className="object-cover rounded-full"
                    sizes={`${size}px`}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = `/images/${agent.gender === 'neutral' ? 'male' : agent.gender}-silhouette.png`;
                    }}
                  />
                  {agent.locked && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full">
                      <span className="text-white text-2xl" title="Locked agent">🔒</span>
                    </div>
                  )}
                </div>
                <div className="text-center text-xs text-white opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200">
                  {agent.name.replace('Agent', '')}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {orbitingAgents.length === 0 && (
          <div className="w-full text-center text-gray-400 py-12 text-lg font-semibold">No agents available at this time.</div>
        )}
      </div>

      {/* Mobile: Only show 3 agents in current group */}
      <div className="md:hidden flex flex-wrap justify-center items-center gap-3 p-4">
        {visibleAgents.map((agent) => {
          const size = agent.tier === 'inner' ? 56 : agent.tier === 'mid' ? 68 : 80;
          return (
            <motion.div
              key={`mobile-${agent.id}`}
              className="relative group cursor-pointer flex flex-col items-center"
              tabIndex={0}
              aria-label={`Activate ${agent.name}`}
              whileHover={{ scale: 1.1, filter: "drop-shadow(0 0 12px rgba(0,255,255,0.6))" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedAgent(agent)}
              style={{ width: size + 12 }}
            >
              <div className="relative rounded-full border-2 border-fuchsia-400 group-hover:border-teal-300 transition-all duration-200 shadow-glow group-hover:shadow-[0_0_16px_#38bdf8] bg-gradient-to-br from-electric-blue/70 via-fuchsia-500/40 to-teal-400/70 overflow-visible mb-1"
                style={{ width: size, height: size }}
              >
                <Image
                  src={agent.imageSlug ? `/images/agents-${agent.imageSlug}-skrblai.png` : getAgentImagePath(agent)}
                  alt={agent.role || agent.name}
                  fill
                  className="object-cover rounded-full"
                  sizes={`${size}px`}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = `/images/${agent.gender === 'neutral' ? 'male' : agent.gender}-silhouette.png`;
                  }}
                />
              </div>
              <div className="text-center text-xs text-white opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200">
                {agent.name.replace('Agent', '')}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Hero-select floating avatar animation when agent is selected */}
      <AnimatePresence>
        {selectedAgent && (
          <>
            {/* Animated avatar centered above Percy with scale/halo effect */}
            <motion.div
              className="fixed left-1/2 top-1/2 z-[60] flex flex-col items-center justify-center pointer-events-none"
              initial={{ opacity: 0, scale: 0.7, zIndex: 60 }}
              animate={{ opacity: 1, scale: 1.22, filter: 'drop-shadow(0 0 32px #38bdf8) drop-shadow(0 0 64px #f472b6)' }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ type: 'spring', stiffness: 120, damping: 16 }}
              style={{ transform: 'translate(-50%, -50%)' }}
            >
              <div className="relative w-40 h-40 md:w-52 md:h-52">
                <Image
                  src={selectedAgent.imageSlug ? `/images/agents-${selectedAgent.imageSlug}-skrblai.png` : getAgentImagePath(selectedAgent)}
                  alt={selectedAgent.name}
                  fill
                  className="object-cover rounded-full border-4 border-teal-400 shadow-glow"
                  sizes="208px"
                  style={{ zIndex: 61 }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = `/images/${selectedAgent.gender === 'neutral' ? 'male' : selectedAgent.gender}-silhouette.png`;
                  }}
                />
                <motion.div className="absolute inset-0 rounded-full bg-teal-400/10 animate-pulse-slow" />
              </div>
            </motion.div>

            {/* Floating Agent Details Modal */}
            <motion.div
              className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ pointerEvents: 'auto' }}
              onClick={() => setSelectedAgent(null)}
              aria-label="Agent Details Modal"
            >
              {/* Focus trap for accessibility */}
              <FocusTrap active={!!selectedAgent}>
                <motion.div
                  className="relative bg-gradient-to-br from-electric-blue/70 via-fuchsia-500/40 to-teal-400/70 backdrop-blur-xl rounded-2xl shadow-2xl p-6 max-w-md w-full flex flex-col items-center gap-4 animate__animated animate__fadeInDown border-2 border-fuchsia-400"
                  onClick={(e) => e.stopPropagation()}
                  tabIndex={-1}
                  role="dialog"
                  aria-modal="true"
                >
                  <button
                    className="absolute top-2 right-2 text-gray-200 hover:text-teal-400 text-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-fuchsia-400 rounded-full bg-black/10 px-2 py-1"
                    onClick={() => setSelectedAgent(null)}
                    aria-label="Close agent details"
                  >
                    ×
                  </button>
                  <div className="relative w-24 h-24 mx-auto -mt-12 mb-2">
                    <Image
                      src={selectedAgent.imageSlug ? `/images/agents-${selectedAgent.imageSlug}-skrblai.png` : getAgentImagePath(selectedAgent)}
                      alt={selectedAgent.name}
                      fill
                      className="object-cover rounded-full shadow-glow border-2 border-teal-400"
                      sizes="96px"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = `/images/${selectedAgent.gender === 'neutral' ? 'male' : selectedAgent.gender}-silhouette.png`;
                      }}
                    />
                    <motion.div className="absolute inset-0 rounded-full bg-teal-500/20 animate-pulse-slow" />
                  </div>
                  <div className="flex flex-col items-center">
                    <h2 className="text-2xl font-bold text-center text-white mb-1">{selectedAgent.name}</h2>
                    <p className="text-teal-300 text-sm text-center mb-2">{(selectedAgent as OrbitAgent).role}</p>
                    <div className="flex flex-col items-center">
                      <p className="text-sm text-gray-300 mb-3 leading-snug text-center">
                        This AI-powered assistant can help you create professional {selectedAgent.capabilities?.[0]?.toLowerCase()} content and strategies tailored to your specific needs.
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.07 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => router.push(getAgentRoute(selectedAgent.name))}
                        className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-glow hover:shadow-[0_0_12px_rgba(0,255,255,0.6)] hover:scale-105 transition-all duration-200 mt-2"
                        aria-label={`Launch ${selectedAgent.name}`}
                      >
                        Launch {selectedAgent.name.replace('Agent', '')}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </FocusTrap>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AgentConstellation;
