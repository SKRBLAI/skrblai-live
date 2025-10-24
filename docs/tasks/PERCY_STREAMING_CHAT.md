# Windsurf/Cursor Tasks - Percy Streaming Chat Enhancement

## 🎯 Mission
Replace static Percy chat with real-time streaming AI chat. Make Percy feel alive with token-by-token responses and context-aware conversations.

---

## 📋 Task Breakdown

### **TASK 1: Create New Streaming Percy Chat Component**
**File:** `components/percy/StreamingPercyChat.tsx` (NEW FILE)
**Difficulty:** Medium
**Time:** 35-40 minutes

**What to do:**
Build a new chat component using the `usePercyChat` hook for streaming.

```tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { usePercyChat } from '@/hooks/usePercyChat';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles } from 'lucide-react';

interface StreamingPercyChatProps {
  initialContext?: {
    businessType?: string;
    currentRevenue?: number;
    mainGoal?: string;
  };
  onRecommendation?: (recommendation: any) => void;
}

export function StreamingPercyChat({ initialContext, onRecommendation }: StreamingPercyChatProps) {
  const { messages, sendMessage, streaming, loading, error } = usePercyChat({
    onMessageComplete: (msg) => {
      // Check if message contains recommendation trigger
      if (msg.content.toLowerCase().includes('recommend')) {
        onRecommendation?.(msg);
      }
    }
  });

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || streaming) return;

    const message = input.trim();
    setInput('');

    await sendMessage(message, initialContext);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-700">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-white font-semibold">Percy</h3>
          <p className="text-xs text-gray-400">
            {streaming ? 'Typing...' : 'Online'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <ChatMessage key={msg.id} message={msg} index={idx} />
          ))}
        </AnimatePresence>

        {streaming && <TypingIndicator />}
        {error && <ErrorMessage error={error} />}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Percy anything..."
            disabled={streaming}
            className="flex-grow px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || streaming}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-all flex items-center gap-2"
          >
            {streaming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function ChatMessage({ message, index }: any) {
  const isPercy = message.role === 'percy';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex ${isPercy ? 'justify-start' : 'justify-end'}`}
    >
      <div
        className={`max-w-[80%] px-4 py-3 rounded-lg ${
          isPercy
            ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-gray-100'
            : 'bg-gray-700 text-white'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex justify-start"
    >
      <div className="px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="flex gap-1">
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
            className="w-2 h-2 bg-blue-400 rounded-full"
          />
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
            className="w-2 h-2 bg-blue-400 rounded-full"
          />
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
            className="w-2 h-2 bg-blue-400 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
}

function ErrorMessage({ error }: { error: string }) {
  return (
    <div className="flex justify-center">
      <div className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    </div>
  );
}
```

**Acceptance Criteria:**
- [ ] Component renders chat interface
- [ ] Messages stream token-by-token
- [ ] Typing indicator shows while streaming
- [ ] User messages appear immediately
- [ ] Auto-scrolls to latest message
- [ ] Send button disabled while streaming
- [ ] Error state displays correctly

---

### **TASK 2: Add Welcome Message on Mount**
**File:** `components/percy/StreamingPercyChat.tsx`
**Difficulty:** Easy
**Time:** 10 minutes

**What to do:**
Send an automatic greeting when chat opens.

```tsx
// Add to StreamingPercyChat component
useEffect(() => {
  // Send welcome message on mount
  if (messages.length === 0) {
    sendMessage(
      "Hi Percy! I'm looking to grow my business.",
      initialContext
    );
  }
}, []); // Only run once on mount
```

**Acceptance Criteria:**
- [ ] Percy responds with greeting on open
- [ ] Only happens once per session
- [ ] Includes user context if provided

---

### **TASK 3: Add Suggested Responses**
**File:** `components/percy/StreamingPercyChat.tsx`
**Difficulty:** Medium
**Time:** 20 minutes

**What to do:**
Add quick-reply buttons for common questions.

```tsx
const SUGGESTED_RESPONSES = [
  "How can I increase revenue?",
  "What agents do you recommend?",
  "Help me with marketing",
  "I need content creation help"
];

// Add to component
const [showSuggestions, setShowSuggestions] = useState(true);

const handleSuggestionClick = (suggestion: string) => {
  setShowSuggestions(false);
  sendMessage(suggestion, initialContext);
};

// Add to render (above input)
{showSuggestions && messages.length === 0 && (
  <div className="p-4 border-t border-gray-700">
    <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
    <div className="flex flex-wrap gap-2">
      {SUGGESTED_RESPONSES.map((suggestion, idx) => (
        <button
          key={idx}
          onClick={() => handleSuggestionClick(suggestion)}
          className="px-3 py-1.5 text-xs bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-full text-blue-300 transition-all"
        >
          {suggestion}
        </button>
      ))}
    </div>
  </div>
)}
```

**Acceptance Criteria:**
- [ ] Suggested responses show initially
- [ ] Hide after first message
- [ ] Clicking suggestion sends message
- [ ] Buttons styled consistently

---

### **TASK 4: Add Context Capture During Chat**
**File:** `components/percy/StreamingPercyChat.tsx`
**Difficulty:** Medium
**Time:** 25 minutes

**What to do:**
Extract business context from user messages automatically.

```tsx
const [capturedContext, setCapturedContext] = useState(initialContext || {});

const extractContext = (message: string) => {
  const newContext = { ...capturedContext };

  // Extract business type
  const businessTypes = ['ecommerce', 'saas', 'agency', 'consulting', 'retail'];
  businessTypes.forEach(type => {
    if (message.toLowerCase().includes(type)) {
      newContext.businessType = type;
    }
  });

  // Extract urgency
  const urgentWords = ['asap', 'urgent', 'quickly', 'immediately', 'now'];
  if (urgentWords.some(word => message.toLowerCase().includes(word))) {
    newContext.urgencyLevel = 'high';
  }

  // Extract revenue info
  const revenueMatch = message.match(/\$?([\d,]+)k?/i);
  if (revenueMatch) {
    const amount = parseInt(revenueMatch[1].replace(',', ''));
    newContext.currentRevenue = amount * 1000;
  }

  setCapturedContext(newContext);
  return newContext;
};

// Update sendMessage to use captured context
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!input.trim() || streaming) return;

  const message = input.trim();
  const context = extractContext(message);
  setInput('');

  await sendMessage(message, context);
};
```

**Acceptance Criteria:**
- [ ] Extracts business type from messages
- [ ] Detects urgency keywords
- [ ] Captures revenue mentions
- [ ] Updates context for subsequent messages

---

### **TASK 5: Add Markdown Rendering to Messages**
**File:** `components/percy/StreamingPercyChat.tsx`
**Difficulty:** Easy
**Time:** 15 minutes

**What to do:**
Add markdown support for formatted Percy responses.

```tsx
// Install if needed: npm install react-markdown

import ReactMarkdown from 'react-markdown';

// Update ChatMessage component
function ChatMessage({ message, index }: any) {
  const isPercy = message.role === 'percy';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex ${isPercy ? 'justify-start' : 'justify-end'}`}
    >
      <div
        className={`max-w-[80%] px-4 py-3 rounded-lg ${
          isPercy
            ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-gray-100'
            : 'bg-gray-700 text-white'
        }`}
      >
        {isPercy ? (
          <ReactMarkdown
            className="text-sm prose prose-invert prose-sm max-w-none"
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              strong: ({ children }) => <strong className="text-blue-300">{children}</strong>,
              ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
              li: ({ children }) => <li className="mb-1">{children}</li>
            }}
          >
            {message.content}
          </ReactMarkdown>
        ) : (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </motion.div>
  );
}
```

**Acceptance Criteria:**
- [ ] Bold, italic text renders
- [ ] Lists render correctly
- [ ] Links are clickable
- [ ] Code blocks styled
- [ ] Doesn't break user messages

---

### **TASK 6: Replace Old Percy Chat Component**
**File:** Find existing Percy chat usage (likely `PercyWidget.tsx` or `PercyOnboarding*.tsx`)
**Difficulty:** Easy
**Time:** 10 minutes

**What to do:**
Replace the old static chat with the new streaming version.

```tsx
// Old (remove)
import { PercyChat } from '@/components/percy/PercyChat';

