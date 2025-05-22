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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0d1117]/80 backdrop-blur-sm border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo + Tagline */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center group" aria-label="SKRBL AI Home">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <BrandLogo />
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
              <Link href="/services" className="text-gray-300 hover:text-teal-400 transition-all hover:scale-105 whitespace-nowrap">
                Agents
              </Link>
              <Link href="/features" className="text-gray-300 hover:text-teal-400 transition-all hover:scale-105 whitespace-nowrap">
                Features
              </Link>
              <Link href="/pricing" className="text-gray-300 hover:text-teal-400 transition-all hover:scale-105 whitespace-nowrap">
                Pricing
              </Link>
              <Link href="/about" className="text-gray-300 hover:text-teal-400 transition-all hover:scale-105 whitespace-nowrap">
                About
              </Link>
              <Link href="/sign-in">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-white hover:text-teal-400 transition-all duration-300 whitespace-nowrap"
                >
                  Sign In
                </motion.button>
              </Link>
              <Link href="/get-started">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-white bg-teal-500 hover:bg-teal-400 px-4 py-2 rounded-lg font-bold shadow-glow transition-all duration-300 whitespace-nowrap"
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
