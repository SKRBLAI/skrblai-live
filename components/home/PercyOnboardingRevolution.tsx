'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
// Import only the Lucide icons actively used in the UI
import { Sparkles, ArrowRight, Target, TrendingUp, RotateCcw, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePercyContext } from '../assistant/PercyProvider';
import toast from 'react-hot-toast';
import SkrblAiText from '../ui/SkrblAiText';
import UniversalPromptBar from '../ui/UniversalPromptBar';
import PercyAvatar from './PercyAvatar';
import StatCounter from '../features/StatCounter';
import FounderDashboardOverlay from '../admin/FounderDashboardOverlay';

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

  // Founder Dashboard state
  const [showFounderDashboard, setShowFounderDashboard] = useState(false);

  // Enhanced Percy personality state
  const [percyMood, setPercyMood] = useState<'excited' | 'analyzing' | 'celebrating' | 'confident' | 'scanning' | 'thinking' | 'waving' | 'nodding'>('excited');
  const [intelligenceScore] = useState(247); // Percy's enhanced IQ
  const [businessesTransformed] = useState(47213);
  
  // Enhanced feedback states
  const [lastInteractionType, setLastInteractionType] = useState<string>('');
  const [userReturnVisit, setUserReturnVisit] = useState(false);
  const [personalizedGreeting, setPersonalizedGreeting] = useState('');
  // Business stats counters for unified section - Enhanced with live data
  const [liveMetrics, setLiveMetrics] = useState({
    liveUsers: 1251,
    agentsDeployed: 92,
    revenueGenerated: 2849718,
    businessesTransformed: 47213
  });
  const [socialProofMessages, setSocialProofMessages] = useState<any[]>([]);
  const [currentSocialProof, setCurrentSocialProof] = useState<any>(null);
  const [competitiveInsights, setCompetitiveInsights] = useState<string[]>([]);

  // Fix: define promptBarRef for the new integrated prompt bar
  const promptBarRef = useRef<HTMLInputElement>(null);
  const [promptBarValue, setPromptBarValue] = useState('');

  // Typewriter effect for prompt bar
  const [promptBarTypewriter, setPromptBarTypewriter] = useState<string>('');
  const [promptBarFocused, setPromptBarFocused] = useState(false);
  const [promptBarActive, setPromptBarActive] = useState(false);
  // New: dynamic placeholder for the integrated prompt bar
  const [promptBarPlaceholder, setPromptBarPlaceholder] = useState<string>('Need something else? Ask Percy...');

  const chatRef = useRef<HTMLDivElement>(null);
  const typewriterMessages = ['Talk to Percy Here...', 'Ask me anything...', 'Let\'s dominate together...', 'Your AI concierge awaits...'];

  // --- Animated Intro Message State ---
  const [introIdx, setIntroIdx] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [userInteracted, setUserInteracted] = useState(false);
  const [pulseActive, setPulseActive] = useState(false);

  // Enhanced initialization with personalization
  useEffect(() => {
    // Always activate Percy onboarding on homepage
    console.log('[PERCY] Activating onboarding for all users on homepage');
    setIsOnboardingActive(true);
    
    // Check if returning user
    const hasVisited = localStorage.getItem('percy_visited');
    const userName = localStorage.getItem('user_name') || (user?.email?.split('@')[0]);
    
    if (hasVisited && userName) {
      setUserReturnVisit(true);
      setPersonalizedGreeting(`Welcome back, ${userName}! 👋`);
      setPercyMood('waving');
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

  // Typewriter effect for prompt bar (loops when idle)
  useEffect(() => {
    if (promptBarFocused || promptBarActive) return;
    
    let messageIndex = 0;
    let charIndex = 0;
    let timeout: ReturnType<typeof setTimeout>;
    
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

  // Enhanced interaction handling with mood changes
  const handleAnyInteraction = useCallback((interactionType: string = 'general') => {
    if (!userInteracted) {
      setUserInteracted(true);
      setPercyMood('nodding'); // Percy nods when user first interacts
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
        { id: 'custom-needs', label: '💬 Something else - let me explain', icon: '🎤', action: 'custom-needs-analysis' },
        // New core actions
        { id: 'signup', label: '🚀 Sign Up', icon: '🚀', action: 'signup' },
        { id: 'have-code', label: '🔑 Have A Code?', icon: '🔑', action: 'have-code' },
        { id: 'my-dashboard', label: '📊 My Dashboard', icon: '📊', action: 'my-dashboard' }
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
    // New button actions
    if (option.action === 'signup') {
      setCurrentStep('signup');
      setPromptBarPlaceholder('Enter your email or phone');
      setPromptBarValue('');
      promptBarRef.current?.focus();
      return;
    }
    if (option.action === 'have-code') {
      setPromptBarPlaceholder('Enter Code Here');
      setPromptBarValue('');
      promptBarRef.current?.focus();
      return;
    }
    if (option.action === 'my-dashboard') {
      if (user) {
        trackBehavior('dashboard_navigation', { from: 'onboarding', method: 'button_click' });
        router.push('/dashboard');
      } else {
        setCurrentStep('signup');
        setPromptBarPlaceholder('Enter your email or phone');
        setPromptBarValue('');
        promptBarRef.current?.focus();
      }
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

    // MASTER CODE INTERCEPTION - Founder Dashboard Access
    if (inputValue.trim() === 'MMM_mstr') {
      console.log('[Founder Dashboard] Master code detected - activating founder overlay');
      setShowFounderDashboard(true);
      setInputValue(''); // Clear the input
      trackBehavior('founder_dashboard_access', { 
        timestamp: new Date().toISOString(),
        accessMethod: 'master_code'
      });
      return; // Exit early - do not proceed with normal onboarding logic
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
          handleAnyInteraction('successful_action');
          
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
        toast("📱 Let's secure your account – phone first!", { icon: '📲' });
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

  // Live Social Proof Integration
  useEffect(() => {
    const fetchLiveSocialProof = async () => {
      try {
        const response = await fetch('/api/social-proof/live-feed?type=signup&count=5&includeActivity=true');
        const result = await response.json();
        
        if (result.success) {
          setLiveMetrics(prev => ({
            ...prev,
            liveUsers: result.data.metrics.live.totalUsers,
            agentsDeployed: Math.floor(result.data.metrics.live.agentsLaunched / 1000),
            revenueGenerated: result.data.metrics.live.revenueGenerated,
            businessesTransformed: result.data.metrics.live.businessesTransformed
          }));
          
          setSocialProofMessages(result.data.socialProof);
          
          // Update competitive insights
          setCompetitiveInsights(result.data.metrics.competitive.recentAchievements);
        }
      } catch (error) {
        console.error('[Percy] Failed to fetch live social proof:', error);
      }
    };

    // Initial fetch
    fetchLiveSocialProof();
    
    // Update every 45 seconds
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

  // Helper functions for new prompt bar functionality
  const handlePromptBarSubmit = async () => {
    if (!promptBarValue.trim()) return;

    // MASTER CODE INTERCEPTION - Founder Dashboard Access
    if (promptBarValue.trim() === 'MMM_mstr') {
      console.log('[Founder Dashboard] Master code detected - activating founder overlay');
      setShowFounderDashboard(true);
      setPromptBarValue('');
      trackBehavior('founder_dashboard_access', { 
        timestamp: new Date().toISOString(),
        accessMethod: 'prompt_bar'
      });
      return; // Exit early
    }

    // VIP Code Detection in prompt bar
    const trimmed = promptBarValue.trim();
    const vipValidation = await validateVIPCode(trimmed);
    if (vipValidation.isValid && vipValidation.tier) {
      setVipCode(trimmed);
      setIsVIPUser(true);
      setVipTier(vipValidation.tier);
      setPromptBarValue('');
      setPromptBarPlaceholder('Need something else? Ask Percy...');
      await handlePercyThinking(2000);
      setCurrentStep('vip-welcome');
      toast.success(`🏆 VIP ${vipValidation.tier.toUpperCase()} ACCESS CONFIRMED!`, {
        icon: '👑',
        duration: 4000,
      });
      trackBehavior('vip_activated', { vipTier: vipValidation.tier, code: trimmed });
      return;
    }

    // If current chat step expects input, forward to chat handler
    const step = getCurrentStep();
    if (step.showInput) {
      setInputValue(promptBarValue);
      setPromptBarValue('');
      await handleInputSubmit();
      return;
    }

    // Handle general conversation - route to custom needs analysis
    setUserInput(promptBarValue);
    setInputValue(promptBarValue);
    setCurrentStep('custom-needs-analysis');
    setPromptBarPlaceholder('Go ahead, tell Percy what you need!');
    setPromptBarValue('');
  };

  const handleChatReset = () => {
    setCurrentStep('greeting');
    setInputValue('');
    setPromptBarValue('');
    setUserInteracted(false);
    setAnalysisResults(null);
    setCompetitiveInsights([]);
    setPercyMood('excited');
    toast.success('Conversation reset! Percy is ready to help again.', {
      icon: '🔄',
      duration: 2000,
    });
    trackBehavior('chat_reset', { from: currentStep });
  };

  const step = getCurrentStep();

  return (
    <motion.div
  className="w-full max-w-5xl mx-auto relative pointer-events-auto touch-manipulation"
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
      {/* Floating Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`bg-particle-${i}`}
            className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400/20 to-blue-400/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.sin(i) * 50, 0],
              opacity: [0, 0.6, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: i * 0.5,
              ease: 'easeInOut',
            }}
          />
        ))}
        
        {/* Larger ambient orbs */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`bg-orb-${i}`}
            className="absolute rounded-full bg-gradient-to-r from-teal-500/10 to-cyan-500/10 blur-xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${60 + Math.random() * 40}px`,
              height: `${60 + Math.random() * 40}px`,
            }}
            animate={{
              y: [0, -80, 0],
              x: [0, Math.cos(i) * 60, 0],
              opacity: [0.1, 0.3, 0.1],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 12 + Math.random() * 8,
              repeat: Infinity,
              delay: i * 1.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
      {/* Top Pseudo-3D Deck Panel */}
      <motion.div
        variants={{
          initial: { opacity: 0, y: -20 },
          entry: { opacity: 1, y: 0, transition: { duration: 0.8 } },
          float: { y: [0, -6, 0], transition: { duration: 6, repeat: Infinity, repeatType: 'reverse' as const, ease: 'easeInOut' as const } }
        }}
        initial="initial"
        animate={["entry","float"]}
        whileHover={{ scale: 1.02, perspective: 1000, rotateX: 2, rotateY: -2 }}
        whileTap={{ scale: 0.97, perspective: 1000, rotateX: -1, rotateY: 1 }}
        className="relative mb-8"
      >
        {/* Glowing deck background */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-teal-500/20 rounded-3xl blur-xl transform rotate-1"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800/60 to-slate-900/80 rounded-2xl backdrop-blur-sm border border-cyan-400/30 shadow-2xl"></div>
        
        {/* Percy Avatar and Intro - Centered on deck */}
        <div className="relative p-8 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-6"
          >
            <PercyAvatar 
              size="lg" 
              animate={!userInteracted} 
              mood={percyMood}
              showParticles={percyMood === 'celebrating'}
              className="shadow-inner shadow-[inset_0_0_12px_rgba(0,0,0,0.7)]" 
            />
          </motion.div>
          
          <motion.div
            variants={{
              initial: { opacity: 0, y: -20 },
              entry: { opacity: 1, y: 0, transition: { duration: 0.8 } },
              float: { y: [0, -6, 0], transition: { duration: 6, repeat: Infinity, repeatType: 'reverse' as const, ease: 'easeInOut' as const } }
            }}
            initial="initial"
            animate={["entry","float"]}
            whileHover={{ scale: 1.02, perspective: 1000, rotateX: 2, rotateY: -2 }}
            whileTap={{ scale: 0.97, perspective: 1000, rotateX: -1, rotateY: 1 }}
            className="text-center"
          >
            <span
              className="block font-bold text-2xl md:text-3xl text-cyan-300 text-center tracking-tight mb-2 min-h-10"
              aria-live="polite"
            >
              {personalizedGreeting || typedText}
            </span>
            <div className="text-sm text-gray-400">
              <div>Businesses Transformed</div>
              <div className="text-cyan-400 font-bold text-lg">{businessesTransformed.toLocaleString()}</div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Chat and Options Container */}
      <div className="relative mb-8">
        {/* Subtle glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-teal-500/20 rounded-2xl blur-3xl"></div>
        <div className="relative bg-[rgba(21,23,30,0.7)] backdrop-blur-xl border border-teal-400/40 shadow-[0_0_32px_#30d5c899] shadow-inner rounded-2xl p-8">
          
          {/* Chat Messages */}
          <div 
            ref={chatRef} 
            className="min-h-[300px] max-h-[400px] overflow-y-auto overscroll-contain mb-6"
            data-percy-chat-container
          >
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
                            handleInputSubmit();
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
                        variants={{
                          initial: { opacity: 0, y: 16, scale: 0.96 }
                        }}
                        onClick={() => {
                          handleInputSubmit();
                          handleAnyInteraction();
                        }}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400 hover:text-cyan-300 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                        data-percy-submit-button
                      >
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* Onboarding Options - 2x2 Grid on Desktop */}
                {step.options && (
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
                    {step.options.slice(0, 4).length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {step.options.slice(0, 4).map((option) => (
                          <motion.button
                            variants={{
                              initial: { opacity: 0, y: 16, scale: 0.96, rotateX: -5 },
                              entry: { 
                                opacity: 1, 
                                y: 0, 
                                scale: 1, 
                                rotateX: 0,
                                transition: { type: 'spring', stiffness: 60, damping: 16 } 
                              },
                              float: { 
                                y: [0, -2, 0], 
                                rotateX: [0, 1, 0],
                                boxShadow: [
                                  '0 4px 20px rgba(45,212,191,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                                  '0 8px 32px rgba(45,212,191,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
                                  '0 4px 20px rgba(45,212,191,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
                                ],
                                transition: { duration: 5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' } 
                              }
                            }}
                            initial="initial"
                            animate={["entry","float"]}
                            whileHover={{ 
                              scale: 1.05, 
                              rotateX: 8, 
                              rotateY: -4, 
                              z: 20,
                              boxShadow: '0 20px 60px rgba(30,144,255,0.4), 0 8px 24px rgba(45,212,191,0.6), inset 0 1px 0 rgba(255,255,255,0.2)',
                              background: 'linear-gradient(145deg, rgba(21,23,30,0.8), rgba(45,212,191,0.1))',
                              transition: { duration: 0.2, ease: 'easeOut' }
                            }}
                            whileTap={{ 
                              scale: 0.98, 
                              rotateX: -3, 
                              rotateY: 2,
                              boxShadow: '0 2px 8px rgba(45,212,191,0.3), inset 0 2px 4px rgba(0,0,0,0.3)',
                              transition: { duration: 0.1 }
                            }}

                            key={option.id}
                            onClick={() => {
                              handleOptionClick(option);
                              handleAnyInteraction('option_click');
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleOptionClick(option);
                                handleAnyInteraction('option_click');
                              }
                            }}
                            tabIndex={0}
                            role="button"
                            aria-label={`Select ${option.label}`}
                                                          className="w-full text-left p-4 rounded-xl bg-[rgba(21,23,30,0.6)] backdrop-blur-md shadow-inner border border-teal-400/40 hover:border-teal-400/80 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/30 focus:outline-none transition-all group min-h-[60px] sm:min-h-[60px] min-h-[44px] flex items-center transform-gpu touch-manipulation"
                            style={{ 
                              perspective: '1000px',
                              transformStyle: 'preserve-3d',
                              background: 'linear-gradient(145deg, rgba(21,23,30,0.6), rgba(21,23,30,0.8))',
                              boxShadow: '0 4px 20px rgba(45,212,191,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
                            }}
                            data-percy-option={option.id}
                          >
                            <div className="flex items-center space-x-3 w-full">
                              <span className="text-2xl flex-shrink-0">{option.icon}</span>
                              <span className="text-white font-medium group-hover:text-cyan-300 group-active:text-cyan-200 transition-colors text-sm flex-1">
                                {option.label}
                              </span>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    )}
                    
                    {/* Remaining options (5th onwards) - full width stack */}
                    {step.options.slice(4).map((option) => (
                      <motion.button
                        variants={{
                          initial: { opacity: 0, y: 16, scale: 0.96 },
                          entry: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 60, damping: 16 } },
                          float: { y: [0, -2, 0], transition: { duration: 5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' } }
                        }}
                        initial="initial"
                        animate={["entry","float"]}
                        whileHover={{ scale: 1.03, rotateX: 3, rotateY: -3, boxShadow: '0 0 18px #30d5c8bb, 0 0 6px #6366f1cc' }}
                        whileTap={{ scale: 0.97, rotateX: -2, rotateY: 2 }}

                        key={option.id}
                        onClick={() => {
                          handleOptionClick(option);
                          handleAnyInteraction('option_click');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleOptionClick(option);
                            handleAnyInteraction('option_click');
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`Select ${option.label}`}
                        className="w-full text-left p-4 rounded-xl bg-[rgba(21,23,30,0.6)] backdrop-blur-sm shadow-inner shadow-[0_0_10px_rgba(45,212,191,0.4)] border border-teal-400/40 hover:border-teal-400/60 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/30 focus:outline-none transition-all group min-h-[60px] sm:min-h-[60px] min-h-[44px] flex items-center touch-manipulation"
                        data-percy-option={option.id}
                      >
                        <div className="flex items-center space-x-3 w-full">
                          <span className="text-2xl flex-shrink-0">{option.icon}</span>
                          <span className="text-white font-medium group-hover:text-cyan-300 group-active:text-cyan-200 transition-colors text-sm flex-1">
                            {option.label}
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </motion.div> 
             </AnimatePresence>
          </div>

          {/* Integrated Prompt/Upload Bar - Always visible under last option */}
          <motion.div
            variants={{
              initial: { opacity: 0, y: 18 },
              entry: { opacity: 1, y: 0, boxShadow: '0 0 24px #30d5c899', transition: { duration: 0.8, delay: 0.8 } },
              float: { y: [0, -3, 0], boxShadow: ['0 0 24px #30d5c899','0 0 40px #6366f1cc','0 0 24px #30d5c899'], transition: { duration: 7, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' } }
            }}
            initial="initial"
            animate={["entry","float"]}
            className="mt-6 pt-4 relative border-t border-teal-400/40"
            layout
          >
            <div className="relative">
              <motion.div className="relative">
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
                  placeholder={promptBarFocused ? promptBarPlaceholder : (promptBarTypewriter || promptBarPlaceholder)}
                  className="w-full px-4 py-3 pr-20 bg-[rgba(21,23,30,0.7)] backdrop-blur-md border border-teal-400/40 rounded-2xl text-white placeholder:text-gray-400 focus:outline-none focus:border-teal-200 focus:ring-2 focus:ring-teal-200/30 text-sm transition-all duration-200"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && promptBarValue.trim()) {
                      handlePromptBarSubmit();
                    }
                  }}
                  style={{ fontSize: '16px' }}
                  animate={promptBarFocused ? { 
                    scale: 1.035, 
                    boxShadow: [
                      '0 0 28px #30d5c8cc, 0 0 12px #6366f1bb',
                      '0 0 40px #30d5c8ff, 0 0 20px #6366f1ff',
                      '0 0 28px #30d5c8cc, 0 0 12px #6366f1bb'
                    ],
                    background: [
                      'rgba(21,23,30,0.7)',
                      'rgba(21,23,30,0.85)',
                      'rgba(21,23,30,0.7)'
                    ]
                  } : { 
                    scale: 1, 
                    boxShadow: '0 0 12px #30d5c899',
                    background: 'rgba(21,23,30,0.7)'
                  }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 90, 
                    damping: 18,
                    boxShadow: { duration: 2, repeat: promptBarFocused ? Infinity : 0 },
                    background: { duration: 2, repeat: promptBarFocused ? Infinity : 0 }
                  }}
                />
                
                {/* Animated Caret Effect */}
                {promptBarFocused && (
                  <motion.div
                    className="absolute right-24 top-1/2 w-0.5 h-4 bg-cyan-400"
                    style={{ transform: 'translateY(-50%)' }}
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
                
                {/* Input Ripple Effect */}
                <AnimatePresence>
                  {promptBarFocused && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl border-2 border-cyan-400/50"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ 
                        opacity: [0, 0.6, 0],
                        scale: [0.8, 1.1, 1.3],
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ 
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeOut'
                      }}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
              
              {/* Chat Reset Button */}
              <motion.button
                variants={{
                  initial: { opacity: 0, y: 16, scale: 0.96 },
                  entry: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 60, damping: 16 } },
                  float: { y: [0, -2, 0], transition: { duration: 5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' } }
                }}
                initial="initial"
                animate={["entry","float"]}
                whileHover={{ scale: 1.03, rotateX: 3, rotateY: -3, boxShadow: '0 0 18px #30d5c8bb, 0 0 6px #6366f1cc' }}
                whileTap={{ scale: 0.97, rotateX: -2, rotateY: 2 }}

                onClick={handleChatReset}
                className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-400 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
                title="Reset conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </motion.button>
              
              {/* Send Button */}
              <motion.button
                variants={{
                  initial: { opacity: 0, y: 16, scale: 0.96 },
                  entry: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 60, damping: 16 } },
                  float: { y: [0, -2, 0], transition: { duration: 5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' } }
                }}
                initial="initial"
                animate={["entry","float"]}
                whileHover={{ scale: 1.03, rotateX: 3, rotateY: -3, boxShadow: '0 0 18px #30d5c8bb, 0 0 6px #6366f1cc' }}
                whileTap={{ scale: 0.97, rotateX: -2, rotateY: 2 }}
                onClick={handlePromptBarSubmit}
                disabled={!promptBarValue.trim()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-cyan-400 hover:text-cyan-300 disabled:text-gray-600 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Restored Stats Cards Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="mb-8"
        data-percy-stats
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all">
            <div className="text-2xl md:text-3xl font-bold mb-1">
              <StatCounter 
                end={liveMetrics.liveUsers} 
                label="Live Users Online"
                duration={2500}
              />
            </div>
            <div className="text-sm text-gray-400">Live Users Online</div>
            <div className="text-xs text-teal-400 mt-1">▲ Active now</div>
          </div>
          
          <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all">
            <div className="text-2xl md:text-3xl font-bold mb-1">
              <StatCounter 
                end={liveMetrics.agentsDeployed} 
                label="Agents Deployed"
                duration={2500}
              />
            </div>
            <div className="text-sm text-gray-400">Agents Deployed</div>
            <div className="text-xs text-electric-blue mt-1">▲ This hour</div>
          </div>
          
          <div className="text-center p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all">
            <div className="text-2xl md:text-3xl font-bold mb-1">
              <StatCounter 
                end={liveMetrics.revenueGenerated} 
                prefix="$"
                suffix="+"
                label="Revenue Generated"
                duration={3000}
              />
            </div>
            <div className="text-sm text-gray-400">Revenue Generated</div>
            <div className="text-xs text-fuchsia-400 mt-1">▲ This month</div>
          </div>
        </div>
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
          <div className="text-sm text-gray-400 mb-2">Your cosmic concierge is ready</div>
          <div className="text-lg font-semibold text-teal-400">Percy • Always here to help</div>
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
                  {currentSocialProof.message}
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
    </motion.div>
  );
}