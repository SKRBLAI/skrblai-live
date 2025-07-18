'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
// Import only the Lucide icons actively used in the UI
import { Sparkles, ArrowRight, Target, TrendingUp } from 'lucide-react';
import { useAuth } from '@/components/context/AuthContext';
import { usePercyContext } from '@/components/assistant/PercyProvider';
import toast from 'react-hot-toast';
import SkrblAiText from '@/components/ui/SkrblAiText';
import UniversalPromptBar from '@/components/ui/UniversalPromptBar';
import PercyAvatar from './PercyAvatar';
import StatCounter from '@/components/features/StatCounter';

interface OnboardingStep {
  id: string;
  type: 'greeting' | 'instant-analysis' | 'goal-selection' | 'signup' | 'email-verification' | 'welcome' | 'farewell' | 'custom-needs';
  percyMessage: string;
  options?: { id: string; label: string; icon: string; action: string; data?: any }[];
  showInput?: boolean;
  inputType?: 'email' | 'text' | 'password' | 'url' | 'vip-code' | 'phone' | 'sms-code';
  inputPlaceholder?: string;
  showSkip?: boolean;
  analysisMode?: 'website' | 'business' | 'linkedin' | 'sports' | 'content' | 'book-publishing' | 'custom';
  vipCodeEntry?: boolean;
}

// Removed legacy VIP_CODES constant – we now validate codes on-the-fly inside validateVIPCode

// --- Percy Onboarding Revolution with Animated Intro & Container Pulse ---

const introMessages = [
  "Hey, I'm Percy! What brings you to SKRBL AI today? 👋",
  "Need help navigating SKRBL AI? Just ask Percy!",
  "Percy here—ready to guide your AI journey!"
];

// Type for competitive analysis result
interface AnalysisResults {
  mode: string;
  input: string;
  insights: string[];
}

