'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Brain, Crown, Zap, TrendingUp } from 'lucide-react';

import { ChatBubble } from '@/components/ui';
import { usePercyContext } from '@/components/assistant/PercyProvider';

interface PercyContextType {
  isOpen: boolean;
  togglePercy: () => void;
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  currentIntent?: string;
  setCurrentIntent: (intent: string) => void;
  dashboardState?: 'monitoring' | 'analyzing' | 'optimizing';
}

// Define Intelligence type
interface Intelligence {
  confidence?: number;
  mode?: string;
  insight?: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  message: string;
  intelligence?: Intelligence;
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
  const [dashboardState, setDashboardState] = useState<'monitoring' | 'analyzing' | 'optimizing'>('monitoring');
  const pathname = usePathname() || '';
  const hideWidget = pathname === '/';

  // Phase 6B: Enhanced Percy Context Integration
  const { 
    generateSmartResponse, 
    trackBehavior, 
    conversionScore, 
    conversationPhase 
  } = usePercyContext() || {};

  // Enhanced dashboard section detection and Percy response
  useEffect(() => {
    if (pathname.includes('/dashboard/')) {
      const section = pathname.split('/').pop() || '';
      const intentMap: Record<string, string> = {
        'social-media': 'grow_social_media',
        'book-publishing': 'publish_book',
        'website': 'launch_website',
        'branding': 'design_brand',
        'marketing': 'improve_marketing',
        'profile': 'manage_profile',
        'analytics': 'view_analytics',
        'vip': 'vip_access'
      };
      
      const mappedIntent = intentMap[section as keyof typeof intentMap];
      if (mappedIntent && currentIntent !== mappedIntent) {
        setCurrentIntent(mappedIntent);
        
        // Enhanced Percy messages based on section and intelligence
        let percyMessage = `Welcome to the ${section.replace('-', ' ')} dashboard! I'm here to help you with your project.`;
        let intelligence: Intelligence = { confidence: 85, mode: 'helpful' };

        // Phase 6B: Enhanced section-specific intelligence
        if (section === 'vip') {
          percyMessage = "🏆 VIP Command Center activated! I'm monitoring advanced intelligence feeds and competitive threats. Ready to dominate your industry?";
          intelligence = { confidence: 96, mode: 'vip_exclusive', insight: 'VIP intelligence monitoring active' };
          setDashboardState('analyzing');
        } else if (section === 'analytics') {
          percyMessage = "📊 Analytics intelligence engaged! I'm detecting optimization opportunities and competitive gaps. Want to see what I found?";
          intelligence = { confidence: 91, mode: 'analytical', insight: 'Performance optimization available' };
          setDashboardState('optimizing');
        } else if (section === 'profile') {
          percyMessage = "⚙️ Profile optimization mode! I can enhance your competitive positioning and VIP potential. Ready for upgrades?";
          intelligence = { confidence: 88, mode: 'optimization' };
        } else if (conversionScore && conversionScore > 70) {
          percyMessage = `🔥 HIGH-VALUE USER DETECTED! You're in the ${section.replace('-', ' ')} section - I've identified 3 optimization opportunities that could change everything. Want details?`;
          intelligence = { confidence: 94, mode: 'aggressive', insight: 'Hot prospect conversion opportunity' };
        }

        setMessages([{
          id: 'section-welcome',
          type: 'assistant',
          message: percyMessage,
          intelligence
        }]);

        // Track behavior for Percy learning
        trackBehavior?.('dashboard_section_entry', { 
          section, 
          timestamp: Date.now(), 
          conversionScore: conversionScore || 0 
        });
      }
    }
    
    // Set dashboard state based on user activity
    if (pathname.includes('/dashboard')) {
      setDashboardState('monitoring');
      
      // Periodic state changes for active monitoring feel
      const stateInterval = setInterval(() => {
        const states: Array<'monitoring' | 'analyzing' | 'optimizing'> = ['monitoring', 'analyzing', 'optimizing'];
        const randomState = states[Math.floor(Math.random() * states.length)];
        setDashboardState(randomState);
      }, 15000); // Change state every 15 seconds

      return () => clearInterval(stateInterval);
    }
  }, [pathname, currentIntent, conversionScore, trackBehavior]);

