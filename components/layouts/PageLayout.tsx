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
    <div ref={containerRef} className="page-container min-h-screen">
      {/* Animated background */}
      <motion.div
        className="floating-particles"
        style={{ y: backgroundY }}
        aria-hidden="true"
      />

      <div className="page-content relative z-10">
        <div className="responsive-container py-20">
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
