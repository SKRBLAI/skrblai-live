'use client';

import { motion } from 'framer-motion';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { usePercyContext } from '@/contexts/PercyContext';

interface BrandingCardProps {
  title: string;
  description: string;
  icon: string;
  intent: string;
  index: number;
}

export default function BrandingCard({ title, description, icon, intent, index }: BrandingCardProps) {
  const router = useRouter();
  const { openPercy, setPercyIntent } = usePercyContext();

  const handleCardClick = useCallback(() => {
    setPercyIntent(intent);
    router.push(`/?intent=${intent}#percy`);
    openPercy();
  }, [intent, openPercy, setPercyIntent, router]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
      whileHover={{ 
        y: -12,
        rotateX: 4,
        rotateY: 4,
        scale: 1.02
      }}
      whileTap={{ 
        y: -4,
        rotateX: 2,
        rotateY: 2,
        scale: 0.98
      }}
      className="glass-card interactive p-6 rounded-2xl transform-gpu"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`${title} - Click to start branding process`}
    >
      <div className="h-12 w-12 rounded-xl bg-electric-blue/20 flex items-center justify-center mb-4">
        <span className="text-2xl" role="img" aria-label={title}>
          {icon}
        </span>
      </div>
      <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
      <p className="text-gray-400">{description}</p>
      
      {/* Interactive indicator */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-2 h-2 bg-blue-400 rounded-full"
        />
      </div>
    </motion.div>
  );
}
