'use client';

import { motion } from 'framer-motion';
import { Star, Crown, Zap, Trophy } from 'lucide-react';
import { getDisplayPlanOrNull, formatMoney } from '../../lib/pricing/catalog';
import CheckoutButton from '../payments/CheckoutButton';
import { FEATURE_FLAGS } from '@/lib/config/featureFlags';
import CosmicTile from '../ui/CosmicTile';

interface PlansAndBundlesProps {
  showLimitedOffer?: boolean;
}

export default function PlansAndBundles({ showLimitedOffer = false }: PlansAndBundlesProps) {
  
  const plans = [
    {
      key: 'SPORTS_STARTER',
      title: 'Rookie',
      badge: null,
      bullets: ['AI Video Analysis', 'Basic Training Plans', 'Performance Tracking'],
      popular: false
    },
    {
      key: 'SPORTS_PRO', 
      title: 'Pro',
      badge: 'POPULAR',
      bullets: ['Everything in Rookie', 'Advanced Analytics', 'Injury Prevention'],
      popular: true
    },
    {
      key: 'SPORTS_ELITE',
      title: 'All-Star',
      badge: 'BEST VALUE',
      bullets: ['Everything in Pro', 'Mental Coaching', 'Custom Training'],
      popular: false
    },
    {
      key: 'BUS_STARTER',
      title: 'Yearly',
      badge: 'SAVE 40%',
      bullets: ['All Pro Features', 'Annual Subscription', 'Priority Support'],
      popular: false
    }
  ];

  // legacy bundles gated off
  const bundles = FEATURE_FLAGS.ENABLE_BUNDLES ? [
    {
      key: 'BUNDLE_ALL_ACCESS',
      title: 'All-Access Bundle',
      period: 'one_time',
      bullets: ['Complete Training Suite', 'Lifetime Access', 'All Sports Covered']
    },
    {
      key: 'SPORTS_STARTER',
      title: 'Rookie Bundle', 
      period: 'one_time',
      bullets: ['Essential Tools', 'One-time Payment', 'Basic Analytics']
    },
    {
      key: 'SPORTS_PRO',
      title: 'Pro Bundle',
      period: 'one_time', 
      bullets: ['Advanced Features', 'Professional Tools', 'Enhanced Support']
    },
    {
      key: 'BUS_STARTER',
      title: 'Elite Bundle',
      period: 'annual',
      bullets: ['Premium Access', 'Annual Billing', 'Maximum Savings']
    }
  ] : [];

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative mb-24"
      data-plans-section
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Plans & Bundles
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-6">
            Choose a plan or bundle—keep everything simple and focused.
          </p>
          
          {showLimitedOffer && (
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-400/30 rounded-full px-4 py-2 text-orange-300 text-sm font-medium">
              <Zap className="w-4 h-4" />
              Limited time: next 50 customers
            </div>
          )}
        </motion.div>

        {/* Plans Grid using CosmicTile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {plans.map((plan, index) => {
            const displayPlan = getDisplayPlanOrNull(plan.key, 'monthly');
            
            return (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <CosmicTile
                  title={plan.title}
                  subtitle={displayPlan ? `${formatMoney(displayPlan.amountCents)}/${displayPlan.intervalLabel}` : '—'}
                  badge={plan.badge || undefined}
                  bullets={plan.bullets}
                  footer={
                    displayPlan ? (
                      <CheckoutButton 
                        label={`Choose ${plan.title}`}
                        sku={plan.key}
                        mode="subscription"
                        vertical="sports"
                        className="w-full"
                      />
                    ) : (
                      <button 
                        disabled
                        className="w-full bg-gray-600/50 text-gray-400 py-3 rounded-lg cursor-not-allowed"
                        title="Temporarily unavailable"
                      >
                        Temporarily Unavailable
                      </button>
                    )
                  }
                  disabled={!displayPlan}
                />
              </motion.div>
            );
          })}
        </div>

        {/* Bundles Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h3 className="text-2xl font-bold text-white mb-2">Bundles</h3>
          <p className="text-gray-400 text-sm">One-time purchases with lifetime value</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {bundles.map((bundle, index) => {
            const displayPlan = getDisplayPlanOrNull(bundle.key, bundle.period);
            
            return (
              <motion.div
                key={`${bundle.key}-${bundle.period}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <CosmicTile
                  title={bundle.title}
                  subtitle={displayPlan ? `${formatMoney(displayPlan.amountCents)} one-time` : '—'}
                  icon={<Trophy className="w-6 h-6 text-orange-400" />}
                  bullets={bundle.bullets}
                  footer={
                    displayPlan ? (
                      <CheckoutButton 
                        label="Get Bundle"
                        sku={bundle.key}
                        mode={bundle.period === 'one_time' ? 'payment' : 'subscription'}
                        vertical="sports"
                        className="w-full text-sm py-2"
                      />
                    ) : (
                      <button 
                        disabled
                        className="w-full bg-gray-600/50 text-gray-400 py-2 rounded-lg cursor-not-allowed text-sm"
                        title="Temporarily unavailable"
                      >
                        Unavailable
                      </button>
                    )
                  }
                  disabled={!displayPlan}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}