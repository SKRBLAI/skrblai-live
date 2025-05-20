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
  name: string;
  role: string;
  capabilities?: string[];
  gender: 'male' | 'female' | 'neutral';
  description?: string; // Added for fallback
  hoverSummary?: string; // Added for tooltip
  imageSlug?: string; // For logging consistency and potential future use
  category: AgentCategory;
  moodColor: string; // e.g., 'pink-500', '#FF00FF'
  tier: OrbitTier;
}

// Example agent data (should be passed as props in production)
const categoryMoodColors: Record<AgentCategory, string> = {
  creative: 'bg-pink-500/30 border-pink-500', // Tailwind classes for glow and border
  analytics: 'bg-green-500/30 border-green-500',
  publishing: 'bg-sky-500/30 border-sky-500',
  business: 'bg-purple-500/30 border-purple-500',
  development: 'bg-orange-500/30 border-orange-500',
  assistant: 'bg-teal-500/30 border-teal-500',
  finance: 'bg-yellow-500/30 border-yellow-500',
  support: 'bg-indigo-500/30 border-indigo-500',
};

const getTierForCategory = (category: AgentCategory): OrbitTier => {
  switch (category) {
    case 'assistant': return 'inner';
    case 'creative': case 'analytics': case 'publishing': return 'mid';
    case 'business': case 'development': case 'finance': case 'support': return 'outer';
    default: return 'mid'; // Default fallback
  }
};

const agents: AgentData[] = [
  { name: 'BrandingAgent', role: 'Brand Strategist', capabilities: ['Branding', 'Identity'], gender: 'female' as const, hoverSummary: "Craft your brand's story.", description: "Defines and refines brand identities, ensuring market resonance.", imageSlug: "branding", category: 'creative', moodColor: categoryMoodColors.creative, tier: getTierForCategory('creative') },
  { name: 'ContentCreatorAgent', role: 'Content Master', capabilities: ['Content', 'Copywriting'], gender: 'male' as const, hoverSummary: "Generate engaging content.", description: "Produces high-quality written and visual content for various platforms.", imageSlug: "content-creator", category: 'creative', moodColor: categoryMoodColors.creative, tier: getTierForCategory('creative') },
  { name: 'AnalyticsAgent', role: 'Data Analyst', capabilities: ['Analytics', 'Reporting'], gender: 'female' as const, hoverSummary: "Uncover data insights.", description: "Analyzes data to provide actionable insights and performance reports.", imageSlug: "analytics", category: 'analytics', moodColor: categoryMoodColors.analytics, tier: getTierForCategory('analytics') },
  { name: 'PublishingAgent', role: 'Publishing Expert', capabilities: ['Publishing', 'Distribution'], gender: 'male' as const, hoverSummary: "Distribute your content.", description: "Manages content publishing workflows and distribution channels.", imageSlug: "publishing", category: 'publishing', moodColor: categoryMoodColors.publishing, tier: getTierForCategory('publishing') },
  { name: 'SocialBotAgent', role: 'Social Media Guru', capabilities: ['Social', 'Engagement'], gender: 'female' as const, hoverSummary: "Boost social presence.", description: "Automates social media tasks and enhances audience engagement.", imageSlug: "social-bot", category: 'publishing', moodColor: categoryMoodColors.publishing, tier: getTierForCategory('publishing') },
  { name: 'AdCreativeAgent', role: 'Ad Specialist', capabilities: ['Ads', 'Creative'], gender: 'male' as const, hoverSummary: "Design winning ads.", description: "Creates compelling ad creatives optimized for conversion.", imageSlug: "ad-creative", category: 'creative', moodColor: categoryMoodColors.creative, tier: getTierForCategory('creative') },
  // Add hoverSummary, description, and imageSlug to all agents
  { name: 'ProposalGeneratorAgent', role: 'Proposal Expert', capabilities: ['Proposals', 'Automation'], gender: 'female' as const, hoverSummary: "Automate proposals.", description: "Generates professional proposals quickly and efficiently.", imageSlug: "proposal-generator", category: 'business', moodColor: categoryMoodColors.business, tier: getTierForCategory('business') },
  { name: 'PaymentManagerAgent', role: 'Finance Manager', capabilities: ['Payments', 'Finance'], gender: 'male' as const, hoverSummary: "Manage payments.", description: "Handles financial transactions and payment processing securely.", imageSlug: "payment-manager", category: 'finance', moodColor: categoryMoodColors.finance, tier: getTierForCategory('finance') },
  { name: 'ClientSuccessAgent', role: 'Success Manager', capabilities: ['Client', 'Support'], gender: 'female' as const, hoverSummary: "Ensure client success.", description: "Focuses on client satisfaction, support, and long-term success.", imageSlug: "client-success", category: 'support', moodColor: categoryMoodColors.support, tier: getTierForCategory('support') },
  { name: 'SiteGenAgent', role: 'Web Developer', capabilities: ['Web', 'Sites'], gender: 'male' as const, hoverSummary: "Build stunning websites.", description: "Develops and maintains websites with modern technologies.", imageSlug: "site-gen", category: 'development', moodColor: categoryMoodColors.development, tier: getTierForCategory('development') },
  { name: 'BizAgent', role: 'Business Strategist', capabilities: ['Business', 'Strategy'], gender: 'female' as const, hoverSummary: "Strategize for growth.", description: "Provides strategic business advice and planning for growth.", imageSlug: "biz-agent", category: 'business', moodColor: categoryMoodColors.business, tier: getTierForCategory('business') },
  { name: 'VideoContentAgent', role: 'Video Producer', capabilities: ['Video', 'Production'], gender: 'male' as const, hoverSummary: "Produce video content.", description: "Creates engaging video content for marketing and communication.", imageSlug: "video-content", category: 'creative', moodColor: categoryMoodColors.creative, tier: getTierForCategory('creative') },
  { name: 'PercyAgent', role: 'Assistant', capabilities: ['Assist', 'Sync'], gender: 'neutral' as const, hoverSummary: "Your main AI sidekick.", description: "The central AI assistant orchestrating all your tasks and agents.", imageSlug: "percy", category: 'assistant', moodColor: categoryMoodColors.assistant, tier: getTierForCategory('assistant') },
  { name: 'PercySyncAgent', role: 'Sync Manager', capabilities: ['Sync', 'Automation'], gender: 'neutral' as const, hoverSummary: "Keeps everything in sync.", description: "Manages data synchronization and automation across your tools.", imageSlug: "percy-sync", category: 'assistant', moodColor: categoryMoodColors.assistant, tier: getTierForCategory('assistant') },
];

