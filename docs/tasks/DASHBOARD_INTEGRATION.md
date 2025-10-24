# Windsurf/Cursor Tasks - Dashboard Integration

## 🎯 Mission
Add Percy recommendations and activity feed to the main dashboard. Give users instant visibility into what Percy suggests and what agents are currently working.

---

## 📋 Task Breakdown

### **TASK 1: Create Percy Recommendations Widget**
**File:** `components/dashboard/PercyRecommendationsWidget.tsx` (NEW FILE)
**Difficulty:** Medium
**Time:** 25-30 minutes

**What to do:**
Create a widget that shows top 3 Percy recommendations on the dashboard.

```tsx
'use client';

import { usePercyRecommendation } from '@/hooks/usePercyRecommendation';
import { PercyRecommendsBadge } from '@/components/percy/PercyRecommendsBadge';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function PercyRecommendationsWidget() {
  const { recommendation, loading, getRecommendationSet } = usePercyRecommendation();
  const router = useRouter();

  useEffect(() => {
    getRecommendationSet(
      {
        businessType: 'saas', // TODO: Get from user profile
        urgencyLevel: 'medium'
      },
      3
    );
  }, []);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!recommendation) {
    return null;
  }

  const recommendations = Array.isArray(recommendation.recommendation)
    ? recommendation.recommendation
    : [recommendation.recommendation];

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          <h2 className="text-lg font-bold text-white">Percy Recommends</h2>
        </div>
        <button
          onClick={() => router.push('/agents')}
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          View All →
        </button>
      </div>

      <p className="text-sm text-gray-400 mb-4">
        {recommendation.percyMessage.confidence}
      </p>

      <div className="space-y-3">
        {recommendations.slice(0, 3).map((rec, idx) => (
          <RecommendationItem key={idx} recommendation={rec} rank={idx + 1} />
        ))}
      </div>
    </div>
  );
}

function RecommendationItem({ recommendation, rank }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.1 }}
      whileHover={{ scale: 1.02 }}
      className="flex items-center gap-3 p-3 bg-black/40 rounded-lg border border-gray-700 hover:border-blue-500/50 transition-all cursor-pointer group"
    >
      <div className="flex-shrink-0 w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold text-sm">
        {rank}
      </div>

      <div className="flex-grow">
        <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
          {recommendation.service.name}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-1">
          {recommendation.reasoning}
        </p>
      </div>

      <PercyRecommendsBadge
        confidence={recommendation.confidence}
        variant="inline"
      />

      <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-blue-400 transition-colors" />
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 animate-pulse">
      <div className="h-6 w-40 bg-gray-800 rounded mb-4"></div>
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-gray-800 rounded-lg"></div>
        ))}
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Widget renders on dashboard
- [ ] Shows 3 recommendations
- [ ] Loading state shows skeleton
- [ ] Hover effect on items
- [ ] "View All" navigates to Agent League

---

### **TASK 2: Create Activity Feed Sidebar Widget**
**File:** `components/dashboard/ActivityFeedWidget.tsx` (NEW FILE)
**Difficulty:** Medium
**Time:** 30-35 minutes

**What to do:**
Create a compact activity feed for the dashboard sidebar.

```tsx
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

export function ActivityFeedWidget({ limit = 5 }: { limit?: number }) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const { session } = useAuth();

  useEffect(() => {
    if (!session?.access_token) return;

    const eventSource = new EventSource(
      `/api/activity/live-feed?userId=${session.user.id}`,
      {
        headers: { Authorization: `Bearer ${session.access_token}` }
      }
    );

    eventSource.onopen = () => setConnected(true);
    eventSource.onerror = () => setConnected(false);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'agent_launch' || data.type === 'agent_complete' || data.type === 'agent_error') {
        setEvents(prev => [{
          id: data.data.id,
          type: data.type,
          agentId: data.data.agentId,
          agentName: data.data.agentName,
          timestamp: data.timestamp,
          status: data.data.status
        }, ...prev].slice(0, limit));
      }
    };

    return () => eventSource.close();
  }, [session, limit]);

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Live Activity</h2>
        <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
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

