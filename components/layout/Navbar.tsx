'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  
  useEffect(() => {
    router.prefetch('/features');
    router.prefetch('/pricing');
  }, [router]);

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 w-full z-50 bg-opacity-90 bg-deep-navy backdrop-blur-md border-b border-sky-500/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <motion.span 
                className="text-2xl font-cursive text-white"
                whileHover={{ scale: 1.05 }}
              >
                SKRBL
                <span className="text-teal-400 ml-1 glow-teal">AI</span>
              </motion.span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink href="/features" active={isActive('/features')}>
              Features
            </NavLink>
            <NavLink href="/services" active={isActive('/services')}>
              Meet the Agents
            </NavLink>
            <NavLink href="/pricing" active={isActive('/pricing')}>
              Pricing
            </NavLink>
            <NavLink href="/about" active={isActive('/about')}>
              About
            </NavLink>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-sky-400 to-teal-300 text-deep-navy font-semibold shadow-lg hover:shadow-teal-500/20"
            >
              <Link href="/auth">Sign In</Link>
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href}>
      <motion.span
        className={`text-lg font-medium ${active ? 'text-teal-400 glow-teal' : 'text-gray-300'} hover:text-teal-400 transition-colors`}
        whileHover={{ scale: 1.05 }}
      >
        {children}
      </motion.span>
    </Link>
  );
}
