'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { auth } from '@/utils/firebase';
import { useRouter } from 'next/navigation';
import type { User } from 'firebase/auth';
import agentRegistry from '@/lib/agents/agentRegistry';
import { usePathname } from 'next/navigation';

// New simplified navigation
const navLinks = [
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services', dropdown: true },
  { href: '/ask-percy', label: 'Ask Percy' }
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
              whileHover={{ rotate: 6, scale: 1.08 }}
              whileTap={{ scale: 0.95, rotate: -6 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <span className="text-2xl font-bold">
                <span className="bg-gradient-to-r from-electric-blue to-teal-400 bg-clip-text text-transparent drop-shadow-glow">SKRBL</span>
                <span className="text-white drop-shadow-glow">AI</span>
              </span>
            </motion.div>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-8">
            {/* Render new nav links */}
            {navLinks.map((link) => (
              link.dropdown ? (
                <div key={link.href} className="relative group">
                  <Link
                    href={link.href}
                    className={`text-gray-200 font-medium px-2 py-1 rounded transition-all duration-300 hover:text-teal-400 hover:shadow-glow ${pathname.startsWith(link.href) ? 'border-b-2 border-teal-500 glow-border text-teal-300 shadow-glow' : ''}`}
                  >
                    {link.label}
                  </Link>
                  {/* Dropdown */}
                  <div className="absolute left-0 mt-2 min-w-[220px] bg-[#181f2a] border border-teal-500/30 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-300 z-50 backdrop-blur-md bg-opacity-90">
                    {visibleAgents.map(agent => (
                      <Link
                        key={agent.id}
                        href={agent.route || '#'}
                        className="block px-5 py-3 text-gray-200 hover:text-teal-400 hover:bg-teal-500/10 transition-all duration-200 font-medium"
                      >
                        {agent.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-gray-200 font-medium px-2 py-1 rounded transition-all duration-300 hover:text-teal-400 hover:shadow-glow ${pathname === link.href ? 'border-b-2 border-teal-500 glow-border text-teal-300 shadow-glow' : ''}`}
                >
                  {link.label}
                </Link>
              )
            ))}
            <div className="flex items-center gap-4">
              {/* Always show Login button, routes to dashboard auth */}
              <Link
                href="/login"
                className="text-gray-200 hover:text-electric-blue font-medium transition-all duration-200 hover:scale-105"
              >
                Login
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
          {/* Mobile nav links */}
          {navLinks.map((link, index) => (
            link.dropdown ? (
              <motion.div
                key={link.href}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-teal-400 hover:bg-white/10 transition-colors duration-200">
                  {link.label}
                  {/* Mobile dropdown for agents */}
                  <div className="mt-2 ml-2 border-l-2 border-teal-500 pl-3 space-y-1">
                    {visibleAgents.map(agent => (
                      <Link
                        key={agent.id}
                        href={agent.route || '#'}
                        className="block py-2 text-gray-200 hover:text-teal-400 transition-all duration-200 font-medium"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {agent.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={link.href}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={link.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-teal-400 hover:bg-white/10 transition-colors duration-200 ${pathname === link.href ? 'border-l-4 border-teal-500 bg-white/5 text-teal-300 shadow-glow' : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </motion.div>
            )
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
          </motion.div>
        </div>
      </motion.div>
    </motion.nav>
  );
}
