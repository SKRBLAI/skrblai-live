"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useRouter } from 'next/navigation';

// Import new Percy intelligence systems
import percyIntelligence, { generatePercyResponse, checkAgentAccess as checkAgentAccessIntelligence } from '@/lib/percy/intelligenceEngine';
import { agentAccessController, checkAgentAccess, filterAgentsByAccess } from '@/lib/agents/accessControl';
import { percyContextManager, initializePercyContext, trackPercyBehavior, getPercyContext, BEHAVIOR_TYPES } from '@/lib/percy/contextManager';

// Safely import agentRegistry with fallback
let agentRegistry: any[] = [];
try {
  const registryModule = require('@/lib/agents/agentRegistry');
  agentRegistry = registryModule.default || registryModule.agentDashboardList || [];
} catch (error) {
  console.error('Failed to load agent registry in PercyProvider:', error);
  agentRegistry = [];
}

// --- Enhanced Types ---
type WorkflowSessionType = string[];

interface PercyContextType {
  onboardingComplete: boolean;
  setOnboardingComplete: (value: boolean) => void;
  currentAgent: string | null;
  setCurrentAgent: (agent: string | null) => void;
  workflowSession: WorkflowSessionType;
  setWorkflowSession: (session: WorkflowSessionType) => void;
  isOpen: boolean;
  percyIntent: string;
  openPercy: () => void;
  closePercy: () => void;
  setPercyIntent: (intent: string) => void;
  routeToAgent: (intent: string) => void;
  agentRegistry: typeof agentRegistry;
  
  // NEW: Enhanced Percy Intelligence
  percyResponse: any;
  conversationPhase: string;
  generateSmartResponse: (message: string, context?: any) => Promise<any>;
  checkAgentAccess: (agentId: string) => Promise<any>;
  trackBehavior: (behaviorType: string, data?: any) => Promise<void>;
  getFilteredAgents: () => Promise<any[]>;
  conversionScore: number;
  subscriptionRecommendation: any;
  
  // NEW: Onboarding state tracking
  isOnboardingActive: boolean;
  setIsOnboardingActive: (active: boolean) => void;
}

export const PercyContext = createContext<PercyContextType | undefined>(undefined);

