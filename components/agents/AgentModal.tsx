import { motion, AnimatePresence } from "framer-motion";
import { getDisplayPlan, formatMoney } from '../../lib/pricing/catalog';
import React, { useEffect, useState } from "react";
import { X, Zap, Star, Lock, Crown, TrendingUp } from 'lucide-react';
import { SafeAgent } from '../../types/agent';
import AgentBackstoryModal from './AgentBackstoryModal';
import { useRouter } from 'next/navigation';
import { trackFunnelEvent } from '../../lib/analytics/userFunnelTracking';
import { useAuth } from '../context/AuthContext';
import useUsageBasedPricing from '../../hooks/useUsageBasedPricing';
import { toast } from 'react-hot-toast';
import '../../styles/components/AgentModal.css';

interface AgentModalProps {
  agent: SafeAgent;
  open: boolean;
  onClose: () => void;
  onTry: (agent: SafeAgent) => void;
}

export default function AgentModal({ agent, open, onClose, onTry }: AgentModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [showBackstory, setShowBackstory] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  const {
    usage,
    currentTier,
    upgradeUrgency,
    trackUsage,
    shouldShowUpgradePrompt,
  } = useUsageBasedPricing();

  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<string>('');

  const isLocked = !user || (
    currentTier === 'free' &&
    (usage.agentsUsedToday >= 3 || !['adCreativeAgent', 'analyticsAgent', 'bizAgent'].includes(agent.id))
  );

  useEffect(() => {
    if (open && user) {
      trackUsage('agent_view', { 
        agentId: agent.id, 
        agentName: agent.name,
        isLocked,
        currentUsage: usage.agentsUsedToday
      });

      if (isLocked && shouldShowUpgradePrompt()) {
        setShowUpgradePrompt(true);
        const reason = usage.agentsUsedToday >= 3 ? 'usage_limit' 
                     : upgradeUrgency >= 70 ? 'high_velocity' 
                     : 'locked_agent';
        setUpgradeReason(reason);

        trackFunnelEvent({
          event_type: 'upgrade_view',
          user_id: user.id,
          session_id: 'agent_modal',
          agent_id: agent.id,
          metadata: { reason, usage_today: usage.agentsUsedToday, urgency_score: upgradeUrgency, tier: currentTier }
        });
      }
    }
  }, [open, user, agent.id, agent.name, isLocked, shouldShowUpgradePrompt, usage.agentsUsedToday, upgradeUrgency, currentTier, trackUsage]);

  const handleTryAgent = async () => {
    if (!user) {
      toast.error('Please sign in to use agents');
      router.push('/sign-in');
      return;
    }

    if (isLocked) {
      trackUsage('locked_agent_attempt', {
        agentId: agent.id,
        agentName: agent.name,
        reason: usage.agentsUsedToday >= 3 ? 'usage_limit' : 'tier_restriction',
        upgradeUrgency
      });
      setShowUpgradePrompt(true);
      setUpgradeReason('locked_agent_click');
      return;
    }

    setIsLaunching(true);
    try {
      trackUsage('agent_launch', {
        agentId: agent.id,
        agentName: agent.name,
        usageToday: usage.agentsUsedToday + 1,
        consecutiveDays: usage.consecutiveDaysActive
      });
      await onTry(agent);
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
    trackUsage('upgrade_click', {
      source: 'agent_modal',
      agentId: agent.id,
      reason: upgradeReason,
      targetTier,
      urgencyScore: upgradeUrgency
    });
    const offer = upgradeReason === 'usage_limit' ? 'agent_limit' 
                : upgradeReason === 'high_velocity' ? 'velocity_upgrade' 
                : 'agent_unlock';
    router.push(`/pricing?offer=${offer}&agent=${agent.id}`);
  };

  const getUpgradePromptContent = () => {
    const baseContent = {
      title: `🚀 Unlock ${agent.name}`,
      subtitle: 'Premium Agent requires',
      cta: 'Upgrade to Starter'
    };
    const planKey = upgradeReason === 'usage_limit' ? 'starter' : upgradeReason === 'high_velocity' ? 'star' : 'crusher';
    const plan = getDisplayPlan(planKey, 'monthly');
    const accessLabel = `${plan.label} (${formatMoney(plan.amount, plan.currency)}/${plan.intervalLabel})`;
    switch (upgradeReason) {
      case 'usage_limit':
        return { ...baseContent, title: '🚨 Daily Agent Limit Reached', message: `You've used all 3 free agents today! Upgrade for unlimited agents.`, benefits: ['Unlimited agents', '50 Scans per month', 'Unlimited Percy conversations', 'Priority support'], subtitle: `Premium Agent requires ${accessLabel} access. Your competition is already using this firepower!` };
      case 'high_velocity':
        return { ...baseContent, title: '🔥 High Usage Velocity Detected!', message: `You're on a roll! Upgrade to unlock ${agent.name} and more.`, benefits: [`Unlock ${agent.name}`, '6 total agents available', '50 tasks per agent/month', 'Advanced automation features'], subtitle: `Premium Agent requires ${accessLabel} access.` };
      default:
        return { ...baseContent, message: `${agent.name} is a premium agent. Upgrade to access.`, benefits: [`${agent.name} access`, '6 specialized agents', 'Content automation suite', 'Growing business features'], subtitle: `Premium Agent requires ${accessLabel} access.` };
    }
  };

  if (!open) return null;

  const upgradeContent = getUpgradePromptContent();

  return (
    <AnimatePresence>
      <motion.div className="agent-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div className="agent-modal-content" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} onClick={(e) => e.stopPropagation()}>
          
          <div className="agent-modal-header">
            <button onClick={onClose} className="agent-modal-close-button" title="Close agent modal"><X className="w-5 h-5" /></button>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl relative">
                  {agent.emoji || '🤖'}
                  {isLocked && <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center"><Lock className="w-3 h-3 text-white" /></div>}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <motion.h2 className="agent-modal-title" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>{agent.name}</motion.h2>
                  {currentTier === 'free' && <span className="px-2 py-1 text-xs bg-orange-500/20 text-orange-400 rounded-full">{usage.agentsUsedToday}/3 today</span>}
                </div>
                <motion.p className="agent-modal-description" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>{agent.description}</motion.p>
                {upgradeUrgency > 50 && currentTier === 'free' && (
                  <motion.div className="mt-3 flex items-center gap-2 text-xs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 font-medium">High automation momentum ({upgradeUrgency}% urgency)</span>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {showUpgradePrompt ? (
            <motion.div className="mt-6 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center gap-2 mb-3">
                <Crown className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-semibold text-white">{upgradeContent.title}</h3>
              </div>
              <p className="text-gray-300 mb-4">{upgradeContent.message}</p>
              <ul className="text-sm text-gray-400 mb-4 space-y-1">
                {upgradeContent.benefits?.map((benefit, index) => <li key={index} className="flex items-center gap-2"><Star className="w-3 h-3 text-yellow-400 flex-shrink-0" /><span>{benefit}</span></li>)}
              </ul>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => handleUpgrade()} className="flex-1 px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 transition-all">{upgradeContent.cta}</button>
                <button onClick={() => setShowUpgradePrompt(false)} className="px-6 py-3 rounded-xl font-medium bg-gray-700 text-white hover:bg-gray-600 transition-colors">Maybe Later</button>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-semibold text-white">Capabilities</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {agent.capabilities?.map((capability, index) => <div key={index} className="flex items-center gap-2 text-sm text-gray-300"><Zap className="w-4 h-4 text-blue-400 flex-shrink-0" /><span>{capability}</span></div>) || <div className="col-span-2 text-gray-400 text-sm">Capabilities not available</div>}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={handleTryAgent} disabled={isLaunching} className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all ${isLocked ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'} text-white ${isLaunching ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  {isLaunching ? <div className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /><span>Launching...</span></div> : isLocked ? 'Upgrade to Unlock' : 'Launch Agent'}
                </button>
                <button onClick={() => setShowBackstory(true)} className="px-6 py-3 rounded-xl font-medium bg-gray-700 text-white hover:bg-gray-600 transition-colors">Learn More</button>
              </div>
              {currentTier === 'free' && usage.agentsUsedToday >= 2 && !isLocked && (
                <motion.div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                  <div className="flex items-center gap-2 text-orange-400 text-sm">
                    <Zap className="w-4 h-4" />
                    <span>{usage.agentsUsedToday === 2 ? 'This is your last free agent for today!' : 'You\'ve used your daily agent limit.'}</span>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          <AgentBackstoryModal agent={agent} isOpen={showBackstory} onClose={() => setShowBackstory(false)} />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
