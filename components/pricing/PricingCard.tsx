import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { PricingPlan, getBadgeText, getCTAText, getHref } from '../../lib/config/pricing';
import type { BillingPeriod } from '../../lib/pricing/types';
import { getDisplayPlan, formatMoney } from '../../lib/pricing/catalog';
import CosmicButton from '../shared/CosmicButton';
import { Check, Crown, Zap, Star, Rocket, ArrowRight } from 'lucide-react';
import CardShell from '../ui/CardShell';

interface PricingCardProps {
  plan: PricingPlan;
  billingPeriod: BillingPeriod;
  isHighlighted?: boolean;
  animationDelay?: number;
  className?: string;
}

export default function PricingCard({ 
  plan, 
  billingPeriod, 
  isHighlighted = false,
  animationDelay = 0,
  className = ''
}: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    if (plan.monthlyPrice === 0) {
      // Free plan - redirect to sign up
      window.location.href = '/sign-up?plan=free';
      return;
    }

    setIsLoading(true);
    
    try {
      // Get the current price based on billing period
      const periodKey = (billingPeriod === 'monthly' || billingPeriod === 'annual') ? billingPeriod : 'monthly';
      const priceId = plan.stripePriceIds?.[periodKey];
      
      if (!priceId || priceId.includes('price_') && priceId.includes('_monthly')) {
        // Stripe price IDs not configured - redirect to sign up for now
        console.log('Stripe price IDs not configured, redirecting to sign up');
        const planHref = plan.href[periodKey];
        window.location.href = planHref;
        return;
      }

      // For demo purposes, using placeholder user data
      // TODO: Replace with actual user data from auth context
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          userId: 'demo-user', // TODO: Replace with actual user ID from auth
          email: 'user@example.com', // TODO: Replace with actual user email
          successUrl: `${window.location.origin}/dashboard?success=true&plan=${plan.id}`,
          cancelUrl: window.location.href
        })
      });

      const { url, error } = await response.json();
      
      if (error) {
        throw new Error(error);
      }

      if (url) {
        window.location.href = url;
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(`Checkout failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  const displayPlan = getDisplayPlan(plan.id as any, billingPeriod);
  const formattedPrice = formatMoney(displayPlan.amountCents, 'USD');
  const compareAtCents = displayPlan.compareAtCents;
  const savingsAmount = compareAtCents ? compareAtCents - displayPlan.amountCents : 0;
  const badgeText = getBadgeText(plan, billingPeriod);
  const ctaText = getCTAText(plan, billingPeriod);
  const href = getHref(plan, billingPeriod);
  
  const showSavings = billingPeriod === 'annual' && savingsAmount > 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay }}
      className={`relative group ${className}`}
    >
      {/* Popular/Best Value Badge */}
      {(plan.isPopular || (plan.isBestValue && billingPeriod === 'annual')) && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: animationDelay + 0.2, type: 'spring' }}
            className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg border border-white/20 ${
              plan.isBestValue && billingPeriod === 'annual'
                ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white animate-pulse'
                : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white animate-pulse'
            }`}
          >
            🏆 {badgeText.toUpperCase()}
          </motion.div>
        </div>
      )}
      
      {/* Cosmic Glow Effect */}
      <div className={`absolute inset-0 rounded-3xl blur-2xl transition-all duration-500 ${
        plan.isPopular 
          ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30 opacity-100'
          : plan.isEnterprise 
          ? 'bg-gradient-to-r from-purple-500/30 to-pink-500/30 opacity-0 group-hover:opacity-100'
          : 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100'
      }`} />
      
      {/* Main Cosmic Card */}
      <CardShell className={`p-8 h-full flex flex-col transition-all duration-500 ${
        plan.isPopular 
          ? 'ring-1 ring-yellow-400/20 shadow-[0_0_60px_rgba(251,191,36,0.4)]'
          : plan.isEnterprise 
          ? 'ring-1 ring-purple-400/20 shadow-[0_0_40px_rgba(168,85,247,0.3)] hover:shadow-[0_0_80px_rgba(168,85,247,0.5)]'
          : 'ring-1 ring-teal-400/20 shadow-[0_0_30px_rgba(45,212,191,0.3)] hover:shadow-[0_0_60px_rgba(45,212,191,0.4)]'
      }`}>
        {/* Agent Count Indicator */}
        <div className="absolute top-2 right-2">
          <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-2 py-1 rounded-full border border-cyan-400/30">
            <span className="text-cyan-400 text-xs font-bold" aria-label={`${plan.agentCount} AI agents included`}>
              {plan.agentCount} Agents
            </span>
          </div>
        </div>

        {/* Plan Badge */}
        {plan.badges?.primary && (
          <div className="mb-3">
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs text-electric-blue bg-electric-blue/10 rounded-full border border-electric-blue/30">
              <span className="text-sm" role="img" aria-label={plan.title}>
                {plan.icon}
              </span>
              {plan.badges.primary}
            </span>
          </div>
        )}
        
        {/* Plan Title */}
        <h3 className="text-xl sm:text-2xl font-bold text-electric-blue mb-2">
          {plan.title}
        </h3>
        
        {/* Price Section */}
        <div className="mb-3">
          <motion.div
            key={`${plan.id}-${billingPeriod}-${formattedPrice}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
              {formattedPrice}
            </span>
            {!plan.isFree && (
              <span className="text-gray-400 ml-1 text-sm">
                {billingPeriod === 'annual' ? ' billed annually' : '/month'}
              </span>
            )}
          </motion.div>
          
          {/* Savings Indicator */}
          {showSavings && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2"
            >
              <span className="inline-block px-2 py-1 text-xs text-green-400 bg-green-400/10 rounded-full border border-green-400/30 font-bold">
                💰 Save ${savingsAmount} per year
              </span>
            </motion.div>
          )}
        </div>
        
        {/* Description */}
        <p className="text-sm text-gray-300 mb-4 font-medium leading-tight">
          {plan.description}
        </p>
        
        {/* Features List */}
        <ul className="space-y-1.5 mb-6 text-left" role="list">
          {plan.features.map((feature, idx) => (
            <li 
              key={`${feature.name}-${idx}`} 
              className="flex items-start text-gray-300 text-sm"
              title={feature.tooltip}
            >
              <span 
                className={`mr-2 text-base font-bold ${
                  feature.included ? 'text-green-400' : 'text-gray-500'
                }`}
                aria-hidden="true"
              >
                {feature.included ? '✓' : '✗'}
              </span>
              <span 
                className={`flex-1 leading-tight ${
                  feature.included ? 'text-gray-300' : 'text-gray-500'
                }`}
              >
                {feature.name}
              </span>
            </li>
          ))}
        </ul>
        
        {/* CTA Button */}
        <CosmicButton
          variant={plan.isEnterprise ? 'outline' : plan.isPopular ? 'primary' : 'secondary'}
          size="md"
          onClick={handlePurchase}
          disabled={isLoading}
          className={`w-full font-bold text-sm transition-all duration-200 ${
            isHighlighted || plan.isPopular ? 'animate-pulse' : ''
          } ${
            plan.isEnterprise ? 'hover:bg-purple-500/20 border-purple-400' : ''
          } ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label={`${ctaText} - ${plan.title} plan`}
        >
          {isLoading ? 'Processing...' : `${ctaText} ${plan.icon}`}
        </CosmicButton>
        
        {/* Additional Badges */}
        {plan.isPopular && !plan.isBestValue && (
          <div className="mt-2">
            <span className="inline-block px-2 py-1 text-xs text-yellow-400 bg-yellow-400/10 rounded-full border border-yellow-400/30">
              💰 Revenue Accelerator
            </span>
          </div>
        )}

        {plan.isEnterprise && (
          <div className="mt-2">
            <span className="inline-block px-2 py-1 text-xs text-purple-400 bg-purple-400/10 rounded-full border border-purple-400/30">
              👑 Enterprise Arsenal
            </span>
          </div>
        )}
        
        {/* Task Limit & Support Info */}
        <div className="mt-4 pt-4 border-t border-gray-700/50 text-xs text-gray-400 space-y-1">
          <div>Tasks: {plan.taskLimit}</div>
          <div>Support: {plan.support}</div>
        </div>
      </CardShell>
    </motion.div>
  );
}