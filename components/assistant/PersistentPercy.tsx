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
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="percy-container"
          >
            <div className="percy-header">
              <h3 className="percy-title">Percy – Your AI Assistant</h3>
              <button
                onClick={togglePercy}
                className="percy-close-btn"
                aria-label="Close Percy"
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
          </motion.div>
        )}
      </AnimatePresence>
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
