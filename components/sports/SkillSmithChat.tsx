'use client';


import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  fallback?: boolean;
}

interface SkillSmithChatProps {
  isGuest?: boolean;
  onSignupPrompt?: () => void;
  className?: string;
}

export default function SkillSmithChat({ 
  isGuest = true, 
  onSignupPrompt,
  className = '' 
}: SkillSmithChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hey there! I'm Skill Smith, your AI sports performance coach. What sport are you training for, or what performance goal can I help you with today?",
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [remainingMessages, setRemainingMessages] = useState(isGuest ? 8 : 20);
  const [showSignupCTA, setShowSignupCTA] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substr(2, 9));

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: 'user',

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { getCardClass, getButtonClass, cn } from '../../styles/ui';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

interface SkillSmithChatProps {
  className?: string;
}

export default function SkillSmithChat({ className }: SkillSmithChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hey there, athlete! 🏆 I'm your Skill Smith AI coach. I'm here to help you dominate your sport with personalized training plans, technique analysis, and mental game coaching. What sport are you working on today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Listen for prompt bar events
  useEffect(() => {
    const handlePromptEvent = (event: CustomEvent) => {
      const { sport, goal, time, input: promptInput } = event.detail;
      const userMessage = `Create a ${time} training plan for ${sport} focused on ${goal}. ${promptInput}`;
      handleSendMessage(userMessage);
    };

    window.addEventListener('skillsmith-prompt', handlePromptEvent as any);
    return () => window.removeEventListener('skillsmith-prompt', handlePromptEvent as any);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text,

      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/skillsmith', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId
        },
        body: JSON.stringify({
          message: userMessage.content,
          context: messages.slice(-5), // Send last 5 messages for context
          isGuest
        })
      });

      const data = await response.json();

      if (data.rateLimited) {
        setShowSignupCTA(true);
        if (onSignupPrompt) {
          setTimeout(() => onSignupPrompt(), 2000);
        }
      }

      if (data.remaining !== undefined) {
        setRemainingMessages(data.remaining);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.reply || "I'm having trouble responding right now. Please try again!",
        role: 'assistant',
        timestamp: new Date(),
        fallback: data.fallback
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm having connection issues. While I get back online, remember: proper warm-up and cool-down are key to any training session!",
        role: 'assistant',
        timestamp: new Date(),
        fallback: true
      };

      setMessages(prev => [...prev, errorMessage]);

    setInput('');
    setIsLoading(true);

    // Add loading message
    const loadingMessage: Message = {
      id: Date.now().toString() + '_loading',
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      const response = await fetch('/api/skillsmith', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages.filter(m => !m.isLoading).map(m => ({
              role: m.type === 'user' ? 'user' : 'assistant',
              content: m.content
            })),
            { role: 'user', content: text }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: Date.now().toString() + '_response',
        type: 'assistant',
        content: data.content || "I'm here to help you improve your athletic performance! Could you tell me more about what specific aspect of your sport you'd like to work on?",
        timestamp: new Date()
      };

      // Remove loading message and add response
      setMessages(prev => [...prev.filter(m => !m.isLoading), assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: Date.now().toString() + '_error',
        type: 'assistant',
        content: "I'm having some technical difficulties right now, but I'm still here to help! In the meantime, try uploading a video for analysis or check out our training plans above. 💪",
        timestamp: new Date()
      };
      setMessages(prev => [...prev.filter(m => !m.isLoading), errorMessage]);

    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex flex-col h-full bg-gradient-to-br from-[rgba(30,25,50,0.8)] via-[rgba(15,20,40,0.9)] to-[rgba(25,15,45,0.8)] border-2 border-purple-400/30 rounded-xl backdrop-blur-xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-purple-400/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Skill Smith</h3>
            <p className="text-xs text-purple-300">AI Sports Coach</p>
          </div>
        </div>
        
        {isGuest && (
          <div className="text-right">
            <p className="text-xs text-orange-300">
              {remainingMessages} free messages left
            </p>
            {remainingMessages <= 3 && (
              <p className="text-xs text-orange-400">
                Sign up for unlimited chat!
              </p>
            )}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div className={`max-w-[80%] ${message.role === 'user' ? 'order-1' : ''}`}>
                <div
                  className={`px-4 py-2 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      : `bg-gray-700/50 text-gray-100 ${message.fallback ? 'border border-orange-400/30' : ''}`
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                  {message.fallback && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-orange-300">
                      <AlertCircle className="w-3 h-3" />
                      <span>Backup response</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1 px-2">
                  {formatTime(message.timestamp)}
                </p>
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 justify-start"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-700/50 px-4 py-2 rounded-2xl">
              <div className="flex items-center gap-2 text-purple-300">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Skill Smith is thinking...</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Signup CTA */}
        {showSignupCTA && isGuest && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-400/30 rounded-xl p-4 text-center"
          >
            <h4 className="font-semibold text-orange-300 mb-2">
              🔥 Keep the Training Going!
            </h4>
            <p className="text-sm text-orange-200 mb-3">
              You've used all your free messages. Sign up to continue getting personalized sports coaching!
            </p>
            <button
              onClick={onSignupPrompt}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300"
            >
              Sign Up for Unlimited Chat
            </button>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-purple-400/20">
        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={showSignupCTA ? "Sign up to continue chatting..." : "Ask about training, technique, nutrition..."}
            disabled={isLoading || showSignupCTA}
            className="flex-1 bg-gray-700/30 border border-gray-600/50 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Chat message input"
          />
          <button
            onClick={sendMessage}
            disabled={!inputValue.trim() || isLoading || showSignupCTA}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 disabled:from-gray-600 disabled:to-gray-600 text-white p-2 rounded-lg transition-all duration-300 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        
        {isGuest && remainingMessages > 0 && !showSignupCTA && (
          <p className="text-xs text-gray-400 mt-2 text-center">
            {remainingMessages} free messages remaining today
          </p>
        )}
      </div>

      handleSendMessage();
    }
  };

  return (
    <div className={cn(getCardClass('base'), 'transition-all duration-300', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-600/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Skill Smith AI</h3>
            <p className="text-xs text-slate-400">Your personal sports coach</p>
          </div>
        </div>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
        </button>
      </div>

      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'assistant' && (
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={cn(
                      'max-w-[80%] px-4 py-2 rounded-2xl',
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'bg-slate-700/50 text-slate-200'
                    )}
                  >
                    {message.isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    )}
                  </div>
                  
                  {message.type === 'user' && (
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-600/50">
              <div className="flex gap-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about training, technique, nutrition, or anything sports-related..."
                  className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 resize-none focus:outline-none focus:border-green-400/50 transition-colors"
                  rows={1}
                  disabled={isLoading}
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() || isLoading}
                  className={cn(
                    getButtonClass('neon'),
                    'flex items-center gap-2 px-4 py-3 min-w-fit',
                    (!input.trim() || isLoading) && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              
              <p className="text-xs text-slate-500 mt-2">
                💡 Try: "Create a basketball shooting drill" or "Help me improve my tennis serve"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}