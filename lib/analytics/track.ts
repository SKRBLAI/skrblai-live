/**
 * Universal Analytics Tracking System
 * 
 * Provides a unified interface for tracking events across the application.
 * Supports multiple analytics providers and custom event tracking.
 */

export interface AnalyticsEvent {
  event_type: string;
  user_id?: string;
  session_id?: string;
  page_path?: string;
  vertical?: 'business' | 'sports';
  metadata?: Record<string, any>;
  timestamp?: string;
}

/**
 * Track a custom analytics event
 */
export async function track(event: AnalyticsEvent): Promise<void> {
  try {
    // Ensure timestamp is set
    const eventWithTimestamp = {
      ...event,
      timestamp: event.timestamp || new Date().toISOString()
    };

    // Send to our analytics API
    const response = await fetch('/api/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventWithTimestamp)
    });

    if (!response.ok) {
      console.warn('Analytics tracking failed:', response.statusText);
    }

    // Also send to Google Analytics if available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event.event_type, {
        custom_parameter: true,
        vertical: event.vertical,
        page_path: event.page_path,
        ...event.metadata
      });
    }

    console.log('📊 Analytics tracked:', event.event_type, event.metadata);
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
}

/**
 * Quick Win Events
 */
export const quickWins = {
  assigned: (data: { user_id: string; plan: string; count: number; vertical?: string }) =>
    track({
      event_type: 'quickWins.assigned',
      user_id: data.user_id,
      vertical: data.vertical as 'business' | 'sports',
      metadata: {
        plan: data.plan,
        count: data.count
      }
    }),

  used: (data: { user_id: string; quick_win_id: string; vertical?: string }) =>
    track({
      event_type: 'quickWins.used',
      user_id: data.user_id,
      vertical: data.vertical as 'business' | 'sports',
      metadata: {
        quick_win_id: data.quick_win_id
      }
    })
};

/**
 * Percy Popup Events
 */
export const percy = {
  popupOpened: (data: { trigger: string; page_path: string; vertical?: string }) =>
    track({
      event_type: 'percy.popup.opened',
      page_path: data.page_path,
      vertical: data.vertical as 'business' | 'sports',
      metadata: {
        trigger: data.trigger
      }
    }),

  popupEngagement: (data: { action: string; agent_id?: string; page_path: string; vertical?: string }) =>
    track({
      event_type: 'percy.popup.engagement',
      page_path: data.page_path,
      vertical: data.vertical as 'business' | 'sports',
      metadata: {
        action: data.action,
        agent_id: data.agent_id
      }
    })
};

/**
 * SkillSmith Popup Events
 */
export const skillsmith = {
  popupOpened: (data: { trigger: string; page_path: string }) =>
    track({
      event_type: 'skillsmith.popup.opened',
      page_path: data.page_path,
      vertical: 'sports',
      metadata: {
        trigger: data.trigger
      }
    }),

  popupEngagement: (data: { action: string; addon_sku?: string; page_path: string }) =>
    track({
      event_type: 'skillsmith.popup.engagement',
      page_path: data.page_path,
      vertical: 'sports',
      metadata: {
        action: data.action,
        addon_sku: data.addon_sku
      }
    })
};

/**
 * Add-on Purchase Events
 */
export const addOns = {
  purchased: (data: { 
    user_id: string; 
    sku: string; 
    price: number; 
    vertical: string;
    promo_active?: boolean;
  }) =>
    track({
      event_type: 'addOn.purchased',
      user_id: data.user_id,
      vertical: data.vertical as 'business' | 'sports',
      metadata: {
        sku: data.sku,
        price: data.price,
        promo_active: data.promo_active
      }
    }),

  viewed: (data: { sku: string; vertical: string; page_path: string }) =>
    track({
      event_type: 'addOn.viewed',
      page_path: data.page_path,
      vertical: data.vertical as 'business' | 'sports',
      metadata: {
        sku: data.sku
      }
    })
};

/**
 * Exit Intent Events
 */
