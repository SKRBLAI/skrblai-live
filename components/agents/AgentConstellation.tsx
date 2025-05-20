"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import AgentCard from "./AgentCard";
import PercyAvatar from "../home/PercyAvatar";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Define AgentData interface
type AgentCategory = 'creative' | 'analytics' | 'publishing' | 'business' | 'development' | 'assistant' | 'finance' | 'support';
type OrbitTier = 'inner' | 'mid' | 'outer';

interface AgentData {
  id: string;
  name: string;
  role: string;
  gender: 'male' | 'female' | 'neutral';
  imageSlug: string;
  avatarVariant: 'waistUp' | 'full';
  displayInOrbit: boolean;
  orbit?: { radius?: number; speed?: number; angle?: number };
  moodColor?: string;
  tier: OrbitTier;
  // Optionals for UI
  description?: string;
  hoverSummary?: string;
}

const TIER_RADII = {
  inner: 70,
  mid: 140,
  outer: 210,
};

interface AgentConstellationProps {
  selectedAgent: AgentData | null;
  setSelectedAgent: (agent: AgentData | null) => void;
}

const AgentConstellation: React.FC<AgentConstellationProps> = ({ selectedAgent, setSelectedAgent }) => {
  const [orbitingAgents, setOrbitingAgents] = useState<AgentData[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const router = useRouter();

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch("/api/agents/featured");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const allAgents: AgentData[] = data.agents;
        // Runtime check for required props
        allAgents.forEach(agent => {
          if (!agent.imageSlug || !agent.avatarVariant || typeof agent.displayInOrbit !== 'boolean') {
            console.warn(`[AgentConstellation] Agent missing required orbit props:`, agent);
          }
        });
        const agentsToDisplay = allAgents.filter(agent => agent.displayInOrbit === true);
        setOrbitingAgents(agentsToDisplay);
      } catch (error) {
        console.error("Failed to fetch agents:", error);
        setOrbitingAgents([]); // Fallback to empty array on error
      }
    };
    fetchAgents();
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Tailwind's 'md' breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedAgent) {
        setSelectedAgent(null);
      }
    };

    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, [selectedAgent, setSelectedAgent]);

  // Helper function to determine agent route
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
      {/* Percy in the center with glow/pulse */}
      <motion.div
        className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, filter: "drop-shadow(0 0 32px #2dd4bf)" }}
        transition={{ type: 'spring', stiffness: 120, delay: 0.2 }}
      >
        <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-gray-800/90 to-black/90 border border-teal-500/30 overflow-hidden shadow-glow">
          <Image
            src="/agents/percy-waist-up.png"
            alt="Percy"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 96px, 128px"
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
      {/* Desktop orbital layout */}
      <div className="hidden md:block">
        {Object.entries(TIER_RADII).flatMap(([tierName, radius]) => {
          const tierAgentsInCurrentTier = orbitingAgents.filter(agent => agent.tier === tierName);
          return tierAgentsInCurrentTier.map((agent, i, arr) => {
            const angle = (arr.length > 0 ? (360 / arr.length) * i : 0);
            const rad = (angle * Math.PI) / 180;
            const x = Math.cos(rad) * radius;
            const y = Math.sin(rad) * radius;
            // Responsive image size by tier
            const size = tierName === 'inner' ? 64 : tierName === 'mid' ? 80 : 96;
            return (
              <motion.div
                key={`desktop-${agent.name}`}
                tabIndex={0}
                aria-label={`Activate ${agent.name}`}
                className="absolute z-10 group cursor-pointer flex flex-col items-center"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: 'translate(-50%, -50%)',
                  width: size,
                  height: size,
                }}
                animate={{
                  y: [0, -8, 0, 8, 0].map(v => v + (Math.random() * 2 - 1)),
                }}
                whileHover={{ scale: 1.13, zIndex: 30, filter: "drop-shadow(0 0 12px rgba(0,255,255,0.6))" }}
                onClick={() => setSelectedAgent(agent)}
              >
                <div className="relative rounded-full border-2 border-teal-500/60 group-hover:border-teal-300 transition-all duration-200 shadow-md group-hover:shadow-[0_0_12px_rgba(0,255,255,0.6)] bg-gray-800/50 overflow-hidden"
                  style={{ width: size, height: size }}
                >
                  <Image
                    src={agent.waistUpImage || `/agents/${agent.imageSlug}-waist-up.png`}
                    alt={agent.role || agent.name}
                    fill
                    className="object-cover rounded-full"
                    sizes={`${size}px`}
                  />
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg">
                  {agent.name.replace('Agent', '')}
                </div>
              </motion.div>
            );
          });
        })}
      </div>
      {/* Mobile stacked layout */}
      <div className="md:hidden flex flex-wrap justify-center items-center gap-3 p-4">
        {orbitingAgents.map((agent, index) => {
          const size = agent.tier === 'inner' ? 56 : agent.tier === 'mid' ? 68 : 80;
          return (
            <motion.div
              key={`mobile-${agent.name}`}
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
                  src={agent.waistUpImage || `/agents/${agent.imageSlug}-waist-up.png`}
                  alt={agent.role || agent.name}
                  fill
                  className="object-cover rounded-full"
                  sizes={`${size}px`}
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
                  src={`/agents/${selectedAgent.imageSlug}-waist-up.png`}
                  alt={selectedAgent.name}
                  fill
                  className="object-cover rounded-full shadow-glow"
                  sizes="96px"
                />
                <motion.div className="absolute inset-0 rounded-full bg-teal-500/20 animate-pulse-slow" />
              </div>
              <div className="flex flex-col items-center">
                <h2 className="text-2xl font-bold text-center text-white mb-1">{selectedAgent.name}</h2>
                <p className="text-teal-300 text-sm text-center mb-2">{selectedAgent.role}</p>
                <div className="flex flex-col items-center">
                  <p className="text-sm text-gray-300 mb-3 leading-snug text-center">
                    This AI-powered assistant can help you create professional {selectedAgent.capabilities?.[0].toLowerCase()} content and strategies tailored to your specific needs.
                  </p>
                  {/* Launch button */}
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
