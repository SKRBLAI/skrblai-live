import { motion } from 'framer-motion';
import { ChatBubble } from '@/components/ui';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

export interface PercyTimelineItem {
  agentId: string;
  intent: string;
  message: string;
  timestamp: string;
}

export interface PercyTimelineProps {
  timeline: PercyTimelineItem[];
}

export default function PercyTimeline({ timeline }: PercyTimelineProps) {
  return (
    <div className="flex flex-col gap-4 mt-8">
      {timeline.map((item: PercyTimelineItem, idx: number) => {
        const avatarSrc = `/images/agents-${item.agentId}-skrblai.png`;
        const fallbackAvatar = '/images/male-silhouette.png';
        return (
          <motion.div
            key={item.timestamp + item.agentId + idx}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.5 }}
          >
            <div className="flex items-start gap-3 relative group">
              <img
                src={avatarSrc}
                alt={item.agentId}
                className="w-8 h-8 rounded-full border shadow-sm bg-gray-700 object-cover"
                title={item.agentId}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== window.location.origin + fallbackAvatar) {
                    target.src = fallbackAvatar;
                  }
                }}
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold capitalize cursor-help group-hover:underline" title={`Intent: ${item.intent}`}>{item.intent}</span>
                  <span className="text-xs text-gray-400 cursor-help group-hover:underline" title={`Timestamp: ${dayjs(item.timestamp).format('YYYY-MM-DD HH:mm:ss')}`}>{dayjs(item.timestamp).fromNow()}</span>
                </div>
                <div className="bg-gray-900 p-2 mt-1 rounded text-sm max-w-xl whitespace-pre-line shadow border border-gray-800">
                  {item.message}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
