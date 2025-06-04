"use client";

import React, { useState, useEffect } from 'react';
import type { Agent } from '@/types/agent';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getAgentImagePath } from '@/utils/agentUtils';
import FocusTrap from 'focus-trap-react';
import { createClient } from '@supabase/supabase-js';
import { triggerEmailFromAnalytics } from '@/lib/analytics/emailTriggers';
import { emailAutomation } from '@/lib/email/simpleAutomation';
import AgentBackstoryModal from './AgentBackstoryModal';
import CloudinaryImage from '@/components/ui/CloudinaryImage';

// Constants
const TIER_RADII = { inner: 90, mid: 165, outer: 240 } as const;
type OrbitTier = keyof typeof TIER_RADII;
const AGENTS_PER_GROUP = 3;

// Helper functions
const getTierForAgent = (agent: Agent): OrbitTier => {
  if (agent.category === 'creative') return 'inner';
  if (agent.category === 'analytical') return 'mid';
  return 'outer';
};

const getRoleForAgent = (agent: Agent): string => {
  return agent.category || 'general';
};

interface OrbitAgent extends Agent {
  tier: OrbitTier;
  role: string;
  angle: number;
  distance: number;
  isLocked: boolean;
}

interface AgentConstellationProps {
  agents?: Agent[];
  selectedAgent: Agent | null;
  setSelectedAgent: (agent: Agent | null) => void;
  handleAgentLaunch?: (agent: Agent) => void;
  recommendedAgentIds?: string[];
}

// All Percy-related ids/names for filtering
const PERCY_IDS = [
  'PercyAgent', 'PercySyncAgent', 'percy', 'percy-agent', 'percySync', 'percy-sync'
];
const PERCY_NAMES = ['percy', 'Percy'];

interface AgentBackstoryModalProps {
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
}

