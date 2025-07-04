'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Target, TrendingUp, Zap, MessageCircle, X } from 'lucide-react';

interface AIEmpowermentCoachProps {
  triggerEvents?: string[];
  className?: string;
}

export default function AIEmpowermentCoach({ 
  triggerEvents = ['scroll', 'hover', 'click'], 
  className = '' 
}: AIEmpowermentCoachProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [userInteractions, setUserInteractions] = useState(0);
  const [showCoach, setShowCoach] = useState(false);

  const empowermentMessages = [
    {
      trigger: 'welcome',
      message: "🚀 You're now in control of an AI empire that your competitors can only dream of!",
      icon: <Brain className="w-5 h-5" />,
      mood: 'excited'
    },
    {
      trigger: 'interaction',
      message: "💪 Every click makes you more powerful! You're mastering AI dominance.",
      icon: <Target className="w-5 h-5" />,
      mood: 'confident'
    },
    {
      trigger: 'scroll',
      message: "🎯 You're exploring like a true AI commander! Knowledge equals power.",
      icon: <TrendingUp className="w-5 h-5" />,
      mood: 'analytical'
    },
    {
      trigger: 'engagement',
      message: "⚡ Your AI instincts are sharp! You're thinking 10 steps ahead of the competition.",
      icon: <Zap className="w-5 h-5" />,
      mood: 'energetic'
    },
    {
      trigger: 'mastery',
      message: "👑 You're becoming unstoppable! This level of AI mastery is exactly what wins markets.",
      icon: <Brain className="w-5 h-5" />,
      mood: 'triumphant'
    }
  ];

  const [currentMessageData, setCurrentMessageData] = useState(empowermentMessages[0]);

  // Track user interactions to provide contextual encouragement
  useEffect(() => {
    const handleUserInteraction = () => {
      setUserInteractions(prev => prev + 1);
      
      // Show encouraging message based on interaction count
      if (userInteractions === 3) {
        setCurrentMessageData(empowermentMessages[1]);
        setShowCoach(true);
      } else if (userInteractions === 8) {
        setCurrentMessageData(empowermentMessages[3]);
        setShowCoach(true);
      } else if (userInteractions === 15) {
        setCurrentMessageData(empowermentMessages[4]);
        setShowCoach(true);
      }
    };

    const handleScroll = () => {
      if (window.scrollY > 100 && userInteractions < 3) {
        setCurrentMessageData(empowermentMessages[2]);
        setShowCoach(true);
      }
    };

    // Add event listeners for empowerment triggers
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('scroll', handleScroll);
    
    // Welcome message after 3 seconds
    const welcomeTimer = setTimeout(() => {
      setCurrentMessageData(empowermentMessages[0]);
      setShowCoach(true);
    }, 3000);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('scroll', handleScroll);
      clearTimeout(welcomeTimer);
    };
  }, [userInteractions]);

  // Auto-hide coach after 8 seconds
  useEffect(() => {
    if (showCoach) {
      const hideTimer = setTimeout(() => {
        setShowCoach(false);
      }, 8000);
      return () => clearTimeout(hideTimer);
    }
  }, [showCoach]);

  const handleDismiss = () => {
    setShowCoach(false);
  };

  return (
    <AnimatePresence>
      {showCoach && (
        <motion.div
          initial={{ opacity: 0, x: 300, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 300, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={`fixed bottom-20 right-6 z-40 max-w-sm ${className}`}
        >
          <motion.div
            className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-[2px] rounded-xl"
            animate={{
              boxShadow: [
                '0 0 15px rgba(168, 85, 247, 0.4)',
                '0 0 25px rgba(168, 85, 247, 0.6)',
                '0 0 15px rgba(168, 85, 247, 0.4)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="bg-[#0d1117]/95 backdrop-blur-xl rounded-xl p-4 border border-purple-400/30">
              <div className="flex items-start gap-3">
                <motion.div
                  className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex-shrink-0"
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {currentMessageData.icon}
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-purple-400 font-bold text-sm">AI Empowerment Coach</h4>
                    <button
                      onClick={handleDismiss}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-white text-sm leading-relaxed"
                  >
                    {currentMessageData.message}
                  </motion.p>
                  
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 bg-purple-400 rounded-full"
                          animate={{ 
                            opacity: i < Math.min(5, Math.floor(userInteractions / 3) + 1) ? 1 : 0.3,
                            scale: i < Math.min(5, Math.floor(userInteractions / 3) + 1) ? 1 : 0.8
                          }}
                          transition={{ delay: i * 0.1 }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">
                      Power Level: {Math.min(100, userInteractions * 5)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}