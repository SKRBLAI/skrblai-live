# Manual Integration Guide: Streaming Percy Chat

## 🎯 Status

✅ **StreamingPercyChat component** - Built and ready
⚠️ **Integration** - Needs manual work (Task 6)

**Component Location:** `components/percy/StreamingPercyChat.tsx`

---

## 🧪 Step 1: Test First (5 minutes)

I created a test page for you. Test it now:

```bash
# Start dev server
npm run dev

# Visit test page
http://localhost:3000/test-percy-chat
```

**What to test:**
- [ ] Chat auto-sends welcome message
- [ ] Type a message - does it stream token-by-token?
- [ ] Typing indicator shows while streaming
- [ ] Suggested responses appear initially
- [ ] Markdown formatting works (try typing **bold**)
- [ ] Export button downloads chat

**If test page works → Proceed to Step 2**
**If test page has errors → Debug first, then proceed**

---

## 🔧 Step 2: Integration Options

Choose ONE of these integration paths:

---

### **Option A: Replace Chat in PercyWidget** (Recommended)

**File to modify:** `components/percy/PercyWidget.tsx`

**Current Implementation:**
The PercyWidget has a legacy chat implementation around lines 87-200.

**Replace with:**

1. **Add import at top:**
```tsx
import { StreamingPercyChat } from './StreamingPercyChat';
```

2. **Find the chat messages section** (around line 150-200)

3. **Replace with:**
```tsx
{activeView === 'chat' && (
  <div className="h-[500px]">
    <StreamingPercyChat
      initialContext={{
        businessType: userBusinessType, // Get from user profile
        currentRevenue: userRevenue,     // Get from user data
        mainGoal: userGoal               // Get from onboarding
      }}
      onRecommendation={(rec) => {
        // Handle when Percy recommends something
        console.log('[Percy] Recommendation:', rec);
        // You can trigger navigation, show modal, etc.
      }}
    />
  </div>
)}
```

**Acceptance Criteria:**
- [ ] PercyWidget now shows streaming chat
- [ ] Welcome message appears automatically
- [ ] Messages stream in real-time
- [ ] Old chat functionality removed

---

### **Option B: Create New Percy Chat Page**

**File to create:** `app/percy/chat/page.tsx`

```tsx
'use client';

import { StreamingPercyChat } from '@/components/percy/StreamingPercyChat';
import { useAuth } from '@/components/context/AuthContext';

export default function PercyChatPage() {
  const { session } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            Chat with Percy 🤖
          </h1>
          <p className="text-gray-400">
            Your AI business advisor powered by Claude
          </p>
        </div>

        {/* Chat */}
        <div className="h-[calc(100vh-200px)]">
          <StreamingPercyChat
            initialContext={{
              businessType: 'saas', // TODO: Get from user profile
              currentRevenue: 0,    // TODO: Get from user data
              mainGoal: 'growth'    // TODO: Get from onboarding
            }}
            onRecommendation={(rec) => {
              // TODO: Handle recommendations
              console.log('Recommendation:', rec);
            }}
          />
        </div>
      </div>
    </div>
  );
}
```

**Then add navigation:**
```tsx
// In your main navigation
<Link href="/percy/chat">
  Chat with Percy
</Link>
```

---

### **Option C: Add to Onboarding Flow**

**File to modify:** Onboarding component (search for `PercyOnboarding`)

**Add streaming chat as a step:**

```tsx
import { StreamingPercyChat } from '@/components/percy/StreamingPercyChat';

// In your onboarding steps
{currentStep === 'chat' && (
  <div className="h-[600px]">
    <StreamingPercyChat
      initialContext={{
        businessType: formData.businessType,
        currentRevenue: formData.revenue,
        mainGoal: formData.goal
      }}
      onRecommendation={(rec) => {
        // Save recommendation
        setRecommendedAgent(rec.agentHandoff?.agentId);
        // Move to next step
        nextStep();
      }}
    />
  </div>
)}
```

