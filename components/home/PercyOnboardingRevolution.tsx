'use client';

/**
 * 🚨 DEPRECATED COMPONENT - LEGACY PERCY v1
 * 
 * ⚠️  WARNING: This is the old 2,827-line Percy component with performance issues
 * ⚠️  Known Issues:
 *     - 25+ useState hooks causing excessive re-renders
 *     - Multiple unmanaged intervals causing CPU overheating
 *     - Heavy animations causing frame drops
 * 
 * 🔄 MIGRATION PLAN:
 *     - Archived copy: components/percy/archive/PercyOnboardingRevolution_LEGACY_v1.tsx
 *     - New optimized version: components/percy/PercyContainer.tsx
 *     - Toggle flag: lib/config/percyFeatureFlags.ts -> USE_OPTIMIZED_PERCY
 * 
 * 📅 DEPRECATION TIMELINE:
 *     - Phase 1: Mark as deprecated (current)
 *     - Phase 2: Enable optimized version by default
 *     - Phase 3: Remove legacy code (with approval)
 * 
 * 🚀 TO SWITCH TO OPTIMIZED VERSION:
 *     Set PERCY_FEATURE_FLAGS.USE_OPTIMIZED_PERCY = true in percyFeatureFlags.ts
 */

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { showPerformanceWarning } from '../../lib/config/percyFeatureFlags';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
// Import only the Lucide icons actively used in the UI
import { 
  Sparkles, ArrowRight, Target, TrendingUp, RotateCcw, Send,
  BarChart3, Rocket, BookOpen, Zap, Palette, Trophy,
  Globe, Users, DollarSign, Settings, MessageCircle, LayoutDashboard,
  CornerUpLeft, Eye, Star, Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePercyContext } from '../assistant/PercyProvider';
import { useOnboarding } from '../../contexts/OnboardingContext';
import toast from 'react-hot-toast';
import SkrblAiText from '../ui/SkrblAiText';
import UniversalPromptBar from '../ui/UniversalPromptBar';
import PercyAvatar from './PercyAvatar';
import StatCounter from '../features/StatCounter';
import FounderDashboardOverlay from '../admin/FounderDashboardOverlay';
import ChoiceCard from '../ui/ChoiceCard';

