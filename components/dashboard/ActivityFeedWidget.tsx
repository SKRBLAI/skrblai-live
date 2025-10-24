'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle, XCircle, Loader } from 'lucide-react';
import { useAuth } from '@/components/context/AuthContext';

interface ActivityEvent {
  id: string;
  type: 'agent_launch' | 'agent_complete' | 'agent_error';
  agentId: string;
  agentName?: string;
  timestamp: string;
  status?: string;
}

export interface ActivityFeedWidgetProps {
  limit?: number;
}

export function ActivityFeedWidget({ limit = 5 }: ActivityFeedWidgetProps) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource(
        `/api/activity/live-feed?userId=${user.id}`
      );

      eventSource.onopen = () => {
        console.log('[ActivityFeed] Connected to live feed');
        setConnected(true);
      };

      eventSource.onerror = (error) => {
        console.error('[ActivityFeed] Connection error:', error);
        setConnected(false);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[ActivityFeed] Received event:', data);

          if (data.type === 'agent_launch' || data.type === 'agent_complete' || data.type === 'agent_error') {
            setEvents(prev => [{
              id: data.data?.id || `${Date.now()}-${Math.random()}`,
              type: data.type,
              agentId: data.data?.agentId || data.data?.agent_id || 'unknown',
              agentName: data.data?.agentName || data.data?.agent_name,
              timestamp: data.timestamp || new Date().toISOString(),
              status: data.data?.status
            }, ...prev].slice(0, limit));
          }
        } catch (error) {
          console.error('[ActivityFeed] Error parsing event:', error);
        }
      };
    } catch (error) {
      console.error('[ActivityFeed] Error creating EventSource:', error);
      setConnected(false);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
        console.log('[ActivityFeed] Disconnected from live feed');
      }
    };
  }, [user, limit]);

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Live Activity</h2>
        <div 
          className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}
          title={connected ? 'Connected' : 'Disconnected'}
        />
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">
          No recent activity
        </p>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {events.map((event, idx) => (
              <ActivityItem key={event.id} event={event} index={idx} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

interface ActivityItemProps {
  event: ActivityEvent;
  index: number;
}

function ActivityItem({ event, index }: ActivityItemProps) {
  const getIcon = () => {
    switch (event.type) {
      case 'agent_launch':
        return <Loader className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'agent_complete':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'agent_error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (event.type) {
      case 'agent_launch':
        return 'started';
      case 'agent_complete':
        return 'completed';
      case 'agent_error':
        return 'failed';
      default:
        return 'updated';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-start gap-3 p-3 bg-black/40 rounded-lg border border-gray-700"
    >
      <div className="flex-shrink-0 mt-0.5">
        {getIcon()}
      </div>

      <div className="flex-grow min-w-0">
        <p className="text-sm text-white font-medium truncate">
          {event.agentName || event.agentId}
        </p>
        <p className="text-xs text-gray-500">
          {getStatusText()} • {new Date(event.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </motion.div>
  );
}

