import React from 'react';
import { motion } from 'framer-motion';
import { BillingPeriod, getSavingsPercentage } from '../../lib/config/pricing';

interface BillingToggleProps {
  currentPeriod: BillingPeriod;
  onPeriodChange: (period: BillingPeriod) => void;
  className?: string;
}

export default function BillingToggle({ 
  currentPeriod, 
  onPeriodChange, 
  className = '' 
}: BillingToggleProps) {
  const savingsPercentage = getSavingsPercentage();

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative bg-gray-800/50 backdrop-blur-xl rounded-full p-1 border border-gray-600/50">
        {/* Background slider */}
        <motion.div
          className="absolute top-1 bottom-1 w-1/2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full shadow-lg"
          animate={{
            x: currentPeriod === 'monthly' ? 0 : '100%'
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 25
          }}
        />
        
        {/* Monthly option */}
        <button
          onClick={() => onPeriodChange('monthly')}
          className={`relative z-10 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
            currentPeriod === 'monthly'
              ? 'text-white'
              : 'text-gray-400 hover:text-gray-200'
          }`}
          aria-pressed={currentPeriod === 'monthly'}
          aria-label="Switch to monthly billing"
        >
          Monthly
        </button>
        
        {/* Annual option */}
        <button
          onClick={() => onPeriodChange('annual')}
          className={`relative z-10 px-6 py-3 rounded-full font-medium transition-all duration-200 flex items-center gap-2 ${
            currentPeriod === 'annual'
              ? 'text-white'
              : 'text-gray-400 hover:text-gray-200'
          }`}
          aria-pressed={currentPeriod === 'annual'}
          aria-label={`Switch to annual billing and save ${savingsPercentage}%`}
        >
          Annual
          {currentPeriod === 'annual' && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold"
            >
              Save {savingsPercentage}%
            </motion.span>
          )}
        </button>
      </div>
      
      {/* Savings indicator for annual */}
      {currentPeriod === 'annual' && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="ml-4 flex items-center gap-2"
        >
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-400 text-sm font-medium">
            {savingsPercentage}% annual savings active
          </span>
        </motion.div>
      )}
    </div>
  );
}