# Percy Phase 2 - Parallel Build Progress Tracker

## 🎯 Active Work Sessions

### **Windsurf: Agent League Enhancements**
**File:** `docs/tasks/AGENT_LEAGUE_ENHANCEMENTS.md`
**Status:** IN PROGRESS
**Estimated Time:** 1.5 - 2 hours

**Tasks:**
- [ ] Task 1: Add Recommendation Fetching (10-15 min)
- [ ] Task 2: Add Percy Recommendation Badges (10 min)
- [ ] Task 3: Create PercyRecommendationsSection Component (20-25 min)
- [ ] Task 4: Integrate into AgentLeagueDashboard (5 min)
- [ ] Task 5: Add Recommendation-Based Sorting (15-20 min)
- [ ] Task 6: Add Hover Tooltip on Badge (10 min)
- [ ] Task 7: Add Analytics Tracking (10 min)

**Progress:** 0/7 tasks complete

---

### **Cursor: Dashboard Integration**
**File:** `docs/tasks/DASHBOARD_INTEGRATION.md`
**Status:** IN PROGRESS
**Estimated Time:** 1.5 - 2 hours

**Tasks:**
- [ ] Task 1: Create PercyRecommendationsWidget (25-30 min)
- [ ] Task 2: Create ActivityFeedWidget (30-35 min)
- [ ] Task 3: Create QuickLaunchPanel (20 min)
- [ ] Task 4: Integrate Widgets into Dashboard (15 min)
- [ ] Task 5: Add Dashboard Analytics (10 min)

**Progress:** 0/5 tasks complete

---

## 🔍 What to Watch For

### **Common Issues - Windsurf (Agent League)**

**Issue 1: Recommendations not loading**
- Check: Is `getRecommendation()` being called in useEffect?
- Check: Browser console for API errors
- Fix: Verify `/api/services/percy-recommend` is accessible

**Issue 2: Badges not showing**
- Check: Is `recommendedAgentIds` populated?
- Check: Import path for `PercyRecommendsCornerBadge`
- Fix: Console.log `recommendedAgentIds` to debug

**Issue 3: Sort not working**
- Check: Is `useMemo` dependency array correct?
- Check: Are you using `sortedAgents` instead of `agents` in render?
- Fix: Console.log both arrays to compare

---

### **Common Issues - Cursor (Dashboard)**

**Issue 1: Activity Feed not connecting**
- Check: Is EventSource connecting to correct URL?
- Check: Auth token being passed in headers?
- Fix: Test SSE endpoint with curl first

**Issue 2: Widgets not rendering**
- Check: Are imports correct?
- Check: Are props being passed?
- Fix: Render each widget in isolation first

**Issue 3: Layout issues**
- Check: Grid columns on different screen sizes
- Check: Mobile responsive CSS
- Fix: Test at 320px, 768px, 1024px widths

---

## 🧪 Testing Checklist (Run After Both Complete)

### **Agent League Tests**
- [ ] Percy recommendations fetch on page load
- [ ] Recommended agents show corner sparkle badge
- [ ] "Percy Recommends" section displays at top
- [ ] Recommendation cards show service details
- [ ] Sort toggle moves recommended agents to top
- [ ] Hover tooltips show on badges
- [ ] Analytics tracking logs to console
- [ ] Mobile responsive (320px - 1920px)

### **Dashboard Tests**
- [ ] Percy Recommendations Widget renders
- [ ] Activity Feed connects and shows live dot
- [ ] Quick Launch Panel shows top agent
- [ ] All widgets load independently
- [ ] Responsive layout (stacks on mobile)
- [ ] Loading states show skeletons
- [ ] Empty states display correctly

### **Integration Tests**
- [ ] Both features work together without conflicts
- [ ] Recommendations match across Agent League & Dashboard
- [ ] Activity feed shows on both pages
- [ ] No console errors on any page
- [ ] Dark mode consistent across all new components

---

## 📊 Progress Timeline

