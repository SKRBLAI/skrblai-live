'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BUSINESS_PLANS, BUSINESS_ADDONS, getPlanBadge, getPlanIcon } from '../../lib/business/pricingData';
import PricingCard from './PricingCard';
import { BuyButton } from './BuyButton';
import Link from 'next/link';

export default function BusinessPricingGrid() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Business Plans Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mb-16"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Business Automation Plans
          </h2>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto">
            Choose the perfect plan to automate your business and dominate your competition with AI agents
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {BUSINESS_PLANS.map((plan, index) => {
            const badge = getPlanBadge(plan);
            const icon = getPlanIcon(plan);

            const cta = plan.ctaKind === 'contact' ? (
              <Link 
                href="/contact"
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-center block"
              >
                Contact Sales {icon}
              </Link>
            ) : (
              <BuyButton
                sku={plan.sku}
                isSubscription={plan.isSubscription}
                vertical="business"
                successPath="/pricing?success=1"
                cancelPath="/pricing?canceled=1"
                disabledText="Stripe Not Enabled"
              >
                Get Started {icon}
              </BuyButton>
            );

            return (
              <PricingCard
                key={plan.label}
                title={plan.label}
                priceText={plan.priceText}
                displayPrice={plan.displayPrice}
                originalPriceText={plan.originalPriceText}
                promoLabel={plan.promoLabel}
                features={plan.perks}
                badge={badge}
                cta={cta}
                animationDelay={index * 0.1}
              />
            );
          })}
        </div>
      </motion.section>

      {/* Business Add-Ons Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mb-16"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Business Add-Ons
          </h2>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto">
            Enhance your business plan with specialized tools and capabilities
          </p>
        </div>

        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl">
            {BUSINESS_ADDONS.map((addon, index) => {
              const cta = (
                <BuyButton
                  sku={addon.sku}
                  isSubscription={addon.isSubscription}
                  vertical="business"
                  successPath="/pricing?success=1"
                  cancelPath="/pricing?canceled=1"
                  disabledText="Stripe Not Enabled"
                >
                  Add to Plan
                </BuyButton>
              );

              return (
                <PricingCard
                  key={addon.label}
                  title={addon.label}
                  priceText={addon.priceText}
                  originalPriceText={addon.originalPriceText}
                  features={[addon.description || '']}
                  cta={cta}
                  animationDelay={index * 0.1}
                />
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* Footer Note */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="text-center"
      >
        <p className="text-slate-400 text-lg">
          Cancel anytime. 30-day refund guarantee.
        </p>
        <div className="flex justify-center gap-8 mt-4 text-sm text-slate-500">
          <span className="flex items-center gap-1">
            ⚡ Instant access
          </span>
          <span className="flex items-center gap-1">
            🔒 Secure payment
          </span>
          <span className="flex items-center gap-1">
            🤖 AI-powered automation
          </span>
        </div>
      </motion.div>
    </div>
  );
}