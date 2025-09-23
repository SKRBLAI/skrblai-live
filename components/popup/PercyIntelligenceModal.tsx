'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Zap, Target, Trophy, Clock, ArrowRight, Brain, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { agentPath, safeAgentPath, agentLeaguePath } from '@/utils/agentRouting';
import toast from 'react-hot-toast';

export interface PercyIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: 'pricing' | 'feature' | 'agent_league' | 'cta' | 'scan';
  featureName?: string;
  featureDescription?: string;
  customCopy?: {
    title?: string;
    benefits?: string[];
    urgencyMessage?: string;
    ctaText?: string;
  };
  onEngagement?: (action: string, data?: any) => void;
  vertical?: 'business' | 'sports';
}

interface BusinessAnalysis {
  type: 'startup' | 'smb' | 'enterprise' | 'agency' | 'freelancer' | 'ecommerce' | 'saas' | 'athlete' | 'coach';
  confidence: number;
  recommendation: string;
  bestAgent: string;
  agentId: string;
  urgencyMessage: string;
  benefits: string[];
  quickWins: string[];
}

export default function PercyIntelligenceModal({
  isOpen,
  onClose,
  trigger = 'feature',
  featureName = "AI Intelligence",
  featureDescription = "Advanced AI-powered business optimization",
  customCopy,
  onEngagement,
  vertical = 'business'
}: PercyIntelligenceModalProps) {
  const router = useRouter();
  const [businessAnalysis, setBusinessAnalysis] = useState<BusinessAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResults, setScanResults] = useState<any>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);

  // Focus management for accessibility
  useEffect(() => {
    if (isOpen && firstFocusableRef.current) {
      firstFocusableRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard event handling
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === 'Escape') {
        onClose();
      }

      // Focus trap
      if (event.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Simulate Percy's intelligent business analysis
  const analyzeBusinessType = async (): Promise<BusinessAnalysis> => {
    setIsAnalyzing(true);
    
    // Track modal opening
    trackEngagement('percy_modal_opened', { trigger, vertical });
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Business intelligence analysis based on vertical and trigger
    const analysisOptions: BusinessAnalysis[] = vertical === 'sports' ? [
      {
        type: 'athlete',
        confidence: 94,
        recommendation: `${featureName} is PERFECT for athletes like you! Percy has analyzed thousands of athletic performance patterns.`,
        bestAgent: 'SkillSmith Performance',
        agentId: 'skillsmith',
        urgencyMessage: 'Athletes using our AI see 340% faster skill improvement!',
        benefits: [
          'Optimize technique with frame-by-frame analysis',
          'Mental performance coaching protocols',
          'Personalized nutrition & recovery plans'
        ],
        quickWins: [
          'Upload your first training video',
          'Get instant technique feedback',
          'Receive personalized improvement plan'
        ]
      },
      {
        type: 'coach',
        confidence: 91,
        recommendation: `Coaches LOVE ${featureName} - manage multiple athletes with AI-powered insights!`,
        bestAgent: 'SkillSmith Coaching',
        agentId: 'skillsmith',
        urgencyMessage: 'Coaches report 89% better athlete outcomes with our platform!',
        benefits: [
          'Manage entire teams efficiently',
          'Data-driven performance tracking',
          'Automated training plan generation'
        ],
        quickWins: [
          'Set up team performance dashboard',
          'Upload team training footage',
          'Generate individual development plans'
        ]
      }
    ] : [
      {
        type: 'startup',
        confidence: 95,
        recommendation: `${featureName} is PERFECT for startups like yours! Percy has analyzed thousands of successful startup patterns.`,
        bestAgent: 'Business Automation',
        agentId: 'biz',
        urgencyMessage: 'Startups using our AI see 312% faster market penetration!',
        benefits: [
          'Launch faster than competitors',
          'Professional presence from day 1', 
          'Scale without hiring overhead'
        ],
        quickWins: [
          'Generate business strategy in 5 minutes',
          'Create professional marketing materials',
          'Set up automated customer workflows'
        ]
      },
      {
        type: 'smb',
        confidence: 88,
        recommendation: `Small businesses LOVE ${featureName} - it levels the playing field against enterprise competitors!`,
        bestAgent: 'Content & Social',
        agentId: 'contentcreation',
        urgencyMessage: 'SMBs report saving 40+ hours/week with our AI agents!',
        benefits: [
          'Compete with enterprise-level tools',
          'Massive time and cost savings',
          'Professional results without the price tag'
        ],
        quickWins: [
          'Audit your current marketing',
          'Generate 30 days of social content',
          'Set up lead generation funnels'
        ]
      },
      {
        type: 'agency',
        confidence: 92,
        recommendation: `Agencies are CRUSHING it with ${featureName} - deliver 10x faster for clients!`,
        bestAgent: 'Content Automation',
        agentId: 'contentcreation',
        urgencyMessage: 'Agencies using our platform increase client retention by 89%!',
        benefits: [
          'Deliver projects 10x faster',
          'Scale client capacity infinitely',
          'Premium pricing for AI-powered results'
        ],
        quickWins: [
          'Onboard your first client project',
          'Generate client presentation materials',
          'Set up automated reporting'
        ]
      }
    ];
    
    // Select analysis based on trigger context or randomize
    let selectedAnalysis: BusinessAnalysis;
    if (trigger === 'pricing') {
      selectedAnalysis = analysisOptions[0]; // Most relevant for pricing page
    } else if (trigger === 'agent_league') {
      selectedAnalysis = analysisOptions[1]; // Agency/coaching focus
    } else {
      selectedAnalysis = analysisOptions[Math.floor(Math.random() * analysisOptions.length)];
    }
    
    // Trigger scan if this was from a scan CTA
    if (trigger === 'scan' || trigger === 'cta') {
      try {
        const response = await fetch('/api/percy/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trigger: 'percy_modal',
            vertical,
            analysis_type: selectedAnalysis.type
          })
        });
        
        if (response.ok) {
          const scanData = await response.json();
          setScanResults(scanData);
          trackEngagement('percy_scan_completed', { analysis_type: selectedAnalysis.type });
        }
      } catch (error) {
        console.warn('Percy scan failed:', error);
      }
    }
    
    setIsAnalyzing(false);
    return selectedAnalysis;
  };

  // Run analysis when modal opens
  useEffect(() => {
    if (isOpen && !businessAnalysis) {
      analyzeBusinessType().then(setBusinessAnalysis);
    }
  }, [isOpen]);

  // Handle action tracking
  const trackEngagement = (action: string, data?: any) => {
    onEngagement?.(action, { 
      feature: featureName, 
      businessType: businessAnalysis?.type,
      trigger,
      vertical,
      ...data 
    });
    
    // Analytics tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'percy_intelligence_engagement', {
        action,
        feature_name: featureName,
        business_type: businessAnalysis?.type,
        trigger,
        vertical
      });
    }

    // Also track via our analytics system
    fetch('/api/analytics/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'percy.popup.engagement',
        action,
        feature_name: featureName,
        business_type: businessAnalysis?.type,
        trigger,
        vertical,
        timestamp: new Date().toISOString()
      })
    }).catch(console.warn);
  };

  // Handle agent team navigation
  const handleMeetAgentTeam = () => {
    trackEngagement('meet_agent_team');
    router.push(agentLeaguePath());
    onClose();
  };

  // Handle specific agent navigation
  const handleStartWithAgent = () => {
    trackEngagement('start_with_agent', { agent_id: businessAnalysis?.agentId });
    
    if (businessAnalysis?.agentId) {
      router.push(safeAgentPath(businessAnalysis.agentId));
    } else {
      router.push(agentLeaguePath());
    }
    onClose();
  };

  // Handle free trial
  const handleStartFreeTrial = () => {
    trackEngagement('start_free_trial');
    
    // Navigate to recommended agent or pricing
    if (businessAnalysis?.agentId) {
      router.push(safeAgentPath(businessAnalysis.agentId));
    } else {
      router.push('/pricing');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="percy-modal-title"
        aria-describedby="percy-modal-description"
      >
        <motion.div
          ref={modalRef}
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="relative max-w-3xl w-full bg-gradient-to-br from-[rgba(21,23,30,0.95)] to-[rgba(30,35,45,0.95)] backdrop-blur-xl border-2 border-cyan-400/50 rounded-3xl overflow-hidden shadow-[0_0_80px_#30d5c8aa]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            ref={firstFocusableRef}
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800/50 hover:bg-slate-700/70 transition-colors text-gray-400 hover:text-white border border-cyan-400/30"
            aria-label="Close Percy Intelligence Modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="p-6 border-b border-cyan-400/20">
            <div className="flex items-start gap-4">
              <Image
                src="/images/agents/percy-nobg.png"
                alt="Percy the AI Concierge"
                width={60}
                height={60}
                className="rounded-full border-2 border-cyan-400/50"
                priority
              />
              <div className="flex-1">
                <motion.div
                  className="flex items-center gap-2 mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 font-bold text-sm">
                    {isAnalyzing ? 'PERCY AI ANALYZING...' : 'PERCY INTELLIGENCE READY'}
                  </span>
                </motion.div>
                <h2 id="percy-modal-title" className="text-2xl font-bold text-white mb-2">
                  {customCopy?.title || `${featureName} Intelligence Report`}
                </h2>
                <p id="percy-modal-description" className="text-gray-300">
                  {featureDescription}
                </p>
              </div>
            </div>
          </div>

          {/* Analysis Content */}
          <div className="p-6">
            {isAnalyzing ? (
              // Analyzing State
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <div className="relative mb-4">
                  <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <div className="absolute inset-2 w-12 h-12 border-2 border-teal-400 border-b-transparent rounded-full animate-spin animate-reverse"></div>
                  <Brain className="absolute inset-0 m-auto w-6 h-6 text-cyan-300" />
                </div>
                <motion.p
                  className="text-cyan-300 font-semibold mb-2"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Analyzing your {vertical} profile and competitive landscape...
                </motion.p>
                <p className="text-gray-400 text-sm">
                  Percy is processing thousands of data points to create your personalized strategy
                </p>
              </motion.div>
            ) : businessAnalysis ? (
              // Analysis Results
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {/* Urgency Message */}
                <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 border border-orange-400/30 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-orange-400" />
                    <span className="text-orange-400 font-bold">URGENT OPPORTUNITY</span>
                  </div>
                  <p className="text-white font-semibold">
                    {businessAnalysis.urgencyMessage}
                  </p>
                </div>

                {/* Recommendation */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                    <Target className="w-6 h-6 text-cyan-400" />
                    Perfect Match Analysis ({businessAnalysis.confidence}% Confidence)
                  </h3>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    {businessAnalysis.recommendation}
                  </p>
                  
                  {/* Benefits */}
                  <div className="space-y-2 mb-4">
                    {businessAnalysis.benefits.map((benefit, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-green-300 font-medium">{benefit}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Quick Wins */}
                <div className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border border-emerald-400/30 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">YOUR QUICK WINS</span>
                  </div>
                  <div className="space-y-2">
                    {businessAnalysis.quickWins.map((win, index) => (
                      <div key={index} className="flex items-center gap-2 text-white">
                        <span className="text-emerald-400 font-bold">{index + 1}.</span>
                        <span>{win}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended Agent */}
                <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-400/30 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-cyan-400" />
                    <span className="text-cyan-400 font-bold">RECOMMENDED AGENT</span>
                  </div>
                  <p className="text-white font-semibold">
                    <span className="text-teal-400">{businessAnalysis.bestAgent}</span> is your perfect match for maximum results!
                  </p>
                </div>

                {/* Scan Results */}
                {scanResults && (
                  <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-400/30 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-5 h-5 text-purple-400" />
                      <span className="text-purple-400 font-bold">SCAN COMPLETE</span>
                    </div>
                    <p className="text-white text-sm">
                      Percy has identified {scanResults.opportunities || 3} optimization opportunities
                      and {scanResults.quick_wins || 5} immediate action items.
                    </p>
                  </div>
                )}
              </motion.div>
            ) : null}
          </div>

          {/* Action Buttons */}
          {!isAnalyzing && businessAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="p-6 border-t border-cyan-400/20 bg-gradient-to-r from-slate-900/30 to-slate-800/30"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleStartWithAgent}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  {customCopy?.ctaText || `Start with ${businessAnalysis.bestAgent}`}
                </button>
                <button
                  onClick={handleMeetAgentTeam}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white font-semibold rounded-xl hover:from-slate-500 hover:to-slate-600 transition-all border border-slate-500 flex items-center justify-center gap-2"
                >
                  <Users className="w-5 h-5" />
                  Meet The Agent Team
                </button>
              </div>
              <p className="text-center text-gray-400 text-sm mt-3">
                ⚡ Setup in 5 minutes • 🎯 See results in 7 days • 💰 Cancel anytime
              </p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}