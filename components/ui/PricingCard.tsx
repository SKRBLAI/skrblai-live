'use client';

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
    <motion.a
      href={["See Plans", "Compare Plans"].includes(ctaText) ? "/pricing" : "/sign-up"}
      whileHover={{ y: -12, boxShadow: highlight ? '0 0 64px 8px #1E90FFCC' : '0 0 48px 4px #30D5C8CC', scale: 1.04 }}
      whileFocus={{ boxShadow: highlight ? '0 0 80px 12px #1E90FFEE' : '0 0 64px 8px #30D5C8EE', scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      className={`group relative bg-white/5 backdrop-blur-xl bg-clip-padding cosmic-gradient border-2 ${highlight ? 'border-[#1E90FF] shadow-[0_0_64px_8px_#1E90FF80]' : 'border-[#30D5C8] shadow-[0_0_32px_4px_#30D5C880]'} rounded-2xl p-8 flex flex-col items-center text-center min-w-[260px] max-w-xs mx-auto cursor-pointer focus:outline-none focus:ring-4 focus:ring-[#1E90FF]/40 transition-all duration-300`}
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
      <span
        className={`cosmic-btn-primary px-6 py-3 rounded-xl font-bold w-full mt-4 transition-all duration-200 group-hover:scale-105 group-focus:scale-105 ${highlight ? '' : 'opacity-90 group-hover:opacity-100'}`}
        tabIndex={-1}
        aria-hidden="true"
      >
        {ctaText}
      </span>
    </motion.a>
  );
}
