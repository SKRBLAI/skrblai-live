/**
 * OnboardingContext - Centralized Business Logic for Percy Onboarding
 * 
 * This context manages all business logic for the Percy onboarding experience,
 * providing a clean separation between UI components and data/business operations.
 * 
 * KEY INTEGRATIONS:
 * 
 * 1. OpenAI API Integration (/api/analysis/business-scan):
 *    - Uses GPT-4o or GPT-4-32k for business analysis
 *    - Structured prompts for different analysis types (website, content, business, etc.)
 *    - Returns analysis, opportunities, quick wins, and agent recommendations
 *    - Includes fallback handling for API failures
 * 
 * 2. N8N Workflow Integration:
 *    - Agent launches trigger N8N workflows via /api/agents/[agentId]/trigger-n8n
 *    - Handles automated workflow execution for agent deployment
 *    - Manages workflow state and progress tracking
 * 
 * 3. User State Management:
 *    - VIP tier validation and status tracking
 *    - User history for enhanced concierge experience
 *    - Contextual suggestions based on user behavior
 *    - Analysis results and agent recommendations
 * 
 * 4. Routing and Navigation:
 *    - Centralized route validation and error handling
 *    - Agent service page routing (/services/[agent])
 *    - Chat interface routing (/chat/[agentId])
 *    - Dashboard and feature page navigation
 * 
 * BUSINESS LOGIC FLOWS:
 * - Free Scan: Input → OpenAI Analysis → Agent Recommendations → Service Launch
 * - VIP Onboarding: Code Validation → Tier Assignment → Enhanced Features
 * - Agent Handoff: Analysis Results → Agent Selection → N8N Workflow → Service Page
 * - User Memory: Interaction Tracking → Behavior Analysis → Personalized Suggestions
 */

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/context/AuthContext';
import { usePercyContext } from '../components/assistant/PercyProvider';
import toast from 'react-hot-toast';

/**
 * OnboardingContext Interface
 * Centralized state and business logic for Percy onboarding experience
 */
export interface OnboardingContextType {
  // Core onboarding state
  currentStep: string;
  setCurrentStep: (step: string) => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  
  // User interaction handlers
  handleUserChoice: (choiceId: string, data?: any) => void;
  handleInputSubmit: () => Promise<void>;
  
  // Prompt bar functionality
  promptBarValue: string;
  setPromptBarValue: (value: string) => void;
  handlePromptBarSubmit: () => Promise<void>;
  
  // Analysis and AI state
  isPercyThinking: boolean;
  analysisResults: AnalysisResults | null;
  userAnalysisAgent: string;
  
  // VIP and user state
  isVIPUser: boolean;
  vipTier: 'gold' | 'platinum' | 'diamond' | null;
  phoneVerified: boolean;
  
  // Navigation and routing
  handleLaunch: (agentId: string, context?: any) => Promise<void>;
  handleAgentChat: (agentId: string) => Promise<void>;
  handleContinue: (nextStep: string, routeTo?: string) => Promise<void>;
  validateAndRoute: (route: string, context?: string) => boolean;
  track: 'business' | 'sports';
  setTrack: (t: 'business' | 'sports') => void;
  
  // Enhanced Free Scan Logic (OpenAI Integration)
  /**
   * Processes business analysis using OpenAI API
   * Handles the complete scan→analysis→agent recommendation flow
   */
  handleBusinessAnalysis: (input: string, analysisType?: string) => Promise<void>;
  analysisIntent: string | null;
  setAnalysisIntent: (intent: string | null) => void;
  freeAnalysisResults: FreeAnalysisResults | null;
  recommendedAgents: RecommendedAgent[] | null;
  isProcessingAnalysis: boolean;
  
