/**
 * ARCHIVED: Legacy Agent Constellation Component
 * 
 * This component is archived for future gamification features including:
 * - Agent orbits and constellation views
 * - XP and collectibles system
 * - Visual agent interactions
 * - Achievement unlocks
 * 
 * IMPORTANT: This is archived legacy code - DO NOT DELETE
 * Future gamification features will build upon this foundation.
 * 
 * @version 1.0.0 (Archived)
 * @originalLocation components/agents/AgentConstellation.tsx
 * @archiveDate 2025-01-05
 * @futureUse Gamification, Agent Collection, XP System
 */

"use client";

import React, { useState, useEffect } from 'react';
import type { Agent } from '@/types/agent';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getAgentImagePath } from '@/utils/agentUtils';
// More archived imports - commented out to prevent build issues  
// import FocusTrap from 'focus-trap-react';
// import { createClient } from '@supabase/supabase-js';
// Archived imports - commented out to prevent build issues
// import { triggerEmailFromAnalytics } from '@/lib/analytics/emailTriggers';
// import { emailAutomation } from '@/lib/email/simpleAutomation';
// import AgentBackstoryModal from '../AgentBackstoryModal';
// import CloudinaryImage from '@/components/ui/CloudinaryImage';

// =============================================================================
// ARCHIVED CONSTELLATION CONSTANTS & TYPES
// =============================================================================

// Constants for orbit mechanics (preserved for gamification)
const TIER_RADII = { inner: 90, mid: 165, outer: 240 } as const;
type OrbitTier = keyof typeof TIER_RADII;

interface OrbitAgent extends Agent {
  tier: OrbitTier;
  angle: number;
  speed: number;
  x: number;
  y: number;
  zIndex: number;
  scale: number;
  opacity: number;
  glowIntensity: number;
}

interface AgentConstellationProps {
  agents?: Agent[];
  selectedAgent?: Agent | null;
  setSelectedAgent?: (agent: Agent | null) => void;
  handleAgentLaunch?: (agent: Agent) => Promise<void>;
  recommendedAgentIds?: string[];
}

// All Percy-related ids/names for filtering (preserved for gamification)
const PERCY_IDS = [
  'PercyAgent', 'PercySyncAgent', 'percy', 'percy-agent', 'percySync', 'percy-sync'
];
const PERCY_NAMES = ['percy', 'Percy'];

// =============================================================================
// ARCHIVED ORBIT MECHANICS (PRESERVED FOR GAMIFICATION)
// =============================================================================

/**
 * ARCHIVED: Legacy orbit assignment logic
 * Preserved for future gamification features like agent collections
 */
const getOrbitTier = (index: number, total: number): OrbitTier => {
  const percentage = index / total;
  if (percentage < 0.3) return 'inner';
  if (percentage < 0.7) return 'mid';
  return 'outer';
};

/**
 * ARCHIVED: Legacy orbit speed calculation
 * Preserved for animated agent collections in gamification
 */
const getOrbitSpeed = (tier: OrbitTier, index: number): number => {
  const baseSpeed = {
    inner: 0.3,
    mid: 0.2, 
    outer: 0.1
  }[tier];
  
  return baseSpeed + (Math.sin(index * 0.5) * 0.1);
};

/**
 * ARCHIVED: Legacy orbit angle calculation
 * Preserved for constellation layouts in gamification
 */
const getOrbitAngle = (index: number, total: number, tier: OrbitTier): number => {
  const tierAgents = Math.ceil(total / 3);
  const tierIndex = index % tierAgents;
  return (tierIndex / tierAgents) * 360 + (tier === 'mid' ? 60 : 0);
};

/**
 * ARCHIVED: Legacy position calculation with physics
 * Preserved for complex agent movement in gamification
 */
