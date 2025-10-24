# 🚀 Activity Feed - Quick Start Guide

## 🏁 Getting Started (5 Minutes)

### Step 1: Verify Backend Running

The SSE endpoint should already be deployed. Test it:

```bash
# In browser console or curl
curl -N http://localhost:3000/api/activity/live-feed
```

Expected response: SSE connection with heartbeat events.

---

### Step 2: View Activity Feed

1. **Navigate to Dashboard:**
   ```
   http://localhost:3000/dashboard
   ```

2. **Look for Activity Feed:**
   - **Desktop:** Right sidebar (384px wide)
   - **Mobile:** FAB button (bottom-right corner)

3. **Check Connection Status:**
   - Green dot + "Live" = Connected ✅
   - Red "Disconnected" = Connection issue ❌

---

### Step 3: Trigger Test Activity

**Option A: Use Existing Agent Launch**

Launch any agent from the dashboard (Percy, SkillSmith, etc.) and watch the feed update in real-time.

**Option B: Manual Test Event**

```bash
# Send test event to SSE endpoint
curl -X POST http://localhost:3000/api/activity/live-feed \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "agent_launch",
    "agentId": "percy",
    "userId": "test-user-123",
    "data": {
      "source": "manual_test",
      "status": "running"
    }
  }'
```

**Option C: Insert Direct to Database**

```sql
-- In Supabase SQL Editor
INSERT INTO agent_launches (
  agent_id,
  user_id,
  status,
  source,
  created_at
) VALUES (
  'percy',
  'your-user-id',
  'running',
  'dashboard',
  NOW()
);
```

---

### Step 4: Interact with Feed

1. **Filter by Agent:**
   - Click filter icon (top-right)
   - Select agent from dropdown
   - Feed updates instantly

2. **Filter by Status:**
   - Select status from dropdown
   - Options: All, Running, Success, Failed, Pending

3. **View Details:**
   - Click any activity item
   - Modal opens with full execution details
   - ESC to close