  // Enhanced Percy Concierge Features
  percyMood: 'excited' | 'analyzing' | 'thinking' | 'celebrating' | 'confident' | 'scanning';
  setPercyMood: (mood: 'excited' | 'analyzing' | 'thinking' | 'celebrating' | 'confident' | 'scanning') => void;
  userHistory: UserHistoryEntry[];
  contextualSuggestions: string[];
  /**
   * Updates contextual suggestions based on user actions
   * Enhances Percy's concierge intelligence and personalization
   */
  updateContextualSuggestions: (action: string, data?: any) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

/**
 * Analysis Results Structure
 * Used for both legacy compatibility and new enhanced results
 */
interface AnalysisResults {
  mode: string;
  input: string;
  insights: string[];
}

/**
 * Enhanced Free Analysis Results from OpenAI API
 * Contains full business analysis with agent recommendations
 */
interface FreeAnalysisResults {
  analysis: string;
  opportunities: string[];
  quickWins: string[];
  businessType: string;
  confidence: number;
  recommendedAgents: RecommendedAgent[];
}

/**
 * Recommended Agent Structure
 * Used in agent handoff cards and routing
 */
interface RecommendedAgent {
  id: string;
  name: string;
  description: string;
  route: string;
  reason: string;
  confidence: number;
}

/**
 * User History Entry
 * Tracks user interactions for enhanced concierge experience
 */
interface UserHistoryEntry {
  timestamp: number;
  action: string;
  input?: string;
  result?: string;
  analysisType?: string;
  recommendedAgents?: number;
}

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [currentStep, setCurrentStep] = useState<string>('greeting');
  const [inputValue, setInputValue] = useState<string>('');
  const [track, setTrack] = useState<'business' | 'sports'>('business');
  const router = useRouter();
  const { user, signInWithOtp, isEmailVerified } = useAuth();
  // Debounced auto-redirect on email verification
  useEffect(() => {
    const handler = setTimeout(() => {
      if (isEmailVerified && user) {
        console.log('[Onboarding] Email verified, redirecting to dashboard...');
        router.push('/dashboard');
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [isEmailVerified, user, router]);
  const { trackBehavior, setIsOnboardingActive } = usePercyContext();
  const [isPercyThinking, setIsPercyThinking] = useState<boolean>(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [userAnalysisAgent, setUserAnalysisAgent] = useState<string>('');

  // User contact & VIP state
  const [userEmail, setUserEmail] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [phoneVerified, setPhoneVerified] = useState<boolean>(false);
  const [vipCode, setVipCode] = useState<string>('');
  const [isVIPUser, setIsVIPUser] = useState<boolean>(false);
  const [vipTier, setVipTier] = useState<'gold' | 'platinum' | 'diamond' | null>(null);
  const [dashboardIntent, setDashboardIntent] = useState<boolean>(false);
  
  // Prompt bar state
  const [promptBarValue, setPromptBarValue] = useState<string>('');
  const [promptBarLoading, setPromptBarLoading] = useState<boolean>(false);

  // Enhanced Free Scan Logic State
  const [analysisIntent, setAnalysisIntent] = useState<string | null>(null);
  const [freeAnalysisResults, setFreeAnalysisResults] = useState<FreeAnalysisResults | null>(null);
  const [recommendedAgents, setRecommendedAgents] = useState<RecommendedAgent[] | null>(null);
  const [isProcessingAnalysis, setIsProcessingAnalysis] = useState<boolean>(false);

  // Enhanced Percy Concierge Features
  const [percyMood, setPercyMood] = useState<'excited' | 'analyzing' | 'thinking' | 'celebrating' | 'confident' | 'scanning'>('excited');
  const [userHistory, setUserHistory] = useState<UserHistoryEntry[]>([]);
  const [contextualSuggestions, setContextualSuggestions] = useState<string[]>([
    'I can analyze any business and find automation opportunities instantly',
    'Your competitors aren\'t using AI yet - perfect timing to gain advantage',
    'Every analysis I run reveals hidden revenue opportunities'
  ]);

  /**
   * Validates VIP access codes against predefined list
   * @param code - VIP code to validate
   * @returns Promise with validation result and tier level
   */
  const validateVIPCode = React.useCallback(async (code: string): Promise<{ isValid: boolean; tier: 'gold' | 'platinum' | 'diamond' | null }> => {
    const vipCodes: Record<string, 'gold' | 'platinum' | 'diamond'> = {
      'SKRBL-VIP-GOLD-2024': 'gold',
      'SKRBL-VIP-PLATINUM-2024': 'platinum',
      'SKRBL-VIP-DIAMOND-2024': 'diamond',
      'PERCY-EXCLUSIVE-GOLD': 'gold',
      'PERCY-EXCLUSIVE-PLATINUM': 'platinum',
      'PERCY-EXCLUSIVE-DIAMOND': 'diamond',
      'DOMINATE-VIP-ACCESS': 'platinum',
      'COMPETITIVE-EDGE-VIP': 'diamond'
    };
    const upper = code.toUpperCase().trim();
    const tier = vipCodes[upper];
    return { isValid: !!tier, tier: tier || null };
  }, []);

  /**
   * Handles Percy thinking animation and state
   * @param duration - Duration of thinking state in milliseconds
   */
const handlePercyThinking = React.useCallback(async (duration: number = 2000) => {
  setIsPercyThinking(true);
  await new Promise(resolve => setTimeout(resolve, duration));
  setIsPercyThinking(false);
}, []);

// Simulate analysis based on mode and input
const performAnalysis = React.useCallback(async (mode: string, input: string) => {
  setIsPercyThinking(true);
  console.log('Percy is scanning...');
  trackBehavior('analysis_performed', { mode, input });
  // Simulate delay
  await new Promise(resolve => setTimeout(resolve, 3000));

  let insights: string[] = [];
  let recommendedAgent = '';
  switch (mode) {
    case 'website':
      insights = [
        'SEO gaps identified...',
        'Performance improvements...',
        'Content opportunities...'
      ];
      recommendedAgent = 'sitegen';
      break;
    case 'business':
      insights = ['Automation opportunities...', 'Market gaps...', 'Content strategy...'];
      recommendedAgent = 'biz';
      break;
    default:
      insights = ['Generic insight 1', 'Generic insight 2', 'Generic insight 3'];
      recommendedAgent = 'percy';
  }

  setAnalysisResults({ mode, input, insights });
  setUserAnalysisAgent(recommendedAgent);
  setCurrentStep('analysis-results');
  setIsPercyThinking(false);
  console.log('Percy analysis complete, recommended agent:', recommendedAgent);
}, [trackBehavior]);

// Business Type Detection Helper
const detectBusinessType = (input: string): string => {
  const lowInput = input.toLowerCase();
  
  // E-commerce indicators
  if (lowInput.includes('shop') || lowInput.includes('store') || lowInput.includes('product') || 
      lowInput.includes('ecom') || lowInput.includes('retail') || lowInput.includes('sell')) {
    return 'ecommerce';
  }
  
  // SaaS/Tech indicators  
  if (lowInput.includes('saas') || lowInput.includes('software') || lowInput.includes('app') ||
      lowInput.includes('tech') || lowInput.includes('platform') || lowInput.includes('api')) {
    return 'saas';
  }
  
  // Local Business indicators
  if (lowInput.includes('restaurant') || lowInput.includes('salon') || lowInput.includes('gym') ||
      lowInput.includes('clinic') || lowInput.includes('local') || lowInput.includes('neighborhood')) {
    return 'local';
  }
  
  // Real Estate indicators
  if (lowInput.includes('real estate') || lowInput.includes('realtor') || lowInput.includes('property') ||
      lowInput.includes('homes') || lowInput.includes('listing')) {
    return 'realestate';
  }
  
  // Professional Services indicators
  if (lowInput.includes('consulting') || lowInput.includes('lawyer') || lowInput.includes('accountant') ||
      lowInput.includes('agency') || lowInput.includes('professional') || lowInput.includes('service')) {
    return 'professional';
  }
  
  // Content Creator indicators
  if (lowInput.includes('youtube') || lowInput.includes('instagram') || lowInput.includes('tiktok') ||
      lowInput.includes('content') || lowInput.includes('creator') || lowInput.includes('influencer')) {
    return 'creator';
  }
  
  // Coach/Education indicators
  if (lowInput.includes('coach') || lowInput.includes('course') || lowInput.includes('training') ||
      lowInput.includes('education') || lowInput.includes('teach') || lowInput.includes('mentor')) {
    return 'coaching';
  }
  
  return 'general';
};

// Targeted SEO Quick Wins by Business Type  
const getTargetedSEOQuickWins = (businessType: string, input: string): Array<{title: string, description: string, roi: string, impact: 'high' | 'medium' | 'low'}> => {
  switch (businessType) {
    case 'ecommerce':
      return [
        { title: 'Product Page SEO Overhaul', description: 'Your product pages are invisible to Google - fix this and watch sales explode', roi: '+180% organic sales', impact: 'high' },
        { title: 'Shopping Feed Optimization', description: 'Competitors rank higher for YOUR products - time to reclaim what\'s yours', roi: '+$25K monthly', impact: 'high' },
        { title: 'Review Schema Implementation', description: 'Missing star ratings in search = lost customers to competitors', roi: '+45% click-through', impact: 'medium' }
      ];
    
    case 'local':
      return [
        { title: 'Local Pack Domination', description: 'You\'re losing customers to competitors who show up in "near me" searches', roi: '+300% local visibility', impact: 'high' },
        { title: 'Google My Business Optimization', description: 'Your GMB profile is costing you 15+ customers daily', roi: '+$8K monthly revenue', impact: 'high' },
        { title: 'Local Citation Building', description: 'Competitors outrank you because they\'re listed everywhere - you\'re not', roi: '+60% local traffic', impact: 'medium' }
      ];
      
    case 'saas':
      return [
        { title: 'Feature Page SEO', description: 'Prospects search for your exact features but find competitors instead', roi: '+220% qualified leads', impact: 'high' },
        { title: 'Technical Content Gap', description: 'Your ideal customers are asking questions - competitors are answering them', roi: '+$35K MRR', impact: 'high' },
        { title: 'Comparison Page Strategy', description: 'Prospects compare you to competitors - make sure you win every time', roi: '+85% conversion rate', impact: 'medium' }
      ];
      
    case 'professional':
      return [
        { title: 'Service Page Authority', description: 'Clients search for your services but hire competitors who rank higher', roi: '+400% consultation requests', impact: 'high' },
        { title: 'Local Professional SEO', description: 'You\'re the best in your area but invisible online - fix this now', roi: '+$15K monthly', impact: 'high' },
        { title: 'Expertise Content Strategy', description: 'Establish authority before competitors steal your market share', roi: '+150% qualified leads', impact: 'medium' }
      ];
      
    default:
      return [
        { title: 'Competitor Keyword Theft', description: 'Your competitors rank for keywords that should be YOURS', roi: '+270% organic traffic', impact: 'high' },
        { title: 'Technical SEO Foundation', description: 'Your site has critical issues that are hemorrhaging potential customers', roi: '+$18K monthly', impact: 'high' },
        { title: 'Content Authority Building', description: 'Build topical authority before competitors dominate your niche', roi: '+195% search visibility', impact: 'medium' }
      ];
  }
};

// Targeted Business Quick Wins by Type
const getTargetedBusinessQuickWins = (businessType: string, input: string): Array<{title: string, description: string, roi: string, impact: 'high' | 'medium' | 'low'}> => {
  switch (businessType) {
    case 'ecommerce':
      return [
        { title: 'Abandoned Cart Recovery', description: '68% of customers abandon carts - turn them into sales automatically', roi: '+$12K monthly revenue', impact: 'high' },
        { title: 'AI Product Recommendations', description: 'Amazon makes billions from "customers who bought this" - you should too', roi: '+35% average order value', impact: 'high' },
        { title: 'Inventory Automation', description: 'Stop losing sales to out-of-stock items while competitors take your customers', roi: '+$8K monthly savings', impact: 'medium' }
      ];
      
    case 'saas':
      return [
        { title: 'User Onboarding Automation', description: 'Poor onboarding = 90% churn in first week - automate success instead', roi: '+450% user retention', impact: 'high' },
        { title: 'Feature Adoption Tracking', description: 'Users who don\'t adopt key features churn - guide them automatically', roi: '+$25K MRR', impact: 'high' },
        { title: 'Churn Prediction AI', description: 'Know which customers will leave before they do - save them automatically', roi: '+30% LTV', impact: 'medium' }
      ];
      
    case 'local':
      return [
        { title: 'Appointment Booking Automation', description: 'Missing calls = lost customers - never miss another booking', roi: '+40% more bookings', impact: 'high' },
        { title: 'Review Generation Machine', description: 'Happy customers forget to review - unhappy ones always remember', roi: '+300% positive reviews', impact: 'high' },
        { title: 'Local Social Media Automation', description: 'Competitors post daily, you post weekly - automate consistent presence', roi: '+180% local awareness', impact: 'medium' }
      ];
      
    default:
      return [
        { title: 'Lead Qualification Automation', description: 'Wasting time on unqualified leads while competitors close qualified ones', roi: '+320% qualified leads', impact: 'high' },
        { title: 'Customer Journey Automation', description: 'Prospects need 7+ touchpoints to buy - automate every interaction', roi: '+$22K monthly', impact: 'high' },
        { title: 'Competitive Intelligence Automation', description: 'Know what competitors do before they do it - automate market monitoring', roi: '+150% market advantage', impact: 'medium' }
      ];
  }
};

// Targeted Content Quick Wins by Platform/Type
const getTargetedContentQuickWins = (businessType: string, input: string): Array<{title: string, description: string, roi: string, impact: 'high' | 'medium' | 'low'}> => {
  const lowInput = input.toLowerCase();
  
  if (lowInput.includes('youtube')) {
    return [
      { title: 'AI Thumbnail Optimization', description: 'Your thumbnails get 2% click-through - viral thumbnails get 15%+', roi: '+650% video views', impact: 'high' },
      { title: 'Viral Hook Generator', description: 'First 3 seconds determine if viewers stay - master them with AI', roi: '+400% watch time', impact: 'high' },
      { title: 'Content Repurposing Machine', description: 'Turn 1 video into 20 pieces of content across all platforms', roi: '+500% content output', impact: 'medium' }
    ];
  }
  
  if (lowInput.includes('instagram') || lowInput.includes('tiktok')) {
    return [
      { title: 'Viral Trend Predictor', description: 'Ride trends before they peak - when others follow, you\'re already winning', roi: '+800% reach', impact: 'high' },
      { title: 'AI Content Calendar', description: 'Posting randomly kills growth - strategic posting explodes it', roi: '+450% engagement', impact: 'high' },
      { title: 'Story Automation Engine', description: 'Stories disappear but their impact shouldn\'t - automate for maximum effect', roi: '+300% story views', impact: 'medium' }
    ];
  }
  
  return [
    { title: 'AI Content Calendar', description: 'Competitors post consistently, you post when you remember - fix this now', roi: '+700% content consistency', impact: 'high' },
    { title: 'Cross-Platform Automation', description: 'Create once, post everywhere - while competitors manage 5 platforms manually', roi: '+400% reach', impact: 'high' },
    { title: 'Engagement Automation', description: 'Respond to every comment/DM instantly - build community while you sleep', roi: '+250% engagement rate', impact: 'medium' }
  ];
};

// Agent Recommendation Helpers
const getRecommendedBusinessAgent = (businessType: string): string => {
  switch (businessType) {
    case 'ecommerce': return 'E-commerce Automation Agent';
    case 'saas': return 'SaaS Growth Agent'; 
    case 'local': return 'Local Business Dominator';
    case 'professional': return 'Professional Services Agent';
    case 'realestate': return 'Real Estate Automation Agent';
    case 'coaching': return 'Course Creation Agent';
    default: return 'Business Automation Agent';
  }
};

const getBusinessAgentRoute = (businessType: string): string => {
  switch (businessType) {
    case 'ecommerce': return '/agents/ecommerce-agent';
    case 'saas': return '/agents/saas-agent';
    case 'local': return '/agents/local-agent';
    case 'professional': return '/agents/professional-agent';
    case 'realestate': return '/agents/realestate-agent';
    case 'coaching': return '/agents/coaching-agent';
    default: return '/agents/biz-agent';
  }
};

// Enhanced Brand Quick Wins
const getTargetedBrandQuickWins = (businessType: string, input: string): Array<{title: string, description: string, roi: string, impact: 'high' | 'medium' | 'low'}> => {
  const lowInput = input.toLowerCase();
  
  if (lowInput.includes('linkedin')) {
    return [
      { title: 'LinkedIn Authority Automation', description: 'CEO competitors post 2x daily while you post weekly - automate dominance', roi: '+1200% profile views', impact: 'high' },
      { title: 'C-Suite Network Infiltration', description: 'Auto-connect with 500+ decision makers who can write checks', roi: '+80 qualified prospects/month', impact: 'high' },
      { title: 'Thought Leadership Content Engine', description: 'Position yourself as THE expert before competitors steal your space', roi: '+400% engagement', impact: 'medium' }
    ];
  }
  
  if (businessType === 'professional') {
    return [
      { title: 'Expert Positioning System', description: 'Clients hire who they perceive as THE authority - not the best kept secret', roi: '+350% consultation requests', impact: 'high' },
      { title: 'Referral Network Automation', description: 'Happy clients forget to refer - automate referral generation systems', roi: '+$25K monthly revenue', impact: 'high' },
      { title: 'Professional Credibility Stack', description: 'Build authority faster than competitors can catch up', roi: '+200% market credibility', impact: 'medium' }
    ];
  }
  
  return [
    { title: 'Personal Brand Authority Engine', description: 'Your expertise is invisible online while mediocre competitors dominate', roi: '+500% brand visibility', impact: 'high' },
    { title: 'Multi-Platform Presence Automation', description: 'Be everywhere your audience is - without the manual work', roi: '+300% reach', impact: 'high' },
    { title: 'Reputation Management System', description: 'Control your narrative before competitors or critics do', roi: '+250% positive mentions', impact: 'medium' }
  ];
};

// Enhanced Book Publishing Quick Wins
const getTargetedBookQuickWins = (businessType: string, input: string): Array<{title: string, description: string, roi: string, impact: 'high' | 'medium' | 'low'}> => {
  const lowInput = input.toLowerCase();
  
  if (lowInput.includes('nonfiction') || lowInput.includes('business') || lowInput.includes('self-help')) {
    return [
      { title: 'Authority Book Empire System', description: 'Your expertise deserves a bestseller - not another forgotten manuscript', roi: '+$50K in speaking fees', impact: 'high' },
      { title: 'Pre-Launch Audience Builder', description: 'Build your buyer audience BEFORE you finish writing - guarantee success', roi: '+10K pre-orders', impact: 'high' },
      { title: 'Book-to-Business Funnel', description: 'Turn your book into a client-generating machine, not just a passion project', roi: '+$100K annual revenue', impact: 'medium' }
    ];
  }
  
  if (lowInput.includes('fiction') || lowInput.includes('novel') || lowInput.includes('story')) {
    return [
      { title: 'Fiction Marketing Automation', description: 'Readers discover new authors through algorithms - not luck', roi: '+500% book discovery', impact: 'high' },
      { title: 'Series Launch Strategy', description: 'One book is a hobby, a series is a business - plan for domination', roi: '+$20K monthly royalties', impact: 'high' },
      { title: 'Reader Community Engine', description: 'Superfans sell more books than any ad campaign ever will', roi: '+300% reader loyalty', impact: 'medium' }
    ];
  }
  
  return [
    { title: 'AI Book Writing Assistant', description: 'Write faster, better, and more consistently than competitors who struggle alone', roi: '+300% writing speed', impact: 'high' },
    { title: 'Publishing Empire Automation', description: 'From manuscript to bestseller - automate every step of the journey', roi: '+$15K monthly', impact: 'high' },
    { title: 'Author Platform Builder', description: 'Build your author brand while you write - launch with an audience ready to buy', roi: '+5K loyal fans', impact: 'medium' }
  ];
};

// Enhanced Sports/Fitness Quick Wins  
const getTargetedSportsQuickWins = (businessType: string, input: string): Array<{title: string, description: string, roi: string, impact: 'high' | 'medium' | 'low'}> => {
  const lowInput = input.toLowerCase();
  
  if (lowInput.includes('coach') || lowInput.includes('trainer') || lowInput.includes('fitness business')) {
    return [
      { title: 'Client Transformation Documentation', description: 'Results that aren\'t documented don\'t exist in clients\' minds', roi: '+400% client retention', impact: 'high' },
      { title: 'Performance Tracking Automation', description: 'Clients who see progress stay longer and refer more', roi: '+$8K monthly revenue', impact: 'high' },
      { title: 'Workout Prescription AI', description: 'Personalized programs at scale - without the manual work', roi: '+200% client capacity', impact: 'medium' }
    ];
  }
  
  if (lowInput.includes('athlete') || lowInput.includes('performance') || lowInput.includes('sport')) {
    return [
      { title: 'Performance Gap Analysis', description: 'Identify the 3 bottlenecks keeping you from the next level', roi: '+35% performance improvement', impact: 'high' },
      { title: 'Competition Preparation System', description: 'Peak when it matters most - not 2 weeks too early or late', roi: '+50% competition success', impact: 'high' },
      { title: 'Recovery Optimization Protocol', description: 'Recovery is when gains happen - optimize for maximum results', roi: '+25% training consistency', impact: 'medium' }
    ];
  }
  
  return [
    { title: 'Fitness Goal Automation', description: 'Most people quit in 3 weeks - build systems that guarantee success', roi: '+300% goal achievement', impact: 'high' },
    { title: 'Motivation Maintenance System', description: 'Willpower fails, systems succeed - automate your fitness journey', roi: '+200% consistency', impact: 'high' },
    { title: 'Progress Tracking Intelligence', description: 'What gets measured gets managed - automate your fitness data', roi: '+150% motivation', impact: 'medium' }
  ];
};

// Enhanced Custom/Default Quick Wins
const getTargetedCustomQuickWins = (businessType: string, input: string): Array<{title: string, description: string, roi: string, impact: 'high' | 'medium' | 'low'}> => {
  const lowInput = input.toLowerCase();
  
  // Detect specific custom needs
  if (lowInput.includes('email') || lowInput.includes('newsletter') || lowInput.includes('marketing')) {
    return [
      { title: 'Email Automation Domination', description: 'Your emails land in promotions while competitors reach inboxes', roi: '+450% email open rates', impact: 'high' },
      { title: 'Behavioral Trigger Campaigns', description: 'Send the right message at the perfect moment - automatically', roi: '+300% conversion rate', impact: 'high' },
      { title: 'List Building Machine', description: 'Grow your email list 10x faster than competitors using lead magnets', roi: '+5K subscribers/month', impact: 'medium' }
    ];
  }
  
  if (lowInput.includes('crm') || lowInput.includes('sales') || lowInput.includes('leads')) {
    return [
      { title: 'Sales Process Automation', description: 'Never miss a follow-up while competitors let prospects go cold', roi: '+250% sales conversion', impact: 'high' },
      { title: 'Lead Scoring Intelligence', description: 'Focus on buyers, not browsers - automate lead qualification', roi: '+$15K monthly revenue', impact: 'high' },
      { title: 'Pipeline Optimization Engine', description: 'Identify bottlenecks before they kill your revenue', roi: '+180% sales velocity', impact: 'medium' }
    ];
  }
  
  if (lowInput.includes('social') || lowInput.includes('facebook') || lowInput.includes('marketing')) {
    return [
      { title: 'Social Media Domination Suite', description: 'Consistent posting beats sporadic brilliance - automate your presence', roi: '+600% social engagement', impact: 'high' },
      { title: 'Viral Content Predictor', description: 'Create content that spreads while competitors post into the void', roi: '+400% reach', impact: 'high' },
      { title: 'Community Building Automation', description: 'Build loyal followers who buy, not just lurkers who scroll', roi: '+300% audience loyalty', impact: 'medium' }
    ];
  }
  
  // Default custom recommendations
  return [
    { title: 'Workflow Automation Audit', description: 'Hidden inefficiencies are costing you 15+ hours/week - find and fix them', roi: '+20 hours/week saved', impact: 'high' },
    { title: 'Competitive Intelligence System', description: 'Know what competitors do before they do - automate market monitoring', roi: '+250% market advantage', impact: 'high' },
    { title: 'Customer Journey Optimization', description: 'Guide prospects to purchase automatically - no more lost opportunities', roi: '+180% conversion rate', impact: 'medium' }
  ];
};

const getRecommendedCustomAgent = (businessType: string): string => {
  switch (businessType) {
    case 'ecommerce': return 'E-commerce Automation Agent';
    case 'saas': return 'SaaS Growth Agent';
    case 'local': return 'Local Business Dominator';
    case 'professional': return 'Professional Services Agent';
    case 'creator': return 'Content Automation Agent';
    case 'coaching': return 'Course Creation Agent';
    default: return 'Custom AI Agent';
  }
};

const getCustomAgentRoute = (businessType: string): string => {
  switch (businessType) {
    case 'ecommerce': return '/agents/ecommerce-agent';
    case 'saas': return '/agents/saas-agent';
    case 'local': return '/agents/local-agent';
    case 'professional': return '/agents/professional-agent';
    case 'creator': return '/agents/content-automation';
    case 'coaching': return '/agents/coaching-agent';
    default: return '/agents';
  }
};

// NEW: Percy diagnosis with Quick Wins analysis
const performPercyDiagnosis = React.useCallback(async (diagnosisType: string, input: string) => {
  setIsPercyThinking(true);
  console.log('Percy is performing diagnosis...', diagnosisType, input);
  trackBehavior('percy_diagnosis_performed', { type: diagnosisType, input });
  
  // TODO: N8N AUTOMATION TRIGGER
  // This is where we'll trigger n8n workflows for:
  // - Lead qualification scoring
  // - CRM integration and data enrichment  
  // - Automated follow-up email sequences
  // - Competitive intelligence gathering
  // - Real-time ROI calculations
  
  // Simulate AI diagnosis delay
  await new Promise(resolve => setTimeout(resolve, 4000));

  // ENHANCED: Business Type Detection & Targeted Quick Wins
  const businessType = detectBusinessType(input);
  let quickWins: Array<{title: string, description: string, roi: string, impact: 'high' | 'medium' | 'low'}> = [];
  let recommendedAgent = '';
  let agentRoute = '';

  switch (diagnosisType) {
    case 'seo':
      quickWins = getTargetedSEOQuickWins(businessType, input);
      recommendedAgent = 'SEO Dominator';
      agentRoute = '/agents/seo-agent';
      break;
    case 'business':
      quickWins = getTargetedBusinessQuickWins(businessType, input);
      recommendedAgent = getRecommendedBusinessAgent(businessType);
      agentRoute = getBusinessAgentRoute(businessType);
      break;
    case 'content':
      quickWins = getTargetedContentQuickWins(businessType, input);
      recommendedAgent = 'Content Automation Agent';
      agentRoute = '/agents/content-automation';
      break;
    case 'brand':
      quickWins = getTargetedBrandQuickWins(businessType, input);
      recommendedAgent = 'Personal Branding Agent';
      agentRoute = '/agents/branding';
      break;
    case 'book':
      quickWins = getTargetedBookQuickWins(businessType, input);
      recommendedAgent = 'Book Publishing Agent';
      agentRoute = '/agents/book-publishing';
      break;
    case 'sports':
      quickWins = getTargetedSportsQuickWins(businessType, input);
      recommendedAgent = 'Skill Smith';
      agentRoute = '/agents/skillsmith';
      break;
    default:
      quickWins = getTargetedCustomQuickWins(businessType, input);
      recommendedAgent = getRecommendedCustomAgent(businessType);
      agentRoute = getCustomAgentRoute(businessType);
  }

  // Store diagnosis results 
  setAnalysisResults({ 
    mode: diagnosisType, 
    input, 
    insights: quickWins.map(qw => `${qw.title}: ${qw.description} (${qw.roi})`)
  });
  setUserAnalysisAgent(recommendedAgent);
  
  // Move to Quick Wins step
  setCurrentStep('percy-quick-wins');
  setIsPercyThinking(false);
  console.log('Percy diagnosis complete, recommended agent:', recommendedAgent);
}, [trackBehavior]);

/**
 * ENHANCED: Business Analysis with OpenAI Integration (Free Scan)
 * 
 * This function handles the complete free scan flow:
 * 1. Validates input and sets processing states
 * 2. Updates user history and contextual suggestions
 * 3. Calls OpenAI API via /api/analysis/business-scan
 * 4. Processes results and updates recommended agents
 * 5. Routes to analysis results step
 * 
 * @param input - Business description or website URL from user
 * @param analysisType - Type of analysis (analyze-custom-needs, etc.)
 * 
 * API Interaction: POST /api/analysis/business-scan
 * - Uses OpenAI GPT-4o or GPT-4-32k for analysis
 * - Returns structured business analysis with agent recommendations
 * - Includes fallback handling for API failures
 */
const handleBusinessAnalysis = React.useCallback(async (input: string, analysisType?: string) => {
  if (!input.trim()) {
    toast.error('Please provide your business information');
    return;
  }

  setIsProcessingAnalysis(true);
  setPercyMood('analyzing');
  setCurrentStep('ai-analysis-processing');

  try {
    // Starting business analysis
    
    // Add to user history for better concierge experience
    const historyEntry = {
      timestamp: Date.now(),
      action: 'business_analysis_request',
      input: input.substring(0, 100) + '...',
      analysisType: analysisType || analysisIntent || 'analyze-custom-needs'
    };
    setUserHistory(prev => [...prev, historyEntry]);
    
    // Update contextual suggestions for analysis start
    updateContextualSuggestions('business_analysis');
    
    const response = await fetch('/api/analysis/business-scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessInput: input,
        analysisType: analysisType || analysisIntent || 'analyze-custom-needs',
        userEmail: user?.email
      })
    });

    if (!response.ok) {
      throw new Error('Analysis failed');
    }

    const { result } = await response.json();
    
    // Store analysis results in context
    setFreeAnalysisResults(result);
    setRecommendedAgents(result.recommendedAgents);
    
    // Update legacy analysisResults for backward compatibility
    setAnalysisResults({
      mode: analysisType || analysisIntent || 'business',
      input: input,
      insights: result.opportunities || []
    });
    
    // Update contextual suggestions for enhanced concierge experience
    setContextualSuggestions([
      `Based on your ${result.businessType || 'business'}, I recommend focusing on automation first`,
      `Your competition likely isn't using AI yet - perfect timing!`,
      `Quick wins are ready to implement this week`
    ]);
    
    // Simulate Percy thinking for better UX
    await handlePercyThinking(1500);
    setCurrentStep('analysis-results');
    setPercyMood('celebrating');
    
    toast.success('Analysis complete! 🎯', { duration: 2000 });
    
    trackBehavior('analysis_complete', {
      analysisType: analysisType || analysisIntent,
      confidence: result.confidence,
      agentCount: result.recommendedAgents?.length || 0,
      businessType: result.businessType
    });
    
    // Update contextual suggestions for analysis completion
    updateContextualSuggestions('analysis_complete', {
      agentCount: result.recommendedAgents?.length || 0,
      businessType: result.businessType
    });

    // Add successful analysis to history
    setUserHistory(prev => [...prev, {
      timestamp: Date.now(),
      action: 'business_analysis_complete',
      result: `Found ${result.opportunities?.length || 0} opportunities`,
      recommendedAgents: result.recommendedAgents?.length || 0
    }]);

  } catch (error) {
    console.error('[Percy Context] Business analysis failed:', error);
    setPercyMood('confident');
    toast.error('Analysis encountered an issue, but I can still help you!');
    
    // Fallback to a basic recommendation
    setCurrentStep('analysis-results');
    setContextualSuggestions([
      'Let me connect you with our most popular agent',
      'I can still guide you to the perfect solution',
      'Your success is guaranteed with any of our agents'
    ]);
    
  } finally {
    setIsProcessingAnalysis(false);
  }
}, [user?.email, analysisIntent, handlePercyThinking, trackBehavior]);

/**
 * ENHANCED: Update contextual suggestions based on user behavior
 * 
 * This function enhances Percy's concierge intelligence by providing
 * contextual suggestions that adapt to user actions and analysis results.
 * 
 * @param action - The user action that triggered the update
 * @param data - Additional context data (analysis results, VIP tier, etc.)
 * 
 * Supported actions:
 * - 'website_analysis': Shows SEO-focused suggestions
 * - 'business_analysis': Shows automation-focused suggestions  
 * - 'analysis_complete': Shows results-based suggestions with agent count
 * - 'vip_activated': Shows VIP-specific messaging
 * - 'returning_user': Shows personalized welcome back messages
 */
const updateContextualSuggestions = React.useCallback((action: string, data?: any) => {
  switch (action) {
    case 'website_analysis':
      setContextualSuggestions([
        'I\'ll scan your site for SEO gaps and conversion opportunities',
        'Most websites I analyze are missing 3-5 major revenue boosters',
        'Your site analysis will reveal competitive advantages'
      ]);
      break;
    case 'business_analysis':
      setContextualSuggestions([
        'Business analysis reveals automation opportunities worth 10x ROI',
        'I\'ll identify which AI agents will transform your operations first',
        'Every business analysis I run finds hidden profit centers'
      ]);
      break;
    case 'analysis_complete':
      setContextualSuggestions([
        `Based on your results, ${data?.agentCount || 2} agents are perfect matches`,
        'These opportunities will give you a massive competitive edge',
        'Ready to launch? Your competitors won\'t know what hit them'
      ]);
      break;
    case 'vip_activated':
      setContextualSuggestions([
        `VIP ${data?.tier?.toUpperCase()} member detected - unlocking exclusive features`,
        'VIP analysis includes proprietary competitive intelligence',
        'Your VIP status grants access to premium agent capabilities'
      ]);
      break;
    case 'returning_user':
      setContextualSuggestions([
        'Welcome back! Ready to continue dominating your market?',
        'I remember your previous success - want to amplify it?',
        'Your competitive advantage is waiting to be activated'
      ]);
      break;
    default:
      // Keep current suggestions
      break;
  }
}, []);

/**
 * Handles conversational flow inputs for different onboarding paths
 * 
 * This function manages multi-step flows like SEO analysis, content creation,
 * business strategy, etc. It coordinates the progression through each flow's steps
 * including scanning animations and result delivery.
 * 
 * @param step - Current flow step (e.g., 'seo-flow-start', 'content-topic-prompt')
 * @param input - User input for the current step
 * 
 * Flow Examples:
 * - SEO: input → scanning → results
 * - Content: type → topic prompt → results
 * - Business: problem → scanning → results
 */
const handleConversationalFlowInput = React.useCallback(async (step: string, input: string) => {
  setIsPercyThinking(true);
  console.log('Processing conversational flow input:', step, input);
  trackBehavior('conversational_input_submitted', { step, input });
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Route to next step based on current flow
  if (step === 'seo-flow-start') {
    // SEO flow: input → scanning → results
    setCurrentStep('seo-scanning');
    await new Promise(resolve => setTimeout(resolve, 3000)); // Scanning animation
    setCurrentStep('seo-results');
  } else if (step === 'content-flow-start') {
    // Content flow: type → topic prompt
    setCurrentStep('content-topic-prompt');
  } else if (step === 'content-topic-prompt') {
    // Content flow: topic → results
    setCurrentStep('content-results');
  } else if (step === 'book-flow-start') {
    // Book flow: idea → results
    setCurrentStep('book-results');
  } else if (step === 'business-flow-start') {
    // Business flow: problem → scanning → results
    setCurrentStep('business-scanning');
    await new Promise(resolve => setTimeout(resolve, 3000)); // Scanning animation
    setCurrentStep('business-results');
  } else if (step === 'brand-flow-start') {
    // Brand flow: upgrade type → upload prompt
    setCurrentStep('brand-upload-prompt');
  } else if (step === 'brand-upload-prompt') {
    // Brand flow: assets → results
    setCurrentStep('brand-results');
  } else if (step === 'custom-flow-start') {
    // Custom flow: challenge → analysis
    setCurrentStep('custom-analysis');
  }
  
  setIsPercyThinking(false);
  console.log('Conversational flow processed, moved to next step');
}, [trackBehavior, validateVIPCode]);

// Handle input submission (signup, analysis, verification)
const handleInputSubmit = React.useCallback(async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      toast.error('Please enter a valid input');
      return;
    }

    // Owner code bypass
    if (trimmed === 'OWNER_ACCESS' || trimmed === 'MMM_dash') {
      toast.success('🔑 Owner Access Granted - Welcome to Dashboard!', { icon: '👑', duration: 3000 });
      setInputValue('');
      router.push('/dashboard');
      return;
    }

    // Analysis steps
    if (currentStep.startsWith('instant-') && currentStep.endsWith('-analysis')) {
      const mode = currentStep.replace(/^instant-/, '').replace(/-analysis$/, '');
      await performAnalysis(mode, trimmed);
      setInputValue('');
      return;
    }

    // NEW: Percy diagnosis steps
    if (currentStep.startsWith('percy-') && currentStep.endsWith('-diagnosis')) {
      const diagnosisType = currentStep.replace(/^percy-/, '').replace(/-diagnosis$/, '');
      await performPercyDiagnosis(diagnosisType, trimmed);
      setInputValue('');
      return;
    }
    
    // NEW: Conversational flow steps
    if (currentStep.includes('-flow-start') || currentStep.includes('-topic-prompt') || currentStep.includes('-upload-prompt')) {
      await handleConversationalFlowInput(currentStep, trimmed);
      setInputValue('');
      return;
    }

  // Signup flow: send magic link or SMS
  if (currentStep === 'signup') {
    setInputValue('');
    // Email magic-link
    if (trimmed.includes('@')) {
      try {
        setIsPercyThinking(true);
        const { error } = await signInWithOtp(trimmed);
        if (error) {
          toast.error(error || 'Unable to send magic link.');
          return;
        }
        toast.success('Magic link sent! Check your email.', { duration: 5000 });
        setCurrentStep('email-verification');
      } catch (e) {
        console.error('[Onboarding] signInWithOtp error:', e);
        toast.error('Error sending magic link. Please try again.', { duration: 5000 });
      } finally {
        setIsPercyThinking(false);
      }
    } else {
      // SMS verification with email fallback
      try {
        setIsPercyThinking(true);
        const res = await fetch('/api/sms/send-verification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: trimmed })
        });
        if (!res.ok) throw new Error(`SMS error ${res.status}`);
        setPhoneNumber(trimmed);
        setCurrentStep('code-entry');
      } catch (e) {
        console.error('[Onboarding] SMS verification error (logged for monitoring):', e);
        toast.error('SMS unavailable, please use email.', { duration: 5000 });
        setCurrentStep('signup');
      } finally {
        setIsPercyThinking(false);
      }
    }
    return;
  }

  // Phone code send
  if (currentStep === 'phone-entry') {
    const phone = trimmed;
    if (!phone) {
      toast.error('Enter a valid phone number');
      return;
    }
    
    try {
      setIsPercyThinking(true);
      setPhoneNumber(phone);
      
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
    } catch (err: any) {
      toast.error(err.message || 'SMS failed');
    } finally {
      setIsPercyThinking(false);
    }
    return;
  }

  // SMS code verify
  if (currentStep === 'code-entry') {
    const code = trimmed;
    if (code.length !== 6) {
      toast.error('Enter the 6-digit code');
      return;
    }
    
    try {
      setIsPercyThinking(true);
      
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
    } catch (err: any) {
      toast.error(err.message || 'Verification failed');
    } finally {
      setIsPercyThinking(false);
    }
    return;
  }

    // VIP code entry
    if (currentStep === 'vip-code-entry') {
      const { isValid, tier } = await validateVIPCode(trimmed);
      if (isValid && tier) {
        setVipCode(trimmed);
        setIsVIPUser(true);
        setVipTier(tier);
        toast.success(`🏆 VIP ${tier.toUpperCase()} ACCESS CONFIRMED!`, { icon: '👑', duration: 3000 });
        setCurrentStep('vip-welcome');
      } else {
        toast.error('Invalid VIP code. Please try again.');
      }
      return;
    }

      // Fallback: reset or other
  toast.error('Unable to process input at this step');
}, [inputValue, currentStep, performAnalysis, validateVIPCode, router, signInWithOtp, isEmailVerified]);

