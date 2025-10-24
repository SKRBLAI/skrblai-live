'use client';

import { motion } from 'framer-motion';
import { Clock, User } from 'lucide-react';
import { AgentAvatar } from './AgentAvatar';
import { StatusBadge, ActivityStatus } from './StatusBadge';

export interface ActivityFeedItemProps {
  id: string;
  agentId: string;
  agentName: string;
  status: ActivityStatus;
  startedAt: string;
  completedAt?: string;
  source: string;
  errorMessage?: string;
  result?: any;
  userId?: string;
  onClick?: () => void;
}

function formatTimeAgo(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function getActivityMessage(agentName: string, status: ActivityStatus): string {
  const messages = {
    running: `${agentName} is analyzing your request...`,
    success: `${agentName} completed analysis`,
    failed: `${agentName} encountered an error`,
    pending: `${agentName} is queued...`
  };
  return messages[status];
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
  result,
  userId,
  onClick
}: ActivityFeedItemProps) {
  const timeAgo = formatTimeAgo(startedAt);
  const message = getActivityMessage(agentName, status);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onClick={onClick}
      className={`
        group relative
        bg-[rgba(21,23,30,0.50)] 
        border border-teal-400/20
        rounded-lg p-4
        backdrop-blur-sm
        transition-all duration-300
        ${onClick ? 'cursor-pointer hover:border-teal-400/40 hover:shadow-[0_0_16px_rgba(45,212,191,0.2)]' : ''}
        ${status === 'running' ? 'animate-pulse-subtle' : ''}
      `}
    >
      {/* Hover glow effect */}
      {onClick && (
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-teal-400/0 via-teal-400/5 to-teal-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}

      <div className="relative flex items-start gap-3">
        {/* Agent Avatar */}
        <AgentAvatar agentId={agentId} agentName={agentName} size="md" />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header: Agent Name + Time */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="font-semibold text-white text-sm truncate">
              {agentName}
            </h3>
            <div className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap">
              <Clock className="w-3 h-3" />
              <span>{timeAgo}</span>
            </div>
          </div>

          {/* Message */}
          <p className="text-sm text-gray-300 mb-3 leading-relaxed">
            {message}
          </p>

          {/* Error Message */}
          {errorMessage && status === 'failed' && (
            <p className="text-xs text-red-400 mb-3 p-2 rounded bg-red-500/10 border border-red-500/20">
              {errorMessage}
            </p>
          )}

          {/* Footer: Status + Source */}
          <div className="flex items-center justify-between gap-2">
            <StatusBadge status={status} />
            
            {/* Source/User Info */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              {source && (
                <span className="px-2 py-0.5 rounded bg-gray-500/10 border border-gray-500/20">
                  {source}
                </span>
              )}
            </div>
          </div>

          {/* View Details Hint */}
          {onClick && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs text-teal-400">View Details →</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Add subtle pulse animation to CSS
const styles = `
@keyframes pulse-subtle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.95; }
}

.animate-pulse-subtle {
  animation: pulse-subtle 2s ease-in-out infinite;
}
`;

// Inject styles (will only run once)
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.textContent = styles;
  document.head.appendChild(styleTag);
}
