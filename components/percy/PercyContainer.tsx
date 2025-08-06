'use client';

import React, { useReducer, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import PercyAvatar from './PercyAvatar';
import PercyChat from './PercyChat';
import PercySocialProof from './PercySocialProof';
import PercyAnimations from './PercyAnimations';

// Centralized Percy State Management
interface PercyState {
  // Avatar & Mood
  mood: 'neutral' | 'excited' | 'thinking' | 'confident' | 'celebrating';
  isThinking: boolean;
  
  // Chat & Conversation
  currentStep: string;
  chatMessages: Array<{
    id: string;
    text: string;
    sender: 'percy' | 'user';
    timestamp: Date;
    type?: 'text' | 'action' | 'result';
  }>;
  inputValue: string;
  
  // Social Proof
  socialProofMessages: Array<{
    id: string;
    message: string;
    type: 'success' | 'activity' | 'milestone';
    timestamp: Date;
  }>;
  showSocialProof: boolean;
  
  // Animations & Performance
  animationsEnabled: boolean;
  animationIntensity: 'low' | 'medium' | 'high';
  
  // User State
  userInteracted: boolean;
  isVisible: boolean;
}

type PercyAction = 
  | { type: 'SET_MOOD'; mood: string }
  | { type: 'SET_THINKING'; isThinking: boolean }
  | { type: 'ADD_MESSAGE'; message: any }
  | { type: 'USER_INPUT'; input: string }
  | { type: 'SET_STEP'; step: string }
  | { type: 'TOGGLE_ANIMATIONS'; enabled?: boolean }
  | { type: 'SET_VISIBILITY'; isVisible: boolean }
  | { type: 'USER_INTERACTION' };

// Optimized reducer for Percy state
const percyReducer = (state: PercyState, action: PercyAction): PercyState => {
  switch (action.type) {
    case 'SET_MOOD':
      return { ...state, mood: action.mood as any };
      
    case 'SET_THINKING':
      return { ...state, isThinking: action.isThinking };
      
    case 'ADD_MESSAGE':
      return {
        ...state,
        chatMessages: [...state.chatMessages, action.message]
      };
      
    case 'USER_INPUT':
      return {
        ...state,
        inputValue: action.input,
        userInteracted: true,
        chatMessages: [
          ...state.chatMessages,
          {
            id: `user-${Date.now()}`,
            text: action.input,
            sender: 'user' as const,
            timestamp: new Date()
          }
        ]
      };
      
    case 'SET_STEP':
      return { ...state, currentStep: action.step };
      
    case 'TOGGLE_ANIMATIONS':
      return {
        ...state,
        animationsEnabled: action.enabled ?? !state.animationsEnabled
      };
      
    case 'SET_VISIBILITY':
      return { ...state, isVisible: action.isVisible };
      
    case 'USER_INTERACTION':
      return { ...state, userInteracted: true };
      
    default:
      return state;
  }
};

// Initial state
const initialPercyState: PercyState = {
  mood: 'neutral',
  isThinking: false,
  currentStep: 'greeting',
  chatMessages: [
    {
      id: 'percy-welcome',
      text: "Hey there! I'm Percy, your cosmic concierge. I can help analyze your business and recommend the perfect AI agents for you. What brings you here today?",
      sender: 'percy',
      timestamp: new Date()
    }
  ],
  inputValue: '',
  socialProofMessages: [
    {
      id: 'proof-1',
      message: "Sarah just increased her revenue by 40% using our AI content agents!",
      type: 'success',
      timestamp: new Date()
    },
    {
      id: 'proof-2',
      message: "124 businesses analyzed this week",
      type: 'activity',
      timestamp: new Date()
    }
  ],
  showSocialProof: true,
  animationsEnabled: true,
  animationIntensity: 'medium',
  userInteracted: false,
  isVisible: false
};

interface PercyContainerProps {
  className?: string;
  onAnalysisComplete?: (results: any) => void;
  onAgentLaunch?: (agentId: string) => void;
}

const PercyContainer: React.FC<PercyContainerProps> = ({
  className = '',
  onAnalysisComplete,
  onAgentLaunch
}) => {
  const [state, dispatch] = useReducer(percyReducer, initialPercyState);
  const containerRef = useRef<HTMLDivElement>(null);
  const performanceRef = useRef({ renderCount: 0, lastRender: Date.now() });

  // Performance monitoring
  useEffect(() => {
    performanceRef.current.renderCount++;
    const now = Date.now();
    const timeSinceLastRender = now - performanceRef.current.lastRender;
    
    // Warn if re-rendering too frequently
    if (timeSinceLastRender < 100 && performanceRef.current.renderCount > 20) {
      console.warn('🔥 PercyContainer: High render frequency detected');
      dispatch({ type: 'TOGGLE_ANIMATIONS', enabled: false });
    }
    
    performanceRef.current.lastRender = now;
  });

  // Intersection observer for visibility optimization
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        dispatch({ type: 'SET_VISIBILITY', isVisible: entry.isIntersecting });
      },
      { threshold: 0.1 }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  // Handle user input with debouncing for performance
  const handleUserInput = useCallback((input: string) => {
    dispatch({ type: 'USER_INPUT', input });
    
    // Simulate Percy thinking
    dispatch({ type: 'SET_THINKING', isThinking: true });
    dispatch({ type: 'SET_MOOD', mood: 'thinking' });
    
    // Simulate response after delay
    setTimeout(() => {
      dispatch({
        type: 'ADD_MESSAGE',
        message: {
          id: `percy-${Date.now()}`,
          text: "That's interesting! Let me analyze that for you...",
          sender: 'percy',
          timestamp: new Date()
        }
      });
      dispatch({ type: 'SET_THINKING', isThinking: false });
      dispatch({ type: 'SET_MOOD', mood: 'confident' });
    }, 2000);
  }, []);

  // Handle quick actions
  const handleActionClick = useCallback((actionId: string) => {
    dispatch({ type: 'USER_INTERACTION' });
    
    switch (actionId) {
      case 'scan-website':
        dispatch({ type: 'SET_STEP', step: 'analysis' });
        dispatch({ type: 'SET_MOOD', mood: 'excited' });
        break;
      case 'learn-more':
        dispatch({ type: 'SET_STEP', step: 'information' });
        break;
      default:
        break;
    }
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Background Animations */}
      <PercyAnimations
        enabled={state.animationsEnabled && state.isVisible}
        intensity={state.animationIntensity}
        className="absolute inset-0"
      />
      
      {/* Main Percy Interface */}
      <motion.div
        className="relative z-10 bg-transparent backdrop-blur-xl border-2 border-cyan-400/30 rounded-2xl overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Header with Avatar */}
        <div className="p-6 border-b border-cyan-400/20 flex items-center space-x-4">
          <PercyAvatar
            mood={state.mood}
            isThinking={state.isThinking}
            size="medium"
          />
          <div>
            <h3 className="text-lg font-semibold text-white">Percy</h3>
            <p className="text-sm text-cyan-300">Your Cosmic Concierge</p>
          </div>
        </div>
        
        {/* Chat Interface */}
        <PercyChat
          currentStep={state.currentStep}
          messages={state.chatMessages}
          isThinking={state.isThinking}
          onUserInput={handleUserInput}
          onActionClick={handleActionClick}
          className="min-h-[400px]"
        />
      </motion.div>
      
      {/* Social Proof */}
      <PercySocialProof
        messages={state.socialProofMessages}
        isVisible={state.showSocialProof && state.isVisible}
        position="bottom-left"
        autoRotate={true}
        rotationInterval={30}
      />
    </div>
  );
};

export default PercyContainer;