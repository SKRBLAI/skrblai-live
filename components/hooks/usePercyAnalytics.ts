import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useAuth } from '@/components/context/AuthContext';

interface AgentStats {
  count: number;
  lastUsed: string;
}

interface PercyAnalytics {
  [agentId: string]: AgentStats;
}

// Mock data for development
const MOCK_ANALYTICS: PercyAnalytics = {
  'cursor': {
    count: 42,
    lastUsed: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  'windsurf': {
    count: 37,
    lastUsed: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  },
  'percy': {
    count: 128,
    lastUsed: new Date().toISOString()
  },
  'content-agent': {
    count: 18,
    lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  'marketing-agent': {
    count: 7,
    lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
};

export function usePercyAnalytics(): PercyAnalytics {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<PercyAnalytics>({});

  // Fetch analytics data and subscribe to updates
  useEffect(() => {
    if (!user) return;
    
    let analyticsSubscription: any = null;
    
    const fetchAnalyticsData = async () => {
      try {
        // Get agent usage data from Supabase
        const { data, error } = await supabase
          .from('agent_usage')
          .select('intent, count, updatedAt')
          .eq('userId', user.id)
          .order('count', { ascending: false });
          
        if (error) throw error;
        
        // Transform data into the expected format
        const analyticsData: PercyAnalytics = {};
        
        if (data && Array.isArray(data)) {
          data.forEach(item => {
            if (item.intent) {
              analyticsData[item.intent] = {
                count: item.count || 0,
                lastUsed: item.updatedAt || new Date().toISOString()
              };
            }
          });
        }
        
        // Fallback to workflowLogs if no agent_usage data is available
        if (Object.keys(analyticsData).length === 0) {
          const { data: logsData, error: logsError } = await supabase
            .from('workflowLogs')
            .select('agentId, created_at')
            .eq('userId', user.id)
            .order('created_at', { ascending: false });
            
          if (!logsError && logsData) {
            // Count agent usage from logs
            logsData.forEach(log => {
              if (!log.agentId) return;
              
              if (!analyticsData[log.agentId]) {
                analyticsData[log.agentId] = {
                  count: 1,
                  lastUsed: log.created_at
                };
              } else {
                analyticsData[log.agentId].count++;
                
                // Update lastUsed if this log is more recent
                const currentDate = new Date(analyticsData[log.agentId].lastUsed);
                const logDate = new Date(log.created_at);
                if (logDate > currentDate) {
                  analyticsData[log.agentId].lastUsed = log.created_at;
                }
              }
            });
          }
        }
        
        setAnalytics(analyticsData);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      }
    };

    fetchAnalyticsData();
    
    // Subscribe to agent_usage changes
    analyticsSubscription = supabase
      .channel('agent-usage-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'agent_usage', filter: `userId=eq.${user.id}` }, 
        () => {
          fetchAnalyticsData();
        }
      )
      .subscribe();
      
    // Subscribe to workflowLogs changes as well
    const logsSubscription = supabase
      .channel('workflow-logs-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'workflowLogs', filter: `userId=eq.${user.id}` }, 
        () => {
          fetchAnalyticsData();
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      if (analyticsSubscription) supabase.removeChannel(analyticsSubscription);
      if (logsSubscription) supabase.removeChannel(logsSubscription);
    };
  }, [user]);

  return analytics;
}
