# Windsurf/Cursor Tasks - Agent League Enhancements

## 🎯 Mission
Add Percy's intelligent recommendations to the Agent League dashboard. Show users which agents Percy recommends based on their business needs, with visual indicators and context.

---

## 📋 Task Breakdown

### **TASK 1: Add Recommendation Fetching to AgentLeagueDashboard**
**File:** `components/agents/AgentLeagueDashboard.tsx`
**Difficulty:** Easy
**Time:** 10-15 minutes

**What to do:**
1. Import the recommendation hook at the top:
```tsx
import { usePercyRecommendation } from '@/hooks/usePercyRecommendation';
```

2. Add the hook to the component (around line 43):
```tsx
const { recommendation, getRecommendation, loading: recommendationLoading } = usePercyRecommendation();
```

3. Fetch recommendations on component mount (add to existing useEffect or create new one):
```tsx
useEffect(() => {
  // Get contextual recommendations based on user
  getRecommendation('contextual', {
    businessType: 'saas', // TODO: Get from user profile
    urgencyLevel: 'medium',
    userHistory: [] // TODO: Get from user's past agent launches
  });
}, [getRecommendation]);
```

4. Extract recommended agent IDs:
```tsx
const recommendedAgentIds = useMemo(() => {
  if (!recommendation?.recommendation) return [];

  const rec = recommendation.recommendation;
  const agentId = rec.agentHandoff?.agentId;

  return agentId ? [agentId] : [];
}, [recommendation]);
```

**Acceptance Criteria:**
- [ ] Hook imported and used
- [ ] Recommendations fetched on mount
- [ ] No console errors
- [ ] recommendedAgentIds state contains agent IDs

---

### **TASK 2: Add Percy Recommendation Badges to Agent Cards**
**File:** `components/agents/AgentLeagueDashboard.tsx`
**Difficulty:** Easy
**Time:** 10 minutes

**What to do:**
1. Import the badge component:
```tsx
import { PercyRecommendsCornerBadge } from '@/components/percy/PercyRecommendsBadge';
```

2. Find where agents are rendered (around line 200-250, look for the map function)

3. Add the corner badge when agent is recommended:
```tsx
{agents.map(agent => (
  <div key={agent.id} className="relative">
    {/* Add this badge */}
    {recommendedAgentIds.includes(agent.id) && (
      <PercyRecommendsCornerBadge
        confidence={recommendation?.metadata.confidence || 0.9}
      />
    )}

    {/* Existing agent card code */}
    <AgentLeagueCard {...existingProps} />
  </div>
))}
```

**Acceptance Criteria:**
- [ ] Badge appears on recommended agents
- [ ] Badge positioned in top-right corner
- [ ] Badge animates on render
- [ ] Confidence score shows on hover

---

### **TASK 3: Create "Percy Recommends" Section**
**File:** `components/agents/PercyRecommendationsSection.tsx` (NEW FILE)
**Difficulty:** Medium
**Time:** 20-25 minutes

**What to do:**
Create a new component that shows Percy's top recommendations at the top of Agent League.

