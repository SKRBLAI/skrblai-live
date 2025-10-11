/**
 * User Funnel Tracking & Analytics System
 * 
 * Tracks user journey through the platform with detailed metrics
 * for conversion optimization and user behavior analysis.
 */

import { getServerSupabaseAdmin } from '@/lib/supabase';
import { type SupabaseClient } from '@supabase/supabase-js';

interface FunnelEvent {
  event_type: 'page_view' | 'signup_start' | 'signup_complete' | 'signin_start' | 'signin_complete' | 
             'agent_view' | 'agent_launch' | 'workflow_complete' | 'upgrade_view' | 'upgrade_complete' |
             'trial_start' | 'trial_convert' | 'churn' | 'feature_use';
  user_id?: string;
  session_id: string;
  page_path?: string;
  agent_id?: string;
  workflow_id?: string;
  feature_name?: string;
  conversion_value?: number;
  metadata?: Record<string, any>;
  timestamp: string;
  user_agent?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

interface FunnelMetrics {
  totalUsers: number;
  signupRate: number;
  activationRate: number;
  retentionRate: number;
  conversionRate: number;
  averageSessionDuration: number;
  topAgents: Array<{ agentId: string; launches: number; successRate: number }>;
  dropoffPoints: Array<{ step: string; dropoffRate: number }>;
  cohortAnalysis: Array<{ cohort: string; retention: number[] }>;
}

interface UserJourney {
  userId: string;
  sessionId: string;
  events: FunnelEvent[];
  startTime: string;
  endTime?: string;
  totalDuration?: number;
  conversionEvents: number;
  lastActiveAgent?: string;
  userTier: string;
}

// Lazy initialization of Supabase client to prevent build errors
let supabaseClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabaseClient !== null) return supabaseClient;
  
  supabaseClient = getServerSupabaseAdmin();
  
  if (!supabaseClient) {
    console.warn('[Funnel Tracking] Supabase not available - analytics will be disabled');
  }
  
  return supabaseClient;
}

/**
 * Track a funnel event
 */
export async function trackFunnelEvent(event: Omit<FunnelEvent, 'timestamp'>): Promise<void> {
  try {
    // Skip if Supabase is not available
    const supabase = getSupabase();
    if (!supabase) {
      console.warn('[Funnel Tracking] Supabase not available - skipping event tracking');
      return;
    }

    const eventWithTimestamp: FunnelEvent = {
      ...event,
      timestamp: new Date().toISOString()
    };

    // Insert into analytics table
    const { error } = await supabase
      .from('user_funnel_events')
      .insert(eventWithTimestamp);

    if (error) {
      console.error('[Funnel Tracking] Failed to track event:', error);
      return;
    }

    // Update user journey cache if user is identified
    if (event.user_id) {
      await updateUserJourneyCache(event.user_id, eventWithTimestamp);
    }

    console.log(`[Funnel Tracking] Event tracked: ${event.event_type}`, {
      userId: event.user_id,
      sessionId: event.session_id,
      agentId: event.agent_id
    });

  } catch (error) {
    console.error('[Funnel Tracking] Error tracking event:', error);
  }
}

/**
 * Update user journey cache for real-time analytics
 */
