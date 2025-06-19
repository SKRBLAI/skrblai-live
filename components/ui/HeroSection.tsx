'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { Variants } from 'framer-motion';

const transitionProps = {
  duration: 0.5,
  ease: [0.43, 0.13, 0.23, 0.96] as const
};

const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { type: "tween", ...transitionProps }
  }
};

const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      type: "tween"
    }
  }
};

const hoverScale = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 }
};

import FloatingBackground from './FloatingBackground';
import AgentLeagueDashboard from '../agents/AgentLeagueDashboard';

const HeroSection = () => {
  const [leagueOpen, setLeagueOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  // Focus trap for accessibility
  useEffect(() => {
    if (!leagueOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLeagueOpen(false);
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    // Focus the close button on open
    setTimeout(() => {
      const btn = modalRef.current?.querySelector('button[aria-label="Close Agent League modal"]') as HTMLButtonElement;
      btn?.focus();
    }, 100);
    return () => window.removeEventListener('keydown', handleKey);
  }, [leagueOpen]);

  return (
    <section className="min-h-screen flex items-center justify-center text-white px-4 relative overflow-hidden py-20">
      <FloatingBackground />
      
      <motion.div 
        className="max-w-4xl text-center z-10"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={fadeInUp}>
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 font-poppins">
            Automate. Publish. Scale.{' '}
            <motion.span 
              className="inline-block text-electric-blue"
              animate={{ rotate: [0, 10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            >
              ⚡
            </motion.span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto font-inter">
            SKRBL AI helps you automate content, branding, and website building — all powered by AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <motion.div {...hoverScale}>
              <Link href="/sign-up" className="block">
                <button className="px-8 py-4 bg-gradient-to-r from-electric-blue to-teal hover:from-teal hover:to-electric-blue transition-all duration-300 rounded-lg text-lg font-semibold shadow-xl hover:shadow-2xl w-full sm:w-auto">
                  Try It Free
                </button>
              </Link>
            </motion.div>
            <motion.div {...hoverScale}>
              <Link href="/pricing" className="block">
                <button className="px-8 py-4 bg-transparent hover:bg-white/10 border-2 border-white/30 hover:border-white/50 transition-all duration-300 rounded-lg text-lg font-semibold w-full sm:w-auto">
                  View Pricing
                </button>
              </Link>
            </motion.div>
            {/* Meet the Agent League CTA */}
            <motion.div {...hoverScale}>
              <button
                className="px-8 py-4 bg-gradient-to-r from-electric-blue via-teal-400 to-fuchsia-500 hover:from-teal-400 hover:to-electric-blue shadow-glow transition-all duration-300 rounded-lg text-lg font-semibold w-full sm:w-auto relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-electric-blue focus:ring-offset-2 animate-pulse"
                style={{ boxShadow: '0 0 32px 4px #00cfff55, 0 0 8px 2px #0066ff88' }}
                onClick={() => setLeagueOpen(true)}
                aria-label="Meet the Agent League"
                tabIndex={0}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <motion.span
                    animate={{
                      textShadow: [
                        '0 0 8px #00cfff, 0 0 32px #00cfff',
                        '0 0 16px #00cfff, 0 0 32px #00cfff',
                        '0 0 8px #00cfff, 0 0 32px #00cfff'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: 'loop' }}
                    className="inline-block"
                  >
                    ✨
                  </motion.span>
                  Meet the Agent League
                  <motion.span
                    animate={{ x: [0, 8, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }}
                    aria-hidden
                  >🚀</motion.span>
                </span>
                <span className="absolute inset-0 bg-gradient-to-br from-electric-blue/40 via-fuchsia-500/20 to-teal-400/40 opacity-40 blur-xl animate-pulse" />
              </button>
            </motion.div>
          </div>
        </motion.div>
        
        <motion.div
          variants={fadeInUp}
          className="mt-16 relative max-w-3xl mx-auto"
        >
          <motion.div 
            className="relative w-full h-[400px] rounded-xl overflow-hidden shadow-2xl border border-white/10 glass-card"
            whileHover={{ 
              scale: 1.02,
              filter: 'drop-shadow(0 0 30px rgba(56, 189, 248, 0.2))'
            }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src="/images/ai-dashboard-preview.jpg"
              alt="SKRBL AI Dashboard"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-electric-blue/10 to-teal-500/10"
              animate={{
                opacity: [0, 0.5, 0],
                x: ['0%', '100%', '0%']
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
      {/* Modal Overlay for Agent League */}
      <AnimatePresence>
        {leagueOpen && (
          <motion.div
            className="fixed inset-0 z-[99] flex items-center justify-center bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-modal="true"
            role="dialog"
            aria-label="Agent League modal"
            ref={modalRef}
            tabIndex={-1}
            onClick={() => setLeagueOpen(false)}
          >
            <motion.div
              className="relative bg-white/10 backdrop-blur-lg border border-electric-blue/30 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl mx-2 p-0"
              initial={{ scale: 0.95, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 40, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={e => e.stopPropagation()}
              tabIndex={0}
            >
              <button
                onClick={() => setLeagueOpen(false)}
                className="absolute top-4 right-4 text-white text-2xl hover:text-electric-blue focus:outline-none focus:ring-2 focus:ring-electric-blue rounded-full z-20 bg-black/20 px-3 py-1"
                aria-label="Close Agent League modal"
              >
                ×
              </button>
              <div className="p-0 md:p-8">
                <AgentLeagueDashboard />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default HeroSection;