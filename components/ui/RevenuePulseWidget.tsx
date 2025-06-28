'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, DollarSign, Zap, Crown, Target, ArrowUp } from 'lucide-react';
import { useAuth } from '@/components/context/AuthContext';
import { trackFunnelEvent } from '@/lib/analytics/userFunnelTracking';

interface RevenueOpportunity {
  id: string;
  type: 'usage_limit' | 'feature_discovery' | 'competitor_pressure' | 'time_sensitive';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  cta: string;
  potentialRevenue: number;
  href: string;
  icon: string;
  timeLeft?: string;
  confidence: number;
}

interface RevenuePulseWidgetProps {
  currentTier?: string;
  agentsUsedToday?: number;
  scansUsedToday?: number;
  showOnPages?: string[];
  className?: string;
}

export default function RevenuePulseWidget({
  currentTier = 'free',
  agentsUsedToday = 0,
  scansUsedToday = 0,
  showOnPages = ['dashboard', 'agents', 'features'],
  className = ''
}: RevenuePulseWidgetProps) {
  const { user, accessLevel } = useAuth();
  const [currentOpportunity, setCurrentOpportunity] = useState<RevenueOpportunity | null>(null);
  const [opportunityHistory, setOpportunityHistory] = useState<string[]>([]);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showFullWidget, setShowFullWidget] = useState(false);

  // Calculate dynamic revenue opportunities
  const generateRevenueOpportunities = useCallback((): RevenueOpportunity[] => {
    const opportunities: RevenueOpportunity[] = [];
    
    // Usage-based opportunities
    if (agentsUsedToday >= 2 && currentTier === 'free') {
      opportunities.push({
        id: 'usage_momentum',
        type: 'usage_limit',
        urgency: 'high',
        title: '🔥 Usage Momentum Detected',
        message: 'You\'ve used 2+ agents today! Upgrade now to unlock 11+ more agents and avoid hitting limits.',
        cta: 'Unlock Full Arsenal ($27/mo)',
        potentialRevenue: 27,
        href: '/pricing?offer=usage_momentum',
        icon: '🚀',
        confidence: 89
      });
    }

    if (scansUsedToday >= 3 && currentTier === 'free') {
      opportunities.push({
        id: 'scan_velocity',
        type: 'usage_limit',
        urgency: 'critical',
        title: '⚡ Intelligence Gathering Velocity',
        message: 'You\'ve maxed out today\'s scans! Upgrade to 50 scans/month and never hit limits again.',
        cta: 'Unlimited Intelligence ($27/mo)',
        potentialRevenue: 27,
        href: '/pricing?offer=scan_limit',
        icon: '🧠',
        confidence: 95
      });
    }

    // Time-sensitive opportunities
    const hour = new Date().getHours();
    if (hour >= 9 && hour <= 17 && currentTier === 'free') {
      opportunities.push({
        id: 'business_hours_pressure',
        type: 'time_sensitive',
        urgency: 'medium',
        title: '💼 Business Hours = Revenue Hours',
        message: 'Your competitors are automating RIGHT NOW. Don\'t let them gain unfair advantage.',
        cta: 'Beat Competition ($27/mo)',
        potentialRevenue: 27,
        href: '/pricing?offer=competition_pressure',
        icon: '⏰',
        timeLeft: '8 hours until markets close',
        confidence: 73
      });
    }

    // Feature discovery opportunities
    if (currentTier === 'starter' && agentsUsedToday >= 4) {
      opportunities.push({
        id: 'feature_expansion',
        type: 'feature_discovery',
        urgency: 'medium',
        title: '📈 Growth Pattern Detected',
        message: 'Heavy usage detected! Business Dominator tier offers 4x more agents and advanced analytics.',
        cta: 'Scale to Business Dominator ($67/mo)',
        potentialRevenue: 67,
        href: '/pricing?offer=growth_expansion',
        icon: '📊',
        confidence: 81
      });
    }

    // Competitor pressure opportunities
    if (currentTier === 'free') {
      opportunities.push({
        id: 'friday_competition',
        type: 'competitor_pressure',
        urgency: 'high',
        title: '🏆 Friday Competition Alert',
        message: '2,847 businesses upgraded this week. Your industry leaders are already automating.',
        cta: 'Join the Leaders ($27/mo)',
        potentialRevenue: 27,
        href: '/pricing?offer=friday_momentum',
        icon: '🔥',
        confidence: 76
      });
    }

    return opportunities.filter(op => !opportunityHistory.includes(op.id));
  }, [agentsUsedToday, scansUsedToday, currentTier, opportunityHistory]);

  // Cycle through opportunities
  useEffect(() => {
    const opportunities = generateRevenueOpportunities();
    if (opportunities.length === 0) return;

    // Select highest confidence opportunity
    const bestOpportunity = opportunities.sort((a, b) => b.confidence - a.confidence)[0];
    setCurrentOpportunity(bestOpportunity);

    // Track impression
    if (user?.id) {
      trackFunnelEvent({
        event_type: 'upgrade_view',
        user_id: user.id,
        session_id: 'revenue_pulse',
        metadata: {
          opportunity_type: bestOpportunity.type,
          urgency: bestOpportunity.urgency,
          potential_revenue: bestOpportunity.potentialRevenue,
          confidence: bestOpportunity.confidence
        }
      });
    }

    // Auto-rotate opportunities every 20 seconds
    const interval = setInterval(() => {
      const nextOpportunities = generateRevenueOpportunities();
      if (nextOpportunities.length > 0) {
        const nextOpportunity = nextOpportunities[Math.floor(Math.random() * nextOpportunities.length)];
        setCurrentOpportunity(nextOpportunity);
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [generateRevenueOpportunities, user?.id]);

  const handleUpgradeClick = () => {
    if (!currentOpportunity) return;

    // Track conversion attempt
    if (user?.id) {
      trackFunnelEvent({
        event_type: 'upgrade_complete',
        user_id: user.id,
        session_id: 'revenue_pulse',
        conversion_value: currentOpportunity.potentialRevenue,
        metadata: {
          opportunity_id: currentOpportunity.id,
          cta_clicked: currentOpportunity.cta
        }
      });
    }

    // Navigate to pricing with offer context
    window.location.href = currentOpportunity.href;
  };

  const handleDismiss = () => {
    if (currentOpportunity) {
      setOpportunityHistory(prev => [...prev, currentOpportunity.id]);
    }
    setIsDismissed(true);
    setTimeout(() => setIsDismissed(false), 30000); // Reappear after 30 seconds
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'from-red-500 to-orange-500';
      case 'high': return 'from-orange-500 to-yellow-500';
      case 'medium': return 'from-blue-500 to-cyan-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getUrgencyPulse = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'animate-pulse';
      case 'high': return 'animate-bounce';
      default: return '';
    }
  };

  if (!currentOpportunity || isDismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className={`fixed bottom-4 right-4 z-40 max-w-sm ${className}`}
      >
        <motion.div
          className={`bg-gradient-to-r ${getUrgencyColor(currentOpportunity.urgency)} p-[2px] rounded-xl ${getUrgencyPulse(currentOpportunity.urgency)}`}
          whileHover={{ scale: 1.02 }}
        >
          <div className="bg-gray-900 rounded-xl p-4 backdrop-blur-xl">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentOpportunity.icon}</span>
                <div>
                  <h3 className="font-bold text-white text-sm leading-tight">
                    {currentOpportunity.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      currentOpportunity.urgency === 'critical' ? 'bg-red-500/20 text-red-400' :
                      currentOpportunity.urgency === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {currentOpportunity.urgency.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400">
                      {currentOpportunity.confidence}% match
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-white text-lg leading-none"
              >
                ×
              </button>
            </div>

            <p className="text-gray-300 text-sm mb-4 leading-relaxed">
              {currentOpportunity.message}
            </p>

            {currentOpportunity.timeLeft && (
              <div className="text-xs text-yellow-400 mb-3 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {currentOpportunity.timeLeft}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleUpgradeClick}
                className={`flex-1 px-4 py-2 rounded-lg bg-gradient-to-r ${getUrgencyColor(currentOpportunity.urgency)} text-white font-bold text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2`}
              >
                <DollarSign className="w-4 h-4" />
                {currentOpportunity.cta}
              </button>
            </div>

            {/* Revenue Impact Indicator */}
            <div className="mt-3 pt-3 border-t border-gray-700">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Potential Monthly Value:</span>
                <span className="text-green-400 font-bold">
                  ${currentOpportunity.potentialRevenue}/mo
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Minimized state toggle */}
        <motion.button
          onClick={() => setShowFullWidget(!showFullWidget)}
          className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {showFullWidget ? '−' : '$'}
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
} 