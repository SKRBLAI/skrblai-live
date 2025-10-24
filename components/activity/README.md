# 🌊 Activity Feed Components

Real-time activity feed system for SKRBL AI platform showing live agent execution status.

## 📦 Components

### `ActivityFeed`
Main container component that connects to SSE endpoint and manages real-time updates.

**Props:**
- `userId?: string` - Filter activities by user ID
- `agentFilter?: string` - Filter activities by specific agent
- `maxEvents?: number` - Maximum events to keep in memory (default: 50)
- `className?: string` - Additional CSS classes

**Features:**
- ✅ Real-time SSE connection with auto-reconnect
- ✅ Connection status indicator (Live/Disconnected)
- ✅ Filters by agent and status
- ✅ Loading, error, and empty states
- ✅ Automatic event deduplication and updates
- ✅ Mobile-responsive design

**Usage:**
```tsx
import { ActivityFeed } from '@/components/activity';

<ActivityFeed 
  userId={user.id} 
  maxEvents={50} 
  className="h-full"
/>
```

---

### `ActivityFeedItem`
Individual activity event card with status badge and details.

**Props:**
```typescript
interface ActivityFeedItemProps {
  id: string;
  agentId: string;
  agentName: string;
  status: 'running' | 'success' | 'failed' | 'pending';
  startedAt: string;
  completedAt?: string;
  source: string;
  errorMessage?: string;
  result?: any;
  userId?: string;
  onClick?: () => void;
}
```

**Features:**
- ✅ Animated entry/exit
- ✅ Status-based styling and icons
- ✅ Time ago formatting
- ✅ Hover effects with "View Details" hint
- ✅ Pulsing animation for running status

---

### `ActivityDetailsModal`
Full-screen modal showing complete activity execution details.

**Props:**
- `event: ActivityFeedItemProps` - Activity event to display
- `onClose: () => void` - Close handler

**Features:**
- ✅ Full execution timeline
- ✅ JSON result/error display with syntax highlighting
- ✅ Duration calculation
- ✅ Metadata display (IDs, source, etc.)
- ✅ Backdrop blur and cosmic styling
- ✅ Keyboard accessible (ESC to close)

---

### `StatusBadge`
Visual status indicator with icon and animation.

**Statuses:**
- `running` - Green with spinning icon and pulse glow
- `success` - Emerald with checkmark
- `failed` - Red with X icon
- `pending` - Gray with clock icon

---

### `AgentAvatar`
Agent identifier with emoji/icon and gradient background.

**Props:**
- `agentId: string` - Agent identifier
- `agentName?: string` - Agent display name
- `size?: 'sm' | 'md' | 'lg'` - Avatar size
- `className?: string`

**Supported Agents:**
- Percy 🤖 (Cyan gradient)
- SkillSmith 🏅 (Orange gradient)
- Sync 🔄 (Purple gradient)
- Analytics 📊 (Green gradient)
- Marketing 📱 (Pink gradient)
- Content ✍️ (Yellow gradient)
- And more...

---

### `ActivityFilters`
Filter controls for agent and status selection.

**Props:**
- `agentFilter: string`
- `statusFilter: 'all' | ActivityStatus`
- `onAgentFilterChange: (filter: string) => void`
- `onStatusFilterChange: (filter: ActivityStatus | 'all') => void`

---

### `ActivityFeedSkeleton`
Loading placeholder with pulse animation.

**Props:**
- `count?: number` - Number of skeleton cards (default: 3)

---

## 🎨 Integration

### Dashboard Integration

Wrap your dashboard content with `DashboardWithActivityFeed`:

```tsx
import { DashboardWithActivityFeed } from '@/components/dashboard/DashboardWithActivityFeed';

export default function DashboardClient({ user }) {
  return (
    <PageLayout>
      <DashboardWithActivityFeed userId={user.id} showActivityFeed={true}>
        {/* Your dashboard content */}
      </DashboardWithActivityFeed>
    </PageLayout>
  );
}
```

**Features:**
- ✅ Desktop: Collapsible right sidebar (384px wide)
- ✅ Mobile: Bottom sheet modal with FAB trigger
- ✅ Sticky positioning with smooth animations
- ✅ Cosmic glassmorphic styling

---

