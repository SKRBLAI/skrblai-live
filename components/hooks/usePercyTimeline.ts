import { useState } from 'react';

export interface PercyTimelineItem {
  agentId: string;
  intent: string;
  message: string;
  timestamp: string;
}

const MOCK_TIMELINE: PercyTimelineItem[] = [
  {
    agentId: 'user',
    intent: 'ask',
    message: 'How do I automate my content calendar?',
    timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString()
  },
  {
    agentId: 'assistant',
    intent: 'respond',
    message: 'Here’s a workflow to automate your content calendar...',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString()
  },
  {
    agentId: 'user',
    intent: 'upload',
    message: 'Uploading my brand guidelines PDF.',
    timestamp: new Date(Date.now() - 1 * 60 * 1000).toISOString()
  }
];

export function usePercyTimeline(): [PercyTimelineItem[], () => void] {
  const [timeline, setTimeline] = useState<PercyTimelineItem[]>(MOCK_TIMELINE);

  // For now, refresh just re-sets the same mock data
  function refreshTimeline() {
    setTimeline([...MOCK_TIMELINE]);
  }

  return [timeline, refreshTimeline];
}
