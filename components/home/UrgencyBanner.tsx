'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Users, Zap, ArrowRight } from 'lucide-react';

interface UrgencyBannerProps {
  useAiAutomationHomepage?: boolean;
}

export default function UrgencyBanner({ useAiAutomationHomepage = true }: UrgencyBannerProps): React.ReactElement | null {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 47,
    seconds: 32
  });
  
  const [scansToday] = useState(147 + Math.floor(Math.random() * 23));
  const [spotsLeft] = useState(53 - Math.floor(Math.random() * 8));

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 23, minutes: 59, seconds: 59 }; // Reset daily
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleScanClick = () => {
    const el = document.getElementById('onboarding');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (!useAiAutomationHomepage) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-5xl mx-auto px-4 py-8"
    >
      <div className="relative bg-gradient-to-r from-red-900/40 via-orange-900/30 to-red-900/40 backdrop-blur-xl border-2 border-red-500/50 rounded-2xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.4)] overflow-hidden">
        
        {/* Animated background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 blur-xl"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-6">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center gap-2 bg-red-500/20 rounded-full px-4 py-2 mb-4"
            >
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              <span className="text-red-400 font-bold text-sm uppercase tracking-wide">
                Limited Time Today
              </span>
            </motion.div>
            
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
              FREE Business Scans End Tonight
            </h3>
            <p className="text-gray-300">
              We're limiting scans to ensure quality. Only <span className="text-orange-400 font-bold">{spotsLeft} spots left</span> today.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Countdown Timer */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Clock className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-semibold text-sm">Time Left</span>
              </div>
              <div className="bg-black/30 rounded-lg p-3 border border-red-500/30">
                <div className="text-white font-bold text-lg">
                  {String(timeLeft.hours).padStart(2, '0')}:
                  {String(timeLeft.minutes).padStart(2, '0')}:
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
              </div>
            </div>

            {/* Scans Today */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-blue-400 font-semibold text-sm">Scans Today</span>
              </div>
              <div className="bg-black/30 rounded-lg p-3 border border-blue-500/30">
                <div className="text-white font-bold text-lg">
                  {scansToday}
                </div>
              </div>
            </div>

            {/* Spots Left */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Zap className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-semibold text-sm">Spots Left</span>
              </div>
              <div className="bg-black/30 rounded-lg p-3 border border-green-500/30">
                <motion.div 
                  className="text-white font-bold text-lg"
                  animate={spotsLeft <= 10 ? { color: ['#ffffff', '#ef4444', '#ffffff'] } : {}}
                  transition={spotsLeft <= 10 ? { duration: 1, repeat: Infinity } : {}}
                >
                  {spotsLeft}
                </motion.div>
              </div>
            </div>
          </div>

          {/* Value Props */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-black/20 rounded-lg p-4 border border-gray-700/50">
              <h4 className="text-white font-semibold mb-2">What You Get (FREE):</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Complete business automation roadmap</li>
                <li>• Specific AI agent recommendations</li>
                <li>• ROI projections and timeline</li>
                <li>• Competitive advantage analysis</li>
              </ul>
            </div>
            
            <div className="bg-black/20 rounded-lg p-4 border border-gray-700/50">
              <h4 className="text-white font-semibold mb-2">Takes 2 Minutes:</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• No signup required to start</li>
                <li>• Instant results and recommendations</li>
                <li>• Custom action plan delivered</li>
                <li>• Optional: Save results to dashboard</li>
              </ul>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <motion.button
              onClick={handleScanClick}
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 0 60px rgba(34,197,94,0.7), 0 0 100px rgba(239,68,68,0.5)'
              }}
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: [
                  '0 0 40px rgba(34,197,94,0.5)',
                  '0 0 60px rgba(34,197,94,0.7), 0 0 80px rgba(239,68,68,0.3)',
                  '0 0 40px rgba(34,197,94,0.5)'
                ]
              }}
              transition={{ 
                boxShadow: { duration: 2, repeat: Infinity },
                hover: { duration: 0.2 }
              }}
              className="px-10 py-5 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white font-bold text-xl rounded-xl border border-green-400/30 transition-all duration-300"
            >
              <span className="flex items-center justify-center gap-3">
                <Zap className="w-6 h-6" />
                CLAIM MY FREE SCAN - SPOT #{spotsLeft}
                <ArrowRight className="w-6 h-6" />
              </span>
            </motion.button>
            
            <p className="text-gray-400 text-sm mt-3">
              ⚡ Instant analysis • No credit card required • Results in 30 seconds
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}