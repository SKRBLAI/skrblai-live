'use client';

import { motion } from 'framer-motion';
import { ReactNode, FormEvent } from 'react';
import { cn } from '@/lib/utils';

interface GlassmorphicFormProps {
  children: ReactNode;
  className?: string;
  title?: string;
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
  loading?: boolean;
}

export default function GlassmorphicForm({
  children,
  className = '',
  title,
  onSubmit,
  loading = false,
}: GlassmorphicFormProps) {
  return (
    <motion.form
      onSubmit={onSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(`
        bg-transparent
        backdrop-blur-xl
        border-2 border-teal-400/70
        rounded-2xl
        shadow-[0_8px_32px_rgba(0,212,255,0.18)]
        transition-all duration-300
        overflow-hidden
        relative
        ${className}
      `)}
    >
      {loading && (
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="w-8 h-8 border-4 border-teal-400/70 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {title && (
        <div className="border-b border-teal-400/30 px-6 py-4 bg-teal-500/10 backdrop-blur-md">
          <h3 className="text-lg font-medium text-white">{title}</h3>
        </div>
      )}
      
      <div className="p-6">
        {children}
      </div>
    </motion.form>
  );
} 