## 🔌 SSE Connection

The activity feed connects to `/api/activity/live-feed` using Server-Sent Events.

**Authentication:**
Requires valid auth token from localStorage or cookies.

**Event Types:**
- `connection` - Initial connection confirmation
- `agent_launch` - New agent execution started
- `agent_complete` - Agent execution succeeded
- `agent_error` - Agent execution failed
- `workflow_trigger` - N8N workflow triggered
- `system_event` - System health update
- `heartbeat` - Keep-alive ping (every 30s)

**Event Format:**
```javascript
{
  type: 'agent_launch',
  timestamp: '2024-10-24T10:07:00Z',
  data: {
    id: 'uuid',
    agentId: 'percy',
    userId: 'user-uuid',
    status: 'running',
    source: 'dashboard'
  }
}
```

**Reconnection:**
- Exponential backoff (1s → 2s → 4s → 8s → 16s → 30s max)
- Max 5 reconnection attempts
- Shows error state after max attempts

---

## 🎯 Styling

All components use cosmic glassmorphic theme:

**Colors:**
- Background: `rgba(21, 23, 30, 0.50-0.70)`
- Borders: `rgba(45, 212, 191, 0.2-0.4)` (teal)
- Glow: `shadow-[0_0_16px_rgba(45,212,191,0.2)]`
- Text: `white`, `gray-300`, `gray-400`

**Scrollbar:**
Uses `.custom-scrollbar` class for themed scrollbars.

**Dark Mode:**
All components support dark mode with `dark:` variants.

---

## 🧪 Testing

### Manual Testing Checklist:
- [ ] Activity feed connects on dashboard load
- [ ] Launch agent from dashboard
- [ ] Verify activity appears within 1 second
- [ ] Click activity to view details modal
- [ ] Test filters (agent, status)
- [ ] Test connection error (disable network)
- [ ] Test reconnection (re-enable network)
- [ ] Test mobile responsive (FAB + bottom sheet)
- [ ] Test empty state (fresh account)
- [ ] Test collapsed sidebar toggle
- [ ] Verify dark mode styling
- [ ] Test keyboard navigation (Tab, ESC)

### Browser Testing:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## 🐛 Troubleshooting

**Problem:** Events not appearing
- Check `/api/activity/live-feed` is running
- Verify auth token in localStorage
- Check browser console for errors
- Verify Supabase Realtime is enabled

**Problem:** "Authentication required" error
- Clear browser cache
- Sign out and sign back in
- Check `supabase.auth.getSession()` returns valid session

**Problem:** Connection keeps dropping
- Check network stability
- Verify server-side SSE timeout settings
- Check firewall/proxy settings

**Problem:** Duplicate events showing
- Check event deduplication logic in `ActivityFeed.tsx`
- Verify event IDs are unique from backend

---

## 📚 API Reference

### Backend Integration

See `/app/api/activity/live-feed/route.ts` for SSE endpoint implementation.

**Database Tables:**
- `agent_launches` - Agent execution records
- `n8n_executions` - Workflow execution records
- `system_health_logs` - System status logs

**Supabase Realtime:**
- Subscribes to `INSERT` and `UPDATE` events
- Filters by `user_id` (RLS enforced)
- Broadcasts to connected clients via SSE

---

## 🚀 Performance

**Optimizations:**
- React.memo on ActivityFeedItem
- Event list capped at 50 items
- Efficient event deduplication
- Lazy loading of details modal
- Virtualization ready (can add react-virtual if needed)

**Memory:**
- ~2-5MB for 50 events
- Auto-cleanup on unmount
- No memory leaks from SSE connections

---

## 📝 Future Enhancements

**Planned:**
- [ ] Export activity feed (JSON/CSV)
- [ ] Activity feed search
- [ ] Date range picker
- [ ] Activity grouping by day
- [ ] Sound notifications (optional)
- [ ] Activity feed analytics
- [ ] Pin important activities
- [ ] Share activity links

---

## 🤝 Contributing

When adding new features:
1. Follow existing component patterns
2. Maintain cosmic glassmorphic theme
3. Add proper TypeScript types
4. Include accessibility attributes
5. Test on mobile devices
6. Update this README

---

Built with ❤️ by the SKRBL AI Team
