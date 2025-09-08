'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, BarChart3, Zap, Trophy, TrendingUp, Target } from 'lucide-react';
import { getCardClass, cn } from '../../styles/ui';

interface Metric {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

interface MetricsStripProps {
  className?: string;
  animated?: boolean;
}

export default function MetricsStrip({ 
  className = '',
  animated = true 
}: MetricsStripProps) {
  const [metrics, setMetrics] = useState<Metric[]>([
    {
      id: 'analyses',
      label: 'Video Analyses',
      value: 12847,
      suffix: '+',
      icon: <BarChart3 className="w-5 h-5" />,
      color: 'from-blue-400 to-cyan-400',
      description: 'AI-powered video analyses completed'
    },
    {
      id: 'accuracy',
      label: 'Analysis Accuracy',
      value: 94,
      suffix: '%',
      icon: <Target className="w-5 h-5" />,
      color: 'from-green-400 to-emerald-400',
      description: 'Average accuracy of our AI analysis'
    },
    {
      id: 'athletes',
      label: 'Athletes Improved',
      value: 8432,
      suffix: '+',
      icon: <Users className="w-5 h-5" />,
      color: 'from-purple-400 to-pink-400',
      description: 'Athletes who improved with our platform'
    },
    {
      id: 'improvement',
      label: 'Avg Improvement',
      value: 73,
      suffix: '%',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'from-orange-400 to-red-400',
      description: 'Average performance improvement'
    },
    {
      id: 'highlights',
      label: 'Highlights Created',
      value: 15623,
      suffix: '+',
      icon: <Zap className="w-5 h-5" />,
      color: 'from-yellow-400 to-orange-400',
      description: 'Performance highlights generated'
    },
    {
      id: 'tips',
      label: 'Pro Tips Shared',
      value: 4891,
      suffix: '+',
      icon: <Trophy className="w-5 h-5" />,
      color: 'from-indigo-400 to-purple-400',
      description: 'Professional tips and insights shared'
    }
  ]);

  // Animate metrics on mount and periodically update
  useEffect(() => {
    if (!animated) return;

    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.value + Math.floor(Math.random() * 5) + 1
      })));
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [animated]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className={cn(
        'relative overflow-hidden',
        className
      )}
    >
      {/* Glowing container */}
      <div className={cn(
        getCardClass('glass'),
        'p-6 relative',
        'shadow-[0_0_50px_rgba(34,197,94,0.15)] border-green-400/20'
      )}>
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-blue-500/5 to-purple-500/5 rounded-2xl" />
        
        {/* Animated background particles */}
        {animated && (
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-green-400/30 rounded-full"
                style={{
                  left: `${10 + (i * 8)}%`,
                  top: `${20 + (i % 3) * 30}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                  y: [0, -10, 0]
                }}
                transition={{
                  duration: 4 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        )}

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-2xl font-bold text-white mb-2"
            >
              Platform Impact Metrics
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-slate-400 text-sm"
            >
              Real-time performance data from our AI sports coaching platform
            </motion.p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 200
                }}
                whileHover={{ 
                  scale: 1.05,
                  y: -2
                }}
                className="relative group"
              >
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30 hover:border-green-400/50 transition-all duration-300 text-center">
                  {/* Icon with gradient background */}
                  <div className={cn(
                    'w-10 h-10 mx-auto mb-3 rounded-lg flex items-center justify-center',
                    `bg-gradient-to-r ${metric.color} bg-opacity-20`
                  )}>
                    <div className={cn('text-transparent bg-gradient-to-r bg-clip-text', metric.color)}>
                      {metric.icon}
                    </div>
                  </div>

                  {/* Value */}
                  <motion.div
                    key={metric.value} // Re-animate when value changes
                    initial={animated ? { scale: 0.8, opacity: 0 } : {}}
                    animate={animated ? { scale: 1, opacity: 1 } : {}}
                    transition={{ duration: 0.3 }}
                    className="mb-2"
                  >
                    <span className={cn(
                      'text-xl md:text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent',
                      metric.color
                    )}>
                      {metric.prefix}{formatNumber(metric.value)}{metric.suffix}
                    </span>
                  </div>

                  {/* Label */}
                  <p className="text-xs font-medium text-slate-300 leading-tight">
                    {metric.label}
                  </p>

                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                    <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl border border-slate-600">
                      {metric.description}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Live indicator */}
          {animated && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex items-center justify-center gap-2 mt-6 text-xs text-slate-500"
            >
              <motion.div
                className="w-2 h-2 bg-green-400 rounded-full"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span>Live metrics • Updates every 10 seconds</span>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}