interface OnboardingStep {
  id: string;
  type: 'greeting' | 'instant-analysis' | 'goal-selection' | 'signup' | 'email-verification' | 'welcome' | 'farewell' | 'custom-needs' | 'percy-diagnosis' | 'quick-wins' | 'agent-launch' | 'conversational-flow' | 'scanning' | 'results' | 'agent-handoff' | 'input' | 'thinking';
  percyMessage: string;
  options?: { id: string; label: string; icon: React.ReactNode; action: string; data?: any }[];
  showInput?: boolean;
  inputType?: 'email' | 'text' | 'password' | 'url' | 'vip-code' | 'phone' | 'sms-code' | 'file';
  inputPlaceholder?: string;
  showSkip?: boolean;
  analysisMode?: 'website' | 'business' | 'linkedin' | 'sports' | 'content' | 'book-publishing' | 'custom';
  vipCodeEntry?: boolean;
  diagnosisType?: 'seo' | 'business' | 'content' | 'brand' | 'sports' | 'book' | 'custom';
  quickWins?: Array<{
    title: string;
    description: string;
    roi: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  suggestedAgent?: {
    id: string;
    name: string;
    description: string;
    route: string;
  };
  flowType?: 'seo' | 'content' | 'book' | 'business' | 'brand' | 'fitness' | 'custom' | 'signup' | 'code' | 'dashboard';
  scanningMessage?: string;
  resultsFeedback?: string[];
  handoffOptions?: Array<{
    id: string;
    label: string;
    icon: React.ReactNode;
    action: string;
    route?: string;
    modal?: string;
    data?: any;
  }>;
  showProgress?: boolean;
  dynamicContent?: boolean;
}

// Removed legacy VIP_CODES constant – we now validate codes on-the-fly inside validateVIPCode

// --- Percy Onboarding Revolution with Animated Intro & Container Pulse ---

const introMessages = [
  "Percy here—ready to guide you to victory! 🚀",
  "Percy here—ready to guide you to automation! ⚡",
  "Percy here—ready to guide you to dominance! 👑",
  "Percy here—ready to guide you to launch! 🌟"
];

// Type for competitive analysis result
interface AnalysisResults {
  mode: string;
  input: string;
  insights: string[];
}

export default function PercyOnboardingRevolution() {
  // 🚨 DEPRECATED: Show performance warning for legacy component
  useEffect(() => {
    showPerformanceWarning();
  }, []);
  
  const router = useRouter();
  // NEW: Use the auth context to check verification status
  const { user, session, isEmailVerified, shouldShowOnboarding /* TODO: REVIEW UNUSED */, setOnboardingComplete /* TODO: REVIEW UNUSED */ } = useAuth();
  const { trackBehavior, setIsOnboardingActive } = usePercyContext();
  
  // Use centralized onboarding context instead of local state
  const { 
    currentStep, 
    setCurrentStep, 
    inputValue, 
    setInputValue, 
    handleUserChoice, 
    handleInputSubmit,
    promptBarValue,
    setPromptBarValue,
    handlePromptBarSubmit,
    isPercyThinking,
    analysisResults,
    userAnalysisAgent,
    isVIPUser,
    vipTier,
    phoneVerified,
    // Enhanced Free Scan Logic from Context
    handleBusinessAnalysis,
    analysisIntent,
    setAnalysisIntent,
    freeAnalysisResults,
    recommendedAgents,
    isProcessingAnalysis,
    // Navigation and routing from Context
    handleLaunch,
    handleAgentChat,
    handleContinue,
    validateAndRoute,
    // Enhanced Percy Concierge Features from Context
    percyMood,
    setPercyMood,
    userHistory,
    contextualSuggestions,
    updateContextualSuggestions,
    track
  } = useOnboarding();
  
  // Keep only UI-specific local state
  const [showFloatingWidget, setShowFloatingWidget] = useState(false);
  const [userGoal, setUserGoal] = useState('');
  const [userInput, setUserInput] = useState<string>('');

  // Founder Dashboard state
  const [showFounderDashboard, setShowFounderDashboard] = useState(false);

  // Demo Mode Infrastructure
  const [demoActive, setDemoActive] = useState(false);
  const [demoTargetAgent, setDemoTargetAgent] = useState<string | null>(null);
  const [demoStep, setDemoStep] = useState<'idle' | 'selecting' | 'handoff' | 'workflow'>('idle');

  // UI-only state (business logic moved to context)
  const [currentSocialProof, setCurrentSocialProof] = useState<{ message: string } | null>(null);
  const [promptBarLoading, setPromptBarLoading] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [pulseActive, setPulseActive] = useState(true);
  const [scanIntent, setScanIntent] = useState<string>(''); // UI state for scan detection
  
  // Constants for dynamic messaging
  const businessesTransformed = 47213;
  const intelligenceScore = 247;

  // Use centralized choice handler from context
  // The handleUserChoice is now provided by useOnboarding()
  
  // Enhanced feedback states (UI only)
  const [lastInteractionType, setLastInteractionType] = useState<string>('');
  const [userReturnVisit, setUserReturnVisit] = useState(false);
  const [personalizedGreeting, setPersonalizedGreeting] = useState('');
  const [socialProofMessages, setSocialProofMessages] = useState<any[]>([]);
  const [competitiveInsights, setCompetitiveInsights] = useState<string[]>([]);
  const [dashboardIntent, setDashboardIntent] = useState(false);

  // Fix: define promptBarRef for the new integrated prompt bar
  const promptBarRef = useRef<HTMLInputElement>(null);
  // promptBarValue and setPromptBarValue now come from context
  
  // [FEATURE] Add state for 'Coming Soon' modal
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [comingSoonOption, setComingSoonOption] = useState<OnboardingOption | null>(null);

  // List of agent actions that map to /services/[agent]
  const AGENT_ACTIONS: Record<string, string> = {
    'instant-website-analysis': 'seo-agent',
    'instant-content-analysis': 'content-automation',
    'instant-book-analysis': 'book-publishing',
    'instant-business-analysis': 'biz-agent',
    'instant-linkedin-analysis': 'branding',
    'sports-routing': 'skillsmith',
  };

  // Handle any interaction function with enhanced mood changes
  const handleAnyInteraction = useCallback((interactionType: string = 'general') => {
    if (!userInteracted) {
      setUserInteracted(true);
        setPercyMood('confident'); // Percy nods when user first interacts
      setTimeout(() => setPercyMood('excited'), 1500);
    }
    setPulseActive(false);
    setLastInteractionType(interactionType);
    
    // Add subtle mood changes based on interaction type
    if (interactionType === 'option_click') {
      setPercyMood('analyzing');
      setTimeout(() => setPercyMood('confident'), 1000);
    } else if (interactionType === 'input_focus') {
      setPercyMood('scanning');
    } else if (interactionType === 'successful_action') {
      setPercyMood('celebrating');
      setTimeout(() => setPercyMood('excited'), 2000);
    }
    
    // Interaction tracking for analytics
  }, [userInteracted]);

  // Typewriter effect for prompt bar
  
  const [promptBarFocused, setPromptBarFocused] = useState(false);
  const [promptBarActive, setPromptBarActive] = useState(false);
  // New: dynamic placeholder for the integrated prompt bar
  const [promptBarPlaceholder, setPromptBarPlaceholder] = useState<string>('Need something else? Ask Percy...');

  // Debounced prompt bar handler
  const debouncedPromptBarValue = useMemo(() => {
    const timeoutId = setTimeout(() => {
      return promptBarValue;
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [promptBarValue]);

  // Helper: convert old /services routes to /agents and append track
  const toAgentRouteWithTrack = useCallback((route?: string) => {
    if (!route || typeof route !== 'string') return route;
    if (!route.startsWith('/services/')) return route;
    const swapped = route.replace('/services/', '/agents/');
    const sep = swapped.includes('?') ? '&' : '?';
    return `${swapped}${sep}track=${track || 'business'}`;
  }, [track]);

  const chatRef = useRef<HTMLDivElement>(null);
  

  // --- Animated Intro Message State ---
  const [introIdx, setIntroIdx] = useState(0);
  const [typedText, setTypedText] = useState('');

  // Enhanced initialization with personalization
  useEffect(() => {
    // Activate Percy onboarding on homepage
    setIsOnboardingActive(true);
    
    // Check for dashboard intent from URL
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    const scanAction = urlParams.get('scan');
    
    if (action === 'dashboard') {
      setDashboardIntent(true);
      setPromptBarPlaceholder('Enter your email to access dashboard...');
      // Dashboard intent from navbar
    }
    
    // Check for scan intent (from agent cards)
    if (scanAction) {
      setScanIntent(scanAction);
      setCurrentStep('business-input-collection');
      setPercyMood('excited');
      // Scan intent from agent card
    }
    
    // Check if returning user
    const hasVisited = localStorage.getItem('percy_visited');
    const userName = localStorage.getItem('user_name') || (user?.email?.split('@')[0]);
    
    if (hasVisited && userName) {
      setUserReturnVisit(true);
      setPersonalizedGreeting(`Welcome back, ${userName}! 👋`);
              setPercyMood('celebrating');
      // Show celebratory animation for returning users
      setTimeout(() => setPercyMood('celebrating'), 2000);
      setTimeout(() => setPercyMood('excited'), 4000);
    } else if (user && userName) {
      setPersonalizedGreeting(`Hey ${userName}! Great to meet you! 🚀`);
      setPercyMood('excited');
    }
    
    // Mark as visited
    localStorage.setItem('percy_visited', 'true');
    if (userName) {
      localStorage.setItem('user_name', userName);
    }
  }, [setIsOnboardingActive, user]);

  // Typewriter/cycling effect for intro messages
  useEffect(() => {
    if (userInteracted) return;
    setTypedText('');
    let idx = 0;
    let timeout: ReturnType<typeof setTimeout>;
    function typeChar() {
      const msg = introMessages[introIdx];
      if (idx < msg.length) {
        setTypedText(msg.slice(0, idx + 1));
        idx++;
        timeout = setTimeout(typeChar, 28);
      } else {
        // After message, wait, then cycle
        timeout = setTimeout(() => {
          setIntroIdx((prev: number) => (prev + 1) % introMessages.length);
        }, 1400);
      }
    }
    typeChar();
    return () => clearTimeout(timeout);
  }, [introIdx, userInteracted]);

  // Pulse highlight after a short delay
  useEffect(() => {
    if (userInteracted) return;
    const t = setTimeout(() => setPulseActive(true), 2000);
    return () => clearTimeout(t);
  }, [userInteracted]);

  // VIP validation moved to OnboardingContext

  const onboardingSteps: Record<string, OnboardingStep> = {
    greeting: {
      id: 'greeting',
      type: 'greeting',
      percyMessage: `**Welcome to the revolution!** I'm Percy, your cosmic concierge and architect of digital dominance. I've transformed **${businessesTransformed.toLocaleString()}** businesses this quarter alone - making their competition completely irrelevant.\n\n**Here's what I do**: I analyze your business, deploy the perfect AI agent army, and watch your competitors scramble to catch up. \n\n**So, tell me - what brings you to me today? You must be ready to WIN since you're here!**`,
      options: [
        { id: 'website-scan', label: 'Dominate SEO', icon: <BarChart3 className="w-8 h-8" />, action: 'instant-website-analysis' },
        { id: 'content-creator', label: 'Create Content', icon: <Palette className="w-8 h-8" />, action: 'instant-content-analysis' },
        { id: 'book-publisher', label: 'Publish a Book', icon: <BookOpen className="w-8 h-8" />, action: 'instant-book-analysis' },
        { id: 'business-strategy', label: 'Automate My Biz', icon: <Zap className="w-8 h-8" />, action: 'instant-business-analysis' },
        { id: 'linkedin-profile', label: 'Upgrade My Brand', icon: <Users className="w-8 h-8" />, action: 'instant-linkedin-analysis' },
        { id: 'sports-analysis', label: 'Get Fit', icon: <Trophy className="w-8 h-8" />, action: 'sports-routing' },
        { id: 'custom-needs', label: 'Something Else', icon: <MessageCircle className="w-8 h-8" />, action: 'custom-needs-analysis' },
        { id: 'signup', label: 'Sign Up', icon: <Rocket className="w-8 h-8" />, action: 'signup' },
        { id: 'have-code', label: 'Have a Code?', icon: <Settings className="w-8 h-8" />, action: 'have-code' },
        { id: 'my-dashboard', label: 'My Dashboard', icon: <LayoutDashboard className="w-8 h-8" />, action: 'my-dashboard' }
      ]
    },
    'instant-website-analysis': {
      id: 'instant-website-analysis',
      type: 'instant-analysis',
      percyMessage: `🌐 **WEBSITE DOMINATION MODE ACTIVATED!**\n\nI'm about to scan your website with the same intelligence that's helped **${Math.floor(businessesTransformed/10)}** businesses crush their competition online.\n\n**Enter your website URL and watch me work my magic:**\n\n⚡ **What I'll analyze in 15 seconds:**\n• SEO competitive gaps your rivals are missing\n• Conversion killers that are costing you revenue\n• Content opportunities that'll make you #1\n• Technical advantages that'll leave competitors behind`,
      showInput: true,
      inputType: 'url',
      inputPlaceholder: 'https://your-website.com',
      analysisMode: 'website'
    },
    'instant-business-analysis': {
      id: 'instant-business-analysis',
      type: 'instant-analysis',
      percyMessage: `🏢 **BUSINESS STRATEGY INTELLIGENCE ACTIVATED!**\n\nI'm about to deploy the same strategic analysis that's generated **$18.5M** in competitive advantages this month.\n\n**Tell me about your business and I'll show you exactly how to dominate:**\n\n🎯 **What I'll reveal:**\n• Hidden market opportunities your competitors don't see\n• AI automation strategies that'll 10x your efficiency\n• Revenue streams they can't compete with\n• The exact agents that'll make you unstoppable`,
      showInput: true,
      inputType: 'text',
      inputPlaceholder: 'Describe your business, industry, or main challenges...',
      analysisMode: 'business'
    },
    'instant-linkedin-analysis': {
      id: 'instant-linkedin-analysis',
      type: 'instant-analysis',
      percyMessage: `💼 **PROFESSIONAL DOMINATION SCANNER ACTIVE!**\n\nI'm about to optimize your professional presence with intelligence that's made **2,847** professionals industry leaders.\n\n**Share your LinkedIn profile and watch the magic:**\n\n📈 **Personal Brand Analysis:**\n• Content strategy that positions you as THE expert\n• Network expansion tactics your competition won't think of\n• Authority-building roadmap that makes you irresistible\n• Professional presence that opens every door`,
      showInput: true,
      inputType: 'url',
      inputPlaceholder: 'https://linkedin.com/in/your-profile',
      analysisMode: 'linkedin'
    },
    'instant-content-analysis': {
      id: 'instant-content-analysis',
      type: 'instant-analysis',
      percyMessage: `✍️ **CONTENT CREATION DOMINATION MODE ACTIVATED!**\n\nPerfect! I've helped **${Math.floor(businessesTransformed/8)}** content creators completely outclass their competition and build massive audiences.\n\n**Tell me about your content goals and I'll show you how to become THE authority:**\n\n🎯 **What I'll analyze:**\n• Content gaps your audience is craving\n• Viral content strategies your competitors don't know\n• Monetization opportunities they're missing\n• AI automation that'll 10x your output`,
      showInput: true,
      inputType: 'text',
      inputPlaceholder: 'What type of content do you create? (blogs, videos, social media, etc.)',
      analysisMode: 'content'
    },
    'instant-book-analysis': {
      id: 'instant-book-analysis',
      type: 'instant-analysis',
      percyMessage: `📚 **BOOK PUBLISHING EMPIRE MODE ACTIVATED!**\n\nExcellent! I've helped **${Math.floor(businessesTransformed/12)}** authors and publishers dominate their markets and build bestselling machines.\n\n**Share your book/publishing goals and I'll reveal your path to authority:**\n\n✨ **Publishing Intelligence I'll provide:**\n• Market positioning that makes you THE expert\n• Content strategies that sell books before they're written\n• Author platform automation that builds massive followings\n• Publishing workflows that turn ideas into revenue`,
      showInput: true,
      inputType: 'text',
      inputPlaceholder: 'Tell me about your book project, genre, or publishing goals...',
      analysisMode: 'book-publishing'
    },
    'custom-needs-analysis': {
      id: 'custom-needs-analysis',
      type: 'custom-needs',
      percyMessage: `🎤 **CUSTOM INTELLIGENCE MODE - I'M LISTENING!**\n\nBrilliant! This is exactly why I have an IQ of ${intelligenceScore} - I can adapt to ANY challenge and find competitive advantages others miss.\n\n**Tell me exactly what you need and I'll analyze how our AI agent army can give you an unfair advantage:**\n\n💡 **Whatever you're doing, I can help you:**\n• Automate the tedious stuff\n• Outthink your competition\n• Scale beyond human limitations\n• Generate revenue while you sleep\n\n**What's your challenge? Don't hold back - I've seen it all!**`,
      showInput: true,
      inputType: 'text',
      inputPlaceholder: 'Describe your business, goals, challenges, or what you need help with...',
      analysisMode: 'custom'
    },
    'sports-routing': {
      id: 'sports-routing',
      type: 'instant-analysis',
      percyMessage: `🏆 **SPORTS PERFORMANCE INTELLIGENCE DETECTED!**\n\nAh, developing the next champion? Perfect! Let me connect you with **Skill Smith** - our sports genius who's probably analyzed more athletic performance than a stats nerd at the Olympics!\n\n🎯 **Skill Smith specializes in:**\n• Sports Psychology & Mental Game\n• Performance Analytics & Form Analysis\n• Nutrition & Training Optimization\n• Video Analysis & Improvement Plans\n\n**He's waiting for you in our Sports Universe with file upload capabilities for swing analysis, form checks, and performance reviews.**`,
      options: [
        { id: 'go-sports', label: '🏃‍♂️ Take me to Skill Smith!', icon: '🏆', action: 'route-to-sports' },
        { id: 'stay-business', label: '🏢 Actually, let\'s focus on business', icon: '💼', action: 'back-to-business' }
      ]
    },

    'goal-selection': {
      id: 'goal-selection',
      type: 'goal-selection',
      percyMessage: `🎯 **BRILLIANT!** You're about to join the **elite 5%** who move fast while competitors hesitate.\n\n**Based on your analysis, here are the AI agents that'll crush your specific competition:**`,
      options: [
        { id: 'content', label: '📝 Content that converts customers automatically', icon: '✍️', action: 'select-goal', data: { goal: 'content-domination' } },
        { id: 'leads', label: '🎯 Lead generation that never sleeps', icon: '📈', action: 'select-goal', data: { goal: 'lead-machine' } },
        { id: 'branding', label: '🎨 Brand that makes competitors look amateur', icon: '👑', action: 'select-goal', data: { goal: 'brand-domination' } },
        { id: 'automation', label: '⚡ Complete business automation', icon: '🤖', action: 'select-goal', data: { goal: 'automation-empire' } }
      ]
    },
    signup: {
      id: 'signup',
      type: 'signup',
      percyMessage: `🚀 **PERFECT CHOICE!** I've seen **${Math.floor(Math.random() * 50) + 200}** businesses succeed with this exact strategy.\n\n**Let's get you set up for domination**. I need your email to:\n✅ Deploy your personalized AI agent team\n✅ Send you competitor intelligence reports\n✅ Track your progress toward industry leadership\n\n*Your email stays private and I'll never spam you. I'm too smart for that.*`,
      showInput: true,
      inputType: 'email',
      inputPlaceholder: 'your.email@company.com',
      options: [
        { id: 'vip-code', label: '👑 I have a VIP access code', icon: '🔑', action: 'vip-code-entry' }
      ]
    },
    'vip-code-entry': {
      id: 'vip-code-entry',
      type: 'signup',
      percyMessage: `👑 **VIP ACCESS DETECTED!** You're clearly someone who recognizes excellence when you see it.\n\n🔑 **Enter your VIP code** and I'll unlock your white-glove treatment:\n✨ Priority agent deployment\n🎯 Exclusive competitive intelligence\n👑 VIP-only features and insights\n🚀 Direct line to our success team\n\n**This is how champions are made. Enter your code below:**`,
      showInput: true,
      inputType: 'vip-code',
      inputPlaceholder: 'SKRBL-VIP-CODE-HERE',
      vipCodeEntry: true,
      options: [
        { id: 'back-regular', label: '← Back to regular signup', icon: '👤', action: 'back-to-signup' }
      ]
    },
    'phone-entry': {
      id: 'phone-entry',
      type: 'signup',
      percyMessage: `📱 **SECURE YOUR ACCOUNT & UNLOCK SMS UPDATES!**\n\nEnter your mobile number and I'll text you a 6-digit code. I use this to send instant performance alerts and VIP updates – no spam, just domination.`,
      showInput: true,
      inputType: 'phone',
      inputPlaceholder: '+1 555-123-4567'
    },
    'code-entry': {
      id: 'code-entry',
      type: 'signup',
      percyMessage: `🔐 **CODE SENT!** Check your phone and enter the 6-digit code below.`,
      showInput: true,
      inputType: 'sms-code',
      inputPlaceholder: '123456'
    },
    'vip-welcome': {
      id: 'vip-welcome',
      type: 'welcome',
      percyMessage: `🏆 **VIP STATUS CONFIRMED!** Welcome to the **${vipTier?.toUpperCase()} TIER** - the absolute elite.\n\n👑 **Your VIP advantages are now active:**\n${vipTier === 'diamond' ? '💎 DIAMOND: Unlimited everything + Personal AI consultant\n🎯 Priority queue (skip all waiting)\n🔥 Advanced agent abilities unlocked' : 
        vipTier === 'platinum' ? '⚡ PLATINUM: 5x faster deployment + Premium support\n🎯 Advanced analytics and insights\n🚀 Beta access to new features' :
        '🥇 GOLD: Priority support + Enhanced features\n📈 Advanced reporting dashboard\n✨ Early access to updates'}\n\n**You're now in the top 1% of SKRBL AI users. Your competition doesn't stand a chance.**`,
      options: [
        { id: 'launch-vip', label: '🚀 Launch VIP Dashboard', icon: '👑', action: 'launch-vip-dashboard' },
        { id: 'explore-vip', label: '🎯 Explore VIP Features', icon: '✨', action: 'explore-vip-features' }
      ]
    },
    'email-verification': {
      id: 'email-verification',
      type: 'email-verification',
      percyMessage: `📧 **ALMOST THERE!** I just sent a verification link to your email.\n\n🎯 **While you check your email**: I'm already analyzing your industry and preparing your competitive advantage report. This usually takes my competitors 2-3 weeks. I'll have it ready in **3 minutes**.\n\n**Click the verification link and let's make your competition irrelevant!**`,
      options: [
        { id: 'verified', label: '✅ Email verified - let\'s go!', icon: '🚀', action: 'complete-verification' },
        { id: 'resend', label: '📧 Resend verification email', icon: '🔄', action: 'resend-email' }
      ]
    },
    welcome: {
      id: 'welcome',
      type: 'welcome',
      percyMessage: `🎉 **WELCOME TO THE ELITE!** You've just joined the **${(businessesTransformed + 1).toLocaleString()}th** business to gain an AI advantage.\n\n🚀 **Your advantage is activating now**:\n✅ AI agent team deployed\n✅ Competitive intelligence scanning\n✅ Industry domination roadmap generating\n✅ Your dashboard is ready\n\n**You're now 10x ahead of competitors who are still doing things manually.**`,
      options: [
        { id: 'launch', label: '🎯 Launch my dashboard!', icon: '🚀', action: 'launch-dashboard' },
        { id: 'explore', label: '🧭 Explore agent capabilities first', icon: '🤖', action: 'explore-agents' }
      ]
    },
    farewell: {
      id: 'farewell',
      type: 'farewell',
      percyMessage: `👋 **You're all set!** Your AI advantage is live and your competition has no idea what's coming.\n\n🎯 **Remember**: I'm always here when you need me. Whether you want to add more agents, get competitive intelligence, or just need a friend who happens to have an IQ of ${intelligenceScore}...\n\n**I'll be right here in the corner**, watching your success unfold. 😉`,
      options: [
        { id: 'got-it', label: '👍 Got it, thanks Percy!', icon: '✨', action: 'activate-widget' }
      ]
    },
    
    // NEW PERCY DIAGNOSIS STEPS
    'percy-seo-diagnosis': {
      id: 'percy-seo-diagnosis',
      type: 'percy-diagnosis',
      percyMessage: `🌐 **SEO DOMINANCE SCANNER ACTIVATED!**\n\nPerfect choice! I'm about to analyze your website with intelligence that's made **${Math.floor(businessesTransformed/10)}** businesses the #1 result in their industry.\n\n**Drop your website URL and I'll show you how to crush your SEO competition:**\n\n⚡ **What I'll reveal in 15 seconds:**\n• SEO gaps your competitors haven't noticed\n• Content opportunities worth $50K+ in traffic\n• Technical advantages that Google loves\n• The exact strategy to rank #1 for your keywords`,
      showInput: true,
      inputType: 'url',
      inputPlaceholder: 'https://your-website.com',
      diagnosisType: 'seo'
    },
    
    'percy-business-diagnosis': {
      id: 'percy-business-diagnosis',
      type: 'percy-diagnosis',
      percyMessage: `🏢 **BUSINESS AUTOMATION INTELLIGENCE ACTIVATED!**\n\nExcellent! I'm about to deploy the same strategic analysis that's automated **$18.5M** worth of manual work this month.\n\n**Tell me about your business or share your website, and I'll show you exactly how to automate everything:**\n\n🎯 **What I'll uncover:**\n• Hidden automation opportunities worth 40+ hours/week\n• Revenue streams your competitors can't touch\n• Workflow optimizations that 10x your efficiency\n• The exact AI agents that'll run your business automatically`,
      showInput: true,
      inputType: 'text',
      inputPlaceholder: 'Describe your business OR paste your website URL...',
      diagnosisType: 'business'
    },
    
    'percy-content-diagnosis': {
      id: 'percy-content-diagnosis',
      type: 'percy-diagnosis',
      percyMessage: `✍️ **CONTENT CREATION DOMINATION MODE!**\n\nBrilliant! I've helped **${Math.floor(businessesTransformed/8)}** content creators build massive audiences and leave their competition posting into the void.\n\n**Share your content goals, niche, or current platform and I'll reveal your viral strategy:**\n\n🎯 **What I'll optimize:**\n• Content gaps your audience is desperately craving\n• Viral content formulas your competitors don't know\n• Monetization opportunities they're missing\n• AI automation that'll 10x your content output`,
      showInput: true,
      inputType: 'text',
      inputPlaceholder: 'What type of content do you create? (YouTube, blogs, social media, etc.)',
      diagnosisType: 'content'
    },
    
    'percy-brand-diagnosis': {
      id: 'percy-brand-diagnosis',
      type: 'percy-diagnosis',
      percyMessage: `💼 **PROFESSIONAL BRAND DOMINATION SCANNER!**\n\nPerfect timing! I'm about to optimize your professional presence with intelligence that's made **2,847** professionals the go-to expert in their field.\n\n**Share your LinkedIn profile or tell me about your brand goals:**\n\n📈 **What I'll transform:**\n• Personal brand positioning that makes you THE authority\n• Network expansion tactics your competition won't think of\n• Content strategy that positions you as indispensable\n• Professional presence that opens every door`,
      showInput: true,
      inputType: 'text',
      inputPlaceholder: 'LinkedIn URL OR describe your professional goals...',
      diagnosisType: 'brand'
    },
    
    'percy-book-diagnosis': {
      id: 'percy-book-diagnosis',
      type: 'percy-diagnosis',
      percyMessage: `📚 **BOOK PUBLISHING EMPIRE ANALYSIS!**\n\nExcellent choice! I've helped **${Math.floor(businessesTransformed/12)}** authors and publishers build bestselling machines that dominate their markets.\n\n**Tell me about your book project, genre, or publishing goals:**\n\n✨ **What I'll architect:**\n• Market positioning that makes you THE expert\n• Content strategies that sell books before they're written\n• Author platform automation that builds massive followings\n• Publishing workflows that turn ideas into consistent revenue`,
      showInput: true,
      inputType: 'text',
      inputPlaceholder: 'Describe your book project, genre, or publishing goals...',
      diagnosisType: 'book'
    },
    
    'percy-sports-diagnosis': {
      id: 'percy-sports-diagnosis',
      type: 'percy-diagnosis',
      percyMessage: `🏆 **ATHLETIC PERFORMANCE OPTIMIZATION SCAN!**\n\nGame time! I'm connecting you with our sports performance intelligence that's optimized **1,200+** athletes' training and mental game.\n\n**Tell me about your sport, current level, or specific goals:**\n\n🎯 **What I'll analyze:**\n• Performance gaps your competition hasn't identified\n• Training optimizations for maximum results\n• Mental game strategies that create champions\n• Recovery and nutrition protocols for peak performance`,
      showInput: true,
      inputType: 'text',
      inputPlaceholder: 'What sport? What\'s your current level and goals?',
      diagnosisType: 'sports'
    },
    
    'percy-custom-diagnosis': {
      id: 'percy-custom-diagnosis',
      type: 'percy-diagnosis',
      percyMessage: `🎤 **CUSTOM INTELLIGENCE MODE - I'M ALL EARS!**\n\nBrilliant! This is exactly why I have an IQ of ${intelligenceScore} - I can adapt to ANY challenge and find competitive advantages others completely miss.\n\n**Tell me exactly what you need and I'll analyze how our AI agent army can give you an unfair advantage:**\n\n💡 **Whatever you're building, I can help you:**\n• Automate the tedious manual work\n• Outthink and outmaneuver your competition\n• Scale beyond human limitations\n• Generate revenue while you sleep`,
      showInput: true,
      inputType: 'text',
      inputPlaceholder: 'Describe your challenge, business, goals, or what you need help with...',
      diagnosisType: 'custom'
    },
    
    // QUICK WINS RESULTS STEP
    'percy-quick-wins': {
      id: 'percy-quick-wins',
      type: 'quick-wins',
      percyMessage: `🔥 **DIAGNOSIS COMPLETE - COMPETITIVE ADVANTAGE IDENTIFIED!**\n\nBased on my analysis of "${analysisResults?.input}", I've identified **3 QUICK WINS** that will give you an immediate advantage over your competition:\n\n${analysisResults?.insights ? analysisResults.insights.map((insight, i) => `**${i + 1}.** ${insight}`).join('\n\n') : 'Analyzing your competitive landscape...'}\n\n**These aren't just suggestions - they're your roadmap to domination. Ready to launch the perfect AI agent for this challenge?**`,
      quickWins: [
        { title: 'Quick Win 1', description: 'High-impact optimization', roi: '+40% results', impact: 'high' },
        { title: 'Quick Win 2', description: 'Automation opportunity', roi: '+25% efficiency', impact: 'high' },
        { title: 'Quick Win 3', description: 'Competitive advantage', roi: '+60% performance', impact: 'medium' }
      ],
      suggestedAgent: {
        id: 'recommended',
        name: userAnalysisAgent || 'AI Agent',
        description: 'Perfectly matched to your specific needs',
        route: '/services/agent'
      },
      options: [
        { id: 'launch-agent', label: `🚀 Launch ${userAnalysisAgent || 'Recommended'} Agent Now!`, icon: <Rocket className="w-8 h-8" />, action: 'launch-recommended-agent' },
        { id: 'explore-agents', label: '🧭 Explore All Agents First', icon: <Users className="w-8 h-8" />, action: 'explore-all-agents' },
        { id: 'get-dashboard', label: '📊 Set Up My Dashboard', icon: <LayoutDashboard className="w-8 h-8" />, action: 'setup-dashboard' },
        { id: 'another-scan', label: '🔄 Analyze Something Else', icon: <BarChart3 className="w-8 h-8" />, action: 'back-to-greeting' }
      ]
    },
    
    // ========== NEW CONVERSATIONAL FLOW STEPS ==========
    
    // SEO DOMINATION FLOW
    'seo-flow-start': {
      id: 'seo-flow-start',
      type: 'conversational-flow',
      flowType: 'seo',
      percyMessage: `🌐 **SEO DOMINATION MODE ACTIVATED!**\n\nPerfect choice! I'm about to analyze your website with the same intelligence that's made **${Math.floor(businessesTransformed/10)}** businesses the #1 result in their industry.\n\n**Drop your website URL or tell me your business niche, and I'll show you exactly how to crush your SEO competition:**\n\n⚡ **What I'll reveal in 15 seconds:**\n• Missing backlinks that could 10x your traffic\n• Technical issues hemorrhaging your rankings\n• Content gaps your competitors are exploiting\n• The exact keywords that'll make you #1`,
      showInput: true,
      inputType: 'text',
      inputPlaceholder: 'Enter your website URL or business niche...'
    },
    
    'seo-scanning': {
      id: 'seo-scanning',
      type: 'scanning',
      flowType: 'seo',
      percyMessage: `🔍 **SCANNING YOUR SEO FOOTPRINT...**\n\nAnalyzing your website architecture...\nChecking competitor rankings...\nIdentifying keyword opportunities...\nScanning technical SEO issues...\n\n**Almost done! This is where your competition gets left behind.**`,
      scanningMessage: 'Analyzing your SEO footprint...'
    },
    
    'seo-results': {
      id: 'seo-results',
      type: 'results',
      flowType: 'seo',
      percyMessage: `🎯 **SEO ANALYSIS COMPLETE - FOUND YOUR COMPETITIVE ADVANTAGES!**\n\nHere's what I discovered about your SEO landscape:\n\n**🔴 CRITICAL ISSUES:**\n• 67% of your pages lack proper meta descriptions\n• Page speed 3.2s slower than top competitors\n• Missing 23 high-value backlink opportunities\n\n**🟢 QUICK WINS IDENTIFIED:**\n• Target "long-tail + location" keywords (zero competition)\n• Fix technical issues blocking Google crawlers\n• Implement schema markup for instant rich results\n\n**💰 POTENTIAL IMPACT:** +270% organic traffic, +$18K monthly revenue`,
      resultsFeedback: [
        'Critical technical SEO issues found',
        '23 high-value keyword opportunities identified',
        'Competitor analysis complete - gaps discovered'
      ],
      handoffOptions: [
        { id: 'get-seo-report', label: '📊 Get Free SEO Report', icon: <BarChart3 className="w-6 h-6" />, action: 'download-seo-report' },
        { id: 'chat-seo-agent', label: '💬 Chat SEO Agent', icon: <MessageCircle className="w-6 h-6" />, action: 'open-seo-chat', route: '/chat/seo-agent' },
        { id: 'launch-seo-automation', label: '🚀 Launch SEO Automation', icon: <Rocket className="w-6 h-6" />, action: 'launch-seo-agent', route: '/services/seo-agent' }
      ]
    },
    
    // CONTENT CREATION FLOW
    'content-flow-start': {
      id: 'content-flow-start',
      type: 'conversational-flow',
      flowType: 'content',
      percyMessage: `✍️ **CONTENT CREATION DOMINATION MODE!**\n\nBrilliant! I'm about to deploy the same content intelligence that's helped **${Math.floor(businessesTransformed/8)}** creators build massive audiences and leave their competition posting into the void.\n\n**What kind of content empire are we building?**\n\n🎯 **I can optimize:**\n• Blog posts that rank #1 and convert\n• Social media content that goes viral\n• Email campaigns that generate revenue\n• Video content that builds audiences\n• Any content that needs to DOMINATE`,
      showInput: true,
      inputType: 'text',
      inputPlaceholder: 'What type of content? (blog, social, email, video, etc.)'
    },
    
    'content-topic-prompt': {
      id: 'content-topic-prompt',
      type: 'conversational-flow',
      flowType: 'content',
      percyMessage: `🎬 **CONTENT TYPE LOCKED IN!**\n\nPerfect! Now let's make this content absolutely irresistible to your audience.\n\n**What's your main topic, product, or message?** The more specific you are, the more I can help you dominate this space.\n\n💡 **Examples:**\n• "AI tools for small business automation"\n• "Fitness routines for busy professionals"\n• "Real estate investing for beginners"\n• "Productivity hacks for entrepreneurs"`,
      showInput: true,
      inputType: 'text',
      inputPlaceholder: 'Tell me your topic, product, or main message...'
    },
    
    'content-results': {
      id: 'content-results',
      type: 'results',
      flowType: 'content',
      percyMessage: `🔥 **CONTENT STRATEGY GENERATED - YOUR COMPETITION WON'T SEE THIS COMING!**\n\nBased on your content goals, here's your viral content outline:\n\n**📋 CONTENT OUTLINE:**\n• Hook: "The #1 mistake everyone makes with [topic]"\n• Problem: Pain points your audience faces daily\n• Solution: Your unique approach/product\n• Proof: Social proof and success stories\n• CTA: Clear next step for engagement\n\n**🎯 VIRAL ELEMENTS:**\n• Trending hashtags for maximum reach\n• Controversy angle that sparks engagement\n• Shareable quotes and visual elements\n\n**💰 MONETIZATION HOOKS:**\n• Lead magnet integration\n• Product mention placement\n• Follow-up sequence triggers`,
      handoffOptions: [
        { id: 'see-content-demo', label: '👀 See Demo', icon: <Eye className="w-6 h-6" />, action: 'open-content-demo', modal: 'content-walkthrough' },
        { id: 'connect-contentrix', label: '💬 Connect to Contentrix', icon: <MessageCircle className="w-6 h-6" />, action: 'open-content-chat', route: '/chat/content-agent' },
        { id: 'launch-content-automation', label: '🚀 Launch Content Automation', icon: <Rocket className="w-6 h-6" />, action: 'launch-content-agent', route: '/services/content-automation' }
      ]
    },
    
    // BOOK PUBLISHING FLOW
    'book-flow-start': {
      id: 'book-flow-start',
      type: 'conversational-flow',
      flowType: 'book',
      percyMessage: `📚 **BOOK PUBLISHING EMPIRE MODE ACTIVATED!**\n\nExcellent choice! I've helped **${Math.floor(businessesTransformed/12)}** authors and publishers build bestselling machines that dominate their markets.\n\n**Let's create your publishing empire! What's your book idea?**\n\n✨ **Tell me:**\n• Your book title or main idea\n• Type: Fiction, Non-fiction, Children's, Business, Self-help, etc.\n• Your target audience\n\n**I'll generate your complete publishing roadmap, from manuscript to bestseller!**`,
      showInput: true,
      inputType: 'text',
      inputPlaceholder: 'Describe your book idea, title, and type...'
    },
    
    'book-results': {
      id: 'book-results',
      type: 'results',
      flowType: 'book',
      percyMessage: `🏆 **PUBLISHING ROADMAP GENERATED - BESTSELLER STATUS INCOMING!**\n\nYour book has serious potential! Here's your complete publishing strategy:\n\n**📖 AI PUBLISHING TEMPLATE:**\n• Chapter outline with hooks that keep readers engaged\n• Market positioning against top competitors\n• Amazon KDP optimization strategy\n• Launch sequence for maximum visibility\n\n**💰 MONETIZATION STRATEGY:**\n• Pre-launch audience building (10K potential buyers)\n• Book-to-business funnel integration\n• Speaking opportunity pipeline\n• Course/coaching upsell opportunities\n\n**🚀 QUICK START:**\n• Professional book cover concepts\n• Optimized book description\n• Category selection for easy rankings\n• Launch timeline with milestones`,
      handoffOptions: [
        { id: 'download-template', label: '📥 Download Template', icon: <BookOpen className="w-6 h-6" />, action: 'download-book-template' },
        { id: 'chat-publishing-agent', label: '💬 Chat Publishing Agent', icon: <MessageCircle className="w-6 h-6" />, action: 'open-publishing-chat', route: '/chat/book-agent' },
        { id: 'launch-book-publishing', label: '🚀 Launch Book Publishing', icon: <Rocket className="w-6 h-6" />, action: 'launch-book-agent', route: '/services/book-publishing' }
      ]
    },
    
    // BUSINESS AUTOMATION FLOW
    'business-flow-start': {
      id: 'business-flow-start',
      type: 'conversational-flow',
      flowType: 'business',
      percyMessage: `⚡ **BUSINESS AUTOMATION INTELLIGENCE ACTIVATED!**\n\nExcellent! I'm about to deploy the same automation analysis that's saved **$18.5M** worth of manual work this month alone.\n\n**What's your biggest business time-waster right now?**\n\n🎯 **Common time-wasters I eliminate:**\n• Manual lead qualification and follow-up\n• Social media posting and engagement\n• Customer support and FAQ responses\n• Data entry and reporting tasks\n• Email marketing and nurture sequences\n• Inventory management and ordering\n\n**Tell me what's eating up your time, and I'll show you exactly how to automate it!**`,
      showInput: true,
      inputType: 'text',
      inputPlaceholder: 'What\'s your biggest time-waster or manual task?'
    },
    
    'business-scanning': {
      id: 'business-scanning',
      type: 'scanning',
      flowType: 'business',
      percyMessage: `🔄 **SCANNING FOR AUTOMATION OPPORTUNITIES...**\n\nAnalyzing your workflow inefficiencies...\nIdentifying automation quick wins...\nCalculating time savings potential...\nMapping competitive advantages...\n\n**Finding the automations that'll give you 20+ hours back per week!**`,
      scanningMessage: 'Scanning for automation opportunities...'
    },
    
    'business-results': {
      id: 'business-results',
      type: 'results',
      flowType: 'business',
      percyMessage: `💼 **AUTOMATION ANALYSIS COMPLETE - MASSIVE TIME SAVINGS IDENTIFIED!**\n\nHere are the automation opportunities that'll transform your business:\n\n**⏰ TIME SAVINGS POTENTIAL:**\n• Automate lead qualification: +15 hours/week\n• Customer journey automation: +12 hours/week\n• Social media management: +8 hours/week\n• **Total weekly savings: +35 hours**\n\n**💰 REVENUE IMPACT:**\n• +320% more qualified leads\n• +250% customer conversion rate\n• +$22K additional monthly revenue\n\n**🚀 QUICK WINS:**\n• Email automation sequences\n• Lead scoring and qualification\n• Social media content scheduling\n• Customer support chatbots`,
      handoffOptions: [
        { id: 'demo-automation', label: '👀 Demo Automation', icon: <Eye className="w-6 h-6" />, action: 'open-automation-demo', modal: 'automation-walkthrough' },
        { id: 'chat-bizwiz', label: '💬 Chat BizWiz', icon: <MessageCircle className="w-6 h-6" />, action: 'open-business-chat', route: '/chat/biz-agent' },
        { id: 'see-workflow-template', label: '📋 See Workflow Template', icon: <Zap className="w-6 h-6" />, action: 'view-workflow-template', route: '/templates/business-automation' }
      ]
    },
    
    // BRAND UPGRADE FLOW
    'brand-flow-start': {
      id: 'brand-flow-start',
      type: 'conversational-flow',
      flowType: 'brand',
      percyMessage: `🎨 **BRAND UPGRADE DOMINATION MODE!**\n\nPerfect timing! I'm about to optimize your brand with intelligence that's made **2,847** professionals the go-to expert in their field.\n\n**What aspect of your brand needs an upgrade?**\n\n✨ **I can enhance:**\n• Logo design and visual identity\n• Color palette and brand guidelines\n• Website design and user experience\n• Social media presence and consistency\n• Professional headshots and imagery\n• Brand voice and messaging strategy\n\n**Upload any current brand assets or describe what you want to upgrade!**`,
      showInput: true,
      inputType: 'text',
      inputPlaceholder: 'What do you want to upgrade? (logo, colors, website, etc.)'
    },
    
    'brand-upload-prompt': {
      id: 'brand-upload-prompt',
      type: 'conversational-flow',
      flowType: 'brand',
      percyMessage: `📤 **BRAND ASSET ANALYSIS MODE!**\n\nGreat! Now let's make your brand absolutely irresistible.\n\n**Upload your current brand assets or describe your vision:**\n\n🎨 **What I can work with:**\n• Current logo files\n• Brand colors or inspiration\n• Website screenshots\n• Competitor brands you admire\n• Style preferences (modern, classic, bold, minimal)\n\n**The more details you give me, the more I can help you dominate your market visually!**`,
      showInput: true,
      inputType: 'text',
      inputPlaceholder: 'Describe your brand vision or upload current assets...'
    },
    
    'brand-results': {
      id: 'brand-results',
      type: 'results',
      flowType: 'brand',
      percyMessage: `🎯 **BRAND ANALYSIS COMPLETE - YOUR NEW IDENTITY AWAITS!**\n\nBased on your brand goals, here are the upgrades that'll make you unforgettable:\n\n**🎨 BRAND RECOMMENDATIONS:**\n• Color Psychology: Deep blue for trust + vibrant orange for energy\n• Typography: Modern sans-serif for authority and readability\n• Logo Concept: Minimalist icon with strong wordmark\n• Visual Style: Clean, professional with strategic color pops\n\n**📈 COMPETITIVE ADVANTAGES:**\n• Visual consistency across all platforms\n• Professional credibility that builds instant trust\n• Memorable brand elements that stick in minds\n• Scalable design system for future growth\n\n**💼 IMPLEMENTATION PACKAGE:**\n• Complete brand guidelines document\n• Logo variations and usage rules\n• Social media templates\n• Business card and letterhead designs`,
      handoffOptions: [
        { id: 'see-brand-kit', label: '🎨 See Brand Kit', icon: <Palette className="w-6 h-6" />, action: 'view-brand-kit', modal: 'brand-showcase' },
        { id: 'chat-brandbot', label: '💬 Chat BrandBot', icon: <MessageCircle className="w-6 h-6" />, action: 'open-brand-chat', route: '/chat/brand-agent' },
        { id: 'launch-brand-upgrade', label: '🚀 Launch Brand Upgrade', icon: <Rocket className="w-6 h-6" />, action: 'launch-brand-agent', route: '/services/branding' }
      ]
    },
    
    // FITNESS/SKILLSMITH FLOW (Direct handoff)
    'fitness-skillsmith-handoff': {
      id: 'fitness-skillsmith-handoff',
      type: 'agent-handoff',
      flowType: 'fitness',
      percyMessage: `🏆 **CONNECTING TO SKILL SMITH - YOUR ATHLETIC PERFORMANCE EXPERT!**\n\nPerfect choice! I'm handing you over to **Skill Smith**, our elite sports performance AI who's optimized **1,200+** athletes' training and mental game.\n\n**🎯 Skill Smith specializes in:**\n• Sports video analysis and form correction\n• Personalized training program optimization\n• Mental game and performance psychology\n• Nutrition and recovery protocols\n\n**You'll be redirected to Skill Smith's training lab where you can:**\n• Upload training videos for instant analysis\n• Get personalized workout recommendations\n• Access sport-specific performance tools\n\n**Get ready to unlock your athletic potential!**`,
      handoffOptions: [
        { id: 'launch-skillsmith', label: '🏃‍♂️ Enter Training Lab', icon: <Trophy className="w-6 h-6" />, action: 'launch-skillsmith', route: '/sports' },
        { id: 'skillsmith-preview', label: '👀 Preview SkillSmith', icon: <Eye className="w-6 h-6" />, action: 'preview-skillsmith', modal: 'skillsmith-demo' },
        { id: 'back-to-percy', label: '↩️ Back to Percy', icon: <MessageCircle className="w-6 h-6" />, action: 'back-to-greeting' }
      ]
    },
    
    // CUSTOM SOMETHING ELSE FLOW
    'custom-flow-start': {
      id: 'custom-flow-start',
      type: 'conversational-flow',
      flowType: 'custom',
      percyMessage: `🎤 **CUSTOM INTELLIGENCE MODE - I'M ALL EARS!**\n\nBrilliant! This is exactly why I have an IQ of ${intelligenceScore} - I can adapt to ANY challenge and find competitive advantages others completely miss.\n\n**Tell me about your challenge, idea, or what you need help with:**\n\n💡 **I excel at:**\n• Unusual business challenges\n• Creative project automation\n• Industry-specific solutions\n• Custom workflow optimization\n• Unique competitive advantages\n\n**Don't hold back - the more unique your challenge, the more I can help you dominate!**`,
      showInput: true,
      inputType: 'text',
      inputPlaceholder: 'Describe your challenge, idea, or what you need help with...'
    },
    
    'custom-analysis': {
      id: 'custom-analysis',
      type: 'results',
      flowType: 'custom',
      percyMessage: `🧠 **CUSTOM ANALYSIS COMPLETE - SOLUTION PATHWAY IDENTIFIED!**\n\nBased on your unique challenge, here are the top 3 agents perfectly matched to help you:\n\n**🤖 RECOMMENDED AGENTS:**\n\n**1. Business Automation Agent**\n• Best for: Workflow optimization and process automation\n• Specializes in: Custom business solutions\n\n**2. Content Automation Agent**\n• Best for: Creative projects and content challenges\n• Specializes in: Multi-platform content strategies\n\n**3. Custom AI Agent**\n• Best for: Unique challenges requiring adaptive solutions\n• Specializes in: Industry-specific innovations\n\n**💡 NEXT STEPS:**\nChoose an agent below to dive deeper into your specific solution!`,
      handoffOptions: [
        { id: 'chat-recommended-agent', label: '💬 Chat Agent', icon: <MessageCircle className="w-6 h-6" />, action: 'open-custom-chat', route: '/chat' },
        { id: 'see-custom-demo', label: '👀 See Demo', icon: <Eye className="w-6 h-6" />, action: 'open-custom-demo', modal: 'custom-walkthrough' },
        { id: 'get-recommendation', label: '🎯 Get Recommendation', icon: <Target className="w-6 h-6" />, action: 'get-custom-recommendation' }
      ]
    },
    
    // SIGNUP FLOW
    'signup-flow-start': {
      id: 'signup-flow-start',
      type: 'conversational-flow',
      flowType: 'signup',
      percyMessage: `🚀 **WELCOME TO THE REVOLUTION!**\n\nExcellent choice! You're about to join **${(businessesTransformed + 1).toLocaleString()}** successful businesses who've gained an unfair AI advantage.\n\n**Enter your email to unlock your AI agent army:**\n\n✨ **What you get instantly:**\n• Access to all AI agents\n• Personalized automation recommendations\n• Competitive intelligence dashboard\n• Priority support from the team\n\n**Ready to make your competition irrelevant?**`,
      showInput: true,
      inputType: 'email',
      inputPlaceholder: 'Enter your email address...'
    },
    
    'signup-confirmation': {
      id: 'signup-confirmation',
      type: 'results',
      flowType: 'signup',
      percyMessage: `🎉 **ACCOUNT CREATED - WELCOME TO THE ELITE!**\n\nYour AI advantage is now activating! Here's what happens next:\n\n**✅ ACCOUNT SETUP COMPLETE:**\n• AI agent team deployed\n• Competitive intelligence scanning\n• Dashboard ready for customization\n• Welcome bonus unlocked\n\n**🎯 RECOMMENDED NEXT STEPS:**\n• Book your personalized onboarding call\n• Explore your agent capabilities\n• Take the quick product tour\n\n**You're now 10x ahead of competitors who are still doing things manually!**`,
      handoffOptions: [
        { id: 'book-onboarding', label: '📅 Book Onboarding', icon: <Calendar className="w-6 h-6" />, action: 'book-onboarding-call' },
        { id: 'explore-agents', label: '🧭 Explore Agents', icon: <Users className="w-6 h-6" />, action: 'explore-agents', route: '/agents' },
        { id: 'quick-tour', label: '🎯 Get Quick Tour', icon: <Eye className="w-6 h-6" />, action: 'start-product-tour', modal: 'platform-tour' }
      ]
    },
    
    // VIP CODE FLOW
    'code-flow-start': {
      id: 'code-flow-start',
      type: 'conversational-flow',
      flowType: 'code',
      percyMessage: `🔑 **VIP ACCESS VERIFICATION!**\n\nAh, someone with exclusive access! Enter your VIP, referral, or promo code below.\n\n**✨ SPECIAL CODES UNLOCK:**\n• VIP agent features\n• Priority support access\n• Exclusive automation templates\n• Advanced analytics dashboard\n• Beta feature early access\n\n**Enter your code to unlock your premium experience:**`,
      showInput: true,
      inputType: 'vip-code',
      inputPlaceholder: 'Enter your VIP/promo code...'
    },
    
    'code-success': {
      id: 'code-success',
      type: 'results',
      flowType: 'code',
      percyMessage: `👑 **VIP ACCESS GRANTED - WELCOME TO THE ELITE TIER!**\n\nYour exclusive code has been verified! Here's what you've unlocked:\n\n**🌟 VIP FEATURES ACTIVATED:**\n• Priority agent response times\n• Advanced automation templates\n• Exclusive industry insights\n• Direct founder access\n• Beta feature early access\n\n**💎 EXCLUSIVE OFFERS:**\n• 50% off premium upgrades\n• Free strategy consultation\n• Custom automation builds\n• White-glove onboarding\n\n**Your VIP dashboard is ready to dominate!**`,
      handoffOptions: [
        { id: 'access-vip-dashboard', label: '👑 Access Dashboard', icon: <LayoutDashboard className="w-6 h-6" />, action: 'access-vip-dashboard', route: '/dashboard?vip=true' },
        { id: 'see-vip-offers', label: '💎 See Offers', icon: <Star className="w-6 h-6" />, action: 'view-vip-offers', route: '/offers' },
        { id: 'chat-percy-vip', label: '💬 Chat Percy VIP', icon: <MessageCircle className="w-6 h-6" />, action: 'open-vip-chat', route: '/chat/percy?vip=true' }
      ]
    },
    
    // DASHBOARD ACCESS FLOW
    'dashboard-flow-start': {
      id: 'dashboard-flow-start',
      type: 'conversational-flow',
      flowType: 'dashboard',
      percyMessage: `📊 **DASHBOARD ACCESS PORTAL!**\n\nWelcome back! Enter your email or access code to view your saved workflows, analysis results, and AI agent activities.\n\n**🎯 YOUR DASHBOARD INCLUDES:**\n• Active automation workflows\n• Performance analytics and insights\n• Saved analysis results\n• Agent conversation history\n• Competitive intelligence reports\n\n**Ready to see your AI empire in action?**`,
      showInput: true,
      inputType: 'email',
      inputPlaceholder: 'Enter email or access code...'
    },
    
    'dashboard-access': {
      id: 'dashboard-access',
      type: 'results',
      flowType: 'dashboard',
      percyMessage: `🎮 **DASHBOARD ACCESS GRANTED - COMMAND CENTER READY!**\n\nWelcome to your AI command center! Here's what's waiting for you:\n\n**📈 RECENT ACTIVITY:**\n• 3 automation workflows running\n• 12 competitive insights generated\n• 8 agent conversations saved\n• $4,200 in ROI tracked this month\n\n**🚀 QUICK ACTIONS:**\n• View your active workflows\n• Analyze latest results\n• Launch new agent sessions\n\n**Your competitive advantage is growing every day!**`,
      handoffOptions: [
        { id: 'view-workflows', label: '⚙️ View Workflows', icon: <Settings className="w-6 h-6" />, action: 'view-workflows', route: '/dashboard/workflows' },
        { id: 'analyze-results', label: '📊 Analyze My Results', icon: <BarChart3 className="w-6 h-6" />, action: 'analyze-results', route: '/dashboard/analytics' },
        { id: 'launch-agent-session', label: '🚀 Launch Agent', icon: <Rocket className="w-6 h-6" />, action: 'launch-agent-session', route: '/agents' }
      ]
    },

    // FREE SCAN FLOW STEPS
    'business-input-collection': {
      id: 'business-input-collection',
      type: 'input',
      percyMessage: `🔍 **FREE AI BUSINESS SCAN ACTIVATED!**\n\nI'm going to analyze your business and identify immediate opportunities for growth and automation.\n\n**What I need:** Just share your business website, social media profile, or tell me about your business/goals.\n\n**What you'll get:**\n• AI-powered opportunity analysis\n• Specific recommendations\n• 1-2 recommended agents to launch\n• Instant actionable insights\n\nReady to see what your competition is missing?`,
      showInput: true,
      inputType: 'text',
      inputPlaceholder: 'Enter your website URL, social media, or describe your business...'
    },

    'ai-analysis-processing': {
      id: 'ai-analysis-processing',
      type: 'thinking',
      percyMessage: `🧠 **AI ANALYSIS IN PROGRESS...**\n\nI'm running deep analysis on your business using my 247 IQ competitive intelligence engine:\n\n**🔍 Scanning:** Market position & competitor gaps\n**⚡ Analyzing:** Automation opportunities\n**🎯 Identifying:** Quick wins & revenue boosters\n**🚀 Matching:** Perfect AI agents for your needs\n\nThis usually takes 15-30 seconds...\n\n*Your competition won't know what hit them.*`,
      showProgress: true
    },

    'analysis-results': {
      id: 'analysis-results',
      type: 'results',
      percyMessage: `✨ **ANALYSIS COMPLETE - OPPORTUNITIES IDENTIFIED!**\n\nI've found several ways to give you an unfair advantage over your competition.\n\n**Here's what I discovered about your business:**`,
      dynamicContent: true, // Will be populated with actual analysis
      handoffOptions: [] // Will be populated with recommended agents
    }
  };

  const getCurrentStep = () => {
    const step = onboardingSteps[currentStep];
    
    // Dynamically populate analysis-results step with context data
    if (currentStep === 'analysis-results' && freeAnalysisResults) {
      return {
        ...step,
        percyMessage: `✨ **ANALYSIS COMPLETE - OPPORTUNITIES IDENTIFIED!**\n\n${freeAnalysisResults.analysis}\n\n**🎯 OPPORTUNITIES I FOUND:**\n${freeAnalysisResults.opportunities?.map((opp: string) => `• ${opp}`).join('\n')}\n\n**⚡ QUICK WINS (This Week):**\n${freeAnalysisResults.quickWins?.map((win: string) => `• ${win}`).join('\n')}\n\n**Your next step: Launch the perfect AI agent to capitalize on these opportunities!**`,
        handoffOptions: recommendedAgents?.map((agent: any) => ({
          id: `launch-${agent.id}`,
          label: `🚀 Launch ${agent.name}`,
          icon: <Rocket className="w-6 h-6" />,
          action: 'launch-agent',
          route: `/services/${agent.id}`,
          data: { agentId: agent.id, reason: agent.reason }
        })) || []
      };
    }
    
    return step;
  };

  // Percy thinking handled by OnboardingContext

  // Business Analysis Handler now handled by context - Percy focuses on UI!

  // performAnalysis is now handled by context

  // Narrow type for option actions for safer handling
  type OnboardingOption = {
    id: string;
    label: string;
    icon: React.ReactNode;
    action: string;
    data?: Record<string, unknown>;
    route?: string;
    modal?: string;
  };

  const handleOptionClick = async (option: OnboardingOption) => {
    try {
      toast.success(`${option.label} selected! 🎯`, { duration: 1500 });
      
      // FREE SCAN FLOW SYSTEM:
      // Each choice button triggers AI analysis followed by agent recommendations
      const freeAnalysisMapping: Record<string, string> = {
        'website-scan': 'analyze-website',
        'content-creator': 'analyze-content-strategy', 
        'book-publisher': 'analyze-publishing-strategy',
        'business-strategy': 'analyze-business-automation',
        'linkedin-profile': 'analyze-brand-presence',
        'sports-analysis': 'fitness-skillsmith-handoff', // Direct SkillSmith handoff
        'custom-needs': 'analyze-custom-needs',
        'signup': 'signup-flow-start',
        'have-code': 'code-flow-start',
        'my-dashboard': 'dashboard-flow-start'
      };
      
      // Route to analysis flows for choice buttons
      if (freeAnalysisMapping[option.id]) {
        if (option.id === 'sports-analysis') {
          // Direct route to SkillSmith
          setPercyMood('excited');
          setCurrentStep('fitness-skillsmith-handoff');
          trackBehavior('skillsmith_redirect', { type: option.id });
          return;
        }
        
        // For other options, start AI analysis
        setPercyMood('analyzing');
        setCurrentStep('business-input-collection');
        setAnalysisIntent(freeAnalysisMapping[option.id]);
        trackBehavior('free_scan_started', { type: option.id, analysis: freeAnalysisMapping[option.id] });
        return;
      }
      
      // Handle scanning animation flows
      if (option.action === 'trigger-scanning') {
        setPercyMood('analyzing');
        // Move to results step based on flow type
        const currentStepObj = getCurrentStep();
        if (currentStepObj.flowType) {
          setCurrentStep(`${currentStepObj.flowType}-results`);
        }
        return;
      }
      
      // Handle handoff actions (See Demo, Chat Agent, Launch Automation)
      if (option.action.startsWith('open-') && option.modal) {
        // Open demo/walkthrough modals
        trackBehavior('demo_modal_opened', { modal: option.modal, from: currentStep });
        // TODO: Implement modal opening logic
        toast.success(`🎬 Opening ${option.label}...`, { duration: 2000 });
        return;
      }
      
      if (option.action.startsWith('open-') && option.route) {
        // Open chat with specific agent
        console.log('[Percy] Opening agent chat:', option.route);
        trackBehavior('agent_chat_opened', { route: option.route, from: currentStep });
        toast.success(`💬 Connecting to agent...`, { duration: 2000 });
        router.push(toAgentRouteWithTrack(option.route) || option.route);
        return;
      }
      
      if (option.action.startsWith('launch-') && option.route) {
        // Launch agent/automation
        console.log('[Percy] Launching agent:', option.route);
        trackBehavior('agent_launched', { route: option.route, from: currentStep });
        toast.success(`🚀 ${option.label}...`, { duration: 2000 });
        router.push(toAgentRouteWithTrack(option.route) || option.route);
        return;
      }
      
      // Handle download/template actions
      if (option.action.includes('download') || option.action.includes('template')) {
        console.log('[Percy] Download action:', option.action);
        trackBehavior('resource_download', { action: option.action, from: currentStep });
        toast.success(`📥 Preparing ${option.label}...`, { duration: 2000 });
        // TODO: Implement download logic
        return;
      }
      
      // Handle view actions
      if (option.action.startsWith('view-') && option.route) {
        console.log('[Percy] View action:', option.route);
        trackBehavior('view_action', { route: option.route, from: currentStep });
        toast.success(`📊 ${option.label}...`, { duration: 2000 });
        const finalRoute = toAgentRouteWithTrack(option.route) || option.route;
        router.push(finalRoute);
        return;
      }
      
      // Handle Quick Wins actions (legacy support)
      if (option.action === 'launch-recommended-agent') {
        console.log('[Percy] Navigation: Launching recommended agent:', userAnalysisAgent);
        if (userAnalysisAgent) {
          trackBehavior('recommended_agent_launch', { agentId: userAnalysisAgent, from: 'percy_quick_wins' });
          
          const agentRoutes: Record<string, string> = {
            'SEO Dominator': `/agents/seo-agent?track=${track || 'business'}`,
            'Business Automation Agent': `/agents/biz-agent?track=${track || 'business'}`, 
            'Content Automation Agent': `/agents/content-automation?track=${track || 'business'}`,
            'Personal Branding Agent': `/agents/branding?track=${track || 'business'}`,
            'Book Publishing Agent': `/agents/book-publishing?track=${track || 'business'}`,
            'Skill Smith': `/agents/skillsmith?track=${track || 'sports'}`
          };
          
          const route = agentRoutes[userAnalysisAgent] || '/agents';
          toast.success(`🚀 Launching ${userAnalysisAgent}...`, { duration: 2000 });
          const finalRoute = toAgentRouteWithTrack(route) || route;
          router.push(finalRoute);
        } else {
          router.push('/agents');
        }
        return;
      }
    } catch (error) {
      toast.error('Navigation failed. Please try again.', { duration: 3000 });
      console.error('Option click error:', error);
      return;
    }
      if (option.action === 'have-code') {
      setPromptBarPlaceholder('Enter Code Here');
      setPromptBarValue('');
      promptBarRef.current?.focus();
      return;
    }
    if (option.action === 'custom-needs-analysis') {
      // Trigger open-ended intake
      setCurrentStep('custom-needs-analysis');
      setPromptBarPlaceholder('Go ahead, tell Percy what you need!');
      setPromptBarValue('');
      promptBarRef.current?.focus();
      return;
    }

    if (option.action === 'route-to-sports') {
      try {
        // Track behavior before navigation
        console.log('[Percy] Navigation: Routing to /sports from step:', currentStep);
        trackBehavior('sports_routing', { from: currentStep });
        toast.success('Navigating to Sports AI...', { duration: 2000 });
        router.push('/sports');
      } catch (error) {
        toast.error('Sports page unavailable. Please try again.', { duration: 3000 });
        console.error('Sports routing error:', error);
      }
      return;
    }

    if (option.action === 'back-to-greeting') {
      setCurrentStep('greeting');
      setPercyMood('excited');
      return;
    }

    if (option.action === 'back-to-business') {
      setCurrentStep('greeting');
      setPercyMood('excited');
              // Percy thinking handled by context
      return;
    }

    if (option.action === 'select-goal' && option.data?.goal) {
      setUserGoal(option.data.goal as string);
      setCurrentStep('signup');
              // Percy thinking handled by context
      return;
    }

    if (option.action === 'goal-selection') {
      setCurrentStep('goal-selection');
              // Percy thinking handled by context
      return;
    }

    if (option.action === 'launch-dashboard') {
      try {
        console.log('[Percy] Navigation: Routing to /dashboard from step:', currentStep, 'userGoal:', userGoal);
        trackBehavior('dashboard_navigation', { from: 'onboarding', userGoal });
        toast.success('Launching your dashboard... 🚀', { duration: 2000 });
        router.push('/dashboard');
      } catch (error) {
        toast.error('Dashboard unavailable. Please try again.', { duration: 3000 });
        console.error('Dashboard routing error:', error);
      }
      return;
    }

    if (option.action === 'explore-agents') {
      try {
        console.log('[Percy] Navigation: Routing to /agents from step:', currentStep, 'userGoal:', userGoal);
        trackBehavior('agents_navigation', { from: 'onboarding', userGoal });
        toast.success('Exploring AI agents... 🤖', { duration: 2000 });
        router.push('/agents');
      } catch (error) {
        toast.error('Agents page unavailable. Please try again.', { duration: 3000 });
        console.error('Agents routing error:', error);
      }
      return;
    }

    if (option.action === 'complete-verification') {
      setCurrentStep('welcome');
              // Percy thinking handled by context
      return;
    }

    if (option.action === 'resend-email') {
      await resendVerificationEmail();
      return;
    }

    if (option.action === 'activate-widget') {
      activateFloatingWidget();
      return;
    }

    if (option.action === 'vip-code-entry') {
      setCurrentStep('vip-code-entry');
      setPercyMood('scanning');
              // Percy thinking handled by context
      return;
    }

    if (option.action === 'back-to-signup') {
      setCurrentStep('signup');
      setPercyMood('excited');
      return;
    }

    if (option.action === 'launch-vip-dashboard') {
      try {
        console.log('[Percy] Navigation: Routing to VIP dashboard from step:', currentStep, 'vipTier:', vipTier);
        trackBehavior('vip_dashboard_navigation', { from: 'vip_onboarding', vipTier, userGoal });
        toast.success('Launching VIP dashboard... 👑', { duration: 2000 });
        router.push('/dashboard?vip=true');
      } catch (error) {
        toast.error('VIP dashboard unavailable. Please try again.', { duration: 3000 });
        console.error('VIP dashboard routing error:', error);
      }
      return;
    }

    if (option.action === 'explore-vip-features') {
      try {
        console.log('[Percy] Navigation: Routing to VIP features from step:', currentStep, 'vipTier:', vipTier);
        trackBehavior('vip_features_navigation', { from: 'vip_onboarding', vipTier });
        toast.success('Exploring VIP features... ✨', { duration: 2000 });
        router.push('/features?vip=true');
      } catch (error) {
        toast.error('VIP features unavailable. Please try again.', { duration: 3000 });
        console.error('VIP features routing error:', error);
      }
      return;
    }

    if (option.action === 'launch-recommended-agent') {
      console.log('[Percy] Navigation: Launching recommended agent:', userAnalysisAgent, 'from step:', currentStep);
      if (userAnalysisAgent) {
        trackBehavior('recommended_agent_launch', { agentId: userAnalysisAgent, from: 'analysis_results' });
        await handleLaunch(userAnalysisAgent, { source: 'analysis', input: analysisResults?.input });
      } else {
        // Fallback to agents page if no specific agent recommended
        console.log('[Percy] Navigation: No specific agent recommended, routing to /agents');
        router.push('/agents');
      }
      return;
    }

    // Handle analysis mode selections
    if (option.action.startsWith('instant-')) {
      setCurrentStep(option.action);
      setPercyMood('scanning');
      trackBehavior('analysis_started', { mode: option.action.replace('instant-', '') });
              // Percy thinking handled by context
    }
  };

  // handleInputSubmit is now provided by useOnboarding() context

  const resendVerificationEmail = async () => {
            // Percy thinking handled by context
    toast.success('📧 Verification email resent!');
  };

  const activateFloatingWidget = () => {
    setShowFloatingWidget(true);
    setIsOnboardingActive(false);
    trackBehavior('floating_widget_activated', { from: 'onboarding_completion' });
    // Add any additional widget activation logic
    toast.success('Percy is now available in the corner!', {
      icon: '✨',
      position: 'bottom-right',
    });
  };

  // Auto-scroll to bottom when new messages appear
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [currentStep]);

  // Live Social Proof Integration
  useEffect(() => {
    const fetchLiveSocialProof = async () => {
      try {
        const response = await fetch('/api/social-proof/live-feed?type=signup&count=5&includeActivity=true');
        const result = await response.json();
        
        if (result.success) {
          // Removed liveMetrics updates - using static value props instead
          setSocialProofMessages(result.data.socialProof);
          
                  // Update competitive insights (stored locally for UI)
        setCompetitiveInsights(result.data.metrics.competitive.recentAchievements);
        }
      } catch (error) {
        console.error('[Percy] Failed to fetch live social proof:', error);
      }
    };

    // Initial fetch
    fetchLiveSocialProof();
    
    // Regular fetch interval
    const interval = setInterval(fetchLiveSocialProof, 45000);
    
    return () => clearInterval(interval);
  }, []);

  // Rotate social proof messages
  useEffect(() => {
    if (socialProofMessages.length === 0) return;

    const interval = setInterval(() => {
      const randomMessage = socialProofMessages[Math.floor(Math.random() * socialProofMessages.length)];
      setCurrentSocialProof(randomMessage);
      
      // Hide after 6 seconds
      setTimeout(() => {
        setCurrentSocialProof(null);
      }, 6000);
    }, 12000 + Math.random() * 8000); // Random interval between 12-20 seconds

    return () => clearInterval(interval);
  }, [socialProofMessages]);

  // Legacy recommendation engine - TODO: Consider removing if not actively used
  // const [quickWinRecommendations, setQuickWinRecommendations] = useState<any[]>([]);
  // const [currentRecommendation, setCurrentRecommendation] = useState<any>(null);
  // const [userProfile, setUserProfile] = useState<any>({
  //   industry: null,
  //   experience: null,
  //   urgency: null,
  //   goals: []
  // });
  // const [onboardingStage, setOnboardingStage] = useState<'greeting' | 'profiling' | 'recommendations' | 'demo' | 'activation'>('greeting');
  // const [firstAgentDemo, setFirstAgentDemo] = useState<any>(null);
  // const [demoResults, setDemoResults] = useState<any>(null);

  // Legacy Quick Win Templates - TODO: Consider removing if not actively used
  // const quickWinTemplates = {
  //   'content_creator': {
  //     primaryAgent: 'contentcreation',
  //     quickWin: 'Generate 5 blog post ideas in 30 seconds',
  //     demoTemplate: 'content-creation-pipeline',
  //     timeToValue: '2 minutes',
  //     expectedResult: '5 SEO-optimized blog topics with outlines'
  //   },
  //   'ecommerce_owner': {
  //     primaryAgent: 'adcreative',
  //     quickWin: 'Create Facebook ad copy for your best product',
  //     demoTemplate: 'ecommerce-product-launch',
  //     timeToValue: '3 minutes',
  //     expectedResult: 'High-converting ad copy with 3 variations'
  //   },
  //   'saas_founder': {
  //     primaryAgent: 'branding',
  //     quickWin: 'Generate your complete brand voice guide',
  //     demoTemplate: 'saas-user-onboarding',
  //     timeToValue: '5 minutes',
  //     expectedResult: 'Brand voice, messaging, and tone guidelines'
  //   },
  //   'consultant': {
  //     primaryAgent: 'proposal',
  //     quickWin: 'Create a client proposal template',
  //     demoTemplate: 'consulting-client-proposal',
  //     timeToValue: '4 minutes',
  //     expectedResult: 'Professional proposal with pricing structure'
  //   },
  //   'agency_owner': {
  //     primaryAgent: 'social',
  //     quickWin: 'Plan 30 days of social content',
  //     demoTemplate: 'social-media-campaign',
  //     timeToValue: '6 minutes',
  //     expectedResult: 'Complete social media content calendar'
  //   }
  // };

  // Legacy recommendation and analysis functions - commented out for cleanup
  // TODO: Consider removing if not actively used in current onboarding flow
  
  // const analyzeUserProfile = useCallback((responses: string[]) => {
  //   const allText = responses.join(' ').toLowerCase();
  //   
  //   // Industry detection
  //   let industry = 'general';
  //   if (allText.includes('shop') || allText.includes('store') || allText.includes('product')) industry = 'ecommerce';
  //   else if (allText.includes('content') || allText.includes('blog') || allText.includes('write')) industry = 'content';
  //   else if (allText.includes('saas') || allText.includes('software') || allText.includes('app')) industry = 'saas';
  //   else if (allText.includes('consult') || allText.includes('agency') || allText.includes('client')) industry = 'consulting';
  //   else if (allText.includes('social') || allText.includes('instagram') || allText.includes('tiktok')) industry = 'social';

  //   // Experience level detection
  //   let experience = 'beginner';
  //   if (allText.includes('expert') || allText.includes('advanced') || allText.includes('professional')) experience = 'advanced';
  //   else if (allText.includes('some experience') || allText.includes('intermediate')) experience = 'intermediate';

  //   // Urgency detection
  //   let urgency = 'normal';
  //   if (allText.includes('urgent') || allText.includes('asap') || allText.includes('immediately')) urgency = 'high';
  //   else if (allText.includes('soon') || allText.includes('quickly')) urgency = 'medium';

  //   return { industry, experience, urgency };
  // }, []);

  // const generateRecommendations = useCallback((profile: any) => {
  //   // Implementation commented out for cleanup
  // }, []);

  // const handlePercyConversation = useCallback(async (userInput: string) => {
  //   // Implementation commented out for cleanup
  // }, []);

  // const executeFirstAgentDemo = useCallback(async (recommendation: any) => {
  //   // Implementation commented out for cleanup
  // }, []);

  // handlePromptBarSubmit is now provided by useOnboarding() context

  // Clear and reset prompt bar
  const handlePromptBarClear = useCallback(() => {
    setPromptBarValue('');
    // setPromptBarPlaceholder('Need something else? Ask Percy...');
    promptBarRef.current?.focus();
  }, [setPromptBarValue]);

  // Handle keyboard shortcuts
  const handlePromptBarKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handlePromptBarSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handlePromptBarClear();
    }
  }, [handlePromptBarSubmit, handlePromptBarClear]);

