import React from 'react';
import { motion } from 'framer-motion';

export interface PricingCardProps {
  title: string;
  price: string;
  features: string[];
  ctaText: string;
  ctaHref: string;
  highlight?: boolean;
  badge?: string;
  description?: string;
}

export default function PricingCard({
  title,
  price,
  features,
  ctaText,
  ctaHref,
  highlight = false,
  badge,
  description,
}: PricingCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: '0 0 32px #1E90FF80' }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className={`relative cosmic-glass cosmic-gradient rounded-2xl p-8 border-2 ${highlight ? 'border-[#1E90FF] shadow-[0_0_32px_#1E90FF80]' : 'border-[#30D5C8] shadow-[0_0_12px_#30D5C880]'} flex flex-col items-center text-center min-w-[260px] max-w-xs mx-auto`}
      tabIndex={0}
      aria-label={badge ? `${badge} Plan` : `${title} Plan`}
    >
      {badge && (
        <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold z-10 ${highlight ? 'bg-[#1E90FF] text-white shadow-[0_0_10px_#1E90FF80]' : 'bg-[#30D5C8] text-black shadow-[0_0_6px_#30D5C880]'}`}>
          {badge}
        </span>
      )}
      <h3 className="text-2xl font-extrabold mb-2 bg-gradient-to-r from-[#1E90FF] via-[#30D5C8] to-[#1E90FF] bg-clip-text text-transparent drop-shadow-[0_0_10px_#1E90FF]">
        {title}
      </h3>
      <div className="text-4xl font-bold mb-2 text-white">{price}</div>
      {description && <div className="mb-4 text-[#30D5C8] text-sm">{description}</div>}
      <ul className="mb-6 flex-1 space-y-2 text-left text-gray-300 w-full">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-base">
            <span className="text-[#1E90FF]">•</span> {f}
          </li>
        ))}
      </ul>
      <a
        href={ctaHref}
        className={`cosmic-btn-primary px-6 py-3 rounded-xl font-bold w-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#1E90FF] focus:ring-offset-2 ${highlight ? '' : 'opacity-90 hover:opacity-100'}`}
        tabIndex={0}
        aria-label={ctaText}
      >
        {ctaText}
      </a>
    </motion.div>
  );
}
