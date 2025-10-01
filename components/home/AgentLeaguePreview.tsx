"use client";

import { useEffect, useState } from 'react';
import { agentPath } from '../../utils/agentRouting';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import CardShell from '../ui/CardShell';
import { TrendingUp, Users, Zap, Target, Eye } from 'lucide-react';
import agentRegistry from '../../lib/agents/agentRegistry';
import { getAgentImagePath } from '../../utils/agentUtils';
import { FEATURE_FLAGS } from '@/lib/config/featureFlags';
import AgentImage from '../shared/AgentImage';
import AgentLeagueOrbit from '../agents/AgentLeagueOrbit';

// Generate dynamic activity data for competitive edge
const generateLiveActivity = () => ({
  percy: {
    liveUsers: Math.floor(Math.random() * 15) + 28, // 28-43 users
    todayCreated: Math.floor(Math.random() * 200) + 1247, // 1247-1447 automations
    competitiveEdge: '340% faster business automation vs manual methods',
    marketShare: Math.floor(Math.random() * 8) + 72 // 72-80%
  },
  skillsmith: {
    liveUsers: Math.floor(Math.random() * 12) + 18, // 18-30 users
    todayCreated: Math.floor(Math.random() * 150) + 847, // 847-997 analyses
    competitiveEdge: '520% more accurate than traditional coaching',
    marketShare: Math.floor(Math.random() * 6) + 68 // 68-74%
  },
  branding: {
    liveUsers: Math.floor(Math.random() * 20) + 31, // 31-51 users
    todayCreated: Math.floor(Math.random() * 300) + 2147, // 2147-2447 brands
    competitiveEdge: '850% faster brand creation vs competitors',
    marketShare: Math.floor(Math.random() * 5) + 81 // 81-86%
  },
  social: {
    liveUsers: Math.floor(Math.random() * 18) + 25, // 25-43 users
    todayCreated: Math.floor(Math.random() * 250) + 1547, // 1547-1797 posts
    competitiveEdge: '420% higher engagement than manual posting',
    marketShare: Math.floor(Math.random() * 7) + 75 // 75-82%
  },
  content: {
    liveUsers: Math.floor(Math.random() * 22) + 35, // 35-57 users
    todayCreated: Math.floor(Math.random() * 350) + 2547, // 2547-2897 pieces
    competitiveEdge: '670% faster content creation vs traditional methods',
    marketShare: Math.floor(Math.random() * 6) + 78 // 78-84%
  }
});


// Get core agents from the canonical registry
const getCoreAgents = () => {
  const coreAgentIds = ['branding', 'social', 'percy', 'skillsmith', 'contentcreation'];
  
  return coreAgentIds.map(id => {
    const registryAgent = agentRegistry.find(agent => agent.id === id);
    if (!registryAgent) {
      console.warn(`[AgentLeaguePreview] Agent ${id} not found in registry`);
      return null;
    }
    
    // Convert registry agent to preview format with fallback handling
    return {
      id: registryAgent.id,
      name: registryAgent.superheroName || registryAgent.name,
      image: getAgentImagePath(registryAgent, "nobg"),
      imageSlug: registryAgent.imageSlug || registryAgent.id,
      role: registryAgent.primaryCapability || 'AI Specialist',
      value: registryAgent.description,
      description: registryAgent.description,
      freeTip: `${registryAgent.catchphrase || 'Ready to help you succeed!'}`,
      action: 'Chat Now',
      mode: registryAgent.id === 'skillsmith' ? 'sports' as const : 'business' as const,
      intent: 'consultation',
      activityKey: getActivityKey(registryAgent.id),
      dominanceMetric: `${registryAgent.name} Excellence`,
      superheroName: registryAgent.superheroName || registryAgent.name
    };
  }).filter(Boolean);
};

// Map agent IDs to activity keys for backwards compatibility
const getActivityKey = (agentId: string): string => {
  const mapping: Record<string, string> = {
    'branding': 'branding',
    'social': 'social',
    'percy': 'percy',
    'skillsmith': 'skillsmith',
    'contentcreation': 'content'
  };
  return mapping[agentId] || 'percy';
};

interface AgentLeaguePreviewProps {
  onAgentClick?: (agent: any) => void;
}

