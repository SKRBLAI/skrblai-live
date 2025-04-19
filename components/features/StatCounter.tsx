/** Stat Counter Component - April 2025 */

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface StatCounterProps {
  end: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}

export default function StatCounter({ end, duration = 2000, suffix = '', prefix = '' }: StatCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      setCount(Math.floor(end * percentage));

      if (progress < duration) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration]);

  return (
    <motion.span
      className="stat-number"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {prefix}{count}{suffix}
    </motion.span>
  );
}