const TIER_RADII: Record<OrbitTier, number> = {
  inner: 110,
  mid: 190, 
  outer: 270,
};

interface AgentConstellationProps {
  logPercyEvent?: (type: string, value: any, meta?: any) => Promise<void>;
}

const defaultLogPercyEvent = async (type: string, value: any, meta: any = {}) => {
  console.warn('[AgentConstellation] logPercyEvent not provided. Logging to console:', { type, value, meta });
};

export default function AgentConstellation({ logPercyEvent = defaultLogPercyEvent }: AgentConstellationProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null); // For desktop hover state
  const [selectedAgent, setSelectedAgent] = useState<AgentData | null>(null); // For main modal
  const [mobileVisibleAgentName, setMobileVisibleAgentName] = useState<string | null>(null); // For mobile click-to-show tooltip
  const [isMobile, setIsMobile] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const router = useRouter();
  
  // Handle escape key press to dismiss modal
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
    <div className="relative mx-auto w-[430px] h-[430px] max-w-[90vw] max-h-[90vw]">
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
      {Object.entries(TIER_RADII).flatMap(([tierName, radius]) => { // Open flatMap callback body and JSX expression
        const tierAgentsInCurrentTier = agents.filter(agent => agent.tier === tierName);
        return tierAgentsInCurrentTier.map((agent, i, arr) => { // Open map callback body
          const angle = (arr.length > 0 ? (360 / arr.length) * i : 0); // Avoid division by zero if tier is empty
          const rad = (angle * Math.PI) / 180;
          const x = Math.cos(rad) * radius;
          const y = Math.sin(rad) * radius;
          return (
            <motion.div
              key={agent.name}
              tabIndex={0}
              aria-label={`${agent.role || agent.name}`}
              className="absolute z-10 flex items-center justify-center"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: 'translate(-50%, -50%)',
              }}
              animate={{
                y: [0, -8, 0, 8, 0].map(v => v + (Math.random() * 2 - 1)),
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
              onMouseEnter={() => setActiveIndex(agents.findIndex(a => a.name === agent.name))}
              onMouseLeave={() => setActiveIndex(null)}
              onFocus={!isMobile ? () => setActiveIndex(agents.findIndex(a => a.name === agent.name)) : undefined}
              onBlur={!isMobile ? () => setActiveIndex(null) : undefined}
              onClick={() => {
                if (isMobile) {
                  setMobileVisibleAgentName(current => current === agent.name ? null : agent.name);
                  setSelectedAgent(null);
                } else {
                  setSelectedAgent(agent);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedAgent(agent);
                }
              }}
            >
              {/* Mood Glow Element */}
              <motion.div 
                className={`absolute w-20 h-20 rounded-full ${agent.moodColor} opacity-70 blur-lg -z-10`}
                animate={!shouldReduceMotion ? {
                  scale: [1, 1.1, 1, 1.05, 1],
                  opacity: [0.6, 0.8, 0.6, 0.7, 0.6],
                } : {}}
                transition={!shouldReduceMotion ? {
                  repeat: Infinity,
                  duration: 3 + Math.random() * 2,
                  ease: "easeInOut",
                } : { duration: 0.01 }}
              />
              <AgentCard name={agent.name} role={agent.role} gender={agent.gender} />
              <AnimatePresence>
                {((!isMobile && activeIndex === agents.findIndex(a => a.name === agent.name)) || (isMobile && mobileVisibleAgentName === agent.name)) && (
                  <motion.div
                    className={`absolute left-1/2 top-full mt-2 w-60 bg-gradient-to-br from-gray-800/90 via-gray-900/95 to-black/90 rounded-xl shadow-2xl p-4 text-white text-sm border ${agent.moodColor.split(' ')[1] || 'border-teal-500'}/60 backdrop-blur-md z-50`}
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.95 }}
                    animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 350, damping: 20, mass: 0.8 } }}
                    exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.95, transition: { duration: 0.15 } }}
                    style={{ transform: 'translateX(-50%)', pointerEvents: 'auto' }}
                    aria-live="polite"
                  >
                    {isMobile && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMobileVisibleAgentName(null);
                        }}
                        className="absolute top-1 right-1.5 text-gray-400 hover:text-white text-lg p-1 z-10"
                        aria-label="Close summary"
                      >
                        ✕
                      </button>
                    )}
                    {/* Mood color accent bar */}
                    <div className={`h-1 ${agent.moodColor.split(' ')[0]} rounded-t-md absolute top-0 left-0 right-0 opacity-80`} />
                    <div className="font-bold text-base mb-1">{agent.name}</div>
                    <div className="text-teal-300 mb-1 text-xs">{agent.role}</div>
                    <p className="text-xs text-gray-300 mb-3 leading-snug">
                      {agent.hoverSummary || agent.description || agent.capabilities?.join(', ')}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const route = getAgentRoute(agent.name);
                        if (logPercyEvent) {
                          logPercyEvent('agent_hover_launch', {
                            agentId: agent.name,
                            agentSlug: agent.imageSlug || agent.name.toLowerCase(),
                            gender: agent.gender,
                            route,
                          });
                        }
                        router.push(route);
                      }}
                      className={`w-full text-center px-4 py-2 rounded-md text-xs font-semibold transition-all duration-200 shadow-md hover:shadow-lg active:shadow-sm ${agent.moodColor.split(' ')[0]}/80 hover:${agent.moodColor.split(' ')[0]} text-white`}
                    >
                      Launch Agent
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ); // End of return for map callback
        }); // End of map callback body and function call
      })}
      {/* End of flatMap callback body, function call, and JSX expression */}
      {/* Agent Details Modal */}
      <AnimatePresence>
        {selectedAgent && (
          <>
            {/* Modal backdrop with click handler to dismiss */}
            <motion.div 
              className="fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAgent(null)}
              role="dialog"
              aria-modal="true"
              aria-labelledby="agent-modal-title"
              aria-describedby="agent-modal-description"
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
                        // Fallback to gender silhouette
                        e.currentTarget.src = `/images/agents/${selectedAgent.gender}-silhouette.png`;
                      }}
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-500/20 to-blue-500/20 animate-pulse-slow"></div>
                  </div>
                  
                  <h3 id="agent-modal-title" className="text-2xl font-bold text-gradient-blue mb-1">{selectedAgent.name}</h3>
                  <p id="agent-modal-description-role" className="text-teal-300 text-sm mb-4">{selectedAgent.role}</p>
                  
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
                  <p id="agent-modal-description" className="text-gray-300 text-sm leading-relaxed mb-6">
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
