'use client';
import { motion } from 'framer-motion';

export default function SatisfactionBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg"
    >
      <span className="text-2xl font-bold bg-gradient-to-r from-electric-blue to-teal-400 bg-clip-text text-transparent">
        96%
      </span>
      <span className="text-sm text-gray-300">Satisfaction</span>
    </motion.div>
  );
}
