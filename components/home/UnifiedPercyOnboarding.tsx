'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { usePercyContext } from '@/components/assistant/PercyProvider';
import { Upload, ArrowRight, Target, Sparkles } from 'lucide-react';

interface UnifiedPercyOnboardingProps {
  className?: string;
  onComplete?: (data: any) => void;
  onAgentsRecommended?: (agentIds: string[]) => void;
  agents?: any[];
}

// Unified goal system
const UNIFIED_GOALS = [
  { id: 'content', label: 'Automate Content Creation', icon: '✍️', intent: 'grow_social_media' },
  { id: 'branding', label: 'Build My Brand', icon: '🎨', intent: 'design_brand' },
  { id: 'website', label: 'Launch Website', icon: '🌐', intent: 'launch_website' },
  { id: 'publishing', label: 'Publish a Book', icon: '📖', intent: 'publish_book' },
  { id: 'analytics', label: 'Improve Marketing', icon: '📈', intent: 'improve_marketing' }
];

const PLATFORMS = [
  { value: 'instagram', label: 'Instagram', icon: '📸' },
  { value: 'youtube', label: 'YouTube', icon: '🎥' },
  { value: 'website', label: 'Website/Blog', icon: '🌐' },
  { value: 'shopify', label: 'Shopify', icon: '🛒' },
  { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { value: 'none', label: 'General Business', icon: '🏢' },
];

export default function UnifiedPercyOnboarding({ 
  className = '', 
  onComplete, 
  onAgentsRecommended, 
  agents = [] 
}: UnifiedPercyOnboardingProps) {
  const router = useRouter();
  const { setPercyIntent } = usePercyContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<'goals' | 'platform' | 'interaction' | 'results'>('goals');
  const [selectedGoal, setSelectedGoal] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoalSelect = (goalId: string) => {
    setSelectedGoal(goalId);
    setStep('platform');
  };

  const handlePlatformSelect = (platformId: string) => {
    setSelectedPlatform(platformId);
    setStep('interaction');
  };

  const handlePromptSubmit = () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      setStep('results');
    }, 2000);
  };

  const handleComplete = () => {
    const goalConfig = UNIFIED_GOALS.find(g => g.id === selectedGoal);
    if (goalConfig?.intent) {
      setPercyIntent(goalConfig.intent);
      router.push(`/dashboard?intent=${goalConfig.intent}&source=percy_onboarding`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.8 }}
      className={`w-full max-w-xl mx-auto cosmic-glass p-6 md:p-8 rounded-2xl border border-white/10 shadow-[0_0_32px_rgba(30,144,255,0.2)] ${className}`}
    >
      <div className="mb-4">
        <h3 className="text-xl md:text-2xl font-bold text-white mb-2 skrblai-heading drop-shadow-glow">Start Your Cosmic AI Journey</h3>
        <p className="text-teal-300 text-sm md:text-base">Percy will guide you to the perfect solution—just select your goal and platform!</p>
      </div>

      <AnimatePresence mode="wait">
        {step === 'goals' && (
          <motion.div key="goals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="space-y-3">
              {UNIFIED_GOALS.map(goal => (
                <button
                  key={goal.id}
                  onClick={() => handleGoalSelect(goal.id)}
                  className="w-full p-4 text-left rounded-xl bg-white/10 hover:bg-white/20 border border-cyan-400/20 hover:border-cyan-400/60 shadow-cosmic neon-glow transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400" aria-label={`Select goal: ${goal.label}`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{goal.icon}</span>
                    <span className="text-white font-medium">{goal.label}</span>
                    <ArrowRight className="w-5 h-5 text-gray-400 ml-auto" />
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'platform' && (
          <motion.div key="platform" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-2 gap-3">
              {PLATFORMS.map(platform => (
                <button
                  key={platform.value}
                  onClick={() => handlePlatformSelect(platform.value)}
                  className="p-4 text-center rounded-xl bg-white/10 hover:bg-white/20 border border-cyan-400/20 hover:border-cyan-400/60 shadow-cosmic neon-glow transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400" aria-label={`Select platform: ${platform.label}`}
                >
                  <span className="text-2xl mb-2 block">{platform.icon}</span>
                  <span className="text-white text-sm">{platform.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'interaction' && (
          <motion.div key="interaction" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="space-y-4">
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your project or goals..."
                  className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                  rows={4}
                />
                <button
                  onClick={handlePromptSubmit}
                  disabled={!prompt.trim() || isLoading}
                  className="absolute right-3 bottom-3 p-2 bg-cyan-400/20 hover:bg-cyan-400/30 rounded-lg transition-all duration-300 disabled:opacity-50"
                >
                  <ArrowRight className="w-5 h-5 text-cyan-400" />
                </button>
              </div>
              
              <div className="text-center text-gray-400">or</div>
              
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer hover:border-cyan-400/50 transition-all"
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-white">Upload files or documents</p>
                <input ref={fileInputRef} type="file" className="hidden" />
              </div>
            </div>
          </motion.div>
        )}

        {step === 'results' && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="text-center mb-6">
              <Sparkles className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Perfect! Here's what I recommend</h3>
              <p className="text-teal-300">Based on your {selectedGoal} goal</p>
            </div>
            
            <button
              onClick={handleComplete}
              className="w-full py-4 bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-bold rounded-xl"
            >
              Start Digital Superhero Experience
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 