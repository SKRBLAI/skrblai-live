"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// --- Types ---
type WorkflowSessionType = string[]; // Can be changed to agent objects later

interface PercyContextType {
  onboardingComplete: boolean;
  setOnboardingComplete: (value: boolean) => void;
  currentAgent: string | null;
  setCurrentAgent: (agent: string | null) => void;
  workflowSession: WorkflowSessionType;
  setWorkflowSession: (session: WorkflowSessionType) => void;
}

const PercyContext = createContext<PercyContextType | undefined>(undefined);

// --- Provider ---
export function PercyProvider({ children }: { children: ReactNode }) {
  // Onboarding state (with localStorage sync)
  const [onboardingComplete, setOnboardingCompleteState] = useState<boolean>(false);
  const [currentAgent, setCurrentAgentState] = useState<string | null>(null);
  const [workflowSession, setWorkflowSession] = useState<WorkflowSessionType>([]);

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

  const value: PercyContextType = {
    onboardingComplete,
    setOnboardingComplete,
    currentAgent,
    setCurrentAgent,
    workflowSession,
    setWorkflowSession,
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

// Default export for compatibility
export default PercyProvider;
