'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { Send, MessageCircle, X } from 'lucide-react';
import { agentBackstories } from '@/lib/agents/agentBackstories';
import { getAgent } from '@/lib/agents/agentLeague';
import { usePercyContext } from '@/components/assistant/PercyProvider';
import { getCurrentUser } from '@/utils/supabase-auth';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase';
import toast from 'react-hot-toast';
import PercyAvatar from '@/components/home/PercyAvatar';
import Link from 'next/link';

interface ConversationMessage {
  id: string;
  type: 'percy' | 'user' | 'agent-recommendation' | 'system';
  content: string;
  timestamp: string;
  options?: ConversationOption[];
  agentRecommendations?: AgentRecommendation[];
  metadata?: any;
}

interface ConversationOption {
  id: string;
  label: string;
  icon?: string;
  action: string;
  data?: any;
}

interface AgentRecommendation {
  agentId: string;
  superheroName: string;
  catchphrase: string;
  reason: string;
  powers: string[];
  confidence: number;
}

interface OnboardingState {
  userId?: string;
  userName?: string;
  goal?: string;
  platform?: string;
  businessUrl?: string;
  linkedInProfile?: string;
  challenges?: string[];
  currentStep: 'greeting' | 'goal-selection' | 'platform-selection' | 'business-scan' | 'agent-recommendations' | 'complete';
  conversationHistory: ConversationMessage[];
  recommendedAgents?: string[];
}

const GOALS = [
  { id: 'branding', label: 'Build My Brand Identity', icon: '🎨', keywords: ['logo', 'visual', 'identity'] },
  { id: 'content', label: 'Create Amazing Content', icon: '✍️', keywords: ['blog', 'articles', 'writing'] },
  { id: 'social', label: 'Dominate Social Media', icon: '📱', keywords: ['viral', 'engagement', 'followers'] },
  { id: 'website', label: 'Launch a Stunning Website', icon: '🌐', keywords: ['web', 'online', 'digital'] },
  { id: 'analytics', label: 'Unlock Data Insights', icon: '📊', keywords: ['metrics', 'performance', 'data'] },
  { id: 'ads', label: 'Create Converting Ads', icon: '🎯', keywords: ['advertising', 'campaigns', 'conversion'] },
  { id: 'video', label: 'Produce Epic Videos', icon: '🎬', keywords: ['youtube', 'tiktok', 'reels'] },
  { id: 'business', label: 'Scale My Business', icon: '🚀', keywords: ['strategy', 'growth', 'revenue'] }
];

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', icon: '📸' },
  { id: 'youtube', label: 'YouTube', icon: '🎥' },
  { id: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { id: 'tiktok', label: 'TikTok', icon: '🎵' },
  { id: 'website', label: 'Website/Blog', icon: '🌐' },
  { id: 'shopify', label: 'E-commerce', icon: '🛒' },
  { id: 'multiple', label: 'Multiple Platforms', icon: '🌟' }
];

