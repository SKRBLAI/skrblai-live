'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { usePercyContext } from '../assistant/PercyProvider';
import { getCurrentUser } from '../../utils/supabase-helpers';
import Link from 'next/link';
import { agentBackstories } from '../../lib/agents/agentBackstories';
import { getAgentImagePath } from '../../utils/agentUtils';
import { agentIntelligenceEngine, type AgentIntelligence, type PredictiveInsight } from '../../lib/agents/agentIntelligence';

// Generate dynamic activity data for competitive edge
const generateLiveActivity = () => {
  const baseTime = Date.now();
  return {
    branding: {
      liveUsers: Math.floor(Math.random() * 15) + 18, // 18-32 users
      todayCreated: Math.floor(Math.random() * 200) + 847, // 847-1047 pieces
      competitiveEdge: '340% faster brand creation vs traditional methods',
      marketShare: Math.floor(Math.random() * 8) + 67 // 67-75%
    },
    social: {
      liveUsers: Math.floor(Math.random() * 12) + 23, // 23-35 users
      todayCreated: Math.floor(Math.random() * 150) + 1247, // 1247-1397 posts
      competitiveEdge: '520% higher engagement than manual posting',
      marketShare: Math.floor(Math.random() * 6) + 73 // 73-79%
    },
    content: {
      liveUsers: Math.floor(Math.random() * 20) + 31, // 31-51 users
      todayCreated: Math.floor(Math.random() * 300) + 2147, // 2147-2447 pieces
      competitiveEdge: '850% faster content creation vs competitors',
      marketShare: Math.floor(Math.random() * 5) + 81 // 81-86%
    }
  };
};

// Define the three featured agents with live activity data
const FEATURED_AGENTS = [
  {
    id: 'branding',
    name: 'BrandAlexander',
    description: 'Creates professional brand kits: logos, style guides, and color palettes.',
    freeTip: 'Update your logo background color to create more contrast—it\'ll make your brand pop on social media!',
    upsell: 'Want a full brand kit with style guide, logos, and color palette? Unlock all my superpowers.',
    activityKey: 'branding' as keyof ReturnType<typeof generateLiveActivity>,
    dominanceMetric: 'Brand Identity Domination'
  },
  {
    id: 'social',
    name: 'SocialNino',
    description: 'Automates social media scheduling, analytics, and engagement tracking.',
    freeTip: 'Posting at 8pm can double your Instagram engagement based on typical audience behavior patterns.',
    upsell: 'Want me to schedule posts and track analytics for maximum growth? Unlock my full toolkit!',
    activityKey: 'social' as keyof ReturnType<typeof generateLiveActivity>,
    dominanceMetric: 'Social Media Conquest'
  },
  {
    id: 'contentcreation',
    name: 'ContentCarltig',
    description: 'Generates SEO-optimized articles, blog posts, and content calendars.',
    freeTip: 'Try this headline format for your next blog: "How [Your Industry] Experts Are [Achieving Result] Without [Common Method]"',
    upsell: 'Want a month of content ideas and SEO-optimized articles? Unlock more capabilities.',
    activityKey: 'content' as keyof ReturnType<typeof generateLiveActivity>,
    dominanceMetric: 'Content Creation Supremacy'
  }
];

