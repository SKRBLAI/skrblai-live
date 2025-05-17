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
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BrandLogo />
            </motion.div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/features" className="text-gray-300 hover:text-teal-400 transition-all hover:scale-105">
              Features
            </Link>
            <Link href="/services" className="text-gray-300 hover:text-teal-400 transition-all hover:scale-105">
              Meet the Agents
            </Link>
            <Link href="/pricing" className="text-gray-300 hover:text-teal-400 transition-all hover:scale-105">
              Pricing
            </Link>
            <Link href="/about" className="text-gray-300 hover:text-teal-400 transition-all hover:scale-105">
              About
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/sign-in">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-white hover:text-teal-400 transition-all duration-300"
                >
                  Sign In
                </motion.button>
              </Link>
              <Link href="/get-started">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-electric-blue text-white px-6 py-2 rounded-lg shadow-glow hover:shadow-electric-blue/50 transition-all duration-300"
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
