# 🌊 Windsurf Tasks - Activity Feed UI & Polish

## Overview
Claude has wired up the **real-time activity feed backend** (database, SSE endpoint, logging utilities). Now Windsurf should build the **frontend components, styling, and user experience**.

## 🎯 Your Mission
Build a beautiful, real-time activity feed UI that shows users what agents are doing right now. Think: GitHub activity feed meets Twitter timeline.

---

## 📦 What's Already Built (Don't Touch)

✅ **Backend Infrastructure:**
- `/app/api/activity/live-feed/route.ts` - SSE endpoint (wired to Supabase Realtime)
- `/lib/activity/activityLogger.ts` - Logging utilities
- `/supabase/migrations/20251024_activity_feed_tables.sql` - Database schema
- `/app/api/agents/[agentId]/launch/route.ts` - Already logs agent launches

✅ **Data Flow:**
```
Agent Launch → agent_launches table → Supabase Realtime → SSE → Your UI
```

---

## 🛠️ Tasks for Windsurf

### Priority 1: Core Activity Feed Component

#### Task 1.1: Create `ActivityFeedItem` Component
**File:** `/components/activity/ActivityFeedItem.tsx`

**Requirements:**
- Display single activity event
- Show agent avatar/icon
- Show agent name and action ("Percy is analyzing your business...")
- Show timestamp (use `timeago.js` or similar)
- Show status badge (running, success, failed)
- Show user who triggered it (if admin view)
- Animate in from top when new

**Design Spec:**
```
┌─────────────────────────────────────────┐
│ 🤖 Percy                   ⏱️ 2m ago     │
│ Analyzing your business needs...        │
│ 🟢 Running                              │
└─────────────────────────────────────────┘
```

**Props:**
```typescript
interface ActivityFeedItemProps {
  id: string;
  agentId: string;
  agentName: string;
  status: 'running' | 'success' | 'failed';
  startedAt: string;
  completedAt?: string;
  source: string;
  errorMessage?: string;
  result?: any;
}
```

**Styling:**
- Card with subtle border
- Green pulse animation for "running" status
- Success = green check, Failed = red X
- Hover effect to show "View Details"
- Dark mode support

#### Task 1.2: Create `ActivityFeed` Container Component
**File:** `/components/activity/ActivityFeed.tsx`

**Requirements:**
- Connect to `/api/activity/live-feed` via EventSource
- Handle SSE connection, reconnection, errors
- Render list of `ActivityFeedItem` components
- Auto-scroll to top on new activity (with smooth animation)
- Show loading skeleton while connecting
- Show error state if connection fails
- Show empty state if no activity
- Limit to last 50 items (virtualize if needed)

**Features:**
- "Live" indicator (green dot pulsing)
- Connection status ("Connected", "Reconnecting...", "Disconnected")
- Filter dropdown (All Agents, Percy, SkillSmith, etc.)
- Filter by status (All, Running, Completed, Failed)
- "Clear All" button (clears UI only, not database)

**Code Structure:**
```typescript
export function ActivityFeed({ userId, agentFilter }: Props) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Connect to SSE
    const token = getAuthToken();
    const url = `/api/activity/live-feed?userId=${userId || ''}`;
    const eventSource = new EventSource(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    eventSource.onopen = () => setIsConnected(true);
    eventSource.onerror = () => setIsConnected(false);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'connection') {
        setIsLoading(false);
      } else if (data.type === 'agent_launch' || data.type === 'agent_complete') {
        setEvents(prev => [data, ...prev].slice(0, 50));
      }
    };

    return () => eventSource.close();
  }, [userId]);

  // Render UI
}
```

#### Task 1.3: Create Activity Feed Skeleton Loader
**File:** `/components/activity/ActivityFeedSkeleton.tsx`

**Requirements:**
- Show 3-5 skeleton cards while loading
- Pulse animation
- Match ActivityFeedItem dimensions

---

### Priority 2: Integration & Placement

