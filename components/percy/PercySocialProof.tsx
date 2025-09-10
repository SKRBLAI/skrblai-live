'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, TrendingUp, Zap, Star } from 'lucide-react';

interface SocialProofMessage {
  id: string;
  message: string;
  type: 'success' | 'activity' | 'milestone';
  timestamp: Date;
  icon?: string;
}

interface PercySocialProofProps {
  messages: SocialProofMessage[];
  isVisible: boolean;
  position?: 'top-right' | 'bottom-left' | 'center';
  autoRotate?: boolean;
  rotationInterval?: number; // in seconds
  onMessageClick?: (message: SocialProofMessage) => void;
}

const PercySocialProof: React.FC<PercySocialProofProps> = ({
  messages,
  isVisible,
  position = 'top-right',
  autoRotate = true,
  rotationInterval = 30, // Optimized: 30s instead of 12s
  onMessageClick
}) => {
  const [currentMessage, setCurrentMessage] = useState<SocialProofMessage | null>(null);
  const [messageIndex, setMessageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Optimized: Use single interval manager
  const intervalManager = useMemo(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    
    const start = (callback: () => void, delay: number) => {
      stop();
      intervalId = setInterval(callback, delay * 1000);
    };
    
    const stop = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
    
    return { start, stop };
  }, []);

  // Rotate messages with optimized timing
  const rotateMessage = useCallback(() => {
    if (!autoRotate || messages.length === 0 || isPaused) return;
    
    const nextIndex = (messageIndex + 1) % messages.length;
    setMessageIndex(nextIndex);
    setCurrentMessage(messages[nextIndex]);
  }, [autoRotate, messages, messageIndex, isPaused]);

  // Setup rotation interval
  useEffect(() => {
    if (!autoRotate || messages.length === 0) return;
    
    // Set initial message
    if (!currentMessage && messages.length > 0) {
      setCurrentMessage(messages[0]);
    }
    
    intervalManager.start(rotateMessage, rotationInterval);
    
    return () => intervalManager.stop();
  }, [autoRotate, messages, rotationInterval, rotateMessage, currentMessage, intervalManager]);

  // Pause on tab visibility change (performance optimization)
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPaused(document.hidden);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Position styling
  const positionClasses = {
    'top-right': 'fixed top-20 right-4 z-50',
    'bottom-left': 'fixed bottom-4 left-4 z-50',
    'center': 'relative mx-auto'
  };

  // Get icon for message type
  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Star className="w-4 h-4 text-yellow-400" />;
      case 'activity':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'milestone':
        return <Zap className="w-4 h-4 text-cyan-400" />;
      default:
        return <Users className="w-4 h-4 text-blue-400" />;
    }
  };

  if (!isVisible || !currentMessage) return null;

  return (
    <div className={positionClasses[position]}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMessage.id}
          initial={{ opacity: 0, x: position.includes('right') ? 100 : -100, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: position.includes('right') ? 100 : -100, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="max-w-sm"
        >
          <motion.div
            className="bg-transparent backdrop-blur-xl border-2 border-cyan-400/30 rounded-lg p-4 shadow-lg cursor-pointer group"
            onClick={() => onMessageClick?.(currentMessage)}
            whileHover={{ 
              scale: 1.02,
              borderColor: 'rgba(48, 213, 200, 0.5)',
              boxShadow: '0 8px 32px rgba(48, 213, 200, 0.2)'
            }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start space-x-3">
              {/* Icon */}
              <div className="flex-shrink-0 mt-1">
                {getMessageIcon(currentMessage.type)}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white leading-relaxed">
                  {currentMessage.message}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-cyan-300/70">
                    {currentMessage.timestamp.toLocaleTimeString()}
                  </span>
                  
                  {/* Progress indicator */}
                  {autoRotate && (
                    <div className="flex space-x-1">
                      {messages.map((_, index) => (
                        <div
                          key={index}
                          className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                            index === messageIndex 
                              ? 'bg-cyan-400' 
                              : 'bg-cyan-400/30'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Hover glow effect */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </motion.div>
        </motion.div>
      </AnimatePresence>
      
      {/* Pause/Play controls (optional) */}
      {autoRotate && (
        <motion.button
          onClick={() => setIsPaused(!isPaused)}
          className="mt-2 w-full text-xs text-cyan-300/70 hover:text-cyan-300 transition-colors"
          whileHover={{ scale: 1.05 }}
        >
          {isPaused ? '▶ Resume' : '⏸ Pause'}
        </motion.button>
      )}
    </div>
  );
};

export default PercySocialProof;