export default function ConversationalPercyOnboarding() {
  const router = useRouter();
  const pathname = usePathname();
  const onHome = pathname === '/';
  const { setPercyIntent } = usePercyContext();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showAskPercy, setShowAskPercy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false); // New: indicates active scan
  const [showBurst, setShowBurst] = useState(false); // particle burst on agent summon

  // Initialize state from localStorage or defaults
  const [onboardingState, setOnboardingState] = useState<OnboardingState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('percyOnboardingState');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved onboarding state:', e);
        }
      }
    }
    return {
      currentStep: 'greeting',
      conversationHistory: []
    };
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('percyOnboardingState', JSON.stringify(onboardingState));
    }
  }, [onboardingState]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [onboardingState.conversationHistory]);

  const addPercyMessage = useCallback((content: string, options?: ConversationOption[], agentRecommendations?: AgentRecommendation[]) => {
    const message: ConversationMessage = {
      id: `percy-${Date.now()}`,
      type: 'percy',
      content,
      timestamp: new Date().toISOString(),
      options,
      agentRecommendations
    };

    setOnboardingState(prev => ({
      ...prev,
      conversationHistory: [...prev.conversationHistory, message]
    }));
  }, []);

  const addUserMessage = useCallback((content: string) => {
    const message: ConversationMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    setOnboardingState(prev => ({
      ...prev,
      conversationHistory: [...prev.conversationHistory, message]
    }));
  }, []);

  const generateAgentRecommendations = useCallback(() => {
    setIsTyping(true);
    setOnboardingState(prev => ({ ...prev, currentStep: 'agent-recommendations' }));

    setTimeout(() => {
      const { goal, platform } = onboardingState;
      const recommendations: AgentRecommendation[] = [];

      // Map goals to agents
      const goalToAgents: Record<string, string[]> = {
        branding: ['branding-agent', 'content-creator-agent'],
        content: ['content-creator-agent', 'social-bot-agent', 'publishing-agent'],
        social: ['social-bot-agent', 'content-creator-agent', 'video-content-agent'],
        website: ['sitegen-agent', 'branding-agent', 'content-creator-agent'],
        analytics: ['analytics-agent', 'ad-creative-agent'],
        ads: ['ad-creative-agent', 'analytics-agent', 'social-bot-agent'],
        video: ['video-content-agent', 'social-bot-agent', 'content-creator-agent'],
        business: ['biz-agent', 'proposal-generator-agent', 'analytics-agent']
      };

      const recommendedAgentIds = goalToAgents[goal || 'content'] || ['content-creator-agent'];

      recommendedAgentIds.forEach((agentId, index) => {
        const backstory = agentBackstories[agentId];
        if (backstory) {
          recommendations.push({
            agentId,
            superheroName: backstory.superheroName,
            catchphrase: backstory.catchphrase,
            reason: `Perfect for ${goal} on ${platform}!`,
            powers: backstory.powers.slice(0, 3),
            confidence: 95 - (index * 5)
          });
        }
      });

      setIsTyping(false);

      addPercyMessage(
        "🎯 Based on your cosmic coordinates, I've summoned the perfect superheroes for your mission!",
        recommendations.map(rec => ({
          id: rec.agentId,
          label: `Activate ${rec.superheroName}`,
          icon: '⚡',
          action: 'select-agent',
          data: { agentId: rec.agentId }
        })),
        recommendations
      );
    }, 2000);
  }, [onboardingState, addPercyMessage]);

  const saveOnboardingComplete = useCallback(async () => {
    try {
      const user: User | null = await getCurrentUser();
      if (user) {
        await supabase.from('user_settings').upsert({
          userId: user.id,
          onboardingComplete: true,
          goal: onboardingState.goal,
          platform: onboardingState.platform,
          recommendedAgents: onboardingState.recommendedAgents,
          updatedAt: new Date().toISOString()
        });
      }

      // Save to localStorage
      localStorage.setItem('onboardingComplete', 'true');
      localStorage.setItem('userGoal', onboardingState.goal || '');
      localStorage.setItem('recommendedAgents', JSON.stringify(onboardingState.recommendedAgents || []));

    } catch (error) {
      console.error('Error saving onboarding state:', error);
    }
  }, [onboardingState]);

  const navigateToDashboard = useCallback(() => {
    const dashboardMap: Record<string, string> = {
      branding: '/dashboard/branding',
      content: '/dashboard/marketing',
      social: '/dashboard/social-media',
      website: '/dashboard/website',
      analytics: '/dashboard/marketing',
      ads: '/dashboard/marketing',
      video: '/dashboard/social-media',
      business: '/dashboard/client'
    };

    const path = dashboardMap[onboardingState.goal || 'content'] || '/dashboard';
    router.push(`${path}?source=percy_onboarding&agents=${(onboardingState.recommendedAgents || []).join(',')}`);
  }, [onboardingState, router]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const user: User | null = await getCurrentUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, email')
            .eq('id', user.id)
            .single();

          setOnboardingState(prev => ({
            ...prev,
            userId: user.id,
            userName: profile?.display_name || profile?.email?.split('@')[0] || 'friend'
          }));

          // If returning user, add welcome back message
          if (onboardingState.conversationHistory.length === 0) {
            addPercyMessage(
              `🌟 Welcome back, ${profile?.display_name || 'cosmic explorer'}! I'm Percy, your AI concierge in the SKRBL universe. ${agentBackstories['percy-agent'].catchphrase}`,
              [
                { id: 'continue', label: 'Continue where I left off', icon: '⏩', action: 'continue' },
                { id: 'restart', label: 'Start fresh', icon: '🔄', action: 'restart' }
              ]
            );
          }
        } else {
          // New user greeting
          if (onboardingState.conversationHistory.length === 0) {
            addPercyMessage(
              `✨ Greetings, cosmic explorer! I'm Percy, your AI concierge in the SKRBL universe. ${agentBackstories['percy-agent'].catchphrase} Let's discover which digital superhero can help you achieve greatness!`,
              [
                { id: 'start', label: "Let's do this! 🚀", icon: '🚀', action: 'start' },
                { id: 'learn', label: 'Tell me more about SKRBL AI', icon: '📖', action: 'learn' }
              ]
            );
          }
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        // Default greeting if error
        if (onboardingState.conversationHistory.length === 0) {
          addPercyMessage(
            `✨ Welcome to the SKRBL AI universe! I'm Percy, your cosmic concierge. ${agentBackstories['percy-agent'].catchphrase} Ready to find your perfect AI superhero?`
          );
        }
      }
    };

    fetchUserInfo();
  }, [addPercyMessage, onboardingState.conversationHistory.length]);

  const handleOptionClick = useCallback(async (option: ConversationOption) => {
    // Add user's selection as a message
    addUserMessage(option.label);

    // Handle different actions
    switch (option.action) {
      case 'start':
      case 'restart': {
        setOnboardingState(prev => ({ ...prev, currentStep: 'goal-selection' }));
        setTimeout(() => {
          addPercyMessage(
            "🎯 Excellent! What's your main mission today? Choose your primary goal, and I'll summon the perfect superhero to help!",
            GOALS.map(goal => ({
              id: goal.id,
              label: goal.label,
              icon: goal.icon,
              action: 'select-goal',
              data: { goalId: goal.id }
            }))
          );
        }, 500);
        break;
      }

      case 'continue': {
        // Continue from saved state
        if (onboardingState.goal && !onboardingState.recommendedAgents) {
          generateAgentRecommendations();
        } else if (onboardingState.recommendedAgents) {
          navigateToDashboard();
        } else {
          handleOptionClick({ id: 'start', label: "Let's start!", action: 'start' });
        }
        break;
      }

      case 'learn': {
        addPercyMessage(
          "🌌 SKRBL AI is a universe of digital superheroes, each with unique powers to help you succeed! From branding wizards to content creators, social media masters to data analysts - we have an AI agent for every challenge. Ready to meet your perfect match?",
          [
            { id: 'start', label: "Yes, let's find my superhero! 🦸", icon: '🦸', action: 'start' }
          ]
        );
        break;
      }

      case 'select-goal': {
        const selectedGoal = GOALS.find(g => g.id === option.data?.goalId);
        if (selectedGoal) {
          setOnboardingState(prev => ({ 
            ...prev, 
            goal: selectedGoal.id,
            currentStep: 'platform-selection' 
          }));

          setTimeout(() => {
            addPercyMessage(
              `${selectedGoal.icon} "${selectedGoal.label}" - Cosmic choice! Now, which digital realm do you want to conquer?`,
              PLATFORMS.map(platform => ({
                id: platform.id,
                label: platform.label,
                icon: platform.icon,
                action: 'select-platform',
                data: { platformId: platform.id }
              }))
            );
          }, 500);
        }
        break;
      }

      case 'select-platform': {
        const selectedPlatform = PLATFORMS.find(p => p.id === option.data?.platformId);
        if (selectedPlatform) {
          setOnboardingState(prev => ({ 
            ...prev, 
            platform: selectedPlatform.id,
            currentStep: 'business-scan' 
          }));

          setTimeout(() => {
            addPercyMessage(
              "🔮 Perfect! Want me to scan your business for personalized recommendations? This helps me find the EXACT superhero for your needs!",
              [
                { id: 'linkedin', label: 'Connect LinkedIn', icon: '💼', action: 'connect-linkedin' },
                { id: 'website', label: 'Scan my website', icon: '🌐', action: 'scan-website' },
                { id: 'skip', label: 'Skip for now', icon: '⏭️', action: 'skip-scan' }
              ]
            );
          }, 500);
        }
        break;
      }

      case 'connect-linkedin': {
        toast("🔗 LinkedIn integration coming soon! For now, I'll use your goals to find the perfect match.", {
          icon: '🚧',
          duration: 4000
        });
        generateAgentRecommendations();
        break;
      }

      case 'scan-website': {
        addPercyMessage("🌐 Please enter your website URL and I'll analyze it for you:");
        // Show input for website URL
        break;
      }

      case 'skip-scan': {
        generateAgentRecommendations();
        break;
      }

      case 'signup': {
        // Redirect to signup page
        router.push('/auth/signup?source=percy_scan_limit');
        break;
      }

      case 'select-agent': {
        const agentId = option.data?.agentId;
        if (agentId) {
          setOnboardingState(prev => ({
            ...prev,
            recommendedAgents: [...(prev.recommendedAgents || []), agentId]
          }));

          toast.success(`🎉 ${option.label} activated!`, { duration: 3000 });

          // Trigger celebratory burst animation
          setShowBurst(true);
          setTimeout(() => setShowBurst(false), 900);

          setTimeout(() => {
            addPercyMessage(
              "🚀 Excellent choice! Ready to start your superhero journey?",
              [
                { id: 'launch', label: 'Launch my dashboard! 🎯', icon: '🎯', action: 'complete' },
                { id: 'add-more', label: 'Add another agent', icon: '➕', action: 'add-agent' }
              ]
            );
          }, 500);
        }
        break;
      }

      case 'complete': {
        await saveOnboardingComplete();
        navigateToDashboard();
        break;
      }

      default: {
        console.log('Unknown action:', option.action);
      }
    }
  }, [onboardingState, addPercyMessage, addUserMessage, generateAgentRecommendations, navigateToDashboard, saveOnboardingComplete, router]);

  // Declare this later after handleQuickScan is defined

  // ==== Quick Scan & Paste/Drop Handlers ====
  const isValidUrl = (str: string) => {
    try { new URL(str); return true; } catch { return false; }
  };

  // Perform instant scan using the new API
  const performInstantScan = useCallback(async (url: string) => {
    try {
      // Determine scan type based on URL
      let scanType: 'website' | 'linkedin' | 'youtube' = 'website';
      if (url.includes('linkedin.com')) {
        scanType = 'linkedin';
      } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
        scanType = 'youtube';
      }

      // Get current user if available
      const user = await getCurrentUser();
      
      // Call the scan API
      const response = await fetch('/api/percy/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: scanType,
          url,
          userId: user?.id,
          sessionId: `percy-onboarding-${Date.now()}`
        })
      });

      const result = await response.json();

      if (!result.success) {
        if (result.requiresUpgrade) {
          setIsScanning(false);
          setIsTyping(false);
          // Handle upgrade prompt from API
          const upgradeMessage = result.upgradePrompt 
            ? `🔄 ${result.upgradePrompt.message}`
            : `🔄 You've reached your daily scan limit (3 per day). Upgrade to Pro for unlimited scans!`;
          
          addPercyMessage(
            upgradeMessage,
            [
              { id: 'upgrade', label: result.upgradePrompt?.ctaText || 'Upgrade to Pro', icon: '🚀', action: 'upgrade' },
              { id: 'continue', label: 'Continue without scan', icon: '⏭️', action: 'skip-scan' }
            ]
          );
          return;
        }
        throw new Error(result.error);
      }

      // Update state with scan results
      setOnboardingState(prev => ({ 
        ...prev, 
        businessUrl: url,
        currentStep: 'agent-recommendations'
      }));

      setIsScanning(false);

      // Create enhanced recommendations based on scan results
      const scanBasedRecommendations = result.agentRecommendations.map((rec: any) => ({
        agentId: rec.agentId,
        superheroName: rec.superheroName,
        catchphrase: rec.catchphrase,
        reason: rec.reason,
        powers: rec.capabilities,
        confidence: rec.confidence
      }));

      // Generate summary message based on analysis
      const analysis = result.analysis;
      const summaryMessage = `✨ Scan complete! I analyzed your ${scanType === 'website' ? 'website' : scanType === 'linkedin' ? 'LinkedIn profile' : 'YouTube content'} and discovered:

🎯 **Business Type**: ${analysis.businessType}
🏢 **Industry**: ${analysis.industry}
${analysis.keyFeatures?.length ? `⭐ **Key Features**: ${analysis.keyFeatures.slice(0, 3).join(', ')}` : ''}

Based on this analysis, here are my cosmic recommendations:`;

      addPercyMessage(
        summaryMessage,
        result.agentRecommendations.slice(0, 3).map((rec: any) => ({
          id: rec.agentId,
          label: `Activate ${rec.superheroName}`,
          icon: '⚡',
          action: 'select-agent',
          data: { agentId: rec.agentId }
        })),
        scanBasedRecommendations
      );

      // Track scan completion
      try {
        await fetch('/api/analytics/percy-events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_type: 'scan_completed',
            scan_type: scanType,
            user_id: user?.id,
            session_id: `percy-onboarding-${Date.now()}`,
            timestamp: new Date().toISOString()
          })
        });
      } catch (analyticsError) {
        console.warn('Analytics tracking failed:', analyticsError);
      }

    } catch (error) {
      console.error('Instant scan failed:', error);
      throw error; // Re-throw to be handled by caller
    }
  }, [addPercyMessage, setOnboardingState]);

  const handleQuickScan = useCallback(async (url: string) => {
    setOnboardingState(prev => ({ ...prev, businessUrl: url }));
    setIsScanning(true);
    setIsTyping(false);
    addPercyMessage(`🔍 Scanning ${url} for insights...`);
    
    try {
      await performInstantScan(url);
    } catch (error) {
      setIsScanning(false);
      setIsTyping(false);
      addPercyMessage(`⚠️ Had trouble scanning that URL, but I can still help! Here are my top recommendations:`);
      generateAgentRecommendations();
    }
  }, [addPercyMessage, performInstantScan, generateAgentRecommendations]);

  const handleTextSubmit = useCallback(async () => {
    if (!inputValue.trim()) return;

    const userInput = inputValue.trim();
    setInputValue('');
    addUserMessage(userInput);

    // Handle website URL input with real scanning
    if (onboardingState.currentStep === 'business-scan' && userInput.includes('.')) {
      await handleQuickScan(userInput);
    } else {
      // General chat response
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addPercyMessage(
          `Thanks for sharing! Let me help you with "${userInput}". Which area would you like to focus on?`,
          GOALS.slice(0, 3).map(goal => ({
            id: goal.id,
            label: goal.label,
            icon: goal.icon,
            action: 'select-goal',
            data: { goalId: goal.id }
          }))
        );
      }, 1000);
    }
  }, [inputValue, onboardingState, addUserMessage, addPercyMessage, handleQuickScan]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    if (isValidUrl(text)) {
      e.preventDefault();
      handleQuickScan(text);
    }
  }, [handleQuickScan]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.dataTransfer.getData('text');
    if (isValidUrl(text)) {
      handleQuickScan(text);
    }
  }, [handleQuickScan]);

  const resetOnboarding = useCallback(() => {
    setOnboardingState({
      currentStep: 'greeting',
      conversationHistory: []
    });
    localStorage.removeItem('percyOnboardingState');
    window.location.reload();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className={`${onHome ? 'relative w-full md:max-w-3xl mx-auto px-4 mt-6' : 'relative w-full max-w-full md:max-w-3xl mx-auto min-h-screen flex items-center justify-center px-4'}`}
    >
      {/* Main Chat Interface */}
      <div id="percy-chat" className="cosmic-glass w-full md:w-auto rounded-none md:rounded-2xl border border-white/10 shadow-cosmic overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PercyAvatar size="sm" animate className={`${(isTyping || isScanning) ? 'ring-2 ring-electric-blue animate-pulse' : ''}`} />
              <div>
                <h3 className="text-white font-bold">Percy the Cosmic Concierge</h3>
                <p className="text-cyan-300 text-sm">Your AI guide to the SKRBL universe</p>
              </div>
            </div>
            <button
              onClick={resetOnboarding}
              className="text-white/60 hover:text-white/80 transition-colors"
              title="Reset conversation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Container */}
        <div 
          ref={chatContainerRef}
          className="md:h-[500px] max-h-[70vh] overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/20"
        >
          <AnimatePresence>
            {onboardingState.conversationHistory.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                  {/* Message Bubble */}
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`
                      rounded-2xl p-4 
                      ${message.type === 'user' 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                        : 'bg-white/10 text-white border border-white/20'
                      }
                    `}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </motion.div>

                  {/* Agent Recommendations */}
                  {message.agentRecommendations && message.agentRecommendations.length > 0 && (
                    <div className="mt-3 space-y-3">
                      {message.agentRecommendations.map((rec) => (
                        <motion.div
                          key={rec.agentId}
                          initial={{ opacity: 0, x: -20, scale: 0.9 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          transition={{ type: 'spring', bounce: 0.4, duration: 0.8 }}
                          className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-4 border border-purple-400/20"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-lg font-bold text-purple-300">{rec.superheroName}</h4>
                            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                              {rec.confidence}% match
                            </span>
                          </div>
                          <p className="text-sm text-cyan-300 italic mb-2">"{rec.catchphrase}"</p>
                          <p className="text-sm text-white/80 mb-3">{rec.reason}</p>
                          <div className="flex flex-wrap gap-2">
                            {rec.powers.map((power, i) => (
                              <span key={i} className="text-xs bg-white/10 px-2 py-1 rounded-full text-white/70">
                                ⚡ {power}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Options */}
                  {message.options && message.options.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.options.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handleOptionClick(option)}
                          aria-label={option.label}
                          className="w-full text-left p-3 rounded-lg bg-white/10 hover:bg-white/20 border border-cyan-400/20 hover:border-cyan-400/40 transition-all group"
                        >
                          <span className="flex items-center gap-2">
                            {option.icon && <span className="text-lg">{option.icon}</span>}
                            <span className="text-white group-hover:text-cyan-300 transition-colors">
                              {option.label}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white/10 rounded-2xl px-4 py-3 border border-white/20">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-100" />
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Scan Indicator */}
          {isScanning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div className="relative flex items-center gap-3 bg-white/5 px-4 py-3 rounded-2xl border border-teal-400/20 overflow-hidden">
                {/* Orbiting ring */}
                <motion.div
                  className="w-6 h-6 rounded-full border-2 border-teal-400 border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                />
                <span className="text-teal-300 text-sm">Cosmic scan in progress…</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-white/10">
          <div className="flex gap-2">
            <input
              id="percy-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleTextSubmit()}
              onPaste={handlePaste}
              onDrop={handleDrop}
              placeholder="Drop a link, video, or profile… or ask Percy anything!"
              className="flex-1 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-electric-blue/60"
            />
            <button
              onClick={handleTextSubmit}
              disabled={!inputValue.trim()}
              className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation CTAs */}
      <div className="flex flex-col sm:flex-row gap-2 p-4 border-t border-white/10 bg-white/5">
        <Link href="/" className="flex-1 text-center py-2 rounded-lg bg-gradient-to-r from-electric-blue to-teal-400 text-white font-semibold shadow-glow focus:outline-none focus:ring-2 focus:ring-electric-blue/60">
          🏠 Back to Home
        </Link>
        <Link href="/agents" className="flex-1 text-center py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-electric-blue/60">
          🦸 View All Agents
        </Link>
      </div>

      {/* Persistent "Ask Percy" Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={() => {
          setShowAskPercy(!showAskPercy);
          if (!showAskPercy) {
            document.getElementById('percy-chat')?.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        className="fixed bottom-4 right-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all z-50"
        aria-label="Ask Percy"
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>

      {/* Ask Percy Modal */}
      <AnimatePresence>
        {showAskPercy && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-20 right-4 w-96 bg-deep-navy rounded-2xl shadow-2xl border border-white/10 p-4 z-50"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-bold">Ask Percy Anything!</h4>
              <button
                onClick={() => setShowAskPercy(false)}
                className="text-white/60 hover:text-white/80"
                aria-label="Close"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <input
              type="text"
              placeholder="What would you like to know?"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 text-sm mb-2"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  setInputValue(e.currentTarget.value);
                  e.currentTarget.value = '';
                  setShowAskPercy(false);
                  handleTextSubmit();
                }
              }}
            />
            <p className="text-xs text-white/50">
              I can help you choose agents, explain features, or guide you through SKRBL AI!
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebratory particle burst */}
      {showBurst && (
        <motion.div
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {[...Array(10)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute w-1.5 h-1.5 bg-teal-300 rounded-full"
              style={{
                top: '50%', left: '50%',
                transformOrigin: 'center',
              }}
              initial={{
                scale: 1,
                x: 0,
                y: 0,
                opacity: 1,
                rotate: Math.random() * 360,
              }}
              animate={{
                scale: [1, 1.4, 0],
                x: Math.cos((i/10)*Math.PI*2) * 60,
                y: Math.sin((i/10)*Math.PI*2) * 60,
                opacity: [1, 1, 0],
              }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}