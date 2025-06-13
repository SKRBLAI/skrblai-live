'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { auth } from '@/utils/supabase-auth';
import { ChatBubble } from '@/components/ui';

interface PercyContextType {
  isOpen: boolean;
  togglePercy: () => void;
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  currentIntent?: string;
  setCurrentIntent: (intent: string) => void;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  message: string;
}

export const PercyContext = createContext<PercyContextType | undefined>(undefined);

export function usePercy() {
  const context = useContext(PercyContext);
  if (!context) {
    throw new Error('usePercy must be used within a PercyProvider');
  }
  return context;
}

export function PersistentPercy({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      type: 'assistant',
      message: "Hi! I'm Percy, your AI assistant. How can I help you today? 👋"
    }
  ]);
  const [currentIntent, setCurrentIntent] = useState<string>();
  const pathname = usePathname() || '';
  const hideWidget = pathname === '/';

  // Reset Percy's state when navigating to a new dashboard section
  useEffect(() => {
    if (pathname.includes('/dashboard/')) {
      const section = pathname.split('/').pop() || '';
      const intentMap: Record<string, string> = {
        'social-media': 'grow_social_media',
        'book-publishing': 'publish_book',
        'website': 'launch_website',
        'branding': 'design_brand',
        'marketing': 'improve_marketing'
      };
      
      const mappedIntent = intentMap[section as keyof typeof intentMap];
      if (mappedIntent && currentIntent !== mappedIntent) {
        setCurrentIntent(mappedIntent);
        setMessages([{
          id: 'section-welcome',
          type: 'assistant',
          message: `Welcome to the ${section.replace('-', ' ')} dashboard! I'm here to help you with your project. Would you like to upload files, provide a link, or describe what you need help with?`
        }]);
      }
    }
  }, [pathname, currentIntent]);

  const togglePercy = () => setIsOpen(!isOpen);

  const addMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  };

  return (
    <PercyContext.Provider value={{
      isOpen,
      togglePercy,
      messages,
      addMessage,
      currentIntent,
      setCurrentIntent
    }}>
      {children}
      {!hideWidget && (
        <button
          onClick={togglePercy}
          className="fixed bottom-4 right-4 z-[100] px-6 py-4 rounded-full bg-gradient-to-br from-fuchsia-600 via-blue-600 to-teal-400 shadow-[0_0_32px_#e879f940] border-2 border-fuchsia-400/70 text-white font-bold text-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_48px_#e879f9] focus:outline-none focus:ring-4 focus:ring-fuchsia-400/40 animate-bounce-slow"
          aria-label="Open cosmic Percy chat assistant"
          tabIndex={0}
          role="button"
          style={{maxWidth: '95vw', minWidth: 56, minHeight: 56, fontSize: '1.1rem'}}
        >
          <span className="text-2xl" aria-label="Percy the robot">🤖</span>
          <span className="hidden sm:inline">✨ Chat with Percy!</span>
          <span className="inline sm:hidden">✨ Percy</span>
        </button>
      )}
      {!hideWidget && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 220, damping: 22, duration: 0.28 }}
              className="fixed bottom-24 right-2 sm:right-8 z-[100] percy-container bg-gradient-to-br from-slate-900/95 via-fuchsia-900/60 to-slate-900/95 cosmic-glass cosmic-glow border-2 border-fuchsia-400/40 shadow-[0_8px_64px_#e879f940] rounded-3xl p-6 max-w-md w-[95vw] sm:w-full"
              role="dialog"
              aria-modal="true"
              aria-label="Percy Chat Assistant"
              tabIndex={0}
            >
              <div className="percy-header flex justify-between items-center mb-2">
                <h3 className="percy-title text-lg font-bold bg-gradient-to-r from-fuchsia-400 via-blue-400 to-teal-300 bg-clip-text text-transparent" aria-label="Percy AI Chat Title">Percy – Your Cosmic AI Concierge</h3>
                <button
                  onClick={togglePercy}
                  className="percy-close-btn text-2xl text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-400/40 rounded-lg p-1 transition-all duration-200"
                  aria-label="Close Percy chat"
                  tabIndex={0}
                  role="button"
                >
                  ×
                </button>
              </div>
              <div className="percy-messages">
                <div className="percy-messages-space">
                  {messages.map(message => (
                    <ChatBubble
                      key={message.id}
                      message={message.message}
                      type={message.type}
                    />
                  ))}
                </div>
              </div>
              <div className="mt-4 text-center text-xs text-fuchsia-200 animate-pulse" aria-label="Percy chat microcopy">
                🚀 Percy is always listening—type your cosmic question or upload a file!
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
      <motion.button
        onClick={togglePercy}
        className="percy-toggle-btn"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle Percy Assistant"
      >
        <span className="percy-toggle-icon">🤖</span>
      </motion.button>
    </PercyContext.Provider>
  );
}
