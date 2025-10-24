'use client';

import { useState, useRef, useEffect } from 'react';
import { usePercyChat } from '@/hooks/usePercyChat';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles, Download } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface StreamingPercyChatProps {
  initialContext?: {
    businessType?: string;
    currentRevenue?: number;
    mainGoal?: string;
    urgencyLevel?: string;
  };
  onRecommendation?: (recommendation: any) => void;
}

// Task 3: Suggested responses
const SUGGESTED_RESPONSES = [
  "How can I increase revenue?",
  "What agents do you recommend?",
  "Help me with marketing",
  "I need content creation help"
];

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
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Task 4: Context capture
  const [capturedContext, setCapturedContext] = useState(initialContext || {});

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Task 2: Welcome message on mount
  useEffect(() => {
    if (messages.length === 0) {
      sendMessage(
        "Hi Percy! I'm looking to grow my business.",
        initialContext
      );
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Task 4: Extract context from messages
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || streaming) return;

    const message = input.trim();
    const context = extractContext(message);
    setInput('');
    setShowSuggestions(false);

    await sendMessage(message, context);
  };

  // Task 3: Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setShowSuggestions(false);
    sendMessage(suggestion, capturedContext);
  };

  // Task 7: Export chat
  const exportChat = () => {
    const transcript = messages
      .map(msg => `[${msg.role.toUpperCase()}] ${msg.content}`)
      .join('\n\n');

    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `percy-chat-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
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
        {/* Task 7: Export button */}
        <button
          onClick={exportChat}
          disabled={messages.length === 0}
          className="text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          title="Export chat"
        >
          <Download className="w-4 h-4" />
        </button>
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

      {/* Task 3: Suggested responses */}
      {showSuggestions && messages.length <= 1 && (
        <div className="px-4 pb-4 border-t border-gray-700 pt-4">
          <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_RESPONSES.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={streaming}
                className="px-3 py-1.5 text-xs bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-full text-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

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

// Task 5: Markdown rendering
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
          <div className="text-sm prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              components={{
                p: ({ children }: any) => <p className="mb-2 last:mb-0">{children}</p>,
                strong: ({ children }: any) => <strong className="text-blue-300 font-semibold">{children}</strong>,
                ul: ({ children }: any) => <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>,
                ol: ({ children }: any) => <ol className="list-decimal ml-4 mb-2 space-y-1">{children}</ol>,
                li: ({ children }: any) => <li className="mb-1">{children}</li>,
                a: ({ children, href }: any) => (
                  <a href={href} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                ),
                code: ({ children }: any) => (
                  <code className="bg-gray-800/50 px-1.5 py-0.5 rounded text-blue-300 text-xs">
                    {children}
                  </code>
                )
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
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
