"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, X, Send, Sparkles, Zap, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import { usePercyContext } from '../assistant/PercyProvider';
import { usePathname } from 'next/navigation';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  text: string;
  intelligence?: {
    confidence?: number;
    mode?: string;
    insight?: string;
  };
}

interface UnifiedPercyChatProps {
  /**
   * Hide the widget on specific routes
   */
  hideOnRoutes?: string[];
  /**
   * Custom position (default: bottom-right)
   */
  position?: 'bottom-right' | 'bottom-left';
  /**
   * Custom initial message
   */
  initialMessage?: string;
}

export default function UnifiedPercyChat({
  hideOnRoutes = ['/'],
  position = 'bottom-right',
  initialMessage = "Hi! I'm Percy, your AI assistant. How can I help you today? 👋"
}: UnifiedPercyChatProps) {
  const pathname = usePathname();
  const { 
    generateSmartResponse, 
    trackBehavior, 
    conversionScore, 
    conversationPhase,
    isOnboardingActive 
  } = usePercyContext();

  // State
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'assistant',
      text: initialMessage,
      intelligence: { confidence: 95, mode: 'helpful' }
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [dashboardState, setDashboardState] = useState<'monitoring' | 'analyzing' | 'optimizing'>('monitoring');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hide widget on specified routes or when onboarding is active
  const shouldHide = hideOnRoutes.some(route => pathname === route) || (pathname === '/' && isOnboardingActive);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Enhanced dashboard section detection
  useEffect(() => {
    if (pathname?.includes('/dashboard/')) {
      const section = pathname.split('/').pop() || '';
      
      let percyMessage = `Welcome to the ${section.replace('-', ' ')} dashboard! I'm here to help you with your project.`;
      let intelligence = { confidence: 85, mode: 'helpful' };

      if (section === 'vip') {
        percyMessage = "🏆 VIP Command Center activated! I'm monitoring advanced intelligence feeds and competitive threats. Ready to dominate your industry?";
        intelligence = { confidence: 96, mode: 'vip_exclusive' };
        setDashboardState('analyzing');
      } else if (section === 'analytics') {
        percyMessage = "📊 Analytics intelligence engaged! I'm detecting optimization opportunities and competitive gaps. Want to see what I found?";
        intelligence = { confidence: 91, mode: 'analytical' };
        setDashboardState('optimizing');
      } else if (conversionScore && conversionScore > 70) {
        percyMessage = `🔥 HIGH-VALUE USER DETECTED! You're in the ${section.replace('-', ' ')} section - I've identified 3 optimization opportunities that could change everything. Want details?`;
        intelligence = { confidence: 94, mode: 'aggressive' };
      }

      setMessages([{
        id: 'section-welcome',
        type: 'assistant',
        text: percyMessage,
        intelligence
      }]);

      trackBehavior?.('dashboard_section_entry', { 
        section, 
        timestamp: Date.now(), 
        conversionScore: conversionScore || 0 
      });
    }
  }, [pathname, conversionScore, trackBehavior]);

  // Toggle chat
  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      trackBehavior?.('percy_chat_opened', { source: pathname });
    }
  };

  // Handle message send
  const handleSend = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      text: inputValue.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Track user message
      trackBehavior?.('percy_message_sent', { 
        message: userMessage.text,
        source: pathname 
      });

      // Generate smart response
      const response = await generateSmartResponse?.(userMessage.text, {
        pathname,
        conversionScore,
        conversationPhase
      });

      // Add assistant response
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        text: response?.message || "I'm processing your request. Let me help you with that!",
        intelligence: response?.intelligence
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating Percy response:', error);
      toast.error('Sorry, I encountered an error. Please try again.');
      
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        type: 'assistant',
        text: "I apologize, but I'm having trouble processing that right now. Please try again or contact support if the issue persists."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Percy button styling based on state
  const getPercyButtonStyle = () => {
    if (dashboardState === 'analyzing') {
      return 'from-purple-600 via-blue-600 to-purple-400 shadow-[0_0_32px_#9333ea40] animate-pulse';
    } else if (dashboardState === 'optimizing') {
      return 'from-green-600 via-teal-600 to-green-400 shadow-[0_0_32px_#059669a40]';
    }
    return 'from-cyan-600 via-purple-600 to-pink-400 shadow-[0_0_32px_#06b6d440]';
  };

  const getPercyButtonIcon = () => {
    if (dashboardState === 'analyzing') return <Brain className="w-5 h-5" />;
    if (dashboardState === 'optimizing') return <Zap className="w-5 h-5" />;
    return <Sparkles className="w-5 h-5" />;
  };

  const getPercyStatusText = () => {
    if (dashboardState === 'analyzing') return 'Analyzing';
    if (dashboardState === 'optimizing') return 'Optimizing';
    return 'Online';
  };

  if (shouldHide) return null;

  const positionClasses = position === 'bottom-left' 
    ? 'bottom-4 left-4' 
    : 'bottom-4 right-4';

  return (
    <>
      {/* Percy Toggle Button */}
      <motion.button
        onClick={toggleChat}
        className={`fixed ${positionClasses} z-[100] px-4 py-3 rounded-full bg-gradient-to-br ${getPercyButtonStyle()} border-2 border-cyan-400/70 text-white font-bold flex items-center gap-2 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-400/40`}
        aria-label="Open Percy AI assistant"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{
            y: [0, -2, 0],
            filter: [
              'drop-shadow(0 0 5px rgba(6, 182, 212, 0.7))',
              'drop-shadow(0 0 10px rgba(6, 182, 212, 0.9))',
              'drop-shadow(0 0 5px rgba(6, 182, 212, 0.7))'
            ]
          }}
          transition={{
            y: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
            filter: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
          }}
        >
          <Image
            src="/images/agents-percy-nobg-skrblai.webp"
            alt="Percy"
            width={32}
            height={32}
            className="object-contain"
          />
        </motion.div>
        <div className="hidden sm:flex flex-col items-start">
          <span className="text-sm font-semibold">Percy</span>
          <span className="text-xs opacity-90">{getPercyStatusText()}</span>
        </div>
        {conversionScore && conversionScore > 70 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
            🔥 VIP
          </div>
        )}
      </motion.button>

      {/* Percy Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            className={`fixed ${position === 'bottom-left' ? 'bottom-24 left-4' : 'bottom-24 right-4'} z-[100] w-[95vw] sm:w-96 bg-gradient-to-br from-slate-900/95 via-cyan-900/60 to-slate-900/95 backdrop-blur-xl border-2 border-cyan-400/40 shadow-[0_8px_64px_#06b6d440] rounded-3xl overflow-hidden`}
            role="dialog"
            aria-modal="true"
            aria-label="Percy Chat Assistant"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-cyan-600/30 via-purple-600/20 to-pink-600/30 p-4 flex items-center justify-between border-b border-cyan-400/20">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{
                    y: [0, -2, 0],
                    filter: [
                      'drop-shadow(0 0 5px rgba(6, 182, 212, 0.7))',
                      'drop-shadow(0 0 10px rgba(6, 182, 212, 0.9))',
                      'drop-shadow(0 0 5px rgba(6, 182, 212, 0.7))'
                    ]
                  }}
                  transition={{
                    y: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                    filter: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
                  }}
                >
                  <Image
                    src="/images/agents-percy-nobg-skrblai.webp"
                    alt="Percy"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </motion.div>
                <div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-300 bg-clip-text text-transparent">
                    Percy – AI Concierge
                  </h3>
                  <div className={`text-xs font-semibold ${
                    dashboardState === 'analyzing' ? 'text-purple-400' :
                    dashboardState === 'optimizing' ? 'text-green-400' :
                    'text-cyan-400'
                  }`}>
                    {dashboardState}
                  </div>
                </div>
              </div>
              <button
                onClick={toggleChat}
                className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                aria-label="Close Percy chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-cyan-600/50 scrollbar-track-transparent">
              {messages.map(message => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.type === 'user'
                        ? 'bg-gradient-to-br from-cyan-600 to-purple-600 text-white'
                        : 'bg-white/10 backdrop-blur-sm border border-cyan-400/20 text-gray-100'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    {message.intelligence && (
                      <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                        {message.intelligence.confidence && (
                          <span>Confidence: {message.intelligence.confidence}%</span>
                        )}
                        {message.intelligence.mode && (
                          <span className="px-2 py-0.5 bg-gray-700/50 rounded-full">
                            {message.intelligence.mode}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/10 backdrop-blur-sm border border-cyan-400/20 rounded-2xl px-4 py-2">
                    <div className="flex gap-1">
                      <motion.div
                        className="w-2 h-2 bg-cyan-400 rounded-full"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-cyan-400 rounded-full"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-cyan-400 rounded-full"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-cyan-400/20 bg-black/20">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isTyping ? "Percy is thinking..." : "Type your message..."}
                  disabled={isTyping}
                  className="flex-1 bg-white/5 border border-cyan-400/30 rounded-xl px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all disabled:opacity-50"
                />
                <motion.button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                  className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-xl transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Send message"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
              <div className="mt-2 text-center text-xs text-cyan-200/70 flex items-center justify-center gap-1">
                <Brain className="w-3 h-3" />
                <span>Percy is actively monitoring your success patterns</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