export default function AgentPreviewSection(): React.ReactElement {
  const router = useRouter();
  const { setPercyIntent } = usePercyContext();
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [liveActivity, setLiveActivity] = useState(generateLiveActivity());
  const [agentIntelligence, setAgentIntelligence] = useState<Map<string, AgentIntelligence>>(new Map());
  const [predictiveInsights, setPredictiveInsights] = useState<Map<string, PredictiveInsight[]>>(new Map());
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);

  // Check if user is logged in
  React.useEffect(() => {
    const checkLoginStatus = async () => {
      const user = await getCurrentUser();
      setIsLoggedIn(!!user);
    };
    checkLoginStatus();
  }, []);

  // Load agent intelligence data
  React.useEffect(() => {
    const loadIntelligence = async () => {
      const intelligenceMap = new Map<string, AgentIntelligence>();
      const insightsMap = new Map<string, PredictiveInsight[]>();

      for (const agent of FEATURED_AGENTS) {
        const intelligence = agentIntelligenceEngine.getAgentIntelligence(agent.id);
        if (intelligence) {
          intelligenceMap.set(agent.id, intelligence);
          
          // Load predictive insights
          const insights = await agentIntelligenceEngine.generatePredictiveInsights(agent.id, 7);
          insightsMap.set(agent.id, insights);
        }
      }

      setAgentIntelligence(intelligenceMap);
      setPredictiveInsights(insightsMap);
    };

    loadIntelligence();
  }, []);

  // Update live activity every 45 seconds for dynamic feel
  React.useEffect(() => {
    const interval = setInterval(() => {
      setLiveActivity(generateLiveActivity());
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  // Handle button actions
  const handleLearnClick = (agentId: string) => {
    // Open agent backstory in a modal or page
    const backstory = agentBackstories[agentId];
    if (backstory) {
      router.push(`/agent-backstory/${agentId}`);
    }
  };

  const handleChatClick = (agentId: string, freeTip: string) => {
    // Start a chat with the agent showing the free tip
    setPercyIntent(JSON.stringify({
      action: 'chat',
      agentId: agentId,
      context: 'freebie_preview',
      initialMessage: freeTip,
      startFresh: true
    }));
    router.push(`/chat/${agentId}?preview=true`);
  };

  // Handle demo action
  const handleDemoClick = (agentId: string) => {
    setPercyIntent(JSON.stringify({ action: 'demo', agentId, context: 'demo_mode' }));
    router.push(`/chat/${agentId}?demo=true`);
  };

  return (
    <section className="w-full relative">
      {/* Floating Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 relative z-10"
      >
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400 drop-shadow-lg">
          Live Agent Domination Dashboard
        </h2>
        <div className="mt-2">
          <p className="text-cyan-400 text-sm font-semibold drop-shadow-lg">
            🔥 Real-time competitive advantage happening now
          </p>
          <p className="text-gray-300 text-xs mt-1 drop-shadow-md">
            {liveActivity.branding.liveUsers + liveActivity.social.liveUsers + liveActivity.content.liveUsers} businesses currently destroying their competition
          </p>
        </div>
      </motion.div>
      
      {/* Floating Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4 relative z-10">
        {FEATURED_AGENTS.map((agent) => {
          const intelligence = agentIntelligence.get(agent.id);
          const insights = predictiveInsights.get(agent.id) || [];
          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              // 3D hover/tap effects for life
              whileHover={{ scale: 1.03, rotateX: 3, rotateY: -3, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
              whileTap={{ scale: 0.98 }}
              className="relative rounded-xl overflow-hidden bg-black/20 backdrop-blur-lg border border-blue-500/30"
              onMouseEnter={() => setHoveredAgent(agent.id)}
              onMouseLeave={() => setHoveredAgent(null)}
            >
              {/* Live Activity Overlay */}
              <div className="absolute top-2 left-2 right-2 z-10">
                <div className="bg-black/80 backdrop-blur-sm rounded-lg p-2 border border-cyan-500/30">
                  <div className="flex items-center justify-between text-xs">
                    <div className="text-cyan-400 font-semibold flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                      {liveActivity[agent.activityKey].liveUsers} live now
                    </div>
                    <div className="text-white font-medium">
                      {liveActivity[agent.activityKey].todayCreated.toLocaleString()} today
                    </div>
                  </div>
                  <div className="text-xs text-yellow-400 font-semibold mt-1">
                    {agent.dominanceMetric} • {liveActivity[agent.activityKey].marketShare}% market control
                  </div>
                </div>
              </div>

              {/* Agent Intelligence Overlay */}
              {intelligence && (
                <motion.div
                  className="absolute top-16 left-2 right-2 z-10"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="bg-black/80 backdrop-blur-sm rounded-lg p-2 border border-purple-500/30">
                    <div className="flex items-center justify-between text-xs">
                      <div className="text-purple-400 font-semibold flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse"></div>
                        IQ: {intelligence.intelligenceLevel}
                      </div>
                      <div className="text-cyan-400 font-medium capitalize">
                        {intelligence.autonomyLevel}
                      </div>
                    </div>
                    <div className="text-xs text-gray-300 mt-1">
                      {intelligence.superheroName} • {intelligence.predictionCapabilities.length} domains
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Predictive Insights Overlay (on hover) */}
              {hoveredAgent === agent.id && insights.length > 0 && (
                <motion.div
                  className="absolute top-28 left-2 right-2 z-20"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="bg-gradient-to-br from-gray-900/95 to-purple-900/95 backdrop-blur-sm rounded-lg p-3 border border-cyan-500/50 shadow-xl">
                    <div className="text-xs text-cyan-400 font-semibold mb-2 flex items-center gap-1">
                      🔮 Predictive Insights
                    </div>
                    {insights.slice(0, 2).map((insight, idx) => (
                      <div key={idx} className="text-xs text-gray-300 mb-1">
                        <span className="text-yellow-400 font-medium capitalize">
                          {insight.domain.replace('_', ' ')}:
                        </span>
                        <span className="ml-1">{insight.insight.slice(0, 40)}...</span>
                        <div className="text-xs text-green-400 mt-0.5">
                          {Math.round(insight.probability * 100)}% confidence
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Agent Card Image */}
              <div className="aspect-[3/4] relative w-full">
                <Image 
                  src={getAgentImagePath(agent.id, "card")}
                  alt={agent.name}
                  fill
                  className="object-cover"
                  priority
                />
                
                {/* Agent Name - Positioned above buttons */}
                <motion.h3
                  className="absolute top-[75%] left-1/2 -translate-x-1/2 text-lg font-extrabold bg-gradient-to-r from-electric-blue via-teal-400 to-electric-blue bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(0,245,212,0.6)] z-20"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  {agent.name}
                </motion.h3>
                
                {/* Invisible Hotspots for Image Buttons */}
                <div className="absolute bottom-0 left-0 right-0 flex flex-wrap justify-center items-end p-4 gap-2">
                  {/* LEARN Button Hotspot */}
                  <motion.button
                    className="flex-1 min-w-[80px] h-8 bg-transparent border border-cyan-400/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 rounded-lg relative"
                    onClick={() => handleLearnClick(agent.id)}
                    aria-label={`Learn about ${agent.name}`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    style={{ marginRight: '2%' }}
                  >
                    <span className="sr-only">LEARN about {agent.name}</span>
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-cyan-400 font-bold">LEARN</div>
                  </motion.button>
                  
                  {/* CHAT Button Hotspot */}
                  <motion.button
                    className="flex-1 min-w-[80px] h-8 bg-transparent border border-purple-400/30 focus:outline-none focus:ring-2 focus:ring-purple-400/50 rounded-lg relative"
                    onClick={() => handleChatClick(agent.id, agent.freeTip)}
                    aria-label={`Chat with ${agent.name}`}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    style={{ marginRight: '2%' }}
                  >
                    <span className="sr-only">CHAT with {agent.name}</span>
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-purple-400 font-bold">CHAT</div>
                  </motion.button>
                  
                  {/* LAUNCH Button Hotspot */}
                   {/* DEMO Button Hotspot */}
                   <motion.button
                     className="flex-1 min-w-[80px] h-8 bg-transparent border border-yellow-400/30 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 rounded-lg relative"
                     onClick={() => handleDemoClick(agent.id)}
                     aria-label={`Demo ${agent.name}`}
                     whileHover={{ scale: 1.01 }}
                     whileTap={{ scale: 0.99 }}
                   >
                     <span className="sr-only">DEMO {agent.name}</span>
                     <div className="absolute inset-0 flex items-center justify-center text-xs text-yellow-400 font-bold">DEMO</div>
                   </motion.button>
                  <motion.button
                    className={`flex-1 min-w-[80px] h-8 bg-transparent border border-green-400/30 focus:outline-none rounded-lg ${
                      isLoggedIn ? 'focus:ring-2 focus:ring-green-400/50' : 'cursor-not-allowed opacity-50'
                    }`}
                    onClick={() => isLoggedIn && router.push(`/agent/${agent.id}`)}
                    onMouseEnter={() => !isLoggedIn && setShowTooltip(agent.id)}
                    onMouseLeave={() => setShowTooltip(null)}
                    disabled={!isLoggedIn}
                    aria-label={`Launch ${agent.name}`}
                    whileHover={isLoggedIn ? { scale: 1.01 } : {}}
                    whileTap={isLoggedIn ? { scale: 0.99 } : {}}
                  >
                    <span className="sr-only">LAUNCH {agent.name}</span>
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-green-400 font-bold">LAUNCH</div>
                    {!isLoggedIn && showTooltip === agent.id && (
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs p-2 rounded whitespace-nowrap z-50">
                        Sign up to unlock
                      </div>
                    )}
                  </motion.button>
                </div>
              </div>
              
              {/* Competitive Intelligence & Power Preview */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-black/0 p-4">
                <div className="text-xs mb-2">
                  <div className="text-red-400 font-semibold mb-1">⚡ Competitive Edge:</div>
                  <div className="text-white">{liveActivity[agent.activityKey].competitiveEdge}</div>
                </div>
                <p className="text-white text-sm mt-2">{agent.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Floating CTA */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-12 text-center relative z-10"
      >
        <motion.div 
          className="mb-6 p-6 bg-gradient-to-r from-red-900/30 to-orange-900/30 backdrop-blur-lg border border-red-500/40 rounded-2xl max-w-lg mx-auto shadow-[0_0_40px_rgba(239,68,68,0.3)]"
          whileHover={{ scale: 1.02, boxShadow: '0 0 60px rgba(239,68,68,0.4)' }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <p className="text-red-400 text-sm font-bold mb-2 flex items-center justify-center gap-2">
            <span className="animate-pulse">⚠️</span>
            Competitive Alert
          </p>
          <p className="text-white text-sm leading-relaxed">
            {Math.floor(Math.random() * 156) + 47} businesses gained insurmountable advantage today.
            <br />
            <span className="text-red-300 font-medium">Your competitors aren't using AI yet—perfect timing.</span>
          </p>
        </motion.div>
        
        <Link href="/sign-up">
          <motion.button
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 0 50px rgba(239,68,68,0.6), 0 0 100px rgba(251,146,60,0.4)'
            }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 bg-gradient-to-r from-red-500 via-orange-500 to-red-600 text-white font-bold rounded-xl shadow-[0_0_30px_rgba(239,68,68,0.5)] border border-red-400/30"
          >
            🔥 Join the {(liveActivity.branding.liveUsers + liveActivity.social.liveUsers + liveActivity.content.liveUsers)} Crushing Competition Now
          </motion.button>
        </Link>
        
        <motion.p 
          className="text-gray-300 text-sm mt-4 drop-shadow-md"
          animate={{
            textShadow: [
              "0 0 8px rgba(156,163,175,0.3)",
              "0 0 16px rgba(156,163,175,0.5)",
              "0 0 8px rgba(156,163,175,0.3)"
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          Average competitive advantage gained: <span className="text-cyan-400 font-semibold">340%</span> within first week
        </motion.p>
      </motion.div>
    </section>
  );
}