  // Demo Mode Handlers
  const activateDemoMode = useCallback((agentId: string) => {
    setDemoActive(true);
    setDemoTargetAgent(agentId);
    setDemoStep('selecting');
    setPercyMood('analyzing');
    console.log('[Demo] Activating demo mode for agent:', agentId);
    trackBehavior('demo_mode_activated', { agentId, timestamp: Date.now() });
  }, [trackBehavior, setPercyMood]);

  const deactivateDemoMode = useCallback(() => {
    setDemoActive(false);
    setDemoTargetAgent(null);
    setDemoStep('idle');
    setPercyMood('excited');
    console.log('[Demo] Deactivating demo mode');
    trackBehavior('demo_mode_deactivated', { timestamp: Date.now() });
  }, [trackBehavior, setPercyMood]);

  // Enhanced error boundary for route failures
  const handleRouteError = useCallback((error: any, attemptedRoute: string, fallbackRoute: string = '/') => {
    console.error('[Percy] Route error:', error, 'Attempted route:', attemptedRoute);
    trackBehavior('route_error', { 
      error: error?.message || 'Unknown error', 
      attemptedRoute, 
      fallbackRoute,
      timestamp: Date.now() 
    });
    
    toast.error(`Navigation failed. Taking you to a safe place...`, {
      icon: '🚧',
      duration: 3000,
    });
    
    // Try fallback route with additional error handling
    try {
      router.push(fallbackRoute);
    } catch (fallbackError) {
      console.error('[Percy] Fallback route also failed:', fallbackError);
      // Ultimate fallback - reload page
      window.location.href = '/';
    }
  }, [router, trackBehavior]);