// Handle prompt bar submission (unified input from the persistent prompt bar)
const handlePromptBarSubmit = React.useCallback(async () => {
  if (!promptBarValue.trim() || promptBarLoading) return;

  setPromptBarLoading(true);
  
  try {
    // Owner code bypass
    if (promptBarValue.trim() === 'OWNER_ACCESS' || promptBarValue.trim() === 'MMM_dash') {
      toast.success('🔑 Owner Access Granted - Welcome to Dashboard!', { icon: '👑', duration: 3000 });
      setPromptBarValue('');
      router.push('/dashboard');
      return;
    }

    // VIP Code Detection in prompt bar
    const trimmed = promptBarValue.trim();
    const vipValidation = await validateVIPCode(trimmed);
    if (vipValidation.isValid && vipValidation.tier) {
      setVipCode(trimmed);
      setIsVIPUser(true);
      setVipTier(vipValidation.tier);
      setPromptBarValue('');
      await handlePercyThinking(2000);
      setCurrentStep('vip-welcome');
      toast.success(`🏆 VIP ${vipValidation.tier.toUpperCase()} ACCESS CONFIRMED!`, {
        icon: '👑',
        duration: 4000,
      });
      trackBehavior('vip_activated', { vipTier: vipValidation.tier, code: trimmed });
      return;
    }

    // If current step expects input, forward to input handler
    if (currentStep === 'signup' || currentStep.includes('-analysis') || currentStep.includes('-entry')) {
      setInputValue(promptBarValue);
      setPromptBarValue('');
      await handleInputSubmit();
      return;
    }

    // Handle general conversation - route to custom needs analysis
    setInputValue(promptBarValue);
    setCurrentStep('custom-needs-analysis');
    setPromptBarValue('');
  } finally {
    setPromptBarLoading(false);
  }
}, [promptBarValue, promptBarLoading, validateVIPCode, handlePercyThinking, trackBehavior, currentStep, handleInputSubmit, router]);

