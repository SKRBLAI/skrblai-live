'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Clock, CheckCircle, ArrowRight, Star, Sparkles } from 'lucide-react';
import { UpgradePrompt } from '../../lib/trial/trialManager';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: UpgradePrompt;
  onUpgrade: () => void;
  daysRemaining?: number;
  usageStats?: {
    agentsUsedToday: number;
    scansUsedToday: number;
    agentLimit: number;
    scanLimit: number;
  };
}

export default function UpgradeModal({
  isOpen,
  onClose,
  prompt,
  onUpgrade,
  daysRemaining,
  usageStats
}: UpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      await onUpgrade();
    } finally {
      setIsLoading(false);
    }
  };

  const getUrgencyColors = () => {
    switch (prompt.urgency) {
      case 'high':
        return {
          bg: 'from-red-500/20 to-orange-500/20',
          border: 'border-red-400/30',
          accent: 'text-red-400',
          button: 'from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600'
        };
      case 'medium':
        return {
          bg: 'from-yellow-500/20 to-orange-500/20',
          border: 'border-yellow-400/30',
          accent: 'text-yellow-400',
          button: 'from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
        };
      default:
        return {
          bg: 'from-blue-500/20 to-purple-500/20',
          border: 'border-blue-400/30',
          accent: 'text-blue-400',
          button: 'from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
        };
    }
  };

  const colors = getUrgencyColors();

  const features = [
    'Unlimited AI Agent Access',
    'Unlimited Daily Scans',
    'Advanced Workflow Automation',
    'Priority Support',
    'Early Access to New Features',
    'Custom Agent Development'
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className={`relative w-full max-w-2xl mx-4 p-8 rounded-2xl bg-gradient-to-br ${colors.bg} backdrop-blur-lg border ${colors.border} shadow-2xl`}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="inline-flex p-4 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-500 mb-4"
              >
                {prompt.urgency === 'high' ? (
                  <Clock className="w-8 h-8 text-white" />
                ) : (
                  <Zap className="w-8 h-8 text-white" />
                )}
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-white mb-4"
              >
                {prompt.title}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-gray-300 max-w-md mx-auto leading-relaxed"
              >
                {prompt.message}
              </motion.p>
            </div>

            {/* Usage Stats */}
            {usageStats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-2 gap-4 mb-8"
              >
                <div className="bg-white/10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">
                    {usageStats.agentsUsedToday}/{usageStats.agentLimit}
                  </div>
                  <div className="text-sm text-gray-400">Agents Used Today</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">
                    {usageStats.scansUsedToday}/{usageStats.scanLimit}
                  </div>
                  <div className="text-sm text-gray-400">Scans Used Today</div>
                </div>
              </motion.div>
            )}

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-8"
            >
              <h3 className="text-xl font-semibold text-white mb-4 text-center">
                Unlock Pro Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Discount Badge */}
            {prompt.showDiscount && prompt.discountPercent && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center mb-6"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-white font-semibold">
                  <Star className="w-4 h-4" />
                  <span>Limited Time: {prompt.discountPercent}% OFF</span>
                  <Sparkles className="w-4 h-4" />
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpgrade}
                disabled={isLoading}
                className={`flex-1 px-8 py-4 rounded-xl font-bold text-white bg-gradient-to-r ${colors.button} shadow-lg transform transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{prompt.ctaText}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="sm:w-auto px-6 py-4 rounded-xl font-semibold text-gray-300 bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
              >
                Maybe Later
              </motion.button>
            </motion.div>

            {/* Trial Countdown */}
            {daysRemaining !== undefined && daysRemaining > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-center mt-6 text-sm text-gray-400"
              >
                {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining in your trial
              </motion.div>
            )}

            {/* Floating particles effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white/20 rounded-full"
                  animate={{
                    x: [0, 100, 0],
                    y: [0, -100, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.5,
                  }}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
} 