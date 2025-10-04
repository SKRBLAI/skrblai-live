'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import PercyChat from './PercyChat';
import AnimatedBackground from './AnimatedBackground';
import PercyButton from './PercyButton';
import Image from 'next/image';
import { useOnboarding } from '../contexts/OnboardingContext';

export default function PercyHero() {
  const [showChat, setShowChat] = useState(false);
  const { currentStep, handleUserChoice } = useOnboarding();

  return (
    <div className="relative h-screen w-full overflow-hidden bg-transparent">
      <AnimatedBackground />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 flex items-center justify-center p-4"
      >
        <div className="glass-card max-w-2xl w-full p-8 rounded-2xl flex flex-col items-center">
          {/* Percy PNG with cosmic animation */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'drop-shadow(0 0 32px #38bdf8)' }}
            transition={{ duration: 1, delay: 0.1, type: 'spring', stiffness: 80 }}
            className="mb-4"
          >
            <Image
              src="/images/Percy&Parker-skrblai.webp"
              alt="Percy the AI Concierge"
              width={180}
              height={260}
              priority
              className="rounded-2xl shadow-glow animate-float"
              style={{ background: 'linear-gradient(135deg,#38bdf8 0%,#f472b6 100%)' }}
            />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold mb-4 text-center"
          >
            SKRBL AI: Unleash the Power of Automated Intelligence
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-xl text-gray-300 mb-8"
          >
            Your next-gen platform for creative automation, smart business workflows, and effortless productivity—powered by AI, crafted for visionaries.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="flex justify-center"
          >
            <PercyButton 
              onClick={() => handleUserChoice('start-onboarding')}
              label="Chat with Percy"
              className="animate-pulse-subtle shadow-glow"
            />
          </motion.div>
        </div>
        
        <AnimatePresence>
          {showChat && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowChat(false)}
              aria-label="Percy Chat Modal"
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
            >
              <motion.div
                className="relative bg-gradient-to-br from-electric-blue/70 via-fuchsia-500/40 to-teal-400/70 backdrop-blur-xl rounded-2xl shadow-2xl p-6 max-w-lg w-full flex flex-col items-center animate__animated animate__fadeInDown border-2 border-fuchsia-400"
                onClick={e => e.stopPropagation()}
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 120 }}
              >
                <button
                  className="absolute top-2 right-2 text-gray-200 hover:text-teal-400 text-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-fuchsia-400 rounded-full bg-black/10 px-2 py-1"
                  onClick={() => setShowChat(false)}
                  aria-label="Close Percy Chat"
                >
                  ×
                </button>
                <PercyChat onComplete={() => setShowChat(false)} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
