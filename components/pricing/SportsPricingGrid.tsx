'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SPORTS_PLANS, SPORTS_ADDONS, getSportsDisplayConfig } from '../../lib/sports/pricingData';
import PricingCard from './PricingCard';
import { BuyButton } from './BuyButton';
import Link from 'next/link';

export default function SportsPricingGrid() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Sports Plans Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mb-16"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Sports Training Plans
          </h2>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto">
            Choose the perfect plan to elevate your athletic performance with AI-powered coaching and analysis
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {SPORTS_PLANS.map((plan, index) => {
            const badge = 
              plan.tier === 'pro' ? 'Most Popular' : 
              plan.tier === 'elite' ? 'Best Value' : 
              undefined;

            const cta = plan.tier === 'contact' ? (
              <Link 
                href="/contact"
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-center block"
              >
                Contact Us
              </Link>
            ) : plan.tier === 'curiosity' ? (
              <Link 
                href="/#percy"
                className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-center block"
              >
                Start Free
              </Link>
            ) : (
              <BuyButton
                sku={plan.sku}
                isSubscription={plan.type === 'plan' && plan.billingInterval === 'month'}
                vertical="sports"
                successPath="/sports?success=1"
                cancelPath="/sports?canceled=1"
              >
                Get Started
              </BuyButton>
            );

            const displayConfig = getSportsDisplayConfig(plan.tier || '');
            
            return (
              <PricingCard
                key={plan.sku}
                title={displayConfig?.label || (plan.tier ? `${plan.tier.charAt(0).toUpperCase() + plan.tier.slice(1)} Plan` : 'Plan')}
                priceText={plan.priceUsd ? `$${plan.priceUsd}/month` : 'Contact for pricing'}
                displayPrice={plan.priceUsd ? `$${plan.priceUsd}` : 'Contact'}
                originalPriceText={plan.promoPrice ? `$${plan.promoPrice}` : undefined}
                promoLabel={plan.isPromoActive ? 'Limited Time' : undefined}
                features={plan.includes}
                badge={badge}
                includedVideoCount={plan.scansOrUploads}
                cta={cta}
                animationDelay={index * 0.1}
              />
            );
          })}
        </div>
      </motion.section>

      {/* Sports Add-Ons Section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mb-16"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Sports Add-Ons
          </h2>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto">
            Enhance your training with optional add-ons available for one-time purchase
          </p>
        </div>

        <div className="flex justify-center">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl">
            {SPORTS_ADDONS.map((addon, index) => {
              const cta = (
                <BuyButton
                  sku={addon.sku}
                  isSubscription={false}
                  vertical="sports"
                  successPath="/sports?success=1"
                  cancelPath="/sports?canceled=1"
                >
                  Buy Now
                </BuyButton>
              );

              return (
                <PricingCard
                  key={addon.sku}
                  title={addon.description || addon.sku.replace('sports_addon_', '').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  priceText={addon.priceUsd ? `$${addon.priceUsd}` : 'Contact for pricing'}
                  originalPriceText={addon.originalPrice ? `$${addon.originalPrice}` : undefined}
                  features={addon.includes}
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
            📱 Works on all devices
          </span>
        </div>
      </motion.div>
    </div>
  );
}