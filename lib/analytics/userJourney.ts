export interface UserJourneyEvent {
  id: string;
  userId?: string;
  sessionId: string;
  eventType: 'page_view' | 'agent_view' | 'agent_launch' | 'upgrade_prompt' | 'conversion' | 'percy_interaction';
  eventData: Record<string, any>;
  timestamp: Date;
  userRole: string;
  source: 'homepage' | 'dashboard' | 'agents_page' | 'features_page' | 'pricing_page';
  metadata: {
    userAgent: string;
    ip: string;
    referrer?: string;
    pathname: string;
  };
}

export interface ConversionFunnel {
  stage: 'awareness' | 'interest' | 'consideration' | 'trial' | 'purchase';
  events: UserJourneyEvent[];
  duration: number; // ms between stages
  dropOffRate?: number;
}

class UserJourneyTracker {
  private events: UserJourneyEvent[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async trackEvent(
    eventType: UserJourneyEvent['eventType'],
    eventData: Record<string, any>,
    options: {
      userId?: string;
      userRole?: string;
      source?: string;
      pathname?: string;
    } = {}
  ): Promise<void> {
    const event: UserJourneyEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: options.userId,
      sessionId: this.sessionId,
      eventType,
      eventData,
      timestamp: new Date(),
      userRole: options.userRole || 'anonymous',
      source: (options.source as any) || 'homepage',
      metadata: {
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
        ip: 'client-side', // Will be enriched server-side
        referrer: typeof window !== 'undefined' ? document.referrer : undefined,
        pathname: options.pathname || (typeof window !== 'undefined' ? window.location.pathname : '')
      }
    };

    this.events.push(event);

    // Send to analytics service (Supabase, Mixpanel, etc.)
    try {
      await this.persistEvent(event);
    } catch (error) {
      console.warn('Failed to persist analytics event:', error);
    }
  }

  private async persistEvent(event: UserJourneyEvent): Promise<void> {
    // Send to your analytics backend
    const response = await fetch('/api/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      throw new Error(`Analytics API error: ${response.status}`);
    }
  }

  getConversionFunnel(userId: string): ConversionFunnel[] {
    const userEvents = this.events.filter(e => e.userId === userId);
    
    // Group events into funnel stages
    const stages: ConversionFunnel[] = [];
    let currentStage: ConversionFunnel = {
      stage: 'awareness',
      events: [],
      duration: 0
    };

    for (const event of userEvents) {
      // Determine funnel stage based on event
      const stage = this.getEventFunnelStage(event);
      
      if (stage !== currentStage.stage) {
        if (currentStage.events.length > 0) {
          stages.push(currentStage);
        }
        currentStage = {
          stage,
          events: [event],
          duration: 0
        };
      } else {
        currentStage.events.push(event);
      }
    }

    if (currentStage.events.length > 0) {
      stages.push(currentStage);
    }

    // Calculate durations and drop-off rates
    return this.enrichFunnelData(stages);
  }

  private getEventFunnelStage(event: UserJourneyEvent): ConversionFunnel['stage'] {
    switch (event.eventType) {
      case 'page_view':
        if (event.source === 'homepage') return 'awareness';
        if (event.source === 'features_page') return 'interest';
        if (event.source === 'pricing_page') return 'consideration';
        return 'awareness';
      case 'agent_view':
      case 'percy_interaction':
        return 'interest';
      case 'agent_launch':
        return 'trial';
      case 'upgrade_prompt':
        return 'consideration';
      case 'conversion':
        return 'purchase';
      default:
        return 'awareness';
    }
  }

  private enrichFunnelData(stages: ConversionFunnel[]): ConversionFunnel[] {
    return stages.map((stage, index) => {
      const events = stage.events;
      const duration = events.length > 1 
        ? events[events.length - 1].timestamp.getTime() - events[0].timestamp.getTime()
        : 0;

      const dropOffRate = index < stages.length - 1 
        ? 1 - (stages[index + 1].events.length / events.length)
        : 0;

      return {
        ...stage,
        duration,
        dropOffRate
      };
    });
  }
}

export const userJourneyTracker = new UserJourneyTracker();

// Convenience functions for common tracking scenarios
export const trackPageView = (source: string, pathname: string, userId?: string, userRole?: string) => {
  return userJourneyTracker.trackEvent('page_view', { source, pathname }, { userId, userRole, source, pathname });
};

export const trackAgentInteraction = (agentId: string, action: string, userId?: string, userRole?: string) => {
  return userJourneyTracker.trackEvent('agent_view', { agentId, action }, { userId, userRole });
};

export const trackPercyInteraction = (interactionType: string, data: any, userId?: string, userRole?: string) => {
  return userJourneyTracker.trackEvent('percy_interaction', { interactionType, ...data }, { userId, userRole });
};

export const trackUpgradePrompt = (feature: string, currentRole: string, targetRole: string, userId?: string) => {
  return userJourneyTracker.trackEvent('upgrade_prompt', { feature, currentRole, targetRole }, { userId, userRole: currentRole });
};

export const trackConversion = (fromRole: string, toRole: string, revenue?: number, userId?: string) => {
  return userJourneyTracker.trackEvent('conversion', { fromRole, toRole, revenue }, { userId, userRole: toRole });
}; 