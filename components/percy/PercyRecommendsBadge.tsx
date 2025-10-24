/**
 * PercyRecommendsBadge Component
 *
 * Visual indicator showing Percy's recommendation with confidence level.
 * Can be used on Agent League cards, service cards, or anywhere recommendations are shown.
 *
 * @example
 * ```tsx
 * <PercyRecommendsBadge confidence={0.95} variant="badge" />
 * <PercyRecommendsBadge confidence={0.65} variant="subtle" reasoning="Based on your revenue goals" />
 * <PercyRecommendsBadge confidence={0.85} variant="prominent" showConfidence />
 * ```
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Zap } from 'lucide-react';

export interface PercyRecommendsBadgeProps {
  /** Confidence level (0-1) */
  confidence: number;
  /** Visual variant */
  variant?: 'badge' | 'subtle' | 'prominent' | 'inline';
  /** Optional reasoning text */
  reasoning?: string;
  /** Show confidence percentage */
  showConfidence?: boolean;
  /** Custom class name */
  className?: string;
  /** Pulse animation for high-confidence recommendations */
  pulse?: boolean;
}

export function PercyRecommendsBadge({
  confidence,
  variant = 'badge',
  reasoning,
  showConfidence = false,
  className = '',
  pulse = true,
}: PercyRecommendsBadgeProps) {
  // Determine confidence level styling
  const confidenceLevel = confidence > 0.8 ? 'high' : confidence > 0.5 ? 'medium' : 'low';

  const confidenceStyles = {
    high: {
      bg: 'bg-gradient-to-r from-emerald-500/20 to-green-500/20',
      border: 'border-emerald-500/50',
      text: 'text-emerald-400',
      icon: 'text-emerald-400',
      glow: 'shadow-emerald-500/20',
    },
    medium: {
      bg: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20',
      border: 'border-blue-500/50',
      text: 'text-blue-400',
      icon: 'text-blue-400',
      glow: 'shadow-blue-500/20',
    },
    low: {
      bg: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20',
      border: 'border-purple-500/50',
      text: 'text-purple-400',
      icon: 'text-purple-400',
      glow: 'shadow-purple-500/20',
    },
  };

  const style = confidenceStyles[confidenceLevel];

  const confidenceIcon =
    confidenceLevel === 'high' ? (
      <Zap className="w-3 h-3" />
    ) : confidenceLevel === 'medium' ? (
      <TrendingUp className="w-3 h-3" />
    ) : (
      <Sparkles className="w-3 h-3" />
    );

  if (variant === 'badge') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`
          inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
          ${style.bg} ${style.border} border backdrop-blur-sm
          ${pulse && confidenceLevel === 'high' ? 'animate-pulse' : ''}
          ${className}
        `}
      >
        <span className={style.icon}>{confidenceIcon}</span>
        <span className={`text-xs font-semibold ${style.text}`}>
          Percy Recommends
        </span>
        {showConfidence && (
          <span className={`text-xs ${style.text} opacity-80`}>
            {Math.round(confidence * 100)}%
          </span>
        )}
      </motion.div>
    );
  }

  if (variant === 'subtle') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className={`inline-flex items-center gap-1 ${className}`}
      >
        <span className={style.icon}>{confidenceIcon}</span>
        <span className={`text-xs ${style.text}`}>
          Recommended
          {reasoning && (
            <span className="text-xs text-gray-400 ml-1">• {reasoning}</span>
          )}
        </span>
      </motion.div>
    );
  }

  if (variant === 'prominent') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          flex flex-col gap-2 p-3 rounded-lg
          ${style.bg} ${style.border} border backdrop-blur-sm
          shadow-lg ${style.glow}
          ${pulse && confidenceLevel === 'high' ? 'animate-pulse' : ''}
          ${className}
        `}
      >
        <div className="flex items-center gap-2">
          <span className={style.icon}>{confidenceIcon}</span>
          <span className={`text-sm font-bold ${style.text}`}>
            🤖 Percy Recommends This
          </span>
          {showConfidence && (
            <span className={`text-sm ${style.text} opacity-80 ml-auto`}>
              {Math.round(confidence * 100)}% match
            </span>
          )}
        </div>
        {reasoning && (
          <p className="text-xs text-gray-300 leading-relaxed">
            {reasoning}
          </p>
        )}
      </motion.div>
    );
  }

  if (variant === 'inline') {
    return (
      <span className={`inline-flex items-center gap-1 ${className}`}>
        <span className={style.icon}>{confidenceIcon}</span>
        <span className={`text-xs font-medium ${style.text}`}>
          Recommended
        </span>
      </span>
    );
  }

  return null;
}

/**
 * Compact badge for use in tight spaces (e.g., card corners)
 */
export function PercyRecommendsCornerBadge({ confidence }: { confidence: number }) {
  const confidenceLevel = confidence > 0.8 ? 'high' : confidence > 0.5 ? 'medium' : 'low';

  const colors = {
    high: 'from-emerald-500 to-green-500',
    medium: 'from-blue-500 to-cyan-500',
    low: 'from-purple-500 to-pink-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        absolute top-2 right-2 z-10
        flex items-center justify-center
        w-8 h-8 rounded-full
        bg-gradient-to-br ${colors[confidenceLevel]}
        shadow-lg
        ${confidenceLevel === 'high' ? 'animate-pulse' : ''}
      `}
      title={`Percy Recommends (${Math.round(confidence * 100)}% confidence)`}
    >
      <Sparkles className="w-4 h-4 text-white" />
    </motion.div>
  );
}
