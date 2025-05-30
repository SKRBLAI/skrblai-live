"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from 'next/image';
import AgentConstellation from "../agents/AgentConstellation";
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

// Only include agents that are not Percy for all agent grid/carousel logic
const visibleAgents = agentDashboardList.filter(
  a => a.visible !== false && a.id && a.name && a.id !== 'percy-agent'
);

export default function PercyHero() {
  const router = useRouter();
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

  // Generate session ID for tracking
  const [sessionId] = useState(() => `percy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

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

  // Handle lead submission (ENHANCED)
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

      // Save lead to database
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { error: leadError } = await supabase
        .from('leads')
        .insert([{
          email: fullLeadData.email,
          phone: fullLeadData.phone || null,
          company_size: fullLeadData.companySize || null,
          problem: fullLeadData.problem,
          industry: fullLeadData.industry,
          timeline: fullLeadData.timeline,
          qualification_score: qualificationScore,
          session_id: sessionId
        }]);

      if (leadError) {
        console.error('Failed to save lead:', leadError);
      }

      // Send to email automation system
      if (fullLeadData.email) {
        await emailAutomation.sendWelcomeEmail(fullLeadData.email, 'there');
        
        // High-value leads get immediate notification
        if (qualificationScore >= 75) {
          // TODO: Send high-priority notification to sales team
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,119,198,0.3),transparent)]"></div>
      
      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        
        {/* Enhanced Hero Section */}
        <div className="text-center mb-8 max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white mb-6 leading-tight"
          >
            Meet{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Percy
            </span>
            , Your AI Concierge
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            I'm here to guide you to the perfect AI solution for your business. No overwhelm, no confusion - just personalized recommendations from someone who knows AI inside and out.
          </motion.p>

          {/* Enhanced Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25"
            >
              🤖 Talk to Percy
            </button>
            <button
              onClick={handleExploreFeatures}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
            >
              ✨ Explore Features
            </button>
            <button
              onClick={handleSeeFeatures}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-emerald-500/25"
            >
              🎯 See What SKRBL AI Can Do
            </button>
          </motion.div>
        </div>

        {/* Enhanced Percy Avatar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="relative mb-16"
        >
          <div className="relative">
            <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 p-1 shadow-2xl shadow-cyan-500/50">
              <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                <Image
                  src="/images/percy-avatar.png"
                  alt="Percy AI Concierge"
                  width={192}
                  height={192}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>
            
            {/* Calm, reassuring animations */}
            <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20 animate-pulse"></div>
            <div className="absolute inset-0 rounded-full border border-blue-500/10 animate-ping"></div>
            
            {/* Thinking indicator */}
            {isPercyThinking && (
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                <div className="bg-slate-800/90 backdrop-blur-lg px-6 py-3 rounded-full border border-cyan-400/30">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-cyan-400 text-sm font-medium ml-2">Percy is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Popular Agents Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="w-full max-w-6xl mx-auto"
        >
          {/* Add testimonials here */}
          <PercyTestimonials />
          
          <h3 className="text-2xl sm:text-3xl font-bold text-white text-center mb-8 mt-12">
            Popular AI Agents
          </h3>
          
          <div className="relative">
            <AgentCarousel
              agents={visibleAgents.slice(0, 6)}
              onLaunch={(agent) => {
                setSelectedAgent(agent);
              }}
              showPremiumBadges={true}
            />
          </div>
        </motion.div>
      </div>

      {/* Percy's Consultation Modal */}
      <AnimatePresence>
        {showIntake && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-slate-900/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 max-w-4xl w-full border border-cyan-400/20 max-h-[90vh] overflow-y-auto"
            >
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-cyan-400 text-2xl focus:outline-none focus:ring-2 focus:ring-cyan-400/40 rounded-lg p-1 transition-all duration-200"
                onClick={() => setShowIntake(false)}
                aria-label="Close consultation"
              >
                ×
              </button>
              
              {!showLeadForm ? (
                <>
                  {/* Percy's Message */}
                  {percyMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 p-4 bg-cyan-500/10 border border-cyan-400/20 rounded-xl"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-sm font-bold">P</span>
                        </div>
                        <p className="text-cyan-300 text-sm leading-relaxed">{percyMessage}</p>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Conversation Interface */}
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="mb-2">
                        <span className="text-cyan-400 text-sm font-medium">
                          {conversationSteps[conversationStep]?.greeting}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {conversationSteps[conversationStep]?.question}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {conversationSteps[conversationStep]?.subtext}
                      </p>
                    </div>
                    
                    {/* Response Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {conversationSteps[conversationStep]?.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handlePercyResponse(option)}
                          disabled={isPercyThinking}
                          className="p-4 bg-slate-700/50 hover:bg-slate-600/70 text-white rounded-xl border border-cyan-400/20 hover:border-cyan-400/60 transition-all duration-300 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{option.emoji}</span>
                            <span className="group-hover:text-cyan-400 transition-colors">
                              {option.text}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Progress Indicator */}
                    <div className="flex justify-center mt-8">
                      <div className="flex space-x-2">
                        {conversationSteps.map((_, index) => (
                          <div
                            key={index}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                              index <= conversationStep ? 'bg-cyan-400' : 'bg-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-4 text-gray-400 text-sm">
                        Step {conversationStep + 1} of {conversationSteps.length}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <LeadCaptureForm 
                  leadData={leadData}
                  qualificationScore={qualificationScore}
                  onSubmit={handleLeadSubmit}
                />
              )}
              
              {/* Show Recommendations */}
              {suggestedAgents.length > 0 && !showLeadForm && (
                <div className="mt-8">
                  <h4 className="text-xl font-bold text-white text-center mb-6">
                    🎯 Percy's Personalized Recommendations
                  </h4>
                  <AgentCarousel
                    agents={suggestedAgents}
                    onLaunch={(agent) => {
                      setSelectedAgent(agent);
                      setShowIntake(false);
                    }}
                    showDetailedCards={true}
                    showPremiumBadges={true}
                  />
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Agent Constellation */}
      <AgentConstellation
        agents={visibleAgents}
        selectedAgent={selectedAgent}
        setSelectedAgent={setSelectedAgent}
      />
    </div>
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
