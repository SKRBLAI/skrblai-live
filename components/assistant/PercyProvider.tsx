"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useRouter } from 'next/navigation';
import agentRegistry from '@/lib/agents/agentRegistry';

// --- Types ---
type WorkflowSessionType = string[]; // Can be changed to agent objects later

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
  const router = useRouter();

  // Debug agents on mount
  useEffect(() => {
    // Check if agent registry is loaded
    console.log('PercyProvider mounted, agent count:', agentRegistry.length);
    
    if (agentRegistry.length === 0) {
      console.error('WARNING: Agent registry is empty in PercyProvider!');
    } else {
      console.log('First few agents:', agentRegistry.slice(0, 3).map(a => a.name));
    }
  }, []);

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

  const openPercy = useCallback(() => setIsOpen(true), []);
  const closePercy = useCallback(() => setIsOpen(false), []);

  const routeToAgent = useCallback((intent: string) => {
    setPercyIntent(intent);
    console.log(`Routing to agent with intent: ${intent}`);
    const agent = agentRegistry.find(agent => agent.intent === intent);
    if (agent?.route) {
      console.log(`Found agent route: ${agent.route}`);
      router.push(agent.route);
    } else {
      console.warn(`No route found for agent intent: ${intent}`);
      router.push('/ask-percy?error=not-found');
    }
  }, [router]);

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
    setPercyIntent,
    routeToAgent,
    agentRegistry
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
