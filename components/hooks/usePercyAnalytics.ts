import { useState, useEffect } from 'react';

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
  const [analytics, setAnalytics] = useState<PercyAnalytics>(MOCK_ANALYTICS);

  // In a real implementation, this would fetch from an API
  useEffect(() => {
    // This would be replaced with actual API call
    // Example: fetchAnalytics().then(data => setAnalytics(data));
  }, []);

  return analytics;
}
