'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatInterfaceProps {
  agentName: string;
  agentDescription: string;
  initialMessage?: string;
  onSubmit: (message: string) => Promise<string>;
  className?: string;
  isPremium?: boolean;
  onUpgrade?: () => void;
}

const AIChatInterface: React.FC<AIChatInterfaceProps> = ({
  agentName,
  agentDescription,
  initialMessage = "Hi there! How can I help you today?",
  onSubmit,
  className = '',
  isPremium = false,
  onUpgrade
}) => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'assistant',
      content: initialMessage,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);
    
    try {
      let responseContent = "I'm processing your request...";
      
      if (onSubmit) {
        responseContent = await onSubmit(input);
      }
      
      const aiMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if the message is a premium feature
  const checkPremiumAccess = () => {
    if (isPremium && !onUpgrade) {
      setError('Premium feature: Please upgrade to access this chat.');
      return false;
    }
    return true;
  };

  return (
    <motion.div 
      className={`flex flex-col h-full bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-lg rounded-2xl border border-teal-500/20 shadow-2xl overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-teal-500/10 to-blue-500/10 border-b border-teal-500/20">
        <div className="flex items-center">
          <motion.div 
            className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg"
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            <Sparkles size={20} className="text-white" />
          </motion.div>
          <div className="ml-3">
            <h3 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-blue-300">
              {agentName}
            </h3>
            <p className="text-sm text-gray-300">{agentDescription}</p>
          </div>
        </div>
        {isPremium && onUpgrade && (
          <motion.button
            onClick={onUpgrade}
            className="px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:shadow-lg hover:shadow-yellow-500/20 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Upgrade
          </motion.button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-teal-500/30 scrollbar-track-transparent">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: message.role === 'user' ? 20 : -20, scale: 0.98 }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 30,
                delay: index === messages.length - 1 ? 0.1 : 0
              }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <motion.div 
                className={`max-w-[85%] p-4 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-teal-500 to-blue-500 text-white rounded-tr-none shadow-lg'
                    : 'bg-gray-800/80 text-gray-100 border border-gray-700/50 rounded-tl-none shadow-lg'
                }`}
                whileHover={{ scale: 1.01 }}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1.5 text-right">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div 
            className="flex justify-start"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-gray-800/80 p-4 rounded-2xl rounded-tl-none border border-gray-700/50">
              <div className="flex space-x-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-teal-400 rounded-full"
                    animate={{
                      y: ['0%', '50%', '0%'],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t border-teal-500/20 bg-gray-900/50">
        <div className="relative">
          <motion.textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError(null);
            }}
            className="w-full p-4 pr-14 bg-gray-800/80 text-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-teal-500/50 focus:border-transparent border border-gray-700/50 backdrop-blur-sm transition-all duration-200 scrollbar-thin scrollbar-thumb-gray-600/50 scrollbar-track-transparent"
            placeholder={isPremium && !onUpgrade ? 'Upgrade to chat...' : 'Type your message...'}
            rows={1}
            disabled={isLoading || (isPremium && !onUpgrade)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (input.trim() && !isLoading) {
                  handleSubmit(e);
                }
              }
            }}
            style={{ minHeight: '56px' }}
          />
          <motion.button
            type="submit"
            className={`absolute right-2 bottom-2 p-2 rounded-xl ${
              input.trim() && !isLoading
                ? 'bg-gradient-to-br from-teal-500 to-blue-500 text-white shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30'
                : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
            } transition-all duration-200`}
            disabled={!input.trim() || isLoading || (isPremium && !onUpgrade)}
            whileHover={input.trim() && !isLoading ? { scale: 1.05 } : {}}
            whileTap={input.trim() && !isLoading ? { scale: 0.95 } : {}}
            title={isPremium && !onUpgrade ? 'Upgrade to send messages' : 'Send message'}
            aria-label="Send message"
          >
            <Send size={20} className={isLoading ? 'opacity-50' : ''} />
          </motion.button>
        </div>
        <AnimatePresence>
          {error && (
            <motion.p 
              className="text-sm text-red-400 mt-2 flex items-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
};

export default AIChatInterface;