#### Task 2.1: Add Activity Feed to Dashboard
**File:** `/app/dashboard/page.tsx` or `/components/dashboard/DashboardLayout.tsx`

**Placement Options:**
- Right sidebar (sticky, always visible)
- OR bottom section (full width)
- OR modal/drawer (toggle with "Activity" button)

**Recommendation:** Right sidebar for max visibility

#### Task 2.2: Add Activity Feed to Agent League Page
**File:** Wherever Agent League is displayed

**Goal:** Show real-time agent activity while users browse agents

---

### Priority 3: Styling & Design

#### Task 3.1: Design Status Badges
**File:** `/components/activity/StatusBadge.tsx`

**Requirements:**
- `running`: Green with pulse animation, "⚡ Running"
- `success`: Green check, "✅ Complete"
- `failed`: Red X, "❌ Failed"
- `pending`: Gray, "⏳ Pending"

**Use Tailwind classes for consistency**

#### Task 3.2: Agent Avatar/Icon Mapping
**File:** `/lib/config/agentAvatars.ts` or `/components/activity/AgentAvatar.tsx`

**Requirements:**
- Map agent IDs to emoji or icon
- Percy = 🤖
- SkillSmith = 🏅
- Sync = 🔄
- Analytics = 📊
- etc.

**Fallback:** First letter of agent name in colored circle

#### Task 3.3: Dark Mode Support
Ensure all activity feed components respect dark mode:
- Use `dark:` Tailwind classes
- Test in both light and dark themes

#### Task 3.4: Responsive Design
- Desktop: Full sidebar
- Tablet: Collapsible sidebar
- Mobile: Bottom sheet or modal

---

### Priority 4: Advanced Features

#### Task 4.1: Activity Details Modal
**File:** `/components/activity/ActivityDetailsModal.tsx`

**Trigger:** Click on ActivityFeedItem

**Show:**
- Full agent execution details
- Input payload (prettified JSON)
- Output result (prettified JSON)
- Error stack trace (if failed)
- Duration
- Timestamp
- User who launched
- "View in Logs" link (future)

#### Task 4.2: Filter & Search UI
**File:** `/components/activity/ActivityFilters.tsx`

**Features:**
- Dropdown: Filter by agent
- Dropdown: Filter by status
- Date range picker (optional)
- Search by agent name

#### Task 4.3: "View More" / Pagination
If more than 50 events, show "Load More" button to fetch older events from database.

#### Task 4.4: Sound Notifications (Optional)
Play subtle sound when:
- New agent launches (ding)
- Agent completes (success chime)
- Agent fails (error beep)

Add toggle in settings to enable/disable.

---

### Priority 5: Testing

#### Task 5.1: Unit Tests
**File:** `/components/activity/__tests__/ActivityFeed.test.tsx`

**Test:**
- Renders loading state initially
- Renders empty state when no events
- Renders list of events
- Handles SSE connection errors
- Filters events by agent
- Filters events by status

#### Task 5.2: Integration Test
**File:** `/e2e/activity-feed.spec.ts` (if using Playwright)

**Test:**
- Launch agent from dashboard
- Verify activity feed updates in real-time
- Click on activity item to view details
- Filter activity by agent

#### Task 5.3: Manual Testing Checklist
- [ ] Connect to activity feed
- [ ] Launch an agent from dashboard
- [ ] Verify activity appears in feed within 1 second
- [ ] Verify status updates when agent completes
- [ ] Test reconnection (disable network, re-enable)
- [ ] Test error state (invalid auth token)
- [ ] Test empty state (fresh account)
- [ ] Test filters (by agent, by status)
- [ ] Test dark mode
- [ ] Test mobile responsive

---

### Priority 6: Performance & Polish

#### Task 6.1: Optimize Rendering
- Use `React.memo` on ActivityFeedItem
- Use `useMemo` for filtered events
- Virtualize list if >100 items (use `react-virtual` or similar)