function ActivityItem({ event, index }: { event: ActivityEvent; index: number }) {
  const getIcon = () => {
    switch (event.type) {
      case 'agent_launch':
        return <Loader className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'agent_complete':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'agent_error':
        return <XCircle className="w-4 h-4 text-red-400" />;
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
```

**Acceptance Criteria:**
- [ ] Connects to activity feed SSE
- [ ] Shows live agent activity
- [ ] Green dot when connected
- [ ] Animations smooth
- [ ] Limits to 5 events
- [ ] Shows "No activity" when empty

---

### **TASK 3: Create Quick Launch Panel**
**File:** `components/dashboard/QuickLaunchPanel.tsx` (NEW FILE)
**Difficulty:** Easy
**Time:** 20 minutes

**What to do:**
Create quick-launch buttons for Percy's recommended agents.

```tsx
'use client';

import { usePercyRecommendation } from '@/hooks/usePercyRecommendation';
import { Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function QuickLaunchPanel() {
  const { recommendation, loading } = usePercyRecommendation();
  const router = useRouter();

  if (loading || !recommendation) {
    return null;
  }

  const primaryRec = Array.isArray(recommendation.recommendation)
    ? recommendation.recommendation[0]
    : recommendation.recommendation;

  const agentId = primaryRec.agentHandoff?.agentId;
  const agentName = primaryRec.agentHandoff?.agentName;

  if (!agentId) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6 border border-blue-500/30">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-white mb-2">
            Ready to get started?
          </h3>
          <p className="text-sm text-gray-300 mb-4">
            Percy thinks {agentName} is perfect for you right now
          </p>
        </div>
        <Zap className="w-6 h-6 text-yellow-400" />
      </div>

      <button
        onClick={() => router.push(`/agents/${agentId}`)}
        className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
      >
        Launch {agentName} →
      </button>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Shows Percy's top recommended agent
- [ ] Launch button navigates to agent
- [ ] Hover effect on button
- [ ] Gradient background
- [ ] Only shows when recommendation exists

---

### **TASK 4: Integrate Widgets into Dashboard Layout**
**File:** Find your main dashboard page (likely `app/dashboard/page.tsx` or similar)
**Difficulty:** Easy
**Time:** 15 minutes

**What to do:**
1. Import all widgets:
```tsx
import { PercyRecommendationsWidget } from '@/components/dashboard/PercyRecommendationsWidget';
import { ActivityFeedWidget } from '@/components/dashboard/ActivityFeedWidget';
import { QuickLaunchPanel } from '@/components/dashboard/QuickLaunchPanel';
```

2. Add to dashboard layout (example grid layout):
```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Left column - Main content */}
  <div className="lg:col-span-2 space-y-6">
    <QuickLaunchPanel />
    {/* Your existing dashboard content */}
  </div>

  {/* Right sidebar */}
  <div className="space-y-6">
    <PercyRecommendationsWidget />
    <ActivityFeedWidget limit={5} />
  </div>
</div>
```

**Acceptance Criteria:**
- [ ] All widgets render on dashboard
- [ ] Responsive layout (stacks on mobile)
- [ ] No layout shifts
- [ ] Widgets load independently

---

### **TASK 5: Add Dashboard Analytics Tracking**
**File:** Dashboard page
**Difficulty:** Easy
**Time:** 10 minutes

**What to do:**
Track when users interact with Percy widgets on dashboard.

```tsx
const trackWidgetInteraction = (widget: string, action: string, data?: any) => {
  console.log('[Dashboard Analytics]', {
    widget,
    action,
    data,
    timestamp: Date.now()
  });

  // TODO: Send to analytics service
};

// Add to widget components
<PercyRecommendationsWidget
  onRecommendationClick={(rec) =>
    trackWidgetInteraction('percy_recommendations', 'click', { service: rec.service.id })
  }
/>
```

**Acceptance Criteria:**
- [ ] Tracks widget interactions
- [ ] Console logs events
- [ ] Ready for analytics integration

---

## 🧪 Testing Checklist

- [ ] Percy recommendations widget loads
- [ ] Activity feed connects and updates
- [ ] Quick launch button works
- [ ] All widgets responsive on mobile
- [ ] Loading states show correctly
- [ ] Empty states display when no data
- [ ] Analytics tracking logs events
- [ ] No console errors
- [ ] Dark mode looks good

---

## 📸 Layout Reference

**Desktop:**
```
┌─────────────────────────────────────────────────┐
│  Dashboard                                      │
├──────────────────────────┬──────────────────────┤
│                          │  Percy Recommends    │
│  Quick Launch Panel      │  ┌────────────────┐  │
│                          │  │ #1 Analytics   │  │
│  ┌────────────────────┐  │  │ #2 Branding    │  │
│  │ Your main content  │  │  │ #3 Content     │  │
│  │                    │  │  └────────────────┘  │
│  │                    │  ├──────────────────────┤
│  └────────────────────┘  │  Live Activity       │
│                          │  ┌────────────────┐  │
│                          │  │ ✓ Percy done   │  │
│                          │  │ ⚡ Social...    │  │
│                          │  │ ✓ Analytics    │  │
│                          │  └────────────────┘  │
└──────────────────────────┴──────────────────────┘
```

**Estimated Total Time:** 1.5 - 2 hours
