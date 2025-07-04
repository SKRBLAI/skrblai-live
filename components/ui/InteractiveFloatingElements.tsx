'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Crown, Target, Brain, Rocket, TrendingUp, Shield } from 'lucide-react';

interface FloatingElement {
  id: string;
  x: number;
  y: number;
  icon: React.ReactNode;
  text: string;
  color: string;
  velocity: { x: number; y: number };
  interactive: boolean;
}

interface InteractiveFloatingElementsProps {
  count?: number;
  mouseFollow?: boolean;
  className?: string;
}

export default function InteractiveFloatingElements({ 
  count = 8, 
  mouseFollow = true, 
  className = '' 
}: InteractiveFloatingElementsProps) {
  const [elements, setElements] = useState<FloatingElement[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const empoweringElements = [
    { icon: <Crown className="w-4 h-4" />, text: "Dominate", color: "from-yellow-400 to-orange-500" },
    { icon: <Rocket className="w-4 h-4" />, text: "Launch", color: "from-cyan-400 to-blue-500" },
    { icon: <Brain className="w-4 h-4" />, text: "Outsmart", color: "from-purple-400 to-pink-500" },
    { icon: <Zap className="w-4 h-4" />, text: "Accelerate", color: "from-green-400 to-emerald-500" },
    { icon: <Target className="w-4 h-4" />, text: "Precision", color: "from-red-400 to-pink-500" },
    { icon: <TrendingUp className="w-4 h-4" />, text: "Scale", color: "from-indigo-400 to-purple-500" },
    { icon: <Shield className="w-4 h-4" />, text: "Protect", color: "from-blue-400 to-cyan-500" },
    { icon: <Sparkles className="w-4 h-4" />, text: "Transform", color: "from-teal-400 to-green-500" },
  ];

  // Initialize floating elements
  useEffect(() => {
    const initElements = () => {
      const newElements: FloatingElement[] = [];
      for (let i = 0; i < count; i++) {
        const elementData = empoweringElements[i % empoweringElements.length];
        newElements.push({
          id: `element-${i}`,
          x: Math.random() * (window.innerWidth - 100),
          y: Math.random() * (window.innerHeight - 100),
          icon: elementData.icon,
          text: elementData.text,
          color: elementData.color,
          velocity: {
            x: (Math.random() - 0.5) * 0.5,
            y: (Math.random() - 0.5) * 0.5,
          },
          interactive: true,
        });
      }
      setElements(newElements);
    };

    initElements();
  }, [count]);

  // Mouse tracking
  useEffect(() => {
    if (!mouseFollow) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseFollow]);

  // Animation loop
  useEffect(() => {
    const animateElements = () => {
      setElements(prevElements => 
        prevElements.map(element => {
          let { x, y, velocity } = element;

          // Mouse attraction effect
          if (mouseFollow && isInteracting) {
            const dx = mousePosition.x - x;
            const dy = mousePosition.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 200) {
              const force = (200 - distance) / 200;
              velocity.x += (dx / distance) * force * 0.02;
              velocity.y += (dy / distance) * force * 0.02;
            }
          }

          // Update position
          x += velocity.x;
          y += velocity.y;

          // Boundary bouncing
          if (x <= 0 || x >= window.innerWidth - 60) {
            velocity.x *= -0.8;
            x = Math.max(0, Math.min(window.innerWidth - 60, x));
          }
          if (y <= 0 || y >= window.innerHeight - 60) {
            velocity.y *= -0.8;
            y = Math.max(0, Math.min(window.innerHeight - 60, y));
          }

          // Damping
          velocity.x *= 0.99;
          velocity.y *= 0.99;

          return { ...element, x, y, velocity };
        })
      );
    };

    const interval = setInterval(animateElements, 16); // 60fps
    return () => clearInterval(interval);
  }, [mousePosition, mouseFollow, isInteracting]);

  const handleElementClick = (elementId: string) => {
    setElements(prevElements =>
      prevElements.map(element =>
        element.id === elementId
          ? {
              ...element,
              velocity: {
                x: (Math.random() - 0.5) * 3,
                y: (Math.random() - 0.5) * 3,
              },
            }
          : element
      )
    );
  };

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none z-30 ${className}`}
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
    >
      <AnimatePresence>
        {elements.map((element) => (
          <motion.div
            key={element.id}
            className="absolute pointer-events-auto cursor-pointer"
            style={{
              left: element.x,
              top: element.y,
            }}
            onClick={() => handleElementClick(element.id)}
            whileHover={{ scale: 1.2, rotate: 10 }}
            whileTap={{ scale: 0.9, rotate: -10 }}
          >
            <motion.div
              className={`p-3 rounded-full bg-gradient-to-r ${element.color} backdrop-blur-sm border border-white/20 shadow-lg`}
              animate={{
                boxShadow: [
                  '0 0 10px rgba(56, 189, 248, 0.3)',
                  '0 0 20px rgba(56, 189, 248, 0.6)',
                  '0 0 10px rgba(56, 189, 248, 0.3)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <div className="text-white flex items-center gap-2">
                {element.icon}
                <span className="text-xs font-bold whitespace-nowrap">
                  {element.text}
                </span>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Empowerment Message Overlay */}
      {isInteracting && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-40"
        >
          <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-xl border border-cyan-400/30 rounded-xl px-6 py-3">
            <p className="text-white font-bold text-center">
              🚀 You're in control! Click the elements to interact with your AI empire
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}