**Component Structure:**
```tsx
'use client';

import { usePercyRecommendation } from '@/hooks/usePercyRecommendation';
import { PercyRecommendsBadge } from '@/components/percy/PercyRecommendsBadge';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp } from 'lucide-react';

interface PercyRecommendationsSectionProps {
  userContext?: {
    businessType?: string;
    urgencyLevel?: 'low' | 'medium' | 'high' | 'critical';
  };
}

export function PercyRecommendationsSection({ userContext }: PercyRecommendationsSectionProps) {
  const { recommendation, loading, getRecommendationSet } = usePercyRecommendation();

  useEffect(() => {
    getRecommendationSet(
      {
        businessType: userContext?.businessType || 'general',
        urgencyLevel: userContext?.urgencyLevel || 'medium'
      },
      3 // Get 3 recommendations
    );
  }, [userContext]);

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
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/30"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-blue-400" />
        <h2 className="text-xl font-bold text-white">Percy Recommends for You</h2>
      </div>

      <p className="text-sm text-gray-300 mb-4">
        {recommendation.percyMessage.greeting} {recommendation.percyMessage.confidence}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendations.slice(0, 3).map((rec, idx) => (
          <RecommendationCard key={idx} recommendation={rec} rank={idx + 1} />
        ))}
      </div>
    </motion.div>
  );
}

function RecommendationCard({ recommendation, rank }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: rank * 0.1 }}
      className="p-4 bg-black/40 rounded-lg border border-blue-500/20 hover:border-blue-500/40 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-2xl">#{rank}</span>
        <PercyRecommendsBadge
          confidence={recommendation.confidence}
          variant="inline"
        />
      </div>

      <h3 className="text-lg font-semibold text-white mb-2">
        {recommendation.service.name}
      </h3>

      <p className="text-sm text-gray-400 mb-3">
        {recommendation.reasoning}
      </p>

      {recommendation.agentHandoff && (
        <div className="flex items-center gap-2 text-xs text-blue-400">
          <TrendingUp className="w-3 h-3" />
          <span>Handled by {recommendation.agentHandoff.agentName}</span>
        </div>
      )}
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="mb-8 p-6 bg-gray-800/20 rounded-xl animate-pulse">
      <div className="h-6 w-48 bg-gray-700/30 rounded mb-4"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 bg-gray-700/20 rounded-lg"></div>
        ))}
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Component renders above agent grid
- [ ] Shows 3 recommendation cards
- [ ] Loading skeleton shows while fetching
- [ ] Cards animate in with stagger effect
- [ ] Clicking card navigates to agent (future enhancement)

---

### **TASK 4: Integrate PercyRecommendationsSection into AgentLeagueDashboard**
**File:** `components/agents/AgentLeagueDashboard.tsx`
**Difficulty:** Easy
**Time:** 5 minutes

**What to do:**
1. Import the new component:
```tsx
import { PercyRecommendationsSection } from './PercyRecommendationsSection';
```

2. Add it above the agent grid (around line 200):
```tsx
{/* Add this section */}
<PercyRecommendationsSection
  userContext={{
    businessType: 'saas', // TODO: Get from user profile
    urgencyLevel: 'medium'
  }}
/>

{/* Existing agent grid */}
<div className="agent-grid">
  ...
</div>
```

**Acceptance Criteria:**
- [ ] Section appears above agent grid
- [ ] No layout shifts
- [ ] Responsive on mobile
- [ ] No console errors

---

### **TASK 5: Add Recommendation-Based Sorting Toggle**
**File:** `components/agents/AgentLeagueDashboard.tsx`
**Difficulty:** Medium
**Time:** 15-20 minutes

**What to do:**
1. Add state for sort mode:
```tsx
const [sortMode, setSortMode] = useState<'default' | 'recommended'>('default');
```

2. Add toggle button in the header:
```tsx
<div className="flex items-center justify-between mb-6">
  <h1>Agent League</h1>

  <button
    onClick={() => setSortMode(prev => prev === 'default' ? 'recommended' : 'default')}
    className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 rounded-lg text-sm font-medium transition-all"
  >
    {sortMode === 'recommended' ? '✨ Showing Recommended' : 'Show Recommended First'}
  </button>
</div>
```

3. Sort agents based on recommendations:
```tsx
const sortedAgents = useMemo(() => {
  if (sortMode === 'default') return agents;

  return [...agents].sort((a, b) => {
    const aRecommended = recommendedAgentIds.includes(a.id);
    const bRecommended = recommendedAgentIds.includes(b.id);

    if (aRecommended && !bRecommended) return -1;
    if (!aRecommended && bRecommended) return 1;
    return 0;
  });
}, [agents, sortMode, recommendedAgentIds]);
```

4. Use `sortedAgents` instead of `agents` in the render:
```tsx
{sortedAgents.map(agent => (
  // ... agent card
))}
```

**Acceptance Criteria:**
- [ ] Toggle button visible and clickable
- [ ] Recommended agents move to top when toggled
- [ ] Sort is smooth (no flicker)
- [ ] Button shows current state

---

### **TASK 6: Add Hover Tooltip on Recommendation Badge**
**File:** `components/percy/PercyRecommendsBadge.tsx`
**Difficulty:** Easy
**Time:** 10 minutes

**What to do:**
Enhance the `PercyRecommendsCornerBadge` to show a tooltip on hover.

1. Add tooltip state:
```tsx
const [showTooltip, setShowTooltip] = useState(false);
```

2. Wrap badge with tooltip container:
```tsx
<div
  className="relative"
  onMouseEnter={() => setShowTooltip(true)}
  onMouseLeave={() => setShowTooltip(false)}
