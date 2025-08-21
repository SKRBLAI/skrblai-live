'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap, Rocket, Crown } from 'lucide-react';
import CardShell from '../ui/CardShell';
import CosmicButton from '../shared/CosmicButton';
import CheckoutButton from '../payments/CheckoutButton';
import { useAuth } from '../../components/context/AuthContext';
import { getSupabase } from '../../lib/analytics/userFunnelTracking';
import toast from 'react-hot-toast';

interface Plan {
  id: string;
  title: string;
  price: {
    monthly: number;
    yearly: number;
  };
  description: string;
  features: Array<{
    name: string;
    tooltip?: string;
  }>;
  ctaText: string;
  icon?: string;
  isPopular?: boolean;
  isBestValue?: boolean;
  isEnterprise?: boolean;
  taskLimit: string;
  support: string;
  priceId?: string;
}

interface PricingCardProps {
  plan: Plan;
  isYearly: boolean;
  onPlanSelect?: (planId: string) => void;
}

export default function PricingCard({ plan, isYearly, onPlanSelect }: PricingCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const supabase = getSupabase();
  
  const savingsAmount = (plan.price.monthly * 12 - plan.price.yearly).toFixed(2);
  const showSavings = isYearly && plan.price.yearly > 0;
  
  // Determine CTA text based on plan and user status
  const ctaText = plan.isEnterprise ? 'Contact Sales' : plan.ctaText;
  
  // Handle enterprise plan click
  const handleEnterpriseClick = () => {
    window.location.href = '/contact';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="relative"
    >
      <CardShell className={`h-full flex flex-col ${plan.isPopular ? 'ring-2 ring-purple-500/50' : ''}`}>
        {/* Popular Badge */}
        {plan.isPopular && (
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-4 py-2 rounded-full text-sm font-bold shadow-lg border border-purple-400/30 bg-gradient-to-r from-purple-600/30 to-pink-600/30 backdrop-blur-lg text-white"
            >
              🏆 POPULAR
            </motion.div>
          </div>
        )}

        <div className="p-6 flex flex-col h-full">
          {/* Plan Title and Price */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {plan.title}
                {plan.isBestValue && <Star className="w-5 h-5 text-yellow-400" />}
              </h3>
              {plan.isBestValue && (
                <span className="px-2 py-1 text-xs bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold rounded-full">
                  BEST VALUE
                </span>
              )}
            </div>
            
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-white mb-1">
                ${isYearly ? plan.price.yearly : plan.price.monthly}
              </div>
              <div className="text-gray-400 text-sm">
                per {isYearly ? 'year' : 'month'}
                {showSavings && (
                  <span className="block text-green-400 font-bold">
                    Save ${savingsAmount}/year
                  </span>
                )}
              </div>
            </div>
            
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
                    plan.isBestValue 
                      ? 'text-yellow-400' 
                      : plan.isEnterprise 
                        ? 'text-purple-400' 
                        : 'text-green-400'
                  }`}
                >
                  ✓
                </span>
                <span className="text-white">{feature.name}</span>
              </li>
            ))}
          </ul>
          
          {/* CTA Button */}
          <div className="mt-auto">
            {plan.isEnterprise ? (
              <CosmicButton
                variant="outline"
                size="lg"
                onClick={handleEnterpriseClick}
                disabled={isLoading}
                className="w-full border-purple-500 text-purple-400 hover:bg-purple-500/10 font-bold py-3"
                aria-label={`${ctaText} - ${plan.title} plan`}
              >
                {isLoading ? 'Processing...' : `${ctaText} ${plan.icon || '👑'}`}
              </CosmicButton>
            ) : (
              <CheckoutButton
                label={ctaText}
                priceId={plan.priceId}
                mode="subscription"
                className="w-full bg-gradient-to-r from-electric-blue to-purple-600 hover:from-electric-blue/80 hover:to-purple-700/80 font-bold py-3"
                metadata={{ source: 'pricing_card', plan: plan.id }}
              />
            )}
          </div>
          
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
        </div>
      </CardShell>
    </motion.div>
  );
}
