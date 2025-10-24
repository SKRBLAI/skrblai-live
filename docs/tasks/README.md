# Percy Phase 2 - Task Distribution Guide

## 🎯 Overview

This directory contains **detailed, AI-friendly task lists** for Windsurf, Cursor, and other AI-assisted IDEs to help build Percy Phase 2 features in parallel.

All tasks are:
✅ Well-scoped and specific
✅ Include code examples
✅ Have clear acceptance criteria
✅ UI/component-focused (perfect for AI assistants)
✅ Organized by difficulty and time estimates

---

## 📂 Task Files

### 🏆 **Agent League Enhancements**
**File:** [`AGENT_LEAGUE_ENHANCEMENTS.md`](./AGENT_LEAGUE_ENHANCEMENTS.md)
**Time:** 1.5 - 2 hours
**Tasks:** 7

Add Percy's intelligent recommendations to Agent League dashboard:
- Fetch recommendations on page load
- Display recommendation badges on agent cards
- Create "Percy Recommends" section
- Add recommendation-based sorting
- Implement hover tooltips
- Track analytics

**Best for:** Windsurf/Cursor working on agent discovery UX

---

### 📊 **Dashboard Integration**
**File:** [`DASHBOARD_INTEGRATION.md`](./DASHBOARD_INTEGRATION.md)
**Time:** 1.5 - 2 hours
**Tasks:** 5

Add Percy widgets to main dashboard:
- Percy Recommendations Widget
- Live Activity Feed Widget
- Quick Launch Panel
- Dashboard layout integration
- Analytics tracking

**Best for:** Windsurf/Cursor working on dashboard improvements

---

### 💬 **Percy Streaming Chat Enhancement**
**File:** [`PERCY_STREAMING_CHAT.md`](./PERCY_STREAMING_CHAT.md)
**Time:** 2 - 2.5 hours
**Tasks:** 7

Replace static Percy chat with real-time streaming:
- Build streaming chat component
- Add welcome messages
- Implement suggested responses
- Add context capture
- Markdown rendering
- Chat export feature

**Best for:** Windsurf/Cursor working on conversational UX

---

### ⚡ **Quick Wins & Polish**
**File:** [`QUICK_WINS.md`](./QUICK_WINS.md)
**Time:** Variable (10-45 min per task)
**Tasks:** 23

Small, high-impact improvements:
- **10 Quick Wins** (< 30 min each)
- **5 Polish Tasks** (< 45 min each)
- **4 Testing Tasks** (< 20 min each)
- **4 Documentation Tasks** (< 15 min each)

**Best for:** Filling gaps between larger tasks, or quick productivity bursts

---

### 🌊 **Activity Feed UI** (Already Exists)
**File:** [`../WINDSURF_TASKS.md`](../WINDSURF_TASKS.md)
**Time:** 1.5 - 2 hours
**Tasks:** Multiple

Build the real-time activity feed UI components.

**Note:** This was created in the first batch. Moved to `docs/` for organization.

---

## 🚀 Quick Start

### For Windsurf/Cursor Users:

1. **Pick a task file** based on what you want to work on
2. **Open the file** and read the mission
3. **Follow tasks sequentially** (they build on each other)
4. **Test as you go** (check acceptance criteria)
5. **Mark completed** in the checklist

### For Project Managers:

1. **Assign task files** to different team members/IDEs
2. **Track progress** using the checklists
3. **Parallelize work** across multiple files
4. **Review** using acceptance criteria

---

## 📊 Task Overview Matrix

| Task File | Time | Tasks | Difficulty | Dependencies |
|-----------|------|-------|------------|--------------|
| Agent League | 1.5-2h | 7 | Easy-Medium | Phase 2 hooks |
| Dashboard | 1.5-2h | 5 | Easy-Medium | Phase 2 hooks |
| Streaming Chat | 2-2.5h | 7 | Medium | Phase 2 chat endpoint |
| Quick Wins | 10-45m | 23 | Easy | Various |
| Activity Feed | 1.5-2h | Multiple | Medium | Database migration |

**Total Available Work:** ~10-12 hours of parallelizable tasks

---

## 🎯 Recommended Workflow

### Scenario 1: Single AI Assistant (Windsurf/Cursor)
**Goal:** Build one feature end-to-end

**Path A - Agent League Focus:**
1. Start with `AGENT_LEAGUE_ENHANCEMENTS.md`
2. Complete all 7 tasks
3. Pick 3-5 Quick Wins to polish
4. Write tests

**Path B - Dashboard Focus:**
1. Start with `DASHBOARD_INTEGRATION.md`
2. Complete all 5 tasks
3. Add Activity Feed UI from `WINDSURF_TASKS.md`
4. Pick Quick Wins for polish

**Path C - Chat Focus:**
1. Start with `PERCY_STREAMING_CHAT.md`
2. Complete all 7 tasks
3. Add Quick Wins for UX polish
4. Write tests

---

### Scenario 2: Multiple AI Assistants (Parallel Work)
**Goal:** Build all features simultaneously

**Assignment:**
- **Windsurf 1:** Agent League Enhancements
- **Cursor 1:** Dashboard Integration
- **Windsurf 2:** Streaming Chat Enhancement
- **Cursor 2:** Activity Feed UI + Quick Wins

**Timeline:** All complete in ~2 hours (parallel)

---

### Scenario 3: Incremental Progress
**Goal:** Build over multiple sessions

**Week 1:**
- Agent League Enhancements (Tasks 1-4)
- 5 Quick Wins

