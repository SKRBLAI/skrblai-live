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

// Define the three featured agents we want to show
const FEATURED_AGENTS = [
  {
    id: 'branding-agent',
    name: 'BrandAlexander',
    freeTip: 'Update your logo background color to create more contrast—it\'ll make your brand pop on social media!',
    upsell: 'Want a full brand kit with style guide, logos, and color palette? Unlock all my superpowers.',
  },
  {
    id: 'social-bot-agent',
    name: 'SocialNino',
    freeTip: 'Posting at 8pm can double your Instagram engagement based on typical audience behavior patterns.',
    upsell: 'Want me to schedule posts and track analytics for maximum growth? Unlock my full toolkit!',
  },
  {
    id: 'content-creator-agent',
    name: 'ContentCarltig',
    freeTip: 'Try this headline format for your next blog: "How [Your Industry] Experts Are [Achieving Result] Without [Common Method]"',
    upsell: 'Want a month of content ideas and SEO-optimized articles? Unlock more capabilities.',
  }
];

export default function AgentPreviewSection(): React.ReactElement {
  const router = useRouter();
  const { setPercyIntent } = usePercyContext();
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in
  React.useEffect(() => {
    const checkLoginStatus = async () => {
      const user = await getCurrentUser();
      setIsLoggedIn(!!user);
    };
    checkLoginStatus();
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
      <h2 className="text-2xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
        Discover Our AI Agents
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FEATURED_AGENTS.map((agent) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative rounded-xl overflow-hidden bg-black/20 backdrop-blur-lg border border-blue-500/30"
          >
            {/* Agent Card Image */}
            <div className="aspect-[3/4] relative w-full">
              <Image 
                src={getAgentImagePath(agent.id)}
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
              
              {/* Freebie & Upsell Text - Hidden by default, shown on hover/tap */}
              <div className="mt-2 p-2 bg-black/60 rounded-md opacity-0 hover:opacity-100 transition-opacity duration-200">
                <p className="text-white text-xs mb-1"><span className="text-teal-400">Freebie:</span> {agent.freeTip}</p>
                <p className="text-white text-xs"><span className="text-teal-400">Unlock:</span> {agent.upsell}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Start Free Trial Button */}
      <div className="mt-8 text-center">
        <Link href="/sign-up">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-teal-400 text-white font-medium rounded-md shadow-lg"
          >
            Start Free Trial
          </motion.button>
        </Link>
      </div>
    </section>
  );
}
