'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';


const navLinks = [
  { href: '/features', label: 'Features' },
  { href: '/book-publishing', label: 'Book Publishing' },
  { href: '/branding', label: 'Branding' },
  { href: '/content-automation', label: 'Content' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/contact', label: 'Contact' }
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-2xl font-bold bg-gradient-to-r from-electric-blue to-teal-400 bg-clip-text text-transparent">
                Percy
              </span>
              <span className="text-white">AI</span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-200 hover:text-electric-blue font-medium transition-all duration-200 hover:scale-105"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-gray-200 hover:text-electric-blue font-medium transition-all duration-200 hover:scale-105"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2.5 bg-gradient-to-r from-electric-blue to-teal-400 text-white font-semibold rounded-full
                hover:from-teal-400 hover:to-electric-blue transition-all duration-300 shadow-lg hover:shadow-electric-blue/20
                transform hover:scale-105"
              >
                Get Started
              </Link>
            </div>
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
          {navLinks.map((link, index) => (
            <motion.div
              key={link.href}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={link.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            </motion.div>
          ))}
          <motion.div 
            className="mt-4 pt-4 space-y-2 border-t border-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: navLinks.length * 0.1 }}
          >
            <Link
              href="/login"
              className="block w-full px-4 py-2 text-center text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="block w-full px-4 py-2 text-center bg-gradient-to-r from-electric-blue to-teal-400 text-white font-medium rounded-md hover:from-teal-400 hover:to-electric-blue transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Get Started
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </motion.nav>
  );
}