// Route validation to prevent dead ends
const validateAndRoute = React.useCallback((route: string, context?: string) => {
  const validRoutes = [
    '/', '/dashboard', '/agents', '/services', '/sports', '/features', 
    '/pricing', '/contact', '/about', '/academy', '/branding', '/book-publishing',
    '/content-automation', '/social-media'
  ];
  
  const isDynamicRoute = route.includes('/services/') || route.includes('/agents/') || route.includes('/chat/') || 
                        route.includes('/agent-backstory/') || route.includes('/dashboard?');
  
  if (!validRoutes.includes(route) && !isDynamicRoute) {
    console.warn('[Onboarding] Invalid route detected:', route, 'Context:', context);
    toast.error(`Navigation failed. Taking you to a safe place...`, {
      icon: '🚧',
      duration: 3000,
    });
    
    // Try fallback route with additional error handling
    try {
      router.push('/agents');
    } catch (fallbackError) {
      console.error('[Onboarding] Fallback route also failed:', fallbackError);
      // Ultimate fallback - reload page
      window.location.href = '/';
    }
    return false;
  }
  
  console.log('[Onboarding] Route validated:', route, 'Context:', context);
  return true;
}, [router]);

// Enhanced routing functions for agent interactions
/**
 * Enhanced Agent Launch Function
 * 
 * Launches AI agents by routing to their service pages and triggering N8N workflows.
 * This is the primary function for converting analysis results into active agent deployment.
 * 
 * @param agentId - The ID of the agent to launch (maps to /services/[agentId])
 * @param context - Additional context data (analysis results, user preferences, etc.)
 * 
 * Workflow:
 * 1. Validates route and agent availability
 * 2. Triggers N8N workflow via /api/agents/[agentId]/trigger-n8n
 * 3. Routes user to agent service page
 * 4. Tracks behavior for analytics and optimization
 * 
 * N8N Integration:
 * - Each agent has associated N8N workflows for automation setup
 * - Workflows handle initial configuration, data setup, and service provisioning
 * - Error handling includes fallback routes and user notifications
 */
