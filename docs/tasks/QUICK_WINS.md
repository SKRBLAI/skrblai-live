# Windsurf/Cursor Tasks - Quick Wins & Polish

## 🎯 Mission
Small, high-impact tasks that improve Percy Phase 2 features. Perfect for quick sessions or filling time between larger tasks.

---

## 🚀 Quick Wins (< 30 min each)

### **WIN 1: Add Loading States to Recommendation Badges**
**Files:** `components/percy/PercyRecommendsBadge.tsx`
**Time:** 10 minutes

```tsx
export function PercyRecommendsBadge({ confidence, loading, ...props }) {
  if (loading) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-700/50 animate-pulse">
        <div className="w-3 h-3 bg-gray-600 rounded-full" />
        <div className="w-20 h-3 bg-gray-600 rounded" />
      </div>
    );
  }

  // ... rest of component
}
```

**Impact:** Better UX while recommendations load

---

### **WIN 2: Add Copy Button to Percy Chat Messages**
**File:** `components/percy/StreamingPercyChat.tsx`
**Time:** 15 minutes

```tsx
import { Copy, Check } from 'lucide-react';

function ChatMessage({ message }: any) {
  const [copied, setCopied] = useState(false);

  const copyMessage = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative">
      {/* existing message */}

      <button
        onClick={copyMessage}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-gray-800 rounded hover:bg-gray-700"
      >
        {copied ? (
          <Check className="w-3 h-3 text-green-400" />
        ) : (
          <Copy className="w-3 h-3 text-gray-400" />
        )}
      </button>
    </div>
  );
}
```

**Impact:** Users can easily copy Percy's advice

---

### **WIN 3: Add Keyboard Shortcuts to Chat**
**File:** `components/percy/StreamingPercyChat.tsx`
**Time:** 15 minutes

```tsx
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    // Cmd/Ctrl + K to focus input
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      inputRef.current?.focus();
    }

    // Escape to clear input
    if (e.key === 'Escape') {
      setInput('');
    }
  };

  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

**Impact:** Power users can navigate faster

---

### **WIN 4: Add Confidence Score Tooltip**
**File:** `components/percy/PercyRecommendsBadge.tsx`
**Time:** 10 minutes

```tsx
<div
  title={`Percy is ${Math.round(confidence * 100)}% confident this matches your needs`}
  className="..."
>
  {/* badge content */}