// New (add)
import { StreamingPercyChat } from '@/components/percy/StreamingPercyChat';

// Replace usage
<StreamingPercyChat
  initialContext={{
    businessType: userBusinessType,
    mainGoal: 'grow revenue'
  }}
  onRecommendation={(rec) => {
    // Handle when Percy makes a recommendation
    console.log('Percy recommended:', rec);
  }}
/>
```

**Acceptance Criteria:**
- [ ] Old component replaced
- [ ] No breaking changes
- [ ] Context passed correctly
- [ ] Recommendation callback works

---

### **TASK 7: Add Chat Export Feature**
**File:** `components/percy/StreamingPercyChat.tsx`
**Difficulty:** Easy
**Time:** 15 minutes

**What to do:**
Allow users to export chat transcript.

```tsx
// Add button to header
import { Download } from 'lucide-react';

const exportChat = () => {
  const transcript = messages
    .map(msg => `[${msg.role}] ${msg.content}`)
    .join('\n\n');

  const blob = new Blob([transcript], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `percy-chat-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};

// Add to header
<button
  onClick={exportChat}
  className="text-gray-400 hover:text-white transition-colors"
  title="Export chat"
>
  <Download className="w-4 h-4" />
</button>
```

**Acceptance Criteria:**
- [ ] Export button in header
- [ ] Downloads .txt file
- [ ] Includes all messages
- [ ] Formatted readably

---

## 🧪 Testing Checklist

- [ ] Chat connects to streaming endpoint
- [ ] Messages stream token-by-token
- [ ] Typing indicator appears
- [ ] Suggested responses work
- [ ] Context extraction works
- [ ] Markdown renders correctly
- [ ] Export downloads file
- [ ] Error handling displays
- [ ] Mobile responsive
- [ ] Auto-scroll works

---

## 📸 Visual Reference

**Before (Static):**
```
┌─────────────────────────┐
│ Percy                   │
├─────────────────────────┤
│ Percy: Hello!           │
│ User: Hi                │
│ Percy: <full response   │
│        appears at once> │
├─────────────────────────┤
│ [Type message...]  [→]  │
└─────────────────────────┘
```

**After (Streaming):**
```
┌─────────────────────────┐
│ Percy • Typing...    ⬇  │
├─────────────────────────┤
│ Percy: Hello! **How**   │
│ can I help...           │
│ User: Hi                │
│ Percy: Based on your... │
│ • • •  <typing>         │
├─────────────────────────┤
│ Suggested:              │
│ [Revenue?] [Marketing?] │
├─────────────────────────┤
│ [Type message...]  [→]  │
└─────────────────────────┘
```

**Estimated Total Time:** 2 - 2.5 hours