4. **Clear Feed:**
   - Click trash icon
   - Clears UI (doesn't delete from database)

---

### Step 5: Test Mobile

1. **Resize browser to mobile width** (< 768px)
2. **Look for FAB** (floating action button)
3. **Tap FAB** - Bottom sheet should slide up
4. **Swipe down or tap X** to close

---

## 🧪 Quick Tests

### Connection Test
- [ ] Feed connects automatically on page load
- [ ] Shows "Live" indicator when connected
- [ ] Heartbeat keeps connection alive (check every 30s)

### Real-Time Test
- [ ] Launch an agent from dashboard
- [ ] Activity appears in feed within 1 second
- [ ] Status badge shows "Running" (green + spinning icon)

### Update Test
- [ ] Wait for agent to complete
- [ ] Activity item updates to "Success" or "Failed"
- [ ] Badge changes color and icon

### UI Test
- [ ] Click activity item
- [ ] Details modal opens
- [ ] Shows timeline, duration, metadata
- [ ] JSON result displays correctly (if success)
- [ ] Error message displays correctly (if failed)

### Filter Test
- [ ] Open filters
- [ ] Select specific agent
- [ ] Feed shows only that agent's activities
- [ ] Change to "Running" status filter
- [ ] Feed shows only running activities

### Responsive Test
- [ ] Desktop: Sidebar visible by default
- [ ] Click collapse button - Sidebar hides
- [ ] Click expand button - Sidebar shows
- [ ] Mobile: FAB visible
- [ ] Tap FAB - Bottom sheet opens
- [ ] Tap outside - Bottom sheet closes

---

## 🐛 Troubleshooting

### "Authentication required" Error

**Cause:** No valid auth token found.

**Fix:**
1. Sign in to dashboard
2. Check localStorage for `supabase.auth.token`
3. Hard refresh (Ctrl+Shift+R)

### Events Not Appearing

**Cause:** SSE connection not established.

**Fix:**
1. Check browser console for errors
2. Verify `/api/activity/live-feed` is accessible
3. Check Supabase Realtime is enabled
4. Verify RLS policies on `agent_launches` table

### Connection Keeps Dropping

**Cause:** Network issues or server timeout.

**Fix:**
1. Check network stability
2. Look for proxy/firewall blocking SSE
3. Verify server keepalive settings
4. Check browser console for reconnection attempts

### Activities Duplicated

**Cause:** Event deduplication not working.

**Fix:**
1. Check event IDs are unique from backend
2. Verify `ActivityFeed.tsx` deduplication logic
3. Clear feed and refresh page

---

## 📊 Expected Behavior

### On Dashboard Load
```
1. ActivityFeed component mounts
2. Connects to /api/activity/live-feed
3. Shows loading skeleton (3 cards)
4. Receives "connection" event
5. Shows empty state (if no activities)
6. Connection status: "Live" (green)
```

### On Agent Launch
```
1. Agent launched from dashboard
2. Backend inserts to agent_launches table
3. Supabase Realtime triggers
4. SSE sends "agent_launch" event
5. ActivityFeed receives event
6. New ActivityFeedItem animates in (top)
7. Status badge shows "Running" (green + spin)
```

### On Agent Complete
```
1. Agent execution finishes
2. Backend updates agent_launches row
3. Supabase Realtime triggers
4. SSE sends "agent_complete" or "agent_error" event
5. ActivityFeed finds existing item by ID
6. Updates item status in place
7. Status badge changes to "Success" or "Failed"
```

---

## 🎨 Visual Reference

### Desktop Layout
```
┌─────────────────────────────────────┬──────────────┐
│                                     │  ┌────────┐  │
│  Dashboard Content                  │  │Activity│  │
│                                     │  │ Feed   │  │
│  - Welcome Header                   │  │        │  │
│  - Quick Wins                       │  │ [Item] │  │
│  - Agent Cards                      │  │ [Item] │  │
│  - Quick Actions                    │  │ [Item] │  │
│                                     │  └────────┘  │
└─────────────────────────────────────┴──────────────┘
         Main Content (flex-1)          Sidebar (384px)
```

### Mobile Layout
```
┌─────────────────────────────────────┐
│  Dashboard Content                  │
│                                     │
│  (Full width)                       │
│                                     │
│                                     │
│                              ┌───┐  │
│                              │ ● │  │ ← FAB
│                              └───┘  │
└─────────────────────────────────────┘

On FAB tap:
┌─────────────────────────────────────┐
│ ┃ (swipe handle)                    │
│ ┌───────────────────────────────┐   │
│ │ Activity Feed                 │   │
│ │                               │   │
│ │ [Item]                        │   │
│ │ [Item]                        │   │
│ │ [Item]                        │   │
│ └───────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## 🎯 Success Criteria

After following this guide, you should see:

✅ Activity feed visible on dashboard  
✅ "Live" connection indicator (green)  
✅ Real-time updates when agents launch  
✅ Status changes from running → success/failed  
✅ Click opens detailed modal  
✅ Filters work correctly  
✅ Mobile responsive (FAB + bottom sheet)  
✅ Smooth animations throughout  
✅ No console errors  
✅ Cosmic glassmorphic styling  

---

## 📞 Next Steps

1. **Run through manual testing checklist** (see main README.md)
2. **Test with real agent executions** (not just manual events)
3. **Test on actual mobile devices** (iOS Safari, Chrome Mobile)
4. **Load test with 50+ events** (verify performance)
5. **Accessibility audit** (keyboard nav, screen readers)

---

## 🎉 You're Ready!

The activity feed is now live and monitoring your agent executions in real-time. Enjoy watching your AI agents work! 🤖✨

For detailed documentation, see:
- `/components/activity/README.md` - Component API docs
- `/docs/ACTIVITY_FEED_UI_COMPLETE.md` - Implementation summary

---

**Built with ❤️ by Windsurf**  
Last updated: October 24, 2024