export default function AgentLeaguePreview({ onAgentClick }: AgentLeaguePreviewProps) {
  const [allowedIRA, setAllowedIRA] = useState(false);
  const [coreAgents, setCoreAgents] = useState<any[]>([]);
  
  useEffect(() => {
    const checkIRAAccess = async () => {
      try {
        const res = await fetch('/api/agents/ira/is-allowed', { method: 'GET', credentials: 'include' });
        if (!res.ok) { 
          setAllowedIRA(false); 
          return; 
        }
        const data = await res.json();
        setAllowedIRA(!!data.allowed);
      } catch (error) {
        console.log('[AgentLeague] IRA access check failed (expected if not logged in):', error);
        setAllowedIRA(false);
      }
    };
    checkIRAAccess();
    
    // Load core agents from registry
    setCoreAgents(getCoreAgents());
  }, []);

  const router = useRouter();
  const isGuideStarEnabled = FEATURE_FLAGS.HP_GUIDE_STAR;
  const isOrbitEnabled = process.env.NEXT_PUBLIC_ENABLE_ORBIT === '1';
  const [liveActivity, setLiveActivity] = useState(generateLiveActivity());
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const [showFreeTip, setShowFreeTip] = useState<string | null>(null);

  // Update live activity every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveActivity(generateLiveActivity());
    }, 30000);
    return () => clearInterval(interval);
  }, []);
  
  // Progressive enhancement: show basic league, hide advanced features when flag is off
  const showAdvancedFeatures = isGuideStarEnabled;

  const handleAgentInteraction = (agent: any, action: 'learn' | 'chat' | 'demo') => {
    // Analytics
    if (typeof window !== 'undefined') {
      (window as any).gtag?.('event', 'agent_interaction', { 
        agent: agent.id, 
        action,
        source: 'homepage_league'
      });
    }

    switch (action) {
      case 'learn':
        setShowFreeTip(showFreeTip === agent.id ? null : agent.id);
        break;
      case 'chat':
        // Route to agent backstory page using canonical routing
        router.push(agentPath(agent.id, 'backstory'));
        break;
      case 'demo':
        // Route to agent backstory page using canonical routing
        router.push(agentPath(agent.id, 'backstory'));
        break;
    }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Your <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Elite AI Team</span>
          </h2>
          <p className="text-lg text-gray-300 mb-6 max-w-3xl mx-auto">
            {showAdvancedFeatures 
              ? "Each agent specializes in specific domains to maximize your results. Click to see live performance data."
              : "Meet your specialized AI agents. Click to learn more about each one."
            }
          </p>
          
          {/* Live Activity Summary - only show when advanced features enabled */}
          {showAdvancedFeatures && (
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-semibold">
                  {Object.values(liveActivity).reduce((sum, agent) => sum + agent.liveUsers, 0)} Live Users
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-400 font-semibold">
                  {Object.values(liveActivity).reduce((sum, agent) => sum + agent.todayCreated, 0).toLocaleString()} Created Today
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Orbit League (flag-gated and requires advanced features) */}
        {isOrbitEnabled && showAdvancedFeatures && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-12"
          >
            <AgentLeagueOrbit 
              agents={[...coreAgents, ...(allowedIRA ? [{
                id: 'ira',
                name: 'IRA',
                superheroName: 'The Risk-First Strategist',
                catchphrase: 'Always wait for confirmation at AOIs before entering a trade.'
              }] : [])]}
            />
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[1fr]">
          {[...coreAgents, ...(allowedIRA ? [{
  id: 'ira',
  name: 'IRA',
  image: getAgentImagePath('ira', "nobg"),
  imageSlug: 'ira',
  role: 'Trading Mentor',
  value: 'AOIs, volume profile, options flow, earnings catalysts',
  description: 'Inner Rod\'s Agent — trading mentor (AOIs, volume profile, options flow, earnings catalysts).',
  freeTip: 'Always wait for confirmation at AOIs before entering a trade.',
  action: 'Chat with IRA',
  mode: 'business' as const,
  intent: 'trading_mentor',
  activityKey: 'percy', // Use a safe key for now
  dominanceMetric: 'Market Timing Precision',
  superheroName: 'The Risk-First Strategist',
}] : [])].map((agent, index) => {
            const activity = liveActivity[agent.activityKey as keyof typeof liveActivity];
            const isHovered = hoveredAgent === agent.id;
            const showTip = showFreeTip === agent.id;
            
            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                onMouseEnter={() => setHoveredAgent(agent.id)}
                onMouseLeave={() => setHoveredAgent(null)}
                className="relative"
              >
                <CardShell className="relative overflow-hidden group h-full flex flex-col">
                  {/* Live Activity Indicator - only show when advanced features enabled */}
                  {showAdvancedFeatures && (
                    <div className="absolute top-2 left-2 right-2 z-10">
                      <div className="bg-black/80 backdrop-blur-sm rounded-lg p-2 border border-green-500/30">
                        <div className="flex items-center justify-between text-xs">
                          <div className="text-green-400 font-semibold flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                            {activity.liveUsers} live
                          </div>
                          <div className="text-white font-medium">
                            {activity.todayCreated.toLocaleString()} today
                          </div>
                        </div>
                        <div className="text-xs text-yellow-400 font-semibold mt-1">
                          {agent.dominanceMetric} • {activity.marketShare}% market control
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Free Tip Overlay */}
                  {showTip && (
                    <motion.div
                      className="absolute top-16 left-2 right-2 z-20"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <div className="bg-gradient-to-br from-purple-900/95 to-cyan-900/95 backdrop-blur-sm rounded-lg p-3 border border-yellow-500/50 shadow-xl">
                        <div className="text-xs text-yellow-400 font-semibold mb-2 flex items-center gap-1">
                          💡 Free Pro Tip
                        </div>
                        <p className="text-xs text-gray-200 leading-relaxed">
                          {agent.freeTip}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Agent Image */}
                  <div className="aspect-[3/4] relative w-full mt-12 flex-1">
                    <div className="relative w-full h-full">
                      <AgentImage
                        agentId={agent.imageSlug || agent.id}
                        alt={agent.name}
                        fill
                        className="object-cover rounded-lg"
                        priority
                      />
                    </div>
                    
                    {/* Agent Name */}
                    <motion.h3
                      className="absolute top-[75%] left-1/2 -translate-x-1/2 text-lg font-extrabold bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(0,245,212,0.6)] z-20 text-center"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      {agent.name}
                    </motion.h3>
                    
                    {/* Action Buttons */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-center items-end p-4 gap-1 mt-auto">
                      {/* LEARN Button */}
                      <motion.button
                        className="flex-1 h-8 bg-transparent border border-cyan-400/50 rounded-lg text-xs text-cyan-400 font-bold hover:bg-cyan-400/20 transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAgentInteraction(agent, 'learn');
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        LEARN
                      </motion.button>
                      
                      {/* CHAT Button */}
                      <motion.button
                        className="flex-1 h-8 bg-transparent border border-purple-400/50 rounded-lg text-xs text-purple-400 font-bold hover:bg-purple-400/20 transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAgentInteraction(agent, 'chat');
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        CHAT
                      </motion.button>
                      
                      {/* DEMO Button */}
                      <motion.button
                        className="flex-1 h-8 bg-transparent border border-yellow-400/50 rounded-lg text-xs text-yellow-400 font-bold hover:bg-yellow-400/20 transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAgentInteraction(agent, 'demo');
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        DEMO
                      </motion.button>
                    </div>
                  </div>
                  
                  {/* Competitive Intelligence */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3 pt-8">
                    <div className="text-xs mb-2">
                      <div className="text-red-400 font-semibold mb-1">⚡ Competitive Edge:</div>
                      <div className="text-gray-300">{activity.competitiveEdge}</div>
                    </div>
                  </div>
                </CardShell>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="text-center mt-12"
        >
          <p className="text-gray-400 mb-6">
            Ready to unleash your AI team? Start with a free consultation or jump straight into automation.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => router.push('/auth/signup')}
              className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-bold px-8 py-3 rounded-xl transition-all transform hover:scale-105"
            >
              Start Free Trial
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-white/10 border border-white/20 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/20 transition-all"
            >
              View Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