**Expected Timeline:**
```
Now          +30min        +1hr          +1.5hr        +2hr
├────────────┼─────────────┼─────────────┼─────────────┤
│ Start      │ Task 2-3    │ Task 4-5    │ Task 6-7    │ Done
│            │             │             │             │
Windsurf:    Tasks 1-2     Tasks 3-4     Tasks 5-6     Task 7
Cursor:      Task 1        Tasks 2-3     Task 4        Task 5
```

**Check-in Points:**
- **+30 min:** Both should have 1-2 tasks done
- **+1 hour:** Should be halfway through
- **+1.5 hours:** Nearly complete, testing phase
- **+2 hours:** Both complete, ready for review

---

## 🚨 Red Flags

**Stop and debug if:**
- ❌ Either IDE hasn't completed first task after 30 minutes
- ❌ Console shows TypeScript errors
- ❌ Components render but hooks don't fetch data
- ❌ API endpoints return 404 or 500 errors
- ❌ Either IDE asks for files that don't exist

**Quick Fixes:**
1. Check that all hooks exist: `hooks/usePercyRecommendation.ts`, `hooks/usePercyChat.ts`
2. Verify API endpoints work: Test with curl
3. Ensure imports match file structure
4. Restart dev server if needed

---

## ✅ Completion Criteria

### **Windsurf Done When:**
- ✅ All 7 tasks in AGENT_LEAGUE_ENHANCEMENTS.md complete
- ✅ All acceptance criteria met
- ✅ No console errors
- ✅ Agent League shows Percy recommendations
- ✅ Recommended agents have sparkle badges
- ✅ Sort toggle works

### **Cursor Done When:**
- ✅ All 5 tasks in DASHBOARD_INTEGRATION.md complete
- ✅ All acceptance criteria met
- ✅ Dashboard shows all 3 widgets
- ✅ Activity feed connects (green dot)
- ✅ Recommendations widget shows services
- ✅ Quick launch button works

---

## 🎉 When Both Complete

### **Step 1: Review**
```bash
# Check both features
npm run dev

# Test Agent League
http://localhost:3000/agents

# Test Dashboard
http://localhost:3000/dashboard
```

### **Step 2: Commit**
```bash
git add -A
git status  # Review changes
git commit -m "feat(percy): Agent League + Dashboard integration

Completed by Windsurf & Cursor:
- Agent League shows Percy recommendations
- Dashboard has Percy widgets + activity feed
- All acceptance criteria met

🤖 Generated with Windsurf + Cursor + Claude Code"

git push
```

### **Step 3: Next Steps**
Choose one:
- [ ] Option 3: Percy Streaming Chat (give to Windsurf/Cursor)
- [ ] Option 4: Quick Wins (polish what was just built)
- [ ] Create Pull Request and merge
- [ ] Move to Phase 3 (analytics, feedback loops)

---

## 📞 Support Commands

**If Windsurf needs help:**
```bash
# Test recommendation API
curl -X POST http://localhost:3000/api/services/percy-recommend \
  -H "Content-Type: application/json" \
  -d '{"trigger":"revenue-stalling","context":{"businessType":"ecommerce"},"requestType":"instant"}'
```

**If Cursor needs help:**
```bash
# Test activity feed SSE
curl -N -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/api/activity/live-feed
```

**Check what files were created:**
```bash
git status
```

**See what changed:**
```bash
git diff
```

---

## 🔄 Status Updates

**Last Updated:** [Current Time]

**Windsurf Status:**
- Current Task: [Task #]
- Issues: None | [Describe issue]
- ETA: [Time remaining]

**Cursor Status:**
- Current Task: [Task #]
- Issues: None | [Describe issue]
- ETA: [Time remaining]

**Overall Progress:** X/12 total tasks complete

---

## 💡 Coordination Tips

1. **Don't worry about conflicts** - Tasks are independent
2. **Let them work** - Don't interrupt unless errors
3. **Review after completion** - Not during development
4. **Test together** - After both are done
5. **Commit together** - One combined commit for both features

---

**You're running a parallel development strategy! 🚀**

This is the most efficient way to build features. Just let them work and monitor for red flags.