**Week 2:**
- Agent League Enhancements (Tasks 5-7)
- Dashboard Integration (Tasks 1-3)

**Week 3:**
- Dashboard Integration (Tasks 4-5)
- Streaming Chat (Tasks 1-4)

**Week 4:**
- Streaming Chat (Tasks 5-7)
- Activity Feed UI
- Polish + Tests

---

## ✅ Prerequisites

Before starting any tasks, ensure:

- [ ] **Database migration applied** (`supabase/migrations/20251024_activity_feed_tables.sql`)
- [ ] **Environment variable set** (`ANTHROPIC_API_KEY`)
- [ ] **Percy Phase 2 branch merged** (or working on feature branch)
- [ ] **Dependencies installed** (`npm install`)
- [ ] **Dev server running** (`npm run dev`)

---

## 🧪 Testing Strategy

Each task file includes **acceptance criteria**. After completing tasks:

1. **Manual Testing**
   - Check all acceptance criteria
   - Test on mobile (responsive)
   - Verify dark mode
   - Check console for errors

2. **Automated Testing** (if time permits)
   - Use Quick Wins > Testing Tasks
   - Write unit tests for hooks
   - Add integration tests for components
   - E2E tests for critical paths

3. **Review Checklist**
   - No console errors
   - No TypeScript errors
   - All acceptance criteria met
   - Loading/error states work
   - Animations smooth (60fps)

---

## 📚 Reference Documentation

**Integration Guides:**
- [`../PERCY_PHASE2_INTEGRATION.md`](../PERCY_PHASE2_INTEGRATION.md) - Full integration guide
- [`../ACTIVITY_FEED.md`](../ACTIVITY_FEED.md) - Activity feed setup
- [`../POST_MERGE_SETUP.md`](../POST_MERGE_SETUP.md) - Post-merge checklist

**API Reference:**
- `/app/api/services/percy-recommend/route.ts` - Recommendation API
- `/app/api/percy/chat/route.ts` - Streaming chat API
- `/app/api/activity/live-feed/route.ts` - Activity feed SSE

**Hooks:**
- `/hooks/usePercyRecommendation.ts` - Recommendation hook
- `/hooks/usePercyChat.ts` - Streaming chat hook

**Components:**
- `/components/percy/PercyRecommendsBadge.tsx` - Recommendation badges

---

## 🆘 Troubleshooting

### Recommendations Not Loading
- Check `/api/services/percy-recommend` is accessible
- Verify auth token in request headers
- Check browser console for errors
- Review recommendation context format

### Streaming Chat Not Working
- Verify `ANTHROPIC_API_KEY` is set
- Check browser supports EventSource (SSE)
- Review network tab for streaming response
- Check API logs for errors

### Activity Feed Not Connecting
- Ensure database migration applied
- Verify Supabase Realtime enabled
- Check RLS policies
- Test SSE endpoint with curl

### Component Not Rendering
- Check import paths are correct
- Verify all props are provided
- Check for TypeScript errors
- Review browser console

---

## 💡 Tips for AI Assistants

1. **Read the entire task** before starting
2. **Follow code examples** closely
3. **Test incrementally** - don't batch multiple tasks before testing
4. **Check existing patterns** - look at similar components for styling
5. **Ask questions** - if data format is unclear, check the API
6. **Console.log everything** - debug as you build
7. **Check mobile** - test responsive design early
8. **Commit often** - checkpoint after each completed task

---

## 📈 Progress Tracking

### Overall Progress

- [ ] Agent League Enhancements (0/7 tasks)
- [ ] Dashboard Integration (0/5 tasks)
- [ ] Percy Streaming Chat (0/7 tasks)
- [ ] Activity Feed UI (0/6+ tasks)
- [ ] Quick Wins (0/10 tasks)
- [ ] Polish (0/5 tasks)
- [ ] Testing (0/4 tasks)
- [ ] Documentation (0/4 tasks)

**Total:** 0/48+ tasks complete

---

## 🎉 Success Metrics

You'll know Phase 2 is complete when:

✅ Percy recommendations appear on Agent League
✅ Dashboard shows Percy widgets
✅ Percy chat streams real-time responses
✅ Activity feed shows live agent work
✅ All acceptance criteria met
✅ No console errors
✅ Mobile responsive
✅ Tests passing
✅ Documentation updated

---

## 🚦 Priority Levels

**P0 (Critical):**
- Agent League Enhancements (Tasks 1-4)
- Dashboard Integration (Tasks 1-2)
- Streaming Chat (Tasks 1-2)

**P1 (High):**
- Agent League Enhancements (Tasks 5-7)
- Dashboard Integration (Tasks 3-5)
- Streaming Chat (Tasks 3-5)
- Activity Feed UI (Core components)

**P2 (Medium):**
- Streaming Chat (Tasks 6-7)
- Quick Wins (1-5)
- Polish tasks

**P3 (Nice-to-have):**
- Quick Wins (6-10)
- Testing tasks
- Documentation tasks

---

## 📞 Support

**Questions about:**
- **Architecture:** Check `../PERCY_PHASE2_INTEGRATION.md`
- **API format:** Check API route files directly
- **Component patterns:** Look at existing Percy components
- **Setup:** Check `../POST_MERGE_SETUP.md`

**Stuck?**
1. Check the troubleshooting section
2. Review related code files
3. Test with curl to isolate issues
4. Check browser console and network tab

---

**Happy building! 🚀**

Generated by Claude Code for Percy Phase 2
