'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { auth } from '@/utils/firebase';
import { useRouter, usePathname } from 'next/navigation';
import type { User } from 'firebase/auth';
import agentRegistry from '@/lib/agents/agentRegistry';

// New simplified navigation
const navLinks = [
  { href: '/agents', label: 'Meet the Agents' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const router = useRouter();
  const pathname = usePathname();
  const visibleAgents = agentRegistry.filter(a => a.visible);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);

    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe();
    };
  }, []);

  // Framer Motion variants for nav links
  const navVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.15 + i * 0.12, duration: 0.5 } })
  };

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#0D1117]/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center select-none">
            <motion.span
              whileHover={{ rotate: 6, scale: 1.08, textShadow: '0 0 18px #d0a8ff, 0 0 8px #14ffe9' }}
              whileTap={{ scale: 0.95, rotate: -6 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="text-teal-400 drop-shadow-glow font-extrabold text-3xl tracking-tight"
              style={{ textShadow: '0 0 10px #d0a8ff, 0 0 8px #14ffe9' }}
            >
              SKRBL <span className="text-white drop-shadow-glow">AI</span>
            </motion.span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link, i) => (
              <motion.div
                key={link.href}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={navVariants}
                whileHover={{ scale: 1.08, textShadow: '0 0 12px #14ffe9, 0 0 8px #a259ff' }}
                className="flex"
              >
                <Link
                  href={link.href}
                  className={`text-white font-medium px-2 py-1 rounded transition-all duration-300 hover:text-teal-400 hover:shadow-glow ${pathname === link.href ? 'border-b-2 border-teal-400 text-teal-300 shadow-glow' : ''}`}
                  style={{ textShadow: '0 0 8px #fff' }}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
            {/* Login Button */}
            <motion.div
              custom={navLinks.length}
              initial="hidden"
              animate="visible"
              variants={navVariants}
              whileHover={{ scale: 1.1 }}
              className="flex"
            >
              <Link
                href="/login"
                aria-label="Login to SKRBL AI"
                className="relative px-6 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-electric-blue to-teal-400 shadow-lg border-2 border-teal-400/80 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:ring-offset-2 transition-all overflow-hidden"
              >
                <span className="relative z-10">Login</span>
                {/* Animated border pulse */}
                <motion.span
                  className="absolute inset-0 rounded-lg border-2 border-electric-blue pointer-events-none"
                  animate={{
                    boxShadow: [
                      '0 0 0px #14ffe9, 0 0 0px #a259ff',
                      '0 0 12px #14ffe9, 0 0 8px #a259ff',
                      '0 0 0px #14ffe9, 0 0 0px #a259ff'
                    ]
                  }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  style={{ zIndex: 1 }}
                />
              </Link>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              <motion.div
                initial={false}
                animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                  />
                </svg>
              </motion.div>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <motion.div
        initial={false}
        animate={{
          height: isMobileMenuOpen ? 'auto' : 0,
          opacity: isMobileMenuOpen ? 1 : 0
        }}
        transition={{ duration: 0.2 }}
        className="md:hidden overflow-hidden bg-black/50 backdrop-blur-lg border-t border-white/10"
      >
        <div className="px-4 py-2 space-y-1">
          {navLinks.map((link, i) => (
            <motion.div
              key={link.href}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={navVariants}
              whileHover={{ scale: 1.08, textShadow: '0 0 12px #14ffe9, 0 0 8px #a259ff' }}
            >
              <Link
                href={link.href}
                className={`block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-teal-400 hover:bg-white/10 transition-colors duration-200 ${pathname === link.href ? 'border-l-4 border-teal-400 bg-white/5 text-teal-300 shadow-glow' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            </motion.div>
          ))}
          {/* Mobile Login Button */}
          <motion.div
            custom={navLinks.length}
            initial="hidden"
            animate="visible"
            variants={navVariants}
            whileHover={{ scale: 1.1 }}
          >
            <Link
              href="/login"
              aria-label="Login to SKRBL AI"
              className="relative block w-full text-center px-6 py-2 mt-2 rounded-lg font-semibold text-white bg-gradient-to-r from-electric-blue to-teal-400 shadow-lg border-2 border-teal-400/80 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:ring-offset-2 transition-all overflow-hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="relative z-10">Login</span>
              <motion.span
                className="absolute inset-0 rounded-lg border-2 border-electric-blue pointer-events-none"
                animate={{
                  boxShadow: [
                    '0 0 0px #14ffe9, 0 0 0px #a259ff',
                    '0 0 12px #14ffe9, 0 0 8px #a259ff',
                    '0 0 0px #14ffe9, 0 0 0px #a259ff'
                  ]
                }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                style={{ zIndex: 1 }}
              />
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </motion.nav>
  );
}
