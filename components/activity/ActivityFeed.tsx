'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, WifiOff, Wifi, AlertCircle, Trash2, Filter } from 'lucide-react';
import { ActivityFeedItem, ActivityFeedItemProps } from './ActivityFeedItem';
import { ActivityFeedSkeleton } from './ActivityFeedSkeleton';
import { ActivityDetailsModal } from './ActivityDetailsModal';
import { ActivityFilters } from './ActivityFilters';
import type { ActivityStatus } from './StatusBadge';

interface ActivityEvent {
  type: 'connection' | 'agent_launch' | 'agent_complete' | 'agent_error' | 'workflow_trigger' | 'system_event' | 'heartbeat' | 'error';
  timestamp: string;
  data?: {
    id: string;
    agentId: string;
    userId?: string;
    status: string;
    source?: string;
    result?: any;
    errorMessage?: string;
  };
  message?: string;
}

interface ActivityFeedProps {
  userId?: string;
  agentFilter?: string;
  maxEvents?: number;
  className?: string;
}

export function ActivityFeed({ 
  userId, 
  agentFilter: initialAgentFilter, 
  maxEvents = 50,
  className = '' 
}: ActivityFeedProps) {
  const [events, setEvents] = useState<ActivityFeedItemProps[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<ActivityFeedItemProps | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [agentFilter, setAgentFilter] = useState(initialAgentFilter || '');
  const [statusFilter, setStatusFilter] = useState<ActivityStatus | 'all'>('all');
  
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);

  // Get auth token from localStorage or cookies
  const getAuthToken = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    // Try localStorage first
    const token = localStorage.getItem('supabase.auth.token');
    if (token) return token;

    // Fallback to checking cookies
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'sb-access-token' || name === 'supabase-auth-token') {
        return value;
      }
    }

    return null;
  }, []);

  // Connect to SSE endpoint
  const connect = useCallback(() => {
    const token = getAuthToken();
    
    if (!token) {
      setError('Authentication required. Please sign in.');
      setIsLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams();
      if (userId) params.set('userId', userId);
      if (agentFilter) params.set('agent', agentFilter);

      const url = `/api/activity/live-feed?${params.toString()}`;
      
      // Close existing connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('[ActivityFeed] Connected to live feed');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      eventSource.onerror = (err) => {
        console.error('[ActivityFeed] Connection error:', err);
        setIsConnected(false);
        eventSource.close();

        // Implement exponential backoff for reconnection
        const maxAttempts = 5;
        if (reconnectAttemptsRef.current < maxAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          console.log(`[ActivityFeed] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        } else {
          setError('Connection lost. Please refresh the page.');
        }
      };

      eventSource.onmessage = (event) => {
        try {
          const data: ActivityEvent = JSON.parse(event.data);

          if (data.type === 'connection') {
            console.log('[ActivityFeed] Connection established:', data.message);
            setIsLoading(false);
            return;
          }

          if (data.type === 'heartbeat') {
            // Silent heartbeat, just keep connection alive
            return;
          }

          if (data.type === 'error') {
            console.error('[ActivityFeed] Server error:', data.message);
            setError(data.message || 'Server error');
            return;
          }

          // Handle activity events
          if (data.type === 'agent_launch' || data.type === 'agent_complete' || data.type === 'agent_error') {
            const newEvent: ActivityFeedItemProps = {
              id: data.data?.id || Math.random().toString(36),
              agentId: data.data?.agentId || 'unknown',
              agentName: formatAgentName(data.data?.agentId || 'unknown'),
              status: mapStatus(data.data?.status || data.type),
              startedAt: data.timestamp,
              completedAt: data.type !== 'agent_launch' ? data.timestamp : undefined,
              source: data.data?.source || 'unknown',
              errorMessage: data.data?.errorMessage,
              result: data.data?.result,
              userId: data.data?.userId
            };

            setEvents(prev => {
              // Check if event already exists (update)
              const existingIndex = prev.findIndex(e => e.id === newEvent.id);
              if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = newEvent;
                return updated;
              }
              
              // Add new event at top
              return [newEvent, ...prev].slice(0, maxEvents);
            });
          }
        } catch (err) {
          console.error('[ActivityFeed] Error parsing event:', err);
        }
      };

    } catch (err: any) {
      console.error('[ActivityFeed] Connection setup error:', err);
      setError(err.message || 'Failed to connect');
      setIsLoading(false);
    }
  }, [userId, agentFilter, maxEvents, getAuthToken]);

  // Connect on mount
  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  // Helper: Format agent ID to name
  const formatAgentName = (agentId: string): string => {
    const names: Record<string, string> = {
      'percy': 'Percy',
      'skillsmith': 'SkillSmith',
      'sync': 'Sync',
      'analytics': 'Analytics',
      'marketing': 'Marketing',
      'content': 'Content',
      'seo': 'SEO',
      'social': 'Social Media',
      'email': 'Email',
      'automation': 'Automation',
      'branding': 'Branding',
    };
    
    return names[agentId.toLowerCase()] || agentId;
  };

  // Helper: Map status string to ActivityStatus
  const mapStatus = (status: string): ActivityStatus => {
    const normalized = status.toLowerCase();
    if (normalized === 'success' || normalized === 'completed' || normalized === 'agent_complete') return 'success';
    if (normalized === 'failed' || normalized === 'error' || normalized === 'agent_error') return 'failed';
    if (normalized === 'running' || normalized === 'in_progress' || normalized === 'agent_launch') return 'running';
    return 'pending';
  };

  // Clear all events
  const handleClearAll = () => {
    setEvents([]);
  };

  // Filter events
  const filteredEvents = events.filter(event => {
    if (statusFilter !== 'all' && event.status !== statusFilter) return false;
    if (agentFilter && event.agentId.toLowerCase() !== agentFilter.toLowerCase()) return false;
    return true;
  });

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-teal-400/20">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-teal-400" />
          <h2 className="text-lg font-bold text-white">Live Activity</h2>
          
          {/* Connection Status */}
          <div className="flex items-center gap-1.5">
            {isConnected ? (
              <>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <Wifi className="w-4 h-4 text-green-500" />
                <span className="text-xs text-green-500">Live</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-500" />
                <span className="text-xs text-red-500">Disconnected</span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`
              p-2 rounded-lg transition-all
              ${showFilters 
                ? 'bg-teal-500/20 text-teal-400' 
                : 'text-gray-400 hover:text-teal-400 hover:bg-teal-500/10'
              }
            `}
            title="Filters"
          >
            <Filter className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleClearAll}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
            title="Clear All"
            disabled={events.length === 0}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <ActivityFilters
          agentFilter={agentFilter}
          statusFilter={statusFilter}
          onAgentFilterChange={setAgentFilter}
          onStatusFilterChange={setStatusFilter}
          className="mb-4"
        />
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {/* Loading State */}
        {isLoading && <ActivityFeedSkeleton count={3} />}

        {/* Error State */}
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="
              p-4 rounded-lg
              bg-red-500/10 border border-red-500/30
              text-red-400
              flex items-start gap-3
            "
          >
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-1">Connection Error</p>
              <p className="text-sm opacity-90">{error}</p>
              <button
                onClick={connect}
                className="mt-2 text-xs text-red-300 hover:text-red-200 underline"
              >
                Retry Connection
              </button>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredEvents.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="
              text-center py-12
              text-gray-400
            "
          >
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No activity yet</p>
            <p className="text-xs opacity-75 mt-1">
              Agent activity will appear here in real-time
            </p>
          </motion.div>
        )}

        {/* Event List */}
        <AnimatePresence mode="popLayout">
          {filteredEvents.map((event) => (
            <ActivityFeedItem
              key={event.id}
              {...event}
              onClick={() => setSelectedEvent(event)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Details Modal */}
      {selectedEvent && (
        <ActivityDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
