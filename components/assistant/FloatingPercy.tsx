'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import PercyAvatar from '@/components/home/PercyAvatar';

interface Message {
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

// Page-specific suggestions based on current path
const pathSuggestions: Record<string, string[]> = {
  '/': [
    'What can SKRBL AI do for me?',
    'How does the 7-day free trial work?',
    'Show me examples of AI-generated content'
  ],
  '/features': [
    'Which features work best for marketing?',
    'Can SKRBL AI help with my book publishing?',
    'How accurate is the AI content creation?'
  ],
  '/pricing': [
    "What's the difference between plans?",
    'Do you offer team accounts?',
    'Can I cancel anytime?'
  ],
  '/dashboard': [
    'How do I upload files?',
    'Can you explain the dashboard sections?',
    'How long does content generation take?'
  ]
};

// Default suggestions for any page without specific suggestions
const defaultSuggestions = [
  'Tell me more about SKRBL AI',
  'How can this help my business?',
  'What makes SKRBL AI different?'
];

export default function FloatingPercy() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const pathname = usePathname();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognition = useRef<any>(null);
  
  // Initialize with a welcome message
  useEffect(() => {
    const initialMessage = {
      role: 'assistant' as const,
      content: "Hi there! I'm Percy, your AI assistant. How can I help you today?",
      timestamp: new Date()
    };
    setMessages([initialMessage]);
    
    // Check if speech recognition is supported
    if (typeof window !== 'undefined') {
      // TypeScript definition for browser Speech Recognition API
      const windowWithSpeech = window as any;
      if ('SpeechRecognition' in windowWithSpeech || 'webkitSpeechRecognition' in windowWithSpeech) {
        setIsSpeechSupported(true);
        
        // Initialize speech recognition
        const SpeechRecognitionAPI = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;
        recognition.current = new SpeechRecognitionAPI();
        recognition.current.continuous = false;
        recognition.current.interimResults = false;
        
        recognition.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputValue(transcript);
          setIsListening(false);
        };
        
        recognition.current.onerror = () => {
          setIsListening(false);
        };
        
        recognition.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);
  
  // Update suggestions based on current path
  useEffect(() => {
    const pathKey = pathname || '/';
    const currentPathSuggestions = pathSuggestions[pathKey] || defaultSuggestions;
    setSuggestions(currentPathSuggestions);
    
    // Add context-aware greeting when opening Percy on a new page
    if (messages.length === 1) {
      let contextMessage = '';
      
      if (pathname === '/features') {
        contextMessage = "I see you're exploring our features! Is there a specific capability you'd like to learn more about?";
      } else if (pathname === '/pricing') {
        contextMessage = "Looking at our pricing options? I'd be happy to help you find the right plan for your needs.";
      } else if (pathname && pathname.includes('/dashboard')) {
        contextMessage = 'Welcome to your dashboard! I can help you navigate the tools or explain how to use any feature.';
      }
      
      if (contextMessage) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: contextMessage,
          timestamp: new Date()
        }]);
      }
    }
  }, [pathname, isOpen, messages]);
  
  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const toggleOpen = () => {
    setIsOpen(!isOpen);
    // Focus input when opening
    if (!isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  };
  
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    
    // Generate assistant response (in production, this would call an API)
    setTimeout(() => {
      generateResponse(userMessage.content);
    }, 500);
  };
  
  const generateResponse = (userInput: string) => {
    let response = '';
    
    // Simple response generation based on keywords
    // In production, this would be replaced with an actual AI API call
    if (userInput.toLowerCase().includes('pricing') || userInput.toLowerCase().includes('cost')) {
      response = 'We offer flexible pricing plans starting at $29/month. Our most popular plan is $49/month which includes all core features. Would you like me to show you the detailed pricing page?';
    } else if (userInput.toLowerCase().includes('trial')) {
      response = "Yes! We offer a 7-day free trial with full access to all features. You can cancel anytime before the trial ends and won't be charged.";
    } else if (userInput.toLowerCase().includes('book') || userInput.toLowerCase().includes('publish')) {
      response = 'Our book publishing tools help you format, edit, and prepare your manuscript for publication. On average, users publish 75% faster using our automated workflow.';
    } else if (userInput.toLowerCase().includes('dashboard')) {
      response = 'The dashboard is organized by service type. You can upload files, create prompts, and monitor your projects all in one place. Would you like me to guide you through a specific section?';
    } else {
      response = 'I understand you\'re interested in learning more. SKRBL AI can help with content creation, book publishing, branding, and website development - all powered by advanced AI. What specific aspect would you like to explore?';
    }
    
    // Add assistant response
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: response,
      timestamp: new Date()
    }]);
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    // Small delay to allow the UI to update with the new input value
    setTimeout(() => {
      handleSubmit();
    }, 10);
  };
  
  const startListening = () => {
    if (recognition.current) {
      setIsListening(true);
      recognition.current.start();
    }
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="glass-card border border-white/20 rounded-2xl w-80 sm:w-96 overflow-hidden shadow-xl shadow-purple-500/10 mb-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <PercyAvatar size="sm" />
                <h3 className="text-white font-medium">Percy Assistant</h3>
              </div>
              <button 
                onClick={toggleOpen}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close assistant"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Chat messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-electric-blue text-white' 
                        : 'bg-white/10 text-white'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Suggestions */}
            {messages.length < 3 && (
              <div className="px-4 pb-2">
                <p className="text-gray-400 text-xs mb-2">Suggested questions:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-full transition-colors text-left"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Input area */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-electric-blue/50 focus:border-transparent resize-none h-10"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit();
                      }
                    }}
                  />
                  
                  {isSpeechSupported && (
                    <button
                      type="button"
                      onClick={startListening}
                      className={`absolute right-2 top-2 text-gray-400 hover:text-white transition-colors ${isListening ? 'text-electric-blue animate-pulse' : ''}`}
                      aria-label="Use voice input"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </button>
                  )}
                </div>
                
                <button
                  type="submit"
                  className="bg-gradient-to-r from-electric-blue to-teal-400 p-2 rounded-lg hover:shadow-glow transition-all duration-300"
                  aria-label="Send message"
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Floating button */}
      <motion.button
        onClick={toggleOpen}
        className={`${isOpen ? 'bg-white/10' : 'bg-gradient-to-r from-electric-blue to-teal-400'} rounded-full p-3 shadow-lg hover:shadow-glow transition-all duration-300`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Toggle assistant"
      >
        {isOpen ? (
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <div className="relative">
            <PercyAvatar size="sm" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-electric-blue"></span>
            </span>
          </div>
        )}
      </motion.button>
    </div>
  );
}
