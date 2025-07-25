'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../components/context/AuthContext';
import { trackFunnelEvent } from '../lib/analytics/userFunnelTracking';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface UsageMetrics {
  agentsUsedToday: number;
  agentsUsedThisWeek: number;
  scansUsedToday: number;
  scansUsedThisWeek: number;
  tasksCompletedToday: number;
  tasksCompletedThisWeek: number;
  timeSpentToday: number; // minutes
  averageSessionLength: number; // minutes
  consecutiveDaysActive: number;
  lastActiveDate: string;
}

interface PricingRecommendation {
  targetTier: 'starter' | 'star' | 'all_star';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  reasons: string[];
  potentialRevenue: number;
  discountOffered?: number;
  timeLeft?: string;
  triggerType: 'usage_limit' | 'velocity' | 'value_demonstration' | 'competitive_pressure';
}

interface UsageBasedPricingReturn {
  usage: UsageMetrics;
  currentTier: string;
  recommendation: PricingRecommendation | null;
  isLoading: boolean;
  upgradeUrgency: number; // 0-100 score
  valueRealized: number; // 0-100 score showing value user has gotten
  trackUsage: (type: string, metadata?: any) => void;
  getUpgradeMessage: () => string;
  shouldShowUpgradePrompt: () => boolean;
  refreshUsage: () => void;
}