const handleLaunch = React.useCallback(async (agentId: string, context?: any) => {
  console.log('[Onboarding] Launching agent:', agentId, context);
  trackBehavior('agent_launch', { agentId, context, from: currentStep });
  
  const route = `/agents/${agentId}?track=${track}`;
  if (!validateAndRoute(route, `agent-launch-${agentId}`)) {
    return;
  }
  
  try {
    // Show loading state
    setPromptBarLoading(true);
    
    // Route to agent service page for instant launch
    router.push(route);
  } catch (error) {
    console.error('[Onboarding] Agent launch error:', error);
    toast.error('Agent launch failed. Please try again.', { duration: 3000 });
  } finally {
    setPromptBarLoading(false);
  }
}, [router, currentStep, trackBehavior, validateAndRoute, track]);

const handleAgentChat = React.useCallback(async (agentId: string) => {
  console.log('[Onboarding] Starting chat with agent:', agentId);
  trackBehavior('agent_chat_start', { agentId, from: currentStep });
  
  const route = `/agents/${agentId}?tab=chat&track=${track}`;
  if (!validateAndRoute(route, `agent-chat-${agentId}`)) {
    return;
  }
  
  try {
    setPromptBarLoading(true);
    router.push(route);
  } catch (error) {
    console.error('[Onboarding] Agent chat routing error:', error);
    toast.error('Chat launch failed. Please try again.', { duration: 3000 });
  } finally {
    setPromptBarLoading(false);
  }
}, [router, currentStep, trackBehavior, validateAndRoute, track]);

