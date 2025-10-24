'use client';

import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ActivityFeedItem, ActivityFeedItemProps } from './ActivityFeedItem';
import { ActivityFeedSkeleton } from './ActivityFeedSkeleton';
import { useAuth } from '@/components/context/AuthContext';

export interface ActivityFeedProps {
  userId?: string;
  agentFilter?: string;
  statusFilter?: 'all' | 'running' | 'success' | 'failed';
  limit?: number;
  compact?: boolean;
  showFilters?: boolean;
}

interface ActivityEvent {
  id: string;
  type: 'agent_launch' | 'agent_complete' | 'agent_error';
  agentId: string;
  agentName?: string;
  timestamp: string;
  status?: 'running' | 'success' | 'failed';
  startedAt?: string;
  completedAt?: string;
  source?: string;
  errorMessage?: string;
  result?: any;
}

export function ActivityFeed({
  userId,
  agentFilter,
  statusFilter = 'all',
  limit = 50,
  compact = false,
  showFilters = false
}: ActivityFeedProps) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Use provided userId or fallback to authenticated user
  const targetUserId = userId || user?.id;

  // Connect to SSE endpoint
  useEffect(() => {
    if (!targetUserId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    let eventSource: EventSource | null = null;

    try {
      const url = `/api/activity/live-feed?userId=${targetUserId}`;
      eventSource = new EventSource(url);

      eventSource.onopen = () => {
        console.log('[ActivityFeed] Connected to live feed');
        setIsConnected(true);
        setIsLoading(false);
        setError(null);
      };

      eventSource.onerror = (err) => {
        console.error('[ActivityFeed] Connection error:', err);
        setIsConnected(false);
        setError('Connection lost. Attempting to reconnect...');
        
        // EventSource will auto-reconnect, but we'll show the error state
        setTimeout(() => {
          if (eventSource?.readyState === EventSource.CLOSED) {
            setError('Unable to connect to activity feed');
          }
        }, 5000);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[ActivityFeed] Received event:', data);

          // Handle connection confirmation
          if (data.type === 'connection') {
            setIsLoading(false);
            return;
          }

          // Handle activity events
          if (data.type === 'agent_launch' || data.type === 'agent_complete' || data.type === 'agent_error') {
            const newEvent: ActivityEvent = {
              id: data.data?.id || `${Date.now()}-${Math.random()}`,
              type: data.type,
              agentId: data.data?.agentId || data.data?.agent_id || 'unknown',
              agentName: data.data?.agentName || data.data?.agent_name,
              timestamp: data.timestamp || new Date().toISOString(),
              status: data.data?.status || (data.type === 'agent_complete' ? 'success' : data.type === 'agent_error' ? 'failed' : 'running'),
              startedAt: data.data?.startedAt || data.data?.started_at || data.timestamp,
              completedAt: data.data?.completedAt || data.data?.completed_at,
              source: data.data?.source,
              errorMessage: data.data?.errorMessage || data.data?.error_message,
              result: data.data?.result
            };

            setEvents(prev => {
              // Prevent duplicates
              if (prev.some(e => e.id === newEvent.id)) {
                return prev;
              }
              // Add to front and limit to specified number
              return [newEvent, ...prev].slice(0, limit);
            });
          }
        } catch (error) {
          console.error('[ActivityFeed] Error parsing event:', error);
        }
      };

    } catch (error) {
      console.error('[ActivityFeed] Error creating EventSource:', error);
      setIsConnected(false);
      setIsLoading(false);
      setError('Failed to connect to activity feed');
    }

    // Cleanup on unmount
    return () => {
      if (eventSource) {
        eventSource.close();
        console.log('[ActivityFeed] Disconnected from live feed');
      }
    };
  }, [targetUserId, limit]);

  // Filter events
  const filteredEvents = events.filter(event => {
    // Filter by agent
    if (agentFilter && event.agentId !== agentFilter) {
      return false;
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      if (statusFilter === 'running' && event.type !== 'agent_launch') return false;
      if (statusFilter === 'success' && event.type !== 'agent_complete') return false;
      if (statusFilter === 'failed' && event.type !== 'agent_error') return false;
    }
    
    return true;
  });

  // Clear all events
  const handleClearAll = useCallback(() => {
    setEvents([]);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Live Activity</h2>
          <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse" />
        </div>
        <ActivityFeedSkeleton />
      </div>
    );
  }

  // Error state
  if (error && !isConnected) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Live Activity</h2>
          <div className="w-2 h-2 rounded-full bg-red-500" title="Disconnected" />
        </div>
        <div className="text-center py-8">
          <p className="text-sm text-red-400 mb-2">{error}</p>
          <p className="text-xs text-gray-500">Check your connection and try refreshing</p>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-white">Live Activity</h2>
          {isConnected && (
            <span className="text-xs text-gray-400">
              ({filteredEvents.length})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {filteredEvents.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
            >
              Clear
            </button>
          )}
          <div 
            className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}
            title={isConnected ? 'Connected' : 'Disconnected'}
          />
        </div>
      </div>

      {/* Filters (if enabled) */}
      {showFilters && (
        <div className="mb-4 flex gap-2">
          {/* Add filter dropdowns here in future */}
        </div>
      )}

      {/* Events list */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">No recent activity</p>
          <p className="text-xs text-gray-600 mt-1">
            Launch an agent to see it appear here in real-time
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {filteredEvents.map((event, index) => (
              <ActivityFeedItem
                key={event.id}
                id={event.id}
                agentId={event.agentId}
                agentName={event.agentName || event.agentId}
                status={event.status || 'pending'}
                startedAt={event.startedAt || event.timestamp}
                completedAt={event.completedAt}
                source={event.source}
                errorMessage={event.errorMessage}
                result={event.result}
                type={event.type}
                index={index}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// Add custom scrollbar styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(156, 163, 175, 0.3);
      border-radius: 3px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(156, 163, 175, 0.5);
    }
  `;
  document.head.appendChild(style);
}
