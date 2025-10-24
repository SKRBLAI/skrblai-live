'use client';

import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader, Clock } from 'lucide-react';

export interface ActivityFeedItemProps {
  id: string;
  agentId: string;
  agentName: string;
  status: 'running' | 'success' | 'failed' | 'pending';
  startedAt: string;
  completedAt?: string;
  source?: string;
  errorMessage?: string;
  result?: any;
  type: 'agent_launch' | 'agent_complete' | 'agent_error';
  index?: number;
}

export function ActivityFeedItem({
  id,
  agentId,
  agentName,
  status,
  startedAt,
  completedAt,
  source,
  errorMessage,
  type,
  index = 0
}: ActivityFeedItemProps) {
  // Get icon based on status/type
  const getStatusIcon = () => {
    if (type === 'agent_launch' || status === 'running') {
      return <Loader className="w-4 h-4 text-blue-400 animate-spin" />;
    }
    if (type === 'agent_complete' || status === 'success') {
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    }
    if (type === 'agent_error' || status === 'failed') {
      return <XCircle className="w-4 h-4 text-red-400" />;
    }
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  // Get status text
  const getStatusText = () => {
    if (type === 'agent_launch' || status === 'running') {
      return 'started';
    }
    if (type === 'agent_complete' || status === 'success') {
      return 'completed';
    }
    if (type === 'agent_error' || status === 'failed') {
      return 'failed';
    }
    return 'pending';
  };

  // Get status badge styling
  const getStatusBadge = () => {
    const statusText = getStatusText();
    let badgeClasses = 'text-xs px-2 py-0.5 rounded-full font-medium';

    if (statusText === 'started' || status === 'running') {
      badgeClasses += ' bg-blue-500/20 text-blue-400 animate-pulse';
    } else if (statusText === 'completed' || status === 'success') {
      badgeClasses += ' bg-green-500/20 text-green-400';
    } else if (statusText === 'failed' || status === 'failed') {
      badgeClasses += ' bg-red-500/20 text-red-400';
    } else {
      badgeClasses += ' bg-gray-500/20 text-gray-400';
    }

    return <span className={badgeClasses}>{statusText}</span>;
  };

  // Get agent emoji/avatar
  const getAgentEmoji = () => {
    const emojiMap: Record<string, string> = {
      percy: '🤖',
      skillsmith: '🏅',
      'brand-alexander': '🎨',
      'content-carltig': '✍️',
      'social-nino': '📱',
      sync: '🔄',
      analytics: '📊'
    };
    return emojiMap[agentId?.toLowerCase()] || '⚡';
  };

  // Format timestamp - simple time ago without external dependencies
  const getTimeAgo = () => {
    try {
      const timestamp = startedAt || completedAt || new Date().toISOString();
      const date = new Date(timestamp);
      const now = new Date();
      const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (secondsAgo < 60) return `${secondsAgo}s ago`;
      if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
      if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`;
      return `${Math.floor(secondsAgo / 86400)}d ago`;
    } catch {
      const timestamp = startedAt || completedAt || new Date().toISOString();
      return new Date(timestamp).toLocaleTimeString();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-start gap-3 p-3 bg-black/40 rounded-lg border border-gray-700 hover:border-gray-600 transition-all"
    >
      {/* Agent Avatar */}
      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center text-lg">
        {getAgentEmoji()}
      </div>

      {/* Content */}
      <div className="flex-grow min-w-0">
        {/* Header: Agent name + Status badge */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-white truncate">
            {agentName || agentId}
          </span>
          {getStatusBadge()}
        </div>

        {/* Action text */}
        <p className="text-xs text-gray-400 mb-1">
          {type === 'agent_launch' && 'Analyzing your business needs...'}
          {type === 'agent_complete' && 'Analysis complete'}
          {type === 'agent_error' && (errorMessage || 'Encountered an error')}
        </p>

        {/* Footer: Status icon + Timestamp + Source */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {getStatusIcon()}
          <span>{getTimeAgo()}</span>
          {source && <span>• {source}</span>}
        </div>
      </div>
    </motion.div>
  );
}
