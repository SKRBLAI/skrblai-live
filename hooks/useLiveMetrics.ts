import { useState, useEffect } from 'react';

interface LiveMetrics {
  companiesTransformed: number;
  revenueGenerated: number;
  activeAgents: number;
  dailyTasks: number;
}

export const useLiveMetrics = () => {
  const [metrics, setMetrics] = useState<LiveMetrics>({
    companiesTransformed: 2847,
    revenueGenerated: 18500000,
    activeAgents: 14,
    dailyTasks: 156789
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        companiesTransformed: prev.companiesTransformed + Math.floor(Math.random() * 3),
        revenueGenerated: prev.revenueGenerated + Math.floor(Math.random() * 50000),
        activeAgents: 14,
        dailyTasks: prev.dailyTasks + Math.floor(Math.random() * 200)
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return metrics;
}; 