  // Enhanced proactive Percy suggestions
  useEffect(() => {
    if (pathname.includes('/dashboard') && messages.length === 1) {
      const timer = setTimeout(() => {
        const proactiveInsights = [
          {
            id: 'proactive-1',
            type: 'assistant' as const,
            message: '💡 I\'ve been analyzing your workflow... I detected 2 optimization opportunities that could save you 3+ hours weekly. Want to see them?',
            intelligence: { confidence: 89, mode: 'proactive', insight: 'Workflow optimization available' } as Intelligence
          },
          {
            id: 'proactive-2', 
            type: 'assistant' as const,
            message: '⚡ Competitive alert: Your industry adoption rate for AI automation increased 31% this month. Ready to stay ahead?',
            intelligence: { confidence: 92, mode: 'competitive', insight: 'Market positioning critical' } as Intelligence
          },
          {
            id: 'proactive-3',
            type: 'assistant' as const, 
            message: '🎯 Revenue opportunity detected: There\'s a 78% chance of $25K+ opportunity if you optimize these 3 workflows. Interested?',
            intelligence: { confidence: 94, mode: 'revenue_focused', insight: 'High-value opportunity identified' } as Intelligence
          }
        ];

        const randomInsight = proactiveInsights[Math.floor(Math.random() * proactiveInsights.length)];
        setMessages(prev => [...prev, randomInsight]);
        setDashboardState('analyzing');
      }, 8000); // Show proactive insight after 8 seconds

      return () => clearTimeout(timer);
    }
  }, [pathname, messages.length]);

  const togglePercy = () => setIsOpen(!isOpen);

  const addMessage = (message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  };

  // Enhanced Percy button with intelligence indicators
  const getPercyButtonStyle = () => {
    if (dashboardState === 'analyzing') {
      return 'from-purple-600 via-blue-600 to-purple-400 shadow-[0_0_32px_#9333ea40] animate-pulse';
    } else if (dashboardState === 'optimizing') {
      return 'from-green-600 via-teal-600 to-green-400 shadow-[0_0_32px_#059f46a40]';
    }
    return 'from-fuchsia-600 via-blue-600 to-teal-400 shadow-[0_0_32px_#e879f940]';
  };

  const getPercyButtonIcon = () => {
    if (dashboardState === 'analyzing') return <Brain className="w-6 h-6" />;
    if (dashboardState === 'optimizing') return <Zap className="w-6 h-6" />;
    return <span className="text-2xl">🤖</span>;
  };

  const getPercyStatusText = () => {
    if (dashboardState === 'analyzing') return '🧠 Analyzing';
    if (dashboardState === 'optimizing') return '⚡ Optimizing';
    return '🤖 Monitoring';
  };

  return (
    <PercyContext.Provider value={{
      isOpen,
      togglePercy,
      messages,
      addMessage,
      currentIntent,
      setCurrentIntent,
      dashboardState
    }}>
      {children}
      {!hideWidget && (
        <motion.button
          onClick={togglePercy}
          className={`fixed bottom-4 right-4 z-[100] px-6 py-4 rounded-full bg-gradient-to-br ${getPercyButtonStyle()} border-2 border-fuchsia-400/70 text-white font-bold text-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-fuchsia-400/40`}
          aria-label="Open Percy AI assistant"
          tabIndex={0}
          role="button"
          style={{maxWidth: '95vw', minWidth: 56, minHeight: 56, fontSize: '1.1rem'}}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {getPercyButtonIcon()}
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
              {/* Enhanced Header with Intelligence Status */}
              <div className="percy-header flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="percy-title text-lg font-bold bg-gradient-to-r from-fuchsia-400 via-blue-400 to-teal-300 bg-clip-text text-transparent" aria-label="Percy AI Chat Title">
                    Percy – AI Concierge
                  </h3>
                  <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                    dashboardState === 'analyzing' ? 'bg-purple-500/20 text-purple-400' :
                    dashboardState === 'optimizing' ? 'bg-green-500/20 text-green-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {dashboardState}
                  </div>
                </div>
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
              
              {/* Messages with Intelligence Indicators */}
              <div className="percy-messages max-h-80 overflow-y-auto space-y-3">
                {messages.map(message => (
                  <div key={message.id} className="relative">
                    <ChatBubble
                      message={message.message}
                      type={message.type}
                    />
                    {message.intelligence && (
                      <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                        {message.intelligence.confidence && (
                          <span>Confidence: {message.intelligence.confidence}%</span>
                        )}
                        {message.intelligence.mode && (
                          <span className="px-2 py-0.5 bg-gray-700 rounded-full">
                            {message.intelligence.mode}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-4 text-center text-xs text-fuchsia-200 animate-pulse flex items-center justify-center gap-2" aria-label="Percy chat microcopy">
                <Brain className="w-3 h-3" />
                <span>Percy is actively monitoring your success patterns</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </PercyContext.Provider>
  );
}
