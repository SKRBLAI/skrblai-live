import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/context/AuthContext';
import { usePercyContext } from '../components/assistant/PercyProvider';
import toast from 'react-hot-toast';

export interface OnboardingContextType {
  currentStep: string;
  setCurrentStep: (step: string) => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  handleUserChoice: (choiceId: string, data?: any) => void;
  handleInputSubmit: () => Promise<void>;
  promptBarValue: string;
  setPromptBarValue: (value: string) => void;
  handlePromptBarSubmit: () => Promise<void>;
  isPercyThinking: boolean;
  analysisResults: AnalysisResults | null;
  userAnalysisAgent: string;
  isVIPUser: boolean;
  vipTier: 'gold' | 'platinum' | 'diamond' | null;
  phoneVerified: boolean;
  handleLaunch: (agentId: string, context?: any) => Promise<void>;
  handleAgentChat: (agentId: string) => Promise<void>;
  handleContinue: (nextStep: string, routeTo?: string) => Promise<void>;
  validateAndRoute: (route: string, context?: string) => boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// Add AnalysisResults type
interface AnalysisResults {
  mode: string;
  input: string;
  insights: string[];
}

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [currentStep, setCurrentStep] = useState<string>('greeting');
  const [inputValue, setInputValue] = useState<string>('');
  const router = useRouter();
  const { user } = useAuth();
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

  // Validate VIP codes
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

  // Percy thinking helper
const handlePercyThinking = React.useCallback(async (duration: number = 2000) => {
  setIsPercyThinking(true);
  console.log('Percy is thinking...');
  await new Promise(resolve => setTimeout(resolve, duration));
  setIsPercyThinking(false);
  console.log('Percy is confident.');
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

      // Signup flow
  if (currentStep === 'signup') {
    if (trimmed.includes('@')) {
      // Email authentication
      const email = trimmed.toLowerCase();
      if (!email.includes('@')) {
        toast.error('Please enter a valid email address');
        return;
      }
      
      try {
        setIsPercyThinking(true);
        console.log('[Onboarding] Processing email authentication for:', email);
        
        const authResponse = await fetch('/api/auth/dashboard-signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email,
            autoSignIn: true,
            dashboardIntent: dashboardIntent
          })
        });
        
        const authData = await authResponse.json();
        
        if (authData.success) {
          setUserEmail(email);
          localStorage.setItem('user_email', email);
          localStorage.setItem('user_name', email.split('@')[0]);
          
          toast.success(`🎉 Welcome${authData.isNewUser ? ' to SKRBL AI' : ' back'}!`, {
            icon: authData.isNewUser ? '🚀' : '👋',
            duration: 3000,
          });
          
          // Route based on intent
          if (dashboardIntent || authData.hasAccess) {
            console.log('[Onboarding] Routing to dashboard after email authentication');
            router.push('/dashboard');
          } else {
            setCurrentStep('welcome');
          }
          
          setInputValue('');
        } else {
          throw new Error(authData.error || 'Authentication failed');
        }
      } catch (err: any) {
        console.error('[Onboarding] Email authentication error:', err);
        toast.error('Authentication issue. Try again or use code OWNER_ACCESS for immediate access.');
      } finally {
        setIsPercyThinking(false);
      }
    } else {
      // Phone entry
      setPhoneNumber(trimmed);
      setCurrentStep('phone-entry');
      setInputValue('');
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
}, [inputValue, currentStep, performAnalysis, validateVIPCode, router]);

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
  
  const isDynamicRoute = route.includes('/services/') || route.includes('/chat/') || 
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
const handleLaunch = React.useCallback(async (agentId: string, context?: any) => {
  console.log('[Onboarding] Launching agent:', agentId, context);
  trackBehavior('agent_launch', { agentId, context, from: currentStep });
  
  const route = `/services/${agentId}`;
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
}, [router, currentStep, trackBehavior, validateAndRoute]);

const handleAgentChat = React.useCallback(async (agentId: string) => {
  console.log('[Onboarding] Starting chat with agent:', agentId);
  trackBehavior('agent_chat_start', { agentId, from: currentStep });
  
  const route = `/services/${agentId}?tab=chat`;
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
}, [router, currentStep, trackBehavior, validateAndRoute]);

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
    switch (choiceId) {
      case 'sports-analysis':
        trackBehavior('choice_sports_routing', { from: 'onboarding' });
        router.push('/sports');
        break;
      case 'my-dashboard':
        trackBehavior('choice_dashboard', { from: 'onboarding' });
        if (user) {
          router.push('/dashboard');
        } else {
          setCurrentStep('signup');
        }
        break;
      default:
        trackBehavior(`choice_${choiceId}`, { from: 'onboarding' });
        setCurrentStep(choiceId);
    }
  }, [trackBehavior, router, user]);

  const value: OnboardingContextType = {
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
    handleLaunch,
    handleAgentChat,
    handleContinue,
    validateAndRoute,
  };

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