const AgentConstellation: React.FC<AgentConstellationProps> = ({
  agents = [],
  selectedAgent,
  setSelectedAgent,
  handleAgentLaunch,
}) => {
  const [orbitingAgents, setOrbitingAgents] = useState<OrbitAgent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<OrbitAgent[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [showBackstoryModal, setShowBackstoryModal] = useState(false);
  const [backstoryAgent, setBackstoryAgent] = useState<Agent | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  const handleAgentClick = (agent: Agent) => {
    if (isMobile) {
      setBackstoryAgent(agent);
      setShowBackstoryModal(true);
    } else {
      setSelectedAgent(agent);
      handleAgentSelection(agent);
    }
  };

  // Error logging for mobile performance issues
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('[AgentConstellation] JavaScript Error:', {
        message: error.message,
        filename: error.filename,
        lineno: error.lineno,
        colno: error.colno,
        error: error.error,
        userAgent: navigator.userAgent,
        isMobile: window.innerWidth < 768,
        timestamp: new Date().toISOString()
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('[AgentConstellation] Unhandled Promise Rejection:', {
        reason: event.reason,
        userAgent: navigator.userAgent,
        isMobile: window.innerWidth < 768,
        timestamp: new Date().toISOString()
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Performance monitoring for mobile
  useEffect(() => {
    if (typeof window !== 'undefined' && window.performance) {
      const isMobileDevice = window.innerWidth < 768;
      const memory = (performance as any).memory;
      
      console.log('[AgentConstellation] Performance Metrics:', {
        isMobile: isMobileDevice,
        agentCount: orbitingAgents.length,
        memory: memory ? {
          usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
          totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
          jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
        } : 'Not available',
        timestamp: new Date().toISOString()
      });
    }
  }, [orbitingAgents.length]);

  // Deduplicate Percy and build orbiting agent array
  useEffect(() => {
    let sourceAgents: Agent[] = Array.isArray(agents) ? agents : [];
    if (!sourceAgents.length) return setOrbitingAgents([]);

    // Deduplicate Percy (id or name) and build OrbitAgent objects
    const filtered = sourceAgents
      .filter(agent =>
        agent.visible !== false &&
        !PERCY_IDS.includes((agent.id || '').toLowerCase()) &&
        !PERCY_NAMES.includes((agent.name || '').toLowerCase())
      );

    const agentsToDisplay: OrbitAgent[] = filtered.map((agent, index) => {
      const tier = getTierForAgent(agent);
      return {
        ...agent,
        tier,
        role: getRoleForAgent(agent),
        angle: (index * (2 * Math.PI)) / filtered.length,
        distance: TIER_RADII[tier],
        isLocked: !agent.unlocked,
      };
    });

    setOrbitingAgents(agentsToDisplay);
    setFilteredAgents(agentsToDisplay);
  }, [agents]);

  // Responsive: detect mobile (optimized with debounce)
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const checkMobile = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const newIsMobile = window.innerWidth < 768;
        if (newIsMobile !== isMobile) {
          setIsMobile(newIsMobile);
        }
      }, 100); // Debounce resize events
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile, { passive: true });
    return () => {
      window.removeEventListener("resize", checkMobile);
      clearTimeout(timeoutId);
    };
  }, [isMobile]);

  // Escape closes selected agent modal
  useEffect(() => {
    if (!selectedAgent) return;
    
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedAgent(null);
    };
    window.addEventListener("keydown", handleEscapeKey);
    return () => window.removeEventListener("keydown", handleEscapeKey);
  }, [selectedAgent, setSelectedAgent]);

  // Agent name to dashboard route
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
    };
    return routeMap[agentName] || "/dashboard";
  };

  // Arrange orbit agents in a circle (desktop only)
  const visibleAgents = orbitingAgents.slice(0, AGENTS_PER_GROUP);

  // Ensure all agent launches use the new automation API
  const handleAgentSelection = async (agent: Agent) => {
    if (handleAgentLaunch) {
      handleAgentLaunch(agent);
      return;
    }

    if (!user) {
      router.push('/sign-in');
      return;
    }

    try {
      const response = await fetch('/api/agents/automation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token}`
        },
        body: JSON.stringify({
          agentId: agent.id,
          task: 'launch',
          payload: {},
          featureType: agent.premiumFeature,
          useQueue: true
        })
      });

      const result = await response.json();

      if (result.success) {
        // Success! Agent launched
        setSelectedAgent(null);
        router.push(getAgentRoute(agent.name));
        
        // Send simple follow-up email
        if (user.email) {
          emailAutomation.scheduleAgentFollowUpEmail(
            user.id, 
            user.email, 
            agent.name, 
            6 // 6 hours delay
          );
        }
        
      } else if (result.upgradeRequired) {
        // Send immediate upgrade email + nurture sequence
        if (user.email) {
          const userName = user.user_metadata?.full_name || 'there';
          
          // Send immediate upgrade email
          await emailAutomation.sendUpgradePromptEmail(
            user.email, 
            userName, 
            agent.name, 
            result.upgradeRequired
          );
          
          // Schedule nurture sequence
          await emailAutomation.scheduleUpgradeNurture(
            user.id, 
            user.email, 
            userName, 
            agent.name
          );
        }
        
        // Show premium upgrade prompt (existing code)
        const upgradeModal = document.createElement('div');
        upgradeModal.innerHTML = `
          <div class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
            <div class="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg p-6 max-w-md">
              <h4 class="font-semibold text-amber-800 mb-2">Premium Feature Required</h4>
              <p class="text-amber-700 mb-4">${agent.name} requires a ${result.upgradeRequired} subscription.</p>
              <p class="text-amber-600 text-sm mb-4">Check your email for a special upgrade offer!</p>
              <div class="flex gap-3">
                <button onclick="window.open('/pricing', '_blank')" class="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-md font-medium hover:from-amber-600 hover:to-orange-600">
                  Upgrade to ${result.upgradeRequired}
                </button>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" class="bg-gray-500 text-white px-4 py-2 rounded-md">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(upgradeModal);
      } else {
        alert(`Error launching ${agent.name}: ${result.error || 'Unknown error'}`);
      }

    } catch (error) {
      console.error('Agent launch failed:', error);
      alert(`Failed to launch ${agent.name}. Please try again.`);
    }
  };

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  return (
    <div className="relative mx-auto w-[375px] h-[375px] max-w-[90vw] max-h-[90vw] md:w-[600px] md:h-[600px] px-4 sm:px-0 mb-24 md:mb-0 overflow-visible">
      {/* Sticky Ask Percy button on mobile */}
      {isMobile && (
        <motion.button
          className="fixed bottom-safe z-50 left-1/2 -translate-x-1/2 bg-gradient-to-r from-teal-400/90 to-blue-500/90 backdrop-blur-sm
            px-6 py-2.5 rounded-full text-white font-medium shadow-cosmic flex items-center gap-2
            hover:from-teal-400 hover:to-blue-500 active:scale-95 transition-all duration-200
            border border-white/20 hover:border-white/40 group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          aria-label="Ask Percy"
          onClick={() => {
            const percy = orbitingAgents.find(a =>
              [a.id?.toLowerCase(), a.name?.toLowerCase()].some(val =>
                val && (val.includes('percy') || val.includes('concierge'))
              )
            );
            if (percy) setSelectedAgent(percy);
          }}
        >
          <Image
            src="/images/agents-percy-nobg-skrblai.png"
            alt="Percy"
            width={24}
            height={24}
            className="w-6 h-6 object-contain group-hover:animate-wave"
          />
          Ask Percy
        </motion.button>
      )}

      {/* Percy in the center - Highest z-index as centerpiece */}
      <motion.div
        className={`absolute z-30 flex flex-col items-center drop-shadow-cosmic
          ${isMobile ? 'left-1/2 -translate-x-1/2 bottom-[-6rem]' : 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'}`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, delay: 0.2 }}
        style={{ willChange: 'transform, opacity' }}
      >
        <div className="relative w-36 h-52 md:w-48 md:h-64 flex items-end justify-center animate-float">
          <Image
            src="/images/agents-percy-nobg-skrblai.png"
            alt="Percy full body"
            fill
            className="object-contain drop-shadow-cosmic percy-center-image"
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
          <span className="block text-2xl font-bold skrblai-heading">Percy</span>
          <span className="block text-teal-300 text-sm">The Concierge</span>
        </motion.div>
      </motion.div>

      {/* Orbiting Agents - Desktop (3 at a time) */}
      <motion.div 
        className="relative w-full h-full"
        animate={isMobile ? { rotate: 360 } : undefined}
        transition={isMobile ? { 
          duration: 60,
          repeat: Infinity,
          ease: "linear",
        } : undefined}
      >
        <AnimatePresence mode="sync">
          {visibleAgents.slice(0, isMobile ? 6 : AGENTS_PER_GROUP).map((agent, i) => {
            const totalAgents = isMobile ? 6 : AGENTS_PER_GROUP;
            const angle = (360 / totalAgents) * i - 90;
            const radius = isMobile ? 140 : TIER_RADII[agent.tier || 'outer'];
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;
            const size = agent.tier === 'inner' ? 64 : agent.tier === 'mid' ? 80 : 96;
            const isLocked = !agent.unlocked;
            return (
              <motion.div
                key={agent.id || `${agent.name}-${i}`}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ 
                  delay: i * 0.08, 
                  type: shouldReduceMotion ? 'tween' : 'spring',
                  duration: shouldReduceMotion ? 0.3 : undefined
                }}
                className={`absolute group cursor-pointer transition-all duration-300
                  ${isLocked ? 'opacity-50 grayscale brightness-75 pointer-events-none z-10' : 'z-20'}
                  ${isMobile ? 'shadow-none hover:z-30' : ''}`}
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  width: size,
                  height: size,
                  willChange: 'transform, opacity'
                }}
                tabIndex={isLocked ? -1 : 0}
                aria-disabled={isLocked ? 'true' : 'false'}
                onClick={() => {
                  if (!isLocked) {
                    handleAgentClick(agent);
                  }
                }}
                onKeyDown={(e) => {
                  if (!isLocked && (e.key === 'Enter' || e.key === ' ')) setSelectedAgent(agent);
                }}
                whileHover={!isLocked && !shouldReduceMotion ? { scale: 1.1 } : undefined}
                whileTap={!isLocked ? { scale: 0.97 } : undefined}
              >
                <motion.div
                  className={`absolute inset-0 z-0 rounded-full pointer-events-none w-full h-full shadow-cosmic
                    ${isLocked ? 'grayscale brightness-75' : ''}`}
                  aria-hidden="true"
                />
                <div className={`relative w-full h-full rounded-full overflow-hidden border-2
                  ${isLocked ? 'border-white/10' : 'border-teal-400/20'}
                  ${isMobile ? 
                    'shadow-sm bg-white/10 hover:shadow-cosmic hover:bg-white/20 transition-all duration-300' : 
                    'shadow-cosmic bg-white/5 backdrop-blur-xl'}`}>
                  <CloudinaryImage
                    agent={agent}
                    alt={agent.role || agent.name}
                    width={size}
                    height={size}
                    className="agent-image w-full h-full"
                    useCloudinary={true}
                    quality={90}
                    webp={true}
                    cloudinaryTransformation="ar_1:1,c_fill,g_face"
                    fallbackToLocal={true}
                    fallbackImagePath={getAgentImagePath(agent)}
                  />
                  {isLocked && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 bg-gradient-to-br from-fuchsia-600/60 via-black/70 to-teal-400/40 flex flex-col items-center justify-center rounded-full cosmic-glass cosmic-glow z-10"
                      style={{ border: '2px solid #f472b6', boxShadow: '0 0 32px #f472b6, 0 0 48px #38bdf8' }}
                    >
                      <span className="text-white text-2xl mb-1" title="Locked agent">🔒</span>
                      <span className="px-2 py-1 rounded-full bg-gradient-to-r from-fuchsia-500 to-teal-400 text-white text-xs font-bold shadow-glow select-none mt-1">Premium</span>
                    </motion.div>
                  )}
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18 }}
                  className="absolute left-1/2 -translate-x-1/2 -top-8 md:-top-10 px-3 py-1 rounded-md bg-black/80 text-white text-xs font-semibold pointer-events-none shadow-lg opacity-0 group-hover:opacity-100 group-focus:opacity-100 group-active:opacity-100 transition-opacity duration-150 z-30 whitespace-nowrap"
                  role="tooltip"
                  aria-label={agent.name.replace('Agent', '') + (isLocked ? ' (Locked)' : '')}
                  style={{ pointerEvents: 'none' }}
                >
                  {agent.name.replace('Agent', '')} {isLocked ? <span className="ml-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-teal-400 text-white text-xs font-bold shadow-glow select-none">Premium</span> : null}
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {orbitingAgents.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-12 cosmic-glass cosmic-gradient rounded-xl shadow-[0_0_24px_#30D5C880] border-2 border-teal-400/40 mx-auto max-w-xs animate-fade-in" role="status" aria-live="polite">
            <span className="text-4xl mb-3 animate-float">🪐</span>
            <p className="text-lg font-bold bg-gradient-to-r from-electric-blue via-teal-400 to-electric-blue bg-clip-text text-transparent drop-shadow mb-2">No agents available</p>
            <span className="text-teal-300 text-sm mb-4">Your cosmic grid is empty. Ready to unlock more?</span>
            <a
              href="/pricing"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#1E90FF] to-[#30D5C8] text-white font-bold shadow-glow hover:from-[#30D5C8] hover:to-[#1E90FF] transition mb-2"
            >
              <span className="text-lg">🚀</span> Explore Premium Agents
            </a>
            <span className="px-3 py-1 rounded-full bg-teal-600/80 text-xs text-white shadow-glow select-none mt-2">Premium Journey</span>
          </div>
        )}
      </motion.div>

      {/* Mobile: Show all available agents in a scrollable group */}
      <div className="md:hidden">
        {/* Static fallback for very small mobile screens (< 480px) */}
        <div className="block sm:hidden">
          <div className="grid grid-cols-3 gap-3 p-2 max-w-xs mx-auto">
            {orbitingAgents.slice(0, 6).map((agent) => (
              <div
                key={`static-${agent.id}`}
                className="relative flex flex-col items-center cursor-pointer group"
                onClick={() => setSelectedAgent(agent)}
              >
                <div className="relative w-12 h-12 rounded-full border border-teal-400/30 bg-gradient-to-br from-[#1E90FF40] to-[#30D5C840] overflow-hidden">
                  <CloudinaryImage
                    agent={agent}
                    alt={agent.role || agent.name}
                    width={48}
                    height={48}
                    className="agent-image w-full h-full"
                    useCloudinary={true}
                    quality={85}
                    webp={true}
                    cloudinaryTransformation="ar_1:1,c_fill,g_face"
                    fallbackToLocal={true}
                    fallbackImagePath={getAgentImagePath(agent)}
                  />
                </div>
                <div className="text-xs text-center text-white/70 mt-1 leading-tight">
                  {agent.name.replace('Agent', '').substring(0, 8)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Animated version for larger mobile screens (480px+) */}
        <div className="hidden sm:flex flex-wrap justify-center items-center gap-3 p-4">
          {orbitingAgents.map((agent) => {
            const size = agent.tier === 'inner' ? 56 : agent.tier === 'mid' ? 68 : 80;
            return (
              <motion.div
                key={`mobile-${agent.id}`}
                className="relative group cursor-pointer flex flex-col items-center"
                tabIndex={0}
                aria-label={`Activate ${agent.name}`}
                whileHover={!shouldReduceMotion ? { scale: 1.05 } : undefined}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedAgent(agent)}
                style={{ 
                  width: size + 12,
                  willChange: 'transform'
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className={`relative rounded-full cosmic-glass cosmic-glow border-2 border-[#38bdf8cc] group-hover:border-[#30D5C8] transition-all duration-200 bg-gradient-to-br from-[#1E90FFb3] via-[#f472b680] to-[#30D5C8b3] overflow-visible mb-1`}
                  style={{ width: size, height: size }} // TODO: Replace with Tailwind/CSS if possible, but dynamic sizing may require inline style.
                >
                  <CloudinaryImage
                    agent={agent}
                    alt={agent.role || agent.name}
                    width={size}
                    height={size}
                    className="agent-image w-full h-full"
                    useCloudinary={true}
                    quality={90}
                    webp={true}
                    cloudinaryTransformation="ar_1:1,c_fill,g_face"
                    fallbackToLocal={true}
                    fallbackImagePath={getAgentImagePath(agent)}
                  />
                </div>
                <div className="text-center text-xs text-white opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-200">
                  {agent.name.replace('Agent', '')}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Agent Details Modal */}
      <AnimatePresence>
        {selectedAgent && (
          <>
            {/* Floating Avatar Animation */}
            <motion.div
              className="fixed left-1/2 top-1/2 z-[60] flex flex-col items-center justify-center pointer-events-none"
              initial={{ opacity: 0, scale: 0.7, zIndex: 60 }}
              animate={{ opacity: 1, scale: 1.22, filter: 'drop-shadow(0 0 32px #38bdf8) drop-shadow(0 0 64px #f472b6)' }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ type: 'spring', stiffness: 120, damping: 16 }}
              style={{ transform: 'translate(-50%, -50%)', willChange: 'transform, opacity' }}
            >
              <div className="relative w-40 h-40 md:w-52 md:h-52">
                <CloudinaryImage
                  agent={selectedAgent}
                  alt={selectedAgent.name}
                  width={208}
                  height={208}
                  className="agent-image w-full h-full"
                  useCloudinary={true}
                  quality={90}
                  webp={true}
                  cloudinaryTransformation="ar_1:1,c_fill,g_face"
                  fallbackToLocal={true}
                  fallbackImagePath={getAgentImagePath(selectedAgent)}
                />
                <motion.div className="absolute inset-0 rounded-full bg-teal-400/10 animate-pulse-slow" />
              </div>
            </motion.div>

            {/* Details Modal */}
            <motion.div
              className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ pointerEvents: 'auto', willChange: 'opacity' }}
              onClick={() => setSelectedAgent(null)}
              aria-label="Agent Details Modal"
            >
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
                    <CloudinaryImage
                      agent={selectedAgent}
                      alt={selectedAgent.name}
                      width={96}
                      height={96}
                      className="agent-image w-full h-full"
                      useCloudinary={true}
                      quality={90}
                      webp={true}
                      cloudinaryTransformation="ar_1:1,c_fill,g_face"
                      fallbackToLocal={true}
                      fallbackImagePath={getAgentImagePath(selectedAgent)}
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
                      <div className="flex flex-col gap-2">
                        <motion.button
                          whileHover={{ scale: 1.07 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => selectedAgent && handleAgentLaunch?.(selectedAgent)}
                          className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-glow hover:shadow-[0_0_12px_rgba(0,255,255,0.6)] hover:scale-105 transition-all duration-200"
                          aria-label={`Launch ${selectedAgent.name}`}
                        >
                          Launch {selectedAgent.name.replace('Agent', '')}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setBackstoryAgent(selectedAgent);
                            setShowBackstoryModal(true);
                            setSelectedAgent(null);
                          }}
                          className="w-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-300 font-semibold py-2 px-4 rounded-lg border border-purple-500/30 hover:border-purple-400/50 transition-all duration-200"
                          aria-label={`View ${selectedAgent.name} backstory`}
                        >
                          🦸 View Superhero Backstory
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </FocusTrap>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Agent Backstory Modal */}
      <AgentBackstoryModal
        agent={backstoryAgent}
        isOpen={showBackstoryModal}
        onClose={() => {
          setShowBackstoryModal(false);
          setBackstoryAgent(null);
        }}
      />
    </div>
  );
};

export default AgentConstellation;
