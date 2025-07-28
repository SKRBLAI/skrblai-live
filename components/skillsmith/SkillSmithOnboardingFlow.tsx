'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Target, TrendingUp, X, ShoppingCart, Star, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CosmicButton from '../shared/CosmicButton';

interface Product {
  id: string;
  title: string;
  description: string;
  detailedDescription: string;
  price: number;
  originalPrice?: number;
  sku: string;
  category: 'analysis' | 'training' | 'nutrition' | 'performance';
  features: string[];
  popular?: boolean;
}

interface PreviewStep {
  id: string;
  type: 'greeting' | 'demo' | 'results' | 'checkout-cta';
  skillSmithMessage: string;
  demoContent?: React.ReactNode;
  showOptions?: boolean;
  options?: { id: string; label: string; action: string }[];
}

interface SkillSmithOnboardingFlowProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onBuyNow: (product: Product) => void;
}

export default function SkillSmithOnboardingFlow({ 
  isOpen, 
  onClose, 
  product,
  onBuyNow 
}: SkillSmithOnboardingFlowProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<string>('greeting');
  const [isSkillSmithThinking, setIsSkillSmithThinking] = useState(false);
  const [demoProgress, setDemoProgress] = useState(0);
  const [analysisResults, setAnalysisResults] = useState<string[]>([]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen && product) {
      setCurrentStep('greeting');
      setDemoProgress(0);
      setAnalysisResults([]);
    }
  }, [isOpen, product]);

  // Simulate demo progress
  useEffect(() => {
    if (currentStep === 'demo') {
      const timer = setInterval(() => {
        setDemoProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            setTimeout(() => setCurrentStep('results'), 500);
            return 100;
          }
          return prev + 2;
        });
      }, 100);
      
      return () => clearInterval(timer);
    }
  }, [currentStep]);

  // Generate demo results based on product
  const generateDemoResults = useCallback(() => {
    if (!product) return [];
    
    const resultMap = {
      'form-analysis-pro': [
        "✅ Technique efficiency: 87% (Above average)",
        "⚠️ Minor form deviation detected at 0:23",
        "🎯 Recommended: Adjust hip angle by 5°",
        "📊 Injury risk: Low (2/10)",
        "🏆 Comparison: Similar to elite athlete pattern"
      ],
      'performance-insights-elite': [
        "🔥 Power output: 94th percentile",
        "⚡ Speed consistency: Excellent",
        "💪 Strength imbalance detected (Left: 92%, Right: 100%)",
        "🎯 Focus area: Explosive movement training",
        "📈 Improvement potential: 12-15% in 8 weeks"
      ],
      'custom-training-plan': [
        "🎯 Sport-specific weaknesses identified",
        "📋 12-week progressive program designed",
        "🏋️ 3x/week strength, 2x/week skill focus",
        "⚡ Periodization for peak performance",
        "📊 Weekly adaptation tracking included"
      ],
      'progress-tracker-premium': [
        "📊 Baseline metrics established",
        "📈 Improvement trends calculated",
        "🎯 Goal progression mapped",
        "⭐ Achievement milestones set",
        "🔮 Performance prediction: +18% in 3 months"
      ]
    };
    
    return resultMap[product.id as keyof typeof resultMap] || [];
  }, [product]);

  useEffect(() => {
    if (currentStep === 'results') {
      const results = generateDemoResults();
      setAnalysisResults(results);
    }
  }, [currentStep, generateDemoResults]);

  const handleStepTransition = (nextStep: string) => {
    setIsSkillSmithThinking(true);
    setTimeout(() => {
      setIsSkillSmithThinking(false);
      setCurrentStep(nextStep);
    }, 1000);
  };

  const handleBuyNow = () => {
    if (product) {
      onBuyNow(product);
      onClose();
    }
  };

  const steps: Record<string, PreviewStep> = {
    greeting: {
      id: 'greeting',
      type: 'greeting',
      skillSmithMessage: `Welcome to SkillSmith! I'm excited to show you a preview of ${product?.title}. This demo will simulate how our AI analyzes your performance in just 30 seconds. Ready to see the magic?`,
      showOptions: true,
      options: [
        { id: 'start-demo', label: 'Start Demo', action: 'demo' },
        { id: 'learn-more', label: 'Tell me more first', action: 'features' }
      ]
    },
    features: {
      id: 'features',
      type: 'demo',
      skillSmithMessage: `Here's what makes ${product?.title} special:`,
      showOptions: true,
      options: [
        { id: 'start-demo', label: 'Start Demo', action: 'demo' },
        { id: 'buy-now', label: 'Skip Demo - Buy Now', action: 'checkout-cta' }
      ]
    },
    demo: {
      id: 'demo',
      type: 'demo',
      skillSmithMessage: `Analyzing your performance data... Our AI is processing movement patterns, biomechanics, and comparing against elite athlete databases.`,
    },
    results: {
      id: 'results',
      type: 'results',
      skillSmithMessage: `Amazing results! Here's what our AI analysis found:`,
      showOptions: true,
      options: [
        { id: 'buy-now', label: 'Get Full Analysis', action: 'checkout-cta' },
        { id: 'learn-more', label: 'See More Features', action: 'features' }
      ]
    },
    'checkout-cta': {
      id: 'checkout-cta',
      type: 'checkout-cta',
      skillSmithMessage: `Ready to unlock your athletic potential? Get ${product?.title} today with our 30-day money-back guarantee!`,
    }
  };

  if (!isOpen || !product) return null;

  const currentStepData = steps[currentStep];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-gradient-to-b from-gray-900/95 via-gray-800/95 to-gray-900/95 border border-orange-500/30 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto backdrop-blur-xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-orange-500/20 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <motion.div
                    animate={isSkillSmithThinking ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 1, repeat: isSkillSmithThinking ? Infinity : 0 }}
                    className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center"
                  >
                    <Sparkles className="w-8 h-8 text-white" />
                  </motion.div>
                  {isSkillSmithThinking && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-2 border-transparent border-t-orange-400 rounded-full"
                    />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">SkillSmith AI</h2>
                  <p className="text-orange-400">Preview: {product.title}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* SkillSmith Message */}
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 border border-orange-500/20 rounded-xl p-6 mb-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-lg leading-relaxed">
                    {currentStepData.skillSmithMessage}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Step-specific content */}
            {currentStep === 'features' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div className="grid gap-3">
                  {product.features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 text-gray-300"
                    >
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span>{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {currentStep === 'demo' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div className="bg-gray-800/30 border border-gray-600/30 rounded-xl p-6">
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-orange-400 mb-2">
                      {Math.round(demoProgress)}%
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <motion.div
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${demoProgress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                  <div className="text-center text-gray-400">
                    Processing biomechanical patterns...
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 'results' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div className="bg-gray-800/30 border border-gray-600/30 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Analysis Results</h3>
                  <div className="space-y-3">
                    {analysisResults.map((result, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.2 }}
                        className="bg-gray-700/50 rounded-lg p-3 text-gray-300"
                      >
                        {result}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 'checkout-cta' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    {product.originalPrice && (
                      <span className="text-gray-500 line-through text-xl">${product.originalPrice}</span>
                    )}
                    <span className="text-4xl font-bold text-orange-400">${product.price}</span>
                  </div>
                  <div className="text-gray-300 mb-4">
                    ✅ 30-day money-back guarantee<br/>
                    ✅ Instant access to full analysis<br/>
                    ✅ Used by 15,000+ athletes
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action buttons */}
            {currentStepData.showOptions && (
              <div className="flex gap-4 justify-center">
                {currentStepData.options?.map((option) => (
                  <CosmicButton
                    key={option.id}
                    variant={option.action === 'checkout-cta' ? 'primary' : 'outline'}
                    onClick={() => {
                      if (option.action === 'checkout-cta') {
                        handleBuyNow();
                      } else {
                        handleStepTransition(option.action);
                      }
                    }}
                    className={
                      option.action === 'checkout-cta'
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'
                        : ''
                    }
                  >
                    {option.action === 'checkout-cta' && <ShoppingCart className="w-5 h-5 mr-2" />}
                    {option.label}
                    {option.action !== 'checkout-cta' && <ArrowRight className="w-5 h-5 ml-2" />}
                  </CosmicButton>
                ))}
              </div>
            )}

            {currentStep === 'checkout-cta' && (
              <div className="flex gap-4 justify-center">
                <CosmicButton
                  variant="primary"
                  onClick={handleBuyNow}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Get {product.title} Now
                </CosmicButton>
                <CosmicButton
                  variant="outline"
                  onClick={onClose}
                  className="border-gray-400 text-gray-400 hover:bg-gray-400 hover:text-black"
                >
                  Maybe Later
                </CosmicButton>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}