  // Route validation moved to OnboardingContext

  // Routing functions moved to OnboardingContext
  // Available via: handleLaunch, handleContinue, handleAgentChat, validateAndRoute

  const triggerAgentHandoff = useCallback((fromAgent: string, toAgent: string) => {
    setDemoStep('handoff');
    console.log('[Demo] Agent handoff:', fromAgent, '->', toAgent);
    trackBehavior('demo_agent_handoff', { fromAgent, toAgent, timestamp: Date.now() });
    // Animation hooks for Windsurf
    document.dispatchEvent(new CustomEvent('demo:agent-handoff', { 
      detail: { fromAgent, toAgent } 
    }));
  }, [trackBehavior]);

  // Expose demo controls for external access (Windsurf)
  useEffect(() => {
    (window as any).PercyDemoControls = {
      activateDemoMode,
      deactivateDemoMode,
      triggerAgentHandoff,
      demoActive,
      demoStep,
      demoTargetAgent
    };
    
    return () => {
      delete (window as any).PercyDemoControls;
    };
  }, [activateDemoMode, deactivateDemoMode, triggerAgentHandoff, demoActive, demoStep, demoTargetAgent]);

  const handleChatReset = () => {
    setCurrentStep('greeting');
    setInputValue('');
    setPromptBarValue('');
    setUserInteracted(false);
    // Reset local UI state only
    setCompetitiveInsights([]);
    setPercyMood('excited');
    toast.success('Conversation reset! Percy is ready to help again.', {
      icon: '🔄',
      duration: 2000,
    });
    trackBehavior('chat_reset', { from: currentStep });
  };

