'use client';

import { motion } from 'framer-motion';
import { Star, Crown, Zap, Trophy } from 'lucide-react';
import { getDisplayPlanOrNull, formatMoney } from '../../lib/pricing/catalog';
import CheckoutButton from '../payments/CheckoutButton';

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

  const bundles = [
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
  ];

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

        {/* Plans Grid */}
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
                className={`relative bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm border rounded-2xl p-6 ${
                  plan.popular ? 'border-cyan-400/50 shadow-[0_0_30px_rgba(34,211,238,0.2)]' : 'border-gray-600/30'
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold ${
                    plan.badge === 'POPULAR' ? 'bg-cyan-500 text-white' :
                    plan.badge === 'BEST VALUE' ? 'bg-green-500 text-white' :
                    'bg-orange-500 text-white'
                  }`}>
                    {plan.badge}
                  </div>
                )}

                {/* Plan Content */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.title}</h3>
                  
                  {displayPlan ? (
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-white">
                        {formatMoney(displayPlan.amountCents)}
                      </span>
                      <span className="text-gray-400 text-sm">/{displayPlan.intervalLabel}</span>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-gray-500">—</span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6 text-sm">
                  {plan.bullets.slice(0, 3).map((bullet, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-300">
                      <Star className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <span className="line-clamp-1">{bullet}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {displayPlan ? (
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
                )}
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
                className="relative bg-gradient-to-br from-slate-900/60 to-slate-800/60 backdrop-blur-sm border border-gray-600/20 rounded-2xl p-6"
              >
                <div className="text-center mb-6">
                  <h4 className="text-lg font-bold text-white mb-2">{bundle.title}</h4>
                  
                  {displayPlan ? (
                    <div className="mb-4">
                      <span className="text-2xl font-bold text-white">
                        {formatMoney(displayPlan.amountCents)}
                      </span>
                      <span className="text-gray-400 text-xs block">one-time</span>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <span className="text-2xl font-bold text-gray-500">—</span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6 text-sm">
                  {bundle.bullets.map((bullet, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-300">
                      <Trophy className="w-3 h-3 text-orange-400 flex-shrink-0" />
                      <span className="line-clamp-1">{bullet}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {displayPlan ? (
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
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}