// --- Provider ---
export function PercyProvider({ children }: { children: ReactNode }) {
  // Onboarding state (with localStorage sync)
  const [onboardingComplete, setOnboardingCompleteState] = useState<boolean>(false);
  const [currentAgent, setCurrentAgentState] = useState<string | null>(null);
  const [workflowSession, setWorkflowSession] = useState<WorkflowSessionType>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [percyIntent, setPercyIntent] = useState('');
  const [isOnboardingActive, setIsOnboardingActive] = useState(false);
  const router = useRouter();

  // NEW: Enhanced Percy Intelligence State
  const [percyResponse, setPercyResponse] = useState<any>(null);
  const [conversationPhase, setConversationPhase] = useState<string>('subtle');
  const [conversionScore, setConversionScore] = useState<number>(0);
  const [subscriptionRecommendation, setSubscriptionRecommendation] = useState<any>(null);
  const [userId, setUserId] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Initialize Percy Intelligence and check authentication
  // Initialize Percy Intelligence system
  const initializePercyIntelligence = useCallback(async () => {
    try {
      // Generate or get user ID (session-based for anonymous users)
      let currentUserId = '';
      let authenticated = false;

      // Check authentication status
      if (typeof window !== 'undefined') {
        console.log('[SKRBL_AUTH_DEBUG_PERCY_PROVIDER] Checking auth status in localStorage.');
        // Try to get authenticated user ID from localStorage or auth state
        const storedUserId = localStorage.getItem('percy_user_id');
        const authState = localStorage.getItem('supabase.auth.token');
        console.log('[SKRBL_AUTH_DEBUG_PERCY_PROVIDER] Found supabase.auth.token in localStorage:', authState ? 'Yes' : 'No');
        
        if (authState) {
          try {
            const parsed = JSON.parse(authState);
            currentUserId = parsed.user?.id || '';
            authenticated = !!currentUserId;
            console.log('[SKRBL_AUTH_DEBUG_PERCY_PROVIDER] Parsed token. User ID:', currentUserId, 'Authenticated:', authenticated);
          } catch (e) {
            console.warn('Failed to parse auth state');
          }
        }
        
        // Fallback to session-based ID for anonymous users
        if (!currentUserId) {
          console.log('[SKRBL_AUTH_DEBUG_PERCY_PROVIDER] No authenticated user found, falling back to anonymous ID.');
          currentUserId = storedUserId || `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('percy_user_id', currentUserId);
        }
      }

      setUserId(currentUserId);
      setIsAuthenticated(authenticated);

      console.log('[SKRBL_AUTH_DEBUG_PERCY_PROVIDER] State updated in provider. UserID:', currentUserId, 'IsAuthenticated:', authenticated);

      // Initialize Percy context
      const context = await initializePercyContext(currentUserId, authenticated, {
        source: 'percy_provider',
        platform: 'web'
      });

      if (context) {
        setConversationPhase(context.conversationPhase);
        setConversionScore(context.conversionScore);
      }

      console.log('[Percy Intelligence] Initialized for user:', currentUserId, 'authenticated:', authenticated);
      
    } catch (error) {
      console.error('Error initializing Percy Intelligence:', error);
    }
  }, []);

  useEffect(() => {
    // Check if agent registry is loaded
    console.log('PercyProvider mounted, agent count:', agentRegistry.length);
    
    if (agentRegistry.length === 0) {
      console.error('WARNING: Agent registry is empty in PercyProvider!');
    } else {
      console.log('First few agents:', agentRegistry.slice(0, 3).map(a => a.name));
    }

    // Initialize Percy Intelligence
    initializePercyIntelligence();
  }, [initializePercyIntelligence]);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const onboard = localStorage.getItem("percy_onboardingComplete");
      setOnboardingCompleteState(onboard === "true");
      const agent = localStorage.getItem("percy_currentAgent");
      setCurrentAgentState(agent || null);
    }
  }, []);

  // Save onboardingComplete to localStorage when changed
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("percy_onboardingComplete", onboardingComplete ? "true" : "false");
    }
  }, [onboardingComplete]);

  // Save currentAgent to localStorage when changed
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (currentAgent) {
        localStorage.setItem("percy_currentAgent", currentAgent);
      } else {
        localStorage.removeItem("percy_currentAgent");
      }
    }
  }, [currentAgent]);

  // Setters that update state and localStorage
  const setOnboardingComplete = (value: boolean) => setOnboardingCompleteState(value);
  const setCurrentAgent = (agent: string | null) => setCurrentAgentState(agent);

  const openPercy = useCallback(() => {
    setIsOpen(true);
    console.log('[Percy] isOpen set to true (openPercy)');
  }, []);
  const closePercy = useCallback(() => {
    setIsOpen(false);
    console.log('[Percy] isOpen set to false (closePercy)');
  }, []);

  const setPercyIntentWithLog = (intent: string) => {
    setPercyIntent(intent);
    console.log(`[Percy] percyIntent set to: '${intent}'`);
  };

  const routeToAgent = useCallback(async (intent: string) => {
    setPercyIntentWithLog(intent);
    console.log(`[Percy] Routing to agent with intent: ${intent}`);
    
    // Track behavior
    if (userId) {
      await trackPercyBehavior(userId, BEHAVIOR_TYPES.AGENT_CLICK, {
        agentIntent: intent,
        source: 'percy_routing'
      });
    }
    
    const agent = agentRegistry.find(agent => agent.intent === intent);
    if (agent?.route) {
      console.log(`[Percy] Found agent route: ${agent.route}`);
      router.push(agent.route);
    } else {
      console.warn(`[Percy] No route found for agent intent: ${intent}`);
      router.push('/ask-percy?error=not-found');
    }
  }, [router, userId]);

  // Enhanced Percy Intelligence Functions
  const generateSmartResponse = useCallback(async (message: string, context: any = {}) => {
    if (!userId) return null;
    
    try {
      const response = await generatePercyResponse(userId, message, context);
      setPercyResponse(response);
      
      // Update context based on response
      const userContext = await getPercyContext(userId) as any;
      if (userContext) {
        setConversationPhase(userContext.conversationPhase);
        setConversionScore(userContext.conversionScore);
      }
      
      return response;
    } catch (error) {
      console.error('Error generating smart response:', error);
      return null;
    }
  }, [userId]);

  const checkAgentAccessEnhanced = useCallback(async (agentId: string) => {
    if (!userId) return { hasAccess: false, reason: 'no_user_id' };
    
    try {
      const accessResult = await checkAgentAccess(userId, agentId) as any;
      
      // Track access attempt
      await trackPercyBehavior(userId, 
        accessResult.hasAccess ? BEHAVIOR_TYPES.AGENT_VIEW : BEHAVIOR_TYPES.LOCKED_AGENT_CLICK,
        { agentId, accessResult }
      );
      
      return accessResult;
    } catch (error: any) {
      console.error('Error checking agent access:', error);
      return { hasAccess: false, reason: 'error', error: error.message };
    }
  }, [userId]);

  const trackBehaviorEnhanced = useCallback(async (behaviorType: string, data: any = {}) => {
    if (!userId) return;
    
    try {
      await trackPercyBehavior(userId, behaviorType, data);
      
      // Update local state after tracking
      const userContext = await getPercyContext(userId) as any;
      if (userContext) {
        setConversationPhase(userContext.conversationPhase);
        setConversionScore(userContext.conversionScore);
      }
    } catch (error) {
      console.error('Error tracking behavior:', error);
    }
  }, [userId]);

  const getFilteredAgentsEnhanced = useCallback(async () => {
    if (!userId) return agentRegistry;
    
    try {
      const filteredAgents = await filterAgentsByAccess(userId, agentRegistry);
      return filteredAgents;
    } catch (error) {
      console.error('Error filtering agents:', error);
      return agentRegistry;
    }
  }, [userId]);

  const value: PercyContextType = {
    onboardingComplete,
    setOnboardingComplete,
    currentAgent,
    setCurrentAgent,
    workflowSession,
    setWorkflowSession,
    isOpen,
    percyIntent,
    openPercy,
    closePercy,
    setPercyIntent: setPercyIntentWithLog,
    routeToAgent,
    agentRegistry,
    
    // NEW: Enhanced Percy Intelligence
    percyResponse,
    conversationPhase,
    generateSmartResponse,
    checkAgentAccess: checkAgentAccessEnhanced,
    trackBehavior: trackBehaviorEnhanced,
    getFilteredAgents: getFilteredAgentsEnhanced,
    conversionScore,
    subscriptionRecommendation,
    
    // NEW: Onboarding state tracking
    isOnboardingActive,
    setIsOnboardingActive,
  };

  return <PercyContext.Provider value={value}>{children}</PercyContext.Provider>;
}

// --- Hook ---
export function usePercyContext(): PercyContextType {
  const context = useContext(PercyContext);
  if (context === undefined) {
    throw new Error("usePercyContext must be used within a PercyProvider");
  }
  return context;
}

export function usePercyRouter() {
  const context = usePercyContext();
  if (!context) {
    console.error("usePercyRouter called outside of PercyProvider");
    // Return a fallback object to prevent crashes
    return { routeToAgent: () => console.warn("routeToAgent called outside PercyProvider") };
  }
  const { routeToAgent } = context;
  return { routeToAgent };
}

// Default export for compatibility
export default PercyProvider;