const calculatePosition = (
  centerX: number, 
  centerY: number, 
  radius: number, 
  angle: number, 
  time: number, 
  speed: number
): { x: number; y: number } => {
  const dynamicAngle = angle + (time * speed);
  const radians = (dynamicAngle * Math.PI) / 180;
  
  return {
    x: centerX + radius * Math.cos(radians),
    y: centerY + radius * Math.sin(radians)
  };
};

// =============================================================================
// ARCHIVED CONSTELLATION COMPONENT (PRESERVED FOR GAMIFICATION)
// =============================================================================

/**
 * ARCHIVED: Legacy Agent Constellation Component
 * 
 * This entire component is preserved for future gamification features.
 * Contains orbit mechanics, visual effects, and interaction patterns
 * that will be reused for agent collection and XP systems.
 */
const ArchivedAgentConstellation: React.FC<AgentConstellationProps> = ({
  agents = [],
  selectedAgent,
  setSelectedAgent,
  handleAgentLaunch,
  recommendedAgentIds = [],
}) => {
  // Archived state management (preserved for gamification)
  const [orbitingAgents, setOrbitingAgents] = useState<OrbitAgent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<OrbitAgent[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [showBackstoryModal, setShowBackstoryModal] = useState(false);
  const [backstoryAgent, setBackstoryAgent] = useState<Agent | null>(null);
  const [time, setTime] = useState(0);
  const [centerX, setCenterX] = useState(0);
  const [centerY, setCenterY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  
  const shouldReduceMotion = useReducedMotion();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  // Archived initialization logic (preserved for gamification)
  useEffect(() => {
    const initializeOrbitingAgents = () => {
      const filteredAgentList = agents
        .filter(agent => agent.displayInOrbit !== false)
        .filter(agent => !PERCY_IDS.includes(agent.id) && !PERCY_NAMES.includes(agent.name));

      const orbitAgents: OrbitAgent[] = filteredAgentList.map((agent, index) => {
        const tier = getOrbitTier(index, filteredAgentList.length);
        const angle = getOrbitAngle(index, filteredAgentList.length, tier);
        const speed = getOrbitSpeed(tier, index);
        
        return {
          ...agent,
          tier,
          angle,
          speed,
          x: 0,
          y: 0,
          zIndex: tier === 'inner' ? 30 : tier === 'mid' ? 20 : 10,
          scale: tier === 'inner' ? 1.1 : tier === 'mid' ? 1.0 : 0.9,
          opacity: 1.0,
          glowIntensity: recommendedAgentIds.includes(agent.id) ? 1.5 : 1.0
        };
      });

      setOrbitingAgents(orbitAgents);
      setFilteredAgents(orbitAgents);
    };

    if (agents.length > 0) {
      initializeOrbitingAgents();
    }
  }, [agents, recommendedAgentIds]);

  // Archived animation loop (preserved for gamification)
  useEffect(() => {
    if (shouldReduceMotion) return;
    
    const interval = setInterval(() => {
      setTime(prevTime => prevTime + 0.016); // ~60fps
    }, 16);

    return () => clearInterval(interval);
  }, [shouldReduceMotion]);

  // Archived position updates (preserved for gamification)
  useEffect(() => {
    if (orbitingAgents.length === 0) return;

    const updatedAgents = orbitingAgents.map(agent => {
      const radius = TIER_RADII[agent.tier];
      const position = calculatePosition(centerX, centerY, radius, agent.angle, time, agent.speed);
      
      return {
        ...agent,
        x: position.x,
        y: position.y
      };
    });

    setFilteredAgents(updatedAgents);
  }, [orbitingAgents, centerX, centerY, time]);

  // Archived responsive handling (preserved for gamification)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setCenterX(window.innerWidth / 2);
      setCenterY(window.innerHeight / 2);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Archived interaction handlers (preserved for gamification)
  const handleAgentClick = (agent: Agent) => {
    if (isMobile) {
      setBackstoryAgent(agent);
      setShowBackstoryModal(true);
    } else {
      setSelectedAgent?.(agent);
      handleAgentSelection(agent);
    }
  };

  const handleAgentSelection = async (agent: Agent) => {
    // Archived analytics logic (preserved for gamification metrics)
    // Commented out to prevent build issues
    /*
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      if (user?.email) {
        await triggerEmailFromAnalytics(
          'agent_launch',
          user.id,
          user.email,
          user.role || 'client',
          { agentName: agent.name, agentId: agent.id }
        );
      }
    } catch (error) {
      console.error('[ArchivedConstellation] Analytics error:', error);
    }
    */
  };

  // Archived error handling (preserved for gamification)
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('[ArchivedConstellation] JavaScript Error:', {
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
      console.error('[ArchivedConstellation] Unhandled Promise Rejection:', {
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

  // =============================================================================
  // ARCHIVED RENDER LOGIC (PRESERVED FOR GAMIFICATION)
  // =============================================================================

  if (!isVisible || filteredAgents.length === 0) {
    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="text-gray-400 text-lg">
          🌌 Agent Constellation Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Archived cosmic background effects (preserved for gamification) */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-cyan-500 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-32 h-32 bg-pink-500 rounded-full filter blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Archived constellation grid (preserved for gamification) */}
      <div className="absolute inset-0">
        <svg width="100%" height="100%" className="opacity-20">
          <defs>
            <pattern id="constellation-grid" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
              <circle cx="25" cy="25" r="1" fill="white" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#constellation-grid)" />
        </svg>
      </div>

      {/* Archived orbiting agents (preserved for gamification) */}
      <div className="relative w-full h-full">
        {filteredAgents.map((agent, index) => (
          <motion.div
            key={agent.id}
            className="absolute cursor-pointer"
            style={{
              left: agent.x - 30,
              top: agent.y - 30,
              zIndex: agent.zIndex,
              transform: `scale(${agent.scale})`,
              opacity: agent.opacity
            }}
            whileHover={{ 
              scale: agent.scale * 1.2, 
              zIndex: 100,
              filter: 'drop-shadow(0 0 20px rgba(139, 69, 199, 0.8))'
            }}
            whileTap={{ scale: agent.scale * 0.9 }}
            onClick={() => handleAgentClick(agent)}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: agent.opacity, 
              scale: agent.scale,
              filter: `drop-shadow(0 0 ${agent.glowIntensity * 10}px rgba(139, 69, 199, ${agent.glowIntensity * 0.5}))`
            }}
            transition={{ 
              duration: 0.5, 
              delay: index * 0.1,
              type: "spring",
              stiffness: 100
            }}
          >
            {/* Archived agent avatar (preserved for gamification) */}
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-purple-400/50 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm">
              {agent.imageSlug ? (
                // <CloudinaryImage component commented out to prevent build issues
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800 text-2xl">
                  {agent.emoji || '🤖'}
                </div>
                /*
                <CloudinaryImage
                  src={getAgentImagePath(agent)}
                  alt={agent.name}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
                */
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  {agent.emoji || '🤖'}
                </div>
              )}
              
              {/* Archived agent glow effect (preserved for gamification) */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/30 to-transparent rounded-full"></div>
              
              {/* Archived premium indicator (preserved for gamification) */}
              {agent.premium && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white">✨</span>
                </div>
              )}
              
              {/* Archived recommendation glow (preserved for gamification) */}
              {recommendedAgentIds.includes(agent.id) && (
                <div className="absolute inset-0 animate-pulse">
                  <div className="w-full h-full border-2 border-cyan-400 rounded-full animate-ping"></div>
                </div>
              )}
            </div>

            {/* Archived agent name tooltip (preserved for gamification) */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="bg-gray-900/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {agent.name}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Archived orbit paths visualization (preserved for gamification) */}
      <div className="absolute inset-0 pointer-events-none">
        <svg width="100%" height="100%" className="opacity-10">
          {Object.entries(TIER_RADII).map(([tier, radius]) => (
            <circle
              key={tier}
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="none"
              stroke="white"
              strokeWidth="1"
              strokeDasharray="5,5"
            />
          ))}
        </svg>
      </div>

      {/* Archived selected agent modal (preserved for gamification) */}
      <AnimatePresence>
        {selectedAgent && setSelectedAgent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
              onClick={() => setSelectedAgent(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
            >
              {/* <FocusTrap> commented out to prevent build issues */}
              <div>
                <div className="bg-gradient-to-br from-slate-800/95 to-purple-900/95 backdrop-blur-xl rounded-2xl p-8 max-w-md border border-purple-500/30 shadow-2xl">
                  {/* Close button */}
                  <button
                    onClick={() => setSelectedAgent(null)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl focus:outline-none"
                    aria-label="Close agent details"
                  >
                    ×
                  </button>

                  {/* Agent details */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-purple-400/50">
                      {selectedAgent.imageSlug ? (
                        <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                          {selectedAgent.emoji || '🤖'}
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                          {selectedAgent.emoji || '🤖'}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{selectedAgent.name}</h3>
                      <p className="text-purple-300 text-sm">{selectedAgent.category}</p>
                    </div>
                  </div>

                  <p className="text-gray-300 mb-6 leading-relaxed">
                    {selectedAgent.description}
                  </p>

                  {/* Action buttons */}
                  <div className="flex flex-col gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => selectedAgent && handleAgentLaunch?.(selectedAgent)}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
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
              {/* </FocusTrap> */}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Archived Agent Backstory Modal (preserved for gamification) */}
      {/* AgentBackstoryModal commented out to prevent build issues
      <AgentBackstoryModal
        agent={backstoryAgent}
        isOpen={showBackstoryModal}
        onClose={() => {
          setShowBackstoryModal(false);
          setBackstoryAgent(null);
        }}
      />
      */}
    </div>
  );
};

// =============================================================================
// ARCHIVED EXPORT & DOCUMENTATION
// =============================================================================

/**
 * ARCHIVED COMPONENT DOCUMENTATION
 * 
 * This component contains valuable patterns for future gamification:
 * 
 * 1. ORBIT MECHANICS:
 *    - Multi-tier orbital systems (inner/mid/outer)
 *    - Physics-based movement calculations
 *    - Speed and angle variations for visual interest
 * 
 * 2. VISUAL EFFECTS:
 *    - Glow effects and recommendations highlighting
 *    - Cosmic background animations
 *    - Constellation grid patterns
 *    - Premium indicators and status badges
 * 
 * 3. INTERACTION PATTERNS:
 *    - Agent selection and modal presentation
 *    - Hover effects and scaling animations
 *    - Touch-friendly mobile interactions
 * 
 * 4. PERFORMANCE OPTIMIZATIONS:
 *    - Reduced motion for accessibility
 *    - Efficient position calculations
 *    - Error boundary patterns
 * 
 * 5. GAMIFICATION POTENTIAL:
 *    - Agent collection mechanics
 *    - XP and progression systems
 *    - Achievement unlocks
 *    - Constellation completion tracking
 *    - Agent rarity and discovery
 * 
 * FUTURE INTEGRATION NOTES:
 * - This can be re-enabled for "Agent Collection" mode
 * - Orbit mechanics can be used for agent progression visualization
 * - Visual effects can enhance agent unlocking ceremonies
 * - Modal patterns can be extended for agent customization
 */

export default ArchivedAgentConstellation;

// Export utilities that may be useful for gamification
export {
  TIER_RADII,
  getOrbitTier,
  getOrbitSpeed,
  getOrbitAngle,
  calculatePosition,
  type OrbitAgent,
  type OrbitTier
};

console.log('[AgentConstellationArchive] Legacy component preserved for gamification 🌌'); 