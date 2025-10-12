import { useState, useEffect } from 'react';
import { getBrowserSupabase } from '@/lib/supabase';
import { useAuth } from '../context/AuthContext';

interface AgentStats {
  count: number;
  lastUsed: string;
}

interface PercyAnalytics {
  [agentId: string]: AgentStats;
}

export function usePercyAnalytics(): PercyAnalytics {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<PercyAnalytics>({});

  useEffect(() => {
    if (!user) return;

    const fetchAnalytics = async () => {
      const supabase = getBrowserSupabase();
      if (!supabase) return;

      try {
        // Try to get from agent_usage table first
        const { data, error } = await supabase
          .from('agent_usage')
          .select('intent, count, updatedAt')
          .eq('userId', user.id)
          .order('count', { ascending: false });

        if (!error && data && data.length > 0) {
          const analyticsData: PercyAnalytics = {};
          data.forEach((item: any) => {
            if (item.intent) {
              analyticsData[item.intent] = {
                count: item.count || 0,
                lastUsed: item.updatedAt || new Date().toISOString()
              };
            }
          });
          setAnalytics(analyticsData);
          return;
        }

        // Fallback to workflowLogs
        const { data: logsData, error: logsError } = await supabase
          .from('workflowLogs')
          .select('agentId, created_at')
          .eq('userId', user.id)
          .order('created_at', { ascending: false });

        if (!logsError && logsData) {
          const analyticsData: PercyAnalytics = {};
          logsData.forEach((log: any) => {
            if (!log.agentId) return;

            if (!analyticsData[log.agentId]) {
              analyticsData[log.agentId] = {
                count: 1,
                lastUsed: log.created_at
              };
            } else {
              analyticsData[log.agentId].count++;
              const currentDate = new Date(analyticsData[log.agentId].lastUsed);
              const logDate = new Date(log.created_at);
              if (logDate > currentDate) {
                analyticsData[log.agentId].lastUsed = log.created_at;
              }
            }
          });
          setAnalytics(analyticsData);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };

    fetchAnalytics();
  }, [user]);

  return analytics;
}
