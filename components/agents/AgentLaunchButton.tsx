'use client';
import React, { useState } from 'react';
import { useUser, useSession } from '@supabase/auth-helpers-react';
import { useAgentTracking, useUpgradeTracking } from '../../lib/hooks/useAnalytics';
import type { SafeAgent } from '@/types/agent';
import { motion } from 'framer-motion';

interface AgentLaunchButtonProps {
  agent: SafeAgent;
  onLaunch?: (agent: SafeAgent) => void;
  className?: string;
  variant?: 'default' | 'card'; // New prop for different contexts
}

export default function AgentLaunchButton({ 
  agent, 
  onLaunch, 
  className = '',
  variant = 'default'
}: AgentLaunchButtonProps) {
  const [isLaunching, setIsLaunching] = useState(false);
  const [upgradeRequired, setUpgradeRequired] = useState<string | null>(null);
  const user = useUser();
  const session = useSession();
  const { trackAgent } = useAgentTracking();
  const { trackUpgrade } = useUpgradeTracking();

  const handleLaunch = async () => {
    if (!user) {
      trackAgent(agent.id, 'launch_attempt_unauthenticated');
      // Redirect to login
      return;
    }

    setIsLaunching(true);
    trackAgent(agent.id, 'launch_initiated');

    try {
      const response = await fetch('/api/agents/automation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
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
        trackAgent(agent.id, 'launch_success');
        onLaunch?.(agent);
      } else if (result.upgradeRequired) {
        const currentRole = localStorage.getItem('userRole') || 'client';
        setUpgradeRequired(result.upgradeRequired);
        trackUpgrade(agent.premiumFeature || 'premium-agents', currentRole, result.upgradeRequired);
        trackAgent(agent.id, 'launch_blocked_premium');
      } else {
        trackAgent(agent.id, 'launch_failed');
      }

    } catch (error) {
      trackAgent(agent.id, 'launch_error');
      console.error('Agent launch failed:', error);
    } finally {
      setIsLaunching(false);
    }
  };

  // For card variant, show minimal UI
  if (variant === 'card') {
    return (
      <motion.button
        onClick={upgradeRequired ? () => window.open('/pricing', '_blank') : handleLaunch}
        disabled={isLaunching}
        className={`relative ${className}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="sr-only">
          {upgradeRequired ? `Upgrade to ${upgradeRequired}` : `Launch ${agent.name}`}
        </span>
        {isLaunching && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </motion.button>
    );
  }

  // Default variant with full UI
  if (upgradeRequired) {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg p-4">
        <h4 className="font-semibold text-amber-800 mb-2">🚀 Agent Power Locked</h4>
        <p className="text-amber-700 mb-3">
          {agent.name} requires {upgradeRequired === 'starter' ? 'Starter Hustler ($27/month)' : 
           upgradeRequired === 'star' ? 'Business Dominator ($67/month)' : 
           'Industry Crusher ($147/month)'} access. Your competition is already using this firepower!
        </p>
        <button
          onClick={() => window.open('/pricing', '_blank')}
          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-md font-medium hover:from-amber-600 hover:to-orange-600 transition-all"
        >
          Unlock {agent.name} Power
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleLaunch}
      disabled={isLaunching}
      className={`
        bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-medium
        hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed
        transition-all transform hover:scale-105 ${className}
      `}
    >
      {isLaunching ? (
        <span className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Launching...
        </span>
      ) : (
        `Launch ${agent.name}`
      )}
    </button>
  );
} 