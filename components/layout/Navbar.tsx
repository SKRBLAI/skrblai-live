'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import BrandLogo from '@/components/ui/BrandLogo';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  
  useEffect(() => {
    router.prefetch('/features');
    router.prefetch('/pricing');
    router.prefetch('/dashboard');
  }, [router]);

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 cosmic-glass cosmic-gradient border-b border-[#30D5C8]/30 shadow-[0_2px_24px_#1E90FF30]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo + Tagline */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center group" aria-label="SKRBL AI Home">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <BrandLogo animate />
              </motion.div>
            </Link>
            {/* Tagline badge - consolidated, styled, accessible */}
            <span
              data-testid="skrbl-tagline"
              className="ml-2 text-xs md:text-sm font-semibold text-white bg-teal-600/80 rounded-full px-3 py-1 shadow-glow border border-teal-400/60 whitespace-nowrap"
              aria-label="pronounced like scribble, just without the vowels."
              tabIndex={-1}
            >
              pronounced like <span className="italic">scribble</span>, just without the vowels.
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex flex-1 justify-end items-center">
            <div className="flex items-center gap-x-4 w-full max-w-6xl justify-end">
              {/* FIXED: Route 'Agents' to '/services' where agents are displayed */}
              <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.96 }}>
                <Link href="/services" className="text-gray-300 hover:text-teal-400 focus:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 transition-all hover:scale-105 whitespace-nowrap px-2 py-1 rounded-lg"
                  aria-label="Browse all agents and services"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { window.location.href = '/services'; } }}
                >
                  Services Offered
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.96 }}>
                <Link href="/features" className="text-gray-300 hover:text-teal-400 focus:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 transition-all hover:scale-105 whitespace-nowrap px-2 py-1 rounded-lg">
                  Features
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.96 }}>
                <Link href="/pricing" className="text-gray-300 hover:text-teal-400 focus:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 transition-all hover:scale-105 whitespace-nowrap px-2 py-1 rounded-lg">
                  Pricing
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.96 }}>
                <Link href="/about" className="text-gray-300 hover:text-teal-400 focus:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 transition-all hover:scale-105 whitespace-nowrap px-2 py-1 rounded-lg">
                  About
                </Link>
              </motion.div>
              <Link href="/sign-in">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-white hover:text-teal-400 transition-all duration-300 whitespace-nowrap"
                >
                  Sign In
                </motion.button>
              </Link>
              <Link href="/sign-up">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="cosmic-btn-primary px-4 py-2 rounded-lg font-bold transition-all duration-300 whitespace-nowrap"
                >
                  Get Started
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`${active ? 'text-white font-semibold' : 'text-gray-300'} hover:text-teal-400 transition-colors duration-200 relative group`}
    >
      {children}
      <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-teal-400 transition-all duration-300 group-hover:w-full ${active ? 'w-full' : ''}`} />
    </Link>
  );
}

