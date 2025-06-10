"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PercyAvatar from '../ui/PercyAvatar';
import UniversalPromptBar from '../ui/UniversalPromptBar';
import SimpleAgentGrid from "../agents/SimpleAgentGrid";
import AgentCarousel from "../agents/AgentCarousel";
import type { Agent } from '@/types/agent';
import { useRouter } from "next/navigation";
import { usePercyTimeline } from "@/components/hooks/usePercyTimeline";
import { agentDashboardList } from '@/lib/agents/agentRegistry';
import { getBestAgents } from '@/utils/agentUtils';
import { saveToSupabase } from '@/utils/supabase';
import { trackPercyInteraction } from '@/lib/analytics/userJourney';
import { createClient } from '@supabase/supabase-js';
import { emailAutomation } from '@/lib/email/simpleAutomation';
import { trackPercyEvent } from '@/lib/analytics/percyAnalytics';
import PercyTestimonials from '@/components/percy/PercyTestimonials';
import { downloadLeadsCSV } from '@/lib/utils/leadExport';
import FloatingParticles from '@/components/ui/FloatingParticles';
import ConversationalPercyOnboarding from './ConversationalPercyOnboarding';
import { Sparkles, Star, Zap, Rocket, Target, Crown, Gem, Eye, EyeOff } from 'lucide-react';
import PercyFigure from './PercyFigure';
import { usePercyContext } from '@/components/assistant/PercyProvider';
import { agentBackstories } from '@/lib/agents/agentBackstories';

// Only include agents that are not Percy for all agent grid/carousel logic
const visibleAgents = agentDashboardList.filter(
  a => a.visible !== false && a.id && a.name && a.id !== 'percy-agent'
);

// Cosmic quick-select goals for onboarding
const percyGoals = [
  { text: "Generate more leads & customers", emoji: "🎯", category: "marketing" },
  { text: "Create better content faster", emoji: "✍️", category: "content" },
  { text: "Automate repetitive tasks", emoji: "⚡", category: "automation" },
  { text: "Build my personal brand", emoji: "🌟", category: "branding" },
];

interface PercyHeroProps {
  agents?: Agent[];
  onAgentSelect?: (agent: Agent) => void;
  onOnboardingComplete?: (data: any) => void;
}