---

### **Option D: Modal/Drawer Implementation**

Create a floating Percy chat that can be opened from anywhere:

**File to create:** `components/percy/PercyChatModal.tsx`

```tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle } from 'lucide-react';
import { StreamingPercyChat } from './StreamingPercyChat';

export function PercyChatModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-40"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Chat Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-4 md:inset-auto md:right-6 md:bottom-6 md:top-6 md:w-[500px] bg-gray-900 rounded-xl shadow-2xl z-50"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h2 className="text-lg font-bold text-white">
                  Chat with Percy
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat */}
              <div className="h-[calc(100%-60px)]">
                <StreamingPercyChat
                  initialContext={{}}
                  onRecommendation={(rec) => {
                    console.log('Recommendation:', rec);
                  }}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
```

**Then add to layout:**
```tsx
// In app/layout.tsx or main layout component
import { PercyChatModal } from '@/components/percy/PercyChatModal';

<PercyChatModal />
```

---

## 📊 Which Option Should You Choose?

| Option | Best For | Effort | Impact |
|--------|----------|--------|--------|
| **A: Replace PercyWidget** | Already have Percy widget | Medium | High |
| **B: New Percy Page** | Want dedicated chat page | Low | Medium |
| **C: Onboarding Flow** | Capture context early | Medium | High |
| **D: Modal/Drawer** | Universal access anywhere | Low | High |

**My Recommendation:** **Option D (Modal)** - Easiest, most flexible, accessible from anywhere.

---

## ✅ After Integration

### Test Checklist:
- [ ] Streaming chat appears in your chosen location
- [ ] Welcome message sends automatically
- [ ] Messages stream token-by-token (not all at once)
- [ ] Typing indicator shows while Percy is typing
- [ ] Suggested responses work
- [ ] Context gets captured from messages
- [ ] Markdown renders (try: **bold**, *italic*, lists)
- [ ] Export downloads chat as .txt file
- [ ] Mobile responsive
- [ ] No console errors

### Environment Variable Check:
```bash
# Verify this is set in .env.local
ANTHROPIC_API_KEY=sk-ant-...
```

**Without this, streaming won't work!**

---

## 🐛 Troubleshooting

**Problem: Streaming doesn't work**
- Check: Is `ANTHROPIC_API_KEY` set?
- Check: Is `/api/percy/chat` endpoint accessible?
- Test: `curl -X POST http://localhost:3000/api/percy/chat -H "Content-Type: application/json" -d '{"message":"test"}'`

**Problem: Component doesn't render**
- Check: Import path correct?
- Check: All props provided?
- Check: TypeScript errors in console?

**Problem: Markdown not rendering**
- Check: `react-markdown` installed? (`npm install react-markdown`)
- Check: No TypeScript errors?

**Problem: Welcome message doesn't send**
- Check: Component mounted?
- Check: API endpoint working?
- Check: Console for errors?

---

## 🚀 Quick Win: Option D Implementation (15 minutes)

**Fastest path to get streaming chat live:**

1. **Create the modal component** (copy Option D code above)
2. **Add to your root layout:**
   ```tsx
   import { PercyChatModal } from '@/components/percy/PercyChatModal';

   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <PercyChatModal />
         </body>
       </html>
     );
   }
   ```
3. **Test:** Floating button should appear bottom-right
4. **Click it:** Streaming chat should open
5. **Done!** Percy is now accessible from every page

---

## 📝 Commit After Integration

```bash
git add .
git commit -m "feat: Integrate StreamingPercyChat into [location]

- Added streaming Percy chat to [PercyWidget/Modal/Page]
- Real-time token-by-token responses
- Auto-welcome message
- Context capture and markdown rendering
- Fully tested and working

Completes Task 6 of Percy Streaming Chat implementation.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git push
```

---

**Next:** After integration is done, we can finalize Phase 2 and create the PR! 🚀