#### Task 6.2: Add Animations
- Fade in new items from top
- Slide out when removing
- Smooth scroll to top
- Pulse animation for "running" status

#### Task 6.3: Error Boundaries
Wrap activity feed in error boundary to prevent crashes.

#### Task 6.4: Accessibility
- Keyboard navigation (Tab through items)
- ARIA labels for status badges
- Screen reader announcements for new activity

---

## 📚 Reference Files

**Read these first:**
- `/docs/ACTIVITY_FEED.md` - Complete implementation guide
- `/app/api/activity/live-feed/route.ts` - SSE endpoint source
- `/lib/activity/activityLogger.ts` - Activity logging utilities
- `/supabase/migrations/20251024_activity_feed_tables.sql` - Database schema

**Existing UI patterns:**
- `/components/percy/PercyWidget.tsx` - Percy UI patterns
- `/components/percy/PercyChat.tsx` - Chat UI patterns
- `/components/dashboard/*` - Dashboard layout

---

## 🎨 Design Inspiration

**Look like:**
- GitHub activity feed (clean, minimal)
- Twitter timeline (real-time updates)
- Linear notifications (smooth animations)

**Color Palette:**
- Running: `bg-green-500/10 text-green-600`
- Success: `bg-emerald-500/10 text-emerald-600`
- Failed: `bg-red-500/10 text-red-600`
- Pending: `bg-gray-500/10 text-gray-600`

---

## 🚀 Getting Started

### Step 1: Apply Database Migration
```bash
# In Supabase Dashboard → SQL Editor, run:
# supabase/migrations/20251024_activity_feed_tables.sql
```

### Step 2: Test SSE Endpoint
```bash
# Get auth token from browser (localStorage or cookie)
curl -N -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/activity/live-feed
```

### Step 3: Create Components
Start with `ActivityFeedItem.tsx`, then `ActivityFeed.tsx`.

### Step 4: Integrate
Add to dashboard sidebar.

### Step 5: Test
Launch an agent and watch the feed update!

---

## ✅ Definition of Done

- [ ] Activity feed renders on dashboard
- [ ] Real-time updates when agents launch/complete
- [ ] Loading, error, and empty states work
- [ ] Filters work (by agent, by status)
- [ ] Click to view details modal
- [ ] Dark mode supported
- [ ] Mobile responsive
- [ ] Animations smooth
- [ ] Tests passing
- [ ] No console errors

---

## 💡 Tips

1. **Start Simple:** Get basic list rendering first, then add filters/animations
2. **Use EventSource:** Native browser API for SSE (no libraries needed)
3. **Mock Data:** Create `mockActivityEvents.ts` for Storybook/testing
4. **Incremental:** Build one component at a time, test as you go
5. **Ask Questions:** If SSE format unclear, check `/app/api/activity/live-feed/route.ts`

---

## 🆘 Troubleshooting

**Problem:** EventSource not receiving events
- Check auth token is valid
- Check SSE endpoint is running (curl test)
- Check browser console for CORS errors
- Check Supabase Realtime is enabled

**Problem:** Events not showing up
- Check agent_launches table has data
- Check RLS policies allow user to read their launches
- Check SSE filter params (userId, agent)

**Problem:** Too many re-renders
- Use `React.memo` on ActivityFeedItem
- Use `useCallback` for event handlers
- Limit events array to 50 items max

---

## 📞 Need Help?

- Read `/docs/ACTIVITY_FEED.md` for complete guide
- Check SSE endpoint source code
- Test with curl to isolate frontend vs backend issues
- Console.log the SSE events to debug

---

## 🎉 Bonus Tasks (If Time)

- [ ] Activity feed export (download as JSON/CSV)
- [ ] Activity feed sharing (share link to specific activity)
- [ ] Activity feed pinning (pin important activities)
- [ ] Activity feed grouping (group by agent or day)
- [ ] Activity feed statistics (show total launches today)
- [ ] Activity feed trends (show busiest agents)

---

**Happy coding! 🌊**
