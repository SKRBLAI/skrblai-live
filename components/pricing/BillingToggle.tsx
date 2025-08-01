import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      {/* Cosmic Glassmorphic Toggle */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-2xl blur-xl" />
        <div className="relative bg-[rgba(21,23,30,0.8)] backdrop-blur-2xl rounded-2xl p-2 border-2 border-teal-400/40 shadow-[0_0_40px_#30d5c866]">
          {/* Animated Background Slider */}
          <motion.div
            className="absolute top-2 bottom-2 w-1/2 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl shadow-[0_0_20px_#30d5c8aa]"
            animate={{
              x: currentPeriod === 'monthly' ? 0 : '100%'
            }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 30
            }}
          />
        
          {/* Monthly Option */}
          <motion.button
            onClick={() => onPeriodChange('monthly')}
            className={`relative z-10 px-8 py-3 rounded-xl font-bold transition-all duration-300 ${
              currentPeriod === 'monthly'
                ? 'text-white shadow-[0_0_15px_#30d5c8aa]'
                : 'text-gray-400 hover:text-white'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-pressed={currentPeriod === 'monthly' ? 'true' : 'false'}
            aria-label="Switch to monthly billing"
          >
            Monthly
          </motion.button>
          
          {/* Annual Option */}
          <motion.button
            onClick={() => onPeriodChange('annual')}
            className={`relative z-10 px-8 py-3 rounded-xl font-bold transition-all duration-300 flex items-center gap-2 ${
              currentPeriod === 'annual'
                ? 'text-white shadow-[0_0_15px_#30d5c8aa]'
                : 'text-gray-400 hover:text-white'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-pressed={currentPeriod === 'annual' ? 'true' : 'false'}
            aria-label={`Switch to annual billing and save ${savingsPercentage}%`}
          >
            Annual
          </motion.button>
        </div>
      </div>
      
      {/* Floating Savings Badge */}
      <AnimatePresence>
        {currentPeriod === 'annual' && (
          <motion.div
            initial={{ opacity: 0, scale: 0, x: -20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              x: 0,
              y: [0, -5, 0]
            }}
            exit={{ opacity: 0, scale: 0, x: -20 }}
            transition={{ 
              duration: 0.5,
              y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
            className="ml-6 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-lg" />
            <div className="relative bg-[rgba(21,23,30,0.9)] backdrop-blur-xl border-2 border-green-400/50 rounded-2xl px-4 py-2 shadow-[0_0_25px_#10b981aa]">
              <div className="flex items-center gap-2">
                <motion.div 
                  className="w-2 h-2 bg-green-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                <span className="text-green-400 text-sm font-bold">
                  Save {savingsPercentage}% Annually
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}