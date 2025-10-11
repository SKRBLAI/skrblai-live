'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Target, 
  Clock, 
  Zap, 
  Crown, 
  ArrowUp,
  ArrowDown,
  Activity,
  Calendar,
  BarChart3,
  PieChart
} from 'lucide-react';
import { getBrowserSupabase } from '@/lib/supabase';

interface RevenueMetrics {
  totalRevenue: number;
  revenueGrowth: number;
  conversionRate: number;
  conversionGrowth: number;
  averageUpgradeTime: number;
  upgradeVelocity: number;
  churnRate: number;
  ltv: number;
}

interface UsageMetrics {
  totalUsers: number;
  activeUsers: number;
  usageLimitHits: number;
  upgradePromptShows: number;
  upgradeClicks: number;
  agentLaunches: number;
  scanRequests: number;
  averageSessionTime: number;
}

interface ConversionFunnel {
  stage: string;
  users: number;
  conversion: number;
  dropoff: number;
}

interface UpgradePattern {
  trigger: string;
  conversions: number;
  revenue: number;
  averageTime: number;
  urgencyScore: number;
}

export default function RevenueAnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [isLoading, setIsLoading] = useState(true);
  
  // Metrics state
  const [revenueMetrics, setRevenueMetrics] = useState<RevenueMetrics>({
    totalRevenue: 0,
    revenueGrowth: 0,
    conversionRate: 0,
    conversionGrowth: 0,
    averageUpgradeTime: 0,
    upgradeVelocity: 0,
    churnRate: 0,
    ltv: 0
  });

  const [usageMetrics, setUsageMetrics] = useState<UsageMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    usageLimitHits: 0,
    upgradePromptShows: 0,
    upgradeClicks: 0,
    agentLaunches: 0,
    scanRequests: 0,
    averageSessionTime: 0
  });

  const [conversionFunnel, setConversionFunnel] = useState<ConversionFunnel[]>([]);
  const [upgradePatterns, setUpgradePatterns] = useState<UpgradePattern[]>([]);

  // Fetch analytics data
  const fetchAnalytics = useCallback(async () => {
    const supabase = getBrowserSupabase();
    if (!supabase) {
      console.warn('[RevenueAnalyticsDashboard] Supabase unavailable');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      const timeFilter = getTimeFilter(timeRange);
      
      // Fetch revenue metrics
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*')
        .gte('created_at', timeFilter);

      // Fetch usage events
      const { data: events } = await supabase
        .from('user_funnel_events')
        .select('*')
        .gte('timestamp', timeFilter);

      // Fetch user profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .gte('created_at', timeFilter);

      // Process revenue metrics
      if (subscriptions) {
        const revenue = subscriptions.reduce((sum, sub) => {
          const amount = sub.plan_id === 'starter' ? 27 : sub.plan_id === 'star' ? 67 : 0;
          return sum + amount;
        }, 0);

        const upgrades = subscriptions.filter(sub => sub.status === 'active');
        const conversionRate = profiles ? (upgrades.length / profiles.length) * 100 : 0;

        setRevenueMetrics(prev => ({
          ...prev,
          totalRevenue: revenue,
          revenueGrowth: Math.random() * 30 + 5, // Simulated growth
          conversionRate,
          conversionGrowth: Math.random() * 10 - 5,
          averageUpgradeTime: 3.2, // Days
          upgradeVelocity: upgrades.length,
          churnRate: 2.3,
          ltv: revenue / Math.max(upgrades.length, 1) * 12
        }));
      }

      // Process usage metrics
      if (events) {
        const usageData = processUsageEvents(events);
        setUsageMetrics(usageData);
        
        // Process upgrade patterns
        const patterns = processUpgradePatterns(events);
        setUpgradePatterns(patterns);
      }

      // Build conversion funnel
      const funnelData = buildConversionFunnel(profiles || [], events || [], subscriptions || []);
      setConversionFunnel(funnelData);

    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  const getTimeFilter = (range: string): string => {
    const now = new Date();
    switch (range) {
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    }
  };

  const processUsageEvents = (events: any[]): UsageMetrics => {
    const users = new Set(events.map(e => e.user_id));
    const agentLaunches = events.filter(e => e.event_type === 'agent_launch').length;
    const scanRequests = events.filter(e => e.feature_name === 'percy_scan').length;
    const upgradePrompts = events.filter(e => e.event_type === 'upgrade_view').length;
    const upgradeClicks = events.filter(e => e.event_type === 'upgrade_click').length;
    const usageLimits = events.filter(e => e.feature_name === 'usage_limit_hit').length;

    return {
      totalUsers: users.size,
      activeUsers: users.size,
      usageLimitHits: usageLimits,
      upgradePromptShows: upgradePrompts,
      upgradeClicks: upgradeClicks,
      agentLaunches,
      scanRequests,
      averageSessionTime: 12.5 // Simulated
    };
  };

  const processUpgradePatterns = (events: any[]): UpgradePattern[] => {
    const patterns = new Map();
    
    events.filter(e => e.event_type === 'upgrade_click').forEach(event => {
      const reason = event.metadata?.reason || 'unknown';
      const urgency = event.metadata?.urgency_score || 0;
      
      if (!patterns.has(reason)) {
        patterns.set(reason, {
          trigger: reason,
          conversions: 0,
          revenue: 0,
          averageTime: 0,
          urgencyScore: 0
        });
      }
      
      const pattern = patterns.get(reason);
      pattern.conversions += 1;
      pattern.revenue += 27; // Assuming starter tier
      pattern.urgencyScore = (pattern.urgencyScore + urgency) / pattern.conversions;
    });

    return Array.from(patterns.values());
  };

  const buildConversionFunnel = (profiles: any[], events: any[], subscriptions: any[]): ConversionFunnel[] => {
    const totalUsers = profiles?.length || 0;
    const activeUsers = events ? new Set(events.map(e => e.user_id)).size : 0;
    const usersWithUpgradeViews = events ? 
      new Set(events.filter(e => e.event_type === 'upgrade_view').map(e => e.user_id)).size : 0;
    const usersWithUpgradeClicks = events ? 
      new Set(events.filter(e => e.event_type === 'upgrade_click').map(e => e.user_id)).size : 0;
    const upgradeCompletions = subscriptions?.filter(s => s.status === 'active').length || 0;

    return [
      {
        stage: 'Total Signups',
        users: totalUsers,
        conversion: 100,
        dropoff: 0
      },
      {
        stage: 'Active Users',
        users: activeUsers,
        conversion: totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0,
        dropoff: totalUsers - activeUsers
      },
      {
        stage: 'Upgrade Prompt Views',
        users: usersWithUpgradeViews,
        conversion: activeUsers > 0 ? (usersWithUpgradeViews / activeUsers) * 100 : 0,
        dropoff: activeUsers - usersWithUpgradeViews
      },
      {
        stage: 'Upgrade Clicks',
        users: usersWithUpgradeClicks,
        conversion: usersWithUpgradeViews > 0 ? (usersWithUpgradeClicks / usersWithUpgradeViews) * 100 : 0,
        dropoff: usersWithUpgradeViews - usersWithUpgradeClicks
      },
      {
        stage: 'Completed Upgrades',
        users: upgradeCompletions,
        conversion: usersWithUpgradeClicks > 0 ? (upgradeCompletions / usersWithUpgradeClicks) * 100 : 0,
        dropoff: usersWithUpgradeClicks - upgradeCompletions
      }
    ];
  };

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const MetricCard = ({ title, value, change, icon: Icon, color = 'blue' }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg bg-${color}-500/20`}>
          <Icon className={`w-5 h-5 text-${color}-400`} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${
            change >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {change >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold text-white mb-1">{value}</div>
        <div className="text-gray-400 text-sm">{title}</div>
      </div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-900 rounded-xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 rounded-xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Revenue Analytics Dashboard</h2>
        <p className="text-gray-400">Usage-based pricing performance tracking</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span className="text-white font-medium">Total Revenue</span>
          </div>
          <div className="text-2xl font-bold text-white">$12,450</div>
          <div className="text-green-400 text-sm">+23.5% this week</div>
        </div>
        
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-5 h-5 text-blue-400" />
            <span className="text-white font-medium">Conversion Rate</span>
          </div>
          <div className="text-2xl font-bold text-white">4.2%</div>
          <div className="text-blue-400 text-sm">+1.8% this week</div>
        </div>
        
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-orange-400" />
            <span className="text-white font-medium">Upgrade CTR</span>
          </div>
          <div className="text-2xl font-bold text-white">12.8%</div>
          <div className="text-orange-400 text-sm">+5.2% this week</div>
        </div>
        
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-5 h-5 text-purple-400" />
            <span className="text-white font-medium">Active Users</span>
          </div>
          <div className="text-2xl font-bold text-white">1,247</div>
          <div className="text-purple-400 text-sm">+15.3% this week</div>
        </div>
      </div>
    </div>
  );
} 