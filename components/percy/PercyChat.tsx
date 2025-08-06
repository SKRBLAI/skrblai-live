'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Zap } from 'lucide-react';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'percy' | 'user';
  timestamp: Date;
  type?: 'text' | 'action' | 'result';
}

interface PercyChatProps {
  currentStep: string;
  messages: ChatMessage[];
  isThinking: boolean;
  onUserInput: (input: string) => void;
  onActionClick: (action: string) => void;
  className?: string;
}

const PercyChat: React.FC<PercyChatProps> = ({
  currentStep,
  messages,
  isThinking,
  onUserInput,
  onActionClick,
  className = ''
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [focusedInput, setFocusedInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isThinking) return;
    
    onUserInput(inputValue.trim());
    setInputValue('');
    setIsTyping(false);
  }, [inputValue, isThinking, onUserInput]);

  // Quick action buttons based on current step
  const getQuickActions = useCallback(() => {
    switch (currentStep) {
      case 'greeting':
        return [
          { id: 'scan-website', label: '🚀 Scan My Website', icon: Zap },
          { id: 'learn-more', label: '✨ Tell Me More', icon: Sparkles }
        ];
      case 'analysis':
        return [
          { id: 'get-recommendations', label: '💡 Get Recommendations', icon: Sparkles },
          { id: 'start-over', label: '🔄 Start Over', icon: Zap }
        ];
      default:
        return [];
    }
  }, [currentStep]);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                    : 'bg-transparent border border-cyan-400/30 text-white backdrop-blur-sm'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Percy Thinking Indicator */}
        <AnimatePresence>
          {isThinking && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-start"
            >
              <div className="bg-transparent border border-cyan-400/30 text-white backdrop-blur-sm p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 bg-cyan-400 rounded-full"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: i * 0.2
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-cyan-300">Percy is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {getQuickActions().length > 0 && (
        <div className="p-4 border-t border-cyan-400/20">
          <div className="flex flex-wrap gap-2">
            {getQuickActions().map(action => {
              const IconComponent = action.icon;
              return (
                <motion.button
                  key={action.id}
                  onClick={() => onActionClick(action.id)}
                  className="flex items-center space-x-2 px-3 py-2 bg-transparent border border-cyan-400/30 rounded-lg text-sm text-cyan-300 hover:border-cyan-400/50 hover:bg-cyan-400/10 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isThinking}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{action.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-cyan-400/20">
        <form onSubmit={handleSubmit} className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setIsTyping(e.target.value.length > 0);
            }}
            onFocus={() => setFocusedInput(true)}
            onBlur={() => setFocusedInput(false)}
            placeholder={focusedInput ? "Ask Percy anything..." : "Type your message..."}
            className="w-full bg-transparent border-2 border-cyan-400/30 rounded-lg px-4 py-3 text-white placeholder-cyan-300/50 focus:border-cyan-400/60 focus:outline-none transition-all"
            disabled={isThinking}
          />
          
          <motion.button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!inputValue.trim() || isThinking}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default PercyChat;