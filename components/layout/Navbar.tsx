'use client';
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import BrandLogo from '@/components/ui/BrandLogo';
import { Menu, X, Sparkles } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const onHome = pathname === '/';
  
  useEffect(() => {
    router.prefetch('/services');
    router.prefetch('/pricing');
    router.prefetch('/dashboard');
    router.prefetch('/agents');
  }, [router]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed top-0 left-0 right-0 z-50 pt-4 px-4"
    >
      <nav className="relative max-w-7xl mx-auto">
        {/* Cosmic Background with Enhanced Glassmorphism */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/40 via-gray-900/60 to-slate-900/40 backdrop-blur-xl border border-cyan-400/20 rounded-2xl shadow-2xl">
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/10 to-purple-500/5 rounded-2xl animate-pulse" />
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400/20 to-blue-600/20 rounded-2xl blur-sm" />
        </div>

        {/* Navigation Content */}
        <div className="relative px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <motion.div 
              className="flex items-center space-x-4"
              whileHover={{ scale: 1.02 }}
            >
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative p-2 bg-slate-800/50 rounded-xl border border-cyan-400/30">
                    <BrandLogo animate={onHome} />
                  </div>
                </div>
                <div className="hidden sm:block">
                  <div className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                    SKRBL AI
                  </div>
                  <div className="text-xs text-cyan-300/70 font-medium">
                    pronounced like <span className="italic">scribble</span>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-8">
              <NavLink href="/about">About</NavLink>
              <NavLink href="/agents">Agent League</NavLink>
              <NavLink href="/features">Features</NavLink>
              <NavLink href="/contact">Contact</NavLink>
              <NavLink href="/pricing">Pricing</NavLink>
              <NavLink href="/services">Services</NavLink>
            </div>

            {/* CTA Button & Mobile Menu */}
            <div className="flex items-center space-x-4">
              {/* Desktop CTA */}
              <motion.div 
                className="hidden md:block"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/sign-up">
                  <button className="relative px-6 py-3 font-bold text-white overflow-hidden rounded-xl group">
                    {/* Background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 group-hover:from-blue-600 group-hover:to-cyan-500 transition-all duration-300" />
                    {/* Glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity" />
                    {/* Button content */}
                    <div className="relative flex items-center space-x-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Get Started</span>
                    </div>
                  </button>
                </Link>
              </motion.div>

              {/* Mobile Menu Button */}
              <div className="lg:hidden">
                <MobileMenu />
              </div>
            </div>
          </div>
        </div>
      </nav>
    </motion.div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 10 }}
    >
      <Link
        href={href}
        className={`relative px-4 py-2 font-medium transition-all duration-300 group ${
          isActive 
            ? 'text-cyan-400 font-semibold' 
            : 'text-gray-300 hover:text-white'
        }`}
      >
        {/* Hover background */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Active indicator */}
        {isActive && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg border border-cyan-400/30"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        
        {/* Text with glow effect */}
        <span className={`relative z-10 ${isActive ? 'drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]' : ''}`}>
          {children}
        </span>
      </Link>
    </motion.div>
  );
}

function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const menuVariants = {
    closed: { opacity: 0, x: '100%' },
    open: { opacity: 1, x: 0 }
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        className="relative p-3 rounded-xl bg-slate-800/50 border border-cyan-400/30 text-cyan-400 hover:bg-slate-700/50 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Mobile Menu Panel */}
            <motion.div
              ref={menuRef}
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-80 max-w-[85vw] z-50"
            >
              {/* Panel Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-gray-900/95 to-slate-900/95 backdrop-blur-xl border-l border-cyan-400/20">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5" />
              </div>

              {/* Panel Content */}
              <div className="relative h-full flex flex-col p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
                    SKRBL AI
                  </div>
                  <motion.button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg bg-slate-800/50 border border-cyan-400/30 text-cyan-400 hover:bg-slate-700/50 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Navigation Links */}
                <nav className="flex flex-col space-y-4 mb-8">
                  {[
                    { href: '/about', label: 'About' },
                    { href: '/agents', label: 'Agent League' },
                    { href: '/features', label: 'Features' },
                    { href: '/contact', label: 'Contact' },
                    { href: '/pricing', label: 'Pricing' },
                    { href: '/services', label: 'Services' }
                  ].map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-3 text-lg font-medium text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/10 rounded-lg transition-all"
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                {/* Mobile CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-auto"
                >
                  <Link href="/sign-up" onClick={() => setIsOpen(false)}>
                    <button className="w-full relative px-6 py-4 font-bold text-white overflow-hidden rounded-xl group">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 group-hover:from-blue-600 group-hover:to-cyan-500 transition-all duration-300" />
                      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity" />
                      <div className="relative flex items-center justify-center space-x-2">
                        <Sparkles className="w-5 h-5" />
                        <span>Get Started</span>
                      </div>
                    </button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
