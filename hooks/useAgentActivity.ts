/**
 * Supabase Realtime Hook for Agent Activity Tracking
 * 
 * Subscribes to agent_usage_stats table changes and provides live updates
 * on agent activity across the platform.
 * 
 * @version 1.0.0
 * @author SKRBL AI Team
 */

import { useState, useEffect } from 'react';
import { getBrowserSupabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface AgentActivity {
  agentId: string;
  agentName: string;
  timestamp: Date;
  action?: 'chat' | 'task' | 'recommendation' | 'workflow';
  userId?: string;
  metadata?: Record<string, any>;
}

export interface AgentStatus {
  agentId: string;
  agentName: string;
  status: 'idle' | 'working' | 'available';
  lastActivity?: Date;
  activeUsers?: number;
}

// =============================================================================
// CORE SUBSCRIPTION FUNCTIONS
// =============================================================================

/**
 * Subscribe to agent activity updates
 * @param callback - Function to call when activity is detected
 * @returns Cleanup function to unsubscribe
 */
export function subscribeToAgentActivity(
  callback: (activity: AgentActivity) => void
): () => void {
  const supabase = getBrowserSupabase();
  
  if (!supabase) {
    console.warn('[AgentActivity] Supabase client unavailable');
    return () => {}; // Return no-op cleanup
  }

  let channel: RealtimeChannel | null = null;

  try {
    channel = supabase
      .channel('agent-activity')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agent_usage_stats'
        },
        (payload) => {
          try {
            const activity: AgentActivity = {
              agentId: payload.new.agent_id || 'unknown',
              agentName: payload.new.agent_name || 'Unknown Agent',
              timestamp: new Date(payload.new.created_at || payload.new.updated_at || new Date()),
              action: payload.new.action_type || 'task',
              userId: payload.new.user_id,
              metadata: payload.new.metadata
            };
            
            callback(activity);
          } catch (error) {
            console.error('[AgentActivity] Error processing payload:', error);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[AgentActivity] Successfully subscribed to agent activity');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[AgentActivity] Subscription error');
        }
      });
  } catch (error) {
    console.error('[AgentActivity] Failed to create subscription:', error);
  }

  // Return cleanup function
  return () => {
    if (channel) {
      supabase.removeChannel(channel);
      console.log('[AgentActivity] Unsubscribed from agent activity');
    }
  };
}

/**
 * Subscribe to specific agent's activity
 * @param agentId - ID of the agent to track
 * @param callback - Function to call when activity is detected
 * @returns Cleanup function to unsubscribe
 */