export default function PercyHero({ 
  agents = [], 
  onAgentSelect, 
  onOnboardingComplete 
}: PercyHeroProps) {
  const router = useRouter();
  const { percyIntent, setPercyIntent } = usePercyContext();
  const [showIntake, setShowIntake] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [suggestedAgents, setSuggestedAgents] = useState<Agent[]>([]);
  const [timeline] = usePercyTimeline();
  const [user, setUser] = useState<any>(null);
  const [isPercyThinking, setIsPercyThinking] = useState(false);
  const [conversationStep, setConversationStep] = useState(0);
  const [percyMessage, setPercyMessage] = useState('');
  const [leadData, setLeadData] = useState({
    problem: '',
    industry: '',
    timeline: '',
    budget: '',
    email: '',
    phone: '',
    companySize: ''
  });
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [qualificationScore, setQualificationScore] = useState(0);
  const [useConversationalOnboarding, setUseConversationalOnboarding] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [recommendedAgents, setRecommendedAgents] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  // Generate session ID for tracking (memoized to prevent re-generation)
  const [sessionId] = useState(() => `percy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  // Optimize Supabase initialization (single effect with early return)
  useEffect(() => {
    let mounted = true;
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (mounted) {
        setUser(user);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  // Mobile performance monitoring
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile && typeof window !== 'undefined' && window.performance) {
      console.log('[PercyHero] Mobile Performance Check:', {
        isMobile,
        memory: (performance as any).memory ? {
          used: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024) + 'MB'
        } : 'Not available',
        timestamp: new Date().toISOString()
      });
    }
  }, [showIntake, selectedAgent]); // Only re-run when key state changes

  // Enhanced conversation flow with Percy's calm, knowledgeable personality
  const conversationSteps = [
    {
      greeting: "Hello! I'm Percy, your AI business concierge. 👋",
      question: "I'm here to help you find the perfect AI solution for your unique needs. Don't worry - there are no wrong answers here. Let's start simple:",
      subtext: "What's the main challenge you'd like AI to help you solve?",
      options: [
        { text: "Generate more leads & customers", emoji: "🎯", category: "marketing" },
        { text: "Create better content faster", emoji: "✍️", category: "content" },
        { text: "Write and publish a book", emoji: "📚", category: "publishing" },
        { text: "Automate repetitive tasks", emoji: "⚡", category: "automation" },
        { text: "Build my personal brand", emoji: "🌟", category: "branding" },
        { text: "I'm not sure yet...", emoji: "🤔", category: "exploration" }
      ],
      percyResponse: "Excellent choice! I work with many businesses facing similar challenges. Let me learn a bit more about your situation..."
    },
    {
      greeting: "Perfect! Now I understand your primary goal.",
      question: "To recommend the most effective AI agents for you, I'd like to understand your business context better:",
      subtext: "What industry or business type best describes you?",
      options: [
        { text: "Marketing/Advertising Agency", emoji: "📈", category: "agency" },
        { text: "Consultant or Coach", emoji: "🎯", category: "consulting" },
        { text: "E-commerce/Online Store", emoji: "🛒", category: "ecommerce" },
        { text: "Content Creator/Influencer", emoji: "📱", category: "creator" },
        { text: "Small Business Owner", emoji: "🏪", category: "smb" },
        { text: "Corporate/Enterprise", emoji: "🏢", category: "enterprise" },
        { text: "Freelancer/Solopreneur", emoji: "💼", category: "freelancer" },
        { text: "Other/Multiple", emoji: "🌐", category: "other" }
      ],
      percyResponse: "Great! I've helped many businesses in your industry achieve amazing results with AI. This context helps me recommend the most relevant solutions..."
    },
    {
      greeting: "Wonderful! I'm getting a clear picture of your needs.",
      question: "Time is always a factor in business decisions. Understanding your timeline helps me prioritize the right solutions:",
      subtext: "What's your ideal timeline for implementing an AI solution?",
      options: [
        { text: "I need results this week! 🚀", emoji: "⚡", urgency: "urgent" },
        { text: "Within the next month", emoji: "📅", urgency: "soon" },
        { text: "Next 2-3 months", emoji: "⏰", urgency: "planned" },
        { text: "Just exploring possibilities", emoji: "🔍", urgency: "research" }
      ],
      percyResponse: "Perfect! Based on your timeline, I can recommend solutions that fit your schedule and deliver results when you need them..."
    }
  ];

  // Percy's personalized responses based on user choices (FIXED)
  const getPercyPersonalizedMessage = (step: number, choice: string) => {
    const personalizedResponses: Record<string, Record<string, string>> = {
      "0": {
        "marketing": "Excellent! Lead generation is where AI really shines. I've helped businesses increase their leads by 300% using the right AI agents. Let me find the perfect solution for you...",
        "content": "Smart choice! Content creation AI can save you hours every day. I work with creators who now produce a week's worth of content in just one afternoon...",
        "publishing": "Fantastic! Book publishing with AI is revolutionary. I've guided authors who published bestsellers in record time using our specialized agents...",
        "automation": "Perfect! Business automation is my specialty. I help businesses eliminate 80% of their repetitive tasks. You're going to love what's possible...",
        "branding": "Brilliant! Personal branding with AI creates incredible results. I've seen individuals become industry leaders using the right AI strategies...",
        "exploration": "No worries at all! That's exactly why I'm here. Let me ask a few simple questions to discover what AI can do for your specific situation..."
      },
      "1": {
        "agency": "Agencies love our AI solutions! You'll be able to deliver better results for clients while increasing your profit margins. Many agencies see 40% efficiency gains...",
        "consulting": "Consultants are perfect for AI automation! You can focus on high-value strategy while AI handles research, content, and administrative tasks...",
        "ecommerce": "E-commerce and AI are a perfect match! From product descriptions to customer service, AI can transform every aspect of your online business...",
        "creator": "Content creators see incredible results with AI! You can multiply your content output while maintaining your unique voice and style...",
        "smb": "Small businesses get the biggest impact from AI! You can compete with much larger companies by leveraging AI automation strategically...",
        "enterprise": "Enterprise clients need sophisticated AI solutions. Our premium agents are designed for complex workflows and enterprise-scale operations...",
        "freelancer": "Freelancers love AI for scaling their business! You can take on more clients while delivering higher quality work in less time..."
      },
      "2": {
        "urgent": "I love the urgency! For immediate results, I'll recommend our most powerful agents that can start delivering value today. You'll see results within hours...",
        "soon": "Perfect timeline! A month gives us time to implement the right solution properly. You'll have everything optimized and running smoothly...",
        "planned": "Great planning approach! This timeline allows us to build a comprehensive AI strategy that transforms your entire workflow...",
        "research": "Smart to explore first! I'll show you exactly what's possible so you can make an informed decision when you're ready..."
      }
    };
    
    return personalizedResponses[String(step)]?.[choice] ?? "Thanks for that information! Let me find the perfect AI solution for your specific needs...";
  }

  // Calculate lead qualification score with Percy's intelligence
  const calculateLeadScore = (data: any) => {
    let score = 0;
    
    // Timeline scoring
    if (data.timeline?.includes('urgent') || data.timeline?.includes('week')) score += 30;
    else if (data.timeline?.includes('month')) score += 20;
    else if (data.timeline?.includes('2-3')) score += 15;
    
    // Industry scoring  
    if (data.industry?.includes('Agency') || data.industry?.includes('Enterprise')) score += 25;
    else if (data.industry?.includes('Consultant') || data.industry?.includes('Business')) score += 20;
    
    // Problem complexity scoring
    if (data.problem?.includes('leads') || data.problem?.includes('automate')) score += 25;
    else if (data.problem?.includes('content') || data.problem?.includes('branding')) score += 20;
    
    return score;
  };

  // Enhanced Percy response with personality
  const handlePercyResponse = async (option: any) => {
    setIsPercyThinking(true);
    
    // Track step completion
    await trackPercyEvent({
      event_type: 'step_completed',
      step_number: conversationStep + 1,
      user_choice: option.text || option,
      session_id: sessionId,
      user_id: user?.id,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      referrer: document.referrer
    });
    
    // Update lead data
    const newLeadData = { ...leadData };
    switch(conversationStep) {
      case 0:
        newLeadData.problem = option.text || option;
        break;
      case 1:
        newLeadData.industry = option.text || option;
        break;
      case 2:
        newLeadData.timeline = option.text || option;
        break;
    }
    setLeadData(newLeadData);
    
    // Get Percy's personalized response
    const personalizedMessage = getPercyPersonalizedMessage(
      conversationStep, 
      option.category || option.urgency || 'default'
    );
    
    // Simulate Percy thinking and responding
    setTimeout(() => {
      setPercyMessage(personalizedMessage);
      setIsPercyThinking(false);
      
      // Progress conversation
      if (conversationStep < conversationSteps.length - 1) {
        setTimeout(() => {
          setConversationStep(conversationStep + 1);
          setPercyMessage('');
        }, 3000);
      } else {
        // End of conversation - show recommendations
        setTimeout(() => {
          const score = calculateLeadScore(newLeadData);
          setQualificationScore(score);
          showPercyRecommendations(newLeadData, score);
        }, 3000);
      }
    }, 2000);
    
    // Track interaction
    await trackPercyInteraction('conversation_step', {
      step: conversationStep,
      choice: option.text || option,
      leadData: newLeadData
    });
  };

  // Percy's smart recommendations
  const showPercyRecommendations = (data: any, score: number) => {
    const recommendations = getSmartRecommendations(data);
    setSuggestedAgents(recommendations);
    
    if (score >= 50) {
      setShowLeadForm(true);
    } else {
      setShowIntake(true);
    }
  };

  // Smart agent recommendations based on user data
  const getSmartRecommendations = (data: any) => {
    let recommended = [];
    
    if (data.problem?.includes('leads') || data.problem?.includes('marketing')) {
      recommended = visibleAgents.filter(a => 
        a.name.includes('Marketing') || a.name.includes('Social') || a.name.includes('Lead')
      );
    } else if (data.problem?.includes('content')) {
      recommended = visibleAgents.filter(a => 
        a.name.includes('Content') || a.name.includes('Writing') || a.name.includes('Blog')
      );
    } else if (data.problem?.includes('book')) {
      recommended = visibleAgents.filter(a => 
        a.name.includes('Book') || a.name.includes('Publishing') || a.name.includes('Writing')
      );
    } else if (data.problem?.includes('branding')) {
      recommended = visibleAgents.filter(a => 
        a.name.includes('Brand') || a.name.includes('Design') || a.name.includes('Logo')
      );
    } else {
      recommended = visibleAgents.slice(0, 3);
    }
    
    return recommended.slice(0, 3);
  };

  // Handle lead submission (FIXED - REMOVE SERVICE KEY)
  const handleLeadSubmit = async (contactData: any) => {
    const fullLeadData = { ...leadData, ...contactData, qualificationScore };
    
    try {
      // Track lead capture event
      await trackPercyEvent({
        event_type: 'lead_captured',
        session_id: sessionId,
        user_id: user?.id,
        qualification_score: qualificationScore,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        referrer: document.referrer
      });

      // FIXED: Use API route instead of direct Supabase access
      const response = await fetch('/api/leads/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: fullLeadData.email,
          phone: fullLeadData.phone || null,
          company_size: fullLeadData.companySize || null,
          problem: fullLeadData.problem,
          industry: fullLeadData.industry,
          timeline: fullLeadData.timeline,
          qualification_score: qualificationScore,
          session_id: sessionId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit lead');
      }

      // Send to email automation system
      if (fullLeadData.email) {
        await fetch('/api/email/trigger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            triggerType: 'welcome-sequence',
            userId: user?.id,
            userEmail: fullLeadData.email,
            userRole: 'client',
            metadata: { userName: 'there' }
          })
        });
        
        // High-value leads get immediate notification
        if (qualificationScore >= 75) {
          console.log('🚨 High-value lead captured:', fullLeadData.email, 'Score:', qualificationScore);
        }
      }

      // Show success and recommended agents
      const recommendations = getSmartRecommendations(fullLeadData);
      setSuggestedAgents(recommendations);
      setShowLeadForm(false);
      
    } catch (error) {
      console.error('Lead submission failed:', error);
    }
  };

  // Track conversation start
  const handleGetStarted = () => {
    trackPercyEvent({
      event_type: 'conversation_start',
      session_id: sessionId,
      user_id: user?.id,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      referrer: document.referrer
    });
    
    setConversationStep(0);
    setShowIntake(true);
  };

  const handleExploreFeatures = () => {
    router.push("/features");
  };

  const handleSeeFeatures = () => {
    router.push("/features");
  };

  // Analytics tracking
  const trackPercyInteraction = useCallback(async (action: string, metadata?: any) => {
    try {
      const { trackPercyEvent } = await import('@/lib/analytics/percyAnalytics');
      await trackPercyEvent({
        event_type: 'conversation_start',
        user_choice: action,
        session_id: `percy-hero-${Date.now()}`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[PercyHero] Analytics tracking failed:', error);
      }
    }
  }, []);

  // Handle agent recommendations from onboarding
  const handleAgentsRecommended = useCallback((agentIds: string[]) => {
    setRecommendedAgents(agentIds);
    trackPercyInteraction('agents_recommended', { agents: agentIds });
  }, [trackPercyInteraction]);

  // Handle onboarding completion
  const handleOnboardingComplete = useCallback((data: any) => {
    trackPercyInteraction('onboarding_completed', data);
    if (onOnboardingComplete) {
      onOnboardingComplete(data);
    }
  }, [onOnboardingComplete, trackPercyInteraction]);

  // Background animations and effects
  const backgroundElements = Array.from({ length: 20 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
      animate={{
        x: [0, Math.random() * 100 - 50],
        y: [0, Math.random() * 100 - 50],
        opacity: [0.1, 0.3, 0.1],
        scale: [0.5, 1, 0.5],
      }}
      transition={{
        duration: Math.random() * 10 + 10,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {Math.random() > 0.5 ? (
        <Star className="w-2 h-2 text-cyan-400/30" />
      ) : (
        <Sparkles className="w-2 h-2 text-purple-400/30" />
      )}
    </motion.div>
  ));

  // Floating cosmic elements
  const cosmicElements = Array.from({ length: 8 }, (_, i) => (
    <motion.div
      key={`cosmic-${i}`}
      className="absolute pointer-events-none"
      style={{
        left: `${15 + Math.random() * 70}%`,
        top: `${15 + Math.random() * 70}%`,
      }}
      animate={{
        rotate: [0, 360],
        x: [0, Math.sin(i) * 50],
        y: [0, Math.cos(i) * 30],
        opacity: [0.2, 0.6, 0.2],
      }}
      transition={{
        duration: 15 + Math.random() * 10,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      {i % 4 === 0 && <Crown className="w-6 h-6 text-gold/40" />}
      {i % 4 === 1 && <Gem className="w-5 h-5 text-purple-400/40" />}
      {i % 4 === 2 && <Zap className="w-4 h-4 text-cyan-400/40" />}
      {i % 4 === 3 && <Target className="w-5 h-5 text-green-400/40" />}
    </motion.div>
  ));

  return (
    <section className="relative min-h-screen pt-20 md:pt-0 flex items-center justify-center overflow-hidden w-full px-3 md:px-4 bg-black/80" aria-label="Percy AI Assistant Hero Section">
      {/* Cosmic Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {backgroundElements}
        {cosmicElements}
      </div>

      {/* Dynamic Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full bg-[linear-gradient(90deg,transparent_24px,rgba(255,255,255,0.05)_25px,rgba(255,255,255,0.05)_26px,transparent_27px,transparent_74px,rgba(255,255,255,0.05)_75px,rgba(255,255,255,0.05)_76px,transparent_77px),linear-gradient(transparent_24px,rgba(255,255,255,0.05)_25px,rgba(255,255,255,0.05)_26px,transparent_27px,transparent_74px,rgba(255,255,255,0.05)_75px,rgba(255,255,255,0.05)_76px,transparent_77px)] bg-[length:100px_100px]" />
      </div>

      {/* Glowing Orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main Content Container */}
      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Percy Figure */}
          <div className="flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative"
            >
              {/* Percy Character with Enhanced Glow */}
              <div className="relative">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-cyan-500/30 rounded-full blur-2xl"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <PercyFigure />
              </div>

              {/* Floating Action Indicators */}
              <motion.div
                className="absolute -top-4 -right-4"
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full p-2">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
              </motion.div>

              {/* Percy's Welcome Message */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="mt-8 text-center max-w-md"
              >
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 skrblai-heading drop-shadow-glow">
                  Meet Percy
                </h1>
                <p className="text-lg text-cyan-300 mb-2">
                  {agentBackstories['percy-agent']?.superheroName || 'Your Cosmic Concierge'}
                </p>
                <p className="text-white/80 text-sm italic">
                  "{agentBackstories['percy-agent']?.catchphrase || 'Your wish is my command protocol!'}"
                </p>
              </motion.div>

              {/* Cosmic Powers Display */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="mt-6 flex flex-wrap justify-center gap-3 max-w-md"
              >
                {agentBackstories['percy-agent']?.powers?.slice(0, 4).map((power, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2 + index * 0.1 }}
                    className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20"
                  >
                    <span className="text-xs text-white/90">⚡ {power}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>

          {/* Right Column - Conversational Onboarding */}
          <div className="flex flex-col items-center lg:items-start">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="w-full"
            >
              <ConversationalPercyOnboarding />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Cosmic Energy Streams */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 3 }, (_, i) => (
          <motion.div
            key={`stream-${i}`}
            className="absolute w-px h-full bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent"
            style={{
              left: `${20 + i * 30}%`,
            }}
            animate={{
              opacity: [0, 0.5, 0],
              scaleY: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 1.5,
            }}
          />
        ))}
      </div>

      {/* Shooting Stars */}
      <AnimatePresence>
        {Array.from({ length: 2 }, (_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute"
            initial={{
              x: "-100px",
              y: `${Math.random() * 50 + 10}%`,
              opacity: 0,
            }}
            animate={{
              x: "calc(100vw + 100px)",
              y: `${Math.random() * 50 + 40}%`,
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: Math.random() * 5 + 2,
              ease: "easeOut",
            }}
          >
                                  <Star className="w-4 h-4 text-yellow-400" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Debug Panel (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 border border-white/10 z-50"
        >
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-white/70 hover:text-white/90 transition-colors"
          >
            {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="text-xs">Percy Debug</span>
          </button>
          
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2 text-xs text-white/60 space-y-1"
            >
              <div>Intent: {percyIntent || 'None'}</div>
              <div>Agents: {agents.length}</div>
              <div>Recommended: {recommendedAgents.join(', ') || 'None'}</div>
            </motion.div>
          )}
        </motion.div>
      )}
    </section>
  );
}

// Enhanced Lead Capture Form with Percy's guidance
function LeadCaptureForm({ leadData, qualificationScore, onSubmit }: any) {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companySize, setCompanySize] = useState('');

  return (
    <div className="text-center space-y-6">
      <div className="mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl">🎯</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Perfect! Percy has your personalized AI strategy ready
        </h2>
        <p className="text-gray-300 leading-relaxed">
          Based on our conversation, I've identified exactly which AI agents will solve your challenges. 
          Let me send you a custom implementation guide tailored to your specific situation.
        </p>
      </div>

      <div className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your business email"
          className="w-full p-4 bg-slate-900/50 text-white placeholder-gray-400 border border-cyan-400/30 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
        />
        
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone number (optional - for priority support)"
          className="w-full p-4 bg-slate-900/50 text-white placeholder-gray-400 border border-cyan-400/30 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
        />

        <select
          value={companySize}
          onChange={(e) => setCompanySize(e.target.value)}
          className="w-full p-4 bg-slate-900/50 text-white border border-cyan-400/30 rounded-xl focus:outline-none focus:border-cyan-400 appearance-none"
          aria-label="Select company size"
        >
          <option value="">Company size (helps Percy customize recommendations)</option>
          <option value="1-10">1-10 employees (Startup/Small)</option>
          <option value="11-50">11-50 employees (Growing Business)</option>
          <option value="51-200">51-200 employees (Mid-size)</option>
          <option value="200+">200+ employees (Enterprise)</option>
        </select>
      </div>

      <button
        onClick={() => onSubmit({ email, phone, companySize })}
        disabled={!email}
        className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
      >
        🚀 Send Me Percy's Custom AI Strategy (Free)
      </button>
      
      {qualificationScore >= 75 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 p-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-xl"
        >
          <div className="text-3xl mb-2">⭐</div>
          <p className="text-purple-300 font-medium mb-2">VIP Status Unlocked!</p>
          <p className="text-purple-200 text-sm">
            You qualify for a complimentary 30-minute strategy session with Percy's human AI experts. 
            We'll create a custom implementation roadmap for your business.
          </p>
        </motion.div>
      )}
      
      <p className="text-gray-500 text-xs">
        Percy respects your privacy. Your information is secure and will only be used to provide personalized AI recommendations.
      </p>
    </div>
  );
}
