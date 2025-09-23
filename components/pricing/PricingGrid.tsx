'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PricingItem } from '../../lib/pricing/catalogShared';
import PricingCard from './PricingCard';
import { cn } from '../../styles/ui';

interface PricingGridProps {
  items: PricingItem[];
  title?: string;
  subtitle?: string;
  onPurchase?: (item: PricingItem) => void;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
  showHeader?: boolean;
  promoLabel?: string;
  displayPrice?: number | string;
}

export default function PricingGrid({
  items,
  title = 'Choose Your Plan',
  subtitle = 'Select the perfect option for your athletic journey',
  onPurchase,
  className = '',
  columns = 4,
  showHeader = true,
  promoLabel,
  displayPrice
}: PricingGridProps) {
  const byPriceAsc = (a: PricingItem, b: PricingItem) => (a.priceUsd || 0) - (b.priceUsd || 0);
  const itemsSorted = [...items].sort(byPriceAsc);
  
  const getGridCols = () => {
    switch (columns) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4:
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
    }
  };

  if (!itemsSorted || itemsSorted.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🏃‍♂️</div>
        <h3 className="text-xl font-bold text-white mb-2">Coming Soon</h3>
        <p className="text-slate-400">
          We're preparing amazing training options for you!
        </p>
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className={cn('relative', className)}
    >
      {showHeader && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {title}
          </h2>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>
      )}

      <div className={cn('grid gap-6', getGridCols())}>
        {itemsSorted.map((item, index) => {
          // Create a CTA component for the item
          const cta = onPurchase ? (
            <button
              onClick={() => onPurchase(item)}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Get Started
            </button>
          ) : (
            <div className="w-full py-3 px-4 bg-gray-500 text-white font-bold rounded-lg text-center">
              Coming Soon
            </div>
          );

          return (
            <PricingCard
              key={item.sku}
              title={item.tier ? `${item.tier.charAt(0).toUpperCase() + item.tier.slice(1)} Plan` : 'Plan'}
              priceText={item.priceUsd ? `$${item.priceUsd}/${item.billingInterval === 'month' ? 'mo' : 'one-time'}` : 'Contact for pricing'}
              displayPrice={
                typeof displayPrice === "number"
                  ? `$${displayPrice.toFixed(2)}`
                  : displayPrice || (item.priceUsd ? `$${item.priceUsd}` : 'Contact')
              }
              originalPriceText={item.promoPrice ? `$${item.promoPrice}` : undefined}
              promoLabel={promoLabel}
              features={item.includes}
              badge={item.tier === 'starter' ? 'Most Popular' : item.tier === 'pro' ? 'Best Value' : undefined}
              cta={cta}
              animationDelay={index * 0.1}
            />
          );
        })}
      </div>

      {/* Additional Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="text-center mt-12 space-y-4"
      >
        <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            <span>30-day money-back guarantee</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
            <span>Cancel anytime (subscriptions)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
            <span>Instant access after purchase</span>
          </div>
        </div>
        
        <p className="text-xs text-slate-500 max-w-2xl mx-auto">
          All prices in USD. Subscriptions renew automatically. 
          Add-ons are one-time purchases with lifetime access. 
          Questions? Contact our support team anytime.
        </p>
      </motion.div>
    </motion.section>
  );
}