async function updateUserJourneyCache(userId: string, event: FunnelEvent): Promise<void> {
  try {
    // Skip if Supabase is not available
    const supabase = getSupabase();
    if (!supabase) {
      return;
    }

    // Get or create user journey record
    const { data: existingJourney, error: fetchError } = await supabase
      .from('user_journeys')
      .select('*')
      .eq('user_id', userId)
      .eq('session_id', event.session_id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('[Journey Cache] Error fetching journey:', fetchError);
      return;
    }

    const isConversionEvent = ['signup_complete', 'agent_launch', 'workflow_complete', 'upgrade_complete'].includes(event.event_type);
    
    if (existingJourney) {
      // Update existing journey
      const updatedEvents = [...(existingJourney.events || []), event];
      const conversionEvents = existingJourney.conversion_events + (isConversionEvent ? 1 : 0);
      
      const supabase = getSupabase();
      if (supabase) {
        await supabase
          .from('user_journeys')
          .update({
            events: updatedEvents,
            end_time: event.timestamp,
            total_duration: new Date(event.timestamp).getTime() - new Date(existingJourney.start_time).getTime(),
            conversion_events: conversionEvents,
            last_active_agent: event.agent_id || existingJourney.last_active_agent,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingJourney.id);
      }
    } else {
      // Create new journey
      // No need to get Supabase again, we already have it from earlier in the function
      if (supabase) {
        await supabase
          .from('user_journeys')
          .insert({
            user_id: userId,
            session_id: event.session_id,
            events: [event],
            start_time: event.timestamp,
            end_time: event.timestamp,
            total_duration: 0,
            conversion_events: isConversionEvent ? 1 : 0,
            last_active_agent: event.agent_id,
            user_tier: 'starter' // Default, will be updated by user profile
          });
      }
    }

  } catch (error) {
    console.error('[Journey Cache] Error updating cache:', error);
  }
}

/**
 * Get funnel metrics for analytics dashboard
 */
export async function getFunnelMetrics(
  timeRange: '24h' | '7d' | '30d' | '90d' = '30d'
): Promise<FunnelMetrics> {
  try {
    // Return default metrics if Supabase is not available
    const supabase = getSupabase();
    if (!supabase) {
      console.warn('[Funnel Metrics] Supabase not available - returning default metrics');
      return {
        totalUsers: 0,
        signupRate: 0,
        activationRate: 0,
        retentionRate: 0,
        conversionRate: 0,
        averageSessionDuration: 0,
        topAgents: [],
        dropoffPoints: [],
        cohortAnalysis: []
      };
    }

    const timeRangeHours = {
      '24h': 24,
      '7d': 168,
      '30d': 720,
      '90d': 2160
    };

    const startTime = new Date(Date.now() - timeRangeHours[timeRange] * 60 * 60 * 1000).toISOString();

    // Get basic funnel metrics
    // We already have the Supabase client from earlier in the function
    const { data: events, error } = await supabase
      .from('user_funnel_events')
      .select('*')
      .gte('timestamp', startTime)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('[Funnel Metrics] Error fetching events:', error);
      throw error;
    }

    // Calculate metrics
    const totalUsers = new Set(events?.filter((e: any) => e.user_id).map((e: any) => e.user_id)).size;
    const signupStarts = events?.filter((e: any) => e.event_type === 'signup_start').length || 0;
    const signupCompletes = events?.filter((e: any) => e.event_type === 'signup_complete').length || 0;
    const agentLaunches = events?.filter((e: any) => e.event_type === 'agent_launch').length || 0;
    const workflowCompletes = events?.filter((e: any) => e.event_type === 'workflow_complete').length || 0;

    // Agent usage analysis
    const agentEvents = events?.filter((e: any) => e.agent_id) || [];
    const agentStats = agentEvents.reduce((acc: any, event: any) => {
      const agentId = event.agent_id!;
      if (!acc[agentId]) {
        acc[agentId] = { launches: 0, completes: 0 };
      }
      if (event.event_type === 'agent_launch') acc[agentId].launches++;
      if (event.event_type === 'workflow_complete') acc[agentId].completes++;
      return acc;
    }, {} as Record<string, { launches: number; completes: number }>);

    const topAgents = (Object.entries(agentStats) as [string, { launches: number; completes: number }][])
      .map(([agentId, stats]) => ({
        agentId,
        launches: stats.launches,
        successRate: stats.launches > 0 ? (stats.completes / stats.launches) * 100 : 0
      }))
      .sort((a, b) => b.launches - a.launches)
      .slice(0, 10);

    // Calculate dropoff points
    const funnelSteps = [
      { step: 'page_view', count: events?.filter((e: any) => e.event_type === 'page_view').length || 0 },
      { step: 'signup_start', count: signupStarts },
      { step: 'signup_complete', count: signupCompletes },
      { step: 'agent_launch', count: agentLaunches },
      { step: 'workflow_complete', count: workflowCompletes }
    ];

    const dropoffPoints = funnelSteps.map((step, index) => {
      const previousStep = index > 0 ? funnelSteps[index - 1] : null;
      const dropoffRate = previousStep && previousStep.count > 0 
        ? ((previousStep.count - step.count) / previousStep.count) * 100 
        : 0;
      
      return {
        step: step.step,
        dropoffRate: Math.round(dropoffRate * 100) / 100
      };
    });

    return {
      totalUsers,
      signupRate: signupStarts > 0 ? (signupCompletes / signupStarts) * 100 : 0,
      activationRate: signupCompletes > 0 ? (agentLaunches / signupCompletes) * 100 : 0,
      retentionRate: 85, // Placeholder - would need cohort analysis
      conversionRate: totalUsers > 0 ? (workflowCompletes / totalUsers) * 100 : 0,
      averageSessionDuration: 12.5, // Placeholder - would calculate from journey data
      topAgents,
      dropoffPoints,
      cohortAnalysis: [] // Placeholder - would implement cohort tracking
    };

  } catch (error) {
    console.error('[Funnel Metrics] Error calculating metrics:', error);
    throw error;
  }
}

/**
 * Get user journey for specific user
 */
export async function getUserJourney(userId: string, sessionId?: string): Promise<UserJourney | null> {
  try {
    // Return null if Supabase is not available
    const supabase = getSupabase();
    if (!supabase) {
      console.warn('[User Journey] Supabase not available - returning null');
      return null;
    }

    let query = supabase
      .from('user_journeys')
      .select('*')
      .eq('user_id', userId);

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    const { data, error } = await query
      .order('start_time', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('[User Journey] Error fetching journey:', error);
      return null;
    }

    return data as UserJourney;

  } catch (error) {
    console.error('[User Journey] Error:', error);
    return null;
  }
}

/**
 * Track page view with UTM parameters
 */
export async function trackPageView(
  sessionId: string,
  pagePath: string,
  userId?: string,
  utmParams?: { source?: string; medium?: string; campaign?: string }
): Promise<void> {
  await trackFunnelEvent({
    event_type: 'page_view',
    user_id: userId,
    session_id: sessionId,
    page_path: pagePath,
    utm_source: utmParams?.source,
    utm_medium: utmParams?.medium,
    utm_campaign: utmParams?.campaign,
    user_agent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
    referrer: typeof window !== 'undefined' ? document.referrer : undefined
  });
}

/**
 * Track agent interaction
 */
export async function trackAgentInteraction(
  sessionId: string,
  agentId: string,
  interactionType: 'view' | 'launch' | 'complete',
  userId?: string,
  metadata?: Record<string, any>
): Promise<void> {
  const eventTypeMap = {
    'view': 'agent_view' as const,
    'launch': 'agent_launch' as const,
    'complete': 'workflow_complete' as const
  };

  await trackFunnelEvent({
    event_type: eventTypeMap[interactionType],
    user_id: userId,
    session_id: sessionId,
    agent_id: agentId,
    metadata
  });
}

/**
 * Track feature usage
 */
export async function trackFeatureUsage(
  sessionId: string,
  featureName: string,
  userId?: string,
  metadata?: Record<string, any>
): Promise<void> {
  await trackFunnelEvent({
    event_type: 'feature_use',
    user_id: userId,
    session_id: sessionId,
    feature_name: featureName,
    metadata
  });
} 