export function subscribeToSpecificAgent(
  agentId: string,
  callback: (activity: AgentActivity) => void
): () => void {
  const supabase = getBrowserSupabase();
  
  if (!supabase) {
    console.warn('[AgentActivity] Supabase client unavailable');
    return () => {};
  }

  let channel: RealtimeChannel | null = null;

  try {
    channel = supabase
      .channel(`agent-activity-${agentId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'agent_usage_stats',
          filter: `agent_id=eq.${agentId}`
        },
        (payload) => {
          try {
            const activity: AgentActivity = {
              agentId: payload.new.agent_id,
              agentName: payload.new.agent_name,
              timestamp: new Date(payload.new.created_at || payload.new.updated_at),
              action: payload.new.action_type,
              userId: payload.new.user_id,
              metadata: payload.new.metadata
            };
            
            callback(activity);
          } catch (error) {
            console.error('[AgentActivity] Error processing payload:', error);
          }
        }
      )
      .subscribe();
  } catch (error) {
    console.error('[AgentActivity] Failed to create agent-specific subscription:', error);
  }

  return () => {
    if (channel) {
      supabase.removeChannel(channel);
    }
  };
}

// =============================================================================
// REACT HOOKS
// =============================================================================

/**
 * React hook to track agent activity in real-time
 * @param maxActivities - Maximum number of activities to keep in state (default: 10)
 * @returns Array of recent agent activities
 */
export function useAgentActivity(maxActivities: number = 10): AgentActivity[] {
  const [activities, setActivities] = useState<AgentActivity[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToAgentActivity((newActivity) => {
      setActivities(prev => {
        const updated = [newActivity, ...prev].slice(0, maxActivities);
        return updated;
      });
    });

    return unsubscribe;
  }, [maxActivities]);

  return activities;
}

/**
 * React hook to track a specific agent's activity
 * @param agentId - ID of the agent to track
 * @param maxActivities - Maximum number of activities to keep in state
 * @returns Array of recent activities for the specified agent
 */
export function useSpecificAgentActivity(
  agentId: string,
  maxActivities: number = 10
): AgentActivity[] {
  const [activities, setActivities] = useState<AgentActivity[]>([]);

  useEffect(() => {
    if (!agentId) return;

    const unsubscribe = subscribeToSpecificAgent(agentId, (newActivity) => {
      setActivities(prev => {
        const updated = [newActivity, ...prev].slice(0, maxActivities);
        return updated;
      });
    });

    return unsubscribe;
  }, [agentId, maxActivities]);

  return activities;
}

/**
 * React hook to track agent status (idle, working, available)
 * @returns Map of agent statuses by agent ID
 */
export function useAgentStatus(): Map<string, AgentStatus> {
  const [statusMap, setStatusMap] = useState<Map<string, AgentStatus>>(new Map());

  useEffect(() => {
    const unsubscribe = subscribeToAgentActivity((activity) => {
      setStatusMap(prev => {
        const updated = new Map(prev);
        const existing = updated.get(activity.agentId);
        
        updated.set(activity.agentId, {
          agentId: activity.agentId,
          agentName: activity.agentName,
          status: 'working', // Agent is active if we just received activity
          lastActivity: activity.timestamp,
          activeUsers: existing ? (existing.activeUsers || 0) + 1 : 1
        });
        
        return updated;
      });

      // After 5 seconds, mark agent as available
      setTimeout(() => {
        setStatusMap(prev => {
          const updated = new Map(prev);
          const current = updated.get(activity.agentId);
          if (current && current.lastActivity === activity.timestamp) {
            updated.set(activity.agentId, {
              ...current,
              status: 'available'
            });
          }
          return updated;
        });
      }, 5000);
    });

    return unsubscribe;
  }, []);

  return statusMap;
}

/**
 * React hook to get live activity feed with formatted data
 * @param maxActivities - Maximum number of activities to keep
 * @returns Formatted activity feed with readable timestamps
 */
export function useAgentActivityFeed(maxActivities: number = 20): Array<AgentActivity & { timeAgo: string }> {
  const activities = useAgentActivity(maxActivities);

  return activities.map(activity => ({
    ...activity,
    timeAgo: formatTimeAgo(activity.timestamp)
  }));
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Format timestamp as "time ago" string
 * @param date - Date to format
 * @returns Formatted string like "2 minutes ago"
 */
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

/**
 * Manually log agent activity (for when realtime isn't available)
 * @param activity - Activity to log
 */
export async function logAgentActivity(activity: Omit<AgentActivity, 'timestamp'>): Promise<void> {
  const supabase = getBrowserSupabase();
  
  if (!supabase) {
    console.warn('[AgentActivity] Supabase client unavailable');
    return;
  }

  try {
    await supabase
      .from('agent_usage_stats')
      .insert({
        agent_id: activity.agentId,
        agent_name: activity.agentName,
        action_type: activity.action || 'task',
        user_id: activity.userId,
        metadata: activity.metadata,
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('[AgentActivity] Failed to log activity:', error);
  }
}

/**
 * Get recent agent activity from database (not realtime)
 * @param limit - Number of activities to fetch
 * @returns Array of recent activities
 */
export async function getRecentAgentActivity(limit: number = 50): Promise<AgentActivity[]> {
  const supabase = getBrowserSupabase();
  
  if (!supabase) {
    console.warn('[AgentActivity] Supabase client unavailable');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('agent_usage_stats')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map(row => ({
      agentId: row.agent_id,
      agentName: row.agent_name,
      timestamp: new Date(row.created_at),
      action: row.action_type,
      userId: row.user_id,
      metadata: row.metadata
    }));
  } catch (error) {
    console.error('[AgentActivity] Failed to fetch recent activity:', error);
    return [];
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default useAgentActivity;