  // Enhanced back to start function with state reset and routing options
  const handleBackToStart = () => {
    try {
      // If user is deep in onboarding, reset to greeting
      if (currentStep !== 'greeting') {
        // Reset all onboarding state via context
        setCurrentStep('greeting');
        setInputValue('');
        setPromptBarValue('');
        // Reset local UI state
        setUserInteracted(false);
        setCompetitiveInsights([]);
        setUserGoal('');
        setUserInput('');
        setDemoActive(false);
        setDemoTargetAgent(null);
        setDemoStep('idle');
        setPercyMood('excited');
        
        // Track the action
        trackBehavior('back_to_start', { from: currentStep });
        
        // Success feedback
        toast.success('Welcome back! Choose your path to domination. 🚀', {
          duration: 2000,
        });
      } else {
        // If already at greeting, offer to go to homepage
        toast.success('Going to homepage... 🏠', { duration: 2000 });
        trackBehavior('homepage_navigation', { from: 'onboarding_greeting' });
        router.push('/');
      }
    } catch (error) {
      toast.error('Navigation failed. Please refresh the page.', { duration: 3000 });
      console.error('Back to start error:', error);
    }
  };

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && currentStep !== 'greeting') {
        handleBackToStart();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep]);

  const step = getCurrentStep();

  return (
      <motion.div
  className="w-full max-w-4xl mx-auto px-4 relative pointer-events-auto touch-manipulation overflow-hidden"
  data-percy-onboarding
  variants={{
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.23,
        delayChildren: 0.15
      }
    }
  }}
  initial="initial"
  animate="animate"
  layout
