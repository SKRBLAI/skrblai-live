"use client";
import React, { useState, useEffect } from "react";
import type { Agent } from '@/types/agent';
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getAgentImagePath } from '@/utils/agentUtils';

const TIER_RADII = {
  inner: 70,
  mid: 140,
  outer: 210,
} as const;

type OrbitTier = keyof typeof TIER_RADII;

type OrbitAgent = Agent & { tier: OrbitTier; role: string };

interface AgentConstellationProps {
  selectedAgent: Agent | null;
  setSelectedAgent: (agent: Agent | null) => void;
}

const AgentConstellation: React.FC<AgentConstellationProps> = ({ selectedAgent, setSelectedAgent }) => {
  const [orbitingAgents, setOrbitingAgents] = useState<OrbitAgent[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const router = useRouter();

  // Fetch agents from API, patching tier and role if needed
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch("/api/agents/featured");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const agents: OrbitAgent[] = (data.agents as Agent[]).map((agent) => {
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
          };
        });
        const agentsToDisplay = agents.filter(agent => agent.displayInOrbit === true);
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
            src="/images/agents/agents-percy-fullbody-nobg-skrblai.png"
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

      {/* Orbiting Agents */}
      <div className="hidden md:block">
        {Object.entries(TIER_RADII).flatMap(([tierName, radius]) => {
          // Only agents with a valid tier for this ring
          const tierAgentsInCurrentTier = orbitingAgents.filter(agent => agent.tier === tierName);
          return tierAgentsInCurrentTier.map((agent, i, arr) => {
            const angle = arr.length > 0 ? (360 / arr.length) * i : 0;
            const rad = (angle * Math.PI) / 180;
            const x = Math.cos(rad) * radius;
            const y = Math.sin(rad) * radius;
            const size = tierName === 'inner' ? 64 : tierName === 'mid' ? 80 : 96;
            const orbitStyle = {
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              transform: 'translate(-50%, -50%)',
              width: size,
              height: size,
            };
            return (
              <motion.div
                key={`desktop-${agent.id}`}
                tabIndex={0}
                aria-label={`Activate ${agent.name}`}
                className="absolute z-20 group cursor-pointer flex flex-col items-center focus:outline-none focus-visible:ring-4 focus-visible:ring-fuchsia-400"
                style={orbitStyle}
                animate={{
                  y: [0, -8, 0, 8, 0].map(v => v + (Math.random() * 2 - 1)),
                }}
                whileHover={{ scale: 1.13, zIndex: 30, filter: "drop-shadow(0 0 18px #f472b6)" }}
                onClick={() => {
                  setSelectedAgent(agent);
                  // Confetti pop effect
                  const confetti = document.createElement('div');
                  confetti.className = 'absolute inset-0 pointer-events-none animate-confetti-burst';
                  confetti.innerHTML = `<svg viewBox='0 0 100 100' class='w-full h-full'><circle cx='50' cy='50' r='30' fill='#38bdf8' opacity='0.18'/><circle cx='50' cy='50' r='20' fill='#f472b6' opacity='0.14'/><circle cx='50' cy='50' r='10' fill='#2dd4bf' opacity='0.16'/></svg>`;
                  (event?.currentTarget as HTMLElement).appendChild(confetti);
                  setTimeout(() => confetti.remove(), 900);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') setSelectedAgent(agent);
                }}
              >
                <div className="relative rounded-full border-4 border-fuchsia-400 group-hover:border-teal-300 transition-all duration-200 shadow-glow bg-gradient-to-br from-fuchsia-800/80 to-teal-900/80 overflow-hidden animate__animated animate__pulse"
                  style={{ width: size, height: size }}
                >
                  <Image
                    src={agent.imageSlug ? `/images/agents/${agent.imageSlug}.png` : getAgentImagePath(agent, 'waistUp')}
                    alt={agent.role || agent.name}
                    fill
                    className="object-cover rounded-full"
                    sizes={`${size}px`}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = `/images/agents/${agent.gender === 'neutral' ? 'male' : agent.gender}-silhouette.png`;
                    }}
                  />
                  {/* Cosmic animated ring */}
                  <span className="absolute inset-0 rounded-full ring-2 ring-fuchsia-400 animate-pulse pointer-events-none"></span>
                </div>
                {/* Tooltip for accessibility */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 bg-gradient-to-r from-fuchsia-700/90 to-teal-800/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg z-50">
                  {agent.name.replace('Agent', '')}
                </div>
              </motion.div>
            );
          });
        })}
        {/* Fallback: Agents with missing/invalid tier */}
        {orbitingAgents.filter(agent => !Object.keys(TIER_RADII).includes(agent.tier)).map((agent, i) => {
          if (process.env.NODE_ENV === "development") {
            console.warn(`[AgentConstellation] Agent missing or unknown tier:`, agent);
          }
          return (
            <motion.div
              key={`fallback-${agent.id}`}
              tabIndex={0}
              aria-label={`Activate ${agent.name}`}
              className="absolute group cursor-pointer flex flex-col items-center left-1/2 top-1/2 w-[72px] h-[72px] z-[5] border-2 border-dashed border-blue-500/80 filter brightness-75 grayscale-[.5] drop-shadow-[0_0_8px_#38bdf8cc] -translate-x-1/2 -translate-y-1/2"
              onClick={() => setSelectedAgent(agent)}
            >
              <div className="relative rounded-full border-2 border-gray-500/40 bg-gray-700/50 overflow-hidden w-[72px] h-[72px]"
                title="Missing or unknown tier"
              >
                <Image
                  src={agent.imageSlug ? `/images/agents/${agent.imageSlug}.png` : getAgentImagePath(agent, 'waistUp')}
                  alt={agent.role || agent.name}
                  fill
                  className="object-cover rounded-full opacity-70"
                  sizes="72px"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = `/images/agents/${agent.gender === 'neutral' ? 'male' : agent.gender}-silhouette.png`;
                  }}
                />
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg">
                {agent.name.replace('Agent', '')}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Mobile: stacked orbit agents */}
      <div className="md:hidden flex flex-wrap justify-center items-center gap-3 p-4">
        {orbitingAgents.map((agent) => {
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
              <div className="relative rounded-full border-2 border-teal-500/60 group-hover:border-teal-300 transition-all duration-200 shadow-md group-hover:shadow-[0_0_12px_rgba(0,255,255,0.6)] bg-gray-800/50 overflow-hidden mb-1"
                style={{ width: size, height: size }}
              >
                <Image
                  src={agent.imageSlug ? `/images/agents/${agent.imageSlug}.png` : getAgentImagePath(agent, 'waistUp')}
                  alt={agent.role || agent.name}
                  fill
                  className="object-cover rounded-full"
                  sizes={`${size}px`}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = `/images/agents/${agent.gender === 'neutral' ? 'male' : agent.gender}-silhouette.png`;
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

      {/* Agent Details Modal */}
      <AnimatePresence>
        {selectedAgent && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ pointerEvents: 'auto' }}
            onClick={() => setSelectedAgent(null)}
            aria-label="Agent Details Modal"
          >
            <motion.div
              className="relative bg-white/20 backdrop-blur-lg rounded-2xl shadow-2xl p-6 max-w-md w-full flex flex-col items-center gap-4 animate__animated animate__fadeInDown"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-teal-400 text-2xl focus:outline-none focus:ring-2 focus:ring-teal-400/40 rounded"
                onClick={() => setSelectedAgent(null)}
                aria-label="Close agent details"
              >
                ×
              </button>
              <div className="relative w-24 h-24 mx-auto">
                <Image
                  src={selectedAgent.imageSlug ? `/images/agents/${selectedAgent.imageSlug}.png` : '/images/agents/agents-percy-fullbody-nobg-skrblai.png'}
                  alt={selectedAgent.name}
                  fill
                  className="object-cover rounded-full shadow-glow"
                  sizes="96px"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = `/images/agents/${selectedAgent.gender === 'neutral' ? 'male' : selectedAgent.gender}-silhouette.png`;
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AgentConstellation;
