'use client';
import PercyAvatar from '@/components/home/PercyAvatar';
import FloatingParticles from '@/components/ui/FloatingParticles';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
      <FloatingParticles />
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="glass-card p-8 rounded-2xl flex flex-col items-center shadow-xl z-10"
        style={{
          background: 'rgba(22, 33, 62, 0.85)',
          backdropFilter: 'blur(12px)',
          border: '1.5px solid #00f2fe33',
        }}
      >
        <PercyAvatar size="lg" className="mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-white mt-2 mb-2 text-center">404: Not Found</h1>
        <p className="text-lg text-teal-200 mb-6 text-center">
          Sorry, the page you're looking for doesn't exist.<br />
          <span className="text-sky-300 font-semibold">SKRBL AI</span> couldn't find this route.
        </p>
        <a
          href="/"
          className="px-6 py-3 rounded-lg font-semibold bg-gradient-to-r from-sky-400 to-cyan-300 text-deep-navy shadow-lg hover:scale-105 transition"
        >
          Go Home
        </a>
      </motion.div>
    </div>
  );
}
