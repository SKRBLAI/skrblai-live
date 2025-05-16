'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
import PercyChat from './PercyChat';
import AnimatedBackground from './AnimatedBackground';
import PercyButton from './PercyButton';

export default function PercyHero() {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-transparent">
      <AnimatedBackground />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 flex items-center justify-center p-4"
      >
        <div className="glass-card max-w-2xl w-full p-8 rounded-2xl">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold mb-4"
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
          >
            <PercyButton 
              onClick={() => setShowChat(true)}
              label="Let's Get Started"
            />
          </motion.div>
        </div>
        
        {showChat && <PercyChat onComplete={() => {}} />}
      </motion.div>
    </div>
  );
}
