'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AgentOrbitCard from './AgentOrbitCard';
import AgentImage from '../shared/AgentImage';
import { useRouter } from 'next/navigation';
import { agentPath } from '../../utils/agentRouting';
import { ChevronLeft, ChevronRight, Rocket } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  superheroName?: string;
  catchphrase?: string;
}

interface AgentLeagueOrbitProps {
  agents: Agent[];
  className?: string;
}

export default function AgentLeagueOrbit({ agents, className = '' }: AgentLeagueOrbitProps) {
  const router = useRouter();
  const [currentPetal, setCurrentPetal] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-rotate petals every 5 seconds on desktop
  useEffect(() => {
    if (isMobile) return;
    
    const interval = setInterval(() => {
      setCurrentPetal((prev) => (prev + 1) % Math.ceil((agents.length - 1) / 4));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [agents.length, isMobile]);

  // Find Percy (center agent)
  const percyAgent = agents.find(agent => agent.id === 'percy');
  const otherAgents = agents.filter(agent => agent.id !== 'percy');

  // Group agents into petals of 4
  const petals = [];
  for (let i = 0; i < otherAgents.length; i += 4) {
    petals.push(otherAgents.slice(i, i + 4));
  }

  const handlePercyLaunch = () => {
    if (percyAgent) {
      router.push(agentPath(percyAgent.id, 'backstory'));
    }
  };

  const nextPetal = () => {
    setCurrentPetal((prev) => (prev + 1) % petals.length);
  };

  const prevPetal = () => {
    setCurrentPetal((prev) => (prev - 1 + petals.length) % petals.length);
  };

  if (agents.length === 0) return null;

  // Mobile fallback: 2x2 grid slider
  if (isMobile) {
    return (
      <div className={`relative w-full max-w-sm mx-auto ${className}`}>
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-white mb-2">Agent Orbit</h3>
          <p className="text-gray-400 text-sm">Swipe to explore agents</p>
        </div>

        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPetal}
              className="grid grid-cols-2 gap-4"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {petals[currentPetal]?.map((agent, index) => (
                <AgentOrbitCard
                  key={agent.id}
                  agent={agent}
                  index={index}
                  isVisible={true}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          {petals.length > 1 && (
            <>
              <button
                onClick={prevPetal}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextPetal}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Petal indicators */}
        {petals.length > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            {petals.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPetal(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentPetal ? 'bg-cyan-400' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Desktop: Rotating orbit with Percy in center
  return (
    <div className={`relative w-full max-w-2xl mx-auto ${className}`}>
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">Agent Orbit</h3>
        <p className="text-gray-400">Percy orchestrates your AI team</p>
      </div>

      <div className="relative w-80 h-80 mx-auto">
        {/* Percy in the center */}
        {percyAgent && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <motion.div
              className="relative w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400/20 to-purple-400/20 border-2 border-cyan-400/50 overflow-hidden group cursor-pointer"
              whileHover={{ scale: 1.1 }}
              onClick={handlePercyLaunch}
            >
              <AgentImage
                agentId={percyAgent.id}
                alt={percyAgent.superheroName || percyAgent.name}
                fill
                className="object-contain p-3 group-hover:scale-110 transition-transform duration-300"
              />
              
              {/* Percy glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-purple-400/10 rounded-full animate-pulse" />
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-full">
                <Rocket className="w-6 h-6 text-white" />
              </div>
            </motion.div>
            
            {/* Percy label */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
              <div className="text-cyan-400 font-semibold text-sm">
                {percyAgent.superheroName || percyAgent.name}
              </div>
              <div className="text-gray-400 text-xs">Cosmic Concierge</div>
            </div>
          </div>
        )}

        {/* Orbiting agents */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPetal}
            className="absolute inset-0"
            initial={{ opacity: 0, rotate: -10 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 10 }}
            transition={{ duration: 0.5 }}
          >
            {petals[currentPetal]?.map((agent, index) => {
              // Position agents in a circle around Percy
              const angle = (index * 90) - 45; // 4 positions: -45°, 45°, 135°, 225°
              const radius = 120;
              const x = Math.cos((angle * Math.PI) / 180) * radius;
              const y = Math.sin((angle * Math.PI) / 180) * radius;

              return (
                <div
                  key={agent.id}
                  className="absolute top-1/2 left-1/2"
                  style={{
                    transform: `translate(${x - 40}px, ${y - 40}px)`,
                  }}
                >
                  <AgentOrbitCard
                    agent={agent}
                    index={index}
                    isVisible={true}
                  />
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Orbit ring */}
        <div className="absolute inset-0 border border-white/10 rounded-full animate-spin-slow" 
             style={{ animation: 'spin 20s linear infinite' }} />
      </div>

      {/* Petal navigation */}
      {petals.length > 1 && (
        <div className="flex justify-center mt-8 space-x-4">
          <button
            onClick={prevPetal}
            className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-2">
            {petals.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPetal(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentPetal ? 'bg-cyan-400' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={nextPetal}
            className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}