export default function PercyOnboardingRevolution() {
  const router = useRouter();
  // NEW: Use the auth context to check verification status
  const { user, session, isEmailVerified, shouldShowOnboarding, setOnboardingComplete } = useAuth();
  const { trackBehavior, setIsOnboardingActive } = usePercyContext();
  const [currentStep, setCurrentStep] = useState<string>('greeting');
  const [isPercyThinking, setIsPercyThinking] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [showFloatingWidget, setShowFloatingWidget] = useState(false);
  const [userGoal, setUserGoal] = useState('');
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [userInput, setUserInput] = useState<string>('');
  const [vipCode, setVipCode] = useState<string>('');
  const [isVIPUser, setIsVIPUser] = useState(false);
  const [vipTier, setVipTier] = useState<'gold' | 'platinum' | 'diamond' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);

  // Enhanced Percy personality state
  const [percyMood, setPercyMood] = useState<'excited' | 'analyzing' | 'celebrating' | 'confident' | 'scanning'>('excited');
  const [intelligenceScore] = useState(247); // Percy's enhanced IQ
  const [businessesTransformed] = useState(47213);
  // Business stats counters for unified section
  const [liveUsers] = useState(1251);
  const [agentsDeployed] = useState(92);
  const [revenueGenerated] = useState(2849718);
  const [competitiveInsights, setCompetitiveInsights] = useState<string[]>([]);

  // Typewriter effect for prompt bar
  const [promptBarTypewriter, setPromptBarTypewriter] = useState<string>('');
  const [promptBarFocused, setPromptBarFocused] = useState(false);
  const [promptBarActive, setPromptBarActive] = useState(false);

  const chatRef = useRef<HTMLDivElement>(null);
  const typewriterMessages = ['Talk to Percy Here...', 'Ask me anything...', 'Let\'s dominate together...', 'Your AI concierge awaits...'];

  // --- Animated Intro Message State ---
  const [introIdx, setIntroIdx] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [userInteracted, setUserInteracted] = useState(false);
  const [pulseActive, setPulseActive] = useState(false);

  // NEW: Early return if user is verified - no onboarding needed
  useEffect(() => {
    if (isEmailVerified) {
      console.log('[PERCY] User is verified - hiding onboarding');
      setIsOnboardingActive(false);
      setOnboardingComplete(true);
      return;
    }
    
    // Only show onboarding for unverified users
    if (shouldShowOnboarding) {
      console.log('[PERCY] Showing onboarding for unverified user');
      setIsOnboardingActive(true);
    }
  }, [isEmailVerified, shouldShowOnboarding, setIsOnboardingActive, setOnboardingComplete]);

  // NEW: Hide onboarding completely if user is verified
  if (isEmailVerified) {
    console.log('[PERCY] User is verified - not rendering onboarding');
    return null;
  }

  // NEW: Only show onboarding if shouldShowOnboarding is true
  if (!shouldShowOnboarding) {
    console.log('[PERCY] Should not show onboarding - not rendering');
    return null;
  }

  // Typewriter/cycling effect for intro messages
  useEffect(() => {
    if (userInteracted) return;
    setTypedText('');
    let idx = 0;
    let timeout: NodeJS.Timeout;
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

  // Typewriter effect for prompt bar (loops when idle)
  useEffect(() => {
    if (promptBarFocused || promptBarActive) return;
    
    let messageIndex = 0;
    let charIndex = 0;
    let timeout: NodeJS.Timeout;
    
    const typeChar = () => {
      const currentMessage = typewriterMessages[messageIndex];
      if (charIndex < currentMessage.length) {
        setPromptBarTypewriter(currentMessage.slice(0, charIndex + 1));
        charIndex++;
        timeout = setTimeout(typeChar, 100);
      } else {
        // Message complete, wait then move to next message
        timeout = setTimeout(() => {
          messageIndex = (messageIndex + 1) % typewriterMessages.length;
          charIndex = 0;
          setPromptBarTypewriter('');
        }, 2000);
      }
    };
    
    typeChar();
    return () => clearTimeout(timeout);
  }, [promptBarFocused, promptBarActive, typewriterMessages]);

  // Mark user as interacted on any onboarding action
  const handleAnyInteraction = useCallback(() => {
    if (!userInteracted) setUserInteracted(true);
    setPulseActive(false);
  }, [userInteracted]);

  // VIP Code validation
  const validateVIPCode = async (code: string): Promise<{ isValid: boolean; tier: 'gold' | 'platinum' | 'diamond' | null }> => {
    // VIP code patterns
    const vipCodes = {
      'SKRBL-VIP-GOLD-2024': 'gold',
      'SKRBL-VIP-PLATINUM-2024': 'platinum', 
      'SKRBL-VIP-DIAMOND-2024': 'diamond',
      'PERCY-EXCLUSIVE-GOLD': 'gold',
      'PERCY-EXCLUSIVE-PLATINUM': 'platinum',
      'PERCY-EXCLUSIVE-DIAMOND': 'diamond',
      'DOMINATE-VIP-ACCESS': 'platinum',
      'COMPETITIVE-EDGE-VIP': 'diamond'
    };

    const upperCode = code.toUpperCase().trim();
    const tier = vipCodes[upperCode as keyof typeof vipCodes];
    
    if (tier) {
      return { isValid: true, tier: tier as 'gold' | 'platinum' | 'diamond' };
    }
    
    return { isValid: false, tier: null };
  };

  const onboardingSteps: Record<string, OnboardingStep> = {
    greeting: {
      id: 'greeting',
      type: 'greeting',
      percyMessage: `🚀 **Welcome to the revolution!** I'm Percy, your cosmic concierge and architect of digital dominance. I've transformed **${businessesTransformed.toLocaleString()}** businesses this quarter alone - making their competition completely irrelevant.\n\n✨ **Here's what I do**: I analyze your business, deploy the perfect AI agent army, and watch your competitors scramble to catch up. \n\n**So, tell me - what brings you to me today? You must be ready to WIN since you're here!**`,
      options: [
        { id: 'website-scan', label: '🌐 Analyze my website & crush SEO competition', icon: '⚡', action: 'instant-website-analysis' },
        { id: 'content-creator', label: '✍️ I create content & need to dominate', icon: '📝', action: 'instant-content-analysis' },
        { id: 'book-publisher', label: '📚 I\'m writing/publishing books', icon: '✨', action: 'instant-book-analysis' },
        { id: 'business-strategy', label: '🏢 Scale my business with AI automation', icon: '🎯', action: 'instant-business-analysis' },
        { id: 'linkedin-profile', label: '💼 Build my professional brand', icon: '📈', action: 'instant-linkedin-analysis' },
        { id: 'sports-analysis', label: '🏆 Athletic performance optimization', icon: '⚽', action: 'sports-routing' },
        { id: 'custom-needs', label: '💬 Something else - let me explain', icon: '🎤', action: 'custom-needs-analysis' }
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
    'analysis-results': {
      id: 'analysis-results',
      type: 'goal-selection',
      percyMessage: `🔥 **ANALYSIS COMPLETE - COMPETITIVE ADVANTAGE IDENTIFIED!**\n\nBased on my scan, I've identified **3 major opportunities** where you can leave your competition in the dust:\n\n${competitiveInsights.map((insight, i) => `**${i + 1}.** ${insight}`).join('\n\n')}\n\n**Ready to deploy the AI agents that'll automate these advantages?**`,
      options: [
        { id: 'deploy-now', label: '🚀 Deploy my AI advantage now!', icon: '⚡', action: 'goal-selection' },
        { id: 'learn-more', label: '🧠 Show me exactly how this works', icon: '🤖', action: 'show-intelligence' },
        { id: 'another-scan', label: '🔄 Analyze something else first', icon: '🔍', action: 'back-to-greeting' }
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
      percyMessage: `📧 **ALMOST THERE!** I just sent a verification link to **${userEmail}**.\n\n🎯 **While you check your email**: I'm already analyzing your industry and preparing your competitive advantage report. This usually takes my competitors 2-3 weeks. I'll have it ready in **3 minutes**.\n\n**Click the verification link and let's make your competition irrelevant!**`,
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
    }
  };

  const getCurrentStep = () => onboardingSteps[currentStep];

  const handlePercyThinking = async (duration = 2000) => {
    setIsPercyThinking(true);
    setPercyMood('analyzing');
    await new Promise(resolve => setTimeout(resolve, duration));
    setIsPercyThinking(false);
    setPercyMood('confident');
  };

  // Enhanced analysis simulation
  const performAnalysis = async (mode: string, input: string) => {
    setIsPercyThinking(true);
    setPercyMood('scanning');
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    let insights: string[] = [];
    
    switch (mode) {
      case 'website':
        insights = [
          `**SEO Gap**: Your site is missing 47 high-traffic keywords your competitors rank for`,
          `**Conversion Killer**: Your CTA placement could increase conversions by 340%`,
          `**Speed Advantage**: Site optimization could make you 2.3x faster than top competitors`
        ];
        break;
      case 'business':
        insights = [
          `**Automation Opportunity**: 78% of your processes can be automated for 10x efficiency`,
          `**Market Gap**: There's a $47K/month opportunity your competitors are missing`,
          `**Content Strategy**: AI-generated content could capture 340% more leads`
        ];
        break;
      case 'linkedin':
        insights = [
          `**Authority Gap**: Consistent posting could establish you as the #1 expert in 90 days`,
          `**Network Growth**: Strategic connections could open doors to $127K opportunities`,
          `**Content Strategy**: LinkedIn AI automation could 5x your professional influence`
        ];
        break;
      case 'content':
        insights = [
          `**Content Gap**: Your audience is hungry for content that 89% of creators are ignoring`,
          `**Viral Formula**: AI-analyzed patterns show 340% higher engagement potential`,
          `**Monetization Blind Spot**: You're missing $23K/month in revenue opportunities`
        ];
        break;
      case 'book-publishing':
        insights = [
          `**Market Positioning**: 67% of your genre competitors are targeting the wrong audience`,
          `**Authority Platform**: Strategic content could establish you as THE expert before publication`,
          `**Revenue Streams**: Authors in your space miss 5 income channels worth $127K annually`
        ];
        break;
      case 'custom':
        insights = [
          `**Hidden Opportunity**: I've identified 3 automation points that could save 15+ hours weekly`,
          `**Competitive Edge**: Your industry has gaps that AI could fill for massive advantage`,
          `**Scale Potential**: With the right agents, you could 10x impact without burning out`
        ];
        break;
    }
    
    setCompetitiveInsights(insights);
    setAnalysisResults({ mode, input, insights });
    setCurrentStep('analysis-results');
    setIsPercyThinking(false);
    setPercyMood('celebrating');
  };

  // Narrow type for option actions for safer handling
  type OnboardingOption = {
    id: string;
    label: string;
    icon: string;
    action: string;
    data?: Record<string, unknown>;
  };

  const handleOptionClick = async (option: OnboardingOption) => {
    if (option.action === 'route-to-sports') {
      // Track behavior before navigation
      trackBehavior('sports_routing', { from: currentStep });
      router.push('/sports');
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
      await handlePercyThinking(1000);
      return;
    }

    if (option.action === 'select-goal' && option.data?.goal) {
      setUserGoal(option.data.goal as string);
      setCurrentStep('signup');
      await handlePercyThinking(1500);
      return;
    }

    if (option.action === 'goal-selection') {
      setCurrentStep('goal-selection');
      await handlePercyThinking(1000);
      return;
    }

    if (option.action === 'launch-dashboard') {
      trackBehavior('dashboard_navigation', { from: 'onboarding', userGoal });
      router.push('/dashboard');
      return;
    }

    if (option.action === 'explore-agents') {
      trackBehavior('agents_navigation', { from: 'onboarding', userGoal });
      router.push('/agents');
      return;
    }

    if (option.action === 'complete-verification') {
      setCurrentStep('welcome');
      await handlePercyThinking(1500);
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
      await handlePercyThinking(1000);
      return;
    }

    if (option.action === 'back-to-signup') {
      setCurrentStep('signup');
      setPercyMood('excited');
      return;
    }

    if (option.action === 'launch-vip-dashboard') {
      trackBehavior('vip_dashboard_navigation', { from: 'vip_onboarding', vipTier, userGoal });
      router.push('/dashboard?vip=true');
      return;
    }

    if (option.action === 'explore-vip-features') {
      trackBehavior('vip_features_navigation', { from: 'vip_onboarding', vipTier });
      router.push('/features?vip=true');
      return;
    }

    // Handle analysis mode selections
    if (option.action.startsWith('instant-')) {
      setCurrentStep(option.action);
      setPercyMood('scanning');
      trackBehavior('analysis_started', { mode: option.action.replace('instant-', '') });
      await handlePercyThinking(1000);
    }
  };

  const handleInputSubmit = async () => {
    if (!inputValue.trim()) {
      toast.error('Please enter a valid input');
      return;
    }

    const step = getCurrentStep();
    
    if (step.type === 'instant-analysis' && step.analysisMode) {
      setUserInput(inputValue);
      await performAnalysis(step.analysisMode, inputValue);
      setInputValue('');
      return;
    }

    if (step.type === 'signup') {
      // Phone number entry
      if (step.inputType === 'phone') {
        const phone = inputValue.trim();
        if (!phone) {
          toast.error('Enter a valid phone number');
          return;
        }
        try {
          setPhoneNumber(phone);
          setPercyMood('analyzing');
          await handlePercyThinking(1500);
          const res = await fetch('/api/sms/send-verification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber: phone })
          });
          const data = await res.json();
          if (!data.success) throw new Error(data.error || 'Failed to send code');
          toast.success('📲 Verification code sent!');
          setInputValue('');
          setCurrentStep('code-entry');
          setPercyMood('scanning');
        } catch (err: any) {
          toast.error(err.message || 'SMS failed');
          setPercyMood('confident');
        }
        return;
      }

      // SMS code entry
      if (step.inputType === 'sms-code') {
        const code = inputValue.trim();
        if (code.length !== 6) {
          toast.error('Enter the 6-digit code');
          return;
        }
        try {
          setPercyMood('analyzing');
          await handlePercyThinking(1000);
          const res = await fetch('/api/sms/verify-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phoneNumber, code })
          });
          const data = await res.json();
          if (!data.success) throw new Error(data.error || 'Invalid code');
          toast.success('✅ Phone verified!');
          setPhoneVerified(true);
          setInputValue('');
          setCurrentStep('signup'); // fall back to original email signup step
          setPercyMood('celebrating');
          return;
        } catch (err: any) {
          toast.error(err.message || 'Verification failed');
          setPercyMood('confident');
          return;
        }
      }

      // Handle VIP code entry
      if (step.vipCodeEntry) {
        const vipValidation = await validateVIPCode(inputValue);
        if (vipValidation.isValid && vipValidation.tier) {
          setVipCode(inputValue);
          setIsVIPUser(true);
          setVipTier(vipValidation.tier);
          setInputValue('');
          setPercyMood('celebrating');
          
          await handlePercyThinking(2000);
          setCurrentStep('vip-welcome');
          toast.success(`🏆 VIP ${vipValidation.tier.toUpperCase()} ACCESS CONFIRMED!`, {
            icon: '👑',
            duration: 4000,
          });
          
          // Track VIP activation
          trackBehavior('vip_activated', { 
            vipTier: vipValidation.tier, 
            code: inputValue,
            userGoal 
          });
        } else {
          toast.error('Invalid VIP code. Please check and try again.');
          setPercyMood('confident');
        }
        return;
      }

      // Require phone verified before email signup
      if (!phoneVerified) {
        setCurrentStep('phone-entry');
        toast('📱 Let’s secure your account – phone first!', { icon: '📲' });
        return;
      }

      // Handle regular email signup
      if (!inputValue.includes('@')) {
        toast.error('Please enter a valid email address');
        return;
      }
      setUserEmail(inputValue);
      setInputValue('');
      
      try {
        await handlePercyThinking(3000);
        setCurrentStep(isVIPUser ? 'vip-welcome' : 'email-verification');
        toast.success('🚀 Verification email sent! Check your inbox.');
      } catch (error) {
        toast.error('Something went wrong. Please try again.');
      }
    }
  };

  const resendVerificationEmail = async () => {
    await handlePercyThinking(1000);
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

  const step = getCurrentStep();

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row md:items-start gap-8 pointer-events-auto touch-manipulation" data-percy-onboarding>
      {/* Left Column – Percy Avatar & Intro */}
      <div className="relative w-full md:w-1/3 max-w-xs mx-auto px-2 md:px-0 flex-shrink-0 pointer-events-auto">
    {/* Animated Percy Welcome Intro + Avatar */}
    <div className="flex flex-col items-center gap-2 mb-4 select-none pointer-events-auto">
      <div className="pointer-events-auto touch-manipulation">
        <PercyAvatar size="lg" animate={!userInteracted} />
      </div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full pointer-events-auto"
      >
        <span
          className="block font-bold text-lg md:text-xl text-cyan-300 text-center tracking-tight pointer-events-auto"
          style={{ minHeight: 32 }}
          aria-live="polite"
        >
          {typedText}
        </span>
      </motion.div>
      <div className="text-right text-xs text-gray-400 pointer-events-auto">
        <div>Businesses Transformed</div>
        <div className="text-cyan-400 font-bold">{businessesTransformed.toLocaleString()}</div>
      </div>
    </div>
  </div>

      {/* Right Column – Chat, Stats, PromptBar */}
      <div className="flex-1 pointer-events-auto">

        {/* Chat Messages */}
        <div 
          ref={chatRef} 
          className="p-4 sm:p-6 min-h-[400px] max-h-[500px] sm:max-h-[600px] overflow-y-auto pointer-events-auto"
          style={{ 
            scrollBehavior: 'smooth',
            touchAction: 'pan-y',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch'
          }}
          data-percy-chat-container
        >
          <AnimatePresence>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.5 }}
              className="mb-6 pointer-events-auto"
            >
              {/* Percy Message */}
              <div className="flex items-start space-x-3 mb-4 pointer-events-auto">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center flex-shrink-0 pointer-events-auto">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 pointer-events-auto">
                  <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-xl p-3 sm:p-4 border border-cyan-400/20 pointer-events-auto">
                    <div className="prose prose-invert prose-sm max-w-none pointer-events-auto">
                      {step.percyMessage.split('\n').map((line, i) => (
                        <p key={i} className="mb-2 last:mb-0 pointer-events-auto text-sm sm:text-base">
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
                  className="mb-4 bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-xl p-3 sm:p-4 border border-green-400/20 pointer-events-auto"
                >
                  <h4 className="text-green-400 font-bold mb-3 flex items-center gap-2 pointer-events-auto text-sm sm:text-base">
                    <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                    Competitive Intelligence Report
                  </h4>
                  <div className="space-y-2 pointer-events-auto">
                    {competitiveInsights.map((insight, i) => (
                      <div key={i} className="flex items-start gap-2 pointer-events-auto">
                        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-200 text-xs sm:text-sm pointer-events-auto">{insight}</span>
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
                  className="flex items-center space-x-2 mb-4 text-cyan-400 pointer-events-auto"
                >
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-xs sm:text-sm">Percy is analyzing...</span>
                </motion.div>
              )}

              {/* Input Field */}
              {step.showInput && (
                <div className="mb-4 pointer-events-auto">
                  <div className="relative pointer-events-auto">
                    <input
                      type={step.inputType}
                      value={inputValue}
                      onChange={(e) => {
                        setInputValue(e.target.value);
                        handleAnyInteraction();
                      }}
                      placeholder={step.inputPlaceholder}
                      className="w-full px-3 sm:px-4 py-3 pr-12 bg-slate-800/80 border border-cyan-400/30 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 pointer-events-auto text-sm sm:text-base"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleInputSubmit();
                        }
                      }}
                      onFocus={() => handleAnyInteraction()}
                      data-percy-input
                      style={{ 
                        touchAction: 'manipulation',
                        fontSize: '16px' // Prevents zoom on iOS
                      }}
                    />
                    <motion.button
                      onClick={() => {
                        handleInputSubmit();
                        handleAnyInteraction();
                      }}
                      className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-cyan-400 hover:text-cyan-300 transition-colors pointer-events-auto min-w-[44px] min-h-[44px] flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      style={{ touchAction: 'manipulation' }}
                      data-percy-submit-button
                    >
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Options */}
              {step.options && (
                <div className="space-y-2 pointer-events-auto">
                  {step.options.map((option) => (
                    <motion.button
                      key={option.id}
                      onClick={() => {
                        handleOptionClick(option);
                        handleAnyInteraction();
                      }}
                      className="w-full text-left p-3 sm:p-4 rounded-xl bg-gradient-to-r from-slate-700/50 to-slate-800/50 border border-cyan-400/20 hover:border-cyan-400/40 active:border-cyan-400/60 transition-all group pointer-events-auto min-h-[44px] flex items-center"
                      whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(56, 189, 248, 0.3)' }}
                      whileTap={{ scale: 0.98 }}
                      style={{ touchAction: 'manipulation' }}
                      data-percy-option={option.id}
                    >
                      <div className="flex items-center space-x-3 pointer-events-auto w-full">
                        <span className="text-xl sm:text-2xl pointer-events-none flex-shrink-0">{option.icon}</span>
                        <span className="text-white font-medium group-hover:text-cyan-300 group-active:text-cyan-200 transition-colors pointer-events-none text-sm sm:text-base flex-1">
                          {option.label}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      {/* End of Chat Messages wrapper */}

      {/* Unified Business Stats moved from HomePage */}
      <div className="w-full mt-6 sm:mt-8 pointer-events-auto" data-percy-stats>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 pointer-events-auto">
          <div 
            className="text-center p-3 sm:p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 pointer-events-auto hover:bg-white/10 active:bg-white/15 transition-all cursor-pointer min-h-[44px] flex flex-col justify-center"
            onClick={() => handleAnyInteraction()}
            style={{ touchAction: 'manipulation' }}
            data-percy-stat="businesses-transformed"
          >
            <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 pointer-events-auto">
              <StatCounter 
                end={liveUsers} 
                duration={2000} 
                theme="electric"
                cosmicGlow={true}
                delay={300}
              />
            </div>
            <div className="text-xs sm:text-sm text-gray-400 pointer-events-auto">Businesses Transformed Today</div>
            <div className="text-xs text-teal-400 mt-1 pointer-events-auto">▲ Still climbing</div>
          </div>
          <div 
            className="text-center p-3 sm:p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 pointer-events-auto hover:bg-white/10 active:bg-white/15 transition-all cursor-pointer min-h-[44px] flex flex-col justify-center"
            onClick={() => handleAnyInteraction()}
            style={{ touchAction: 'manipulation' }}
            data-percy-stat="competitors-eliminated"
          >
            <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 pointer-events-auto">
              <StatCounter 
                end={agentsDeployed} 
                duration={2000} 
                theme="teal"
                cosmicGlow={true}
                delay={600}
              />
            </div>
            <div className="text-xs sm:text-sm text-gray-400 pointer-events-auto">Competitors Eliminated</div>
            <div className="text-xs text-electric-blue mt-1 pointer-events-auto">▲ Per minute</div>
          </div>
          <div 
            className="text-center p-3 sm:p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 pointer-events-auto hover:bg-white/10 active:bg-white/15 transition-all cursor-pointer min-h-[44px] flex flex-col justify-center"
            onClick={() => handleAnyInteraction()}
            style={{ touchAction: 'manipulation' }}
            data-percy-stat="revenue-generated"
          >
            <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 pointer-events-auto">
              <StatCounter 
                end={Math.floor(revenueGenerated/1000)} 
                duration={2000} 
                prefix="$"
                suffix="K+"
                theme="pink"
                cosmicGlow={true}
                delay={900}
              />
            </div>
            <div className="text-xs sm:text-sm text-gray-400 pointer-events-auto">Revenue Generated</div>
            <div className="text-xs text-fuchsia-400 mt-1 pointer-events-auto">▲ This month</div>
          </div>
        </div>
      </div>

      {/* Floating Widget Preview */}
      {showFloatingWidget && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="fixed bottom-6 right-6 z-50 pointer-events-auto"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20 pointer-events-auto cursor-pointer"
               style={{ touchAction: 'manipulation' }}>
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-pulse" />
          </div>
        </motion.div>
      )}

      {/* Integrated Universal Prompt Bar with Typewriter Effect */}
      <div className="mt-6 px-2 sm:px-4 pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative pointer-events-auto"
        >
          {/* Typewriter Effect Overlay */}
          {!promptBarFocused && !promptBarActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center"
            >
              <motion.div 
                className="cosmic-glass bg-gradient-to-r from-slate-800/95 to-slate-900/95 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-3 border border-cyan-400/30 shadow-[0_0_20px_rgba(56,189,248,0.3)] pointer-events-none"
                animate={{ 
                  boxShadow: ['0_0_20px_rgba(56,189,248,0.3)', '0_0_30px_rgba(56,189,248,0.5)', '0_0_20px_rgba(56,189,248,0.3)']
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="text-transparent bg-gradient-to-r from-cyan-300 via-teal-400 to-cyan-300 bg-clip-text font-medium tracking-wide text-xs sm:text-sm md:text-base pointer-events-none">
                  {promptBarTypewriter}
                  <span className="animate-pulse text-cyan-400">|</span>
                </span>
              </motion.div>
            </motion.div>
          )}
          
          <div
            onFocus={() => {
              setPromptBarFocused(true);
              handleAnyInteraction();
            }}
            onBlur={() => setPromptBarFocused(false)}
            onClick={() => {
              setPromptBarFocused(true);
              setPromptBarActive(true);
              handleAnyInteraction();
            }}
            className="pointer-events-auto"
            style={{ touchAction: 'manipulation' }}
            data-percy-prompt-bar
          >
            <UniversalPromptBar
              title="Chat with Percy"
              description="Upload files, ask questions, or get AI assistance"
              placeholder="What can I help you dominate today?"
              theme="dark"
              className="transition-all duration-300 pointer-events-auto"
              onPromptSubmit={(prompt) => {
                setPromptBarActive(true);
                handleAnyInteraction();
                // Handle the prompt submission through Percy context
                trackBehavior('percy_prompt_submitted', { 
                  prompt, 
                  source: 'onboarding_prompt_bar',
                  currentStep 
                });
              }}
              onComplete={(data) => {
                setPromptBarActive(true);
                handleAnyInteraction();
                console.log('Percy interaction complete:', data);
              }}
              acceptedFileTypes=".pdf,.doc,.docx,.txt,.csv,.xlsx,.png,.jpg,.jpeg"
              fileCategory="onboarding"
              intentType="percy_assistance"
            />
          </div>
        </motion.div>
      </div>
    </div> {/* End Right Column */}

    </div>
  );
}