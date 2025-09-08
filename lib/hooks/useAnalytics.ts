import { useEffect } from 'react';
import { trackPageView, trackAgentInteraction, trackUpgradePrompt } from '../analytics/userJourney';

export function usePageTracking(source: string, pathname: string) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userRole = localStorage.getItem('userRole') || 'client';
      trackPageView(source, pathname, undefined, userRole);
    }
  }, [source, pathname]);
}

export function useAgentTracking() {
  const trackAgent = (agentId: string, action: string) => {
    const userRole = localStorage.getItem('userRole') || 'client';
    trackAgentInteraction(agentId, action, undefined, userRole);
  };

  return { trackAgent };
}

export function useUpgradeTracking() {
  const trackUpgrade = (feature: string, currentRole: string, targetRole: string) => {
    trackUpgradePrompt(feature, currentRole, targetRole, undefined);
  };

  return { trackUpgrade };
} 