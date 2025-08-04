'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Zap, Target, Trophy, Clock, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import CosmicButton from '../shared/CosmicButton';
import toast from 'react-hot-toast';

export interface PercySuggestionProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
  featureDescription?: string;
  primaryColor?: string;
  customCopy?: {
    title?: string;
    benefits?: string[];
    urgencyMessage?: string;
  };
  onEngagement?: (action: string, data?: any) => void;
}

interface BusinessAnalysis {
  type: 'startup' | 'smb' | 'enterprise' | 'agency' | 'freelancer' | 'ecommerce' | 'saas' | 'general';
  confidence: number;
  recommendation: string;
  bestAgent: string;
  agentRoute: string;
  urgencyMessage: string;
  benefits: string[];
}

export default function PercySuggestionModal({
  isOpen,
  onClose,
  featureName = "AI Feature",
  featureDescription = "Advanced AI automation",
  primaryColor = "from-cyan-500 to-blue-600",
  customCopy,
  onEngagement
}: PercySuggestionProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [businessAnalysis, setBusinessAnalysis] = useState<BusinessAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  // Simulate business type analysis based on feature and user context
  const analyzeBusinessType = async (): Promise<BusinessAnalysis> => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock business type detection (in real app, this would use user data/inputs)
    const businessTypes: BusinessAnalysis[] = [
      {
        type: 'startup',
        confidence: 95,
        recommendation: `${featureName} is PERFECT for startups like yours! You need to move fast and establish market presence.`,
        bestAgent: 'Marketing Warfare',
        agentRoute: '/services/marketing',
        urgencyMessage: 'Startups using this feature see 312% faster market penetration!',
        benefits: [
          'Launch faster than competitors',
          'Professional presence from day 1', 
          'Scale without hiring overhead'
        ]
      },
      {
        type: 'smb',
        confidence: 88,
        recommendation: `Small businesses LOVE ${featureName} - it levels the playing field against enterprise competitors!`,
        bestAgent: 'Business Automation',
        agentRoute: '/services/biz-agent',
        urgencyMessage: 'SMBs report saving 40+ hours/week with this feature!',
        benefits: [
          'Compete with enterprise-level tools',
          'Massive time and cost savings',
          'Professional results without the price tag'
        ]
      },
      {
        type: 'agency',
        confidence: 92,
        recommendation: `Agencies are CRUSHING it with ${featureName} - deliver 10x faster for clients!`,
        bestAgent: 'Content Automation',
        agentRoute: '/services/content-automation',
        urgencyMessage: 'Agencies using this feature increase client retention by 89%!',
        benefits: [
          'Deliver projects 10x faster',
          'Scale client capacity infinitely',
          'Premium pricing for AI-powered results'
        ]
      }
    ];
    
    // Select based on feature type or randomize for demo
    const selectedType = businessTypes[Math.floor(Math.random() * businessTypes.length)];
    
    setIsAnalyzing(false);
    return selectedType;
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
      ...data 
    });
    
    // Analytics tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'percy_suggestion_engagement', {
        action,
        feature_name: featureName,
        business_type: businessAnalysis?.type,
        user_authenticated: !!user
      });
    }
  };

  // Handle agent team navigation
  const handleMeetAgentTeam = () => {
    trackEngagement('meet_agent_team');
    router.push('/agents');
    onClose();
  };

  // Handle free trial - check authentication
  const handleStartFreeTrial = () => {
    trackEngagement('start_free_trial');
    
    if (!user && !isLoading) {
      setShowAuthPrompt(true);
      return;
    }
    
    // If authenticated, go to recommended agent
    if (businessAnalysis?.agentRoute) {
      router.push(businessAnalysis.agentRoute);
    } else {
      router.push('/');
    }
    onClose();
  };

  // Handle authentication redirect
  const handleAuthRedirect = () => {
    trackEngagement('auth_redirect');
    router.push('/sign-up?intent=feature_activation&feature=' + encodeURIComponent(featureName));
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
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="relative max-w-2xl w-full bg-gradient-to-br from-[rgba(21,23,30,0.95)] to-[rgba(30,35,45,0.95)] backdrop-blur-xl border-2 border-cyan-400/50 rounded-3xl overflow-hidden shadow-[0_0_80px_#30d5c8aa]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800/50 hover:bg-slate-700/70 transition-colors text-gray-400 hover:text-white border border-cyan-400/30"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="p-6 border-b border-cyan-400/20">
            <div className="flex items-start gap-4">
              <Image
                src="/images/agents-percy-nobg-skrblai.webp"
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
                  <span className="text-green-400 font-bold text-sm">PERCY AI ANALYZING...</span>
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {customCopy?.title || `${featureName} Intelligence Report`}
                </h2>
                <p className="text-gray-300">
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
                </div>
                <motion.p
                  className="text-cyan-300 font-semibold"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Analyzing your business profile and competitive landscape...
                </motion.p>
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
                    Perfect Match Analysis
                  </h3>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    {businessAnalysis.recommendation}
                  </p>
                  
                  {/* Benefits */}
                  <div className="space-y-2">
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
              </motion.div>
            ) : null}

            {/* Authentication Prompt */}
            {showAuthPrompt && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-400/30 rounded-xl p-4 mb-6"
              >
                <h4 className="text-purple-400 font-bold mb-2">Quick Setup Required</h4>
                <p className="text-white mb-3">
                  Create your free account to activate {featureName} and start seeing results immediately!
                </p>
                <CosmicButton
                  onClick={handleAuthRedirect}
                  variant="primary"
                  size="sm"
                  className="w-full"
                >
                  Create Free Account (30 seconds)
                  <ArrowRight className="w-4 h-4 ml-2" />
                </CosmicButton>
              </motion.div>
            )}
          </div>

          {/* Action Buttons */}
          {!isAnalyzing && businessAnalysis && !showAuthPrompt && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="p-6 border-t border-cyan-400/20 bg-gradient-to-r from-slate-900/30 to-slate-800/30"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <CosmicButton
                  onClick={handleStartFreeTrial}
                  variant="primary"
                  size="lg"
                  className="flex-1 justify-center"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Start Free Trial
                </CosmicButton>
                <CosmicButton
                  onClick={handleMeetAgentTeam}
                  variant="secondary"
                  size="lg"
                  className="flex-1 justify-center"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Meet The Agent Team
                </CosmicButton>
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