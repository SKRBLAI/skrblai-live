'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Crown, Zap, ShoppingCart } from 'lucide-react';
import { PricingItem, formatPrice, calculateSavings, getBadgeText, getCategoryColor } from '../../lib/sports/pricingData';
import { getCardClass, getButtonClass, cn } from '../../styles/ui';

interface PricingCardProps {
  item: PricingItem;
  onPurchase?: (item: PricingItem) => void;
  className?: string;
  animationDelay?: number;
}

export default function PricingCard({ 
  item, 
  onPurchase,
  className = '',
  animationDelay = 0
}: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const savings = calculateSavings(item);
  const badgeText = getBadgeText(item.badge);
  const categoryGradient = getCategoryColor(item.category);

  const handlePurchase = async () => {

    // Analytics stub
    console.log('event:pricing_cta_click', { 
      plan: item.id, 
      billingPeriod: 'monthly', 
      price: item.monthlyPrice 
    });

    if (item.monthlyPrice === 0) {
      // Free plan - redirect to sign up
      window.location.href = '/sign-up?plan=free';
      return;
    }

    // For now, redirect to checkout page with plan parameter
    const planId = item.id.toLowerCase().replace(/[^a-z0-9]/g, '');
    const checkoutUrl = `/checkout?plan=${planId}&period=monthly`;
    
    console.log('Redirecting to checkout:', checkoutUrl);
    window.location.href = checkoutUrl;

    // TODO: Implement full Stripe integration
    // setIsLoading(true);
    // 
    // try {
    //   const response = await fetch('/api/stripe/create-checkout-session', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       planId: plan.id,
    //       billingPeriod,
    //       successUrl: `${window.location.origin}/checkout/success`,
    //       cancelUrl: `${window.location.origin}/checkout/cancel`
    //     })
    //   });
    //
    //   const { url, error } = await response.json();
    //   
    //   if (error) {
    //     throw new Error(error);
    //   }
    //
    //   if (url) {
    //     window.location.href = url;
    //   }
    // } catch (error: any) {
    //   console.error('Checkout error:', error);
    //   toast.error(`Checkout failed: ${error.message}`);
    // } finally {
    //   setIsLoading(false);
    // }

    if (isLoading) return;
    
    setIsLoading(true);
    try {
      onPurchase?.(item);
    } finally {
      setIsLoading(false);
    }
  };

  const getBadgeIcon = () => {
    switch (item.badge) {
      case 'popular':
        return <Star className="w-3 h-3" />;
      case 'best-value':
        return <Crown className="w-3 h-3" />;
      case 'new':
        return <Zap className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getBadgeColor = () => {
    switch (item.badge) {
      case 'popular':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'best-value':
        return 'bg-gradient-to-r from-green-400 to-emerald-500 text-white';
      case 'new':
        return 'bg-gradient-to-r from-purple-400 to-pink-500 text-white';
      default:
        return 'bg-slate-600 text-slate-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: animationDelay }}
      whileHover={{ y: -4, scale: 1.02 }}
      className={cn('relative group', className)}
    >
      {/* Badge */}
      {item.badge && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: animationDelay + 0.3, type: 'spring', stiffness: 200 }}
            className={cn(
              'flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-lg border border-white/20',
              getBadgeColor()
            )}
          >
            {getBadgeIcon()}
            <span>{badgeText.toUpperCase()}</span>
          </motion.div>
        </div>
      )}

      <div className={cn(
        getCardClass('base'),
        'p-6 h-full flex flex-col relative overflow-hidden',
        item.badge === 'popular' && 'ring-2 ring-yellow-400/50 shadow-[0_0_30px_rgba(251,191,36,0.3)]',
        item.badge === 'best-value' && 'ring-2 ring-green-400/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]'
      )}>
        {/* Category Icon & Gradient */}
        <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
          <div className={cn('w-full h-full bg-gradient-to-br rounded-bl-full', categoryGradient)} />
        </div>

        {/* Header */}
        <div className="relative z-10 mb-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {item.icon && <span className="text-2xl">{item.icon}</span>}
              <div>
                <h3 className="text-xl font-bold text-white">{item.title}</h3>
                {item.subtitle && (
                  <p className="text-sm text-slate-400">{item.subtitle}</p>
                )}
              </div>
            </div>
            <div className={cn(
              'px-2 py-1 rounded-full text-xs font-medium border',
              `bg-gradient-to-r ${categoryGradient} bg-opacity-20 border-current text-white`
            )}>
              {item.category}
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Price */}
        <div className="relative z-10 mb-6">
          <div className="flex items-baseline gap-2">
            {item.originalPrice && (
              <span className="text-lg text-slate-500 line-through">
                {formatPrice(item.originalPrice)}
              </span>
            )}
            <span className="text-3xl font-bold text-white">
              {formatPrice(item.price)}
            </span>
            {item.period && item.period !== 'one-time' && (
              <span className="text-slate-400 text-sm">
                /{item.period === 'annual' ? 'year' : 'month'}
              </span>
            )}
          </div>
          
          {savings > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-2"
            >
              <span className="inline-block px-2 py-1 text-xs font-bold text-green-400 bg-green-400/10 rounded-full border border-green-400/30">
                💰 Save {formatPrice(savings)}
              </span>
            </motion.div>
          )}

          {item.period === 'annual' && (
            <p className="text-xs text-slate-400 mt-1">
              {formatPrice(Math.round(item.price / 12))}/month billed annually
            </p>
          )}
        </div>

        {/* Features */}
        <div className="relative z-10 flex-1 mb-6">
          <ul className="space-y-2">
            {item.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-slate-300">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Button */}
        <div className="relative z-10">
          <button
            onClick={handlePurchase}
            disabled={isLoading}
            className={cn(
              getButtonClass('primary'),
              'w-full flex items-center justify-center gap-2 text-base font-bold relative overflow-hidden',
              isLoading && 'opacity-50 cursor-not-allowed',
              item.badge === 'popular' && 'animate-pulse'
            )}
          >
            {/* Shimmer effect for popular items */}
            {item.badge === 'popular' && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{
                  x: [-100, 300],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              />
            )}
            
            <ShoppingCart className="w-4 h-4 relative z-10" />
            <span className="relative z-10">
              {isLoading ? 'Processing...' : 
               item.type === 'addon' ? 'Get Add-On' : 'Start Plan'}
            </span>
          </button>

          {/* Trust indicators */}
          <div className="flex justify-center gap-4 mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              ⚡ Instant access
            </span>
            <span className="flex items-center gap-1">
              🔒 Secure payment
            </span>
            {item.type === 'subscription' && (
              <span className="flex items-center gap-1">
                🔄 Cancel anytime
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}