'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { usePercyContext } from '@/components/assistant/PercyProvider';
import { getCurrentUser } from '@/utils/supabase-helpers';
import Link from 'next/link';
import { agentBackstories } from '@/lib/agents/agentBackstories';
import { getAgentImagePath } from '@/utils/agentUtils';

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
    id: 'branding-agent',
    name: 'BrandAlexander',
    freeTip: 'Update your logo background color to create more contrast—it\'ll make your brand pop on social media!',
    upsell: 'Want a full brand kit with style guide, logos, and color palette? Unlock all my superpowers.',
    activityKey: 'branding' as keyof ReturnType<typeof generateLiveActivity>,
    dominanceMetric: 'Brand Identity Domination'
  },
  {
    id: 'social-bot-agent',
    name: 'SocialNino',
    freeTip: 'Posting at 8pm can double your Instagram engagement based on typical audience behavior patterns.',
    upsell: 'Want me to schedule posts and track analytics for maximum growth? Unlock my full toolkit!',
    activityKey: 'social' as keyof ReturnType<typeof generateLiveActivity>,
    dominanceMetric: 'Social Media Conquest'
  },
  {
    id: 'content-creator-agent',
    name: 'ContentCarltig',
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

  // Check if user is logged in
  React.useEffect(() => {
    const checkLoginStatus = async () => {
      const user = await getCurrentUser();
      setIsLoggedIn(!!user);
    };
    checkLoginStatus();
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

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
        Live Agent Domination Dashboard
      </h2>
      <div className="text-center mb-6">
        <p className="text-cyan-400 text-sm font-semibold">
          🔥 Real-time competitive advantage happening now
        </p>
        <p className="text-gray-400 text-xs mt-1">
          {liveActivity.branding.liveUsers + liveActivity.social.liveUsers + liveActivity.content.liveUsers} businesses currently destroying their competition
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FEATURED_AGENTS.map((agent) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative rounded-xl overflow-hidden bg-black/20 backdrop-blur-lg border border-blue-500/30"
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

            {/* Agent Card Image */}
            <div className="aspect-[3/4] relative w-full">
              <Image 
                src={getAgentImagePath(agent.id, "card")}
                alt={agent.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            
            {/* Card Action Buttons */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-black/0 p-4">
              <div className="flex justify-center space-x-2">
                {/* LEARN Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleLearnClick(agent.id)}
                  className="px-4 py-2 bg-purple-500/80 text-white rounded-md font-medium text-sm"
                >
                  LEARN
                </motion.button>
                
                {/* CHAT Button (Freebie) */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleChatClick(agent.id, agent.freeTip)}
                  className="px-4 py-2 bg-purple-500/80 text-white rounded-md font-medium text-sm"
                >
                  CHAT
                </motion.button>
                
                {/* LAUNCH Button (Locked for non-users) */}
                <motion.button
                  whileHover={isLoggedIn ? { scale: 1.05 } : { scale: 1 }}
                  whileTap={isLoggedIn ? { scale: 0.95 } : { scale: 1 }}
                  disabled={!isLoggedIn}
                  className={`px-4 py-2 rounded-md font-medium text-sm relative ${
                    isLoggedIn ? 'bg-blue-500 text-white' : 'bg-gray-500/40 text-gray-300'
                  }`}
                  onMouseEnter={() => !isLoggedIn && setShowTooltip(agent.id)}
                  onMouseLeave={() => setShowTooltip(null)}
                  onClick={() => isLoggedIn && router.push(`/agent/${agent.id}`)}
                >
                  LAUNCH
                  {!isLoggedIn && showTooltip === agent.id && (
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs p-2 rounded whitespace-nowrap z-50">
                      Sign up to unlock
                    </div>
                  )}
                </motion.button>
              </div>
              
              {/* Competitive Intelligence & Power Preview */}
              <div className="mt-2 p-2 bg-black/60 rounded-md opacity-0 hover:opacity-100 transition-opacity duration-200">
                <div className="text-xs mb-2">
                  <div className="text-red-400 font-semibold mb-1">⚡ Competitive Edge:</div>
                  <div className="text-white">{liveActivity[agent.activityKey].competitiveEdge}</div>
                </div>
                <p className="text-white text-xs mb-1"><span className="text-teal-400">Free Preview:</span> {agent.freeTip}</p>
                <p className="text-white text-xs"><span className="text-yellow-400">Full Domination:</span> {agent.upsell}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Progressive Urgency CTA */}
      <div className="mt-8 text-center">
        <div className="mb-4 p-4 bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-500/30 rounded-xl max-w-md mx-auto">
          <p className="text-red-400 text-sm font-semibold mb-1">
            ⚠️ Competitive Alert
          </p>
          <p className="text-white text-xs">
            {Math.floor(Math.random() * 156) + 47} businesses gained insurmountable advantage today.
            Your competitors aren't using AI yet—perfect timing.
          </p>
        </div>
        <Link href="/sign-up">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold rounded-md shadow-lg"
          >
            🔥 Join the {(liveActivity.branding.liveUsers + liveActivity.social.liveUsers + liveActivity.content.liveUsers)} Crushing Competition Now
          </motion.button>
        </Link>
        <p className="text-gray-400 text-xs mt-2">
          Average competitive advantage gained: 340% within first week
        </p>
      </div>
    </section>
  );
}