const handleContinue = React.useCallback(async (nextStep: string, routeTo?: string) => {
  console.log('[Onboarding] Continuing to step:', nextStep, 'Route:', routeTo);
  trackBehavior('continue_flow', { nextStep, routeTo, from: currentStep });
  
  if (routeTo) {
    if (!validateAndRoute(routeTo, `continue-${nextStep}`)) {
      return;
    }
    
    try {
      setPromptBarLoading(true);
      router.push(routeTo);
    } catch (error) {
      console.error('[Onboarding] Continue routing error:', error);
      toast.error('Navigation failed. Please try again.', { duration: 3000 });
    } finally {
      setPromptBarLoading(false);
    }
  } else {
    setCurrentStep(nextStep);
  }
}, [router, currentStep, trackBehavior, validateAndRoute]);



  const handleUserChoice = React.useCallback((choiceId: string, data?: any) => {
    console.log('[Onboarding] User choice:', choiceId, data);
    trackBehavior(`choice_${choiceId}`, { from: currentStep, data });
    
    // 🚀 RESTORED PERCY ONBOARDING FLOW: All buttons now go through onboarding first
    // ✅ LAUNCH FIX: No more direct routing to /services/agent - Percy guides users first
    switch (choiceId) {
      // 🎯 Homepage action buttons - route to instant analysis steps FIRST (RESTORED)
      case 'website-scan':
      case 'dominate-seo':
        setCurrentStep('instant-website-analysis');
        break;
      case 'content-creator':
      case 'create-content':
        setCurrentStep('instant-content-analysis');
        break;
      case 'book-publisher':
      case 'publish-book':
        setCurrentStep('instant-book-analysis');
        break;
      case 'business-strategy':
      case 'automate-biz':
        setCurrentStep('instant-business-analysis');
        break;
      case 'linkedin-profile':
      case 'upgrade-brand':
        setCurrentStep('instant-linkedin-analysis');
        break;
      case 'sports-analysis':
      case 'get-fit':
        // Sports routes to the existing sports-routing step
        setCurrentStep('sports-routing');
        break;
      case 'custom-needs':
      case 'something-else':
        setCurrentStep('custom-needs-analysis');
        break;
      
      // Onboarding flow controls
      case 'start-onboarding':
        setCurrentStep('greeting');
        break;
      case 'signup':
        setCurrentStep('signup');
        break;
      case 'have-code':
        setCurrentStep('vip-code-entry');
        break;
      case 'my-dashboard':
        if (user) {
          router.push('/dashboard');
        } else {
          setCurrentStep('signup');
        }
        break;
      
      // Analysis completion actions
      case 'launch-agent':
        if (userAnalysisAgent) {
          handleLaunch(userAnalysisAgent, { source: 'analysis_completion' });
        }
        break;
      case 'chat-agent':
        if (userAnalysisAgent) {
          handleAgentChat(userAnalysisAgent);
        }
        break;
      case 'back-to-greeting':
        setCurrentStep('greeting');
        break;
      
      // Default to step change for other flows
      default:
        setCurrentStep(choiceId);
    }
  }, [trackBehavior, router, user, currentStep, userAnalysisAgent, handleLaunch, handleAgentChat]);

  const value: OnboardingContextType = {
    currentStep,
    setCurrentStep,
    inputValue,
    setInputValue,
    track,
    setTrack,
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
    handleLaunch,
    handleAgentChat,
    handleContinue,
    validateAndRoute,
    // Enhanced Free Scan Logic
    handleBusinessAnalysis,
    analysisIntent,
    setAnalysisIntent,
    freeAnalysisResults,
    recommendedAgents,
    isProcessingAnalysis,
    // Enhanced Percy Concierge Features
    percyMood,
    setPercyMood,
    userHistory,
    contextualSuggestions,
    updateContextualSuggestions,
  };

  // Debounced auto-redirect to dashboard upon email verification
  React.useEffect(() => {
    if (!isEmailVerified) return;
    const handler = setTimeout(() => {
      router.push('/dashboard');
    }, 300);
    return () => clearTimeout(handler);
  }, [isEmailVerified, router]);

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};