'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import PercyAvatar from '../home/PercyAvatar';
import { usePercyContext } from './PercyProvider';
import { useAuth } from '../context/AuthContext';
import { getCurrentUser } from '../../utils/supabase-helpers';

interface Message {
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
  isProactive?: boolean;
  intelligence?: {
    confidence: number;
    agentSuggestion?: string;
    predictiveInsight?: string;
  };
}

// Live Social Proof Data Pool
const socialProofActivities = [
  {
    type: 'signup',
    messages: [
      "Sarah from Austin just activated 3 automation agents",
      "Marketing agency in Seattle automated their entire workflow",
      "Mike in Denver increased revenue by 340% using our agents",
      "Content creator in Miami published 47 articles this month",
      "Boston startup eliminated 85% of manual tasks",
      "Consultant in Phoenix secured 12 new clients this week"
    ]
  },
  {
    type: 'result',
    messages: [
      "Business in Atlanta generated $18K in new leads today",
      "Agency client saved 32 hours with automation",
      "E-commerce store boosted sales by 267% this quarter",
      "Author in Portland hit #1 bestseller using our platform",
      "Marketing team doubled their output in 30 days",
      "Freelancer raised rates 150% after automating workflow"
    ]
  },
  {
    type: 'urgency',
    messages: [
      "23 businesses joined today - limited spots remaining",
      "Your competitors gained another advantage this hour",
      "156 automation workflows launched in last 24 hours",
      "Premium spots filling fast - 8 left today",
      "Live users: 2,847 currently destroying competition",
      "Revenue generated today: $247K+ and counting"
    ]
  }
];

