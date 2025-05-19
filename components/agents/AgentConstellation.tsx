"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AgentCard from "./AgentCard";
import PercyAvatar from "../home/PercyAvatar";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Example agent data (should be passed as props in production)
const agents = [
  { name: 'BrandingAgent', role: 'Brand Strategist', capabilities: ['Branding', 'Identity'] },
  { name: 'ContentCreatorAgent', role: 'Content Master', capabilities: ['Content', 'Copywriting'] },
  { name: 'AnalyticsAgent', role: 'Data Analyst', capabilities: ['Analytics', 'Reporting'] },
  { name: 'PublishingAgent', role: 'Publishing Expert', capabilities: ['Publishing', 'Distribution'] },
  { name: 'SocialBotAgent', role: 'Social Media Guru', capabilities: ['Social', 'Engagement'] },
  { name: 'AdCreativeAgent', role: 'Ad Specialist', capabilities: ['Ads', 'Creative'] },
  { name: 'ProposalGeneratorAgent', role: 'Proposal Expert', capabilities: ['Proposals', 'Automation'] },
  { name: 'PaymentManagerAgent', role: 'Finance Manager', capabilities: ['Payments', 'Finance'] },
  { name: 'ClientSuccessAgent', role: 'Success Manager', capabilities: ['Client', 'Support'] },
  { name: 'SiteGenAgent', role: 'Web Developer', capabilities: ['Web', 'Sites'] },
  { name: 'BizAgent', role: 'Business Strategist', capabilities: ['Business', 'Strategy'] },
  { name: 'VideoContentAgent', role: 'Video Producer', capabilities: ['Video', 'Production'] },
  { name: 'PercyAgent', role: 'Assistant', capabilities: ['Assist', 'Sync'] },
  { name: 'PercySyncAgent', role: 'Sync Manager', capabilities: ['Sync', 'Automation'] },
];

const ORBIT_RADIUS = 180;

export default function AgentConstellation() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<typeof agents[0] | null>(null);
  const router = useRouter();
  
  // Handle escape key press to dismiss modal
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedAgent) {
        setSelectedAgent(null);
      }
    };
    
    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, [selectedAgent]);
  
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
    <div className="relative mx-auto" style={{ width: 430, height: 430, maxWidth: '90vw', maxHeight: '90vw' }}>
      {/* Percy in the center with glow/pulse */}
      <motion.div
        className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, filter: "drop-shadow(0 0 32px #2dd4bf)" }}
        transition={{ type: 'spring', stiffness: 120, delay: 0.2 }}
      >
        <PercyAvatar size="lg" animate />
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
      {agents.map((agent, i, arr) => {
        const angle = (360 / arr.length) * i;
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * ORBIT_RADIUS;
        const y = Math.sin(rad) * ORBIT_RADIUS;
        return (
          <motion.div
            key={agent.name}
            tabIndex={0}
            aria-label={`${agent.role || agent.name}`}
            className="absolute z-10"
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              transform: 'translate(-50%, -50%)',
            }}
            animate={{
              y: [0, -8, 0, 8, 0].map(v => v + (Math.random() * 2 - 1)), // subtle unique bounce
            }}
            transition={{
              repeat: Infinity,
              duration: 5 + Math.random() * 2,
              ease: "easeInOut",
              type: "spring",
              stiffness: 120,
              damping: 18,
            }}
            whileHover={{ scale: 1.13, zIndex: 30 }}
            whileTap={{ scale: 1.08, zIndex: 30 }}
            onMouseEnter={() => setActiveIndex(i)}
            onMouseLeave={() => setActiveIndex(null)}
            onFocus={() => setActiveIndex(i)}
            onBlur={() => setActiveIndex(null)}
            onClick={() => setSelectedAgent(agent)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelectedAgent(agent);
              }
            }}
          >
            <AgentCard name={agent.name} role={agent.role} gender={i % 2 === 0 ? 'male' : 'female'} />
            <AnimatePresence>
              {activeIndex === i && (
                <motion.div
                  className="absolute left-1/2 top-full mt-2 w-56 bg-gradient-to-br from-teal-900/95 to-blue-900/90 rounded-xl shadow-lg p-4 text-white text-sm border border-teal-500/40 z-50"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.22 }}
                  style={{ pointerEvents: 'auto' }}
                  aria-live="polite"
                >
                  <div className="font-bold text-base mb-1">{agent.name}</div>
                  <div className="text-teal-300 mb-2">{agent.role}</div>
                  <div className="flex flex-wrap gap-2">
                    {agent.capabilities?.map((cap: string) => (
                      <span key={cap} className="bg-teal-700/40 rounded px-2 py-0.5 text-xs">
                        {cap}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
      {/* Optional: cosmic background particles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {require('@/components/ui/FloatingParticles').default({ fullScreen: false, particleCount: 36 })}
      </div>
      
      {/* Agent Detail Modal */}
      <AnimatePresence>
        {selectedAgent && (
          <>
            {/* Modal backdrop with click handler to dismiss */}
            <motion.div 
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAgent(null)}
              role="dialog"
              aria-modal="true"
              aria-labelledby="agent-modal-title"
            />
            
            {/* Modal content */}
            <motion.div
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 mx-auto py-6"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-br from-teal-900/95 to-blue-900/90 rounded-xl border border-teal-500/40 shadow-glow overflow-hidden">
                {/* Close button */}
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
                  aria-label="Close agent details"
                >
                  ×
                </button>
                
                {/* Agent header */}
                <div className="relative p-6 flex flex-col items-center border-b border-white/10">
                  <div className="h-32 w-32 relative mb-4">
                    <Image 
                      src={`/images/agents-${selectedAgent.name.toLowerCase().replace('agent', '')}-skrblai.png`}
                      alt={selectedAgent.name}
                      width={128}
                      height={128}
                      className="rounded-full border-2 border-teal-400/50 shadow-glow"
                      onError={(e) => {
                        // Fallback image if agent image not found
                        e.currentTarget.src = `/images/agents/male-silhouette.png`;
                      }}
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-500/20 to-blue-500/20 animate-pulse-slow"></div>
                  </div>
                  
                  <h2 id="agent-modal-title" className="text-2xl font-bold text-white mb-1">{selectedAgent.name.replace('Agent', '')}</h2>
                  <p className="text-teal-300 text-lg mb-2">{selectedAgent.role}</p>
                  
                  <div className="flex flex-wrap gap-2 justify-center">
                    {selectedAgent.capabilities?.map((cap: string) => (
                      <span key={cap} className="bg-teal-700/40 rounded-full px-3 py-1 text-xs text-white">
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Agent description */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Agent Capabilities</h3>
                  <p className="text-gray-300 mb-4">
                    {selectedAgent.name} specializes in {selectedAgent.capabilities?.join(', ')}. 
                    This AI-powered assistant can help you create professional {selectedAgent.capabilities?.[0].toLowerCase()} 
                    content and strategies tailored to your specific needs.
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
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
