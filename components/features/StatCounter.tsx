/** Enhanced Stat Counter Component - Phase 1 3D/Interactive UX */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'framer-motion';

interface StatCounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  label: string;
  description?: string;
  isLive?: boolean;
  liveIncrement?: number;
  activityType?: 'signup' | 'agent_launch' | 'revenue' | 'engagement';
  className?: string;
}

// Live Social Proof Data Pool
const socialProofActivities = {
  signup: [
    "Sarah from Austin just automated her entire marketing workflow",
    "Tech startup in Seattle eliminated 73% of manual tasks", 
    "Marketing agency in Denver boosted client results by 340%",
    "Content creator in Miami published 47 articles this month",
    "Consultant in Phoenix secured 12 new clients this week"
  ],
  agent_launch: [
    "Business in Atlanta generated $18K in leads today",
    "Agency saved 32 hours with automated workflows", 
    "E-commerce store boosted sales by 267% this quarter",
    "Freelancer doubled their output in 30 days",
    "Marketing team automated their entire funnel"
  ],
  revenue: [
    "Client increased revenue by $47K this month",
    "Agency scaled from 5 to 50 clients using automation",
    "Business owner freed up 25 hours per week",
    "Startup reduced operational costs by 68%", 
    "Marketing ROI increased by 445% with AI agents"
  ],
  engagement: [
    "Platform engagement up 340% this month",
    "User satisfaction rating: 4.9/5 stars",
    "97% of users report significant time savings",
    "Average productivity increase: 387%",
    "Customer retention rate: 94% after 3 months"
  ]
};

const cities = ["Austin", "Seattle", "Denver", "Miami", "Boston", "Phoenix", "Atlanta", "Portland", "Chicago", "Dallas", "San Francisco", "New York"];

export default function StatCounter({
  end,
  duration = 2000,
  prefix = '',
  suffix = '',
  label,
  description = '',
  isLive = false,
  liveIncrement = 1,
  activityType = 'signup',
  className = ''
}: StatCounterProps) {
  const [count, setCount] = useState(0);
  const [liveCount, setLiveCount] = useState(end);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [socialProofMessage, setSocialProofMessage] = useState<string | null>(null);
  const [showSocialProof, setShowSocialProof] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  // Animate counter when in view
  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true);
      const startTime = Date.now();
      const startValue = 0;
      
      const animate = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(startValue + (liveCount - startValue) * easeOut);
        
        setCount(currentValue);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      animate();
    }
  }, [isInView, hasAnimated, liveCount, duration]);

  // Live updates for social proof
  useEffect(() => {
    if (!isLive || !hasAnimated) return;

    const liveUpdateInterval = setInterval(() => {
      const increment = Math.floor(Math.random() * liveIncrement) + 1;
      setLiveCount(prev => prev + increment);
      
      // Trigger social proof notification
      if (Math.random() < 0.3) { // 30% chance to show social proof
        const activities = socialProofActivities[activityType];
        let message = activities[Math.floor(Math.random() * activities.length)];
        
        // Add location context
        if (activityType === 'signup' || activityType === 'agent_launch') {
          const randomCity = cities[Math.floor(Math.random() * cities.length)];
          if (!message.includes(' in ')) {
            message = message.replace(/from \w+/, `from ${randomCity}`);
            if (!message.includes('from')) {
              message = `Business in ${randomCity} ${message.toLowerCase()}`;
            }
          }
        }
        
        setSocialProofMessage(message);
        setShowSocialProof(true);
        
        // Hide after 4 seconds
        setTimeout(() => {
          setShowSocialProof(false);
          setSocialProofMessage(null);
        }, 4000);
      }
    }, 15000 + Math.random() * 10000); // Random interval between 15-25 seconds

    return () => clearInterval(liveUpdateInterval);
  }, [isLive, hasAnimated, liveIncrement, activityType]);

  const getActivityIcon = () => {
    switch (activityType) {
      case 'signup': return '🚀';
      case 'agent_launch': return '⚡';
      case 'revenue': return '💰';
      case 'engagement': return '📈';
      default: return '✨';
    }
  };

  const getActivityColor = () => {
    switch (activityType) {
      case 'signup': return 'from-green-500/20 to-emerald-500/20 border-green-400/30';
      case 'agent_launch': return 'from-blue-500/20 to-cyan-500/20 border-cyan-400/30';
      case 'revenue': return 'from-yellow-500/20 to-orange-500/20 border-yellow-400/30';
      case 'engagement': return 'from-purple-500/20 to-pink-500/20 border-purple-400/30';
      default: return 'from-teal-500/20 to-blue-500/20 border-teal-400/30';
    }
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Main Counter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <motion.div
          className="text-4xl md:text-6xl font-bold text-white mb-2"
          animate={{
            scale: isLive && count !== liveCount ? [1, 1.05, 1] : 1,
            textShadow: isLive ? '0 0 20px rgba(45, 212, 191, 0.5)' : '0 0 10px rgba(45, 212, 191, 0.3)'
          }}
          transition={{ duration: 0.3 }}
        >
          {prefix}{count.toLocaleString()}{suffix}
          {isLive && (
            <motion.span
              className="ml-2 text-lg text-green-400"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ●
            </motion.span>
          )}
        </motion.div>
        
        <h3 className="text-xl md:text-2xl font-semibold text-teal-300 mb-2">
          {label}
        </h3>
        
        {description && (
          <p className="text-gray-400 text-sm">
            {description}
          </p>
        )}
        
        {isLive && (
          <div className="mt-2 text-xs text-green-400 font-semibold">
            LIVE • Updated {Math.floor(Math.random() * 5) + 1} seconds ago
          </div>
        )}
      </motion.div>

      {/* Live Social Proof Notification */}
      <AnimatePresence>
        {showSocialProof && socialProofMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`absolute -bottom-16 left-1/2 transform -translate-x-1/2 max-w-xs bg-gradient-to-r backdrop-blur-lg rounded-xl shadow-2xl border p-3 z-50 ${getActivityColor()}`}
          >
            <div className="flex items-start gap-2">
              <div className="text-lg flex-shrink-0">
                {getActivityIcon()}
              </div>
              <div className="flex-1">
                <p className="text-white text-xs font-medium leading-tight">
                  {socialProofMessage}
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Just now
                </p>
              </div>
              <motion.div
                className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