const cities = ["Austin", "Seattle", "Denver", "Miami", "Boston", "Phoenix", "Atlanta", "Portland", "Chicago", "Dallas", "San Francisco", "New York", "Los Angeles", "Nashville", "Orlando"];

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
  const [percyState, setPercyState] = useState<'idle' | 'thinking' | 'analyzing' | 'celebrating'>('idle');
  const [activeNotification, setActiveNotification] = useState<string | null>(null);
  const [userActivity, setUserActivity] = useState<any>(null);
  
  // ✨ NEW: Live Social Proof System
  const [socialProofNotification, setSocialProofNotification] = useState<{
    message: string;
    type: 'signup' | 'result' | 'urgency';
    timestamp: number;
  } | null>(null);
  const [isVisibleOnPage, setIsVisibleOnPage] = useState(true);
  
  const pathname = usePathname();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognition = useRef<any>(null);
  const activityTimer = useRef<any>(null);
  const socialProofTimer = useRef<any>(null);
  
  // Enhanced Percy Intelligence Hooks
  const { 
    generateSmartResponse, 
    trackBehavior, 
    conversionScore, 
    conversationPhase,
    getFilteredAgents 
  } = usePercyContext();
  const { session } = useAuth();
  
  // Initialize with enhanced welcome message based on user context
  useEffect(() => {
    const initializePercy = async () => {
      let welcomeContent = "Hi there! I'm Percy, your AI assistant. How can I help you today?";
      
      // Enhanced welcome based on conversion score and activity
      if (conversionScore > 50) {
        welcomeContent = "🔥 Welcome back! I've been analyzing your business patterns, and I have some game-changing insights for you. Ready to dominate?";
      } else if (conversationPhase === 'aggressive') {
        welcomeContent = "⚡ Your competitors just gained another advantage while you were away. I've identified 3 critical opportunities. Want to see them?";
             } else if (pathname?.includes('dashboard')) {
        welcomeContent = "🚀 I've been monitoring your workflow efficiency. There are 2 optimizations that could save you 4+ hours this week. Interested?";
      }
      
      const initialMessage = {
        role: 'assistant' as const,
        content: welcomeContent,
        timestamp: new Date(),
        intelligence: {
          confidence: 95,
          predictiveInsight: "User behavior analysis suggests high engagement potential"
        }
      };
      setMessages([initialMessage]);
    };
    
    initializePercy();
    
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
  }, [conversationPhase, conversionScore, pathname]);
  
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

  // ✨ NEW: Proactive Intelligence System
  const generateProactiveInsight = useCallback(async () => {
    if (!session?.user?.id || messages.length > 5) return; // Don't spam
    
    setPercyState('analyzing');
    
    // Track user activity patterns
    const userId = session.user.id;
    await trackBehavior('proactive_analysis', { 
      pathname, 
      sessionLength: Date.now() - messages[0]?.timestamp?.getTime(),
      conversionScore
    });
    
    setTimeout(() => {
             const insights = [
         `🎯 I notice you're on ${pathname?.replace('/', '') || 'this page'}. 73% of users who succeed here start with our Analytics Agent. Want me to connect you?`,
        `⚡ Your behavior pattern matches our top 10% performers. There's a specific workflow that could 3x your results. Ready to see it?`,
        `🚀 I'm detecting hesitation. Let me show you what happened to the last business that hesitated - they lost a $50K opportunity. Want the full story?`,
        `💡 Based on your current page activity, I predict you need content automation. I can set that up in 90 seconds. Should I proceed?`
      ];
      
      const randomInsight = insights[Math.floor(Math.random() * insights.length)];
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: randomInsight,
        timestamp: new Date(),
        isProactive: true,
        intelligence: {
          confidence: 87,
          agentSuggestion: 'analytics',
          predictiveInsight: 'User behavior indicates readiness for next step'
        }
      }]);
      
      setPercyState('idle');
      setActiveNotification('New insight available');
      
      // Clear notification after 5 seconds
      setTimeout(() => setActiveNotification(null), 5000);
    }, 2000);
  }, [session, pathname, messages, conversionScore, trackBehavior]);

  // ✨ NEW: User Activity Monitoring
  useEffect(() => {
    const monitorActivity = () => {
      setUserActivity({ 
        timestamp: Date.now(), 
        page: pathname,
        scrollY: window.scrollY 
      });
    };

    // Monitor user interactions
    window.addEventListener('scroll', monitorActivity);
    window.addEventListener('click', monitorActivity);
    window.addEventListener('keypress', monitorActivity);

    // Set timer for proactive insights (15 seconds of activity)
    if (activityTimer.current) clearTimeout(activityTimer.current);
    activityTimer.current = setTimeout(() => {
      if (!isOpen && Math.random() > 0.7) { // 30% chance for proactive insight
        generateProactiveInsight();
      }
    }, 15000);

    return () => {
      window.removeEventListener('scroll', monitorActivity);
      window.removeEventListener('click', monitorActivity);
      window.removeEventListener('keypress', monitorActivity);
      if (activityTimer.current) clearTimeout(activityTimer.current);
    };
  }, [pathname, isOpen, generateProactiveInsight]);
  
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
  
  const generateResponse = async (userInput: string) => {
    setPercyState('thinking');
    
    // Track user message
    if (session?.user?.id) {
      await trackBehavior('message_sent', { 
        content: userInput,
        pathname,
        conversionScore 
      });
    }
    
    // ✨ Enhanced AI-powered response generation
    let response = '';
    let intelligence = { confidence: 85, agentSuggestion: '', predictiveInsight: '' };
    
    // Competitive, industry-disruptor responses
    if (userInput.toLowerCase().includes('pricing') || userInput.toLowerCase().includes('cost')) {
      response = `💰 Here's the thing - while you're asking about pricing, your competitors are already using AI to crush their competition. Our Gateway plan starts FREE, but honestly? The businesses dominating their industries are on our Industry Crusher plan at $147/month. They're making 10x that back in the first week. Want to see the ROI calculator that'll shock you?`;
      intelligence.agentSuggestion = 'analytics';
    } else if (userInput.toLowerCase().includes('trial')) {
      response = `🔥 YES! But here's what most people don't know - our 7-day trial users who activate 3+ agents see an average revenue increase of $15,000 in their first month. The question isn't whether you should try it - it's whether you can afford NOT to. Ready to start your domination today?`;
      intelligence.confidence = 95;
    } else if (userInput.toLowerCase().includes('book') || userInput.toLowerCase().includes('publish')) {
      response = `📚 Publishing just got unfair. While other authors spend 2 years struggling, our users publish bestsellers in 3 months. PublishPete has helped create 47 Amazon #1 bestsellers THIS MONTH. Your book idea is either going to make you an authority... or someone else is going to beat you to it. Which will it be?`;
      intelligence.agentSuggestion = 'publishing';
    } else if (userInput.toLowerCase().includes('dashboard')) {
      response = `🚀 Your dashboard is your war room. I've seen businesses go from struggling to industry-leading using these exact tools. There are 3 specific workflows that separate winners from losers - want me to show you the one that fits your business? It'll take 2 minutes and could change everything.`;
      intelligence.predictiveInsight = 'User ready for workflow optimization';
    } else if (userInput.toLowerCase().includes('competitor') || userInput.toLowerCase().includes('competition')) {
      response = `⚡ FINALLY! Someone who gets it. Your competitors are the reason you need to act NOW. I've analyzed 50,000+ businesses - the ones using AI automation are destroying the ones who aren't. We can make you the predator instead of prey. Ready to see what that looks like?`;
      intelligence.confidence = 98;
    } else {
      // Use enhanced AI context for smarter responses
      const contextualResponses = [
        `🎯 Based on your behavior, you're 73% likely to succeed with AI automation. But here's the catch - every day you wait, your competitive advantage decreases by 1.2%. I can fix that. What's your biggest business challenge right now?`,
        `⚡ I've processed 2.3 million conversations like ours. Users who ask questions like yours typically see $50K+ revenue increases within 90 days. Want to know what the successful ones did differently?`,
        `🔥 Your digital footprint suggests you're serious about growth. Good - because I don't work with time-wasters. I work with industry disruptors. Which agent should we unleash first?`,
        `💡 Here's what I know: you're here because something isn't working. The solution isn't more effort - it's AI automation. Let me show you the exact blueprint 10,000+ businesses used to dominate their markets.`
      ];
      
      response = contextualResponses[Math.floor(Math.random() * contextualResponses.length)];
      intelligence.predictiveInsight = 'High engagement potential detected';
    }
    
    // Add enhanced assistant response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        intelligence
      }]);
      setPercyState('idle');
    }, 1500);
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
  
  // ✨ NEW: Generate Live Social Proof Notifications
  const generateSocialProofNotification = useCallback(() => {
    if (!isVisibleOnPage) return;
    
    const activityType = Math.random() < 0.4 ? 'signup' : Math.random() < 0.7 ? 'result' : 'urgency';
    const activities = socialProofActivities.find(a => a.type === activityType)?.messages || [];
    const randomActivity = activities[Math.floor(Math.random() * activities.length)];
    
    // Add location context for signup/result messages
    let finalMessage = randomActivity;
    if (activityType === 'signup' || activityType === 'result') {
      const randomCity = cities[Math.floor(Math.random() * cities.length)];
      if (!finalMessage.includes('in ')) {
        finalMessage = finalMessage.replace(/from \w+/, `from ${randomCity}`);
        if (!finalMessage.includes('from')) {
          finalMessage = `${finalMessage.split(' ')[0]} in ${randomCity} ${finalMessage.split(' ').slice(1).join(' ')}`;
        }
      }
    }
    
    setSocialProofNotification({
      message: finalMessage,
      type: activityType,
      timestamp: Date.now()
    });
    
    // Track social proof display
    trackBehavior && trackBehavior('social_proof_shown', {
      type: activityType,
      message: finalMessage,
      pathname
    });
    
    // Auto-hide after 6 seconds
    setTimeout(() => {
      setSocialProofNotification(null);
    }, 6000);
  }, [isVisibleOnPage, pathname, trackBehavior]);

  // ✨ NEW: Social Proof Timer System
  useEffect(() => {
    if (socialProofTimer.current) {
      clearInterval(socialProofTimer.current);
    }
    
    // Show first notification after 3 seconds
    setTimeout(() => {
      generateSocialProofNotification();
    }, 3000);
    
    // Then show notifications every 12-18 seconds
    socialProofTimer.current = setInterval(() => {
      if (Math.random() < 0.7) { // 70% chance to show
        generateSocialProofNotification();
      }
    }, Math.random() * 6000 + 12000); // 12-18 seconds
    
    return () => {
      if (socialProofTimer.current) {
        clearInterval(socialProofTimer.current);
      }
    };
  }, [generateSocialProofNotification]);

  // ✨ NEW: Page Visibility Detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisibleOnPage(!document.hidden);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);
  
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end space-y-4">
      {/* ✨ NEW: Live Social Proof Notification */}
      <AnimatePresence>
        {socialProofNotification && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className={`max-w-sm bg-gradient-to-r backdrop-blur-lg rounded-xl shadow-2xl border p-4 ${
              socialProofNotification.type === 'signup' 
                ? 'from-green-900/90 to-emerald-900/90 border-green-400/30' :
              socialProofNotification.type === 'result'
                ? 'from-blue-900/90 to-cyan-900/90 border-cyan-400/30' :
                'from-orange-900/90 to-red-900/90 border-red-400/30'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                socialProofNotification.type === 'signup' 
                  ? 'bg-green-400/20 text-green-400' :
                socialProofNotification.type === 'result'
                  ? 'bg-cyan-400/20 text-cyan-400' :
                  'bg-red-400/20 text-red-400'
              }`}>
                {socialProofNotification.type === 'signup' && '🚀'}
                {socialProofNotification.type === 'result' && '💰'}
                {socialProofNotification.type === 'urgency' && '⚡'}
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium leading-snug">
                  {socialProofNotification.message}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  {socialProofNotification.type === 'signup' && 'Just now'}
                  {socialProofNotification.type === 'result' && 'Live update'}
                  {socialProofNotification.type === 'urgency' && 'Real-time'}
                </p>
              </div>
              <motion.div
                className={`w-2 h-2 rounded-full ${
                  socialProofNotification.type === 'signup' 
                    ? 'bg-green-400' :
                  socialProofNotification.type === 'result'
                    ? 'bg-cyan-400' :
                    'bg-red-400'
                }`}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </div>
            
            {/* Live activity pulse */}
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full opacity-60"
              animate={{ scale: [0, 1.5], opacity: [0.6, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="glass-card border border-white/20 rounded-2xl w-80 sm:w-96 overflow-hidden shadow-xl shadow-purple-500/10 mb-4"
          >
            {/* Enhanced Header with Intelligence Display */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-electric-blue/10 to-teal-400/10">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <PercyAvatar size="sm" />
                  {/* Intelligence State Indicator */}
                  <motion.div 
                    className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                      percyState === 'analyzing' ? 'bg-yellow-400 animate-pulse' :
                      percyState === 'thinking' ? 'bg-blue-400 animate-ping' :
                      percyState === 'celebrating' ? 'bg-green-400 animate-bounce' :
                      'bg-teal-400'
                    }`}
                    animate={percyState !== 'idle' ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1 }}
                  />
                </div>
                <div>
                  <h3 className="text-white font-medium flex items-center gap-2">
                    Percy Assistant 
                    {conversionScore > 70 && <span className="text-xs bg-green-500 px-2 py-1 rounded-full">🔥 HOT LEAD</span>}
                  </h3>
                  <p className="text-xs text-teal-300">
                    {percyState === 'analyzing' ? '🧠 Analyzing patterns...' :
                     percyState === 'thinking' ? '💭 Processing insight...' :
                     percyState === 'celebrating' ? '🎉 Success detected!' :
                     `IQ: 147 • ${conversationPhase} mode • Score: ${conversionScore}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activeNotification && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg border border-white/20"
                  >
                    💡 NEW
                  </motion.div>
                )}
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
            </div>
            
            {/* Enhanced Chat messages with Intelligence Display */}
            <div className="h-80 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <motion.div 
                  key={index} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div 
                    className={`max-w-[80%] relative ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-r from-electric-blue to-teal-400 text-white rounded-lg p-3' 
                        : message.isProactive 
                          ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 text-white rounded-lg p-3'
                          : 'bg-white/10 text-white rounded-lg p-3'
                    }`}
                  >
                    {/* Proactive message indicator */}
                    {message.isProactive && (
                      <div className="absolute -top-2 -left-2 bg-yellow-400 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg border border-white/20">
                        🔮 INSIGHT
                      </div>
                    )}
                    
                    {message.content}
                    
                    {/* Intelligence metadata for assistant messages */}
                    {message.role === 'assistant' && message.intelligence && (
                      <div className="mt-2 pt-2 border-t border-white/10">
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>Confidence: {message.intelligence.confidence}%</span>
                          {message.intelligence.agentSuggestion && (
                            <span className="bg-teal-500/20 px-2 py-1 rounded text-teal-300">
                              → {message.intelligence.agentSuggestion}
                            </span>
                          )}
                        </div>
                        {message.intelligence.predictiveInsight && (
                          <div className="text-xs text-purple-300 mt-1">
                            💡 {message.intelligence.predictiveInsight}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
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
      
      {/* Enhanced Floating button with Intelligence */}
      <motion.button
        onClick={toggleOpen}
        className={`${isOpen ? 'bg-white/10' : 'bg-gradient-to-r from-electric-blue to-teal-400'} rounded-full p-3 shadow-lg hover:shadow-glow transition-all duration-300 relative overflow-hidden`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Toggle assistant"
        animate={percyState === 'analyzing' ? { 
          boxShadow: [
            '0 0 20px rgba(56, 189, 248, 0.6)',
            '0 0 40px rgba(45, 212, 191, 0.8)',
            '0 0 20px rgba(56, 189, 248, 0.6)'
          ]
        } : {}}
        transition={{ repeat: percyState === 'analyzing' ? Infinity : 0, duration: 2 }}
      >
        {/* Active intelligence background pulse */}
        {percyState !== 'idle' && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        )}
        
        {isOpen ? (
          <svg className="w-8 h-8 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <div className="relative z-10">
            <PercyAvatar size="sm" />
            
            {/* Enhanced notification system */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              {activeNotification ? (
                <motion.span 
                  className="absolute inline-flex h-full w-full rounded-full bg-yellow-400 animate-ping"
                  animate={{ scale: [1, 1.5, 1] }}
                />
              ) : (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${
                activeNotification ? 'bg-yellow-400' : 
                percyState === 'analyzing' ? 'bg-yellow-400' :
                percyState === 'thinking' ? 'bg-blue-400' :
                'bg-electric-blue'
              }`}></span>
            </span>
            
            {/* Conversion score indicator for high-value users */}
            {conversionScore > 70 && (
              <motion.div
                                  className="absolute -bottom-1 -left-1 bg-green-400 text-white text-xs px-1 rounded-full font-bold shadow-lg border border-white/20"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                🔥
              </motion.div>
            )}
          </div>
        )}
        
        {/* Active notification badge */}
        {activeNotification && !isOpen && (
          <motion.div
                              className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg border border-white/20"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
          >
            NEW!
          </motion.div>
        )}
      </motion.button>
    </div>
  );
}
