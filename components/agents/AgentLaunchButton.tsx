'use client';
import React, { useState } from 'react';
import { useUser, useSession } from '@supabase/auth-helpers-react';
import { useAgentTracking, useUpgradeTracking } from '@/lib/hooks/useAnalytics';
import type { Agent } from '@/types/agent';

interface AgentLaunchButtonProps {
  agent: Agent;
  onLaunch?: (agent: Agent) => void;
  className?: string;
}

export default function AgentLaunchButton({ agent, onLaunch, className = '' }: AgentLaunchButtonProps) {
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

  if (upgradeRequired) {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-lg p-4">
        <h4 className="font-semibold text-amber-800 mb-2">Premium Feature Required</h4>
        <p className="text-amber-700 mb-3">
          {agent.name} requires a {upgradeRequired} subscription to access its full capabilities.
        </p>
        <button
          onClick={() => window.open('/pricing', '_blank')}
          className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-md font-medium hover:from-amber-600 hover:to-orange-600 transition-all"
        >
          Upgrade to {upgradeRequired}
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