export default function useUsageBasedPricing(): UsageBasedPricingReturn {
  const { user, accessLevel } = useAuth();
  const [usage, setUsage] = useState<UsageMetrics>({
    agentsUsedToday: 0,
    agentsUsedThisWeek: 0,
    scansUsedToday: 0,
    scansUsedThisWeek: 0,
    tasksCompletedToday: 0,
    tasksCompletedThisWeek: 0,
    timeSpentToday: 0,
    averageSessionLength: 0,
    consecutiveDaysActive: 0,
    lastActiveDate: new Date().toISOString()
  });
  
  const [currentTier, setCurrentTier] = useState<string>('free');
  const [recommendation, setRecommendation] = useState<PricingRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [upgradeUrgency, setUpgradeUrgency] = useState(0);
  const [valueRealized, setValueRealized] = useState(0);

  // Calculate upgrade urgency based on usage patterns
  const calculateUpgradeUrgency = useCallback((metrics: UsageMetrics): number => {
    let urgencyScore = 0;

    // Usage velocity scoring
    if (metrics.agentsUsedToday >= 3) urgencyScore += 25;
    if (metrics.agentsUsedToday >= 5) urgencyScore += 15;
    if (metrics.scansUsedToday >= 3) urgencyScore += 20;
    if (metrics.scansUsedToday >= 5) urgencyScore += 10;

    // Engagement scoring
    if (metrics.timeSpentToday >= 30) urgencyScore += 15;
    if (metrics.timeSpentToday >= 60) urgencyScore += 10;
    if (metrics.consecutiveDaysActive >= 3) urgencyScore += 15;
    if (metrics.consecutiveDaysActive >= 7) urgencyScore += 10;

    // Weekly momentum scoring
    if (metrics.agentsUsedThisWeek >= 10) urgencyScore += 20;
    if (metrics.tasksCompletedThisWeek >= 20) urgencyScore += 15;

    return Math.min(urgencyScore, 100);
  }, []);

  // Calculate value realized from platform usage
  const calculateValueRealized = useCallback((metrics: UsageMetrics): number => {
    let valueScore = 0;

    // Task completion value
    valueScore += Math.min(metrics.tasksCompletedThisWeek * 3, 40);
    
    // Agent diversity value
    const agentDiversity = Math.min(metrics.agentsUsedThisWeek * 8, 30);
    valueScore += agentDiversity;

    // Consistency value
    if (metrics.consecutiveDaysActive >= 3) valueScore += 15;
    if (metrics.consecutiveDaysActive >= 7) valueScore += 15;

    return Math.min(valueScore, 100);
  }, []);

  // Generate pricing recommendations based on usage
  const generatePricingRecommendation = useCallback((
    metrics: UsageMetrics, 
    urgency: number, 
    value: number
  ): PricingRecommendation | null => {
    if (currentTier !== 'free') return null;

    const recommendations: PricingRecommendation[] = [];

    // Critical usage limit recommendations
    if (metrics.agentsUsedToday >= 3 || metrics.scansUsedToday >= 3) {
      recommendations.push({
        targetTier: 'starter',
        urgency: 'critical',
        confidence: 95,
        reasons: [
          'You\'ve hit usage limits today',
          'Starter Hustler provides 6 agents + 50 scans/month',
          'Avoid interruptions to your workflow'
        ],
        potentialRevenue: 27,
        triggerType: 'usage_limit',
        timeLeft: 'Limited time: End of business day'
      });
    }

    // High velocity recommendations
    if (metrics.agentsUsedThisWeek >= 8 || metrics.tasksCompletedThisWeek >= 15) {
      recommendations.push({
        targetTier: 'starter',
        urgency: 'high',
        confidence: 87,
        reasons: [
          'High usage velocity detected',
          'You\'re clearly seeing value from automation',
          'Unlock 6+ agents for maximum productivity'
        ],
        potentialRevenue: 27,
        triggerType: 'velocity',
        discountOffered: 15
      });
    }

    // Value demonstration recommendations
    if (value >= 60 && urgency >= 40) {
      recommendations.push({
        targetTier: 'star',
        urgency: 'medium',
        confidence: 78,
        reasons: [
          'You\'ve realized significant value already',
          'Business Dominator tier offers 10 agents + advanced analytics',
          'Scale your success with complete automation'
        ],
        potentialRevenue: 67,
        triggerType: 'value_demonstration'
      });
    }

    // Competitive pressure recommendations
    if (metrics.consecutiveDaysActive >= 5) {
      recommendations.push({
        targetTier: 'starter',
        urgency: 'medium',
        confidence: 65,
        reasons: [
          'You\'re committed to automation success',
          'Your competitors are likely upgrading',
          'Lock in your competitive advantage now'
        ],
        potentialRevenue: 27,
        triggerType: 'competitive_pressure',
        discountOffered: 20
      });
    }

    // Return highest confidence recommendation
    return recommendations.length > 0 
      ? recommendations.sort((a, b) => b.confidence - a.confidence)[0]
      : null;
  }, [currentTier]);

  // Track usage events
  const trackUsage = useCallback(async (type: string, metadata: any = {}) => {
    if (!user?.id) return;

    try {
      // Track in analytics
      await trackFunnelEvent({
        event_type: 'feature_use',
        user_id: user.id,
        session_id: `usage_${Date.now()}`,
        feature_name: type,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          current_tier: currentTier
        }
      });

      // Update local usage metrics
      const today = new Date().toDateString();
      const isToday = new Date(usage.lastActiveDate).toDateString() === today;

      setUsage(prev => {
        const updated = { ...prev };
        
        switch (type) {
          case 'agent_launch':
            updated.agentsUsedToday = isToday ? prev.agentsUsedToday + 1 : 1;
            updated.agentsUsedThisWeek = prev.agentsUsedThisWeek + 1;
            break;
          case 'percy_scan':
            updated.scansUsedToday = isToday ? prev.scansUsedToday + 1 : 1;
            updated.scansUsedThisWeek = prev.scansUsedThisWeek + 1;
            break;
          case 'task_completed':
            updated.tasksCompletedToday = isToday ? prev.tasksCompletedToday + 1 : 1;
            updated.tasksCompletedThisWeek = prev.tasksCompletedThisWeek + 1;
            break;
          case 'session_time':
            const sessionMinutes = metadata.minutes || 0;
            updated.timeSpentToday = isToday ? prev.timeSpentToday + sessionMinutes : sessionMinutes;
            break;
        }

        updated.lastActiveDate = new Date().toISOString();
        return updated;
      });

    } catch (error) {
      console.error('Failed to track usage:', error);
    }
  }, [user?.id, currentTier, usage.lastActiveDate]);

  // Get contextual upgrade message
  const getUpgradeMessage = useCallback((): string => {
    if (!recommendation) return '';

    const messages = {
      'usage_limit': '🚨 You\'ve hit your daily limits! Upgrade now to keep the momentum going.',
      'velocity': '🔥 Your automation velocity is impressive! Unlock more agents to scale faster.',
      'value_demonstration': '📈 You\'ve proven automation works for you. Ready for the next level?',
      'competitive_pressure': '⚡ While you automate, competitors are still manual. Widen your advantage!'
    };

    return messages[recommendation.triggerType] || 'Upgrade to unlock your full potential!';
  }, [recommendation]);

  // Determine if upgrade prompt should show
  const shouldShowUpgradePrompt = useCallback((): boolean => {
    if (!recommendation || currentTier !== 'free') return false;
    
    // Show critical prompts immediately
    if (recommendation.urgency === 'critical') return true;
    
    // Show high urgency if user has demonstrated value
    if (recommendation.urgency === 'high' && valueRealized >= 50) return true;
    
    // Show medium urgency after sustained usage
    if (recommendation.urgency === 'medium' && upgradeUrgency >= 60) return true;
    
    return false;
  }, [recommendation, currentTier, valueRealized, upgradeUrgency]);

  // Fetch usage data from backend
  const fetchUsageData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      // Get user's current tier
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status, user_role')
        .eq('id', user.id)
        .single();

      if (profile) {
        setCurrentTier(profile.user_role || 'free');
      }

      // Get usage metrics from the past week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const { data: events } = await supabase
        .from('user_funnel_events')
        .select('*')
        .eq('user_id', user.id)
        .gte('timestamp', oneWeekAgo.toISOString());

      if (events) {
        const today = new Date().toDateString();
        const metrics: UsageMetrics = {
          agentsUsedToday: 0,
          agentsUsedThisWeek: 0,
          scansUsedToday: 0,
          scansUsedThisWeek: 0,
          tasksCompletedToday: 0,
          tasksCompletedThisWeek: 0,
          timeSpentToday: 0,
          averageSessionLength: 0,
          consecutiveDaysActive: 0,
          lastActiveDate: new Date().toISOString()
        };

        // Process events to calculate metrics
        events.forEach(event => {
          const eventDate = new Date(event.timestamp).toDateString();
          const isToday = eventDate === today;

          switch (event.event_type) {
            case 'agent_launch':
              metrics.agentsUsedThisWeek++;
              if (isToday) metrics.agentsUsedToday++;
              break;
            case 'feature_use':
              if (event.feature_name === 'percy_scan') {
                metrics.scansUsedThisWeek++;
                if (isToday) metrics.scansUsedToday++;
              }
              break;
            case 'workflow_complete':
              metrics.tasksCompletedThisWeek++;
              if (isToday) metrics.tasksCompletedToday++;
              break;
          }
        });

        // Calculate consecutive days active
        const uniqueDays = Array.from(new Set(events.map(e => new Date(e.timestamp).toDateString())));
        metrics.consecutiveDaysActive = uniqueDays.length;

        setUsage(metrics);

        // Calculate scores
        const urgencyScore = calculateUpgradeUrgency(metrics);
        const valueScore = calculateValueRealized(metrics);
        
        setUpgradeUrgency(urgencyScore);
        setValueRealized(valueScore);

        // Generate recommendation
        const rec = generatePricingRecommendation(metrics, urgencyScore, valueScore);
        setRecommendation(rec);
      }

    } catch (error) {
      console.error('Failed to fetch usage data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, calculateUpgradeUrgency, calculateValueRealized, generatePricingRecommendation]);

  // Refresh usage data
  const refreshUsage = useCallback(() => {
    fetchUsageData();
  }, [fetchUsageData]);

  // Initialize on mount and user change
  useEffect(() => {
    if (user?.id) {
      fetchUsageData();
    }
  }, [user?.id, fetchUsageData]);

  // Track session time
  useEffect(() => {
    const startTime = Date.now();
    
    const trackSession = () => {
      const sessionMinutes = Math.floor((Date.now() - startTime) / 60000);
      if (sessionMinutes > 0) {
        trackUsage('session_time', { minutes: sessionMinutes });
      }
    };

    const interval = setInterval(trackSession, 60000); // Track every minute
    window.addEventListener('beforeunload', trackSession);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', trackSession);
      trackSession();
    };
  }, [trackUsage]);

  return {
    usage,
    currentTier,
    recommendation,
    isLoading,
    upgradeUrgency,
    valueRealized,
    trackUsage,
    getUpgradeMessage,
    shouldShowUpgradePrompt,
    refreshUsage
  };
} 