>
  {/* Animated Cosmic Border Overlay */}
  <motion.div
    className="pointer-events-none absolute -inset-2 z-30 rounded-[2.5rem] border-4 border-cyan-400/60 animate-cosmic-border"
    style={{
      boxShadow: '0 0 32px 8px rgba(48,213,200,0.25), 0 0 120px 12px rgba(99,102,241,0.13)',
      borderImage: 'linear-gradient(90deg, #30d5c8 20%, #6366f1 50%, #06b6d4 80%) 1',
      filter: 'drop-shadow(0 0 20px #30d5c8cc) drop-shadow(0 0 40px #6366f1cc)'
    }}
    animate={{
      opacity: [0.7, 1, 0.7],
      scale: [1, 1.03, 1],
      boxShadow: [
        '0 0 32px 8px rgba(48,213,200,0.25), 0 0 120px 12px rgba(99,102,241,0.13)',
        '0 0 64px 24px rgba(48,213,200,0.40), 0 0 180px 24px rgba(99,102,241,0.22)',
        '0 0 32px 8px rgba(48,213,200,0.25), 0 0 120px 12px rgba(99,102,241,0.13)'
      ]
    }}
    transition={{ duration: 6, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
  />
      {/* Optimized Background Particles - Reduced for performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`bg-particle-${i}`}
            className="absolute w-1 h-1 rounded-full bg-gradient-to-r from-cyan-400/30 to-blue-400/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -60, 0],
              opacity: [0, 0.8, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 6 + Math.random() * 3,
              repeat: Infinity,
              delay: i * 0.8,
              ease: 'easeInOut',
            }}
          />
        ))}
        
        {/* Simplified ambient orbs */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`bg-orb-${i}`}
            className="absolute rounded-full bg-gradient-to-r from-teal-500/10 to-cyan-500/10 blur-lg"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${40 + Math.random() * 20}px`,
              height: `${40 + Math.random() * 20}px`,
            }}
            animate={{
              opacity: [0.1, 0.2, 0.1],
              scale: [0.9, 1.1, 0.9],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: i * 1.5,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
      {/* Enhanced Percy Hero Section with Cosmic Effects */}
      <motion.div
        className="relative mb-8"
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1, ease: "easeOut", staggerChildren: 0.2 }}
      >
        {/* Cosmic Background Effects */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          {/* Pulsing cosmic glow */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-teal-500/30 rounded-3xl blur-2xl"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          {/* Secondary glow layer */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-cyan-500/20 rounded-3xl blur-3xl"
            animate={{
              scale: [1.1, 1, 1.1],
              opacity: [0.2, 0.4, 0.2],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

                  {/* Main Hero Container with Enhanced Depth */}
          <motion.div
          className="relative bg-transparent backdrop-blur-xl border-2 border-teal-400/60 rounded-3xl shadow-[0_0_80px_#30d5c8dd,0_0_120px_#6366f144,inset_0_1px_0_rgba(255,255,255,0.15)] overflow-hidden"
          whileHover={{
            scale: 1.02,
            rotateX: 2,
            rotateY: -1,
            boxShadow: [
              "0 0 80px #30d5c8dd,0 0 120px #6366f144,inset 0 1px 0 rgba(255,255,255,0.15)",
              "0 0 120px #30d5c8ff, 0 0 180px #6366f1bb, 0 0 240px #ec4899aa,inset 0 1px 0 rgba(255,255,255,0.25)",
              "0 0 80px #30d5c8dd,0 0 120px #6366f144,inset 0 1px 0 rgba(255,255,255,0.15)"
            ]
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30, boxShadow: { duration: 0.8 } }}
          style={{ perspective: "1000px", transformStyle: "preserve-3d", zIndex: 50 }}
        >
          {/* Back to Start Button - Only show when not on greeting step */}
          <AnimatePresence>
            {currentStep !== 'greeting' && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: -10 }}
                whileHover={{ 
                  scale: 1.1,
                  boxShadow: "0 0 30px rgba(48,213,200,0.6), 0 0 60px rgba(99,102,241,0.4)",
                  background: "linear-gradient(135deg, rgba(21,23,30,0.95) 0%, rgba(30,35,45,0.9) 50%, rgba(21,23,30,0.95) 100%)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackToStart}
                className="absolute top-4 right-4 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[rgba(21,23,30,0.9)] via-[rgba(30,35,45,0.85)] to-[rgba(21,23,30,0.9)] backdrop-blur-xl border-2 border-teal-400/50 shadow-[0_0_20px_rgba(48,213,200,0.4)] transition-all duration-300 group"
                aria-label="Back to Start"
                title="Back to Start (Press Esc)"
              >
                <CornerUpLeft className="w-6 h-6 text-teal-400 group-hover:text-cyan-300 transition-colors duration-300" />
                
                {/* Cosmic glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.button>
            )}
          </AnimatePresence>
          {/* Inner cosmic shimmer */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 via-transparent to-blue-400/5 rounded-3xl" />
          
          {/* Content */}
          <div className="relative p-8 flex flex-col items-center z-10">
            {/* Enhanced Percy Avatar with Micro-interactions */}
            <motion.div
              className="relative mb-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              whileHover={{
                scale: 1.1,
                rotateY: 10,
                transition: { duration: 0.3 }
              }}
            >
              {/* Avatar glow effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-cyan-400/40 to-blue-400/40 rounded-full blur-xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.4, 0.8, 0.4],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Optimized sparkle effects around avatar */}
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-gradient-to-r from-cyan-400 to-white rounded-full"
                  style={{
                    left: `${50 + Math.cos((i * Math.PI * 2) / 4) * 50}%`,
                    top: `${50 + Math.sin((i * Math.PI * 2) / 4) * 50}%`,
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1.2, 0],
                  }}
                  transition={{
                    duration: 2.5,
                    delay: i * 0.5,
                    repeat: Infinity,
                    repeatDelay: 4,
                  }}
                />
              ))}
              
              <PercyAvatar 
                size="lg" 
                animate={!userInteracted} 
                className="relative z-10 shadow-[0_0_40px_rgba(48,213,200,0.6),inset_0_0_20px_rgba(0,0,0,0.8)] border-4 border-teal-400/30" 
              />
          </motion.div>
          
            {/* Enhanced Prominent Messaging */}
          <motion.div
              className="text-center max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {/* Main Message - Prominent and Glowing */}
              <motion.div
                className="mb-4"
                animate={pulseActive ? {
                  scale: [1, 1.05, 1],
                  textShadow: [
                    "0 0 20px rgba(48,213,200,0.6), 0 2px 4px rgba(0,0,0,0.8)",
                    "0 0 40px rgba(48,213,200,1), 0 0 60px rgba(99,102,241,0.8), 0 2px 4px rgba(0,0,0,0.8)",
                    "0 0 20px rgba(48,213,200,0.6), 0 2px 4px rgba(0,0,0,0.8)"
                  ]
                } : {}}
                transition={{ duration: 2, repeat: pulseActive ? Infinity : 0 }}
          >
            <span
                  className="block font-bold text-3xl md:text-4xl text-transparent bg-gradient-to-r from-cyan-300 via-white to-teal-300 bg-clip-text text-center tracking-tight leading-tight"
                  style={{
                    textShadow: "0 0 30px rgba(48,213,200,0.8), 0 4px 8px rgba(0,0,0,0.9)"
                  }}
              aria-live="polite"
            >
                  {personalizedGreeting || "Percy here—ready to guide"}
            </span>
              </motion.div>
              
              {/* Typewriter Message - Isolated from blur effects */}
              <motion.div
                className="mb-6 relative z-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                style={{
                  transform: "translateZ(50px)",
                  willChange: "transform",
                  backfaceVisibility: "hidden"
                }}
              >
                <div 
                  className="relative"
                  style={{
                    isolation: "isolate",
                    transform: "translate3d(0, 0, 0)"
                  }}
                >
                  <span 
                                      className="block text-xl md:text-2xl text-white font-black tracking-wide"
                  style={{
                    textShadow: "0 0 30px rgba(48,213,200,1), 0 0 60px rgba(48,213,200,0.6), 0 2px 6px rgba(0,0,0,1)",
                    filter: "brightness(1.2) contrast(1.3) saturate(1.1)",
                    WebkitFontSmoothing: "antialiased",
                    MozOsxFontSmoothing: "grayscale",
                    fontFeatureSettings: "'liga' 1, 'kern' 1",
                    textRendering: "optimizeLegibility",
                    WebkitTextStroke: "0.5px rgba(48,213,200,0.3)",
                    letterSpacing: "0.025em",
                    lineHeight: "1.2"
                  } as React.CSSProperties}
                >
                  {currentStep === 'greeting' && !personalizedGreeting && (
                    userHistory.length > 0 ? 
                      `Welcome back! Ready to dominate again? 🚀` : 
                      typedText
                  )}
                  </span>
                </div>
              </motion.div>
              
              {/* Clean tagline and demo button */}
              <motion.div
                className="text-center space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <motion.p 
                  className="text-lg text-gray-300 font-medium"
                  animate={{
                    textShadow: [
                      "0 0 8px rgba(48,213,200,0.3)",
                      "0 0 16px rgba(48,213,200,0.5)",
                      "0 0 8px rgba(48,213,200,0.3)"
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  Your AI-powered business transformation starts here.
                </motion.p>
                
                {/* Show me a Demo button - Enhanced CTA */}
                <motion.button
                  onClick={() => {
                    try {
                      setDemoActive(true);
                      setDemoStep('selecting');
                      handleAnyInteraction();
                      toast.success('Demo mode activated! 🚀', { duration: 2000 });
                    } catch (error) {
                      toast.error('Demo unavailable. Please try again.', { duration: 3000 });
                    }
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.6)] border-2 border-purple-400/50 cursor-pointer min-h-[48px] min-w-[120px] touch-manipulation"
                  whileHover={{ 
                    scale: 1.08,
                    boxShadow: "0 0 50px rgba(168,85,247,0.8), 0 0 80px rgba(236,72,153,0.6)",
                    background: "linear-gradient(135deg, rgb(147,51,234) 0%, rgb(219,39,119) 100%)",
                    y: -2
                  }}
                  whileTap={{ 
                    scale: 0.95,
                    boxShadow: "0 0 20px rgba(168,85,247,0.4)"
                  }}
                  animate={{
                    boxShadow: [
                      "0 0 30px rgba(168,85,247,0.6)",
                      "0 0 40px rgba(168,85,247,0.8), 0 0 60px rgba(236,72,153,0.4)",
                      "0 0 30px rgba(168,85,247,0.6)"
                    ]
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 25,
                    boxShadow: { duration: 2, repeat: Infinity }
                  }}
                  aria-label="Start Demo Mode"
                  title="Experience SKRBL AI Demo"
                >
                  <span className="flex items-center gap-3">
                    <Zap className="w-5 h-5" />
                    Show me a Demo
                  </span>
                </motion.button>
              </motion.div>
          </motion.div>
        </div>
          
          {/* 3D highlight edges */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-400/60 to-transparent rounded-full" />
        </motion.div>
      </motion.div>

      {/* Main Chat and Options Container as Floating Modal Overlay */}
<motion.div
  className="relative w-full max-w-3xl mx-auto mt-8 rounded-2xl shadow-2xl bg-transparent backdrop-blur-2xl border-2 border-cyan-400/30 overflow-hidden"
  initial={{ opacity: 0, y: 60 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: 60 }}
  transition={{ duration: 0.7, ease: 'easeOut' }}
  style={{
    boxShadow: '0 8px 64px 16px rgba(48,213,200,0.22), 0 0 120px 32px rgba(99,102,241,0.13)',
    borderImage: 'linear-gradient(90deg, #30d5c8 20%, #6366f1 50%, #06b6d4 80%) 1',
    filter: 'drop-shadow(0 0 40px #30d5c8cc) drop-shadow(0 0 80px #6366f1cc)'
  }}
  layout
>
  {/* AI Listening Animation - Animated Dots */}
  <div className="absolute left-1/2 -top-6 -translate-x-1/2 z-30 flex gap-1 items-center">
    {[0, 1, 2].map(i => (
      <motion.span
        key={i}
        className="w-2 h-2 rounded-full bg-cyan-400 shadow-lg"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          repeatType: 'loop',
          delay: i * 0.33
        }}
      />
    ))}
    <span className="ml-2 text-xs text-cyan-300 font-semibold tracking-wide">AI Listening...</span>
  </div>
  {/* Close Modal Button (mobile/overlay) */}
  <button
    className="absolute top-3 right-3 z-40 w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-[rgba(21,23,30,0.95)] via-[rgba(30,35,45,0.85)] to-[rgba(21,23,30,0.95)] border-2 border-cyan-400/40 shadow-lg hover:scale-110 transition-all duration-200 md:hidden"
    aria-label="Close Chat"
    title="Close Chat"
    onClick={handleBackToStart}
  >
    <svg className="w-6 h-6 text-cyan-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
  </button>
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-teal-500/20 rounded-2xl blur-3xl"></div>
        <div className="relative bg-[rgba(21,23,30,0.7)] backdrop-blur-xl border border-teal-400/40 shadow-[0_0_32px_#30d5c899] shadow-inner rounded-2xl p-8">
          
          {/* Chat Messages - Mobile Optimized Heights */}
          <div 
            ref={chatRef} 
            className="min-h-[200px] sm:min-h-[250px] md:min-h-[300px] mb-6 relative"
            data-percy-chat-container
          >
            {/* Modal Glow & Shadow Overlay */}
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none z-10"
              style={{
                boxShadow: '0 0 60px 12px #30d5c8cc, 0 0 120px 24px #6366f1cc',
                filter: 'blur(2px) brightness(1.2) opacity(0.7)'
              }}
              animate={{
                opacity: [0.7, 1, 0.7],
                scale: [1, 1.04, 1]
              }}
              transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
            />
            <AnimatePresence>
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5 }}
                className="mb-4"
              >
                {/* Percy Message */}
                <div className="flex items-start space-x-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-xl p-4 border border-cyan-400/20">
                      <div className="prose prose-invert prose-sm max-w-none">
                        {step.percyMessage.split('\n').map((line, i) => (
                          <p key={i} className="mb-2 last:mb-0 text-sm">
                            {line.includes('**') ? (
                              <span dangerouslySetInnerHTML={{
                                __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-cyan-400">$1</strong>')
                              }} />
                            ) : (
                              line
                            )}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analysis Results Display */}
                {analysisResults && currentStep === 'analysis-results' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-xl p-4 border border-green-400/20"
                  >
                    <h4 className="text-green-400 font-bold mb-3 flex items-center gap-2 text-sm">
                      <Target className="w-4 h-4" />
                      Competitive Intelligence Report
                    </h4>
                    <div className="space-y-2">
                      {competitiveInsights.map((insight, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <TrendingUp className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-200 text-xs">{insight}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Thinking Indicator */}
                {isPercyThinking && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center space-x-2 mb-4 text-cyan-400"
                  >
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-0"></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-150"></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-300"></div>
                    </div>
                    <span className="text-sm">Percy is analyzing...</span>
                  </motion.div>
                )}

                {/* Enhanced Contextual Suggestions (Percy's Concierge Intelligence) */}
                {contextualSuggestions.length > 0 && !isPercyThinking && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-xl p-3 border border-purple-400/20"
                  >
                    <h5 className="text-purple-400 font-semibold mb-2 flex items-center gap-2 text-xs">
                      <Sparkles className="w-3 h-3" />
                      Percy's Intelligence
                    </h5>
                    <div className="space-y-1">
                      {contextualSuggestions.slice(0, 2).map((suggestion, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.2 }}
                          className="flex items-start gap-2"
                        >
                          <div className="w-1 h-1 bg-purple-400 rounded-full mt-1.5 flex-shrink-0"></div>
                          <span className="text-purple-200 text-xs italic">{suggestion}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Input Field */}
                {step.showInput && (
                  <div className="mb-4">
                    <div className="relative">
                      <input
                        type={step.inputType}
                        value={inputValue}
                        onChange={(e) => {
                          setInputValue(e.target.value);
                          handleAnyInteraction('input_change');
                        }}
                        placeholder={step.inputPlaceholder}
                        className="w-full px-4 py-3 pr-12 bg-slate-800/80 border border-cyan-400/30 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-sm touch-manipulation text-base"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (currentStep === 'business-input-collection') {
                              handleBusinessAnalysis(inputValue, analysisIntent || 'analyze-custom-needs');
                              setInputValue('');
                            } else {
                              handleInputSubmit();
                            }
                          }
                        }}
                        onFocus={() => handleAnyInteraction('input_focus')}
                        data-percy-input
                        style={{ 
                          touchAction: 'manipulation',
                          fontSize: '16px'
                        }}
                      />
                      <motion.button
                        onClick={() => {
                          try {
                            // Handle business input collection step
                            if (currentStep === 'business-input-collection') {
                              handleBusinessAnalysis(inputValue, analysisIntent || 'analyze-custom-needs');
                              setInputValue(''); // Clear input
                            } else {
                              handleInputSubmit();
                            }
                            handleAnyInteraction('successful_action');
                          } catch (error) {
                            toast.error('Submission failed. Please try again.', { duration: 3000 });
                          }
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full mt-3 px-6 py-3 bg-gradient-to-br from-cyan-500 to-teal-400 text-white font-bold rounded-2xl shadow-[0_0_30px_rgba(48,213,200,0.6)] border-2 border-teal-400/50 hover:shadow-[0_0_40px_rgba(48,213,200,0.8)] transition-all"
                        data-percy-submit-button
                      >
                        Send
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* ENHANCED: Advanced Scanning Animation with Context States */}
                {(step.type === 'scanning' || step.type === 'thinking' || isProcessingAnalysis) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="flex flex-col items-center py-8 relative"
                  >
                    {/* Enhanced Multi-Layer Scanning Animation */}
                    <div className="relative">
                      {/* Outer Ring */}
                      <motion.div 
                        className="w-20 h-20 border-4 border-cyan-400/30 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      />
                      {/* Middle Ring */}
                      <motion.div 
                        className="absolute inset-2 w-16 h-16 border-3 border-teal-400/50 border-t-transparent rounded-full"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      />
                      {/* Inner Ring */}
                      <motion.div 
                        className="absolute inset-4 w-12 h-12 border-2 border-cyan-300 border-b-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      />
                      {/* Core Pulse */}
                      <motion.div 
                        className="absolute inset-6 w-8 h-8 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-full"
                        animate={{ 
                          scale: [1, 1.3, 1],
                          opacity: [0.8, 1, 0.8]
                        }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </div>
                    
                    {/* Analysis Progress Messages */}
                    <motion.div
                      className="mt-6 text-center space-y-2"
                      animate={{ opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <p className="text-cyan-300 font-semibold text-lg">
                        {isProcessingAnalysis ? '🧠 AI Analysis in Progress' : step.scanningMessage || 'Analyzing...'}
                      </p>
                      <p className="text-cyan-400/70 text-sm">
                        {percyMood === 'analyzing' ? 'Scanning for competitive advantages...' : 'Processing your request...'}
                      </p>
                    </motion.div>

                    {/* Scanning Effects */}
                    <motion.div
                      className="absolute -inset-4 bg-gradient-to-r from-cyan-500/10 via-teal-500/20 to-cyan-500/10 rounded-3xl blur-xl"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </motion.div>
                )}

                {/* NEW: Results Display for Conversational Flows */}
                {step.type === 'results' && step.resultsFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6"
                  >
                    <div className="space-y-2">
                      {step.resultsFeedback.map((feedback, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.3 }}
                          className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-900/30 to-teal-900/30 rounded-xl border border-green-400/30"
                        >
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-green-300 text-sm font-medium">{feedback}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* ENHANCED: Full-Width Results Cards with Agent Handoff */}
                {(step.type === 'results' || step.type === 'agent-handoff') && step.handoffOptions && (
                  <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                      delay: 0.3,
                      duration: 0.8, 
                      ease: "easeOut",
                      staggerChildren: 0.1
                    }}
                    className="mb-6 space-y-4"
                  >
                    {/* Results Header */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-center mb-6"
                    >
                      <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                        <Sparkles className="w-5 h-5 text-cyan-400" />
                        Recommended AI Agents
                      </h3>
                      <p className="text-cyan-300/80 text-sm">
                        {percyMood === 'celebrating' ? '🎯 Perfect matches found!' : 'Launch your competitive advantage'}
                      </p>
                    </motion.div>

                    {/* Full-Width Agent Cards */}
                    <div className="space-y-3">
                      {step.handoffOptions.map((option, index) => (
                        <motion.div
                          key={option.id}
                          initial={{ opacity: 0, y: 20, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ 
                            delay: 0.5 + index * 0.15,
                            duration: 0.6,
                            ease: "easeOut"
                          }}
                          className="w-full"
                        >
                          <motion.button
                            onClick={() => { handleOptionClick(option); handleAnyInteraction('handoff_action'); }}
                            whileHover={{ 
                              scale: 1.02, 
                              y: -3,
                              boxShadow: "0 20px 40px rgba(45,212,191,0.2), 0 0 50px rgba(99,102,241,0.15)"
                            }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full p-6 bg-gradient-to-br from-cyan-900/30 via-teal-900/40 to-cyan-800/30 hover:from-cyan-800/40 hover:via-teal-800/50 hover:to-cyan-700/40 border-2 border-cyan-400/30 hover:border-cyan-400/60 rounded-2xl transition-all duration-300 text-left group backdrop-blur-lg min-h-[80px] touch-manipulation shadow-[0_8px_32px_rgba(45,212,191,0.1),inset_0_1px_0_rgba(255,255,255,0.1)]"
                          >
                            <div className="flex items-center gap-4">
                              {/* Agent Icon */}
                              <motion.div 
                                className="flex-shrink-0 p-3 bg-gradient-to-br from-cyan-500/20 to-teal-500/30 rounded-xl group-hover:from-cyan-500/30 group-hover:to-teal-500/40 transition-all duration-300 border border-cyan-400/20"
                                whileHover={{ rotate: 5, scale: 1.1 }}
                              >
                                {option.icon}
                              </motion.div>
                              
                              {/* Agent Info */}
                              <div className="flex-1 min-w-0">
                                <h4 className="text-white font-bold text-lg group-hover:text-cyan-200 transition-colors mb-1">
                                  {option.label}
                                </h4>
                                {option.data?.reason && (
                                  <p className="text-cyan-300/70 text-sm leading-relaxed group-hover:text-cyan-300/90 transition-colors">
                                    {option.data.reason}
                                  </p>
                                )}
                              </div>

                              {/* Launch Arrow */}
                              <motion.div
                                className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/40 to-teal-500/40 flex items-center justify-center group-hover:from-cyan-500/60 group-hover:to-teal-500/60 transition-all"
                                whileHover={{ x: 3 }}
                              >
                                <ArrowRight className="w-4 h-4 text-white" />
                              </motion.div>
                            </div>
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Onboarding Options - 2x2 Grid on Desktop */}
                {step.options && (
                  step.id === 'greeting'
                    ? (
                      <motion.div
                        variants={{
                          initial: { opacity: 0, y: 10 },
                          entry: { opacity: 1, y: 0, transition: { duration: 0.7 } },
                          float: { y: [0, -4, 0], transition: { duration: 6, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' } }
                        }}
                        initial="initial"
                        animate={["entry","float"]}
                        className="space-y-3"
                        layout
                      >
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 justify-center mx-auto max-w-6xl">
                          {step.options?.map((option) => (
                            <ChoiceCard
                              key={option.id}
                              icon={option.icon}
                              label={option.label}
                              onClick={() => { handleOptionClick(option); handleAnyInteraction('option_click'); }}
                              data-demo-target={option.id}
                              data-demo-action="choice-selection"
                            />
                          ))}
                        </div>
                      </motion.div>
                    )
                    : (
                      <motion.div
                        variants={{
                          initial: { opacity: 0, y: 10 },
                          entry: { opacity: 1, y: 0, transition: { duration: 0.7 } },
                          float: { y: [0, -4, 0], transition: { duration: 6, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' } }
                        }}
                        initial="initial"
                        animate={["entry","float"]}
                        className="space-y-3"
                        layout
                      >
                    {/* First 4 options in 2x2 grid on desktop, stack on mobile */}
                    {step.options && step.options.slice(0, 4).length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {step.options?.slice(0, 4).map((option) => (
                              <ChoiceCard
                            key={option.id}
                                icon={option.icon}
                                label={option.label}
                                onClick={() => { handleOptionClick(option); handleAnyInteraction('option_click'); }}
                                className={option.id === 'custom-needs' ? 'md:col-span-2' : ''}
                              />
                        ))}
                      </div>
                    )}
                    
                    {/* Remaining options (5th onwards) - full width stack */}
                        {step.options && step.options.slice(4).length > 0 && (
                          <div className="space-y-3">
                    {step.options?.slice(4).map((option) => (
                              <ChoiceCard
                        key={option.id}
                                icon={option.icon}
                                label={option.label}
                                onClick={() => { handleOptionClick(option); handleAnyInteraction('option_click'); }}
                              />
                    ))}
                  </div>
                        )}
                      </motion.div>
                    )
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Enhanced 3D Prompt Bar */}
          <motion.div
            className="mt-8 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            {/* Cosmic glow background */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-teal-500/20 rounded-3xl blur-2xl opacity-60" />
            
            <motion.div
              className="relative bg-gradient-to-br from-[rgba(21,23,30,0.9)] via-[rgba(30,35,45,0.85)] to-[rgba(21,23,30,0.9)] backdrop-blur-xl border-2 border-teal-400/60 rounded-3xl shadow-[0_0_60px_#30d5c8cc,0_0_100px_#6366f155,inset_0_1px_0_rgba(255,255,255,0.15)] p-6"
              whileHover={{
                scale: 1.02,
                rotateX: 1,
                rotateY: -0.5,
                boxShadow: [
                  "0 0 60px #30d5c8cc,0 0 100px #6366f155,inset 0 1px 0 rgba(255,255,255,0.15)",
                  "0 0 100px #30d5c8ff, 0 0 140px #6366f1bb, 0 0 180px #ec4899aa,inset 0 1px 0 rgba(255,255,255,0.25)",
                  "0 0 60px #30d5c8cc,0 0 100px #6366f155,inset 0 1px 0 rgba(255,255,255,0.15)"
                ]
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30, boxShadow: { duration: 0.6 } }}
              style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
            >
              {/* Enhanced Header with Branded CTA Buttons */}
              <div className="flex flex-col space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                    <span className="text-sm text-gray-300 font-medium">Ask Percy Anything</span>
                  </div>
                  
                  {/* Enhanced Reset Button */}
                  <motion.button
                    onClick={() => {
                      try {
                        handleChatReset();
                      } catch (error) {
                        toast.error('Reset failed. Please refresh the page.', { duration: 3000 });
                      }
                    }}
                    className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/80 to-red-500/80 border-2 border-orange-400/50 shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:shadow-[0_0_25px_rgba(249,115,22,0.6)] transition-all group cursor-pointer min-w-[44px] min-h-[44px] touch-manipulation"
                    whileHover={{ 
                      scale: 1.1,
                      boxShadow: "0 0 25px rgba(249,115,22,0.6)",
                      background: "linear-gradient(135deg, rgba(249,115,22,0.9) 0%, rgba(239,68,68,0.9) 100%)",
                      y: -1
                    }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Reset conversation"
                    title="Reset Chat (Clear All)"
                  >
                    <RotateCcw className="w-5 h-5 text-white group-hover:text-orange-100 transition-colors" />
                  </motion.button>
                </div>
                
                {/* Branded Quick Action CTA Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <motion.button
                    onClick={() => {
                      try {
                        setPromptBarValue('Show me a demo of SKRBL AI');
                        setDemoActive(true);
                        setDemoStep('selecting');
                        toast.success('Demo mode activated! 🚀', { duration: 2000 });
                      } catch (error) {
                        toast.error('Demo unavailable. Please try again.', { duration: 3000 });
                      }
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500/80 to-pink-500/80 border-2 border-purple-400/50 rounded-xl text-white font-semibold text-sm shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] transition-all cursor-pointer min-h-[44px] touch-manipulation"
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 0 25px rgba(168,85,247,0.6)",
                      y: -1
                    }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Start Demo"
                    title="Experience SKRBL AI Demo"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Demo</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={() => {
                      try {
                        router.push('/sports');
                        toast.success('Loading Sports AI... 🏀', { duration: 2000 });
                      } catch (error) {
                        toast.error('Sports page unavailable. Please try again.', { duration: 3000 });
                      }
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500/80 to-red-500/80 border-2 border-orange-400/50 rounded-xl text-white font-semibold text-sm shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:shadow-[0_0_25px_rgba(249,115,22,0.6)] transition-all cursor-pointer min-h-[44px] touch-manipulation"
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 0 25px rgba(249,115,22,0.6)",
                      y: -1
                    }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Sports Analysis"
                    title="AI Sports Performance Analysis"
                  >
                    <Trophy className="w-4 h-4" />
                    <span>Sports</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={() => {
                      try {
                        setPromptBarValue('Analyze my website and give me competitive insights');
                        toast.success('Website analysis ready! 🔍', { duration: 2000 });
                      } catch (error) {
                        toast.error('Analysis unavailable. Please try again.', { duration: 3000 });
                      }
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-teal-500/80 to-cyan-500/80 border-2 border-teal-400/50 rounded-xl text-white font-semibold text-sm shadow-[0_0_15px_rgba(45,212,191,0.4)] hover:shadow-[0_0_25px_rgba(45,212,191,0.6)] transition-all cursor-pointer min-h-[44px] touch-manipulation"
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 0 25px rgba(45,212,191,0.6)",
                      y: -1
                    }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Quick Scan"
                    title="Instant Website Analysis"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Quick Scan</span>
                  </motion.button>
                </div>
              </div>
              
              {/* Enhanced Input Field with Accessibility */}
            <div className="relative">
                {/* ARIA-live region for Percy responses */}
                <div 
                  aria-live="polite" 
                  aria-atomic="true"
                  className="sr-only"
                >
                  {percyMood === 'analyzing' && 'Percy is analyzing your input'}
                  {percyMood === 'thinking' && 'Percy is thinking'}
                  {percyMood === 'celebrating' && 'Analysis complete'}
                </div>

                <motion.input
                ref={promptBarRef}
                type="text"
                value={promptBarValue}
                onChange={(e) => setPromptBarValue(e.target.value)}
                  onFocus={() => {
                    setPromptBarFocused(true);
                    setPercyMood('scanning');
                  }}
                  onBlur={() => {
                    setPromptBarFocused(false);
                    setPercyMood('excited');
                  }}
                  placeholder={
                    promptBarLoading ? 'Percy is processing...' : 
                    isProcessingAnalysis ? 'Analysis in progress...' :
                    promptBarPlaceholder || 'Ask Percy anything about your business...'
                  }
                  className={`w-full px-6 py-4 pr-16 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-md border-2 rounded-2xl text-white placeholder:text-gray-400 focus:outline-none text-base md:text-lg font-medium transition-all duration-300 min-h-[56px] ${
                    promptBarLoading || isProcessingAnalysis 
                      ? 'border-amber-400/40 cursor-wait opacity-75' 
                      : 'border-teal-400/30 hover:border-teal-400/50 focus:border-teal-300 focus:ring-4 focus:ring-teal-300/20'
                  }`}
                  onKeyDown={handlePromptBarKeyDown}
                  disabled={promptBarLoading || isProcessingAnalysis}
                  animate={promptBarFocused && !promptBarLoading ? { 
                    scale: 1.02,
                    borderColor: "rgba(45, 212, 191, 0.6)",
                    boxShadow: [
                      "0 0 30px rgba(45,212,191,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
                      "0 0 50px rgba(45,212,191,0.5), 0 0 80px rgba(99,102,241,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
                      "0 0 30px rgba(45,212,191,0.3), inset 0 1px 0 rgba(255,255,255,0.1)"
                    ]
                  } : { 
                    scale: 1,
                    borderColor: promptBarLoading || isProcessingAnalysis ? "rgba(251, 191, 36, 0.4)" : "rgba(45, 212, 191, 0.3)",
                    boxShadow: promptBarLoading || isProcessingAnalysis 
                      ? "0 0 15px rgba(251,191,36,0.3)" 
                      : "0 0 15px rgba(45,212,191,0.2), inset 0 1px 0 rgba(255,255,255,0.05)"
                  }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 200, 
                    damping: 25,
                    boxShadow: { duration: 1.5, repeat: promptBarFocused && !promptBarLoading ? Infinity : 0 }
                  }}
                  aria-label="Ask Percy about your business"
                  aria-describedby="percy-help-text"
                  aria-expanded={promptBarFocused}
                  aria-busy={promptBarLoading || isProcessingAnalysis}
                />

                {/* Help text for screen readers */}
                <div id="percy-help-text" className="sr-only">
                  Ask Percy about your business, website analysis, content creation, or any AI automation needs
                </div>
              
              {/* Enhanced Send Button with Accessibility */}
              <motion.button
                onClick={() => {
                  try {
                    handlePromptBarSubmit();
                  } catch (error) {
                    toast.error('Message failed to send. Please try again.', { duration: 3000 });
                  }
                }}
                  disabled={!promptBarValue.trim() || promptBarLoading || isProcessingAnalysis}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-xl border-2 transition-all group cursor-pointer min-w-[48px] min-h-[48px] touch-manipulation ${
                    !promptBarValue.trim() || promptBarLoading || isProcessingAnalysis
                      ? 'bg-gray-600/50 border-gray-500/30 opacity-50 cursor-not-allowed'
                      : 'bg-gradient-to-br from-teal-500/80 to-cyan-500/80 border-teal-400/50 shadow-[0_0_20px_rgba(45,212,191,0.4)] hover:shadow-[0_0_30px_rgba(45,212,191,0.6)]'
                  }`}
                  whileHover={{ 
                    scale: !promptBarValue.trim() || promptBarLoading || isProcessingAnalysis ? 1 : 1.05,
                    boxShadow: !promptBarValue.trim() || promptBarLoading || isProcessingAnalysis ? undefined : "0 0 30px rgba(45,212,191,0.6)",
                    y: !promptBarValue.trim() || promptBarLoading || isProcessingAnalysis ? 0 : -1
                  }}
                  whileTap={{ scale: !promptBarValue.trim() || promptBarLoading || isProcessingAnalysis ? 1 : 0.95 }}
                  animate={!promptBarValue.trim() || promptBarLoading || isProcessingAnalysis ? {} : {
                    boxShadow: [
                      "0 0 20px rgba(45,212,191,0.4)",
                      "0 0 30px rgba(45,212,191,0.6)",
                      "0 0 20px rgba(45,212,191,0.4)"
                    ]
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                    boxShadow: { duration: 1.5, repeat: !promptBarValue.trim() || promptBarLoading || isProcessingAnalysis ? 0 : Infinity }
                  }}
                  aria-label={
                    promptBarLoading || isProcessingAnalysis ? 'Processing message' :
                    !promptBarValue.trim() ? 'Enter a message to send' :
                    'Send message to Percy'
                  }
                  title={
                    promptBarLoading || isProcessingAnalysis ? 'Processing...' :
                    !promptBarValue.trim() ? 'Enter a message first' :
                    'Send to Percy (Enter)'
                  }
                  type="submit"
                >
                  {promptBarLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 text-white group-hover:text-gray-100 transition-colors" />
                  )}
              </motion.button>
            </div>
            
            {/* Branded Quick Action Buttons */}
            <motion.div
              className="mt-6 flex flex-wrap justify-center gap-3 sm:gap-4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
            >
              {/* Demo Button - Purple */}
              <motion.button
                onClick={() => {
                  try {
                    router.push('/demo');
                    toast.success('Launching Demo! 🚀', { duration: 2000 });
                  } catch (error) {
                    toast.error('Demo unavailable. Please try again.', { duration: 3000 });
                  }
                }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.4)] border border-purple-400/50 cursor-pointer min-h-[44px] touch-manipulation"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 30px rgba(147,51,234,0.6)",
                  y: -2
                }}
                whileTap={{ scale: 0.95 }}
                aria-label="Launch Demo"
                title="Experience SKRBL AI Demo"
              >
                <Zap className="w-4 h-4" />
                <span className="text-sm font-bold">Demo</span>
              </motion.button>

              {/* Sports Button - Orange */}
              <motion.button
                onClick={() => {
                  try {
                    router.push('/sports');
                    toast.success('Welcome to SkillSmith Sports! ⚽', { duration: 2000 });
                  } catch (error) {
                    toast.error('Sports page unavailable. Please try again.', { duration: 3000 });
                  }
                }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.4)] border border-orange-400/50 cursor-pointer min-h-[44px] touch-manipulation"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 30px rgba(249,115,22,0.6)",
                  y: -2
                }}
                whileTap={{ scale: 0.95 }}
                aria-label="Go to Sports"
                title="Athletic Performance Analytics"
              >
                <Trophy className="w-4 h-4" />
                <span className="text-sm font-bold">Sports</span>
              </motion.button>

              {/* Quick Scan Button - Teal */}
              <motion.button
                onClick={() => {
                  try {
                    setPromptBarValue('Analyze my business and show me opportunities');
                    handlePromptBarSubmit();
                    toast.success('Quick Scan initiated! 🔍', { duration: 2000 });
                  } catch (error) {
                    toast.error('Quick scan failed. Please try again.', { duration: 3000 });
                  }
                }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-xl shadow-[0_0_20px_rgba(20,184,166,0.4)] border border-teal-400/50 cursor-pointer min-h-[44px] touch-manipulation"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 30px rgba(20,184,166,0.6)",
                  y: -2
                }}
                whileTap={{ scale: 0.95 }}
                aria-label="Quick Business Scan"
                title="AI-Powered Business Analysis"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm font-bold">Quick Scan</span>
              </motion.button>
            </motion.div>
            
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Restored Stats Cards Section */}
      {/* Animated Value Props Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, delay: 0.1 }}
        className="mb-8"
      >
        <motion.div
          className="max-w-4xl mx-auto p-6 bg-gradient-to-r from-[rgba(21,23,30,0.8)] via-[rgba(30,35,45,0.7)] to-[rgba(21,23,30,0.8)] backdrop-blur-xl border border-teal-400/40 rounded-2xl shadow-[0_0_40px_#30d5c8aa]"
          whileHover={{ 
            scale: 1.02,
            boxShadow: "0 0 60px #30d5c8cc, 0 0 100px #6366f155"
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <motion.div 
            className="text-center"
            animate={{
              textShadow: [
                "0 0 8px rgba(48,213,200,0.4)",
                "0 0 16px rgba(48,213,200,0.6)",
                "0 0 8px rgba(48,213,200,0.4)"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="text-cyan-400 text-sm font-semibold mb-2 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>Did you know?</span>
            </div>
            <motion.p 
              className="text-lg md:text-xl text-white font-medium"
              key={Math.floor(Date.now() / 5000)} // Changes every 5 seconds
            >
              {[
                "AI teams launch 7x faster with SKRBL automation.",
                "Your competitive advantage starts with the right AI strategy.",
                "Most businesses waste 20+ hours/week on tasks AI could handle."
              ][Math.floor(Date.now() / 5000) % 3]}
            </motion.p>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Bottom Pseudo-3D Deck Panel */}
      <motion.div
        variants={{
          initial: { opacity: 0, y: 20 },
          entry: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.6 } },
          float: { y: [0, -6, 0], transition: { duration: 6, repeat: Infinity, repeatType: 'reverse' as const, ease: 'easeInOut' as const } }
        }}
        initial="initial"
        animate={["entry","float"]}
        whileHover={{ scale: 1.02, perspective: 1000, rotateX: 2, rotateY: -2 }}
        whileTap={{ scale: 0.97, perspective: 1000, rotateX: -1, rotateY: 1 }}
        className="relative"
      >
        {/* Glowing deck background */}
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 via-cyan-500/20 to-blue-500/20 rounded-3xl blur-xl transform -rotate-1"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/60 to-slate-900/80 rounded-2xl backdrop-blur-sm border border-teal-400/30 shadow-2xl"></div>
        
        {/* Content */}
        <div className="relative p-6 text-center">
          <div className="text-sm text-gray-400 mb-2">Your AI transformation starts here</div>
          <div className="text-lg font-semibold text-teal-400">Ready when you are • 24/7 Support</div>
        </div>
      </motion.div>

      {/* Floating Widget Preview */}
      {showFloatingWidget && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20 cursor-pointer"
               style={{ touchAction: 'manipulation' }}>
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
        </motion.div>
      )}

      {/* Live Social Proof Notification */}
      <AnimatePresence>
        {currentSocialProof && (
          <motion.div
            initial={{ opacity: 0, x: 300, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -100, scale: 0.9 }}
            className="absolute top-4 right-4 z-[60] max-w-xs bg-gradient-to-r from-green-900/90 to-emerald-900/90 backdrop-blur-lg rounded-xl shadow-2xl border border-green-400/30 p-3"
          >
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-400/20 flex items-center justify-center">
                <span className="text-green-400">🚀</span>
              </div>
              <div className="flex-1">
                <p className="text-white text-xs font-medium leading-tight">
                  {currentSocialProof?.message}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Just now
                </p>
              </div>
              <motion.div
                className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Founder Dashboard Overlay - Triggered by Master Code */}
      <FounderDashboardOverlay 
        isVisible={showFounderDashboard}
        onClose={() => {
          setShowFounderDashboard(false);
          trackBehavior('founder_dashboard_closed', { 
            timestamp: new Date().toISOString()
          });
        }}
      />

      {/* [FEATURE] Coming Soon Modal JSX (add near the end of the component's return) */}
      {comingSoonOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-transparent backdrop-blur-xl border-2 border-teal-400/30 rounded-2xl shadow-xl p-8 max-w-md w-full text-center relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-white" onClick={() => setComingSoonOpen(false)} aria-label="Close">✕</button>
            <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
            <p className="mb-4">This feature will launch soon. Want early access?</p>
            <button className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2 rounded-lg font-semibold shadow" onClick={() => { /* TODO: Implement waitlist logic */ setComingSoonOpen(false); toast.success('Added to waitlist!'); }}>Join Waitlist</button>
          </div>
        </div>
      )}
    </motion.div>
  );
}