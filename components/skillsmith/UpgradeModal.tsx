'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Crown, Zap, Target, Trophy, Gift, Users, Sparkles } from 'lucide-react';
import { useSkillSmithGuest } from '@/lib/skillsmith/guestTracker';
import CosmicButton from '@/components/shared/CosmicButton';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchase?: (plan: 'basic' | 'pro' | 'elite') => void;
  userType: 'guest' | 'auth';
}

export default function UpgradeModal({ 
  isOpen, 
  onClose, 
  onPurchase,
  userType 
}: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro' | 'elite'>('pro');
  const { markUpgradeOffered, usageStats } = useSkillSmithGuest();

  const handleClose = () => {
    markUpgradeOffered();
    onClose();
  };

  const handlePurchase = (plan: 'basic' | 'pro' | 'elite') => {
    setSelectedPlan(plan);
    onPurchase?.(plan);
    handleClose();
  };

  const plans = [
    {
      id: 'basic' as const,
      name: 'SkillSmith Basic',
      price: '$29',
      originalPrice: userType === 'auth' ? '$36' : null,
      period: '/month',
      description: 'Perfect for individual athletes',
      icon: Target,
      color: 'from-blue-500 to-cyan-500',
      features: [
        '50 video analyses per month',
        'Basic performance insights',
        '5 Quick Wins per analysis',
        'Form correction guidance',
        'Progress tracking',
        'Email support'
      ],
      popular: false
    },
    {
      id: 'pro' as const,
      name: 'SkillSmith Pro',
      price: '$59',
      originalPrice: userType === 'auth' ? '$74' : null,
      period: '/month',
      description: 'For serious athletes and coaches',
      icon: Crown,
      color: 'from-orange-500 to-red-500',
      features: [
        'Unlimited video analyses',
        'Advanced AI insights',
        '15 Quick Wins per analysis',
        'Personalized training plans',
        'Injury prevention analysis',
        'Progress comparisons',
        'Priority support',
        'Downloadable reports'
      ],
      popular: true
    },
    {
      id: 'elite' as const,
      name: 'SkillSmith Elite',
      price: '$99',
      originalPrice: userType === 'auth' ? '$124' : null,
      period: '/month',
      description: 'Professional-grade analysis',
      icon: Trophy,
      color: 'from-purple-500 to-pink-500',
      features: [
        'Everything in Pro',
        'Team management tools',
        'Custom analysis parameters',
        'Advanced biomechanics',
        '1-on-1 coach consultation',
        'API access',
        'White-label options',
        'Dedicated account manager'
      ],
      popular: false
    }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-gradient-to-b from-gray-900/95 via-gray-800/95 to-gray-900/95 border border-orange-500/30 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto backdrop-blur-xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="border-b border-orange-500/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Ready to Unlock Your Athletic Potential?
                </h2>
                <p className="text-gray-400">
                  You've used {usageStats.scansUsed} scans. Join {userType === 'auth' ? '12,000+' : '15,000+'} athletes who've transformed their performance.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {userType === 'auth' && (
              <div className="mt-4 p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-semibold">Premium Member Exclusive: 20% Off All Plans!</span>
                </div>
              </div>
            )}
          </div>

          {/* Plans */}
          <div className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const Icon = plan.icon;
                const isSelected = selectedPlan === plan.id;
                
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * plans.indexOf(plan) }}
                    className={`relative rounded-2xl border p-6 transition-all duration-300 ${
                      plan.popular 
                        ? 'border-orange-500/50 bg-gradient-to-b from-orange-500/10 to-red-500/10 scale-105' 
                        : 'border-gray-600 bg-gray-800/30 hover:border-gray-500'
                    } ${isSelected ? 'ring-2 ring-orange-400' : ''}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                          <Sparkles className="w-4 h-4" />
                          Most Popular
                        </div>
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${plan.color} mb-4`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                      <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
                      
                      <div className="flex items-center justify-center gap-2 mb-2">
                        {plan.originalPrice && (
                          <span className="text-gray-500 line-through text-lg">{plan.originalPrice}</span>
                        )}
                        <span className="text-3xl font-bold text-white">{plan.price}</span>
                        <span className="text-gray-400">{plan.period}</span>
                      </div>
                      
                      {plan.originalPrice && (
                        <div className="text-green-400 text-sm font-semibold">
                          Save ${parseInt(plan.originalPrice.slice(1)) - parseInt(plan.price.slice(1))}/month
                        </div>
                      )}
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Zap className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <CosmicButton
                      variant={plan.popular ? 'primary' : 'outline'}
                      size="lg"
                      onClick={() => handlePurchase(plan.id)}
                      className={
                        plan.popular 
                          ? `w-full bg-gradient-to-r ${plan.color} hover:opacity-90 text-white font-bold`
                          : `w-full border-gray-400 text-gray-300 hover:bg-gray-400 hover:text-black`
                      }
                    >
                      {plan.popular ? (
                        <>
                          <Crown className="w-5 h-5 mr-2" />
                          Start Free Trial
                        </>
                      ) : (
                        <>
                          <Star className="w-5 h-5 mr-2" />
                          Choose Plan
                        </>
                      )}
                    </CosmicButton>
                  </motion.div>
                );
              })}
            </div>

            {/* Trust & Guarantee */}
            <div className="mt-8 text-center">
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="flex items-center justify-center gap-2 text-green-400">
                  <Users className="w-5 h-5" />
                  <span className="text-sm">15,000+ Athletes</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-blue-400">
                  <Trophy className="w-5 h-5" />
                  <span className="text-sm">87% Performance Boost</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-purple-400">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm">30-Day Guarantee</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 mb-4">
                ✅ Cancel anytime • ✅ 30-day money-back guarantee • ✅ Used by professional teams
              </p>

              <div className="text-center">
                <CosmicButton
                  variant="outline"
                  onClick={handleClose}
                  className="border-gray-400 text-gray-400 hover:bg-gray-400 hover:text-black"
                >
                  Maybe Later
                </CosmicButton>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 