'use client';
import { usePercyAnalytics } from '@/components/hooks/usePercyAnalytics';
import { motion } from 'framer-motion';

export default function AgentStatsPanel() {
  const analytics = usePercyAnalytics();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-6 bg-black/50 backdrop-blur-sm p-4 rounded-lg border border-white/10 shadow-xl text-sm space-y-3"
    >
      <h3 className="text-lg font-bold text-white mb-2">📊 Agent Stats (Dev Only)</h3>
      {Object.entries(analytics).map(([agentId, data]) => (
        <div 
          key={agentId} 
          className="flex justify-between items-center p-2 hover:bg-white/5 rounded transition-colors"
        >
          <span className="text-white font-mono">{agentId}</span>
          <span className="text-teal-400">{data.count} uses</span>
          <span className="text-gray-400 text-xs">{new Date(data.lastUsed).toLocaleString()}</span>
        </div>
      ))}
    </motion.div>
  );
}
