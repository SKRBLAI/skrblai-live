import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { X, Zap, Star, Lock, Crown, TrendingUp } from 'lucide-react';
import { Agent } from '../../types/agent';
import AgentBackstoryModal from './AgentBackstoryModal';
import { useRouter } from 'next/navigation';
import { trackFunnelEvent } from '../../lib/analytics/userFunnelTracking';
import { useAuth } from '../context/AuthContext';
import useUsageBasedPricing from '../../hooks/useUsageBasedPricing';
import { toast } from 'react-hot-toast';

interface AgentModalProps {
  agent: Agent;
  open: boolean;
  onClose: () => void;
  onTry: (agent: Agent) => void;
}

export default function AgentModal({ agent, open, onClose, onTry }: AgentModalProps) {
  const router = useRouter();
  const { user, accessLevel } = useAuth();
  const [showBackstory, setShowBackstory] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  // ✨ NEW: Usage-based pricing integration
  const {
    usage,
    currentTier,
    recommendation,
    upgradeUrgency,
    trackUsage,
    shouldShowUpgradePrompt,
    getUpgradeMessage
  } = useUsageBasedPricing();

  // ✨ NEW: Dynamic upgrade prompt state
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<string>('');

  // Determine if agent is locked based on tier and usage
  const isLocked = !user || (
    currentTier === 'free' && 
    (usage.agentsUsedToday >= 3 || !['adCreativeAgent', 'analyticsAgent', 'bizAgent'].includes(agent.id))
  );

  // ✨ NEW: Check for upgrade opportunities when modal opens
  useEffect(() => {
    if (open && user) {
      // Track agent view
      trackUsage('agent_view', { 
        agentId: agent.id, 
        agentName: agent.name,
        isLocked,
        currentUsage: usage.agentsUsedToday
      });

      // Check if we should show upgrade prompt
      if (isLocked && shouldShowUpgradePrompt()) {
        setShowUpgradePrompt(true);
        if (usage.agentsUsedToday >= 3) {
          setUpgradeReason('usage_limit');
        } else if (upgradeUrgency >= 70) {
          setUpgradeReason('high_velocity');
        } else {
          setUpgradeReason('locked_agent');
        }

        // Track upgrade prompt impression
        trackFunnelEvent({
          event_type: 'upgrade_view',
          user_id: user.id,
          session_id: 'agent_modal',
          agent_id: agent.id,
          metadata: {
            reason: upgradeReason,
            usage_today: usage.agentsUsedToday,
            urgency_score: upgradeUrgency,
            tier: currentTier
          }
        });
      }
    }
  }, [open, agent.id, agent.name, isLocked, shouldShowUpgradePrompt, usage.agentsUsedToday, upgradeUrgency, upgradeReason, currentTier, user, trackUsage]);

  const handleTryAgent = async () => {
    if (!user) {
      toast.error('Please sign in to use agents');
      router.push('/sign-in');
      return;
    }

    if (isLocked) {
      // Track locked agent attempt
      trackUsage('locked_agent_attempt', {
        agentId: agent.id,
        agentName: agent.name,
        reason: usage.agentsUsedToday >= 3 ? 'usage_limit' : 'tier_restriction',
        upgradeUrgency
      });

      // Show upgrade prompt instead of launching
      setShowUpgradePrompt(true);
      setUpgradeReason('locked_agent_click');
      return;
    }

    setIsLaunching(true);
    
    try {
      // Track successful agent launch
      trackUsage('agent_launch', {
        agentId: agent.id,
        agentName: agent.name,
        usageToday: usage.agentsUsedToday + 1,
        consecutiveDays: usage.consecutiveDaysActive
      });

      await onTry(agent);
      
      // Show celebration for milestone usage
      if (usage.agentsUsedToday + 1 === 2) {
        toast.success('🎉 Great momentum! You\'re discovering the power of AI automation.');
      } else if (usage.agentsUsedToday + 1 === 3) {
        toast.success('🔥 You\'ve used all 3 free agents today! Consider upgrading for unlimited access.');
      }

      onClose();
    } catch (error) {
      console.error('Error launching agent:', error);
      toast.error('Failed to launch agent. Please try again.');
    } finally {
      setIsLaunching(false);
    }
  };

  const handleUpgrade = (targetTier: string = 'starter') => {
    // Track upgrade click
    trackUsage('upgrade_click', {
      source: 'agent_modal',
      agentId: agent.id,
      reason: upgradeReason,
      targetTier,
      urgencyScore: upgradeUrgency
    });

    // Navigate to pricing with context
    const offer = upgradeReason === 'usage_limit' ? 'agent_limit' : 
                  upgradeReason === 'high_velocity' ? 'velocity_upgrade' : 
                  'agent_unlock';
    
    router.push(`/pricing?offer=${offer}&agent=${agent.id}`);
  };

  const getUpgradePromptContent = () => {
    const baseContent = {
      title: '🚀 Unlock ' + agent.name,
      subtitle: 'Premium Agent',
      cta: 'Upgrade to Starter ($27/mo)'
    };

    switch (upgradeReason) {
      case 'usage_limit':
        return {
          ...baseContent,
          title: '🚨 Daily Agent Limit Reached',
          message: `You've used all 3 free agents today! Upgrade to Starter Hustler for 6 agents + 50 scans/month.`,
          urgency: 'high',
          benefits: [
            '6 Content Creator Agents',
            '50 Scans per month',
            'Unlimited Percy conversations',
            'Priority support'
          ]
        };
      case 'high_velocity':
        return {
          ...baseContent,
          title: '🔥 High Usage Velocity Detected!',
          message: `You're clearly seeing value! Upgrade now to unlock ${agent.name} and 5 more agents.`,
          urgency: 'medium',
          benefits: [
            'Unlock ' + agent.name,
            '6 total agents available',
            '50 tasks per agent/month',
            'Advanced automation features'
          ]
        };
      default:
        return {
          ...baseContent,
          message: `${agent.name} is available to Starter Hustler members. Upgrade to access this agent and 5 others.`,
          urgency: 'low',
          benefits: [
            agent.name + ' access',
            '6 specialized agents',
            'Content automation suite',
            'Growing business features'
          ]
        };
    }
  };

  if (!open) return null;

  const upgradeContent = getUpgradePromptContent();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-gray-700 shadow-2xl">
            
            {/* ✨ NEW: Enhanced Header with usage indicators */}
            <div className="relative p-6 border-b border-gray-700">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl relative">
                    {agent.emoji || '🤖'}
                    {isLocked && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                        <Lock className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold text-white">{agent.name}</h2>
                    {currentTier === 'free' && (
                      <span className="px-2 py-1 text-xs bg-orange-500/20 text-orange-400 rounded-full">
                        {usage.agentsUsedToday}/3 today
                      </span>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{agent.description}</p>
                  
                  {/* ✨ NEW: Usage momentum indicator */}
                  {upgradeUrgency > 50 && currentTier === 'free' && (
                    <div className="mt-3 flex items-center gap-2 text-xs">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 font-medium">
                        High automation momentum detected ({upgradeUrgency}% urgency)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ✨ ENHANCED: Agent content with upgrade prompts */}
            <div className="p-6">
              {showUpgradePrompt && isLocked ? (
                // ✨ NEW: Dynamic upgrade prompt
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center space-y-6"
                >
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                    upgradeContent.urgency === 'high' ? 'bg-red-500/20 text-red-400' :
                    upgradeContent.urgency === 'medium' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    <Crown className="w-4 h-4" />
                    <span className="text-sm font-medium">{upgradeContent.subtitle}</span>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3">{upgradeContent.title}</h3>
                    <p className="text-gray-300 leading-relaxed">{upgradeContent.message}</p>
                  </div>

                  {/* Benefits list */}
                  <div className="bg-gray-800/50 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                      Starter Hustler Includes:
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {upgradeContent.benefits?.map((benefit, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                          <Star className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handleUpgrade('starter')}
                      className={`flex-1 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${
                        upgradeContent.urgency === 'high' 
                          ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 animate-pulse' :
                        upgradeContent.urgency === 'medium'
                          ? 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600' :
                          'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                      }`}
                    >
                      {upgradeContent.cta}
                    </button>
                    {recommendation?.potentialRevenue === 67 && (
                      <button
                        onClick={() => handleUpgrade('star')}
                        className="flex-1 px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all"
                      >
                        Business Dominator ($67/mo)
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => setShowUpgradePrompt(false)}
                    className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    Maybe Later
                  </button>
                </motion.div>
              ) : (
                // ✨ ENHANCED: Standard agent content with usage awareness
                <>
                  <div className="space-y-4 mb-6">
                    <h3 className="text-lg font-semibold text-white">Capabilities</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {agent.capabilities?.map((capability, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                          <Zap className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          <span>{capability}</span>
                        </div>
                      )) || (
                        <div className="col-span-2 text-gray-400 text-sm">
                          Capabilities information not available
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleTryAgent}
                      disabled={isLaunching}
                      className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all ${
                        isLocked 
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600' 
                          : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
                      } ${isLaunching ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isLaunching ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                          Launching...
                        </div>
                      ) : isLocked ? (
                        'Upgrade to Unlock'
                      ) : (
                        'Launch Agent'
                      )}
                    </button>
                    
                    <button
                      onClick={() => setShowBackstory(true)}
                      className="px-6 py-3 rounded-xl font-medium bg-gray-700 text-white hover:bg-gray-600 transition-colors"
                    >
                      Learn More
                    </button>
                  </div>

                  {/* ✨ NEW: Usage warning for free users */}
                  {currentTier === 'free' && usage.agentsUsedToday >= 2 && !isLocked && (
                    <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                      <div className="flex items-center gap-2 text-orange-400 text-sm">
                        <Zap className="w-4 h-4" />
                        <span>
                          {usage.agentsUsedToday === 2 
                            ? 'This is your last free agent for today!' 
                            : 'You\'ve used your daily agent limit.'}
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Agent Backstory Modal */}
        <AgentBackstoryModal
          agent={agent}
          isOpen={showBackstory}
          onClose={() => setShowBackstory(false)}
        />
      </motion.div>
    </AnimatePresence>
  );
}

