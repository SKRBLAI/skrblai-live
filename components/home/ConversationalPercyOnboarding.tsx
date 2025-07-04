'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { RefreshCw, Send, Zap, Target, Brain } from 'lucide-react';
import { agentBackstories } from '@/lib/agents/agentBackstories';
import { getAgent } from '@/lib/agents/agentLeague';
import { usePercyContext } from '@/components/assistant/PercyProvider';
import { useAuth } from '@/components/context/AuthContext';
import { getCurrentUser } from '@/utils/supabase-helpers';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase';
import toast from 'react-hot-toast';
import PercyAvatar from '@/components/home/PercyAvatar';
import PercyFigure from '@/components/home/PercyFigure';
import AgentPreviewSection from '@/components/home/AgentPreviewSection';

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
  data?: Record<string, any>;
}

type Option = ConversationOption;

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

type MessageType = 'user' | 'percy' | 'agent-recommendation' | 'system';

interface Message {
  type: MessageType;
  content: string;
  agentRecommendations?: Array<{
    agentId: string;
    superheroName: string;
    catchphrase: string;
    confidence: number;
    reason: string;
    powers: string[];
  }>;
  options?: Array<{
    id: string;
    label: string;
    icon?: string;
    action: string;
    data?: Record<string, any>;
  }>;
  metadata?: {
    intelligenceScore?: number;
    percyState?: string;
    conversionScore?: number;
    conversationPhase?: string;
    competitiveMode?: boolean;
  };
}