export const exitIntent = {
  opened: (data: { page_path: string; offer_type: string; vertical?: string }) =>
    track({
      event_type: 'exitIntent.opened',
      page_path: data.page_path,
      vertical: data.vertical as 'business' | 'sports',
      metadata: {
        offer_type: data.offer_type
      }
    }),

  leadCaptured: (data: { 
    email: string; 
    page_path: string; 
    offer_type: string; 
    vertical?: string;
  }) =>
    track({
      event_type: 'lead.captured',
      page_path: data.page_path,
      vertical: data.vertical as 'business' | 'sports',
      metadata: {
        email: data.email,
        offer_type: data.offer_type,
        source: 'exit_intent'
      }
    })
};

/**
 * Lead Capture Events (general)
 */
export const leads = {
  captured: (data: {
    email: string;
    source: string;
    page_path: string;
    vertical?: string;
    offer_type?: string;
  }) =>
    track({
      event_type: 'lead.captured',
      page_path: data.page_path,
      vertical: data.vertical as 'business' | 'sports',
      metadata: {
        email: data.email,
        source: data.source,
        offer_type: data.offer_type
      }
    }),

  qualified: (data: { email: string; score: number; vertical?: string }) =>
    track({
      event_type: 'lead.qualified',
      vertical: data.vertical as 'business' | 'sports',
      metadata: {
        email: data.email,
        score: data.score
      }
    })
};

/**
 * Pricing Events
 */
export const pricing = {
  planViewed: (data: { plan: string; vertical: string; page_path: string }) =>
    track({
      event_type: 'pricing.plan.viewed',
      page_path: data.page_path,
      vertical: data.vertical as 'business' | 'sports',
      metadata: {
        plan: data.plan
      }
    }),

  checkoutStarted: (data: { 
    plan: string; 
    vertical: string; 
    user_id?: string;
    addons?: string[];
  }) =>
    track({
      event_type: 'pricing.checkout.started',
      user_id: data.user_id,
      vertical: data.vertical as 'business' | 'sports',
      metadata: {
        plan: data.plan,
        addons: data.addons
      }
    })
};

/**
 * Page View Tracking
 */
export const pageView = (data: { 
  page_path: string; 
  vertical?: string; 
  user_id?: string;
  referrer?: string;
}) =>
  track({
    event_type: 'page.viewed',
    user_id: data.user_id,
    page_path: data.page_path,
    vertical: data.vertical as 'business' | 'sports',
    metadata: {
      referrer: data.referrer
    }
  });

/**
 * Session Tracking
 */
export const session = {
  started: (data: { session_id: string; user_id?: string; vertical?: string }) =>
    track({
      event_type: 'session.started',
      user_id: data.user_id,
      session_id: data.session_id,
      vertical: data.vertical as 'business' | 'sports'
    }),

  ended: (data: { session_id: string; duration: number; user_id?: string }) =>
    track({
      event_type: 'session.ended',
      user_id: data.user_id,
      session_id: data.session_id,
      metadata: {
        duration: data.duration
      }
    })
};

/**
 * Batch tracking for multiple events
 */
export async function trackBatch(events: AnalyticsEvent[]): Promise<void> {
  try {
    const eventsWithTimestamp = events.map(event => ({
      ...event,
      timestamp: event.timestamp || new Date().toISOString()
    }));

    const response = await fetch('/api/analytics/events/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ events: eventsWithTimestamp })
    });

    if (!response.ok) {
      console.warn('Batch analytics tracking failed:', response.statusText);
    }

    console.log(`📊 Batch analytics tracked: ${events.length} events`);
  } catch (error) {
    console.error('Batch analytics tracking error:', error);
  }
}

/**
 * Client-side initialization
 */
export function initializeAnalytics(): void {
  if (typeof window === 'undefined') return;

  // Track page views automatically
  const originalPushState = window.history.pushState;
  const originalReplaceState = window.history.replaceState;

  window.history.pushState = function(...args) {
    originalPushState.apply(window.history, args);
    setTimeout(() => {
      pageView({ 
        page_path: window.location.pathname,
        referrer: document.referrer 
      });
    }, 0);
  };

  window.history.replaceState = function(...args) {
    originalReplaceState.apply(window.history, args);
    setTimeout(() => {
      pageView({ 
        page_path: window.location.pathname,
        referrer: document.referrer 
      });
    }, 0);
  };

  // Track initial page view
  pageView({ 
    page_path: window.location.pathname,
    referrer: document.referrer 
  });

  console.log('📊 Analytics initialized');
}