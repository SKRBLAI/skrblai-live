import { useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { trackPageView, trackAgentInteraction, trackUpgradePrompt } from '@/lib/analytics/userJourney';

export function usePageTracking(source: string, pathname: string) {
  const user = useUser();
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userRole = localStorage.getItem('userRole') || 'client';
      trackPageView(source, pathname, user?.id, userRole);
    }
  }, [source, pathname, user?.id]);
}

export function useAgentTracking() {
  const user = useUser();
  
  const trackAgent = (agentId: string, action: string) => {
    const userRole = localStorage.getItem('userRole') || 'client';
    trackAgentInteraction(agentId, action, user?.id, userRole);
  };

  return { trackAgent };
}

export function useUpgradeTracking() {
  const user = useUser();
  
  const trackUpgrade = (feature: string, currentRole: string, targetRole: string) => {
    trackUpgradePrompt(feature, currentRole, targetRole, user?.id);
  };

  return { trackUpgrade };
} 