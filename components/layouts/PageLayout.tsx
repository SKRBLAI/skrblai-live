'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, ReactNode } from 'react';
import '@/styles/shared/layout.css';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  showPercy?: boolean;
}

export default function PageLayout({ children, title, showPercy = true }: PageLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  return (
    <div ref={containerRef} className="page-container min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950">
      {/* Enhanced floating particles */}
      <div className="fixed inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-electric-blue/20"
            style={{
              width: Math.random() * 10 + 5,
              height: Math.random() * 10 + 5,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              x: [0, Math.random() * 100 - 50],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          />
        ))}
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-900/70 via-slate-900/40 to-slate-950/90" />
      
      <div className="page-content relative z-10">
        <div className="responsive-container py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {title && (
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="section-header">{title}</h1>
            </motion.div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
