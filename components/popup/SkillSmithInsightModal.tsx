'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Trophy, Zap, ArrowRight, Activity, Brain, Flame } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { agentPath, safeAgentPath } from '@/utils/agentRouting';
import { getSportsAddons, getSportsAddonLabel } from '@/lib/sports/addOnsData';
import toast from 'react-hot-toast';

export interface SkillSmithInsightModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: 'sports_page' | 'addon' | 'scan' | 'performance';
  sportType?: 'soccer' | 'basketball' | 'tennis' | 'general';
  customCopy?: {
    title?: string;
    benefits?: string[];
    ctaText?: string;
  };
  onEngagement?: (action: string, data?: any) => void;
}

interface PerformanceAnalysis {
  sport: string;
  weaknesses: string[];
  strengths: string[];
  recommendedAddons: string[];
  trainingFocus: string[];
  confidenceScore: number;
  nextSteps: string[];
}

export default function SkillSmithInsightModal({
  isOpen,
  onClose,
  trigger = 'sports_page',
  sportType = 'general',
  customCopy,
  onEngagement
}: SkillSmithInsightModalProps) {
  const router = useRouter();
  const [analysis, setAnalysis] = useState<PerformanceAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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

  // Simulate SkillSmith's performance analysis
  const analyzePerformance = async (): Promise<PerformanceAnalysis> => {
    setIsAnalyzing(true);
    
    // Track modal opening
    trackEngagement('skillsmith_modal_opened', { trigger, sport_type: sportType });
    
    // Simulate AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Sport-specific analysis
    const analysisOptions: Record<string, PerformanceAnalysis> = {
      soccer: {
        sport: 'Soccer',
        weaknesses: ['Ball control under pressure', 'Weak foot accuracy', 'Defensive positioning'],
        strengths: ['Speed', 'Vision', 'Passing accuracy'],
        recommendedAddons: ['sports_addon_video', 'sports_addon_foundation'],
        trainingFocus: ['Technical drills', 'Pressure situations', 'Weak foot development'],
        confidenceScore: 87,
        nextSteps: [
          'Upload training footage for detailed analysis',
          'Focus on weak foot training (20 min daily)',
          'Practice 1v1 defensive scenarios'
        ]
      },
      basketball: {
        sport: 'Basketball',
        weaknesses: ['Free throw consistency', 'Left hand dribbling', 'Help defense timing'],
        strengths: ['Jump shot form', 'Court awareness', 'Rebounding position'],
        recommendedAddons: ['sports_addon_video', 'sports_addon_emotion'],
        trainingFocus: ['Mental game', 'Pressure shooting', 'Ambidextrous skills'],
        confidenceScore: 91,
        nextSteps: [
          'Record game footage for analysis',
          'Mental performance coaching sessions',
          'Daily weak hand skill work'
        ]
      },
      tennis: {
        sport: 'Tennis',
        weaknesses: ['Backhand power', 'Net game confidence', 'Service consistency'],
        strengths: ['Forehand technique', 'Footwork', 'Match strategy'],
        recommendedAddons: ['sports_addon_emotion', 'sports_addon_nutrition'],
        trainingFocus: ['Mental toughness', 'Serve mechanics', 'Approach shots'],
        confidenceScore: 84,
        nextSteps: [
          'Mental game assessment',
          'Serve technique video analysis',
          'Nutrition optimization for endurance'
        ]
      },
      general: {
        sport: 'Athletic Performance',
        weaknesses: ['Consistency under pressure', 'Recovery optimization', 'Mental focus'],
        strengths: ['Work ethic', 'Coachability', 'Physical conditioning'],
        recommendedAddons: ['sports_addon_foundation', 'sports_addon_nutrition'],
        trainingFocus: ['Foundation skills', 'Mental performance', 'Recovery protocols'],
        confidenceScore: 89,
        nextSteps: [
          'Complete athletic assessment',
          'Develop personalized training plan',
          'Optimize nutrition and recovery'
        ]
      }
    };
    
    const selectedAnalysis = analysisOptions[sportType] || analysisOptions.general;
    
    setIsAnalyzing(false);
    return selectedAnalysis;
  };

  // Run analysis when modal opens
  useEffect(() => {
    if (isOpen && !analysis) {
      analyzePerformance().then(setAnalysis);
    }
  }, [isOpen]);

  // Handle action tracking
  const trackEngagement = (action: string, data?: any) => {
    onEngagement?.(action, { 
      sport_type: sportType,
      trigger,
      ...data 
    });
    
    // Analytics tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'skillsmith_insight_engagement', {
        action,
        sport_type: sportType,
        trigger
      });
    }

    // Track via our analytics system
    fetch('/api/analytics/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'skillsmith.popup.engagement',
        page_path: window.location.pathname,
        vertical: 'sports',
        metadata: {
          action,
          sport_type: sportType,
          trigger
        },
        timestamp: new Date().toISOString()
      })
    }).catch(console.warn);
  };

  // Handle SkillSmith agent navigation
  const handleStartWithSkillSmith = () => {
    trackEngagement('start_with_skillsmith');
    router.push(safeAgentPath('skillsmith'));
    onClose();
  };

  // Handle add-on purchase
  const handleGetAddon = (addonSku: string) => {
    trackEngagement('addon_interest', { addon_sku: addonSku });
    
    // Navigate to pricing with add-on focus
    router.push(`/sports?addon=${addonSku}#addons`);
    onClose();
  };

  // Handle free trial
  const handleStartFreeTrial = () => {
    trackEngagement('start_free_trial');
    router.push('/sports#pricing');
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
        aria-labelledby="skillsmith-modal-title"
        aria-describedby="skillsmith-modal-description"
      >
        <motion.div
          ref={modalRef}
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: 'spring', duration: 0.6 }}
          className="relative max-w-3xl w-full bg-gradient-to-br from-[rgba(21,23,30,0.95)] to-[rgba(30,35,45,0.95)] backdrop-blur-xl border-2 border-orange-400/50 rounded-3xl overflow-hidden shadow-[0_0_80px_#f97316aa]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            ref={firstFocusableRef}
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-800/50 hover:bg-slate-700/70 transition-colors text-gray-400 hover:text-white border border-orange-400/30"
            aria-label="Close SkillSmith Insight Modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="p-6 border-b border-orange-400/20">
            <div className="flex items-start gap-4">
              <Image
                src="/images/agents/skillsmith-nobg.png"
                alt="SkillSmith AI Coach"
                width={60}
                height={60}
                className="rounded-full border-2 border-orange-400/50"
                priority
              />
              <div className="flex-1">
                <motion.div
                  className="flex items-center gap-2 mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                  <span className="text-orange-400 font-bold text-sm">
                    {isAnalyzing ? 'SKILLSMITH ANALYZING...' : 'SKILLSMITH INSIGHTS READY'}
                  </span>
                </motion.div>
                <h2 id="skillsmith-modal-title" className="text-2xl font-bold text-white mb-2">
                  {customCopy?.title || `${sportType === 'general' ? 'Athletic' : sportType.charAt(0).toUpperCase() + sportType.slice(1)} Performance Analysis`}
                </h2>
                <p id="skillsmith-modal-description" className="text-gray-300">
                  AI-powered insights to unlock your athletic potential
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
                  <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <div className="absolute inset-2 w-12 h-12 border-2 border-red-400 border-b-transparent rounded-full animate-spin animate-reverse"></div>
                  <Activity className="absolute inset-0 m-auto w-6 h-6 text-orange-300" />
                </div>
                <motion.p
                  className="text-orange-300 font-semibold mb-2"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Analyzing your {sportType} performance patterns...
                </motion.p>
                <p className="text-gray-400 text-sm">
                  SkillSmith is processing biomechanics, technique, and mental game data
                </p>
              </motion.div>
            ) : analysis ? (
              // Analysis Results
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {/* Performance Score */}
                <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-400/30 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-green-400" />
                      <span className="text-green-400 font-bold">PERFORMANCE SCORE</span>
                    </div>
                    <span className="text-2xl font-bold text-white">{analysis.confidenceScore}/100</span>
                  </div>
                  <p className="text-green-300 text-sm">
                    Above average! You have strong fundamentals with clear improvement opportunities.
                  </p>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {/* Strengths */}
                  <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-400/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-5 h-5 text-blue-400" />
                      <span className="text-blue-400 font-bold">STRENGTHS</span>
                    </div>
                    <div className="space-y-2">
                      {analysis.strengths.map((strength, index) => (
                        <div key={index} className="flex items-center gap-2 text-blue-200">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span className="text-sm">{strength}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Areas for Improvement */}
                  <div className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-400/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Flame className="w-5 h-5 text-amber-400" />
                      <span className="text-amber-400 font-bold">FOCUS AREAS</span>
                    </div>
                    <div className="space-y-2">
                      {analysis.weaknesses.map((weakness, index) => (
                        <div key={index} className="flex items-center gap-2 text-amber-200">
                          <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                          <span className="text-sm">{weakness}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recommended Add-ons */}
                <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-400/30 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-5 h-5 text-purple-400" />
                    <span className="text-purple-400 font-bold">RECOMMENDED UPGRADES</span>
                  </div>
                  <div className="space-y-2">
                    {analysis.recommendedAddons.map((addonSku, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-purple-800/20 rounded-lg">
                        <span className="text-purple-200 font-medium">
                          {getSportsAddonLabel(addonSku)}
                        </span>
                        <button
                          onClick={() => handleGetAddon(addonSku)}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-md transition-colors"
                        >
                          Get This
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Steps */}
                <div className="bg-gradient-to-r from-teal-900/30 to-cyan-900/30 border border-teal-400/30 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-5 h-5 text-teal-400" />
                    <span className="text-teal-400 font-bold">YOUR ACTION PLAN</span>
                  </div>
                  <div className="space-y-2">
                    {analysis.nextSteps.map((step, index) => (
                      <div key={index} className="flex items-center gap-2 text-teal-200">
                        <span className="text-teal-400 font-bold">{index + 1}.</span>
                        <span className="text-sm">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : null}
          </div>

          {/* Action Buttons */}
          {!isAnalyzing && analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="p-6 border-t border-orange-400/20 bg-gradient-to-r from-slate-900/30 to-slate-800/30"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleStartWithSkillSmith}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl hover:from-orange-400 hover:to-red-500 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  {customCopy?.ctaText || 'Start with SkillSmith'}
                </button>
                <button
                  onClick={handleStartFreeTrial}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white font-semibold rounded-xl hover:from-slate-500 hover:to-slate-600 transition-all border border-slate-500 flex items-center justify-center gap-2"
                >
                  <Trophy className="w-5 h-5" />
                  View All Plans
                </button>
              </div>
              <p className="text-center text-gray-400 text-sm mt-3">
                ⚡ Upload your first video • 🎯 Get instant feedback • 🏆 Track improvement
              </p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}