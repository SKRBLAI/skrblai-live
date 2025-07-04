'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Sparkles, Shield, Star } from 'lucide-react';

interface VIPStatusIndicatorProps {
  vipTier?: 'gold' | 'platinum' | 'diamond' | null;
  isVisible?: boolean;
  className?: string;
}

export default function VIPStatusIndicator({ 
  vipTier = null, 
  isVisible = false, 
  className = '' 
}: VIPStatusIndicatorProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (!vipTier || !isVisible) return null;

  const tierConfig = {
    gold: {
      icon: <Crown className="w-5 h-5" />,
      color: 'from-yellow-400 to-orange-500',
      borderColor: 'border-yellow-400/50',
      shadowColor: 'shadow-yellow-400/25',
      title: 'VIP Gold',
      benefits: ['Priority Support', 'Enhanced Features', 'Early Access']
    },
    platinum: {
      icon: <Shield className="w-5 h-5" />,
      color: 'from-gray-300 to-gray-500',
      borderColor: 'border-gray-300/50',
      shadowColor: 'shadow-gray-300/25',
      title: 'VIP Platinum',
      benefits: ['Premium Support', 'Advanced Analytics', 'Beta Access']
    },
    diamond: {
      icon: <Star className="w-5 h-5" />,
      color: 'from-cyan-400 to-blue-500',
      borderColor: 'border-cyan-400/50',
      shadowColor: 'shadow-cyan-400/25',
      title: 'VIP Diamond',
      benefits: ['White Glove Service', 'Unlimited Access', 'Personal Consultant']
    }
  };

  const config = tierConfig[vipTier];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={`fixed top-24 right-6 z-50 ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          className={`bg-gradient-to-r ${config.color} p-[2px] rounded-xl ${config.shadowColor} shadow-lg`}
          animate={{ 
            boxShadow: [
              '0 0 10px rgba(56, 189, 248, 0.3)',
              '0 0 20px rgba(56, 189, 248, 0.6)',
              '0 0 10px rgba(56, 189, 248, 0.3)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="bg-[#0d1117]/95 backdrop-blur-xl rounded-xl p-4 min-w-[200px]">
            <div className="flex items-center gap-3">
              <motion.div
                className={`p-2 rounded-lg bg-gradient-to-r ${config.color}`}
                animate={{ rotate: isHovered ? 15 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {config.icon}
              </motion.div>
              <div>
                <h3 className="text-white font-bold text-sm">{config.title}</h3>
                <p className="text-gray-400 text-xs">Active Status</p>
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </motion.div>
            </div>

            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-3 pt-3 border-t border-gray-700"
                >
                  <p className="text-xs text-gray-400 mb-2">VIP Benefits:</p>
                  <ul className="space-y-1">
                    {config.benefits.map((benefit, index) => (
                      <li key={index} className="text-xs text-gray-300 flex items-center gap-2">
                        <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}