>
  {/* Existing badge */}
  <motion.div ...>
    <Sparkles className="w-4 h-4 text-white" />
  </motion.div>

  {/* Tooltip */}
  {showTooltip && (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute top-full right-0 mt-2 w-48 p-3 bg-gray-900 border border-blue-500/30 rounded-lg shadow-xl z-50"
    >
      <p className="text-xs text-gray-200 font-semibold mb-1">
        Percy Recommends This
      </p>
      <p className="text-xs text-gray-400">
        {Math.round(confidence * 100)}% confidence match based on your business needs
      </p>
    </motion.div>
  )}
</div>
```

**Acceptance Criteria:**
- [ ] Tooltip appears on hover
- [ ] Shows confidence percentage
- [ ] Animates smoothly
- [ ] Positioned correctly (not cut off)

---

### **TASK 7: Add Analytics Tracking**
**File:** `components/agents/AgentLeagueDashboard.tsx`
**Difficulty:** Easy
**Time:** 10 minutes

**What to do:**
Track when users interact with recommended agents.

1. Add tracking function:
```tsx
const trackRecommendationClick = (agentId: string, isRecommended: boolean) => {
  // TODO: Send to analytics service
  console.log('[Percy Analytics] Agent clicked:', {
    agentId,
    isRecommended,
    confidence: recommendation?.metadata.confidence,
    timestamp: Date.now()
  });

  // You can integrate with your existing analytics here
  // e.g., analytics.track('percy_recommendation_click', { agentId, ... })
};
```

2. Add onClick to agent cards:
```tsx
<AgentLeagueCard
  {...existingProps}
  onClick={() => trackRecommendationClick(agent.id, recommendedAgentIds.includes(agent.id))}
/>
```

**Acceptance Criteria:**
- [ ] Console logs tracking events
- [ ] Events include all relevant data
- [ ] No performance impact
- [ ] Ready for analytics integration

---

## 🧪 Testing Checklist

After completing all tasks, verify:

- [ ] Percy recommendations fetch on page load
- [ ] Recommended agents show corner badges
- [ ] "Percy Recommends" section displays at top
- [ ] Recommendation cards show service details
- [ ] Sort toggle moves recommended agents to top
- [ ] Hover tooltips work on badges
- [ ] Analytics tracking logs events
- [ ] No console errors or warnings
- [ ] Responsive on mobile (320px - 1920px)
- [ ] Dark mode looks good
- [ ] Animations are smooth (60fps)

---

## 📸 Visual Reference

**Before:**
```
┌────────────────────────────────┐
│  Agent League                  │
├────────────────────────────────┤
│                                │
│  [Agent] [Agent] [Agent]       │
│  [Agent] [Agent] [Agent]       │
│                                │
└────────────────────────────────┘
```

**After:**
```
┌────────────────────────────────┐
│  Agent League  [Sort ▼]        │
├────────────────────────────────┤
│  ✨ Percy Recommends for You   │
│  ┌─────┐ ┌─────┐ ┌─────┐      │
│  │ #1  │ │ #2  │ │ #3  │      │
│  └─────┘ └─────┘ └─────┘      │
├────────────────────────────────┤
│                                │
│  [Agent ✨] [Agent] [Agent]    │
│  [Agent]    [Agent] [Agent]    │
│                                │
└────────────────────────────────┘
```

---

## 💡 Tips for Success

1. **Work incrementally** - Complete tasks 1-7 in order
2. **Test as you go** - Check after each task before moving on
3. **Use existing patterns** - Copy styles from existing components
4. **Console.log everything** - Debug recommendation data as it comes in
5. **Check mobile** - Resize browser to test responsive design
6. **Ask questions** - If Percy data format is unclear, check the hook

---

## 🆘 Troubleshooting

**Problem: Recommendations not loading**
- Check browser console for errors
- Verify `/api/services/percy-recommend` is accessible
- Check network tab for API response
- Ensure recommendation hook is called correctly

**Problem: Badge not showing**
- Verify `recommendedAgentIds` contains the agent ID
- Check badge import path is correct
- Ensure `confidence` value is between 0-1
- Check z-index isn't being overridden

**Problem: Sort not working**
- Console.log `sortedAgents` to verify sorting
- Check `useMemo` dependencies include `recommendedAgentIds`
- Verify sort logic is correct

---

## ✅ Definition of Done

- All 7 tasks completed
- Testing checklist passed
- No console errors
- Mobile responsive
- Percy recommendations visible and actionable
- Analytics tracking in place
- Code committed to branch

**Estimated Total Time:** 1.5 - 2 hours

Good luck! 🚀