</div>
```

**Impact:** Transparency about recommendation quality

---

### **WIN 5: Add Percy Avatar with Animation**
**File:** `components/percy/PercyAvatar.tsx` (NEW)
**Time:** 20 minutes

```tsx
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function PercyAvatar({ size = 'md', animated = true }: {
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  return (
    <motion.div
      animate={animated ? {
        scale: [1, 1.05, 1],
        rotate: [0, 5, -5, 0]
      } : {}}
      transition={{
        repeat: Infinity,
        duration: 3,
        ease: "easeInOut"
      }}
      className={`${sizes[size]} bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center relative`}
    >
      <Sparkles className="w-1/2 h-1/2 text-white" />

      {/* Pulse ring */}
      <motion.div
        animate={{
          scale: [1, 1.5],
          opacity: [0.5, 0]
        }}
        transition={{
          repeat: Infinity,
          duration: 2
        }}
        className="absolute inset-0 rounded-full bg-blue-500"
      />
    </motion.div>
  );
}
```

**Impact:** Branded Percy identity across platform

---

### **WIN 6: Add Error Retry Button**
**File:** `components/percy/StreamingPercyChat.tsx`
**Time:** 10 minutes

```tsx
function ErrorMessage({ error, onRetry }: any) {
  return (
    <div className="flex justify-center">
      <div className="px-4 py-3 bg-red-500/20 border border-red-500/30 rounded-lg">
        <p className="text-sm text-red-400 mb-2">{error}</p>
        <button
          onClick={onRetry}
          className="text-xs text-blue-400 hover:text-blue-300 underline"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
```

**Impact:** Better error recovery UX

---

### **WIN 7: Add Message Timestamp Formatting**
**File:** `components/percy/StreamingPercyChat.tsx`
**Time:** 10 minutes

```tsx
const formatTimestamp = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;

  return new Date(timestamp).toLocaleTimeString();
};

// Use in ChatMessage
<p className="text-xs text-gray-500 mt-1">
  {formatTimestamp(message.timestamp)}
</p>
```

**Impact:** More human-readable timestamps

---

### **WIN 8: Add Recommendation Count Badge**
**File:** `components/agents/AgentLeagueDashboard.tsx`
**Time:** 10 minutes

```tsx
<div className="flex items-center gap-2">
  <h1>Agent League</h1>
  {recommendedAgentIds.length > 0 && (
    <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30">
      {recommendedAgentIds.length} recommended
    </span>
  )}
</div>
```

**Impact:** Shows recommendation count at a glance

---

### **WIN 9: Add Smooth Scroll to Recommendations**
**File:** `components/agents/PercyRecommendationsSection.tsx`
**Time:** 10 minutes

```tsx
const scrollToAgent = (agentId: string) => {
  const element = document.getElementById(`agent-${agentId}`);
  element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
};

// Add to RecommendationCard
<div onClick={() => scrollToAgent(recommendation.agentHandoff?.agentId)}>
  {/* card content */}
</div>
```

**Impact:** Better navigation from recommendations to agents

---

### **WIN 10: Add Percy Greeting Variations**
**File:** `lib/percy/greetings.ts` (NEW)
**Time:** 15 minutes

```tsx
export const PERCY_GREETINGS = {
  morning: [
    "Good morning! ☀️",
    "Morning! Ready to crush it today?",
    "Hey there! Let's make today awesome!"
  ],
  afternoon: [
    "Good afternoon! 👋",
    "Hey! How's your day going?",
    "Afternoon! Let's keep the momentum going!"
  ],
  evening: [
    "Good evening! 🌙",
    "Hey! Wrapping up the day?",
    "Evening! Let's plan for tomorrow!"
  ]
};

export function getPercyGreeting() {
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
  const greetings = PERCY_GREETINGS[timeOfDay];
  return greetings[Math.floor(Math.random() * greetings.length)];
}
```

**Impact:** More personalized, time-aware greetings

---

## 🎨 Polish Tasks (< 45 min each)

### **POLISH 1: Add Recommendation Fade-In Animation**
**Time:** 20 minutes

Animate recommendation sections as they load with stagger effect.

### **POLISH 2: Improve Mobile Chat Layout**
**Time:** 30 minutes

Make chat full-screen on mobile with proper keyboard handling.

### **POLISH 3: Add Dark/Light Mode Toggle**
**Time:** 40 minutes

Support light mode for all Percy components.

### **POLISH 4: Add Sound Effects**
**Time:** 25 minutes

Subtle sound when Percy completes response or makes recommendation.

### **POLISH 5: Improve Loading Skeletons**
**Time:** 30 minutes

Match skeleton dimensions exactly to final content (no layout shift).

---

## 🧪 Testing Tasks (< 20 min each)

### **TEST 1: Write Unit Test for usePercyRecommendation**
**File:** `hooks/__tests__/usePercyRecommendation.test.ts`
**Time:** 20 minutes

### **TEST 2: Write Integration Test for Streaming Chat**
**File:** `components/__tests__/StreamingPercyChat.test.tsx`
**Time:** 20 minutes

### **TEST 3: Add Storybook Stories**
**File:** `components/percy/PercyRecommendsBadge.stories.tsx`
**Time:** 15 minutes

### **TEST 4: Add E2E Test for Recommendations**
**File:** `e2e/percy-recommendations.spec.ts`
**Time:** 20 minutes

---

## 📝 Documentation Tasks (< 15 min each)

### **DOC 1: Add JSDoc to All Hooks**
**Time:** 15 minutes

Add comprehensive JSDoc comments to `usePercyRecommendation` and `usePercyChat`.

### **DOC 2: Create Component Usage Examples**
**Time:** 15 minutes

Add usage examples to all Percy component files.

### **DOC 3: Update README**
**Time:** 10 minutes

Add Percy Phase 2 section to main README.

### **DOC 4: Create Troubleshooting Guide**
**Time:** 15 minutes

Document common issues and solutions.

---

## 🎯 Priority Order

**If you have 30 minutes:**
1. WIN 1: Loading States
2. WIN 4: Confidence Tooltip
3. WIN 8: Recommendation Count

**If you have 1 hour:**
1. WIN 5: Percy Avatar
2. WIN 2: Copy Button
3. WIN 9: Smooth Scroll
4. POLISH 1: Animations

**If you have 2 hours:**
1. All Quick Wins (1-10)
2. POLISH 2: Mobile Layout
3. TEST 1: Hook Tests

---

## ✅ Completion Tracking

- [ ] WIN 1: Loading States
- [ ] WIN 2: Copy Button
- [ ] WIN 3: Keyboard Shortcuts
- [ ] WIN 4: Confidence Tooltip
- [ ] WIN 5: Percy Avatar
- [ ] WIN 6: Error Retry
- [ ] WIN 7: Timestamp Formatting
- [ ] WIN 8: Count Badge
- [ ] WIN 9: Smooth Scroll
- [ ] WIN 10: Greeting Variations
- [ ] POLISH 1: Animations
- [ ] POLISH 2: Mobile Layout
- [ ] POLISH 3: Theme Toggle
- [ ] POLISH 4: Sound Effects
- [ ] POLISH 5: Skeletons
- [ ] TEST 1-4: All Tests
- [ ] DOC 1-4: All Docs

---

**Total Quick Wins:** 10 tasks (~2 hours total)
**Total Polish:** 5 tasks (~2.5 hours total)
**Total Testing:** 4 tasks (~1.5 hours total)
**Total Docs:** 4 tasks (~1 hour total)

**Grand Total:** ~7 hours of high-impact improvements
