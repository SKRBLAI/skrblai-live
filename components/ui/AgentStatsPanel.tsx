'use client';
import { usePercyAnalytics } from '@/components/hooks/usePercyAnalytics';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import agentRegistry from '@/lib/agents/agentRegistry';

export default function AgentStatsPanel() {
  const analytics = usePercyAnalytics();
  const [isLoading, setIsLoading] = useState(true);

  // Format the time since last use
  const formatTimeAgo = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  // Get proper agent name from registry
  const getAgentName = (agentId: string): string => {
    const agent = agentRegistry.find(a => a.id === agentId || a.intent === agentId);
    return agent?.name || agentId;
  };

  // Set loading state based on analytics data
  useEffect(() => {
    if (Object.keys(analytics).length > 0) {
      setIsLoading(false);
    } else {
      // Set a timeout to avoid showing loading state for too long
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [analytics]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-6 bg-black/50 backdrop-blur-sm p-4 rounded-lg border border-white/10 shadow-xl text-sm space-y-3"
    >
      <h3 className="text-lg font-bold text-gradient-blue mb-2">📊 Agent Stats</h3>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-24">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-2 border-electric-blue rounded-full border-t-transparent"
          />
        </div>
      ) : Object.keys(analytics).length > 0 ? (
        // Sort entries by usage count (highest first)
        Object.entries(analytics)
          .sort(([, dataA], [, dataB]) => dataB.count - dataA.count)
          .map(([agentId, data]) => (
            <motion.div 
              key={agentId} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex justify-between items-center p-2 cosmic-glass cosmic-glow rounded-2xl shadow-xl border-2 border-teal-400/40 backdrop-blur-lg bg-[rgba(28,32,64,0.65)] transition-colors"
            >
              <div className="flex items-center">
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-electric-blue to-teal-400 flex items-center justify-center text-sm mr-2">
                  {getAgentName(agentId).charAt(0)}
                </span>
                <span className="text-white">{getAgentName(agentId)}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-teal-400 font-medium">{data.count} uses</span>
                <span className="text-gray-400 text-xs">{formatTimeAgo(data.lastUsed)}</span>
              </div>
            </motion.div>
          ))
      ) : (
        <div className="text-center text-gray-400 py-6">
          <p>No agent usage data yet.</p>
          <p className="text-sm mt-2">Try running some agents to see stats!</p>
        </div>
      )}
    </motion.div>
  );
}