export default function ConversationalPercyOnboarding() {
  const router = useRouter();
  const pathname = usePathname();
  const onHome = pathname === '/';
  const { setPercyIntent, trackBehavior, conversionScore, conversationPhase } = usePercyContext();
  const { session } = useAuth();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false); // New: indicates active scan
  const [showBurst, setShowBurst] = useState(false); // particle burst on agent summon
  
  // ✨ NEW: Floating Percy Integration
  const [isMinimized, setIsMinimized] = useState(false);
  const [showFloatingChat, setShowFloatingChat] = useState(false);
  
  // ✨ NEW: Enhanced Intelligence State
  const [percyState, setPercyState] = useState<'idle' | 'analyzing' | 'thinking' | 'celebrating'>('idle');
  const [intelligenceScore, setIntelligenceScore] = useState(147); // Percy's IQ
  const [competitiveInsights, setCompetitiveInsights] = useState<string[]>([]);
  const [userEngagementLevel, setUserEngagementLevel] = useState(0);

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
    // ✨ Enhanced with intelligence metadata
    const enhancedContent = `${content}`;
    
    const message: ConversationMessage = {
      id: `percy-${Date.now()}`,
      type: 'percy',
      content: enhancedContent,
      timestamp: new Date().toISOString(),
      options,
      agentRecommendations,
      metadata: {
        intelligenceScore,
        percyState,
        conversionScore,
        conversationPhase,
        competitiveMode: conversationPhase === 'aggressive'
      }
    };

    setOnboardingState(prev => ({
      ...prev,
      conversationHistory: [...prev.conversationHistory, message]
    }));
    
    // Track message for intelligence learning
    if (session?.user?.id) {
      trackBehavior('percy_message_sent', {
        messageType: 'onboarding',
        hasOptions: !!options,
        hasRecommendations: !!agentRecommendations,
        conversionScore
      });
    }
  }, [intelligenceScore, percyState, conversionScore, conversationPhase, session, trackBehavior]);

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
    setPercyState('analyzing');
    setOnboardingState(prev => ({ ...prev, currentStep: 'agent-recommendations' }));

    // ✨ Enhanced competitive intelligence
    const competitiveInsights = [
      "While you were deciding, 47 businesses in your industry just automated their competition away",
      "Your competitors gained 12% market advantage in the last 6 hours - time to strike back",
      "I've detected 3 critical gaps in your industry that could be worth $50K+ in the next 90 days",
      "There's a 73% chance your biggest competitor doesn't know about these AI capabilities yet"
    ];

    setTimeout(() => {
      const { goal, platform } = onboardingState;
      const recommendations: AgentRecommendation[] = [];

      // Dynamic competitive metrics for recommendations
      const competitiveMetrics = {
        timeToAdvantage: Math.floor(Math.random() * 48) + 12, // 12-60 hours
        competitorGap: Math.floor(Math.random() * 200) + 150, // 150-350%
        industryRank: Math.floor(Math.random() * 3) + 1 // Top 1-3
      };

      // Enhanced competitive messaging
      const competitiveMessage = competitiveInsights[Math.floor(Math.random() * competitiveInsights.length)];
      setCompetitiveInsights([competitiveMessage]);

      // Simplified agent recommendation
      const recommendedAgentIds = ['contentcreation'];

      recommendedAgentIds.forEach((agentId, index) => {
        const backstory = agentBackstories[agentId];
        if (backstory) {
          recommendations.push({
            agentId,
            superheroName: backstory.superheroName,
            catchphrase: backstory.catchphrase,
            reason: `🎯 INDUSTRY DOMINATION DETECTED: This agent will give you a ${competitiveMetrics.competitorGap}% advantage over competitors in your ${goal} strategy for ${platform}. Time to competitive superiority: ${competitiveMetrics.timeToAdvantage} hours.`,
            powers: backstory.powers.slice(0, 3),
            confidence: 95 - (index * 5)
          });
        }
      });

      setIsTyping(false);

      addPercyMessage(
        `🔥 COMPETITIVE ANALYSIS COMPLETE! I've identified the exact AI weapon that will make your competitors irrelevant. ${Math.floor(Math.random() * 47) + 23} businesses used this strategy this week—they're now industry leaders.`,
        recommendations.map(rec => ({
          id: rec.agentId,
          label: `⚡ Deploy ${rec.superheroName} (Destroy Competition)`,
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
              `🔥 ${profile?.display_name || 'Industry disruptor'}! You're back! I've analyzed 2,847 businesses this week alone. Ready to see how far ahead of your competition you can get? ${agentBackstories['percy'].catchphrase}`,
              [
                { id: 'continue', label: 'Show me the competitive advantage ⚡', icon: '⚡', action: 'continue' },
                { id: 'restart', label: 'I want to dominate a new area 🎯', icon: '🎯', action: 'restart' }
              ]
            );
          }
        } else {
          // New user greeting
          if (onboardingState.conversationHistory.length === 0) {
            addPercyMessage(
              `✨ Welcome to the SKRBL AI universe! I'm Percy, your cosmic concierge. ${agentBackstories['percy'].catchphrase} Ready to find your perfect AI superhero?`,
              [
                { id: 'start', label: "I want to dominate my industry! 🚀", icon: '🚀', action: 'start' },
                { id: 'learn', label: "Tell me about your agents 🤖", icon: '🤖', action: 'learn' },
                { id: 'skip', label: "Skip to agent selection ⚡", icon: '⚡', action: 'skip' }
              ]
            );
          }
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        // Default greeting if error
        if (onboardingState.conversationHistory.length === 0) {
          addPercyMessage(
            `✨ Welcome to the SKRBL AI universe! I'm Percy, your cosmic concierge. ${agentBackstories['percy'].catchphrase} Ready to find your perfect AI superhero?`
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
            "🔥 Perfect! I've seen 12,000+ businesses transform this month alone. What's your biggest competitive opportunity RIGHT NOW? Pick one, and I'll deploy the exact AI weapon that's been crushing it for your industry:",
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
          "🎯 While your competitors are still figuring out basic AI, SKRBL AI users are already 400% more productive. Our specialized AI agents don't just help—they DOMINATE. Content creation? 10x faster. Lead generation? 350% increase. Brand building? Industry-leading results in weeks, not years. Your competition isn't ready for what's coming.",
          [
            { id: 'start', label: "I'm ready to crush my competition! ⚡", icon: '⚡', action: 'start' }
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
              `${selectedGoal.icon} "${selectedGoal.label}" - BRILLIANT choice! 73% of our users see results in this area within 48 hours. Now, which battlefield needs to be dominated first?`,
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
              "🎯 PERFECT! I've just analyzed 1,247 businesses in your space this week. 89% who let me scan their setup gained a 10x competitive advantage within 72 hours. Your competitors can't see this coming—want me to calculate YOUR domination strategy?",
              [
                { id: 'linkedin', label: 'Analyze my LinkedIn for competitive edge 💼', icon: '💼', action: 'connect-linkedin' },
                { id: 'website', label: 'Scan my website vs competition 🎯', icon: '🎯', action: 'scan-website' },
                { id: 'skip', label: 'Skip—I trust your AI judgment ⚡', icon: '⚡', action: 'skip-scan' }
              ]
            );
          }, 500);
        }
        break;
      }

      case 'connect-linkedin': {
        toast("⚡ LinkedIn competitive analysis activated! I'm detecting industry gaps your competitors missed.", {
          icon: '🎯',
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
      
      case 'signup-for-analysis':
      case 'signup-now': {
        addPercyMessage(
          `🚀 **Perfect choice!** You're about to gain an unfair advantage over your competition.`,
          [
            { id: 'start-trial', label: '🎯 Start Free Trial', icon: '🚀', action: 'redirect-signup' }
          ]
        );
        setTimeout(() => {
          window.location.href = '/sign-up';
        }, 1000);
        break;
      }
      
      case 'show-preview-recommendations':
      case 'continue-preview':
      case 'maybe-later': {
        // Generate simplified agent recommendations for preview
        generateAgentRecommendations();
        addPercyMessage(
          `👀 **Preview Mode:** Here's a taste of what's possible. For the full arsenal and competitive analysis, you'll need to unlock the complete system.`,
          [
            { id: 'unlock-now', label: '🔓 Unlock Full System', icon: '🚀', action: 'signup-for-analysis' },
            { id: 'continue-browsing', label: '🌍 Explore More', icon: '👀', action: 'continue' }
          ]
        );
        break;
      }
      
      case 'show-industry-commitment': {
        const industryData = option.data;
        addPercyMessage(
          `📊 **${industryData?.industry} INDUSTRY BENCHMARK REVEALED:**\n\n**Your Competition's Current State:**\n• Average automation level: 23% (pathetic)\n• Manual processes wasting: 31 hours/week\n• Revenue left on table: $847K annually\n• Customer acquisition cost: 340% higher than optimized businesses\n\n🎯 **Top 5% of ${industryData?.industry} companies** that use our agent system:\n• Automate 89% of repetitive tasks\n• Reduce operational costs by 67%\n• Increase customer lifetime value by 290%\n• Dominate local search rankings\n\n🔥 **The gap is widening every day.** Your competitors who implement this first will make the others irrelevant.\n\n**Which side of history do you want to be on?**`,
          [
            { 
              id: 'signup-for-analysis', 
              label: '🚀 Join the Top 5% (Free Trial)', 
              icon: '👑', 
              action: 'signup-for-analysis'
            },
            { 
              id: 'show-preview-recommendations', 
              label: '🔍 Show Preview Recommendations', 
              icon: '👀', 
              action: 'show-preview-recommendations'
            },
            { 
              id: 'final-chance', 
              label: '💤 Stay with the 95% (Continue Browsing)', 
              icon: '😴', 
              action: 'maybe-later'
            }
          ]
        );
        break;
      }
      
      case 'redirect-signup': {
        window.location.href = '/sign-up';
        break;
      }

      case 'skip': {
        // ADDED: Skip to agent selection functionality  
        addPercyMessage(
          "⚡ **SPEED MODE ACTIVATED!** You want the fast track to AI domination? Perfect! Here are our top-performing agents that are crushing it for businesses like yours:",
          [
            { id: 'go-agents', label: '🤖 View All AI Agents', icon: '🤖', action: 'navigate-agents' },
            { id: 'go-sports', label: '🏆 Sports Performance (Skill Smith)', icon: '🏆', action: 'navigate-sports' },
            { id: 'go-dashboard', label: '🎯 Launch Dashboard', icon: '🎯', action: 'navigate-dashboard' }
          ]
        );
        break;
      }

      case 'navigate-agents': {
        // ADDED: Direct navigation to agents page
        router.push('/agents?source=percy_skip');
        trackBehavior('agents_navigation', { 
          source: 'percy_skip',
          conversationLength: onboardingState.conversationHistory.length 
        });
        break;
      }

      case 'navigate-sports': {
        // ADDED: Direct navigation to sports page  
        router.push('/sports?source=percy_onboarding');
        trackBehavior('sports_navigation', { 
          source: 'percy_onboarding',
          conversationLength: onboardingState.conversationHistory.length 
        });
        break;
      }

      case 'navigate-dashboard': {
        // ADDED: Direct navigation to dashboard
        router.push('/dashboard?source=percy_skip');
        trackBehavior('dashboard_navigation', { 
          source: 'percy_skip',
          conversationLength: onboardingState.conversationHistory.length 
        });
        break;
      }

      default: {
        console.log('Unknown action:', option.action);
      }
    }
  }, [onboardingState, addPercyMessage, addUserMessage, generateAgentRecommendations, navigateToDashboard, saveOnboardingComplete, router, trackBehavior]);

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
      
      // Check if user is logged in for full details
      const currentUser = await getCurrentUser();
      const isLoggedIn = !!currentUser;
      
      const summaryMessage = isLoggedIn 
        ? `✨ Scan complete! I analyzed your ${scanType === 'website' ? 'website' : scanType === 'linkedin' ? 'LinkedIn profile' : 'YouTube content'} and discovered:

🎯 **Business Type**: ${analysis.businessType}
🏢 **Industry**: ${analysis.industry}
${analysis.keyFeatures?.length ? `⭐ **Key Features**: ${analysis.keyFeatures.slice(0, 3).join(', ')}` : ''}

Based on this analysis, here are my cosmic recommendations:`
        : `🔥 **COMPETITIVE INTELLIGENCE REPORT:** Your ${analysis.industry} competitors are about to be shocked.

**Quick Scan Results:**
🎯 Business: ${analysis.businessType}
📊 Industry: ${analysis.industry}
⚡ Automation Potential: **EXTREME**

🚨 **I've detected 3 critical blind spots** in your competitive landscape. Companies implementing these specific automations are seeing 340% revenue increases within 90 days.

**But I need to verify you're serious about eliminating your competition.**`;

      const actionOptions = isLoggedIn 
        ? result.agentRecommendations.slice(0, 3).map((rec: any) => ({
            id: rec.agentId,
            label: `Activate ${rec.superheroName}`,
            icon: '⚡',
            action: 'select-agent',
            data: { agentId: rec.agentId }
          }))
        : [
            {
              id: 'signup-for-analysis',
              label: '🚀 I\'m Ready to Dominate (Free Access)',
              icon: '⚡',
              action: 'signup-for-analysis'
            },
            {
              id: 'show-industry-commitment',
              label: `📊 Show ${analysis.industry} Benchmark First`,
              icon: '🎯',
              action: 'show-industry-commitment',
              data: { industry: analysis.industry, businessType: analysis.businessType }
            },
            {
              id: 'maybe-later',
              label: '💤 Maybe Later (Stay Behind Competition)',
              icon: '😴',
              action: 'maybe-later'
            }
          ];

      addPercyMessage(
        summaryMessage,
        actionOptions,
        isLoggedIn ? scanBasedRecommendations : undefined
      );
      
      // If not logged in, show teaser benefits
      if (!isLoggedIn) {
        setTimeout(() => {
          addPercyMessage(
            `🎯 **Your Full Analysis Includes:**
• Complete competitor vulnerability report
• 14-day automated domination roadmap  
• Revenue optimization opportunities ($47K+ potential)
• Custom agent team recommendations
• Industry-specific automation triggers

**Plus:** Instant access to all 14 agents in your free trial. Your competitors won't see this coming.`,
            [
              { id: 'signup-now', label: '🚀 Get Full Analysis (Free Trial)', icon: '🎯', action: 'signup' },
              { id: 'maybe-later', label: '⏭️ Continue with Preview', icon: '👀', action: 'continue-preview' }
            ]
          );
        }, 2000);
      }

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

  // ✨ NEW: Reset onboarding function
  const resetOnboarding = useCallback(() => {
    // Reset all state
    setOnboardingState({
      currentStep: 'greeting',
      conversationHistory: []
    });
    setInputValue('');
    setIsLoading(false);
    setIsScanning(false);
    setIsMinimized(false);
    setPercyState('idle');
    setUserEngagementLevel(0);
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('percyOnboardingState');
      localStorage.removeItem('onboardingComplete');
      localStorage.removeItem('userGoal');
      localStorage.removeItem('recommendedAgents');
    }
    
    // Track reset for analytics
    if (session?.user?.id) {
      trackBehavior('percy_onboarding_reset', { 
        source: 'conversational_onboarding',
        previousStep: onboardingState.currentStep,
        conversationLength: onboardingState.conversationHistory.length
      });
    }
    
    // Add fresh greeting message
    setTimeout(() => {
      addPercyMessage(
        `✨ **FRESH START ACTIVATED!** I'm Percy, your cosmic concierge, and I just cleared my memory banks. Ready to dominate your industry with a clean slate? Let's find you the perfect AI advantage!`,
        [
          { id: 'start', label: "Let's crush the competition! 🚀", icon: '🚀', action: 'start' },
          { id: 'learn', label: "Show me your AI capabilities 🤖", icon: '🤖', action: 'learn' },
          { id: 'skip', label: "Take me straight to the agents ⚡", icon: '⚡', action: 'skip' }
        ]
      );
    }, 500);
    
    toast.success('🔄 Percy reset! Ready for a fresh start!', { 
      icon: '✨',
      duration: 3000 
    });
  }, [onboardingState.currentStep, onboardingState.conversationHistory.length, session, trackBehavior, addPercyMessage]);

  return (
    <div className="w-full max-w-6xl mx-auto relative" data-percy-onboarding>
  {/* Gradient Glow Background */}
  <div
    aria-hidden="true"
    className="absolute inset-0 z-0 pointer-events-none select-none bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-purple-500/30 blur-2xl opacity-75 rounded-2xl"
    style={{ filter: 'blur(48px)' }}
  />
      {/* AI Concierge Header Section with Percy Figure */}
      <div className="text-center mb-8">
        <div className="flex flex-col items-center justify-center space-y-4">

          
          <h2 className="text-3xl font-bold text-white">
            Meet Percy, Your Cosmic AI Concierge
          </h2>
          <p className="text-cyan-400 text-lg">
            Your gateway to intelligent automation built by the Agent League
          </p>
        </div>
      </div>

      {/* Chat Interface - Moved up to fill the space */}
      <div className="bg-gray-900/50 backdrop-blur-lg rounded-2xl border border-cyan-500/30 shadow-2xl p-6">
        <div className="flex flex-col h-96">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur-md p-4 rounded-t-2xl border-b border-cyan-400/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <PercyAvatar 
                  className="w-10 h-10"
                />
                <div>
                  <h3 className="text-white font-bold">Percy AI</h3>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-cyan-400">IQ: {intelligenceScore}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-green-400 capitalize">{percyState}</span>
                    {isTyping && <span className="text-yellow-400">• Thinking...</span>}
                  </div>
                </div>
              </div>
              {/* ADDED: Reset button for conversational onboarding */}
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={resetOnboarding}
                  className="flex items-center gap-1 px-3 py-1 bg-orange-500/20 hover:bg-orange-500/30 rounded-lg border border-orange-500/30 text-orange-400 hover:text-orange-300 transition-all text-xs font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Reset conversation and start over"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset
                </motion.button>
                {isMinimized && (
                  <motion.button
                    onClick={() => setIsMinimized(false)}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Zap className="w-5 h-5" />
                  </motion.button>
                )}
              </div>
            </div>
          </div>
          {/* Messages Area */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-black/20 rounded-xl border border-gray-700/50"
          >
            {onboardingState.conversationHistory.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8 relative"
              >

                
                <h3 className="text-xl font-bold text-white mt-4 mb-2 flex items-center justify-center gap-2">
                  Hey, I'm Percy! 👋
                  {conversionScore > 70 && (
                    <span className="text-xs bg-gradient-to-r from-orange-400 to-red-500 px-2 py-1 rounded-full">
                      🔥 HOT PROSPECT
                    </span>
                  )}
                </h3>
                
                <p className="text-gray-300 mb-2">
                  {percyState === 'analyzing' ? '🧠 Analyzing your competitive landscape...' :
                   percyState === 'thinking' ? '💭 Processing market opportunities...' :
                   percyState === 'celebrating' ? '🎉 Success pattern detected!' :
                   'Your gateway to intelligent automation built by the League'}
                </p>
                
                <div className="flex items-center justify-center gap-4 text-xs text-gray-400 mb-4">
                  <span>IQ: {intelligenceScore}</span>
                  <span>•</span>
                  <span>{conversationPhase} mode</span>
                  <span>•</span>
                  <span>Score: {conversionScore}</span>
                </div>
                
                <p className="text-cyan-400 text-sm">
                  {competitiveInsights.length > 0 
                    ? `⚡ ${competitiveInsights[0]}`
                    : conversionScore > 50 
                      ? "Ready to outmaneuver your competition? Let's identify their blind spots."
                      : "What business challenge can we destroy together?"
                  }
                </p>
              </motion.div>
            )}

            <AnimatePresence>
              {onboardingState.conversationHistory.map((message: Message, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className={`
                      rounded-2xl p-4 relative
                      ${message.type === 'user' 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                        : message.metadata?.competitiveMode
                          ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-400/30 text-white'
                          : 'bg-white/10 text-white border border-white/20'
                      }
                    `}>
                      {/* Intelligence badge for competitive messages */}
                      {message.metadata?.competitiveMode && (
                        <div className="absolute -top-2 -left-2 bg-orange-400 text-black text-xs px-2 py-1 rounded-full font-bold">
                          🎯 COMPETITIVE
                        </div>
                      )}
                      
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      
                      {/* Intelligence metadata for Percy messages */}
                      {message.type === 'percy' && message.metadata && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>Intelligence: {message.metadata.intelligenceScore}</span>
                            <span className={`px-2 py-1 rounded-full ${
                              message.metadata.conversationPhase === 'aggressive' ? 'bg-red-500/20 text-red-300' :
                              message.metadata.conversationPhase === 'persuasive' ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-teal-500/20 text-teal-300'
                            }`}>
                              {message.metadata.conversationPhase} mode
                            </span>
                          </div>
                                                     {(message.metadata.conversionScore || 0) > 50 && (
                             <div className="text-xs text-green-300 mt-1">
                               🎯 High conversion potential: {message.metadata.conversionScore}%
                             </div>
                           )}
                        </div>
                      )}
                    </div>

                    {/* Agent Recommendations */}
                    {message.agentRecommendations && message.agentRecommendations.length > 0 && (
                      <div className="mt-3 space-y-3">
                        {message.agentRecommendations.map((rec: AgentRecommendation) => (
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
                        {message.options.map((option: Option) => (
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
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' as const }}
                  />
                  <span className="text-teal-300 text-sm">Cosmic scan in progress…</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-700">
            <form onSubmit={handleTextSubmit} className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onPaste={handlePaste}
                onDrop={handleDrop}
                placeholder="Type your message..."
                className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-electric-blue"
                data-percy-input
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="bg-electric-blue hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Send message"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Agent Preview Section */}
      <div className="mt-8">
        <AgentPreviewSection />
      </div>

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
              transition={{ duration: 0.8, ease: 'easeOut' as const }}
            />
          ))}
        </motion.div>
      )}

      {/* Floating Percy interface at the end */}
      {showFloatingChat && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed bottom-4 right-4 z-50"
        >
          {/* Floating Percy content */}
          {/* Add your floating Percy content here */}
        </motion.div>
      )}
    </div>
  );
}

// ✨ NEW: Integrated FloatingPercy functionality
export function IntegratedFloatingPercy() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'assistant' | 'user'; content: string }>>([
    { role: 'assistant', content: 'Hi! I\'m Percy, your AI assistant. How can I help you today?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const { generateSmartResponse, trackBehavior, conversionScore, conversationPhase } = usePercyContext();
  const { session } = useAuth();
  const pathname = usePathname();

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    setMessages(prev => [...prev, { role: 'user', content: inputValue }]);
    setInputValue('');

    // Generate response
    setTimeout(() => {
      const responses = [
        "I can help you with that! Would you like me to connect you with one of our specialized AI agents?",
        "Great question! Based on your needs, I'd recommend checking out our agent capabilities.",
        "Let me analyze that for you. I can provide insights or connect you with the right agent for your specific needs."
      ];
      const response = responses[Math.floor(Math.random() * responses.length)];
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-gray-900/95 backdrop-blur-lg border border-cyan-500/30 rounded-2xl w-80 mb-4 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-cyan-500/20">
              <div className="flex items-center space-x-3">
                <PercyAvatar size="sm" />
                <div>
                  <h3 className="text-white font-medium">Percy Assistant</h3>
                  <p className="text-xs text-cyan-300">Your AI Concierge</p>
                </div>
              </div>
              <button onClick={toggleOpen} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="h-64 overflow-y-auto p-4 space-y-3">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-cyan-600 text-white' 
                      : 'bg-white/10 text-white border border-white/20'
                  }`}>
                    {message.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-cyan-500/20">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                  type="submit"
                  className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-500"
                >
                  ✈
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        onClick={toggleOpen}
        className={`${isOpen ? 'bg-white/10' : 'bg-gradient-to-r from-cyan-500 to-blue-600'} rounded-full p-3 shadow-lg hover:shadow-xl transition-all`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <PercyAvatar size="sm" />
        )}
        
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></span>
        )}
      </motion.button>
    </div>
  );
}
