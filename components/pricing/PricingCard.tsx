'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Crown, Zap } from 'lucide-react';

interface PricingCardProps {
  title: string;
  label?: string; // Alternative to title
  priceText?: string;
  displayPrice?: string;
  originalPriceText?: string;
  promoLabel?: string;
  features: string[];
  perks?: string[]; // Alternative to features
  badge?: 'Most Popular' | 'Best Value' | string;
  includedVideoCount?: number;
  cta: ReactNode; // CTA button/link component
  className?: string;
  animationDelay?: number;
}

export default function PricingCard({
  title,
  label,
  priceText,
  displayPrice,
  originalPriceText,
  promoLabel,
  features,
  perks,
  badge,
  includedVideoCount,
  cta,
  className = '',
  animationDelay = 0
}: PricingCardProps) {
  const cardTitle = label || title;
  const cardFeatures = perks || features || [];

  const getBadgeIcon = () => {
    switch (badge) {
      case 'Most Popular':
        return <Star className="w-3 h-3" />;
      case 'Best Value':
        return <Crown className="w-3 h-3" />;
      default:
        return <Zap className="w-3 h-3" />;
    }
  };

  const getBadgeColor = () => {
    switch (badge) {
      case 'Most Popular':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'Best Value':
        return 'bg-gradient-to-r from-green-400 to-emerald-500 text-white';
      default:
        return 'bg-gradient-to-r from-purple-400 to-pink-500 text-white';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: animationDelay }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={`relative group ${className}`}
    >
      {/* Badge */}
      {badge && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: animationDelay + 0.3, type: 'spring', stiffness: 200 }}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-lg border border-white/20 ${getBadgeColor()}`}
          >
            {getBadgeIcon()}
            <span className="inline-flex max-w-[92px] overflow-hidden text-ellipsis whitespace-nowrap leading-none">
              {badge.toUpperCase()}
            </span>
          </motion.div>
        </div>
      )}

      <div className={`
        group relative rounded-2xl border border-white/10 bg-white/[0.02] p-6 shadow-lg shadow-black/20 backdrop-blur-md h-full flex flex-col relative overflow-hidden
        ${badge === 'Most Popular' && 'ring-2 ring-yellow-400/50 shadow-[0_0_30px_rgba(251,191,36,0.3)]'}
        ${badge === 'Best Value' && 'ring-2 ring-green-400/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]'}
      `}>
        {/* Header */}
        <div className="relative z-10 mb-4">
          <h3 className="text-xl font-bold text-white mb-2">{cardTitle}</h3>
          
          {/* Performance Analysis Badge */}
          {includedVideoCount && (
            <div className="mb-2">
              <span className="inline-block px-2 py-1 text-xs font-medium text-cyan-300 bg-cyan-400/10 rounded-full border border-cyan-400/30">
                Includes AI Performance Analysis
              </span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="relative z-10 mb-6">
          <div className="flex items-baseline gap-2 mb-2">
            {originalPriceText && (
              <span className="text-lg text-slate-500 line-through">
                {originalPriceText}
              </span>
            )}
            <span className="text-3xl font-bold text-white">
              {displayPrice || priceText}
            </span>
          </div>

          {/* Promo Label */}
          {promoLabel && (
            <div className="mb-2">
              <span className="inline-block px-2 py-1 text-xs font-bold text-amber-300 bg-amber-400/10 rounded-full border border-amber-400/30">
                {promoLabel}
              </span>
            </div>
          )}

          {/* Video Count Badge */}
          {includedVideoCount && (
            <p className="text-sm text-slate-400">
              {includedVideoCount} scans/month included
            </p>
          )}
        </div>

        {/* Features */}
        <div className="relative z-10 flex-1 mb-6">
          <ul className="space-y-2">
            {cardFeatures.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-slate-300">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Button */}
        <div className="relative z-10">
          {cta}
          
          {/* Trust indicators */}
          <div className="flex justify-center gap-4 mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              ⚡ Instant access
            </span>
            <span className="flex items-center gap-1">
              🔒 Secure payment
            </span>
            <span className="flex items-center gap-1">
              🔄 Cancel anytime
            </span>
          </div>

          {/* Footer note */}
          <p className="text-[11px] text-white/70 mt-2 text-center">
            Cancel anytime. 30-day refund.
          </p>
        </div>
      </div>
    </motion.div>
  );
}