'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface GlassmorphicModalProps {
  children: ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export default function GlassmorphicModal({
  children,
  className = '',
  isOpen,
  onClose,
  title,
}: GlassmorphicModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, type: 'spring', damping: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-6 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className={cn(`
                bg-transparent
                backdrop-blur-xl
                border-2 border-teal-400/70
                rounded-2xl
                shadow-[0_8px_32px_rgba(0,212,255,0.28)]
                max-w-md w-full
                max-h-[90vh]
                overflow-hidden
                ${className}
              `)}
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-teal-400/30 px-6 py-4 bg-teal-500/10 backdrop-blur-md">
                {title && <h3 className="text-lg font-medium text-white">{title}</h3>}
                <button 
                  onClick={onClose}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 