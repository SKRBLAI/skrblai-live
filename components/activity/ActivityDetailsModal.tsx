'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, User, Code, AlertCircle, CheckCircle } from 'lucide-react';
import { AgentAvatar } from './AgentAvatar';
import { StatusBadge } from './StatusBadge';
import type { ActivityFeedItemProps } from './ActivityFeedItem';

interface ActivityDetailsModalProps {
  event: ActivityFeedItemProps;
  onClose: () => void;
}

export function ActivityDetailsModal({ event, onClose }: ActivityDetailsModalProps) {
  const duration = event.completedAt 
    ? new Date(event.completedAt).getTime() - new Date(event.startedAt).getTime()
    : null;

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="
            relative w-full max-w-2xl max-h-[90vh]
            bg-[rgba(21,23,30,0.95)]
            border border-teal-400/40
            rounded-xl
            shadow-[0_0_32px_rgba(45,212,191,0.3)]
            backdrop-blur-xl
            overflow-hidden
          "
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-teal-400/20">
            <div className="flex items-start gap-4">
              <AgentAvatar agentId={event.agentId} agentName={event.agentName} size="lg" />
              <div>
                <h2 className="text-xl font-bold text-white mb-1">
                  {event.agentName}
                </h2>
                <p className="text-sm text-gray-400">Activity Details</p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="
                p-2 rounded-lg
                text-gray-400 hover:text-white
                hover:bg-white/5
                transition-all
              "
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)] custom-scrollbar">
            <div className="space-y-6">
              {/* Status & Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                    Status
                  </h3>
                  <StatusBadge status={event.status} className="text-base" />
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                    Duration
                  </h3>
                  <div className="flex items-center gap-2 text-white">
                    <Clock className="w-4 h-4 text-teal-400" />
                    <span className="text-sm">
                      {duration ? formatDuration(duration) : 'In progress...'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                  Timeline
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Started:</span>
                    <span className="text-white">{formatTimestamp(event.startedAt)}</span>
                  </div>
                  {event.completedAt && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Completed:</span>
                      <span className="text-white">{formatTimestamp(event.completedAt)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Source:</span>
                    <span className="px-2 py-1 rounded bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs">
                      {event.source}
                    </span>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {event.errorMessage && event.status === 'failed' && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wide flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Error Details
                  </h3>
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                    <code className="text-sm text-red-400 whitespace-pre-wrap break-all">
                      {event.errorMessage}
                    </code>
                  </div>
                </div>
              )}

              {/* Result Data */}
              {event.result && event.status === 'success' && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wide flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Result
                  </h3>
                  <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <pre className="text-xs text-emerald-400 whitespace-pre-wrap break-all overflow-x-auto">
                      {JSON.stringify(event.result, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Metadata
                </h3>
                <div className="p-4 rounded-lg bg-gray-500/10 border border-gray-500/30">
                  <dl className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <dt className="text-gray-400">Event ID:</dt>
                      <dd className="text-white font-mono text-xs">{event.id}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-gray-400">Agent ID:</dt>
                      <dd className="text-white font-mono text-xs">{event.agentId}</dd>
                    </div>
                    {event.userId && (
                      <div className="flex items-center justify-between">
                        <dt className="text-gray-400">User ID:</dt>
                        <dd className="text-white font-mono text-xs truncate max-w-xs">
                          {event.userId}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-teal-400/20 flex justify-end">
            <button
              onClick={onClose}
              className="
                px-6 py-2 rounded-lg
                bg-teal-500/20 border border-teal-400/30
                text-teal-400
                hover:bg-teal-500/30 hover:border-teal-400/50
                transition-all
                font-medium
              "
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
