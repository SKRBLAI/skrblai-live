'use client';
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import BrandLogo from '@/components/ui/BrandLogo';


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
                <BrandLogo animate={onHome} />
              </motion.div>
            </Link>
            {/* Tagline badge - full on desktop, short on mobile */}
            <span
              data-testid="skrbl-tagline"
              className="ml-2 text-xs md:text-sm font-semibold text-white bg-teal-600/80 rounded-full px-3 py-1 shadow-glow border border-teal-400/60 whitespace-nowrap hidden xs:inline md:inline"
              aria-label="pronounced like scribble, just without the vowels."
              tabIndex={-1}
            >
              pronounced like <span className="italic">scribble</span>, just without the vowels.
            </span>
            <span
              className="ml-2 text-xs font-semibold text-white bg-teal-600/80 rounded-full px-3 py-1 shadow-glow border border-teal-400/60 whitespace-nowrap inline xs:hidden md:hidden"
              aria-label="just without the vowels."
              tabIndex={-1}
            >
              just without the vowels.
            </span>
          </div>

          {/* Hamburger for mobile */}
          <div className="flex md:hidden items-center">
            <MobileMenu />
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex flex-1 justify-end items-center">
            <div className="flex items-center gap-x-4 w-full max-w-6xl justify-end">
              {/* FIXED: Route 'Agents' to '/agents' */}
              <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.96 }}>
                <Link href="/agents" className="text-gray-300 hover:text-teal-400 focus:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 transition-all hover:scale-105 whitespace-nowrap px-2 py-1 rounded-lg"
                  aria-label="Meet your Agent League"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { window.location.href = '/agents'; } }}
                >
                  Agent League
                </Link>
              </motion.div>
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
                <Link href="/pricing" className="text-gray-300 hover:text-teal-400 focus:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 transition-all hover:scale-105 whitespace-nowrap px-2 py-1 rounded-lg">
                  Pricing
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.96 }}>
                <Link href="/about" className="text-gray-300 hover:text-teal-400 focus:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 transition-all hover:scale-105 whitespace-nowrap px-2 py-1 rounded-lg">
                  About
                </Link>
              </motion.div>
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-white hover:text-teal-400 transition-all duration-300 whitespace-nowrap"
                >
                  Contact
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
// --- MobileMenu component ---
function MobileMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  // Trap focus inside menu when open
  useEffect(() => {
    if (!open) return;
    const focusable = menuRef.current?.querySelectorAll<HTMLElement>(
      'a,button,[tabindex]:not([tabindex="-1"])'
    );
    focusable?.[0]?.focus();
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'Tab' && focusable && focusable.length > 0) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        }
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  return (
    <>
      {/* Hamburger button */}
      <button
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open ? 'true' : 'false'}
        aria-controls="mobile-nav-drawer"
        onClick={() => setOpen(v => !v)}
        className="p-2 rounded-lg bg-teal-700/70 hover:bg-teal-600/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 shadow-glow"
        tabIndex={0}
      >
        {/* SVG Hamburger Icon */}
        <span aria-hidden="true">
          {open ? (
            // Close (X)
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          ) : (
            // Hamburger
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          )}
        </span>
      </button>
      {/* Drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-50" aria-modal="true" role="dialog">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px] transition-opacity"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <motion.div
            ref={menuRef}
            id="mobile-nav-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            className="fixed top-0 right-0 h-full w-72 max-w-[90vw] bg-gradient-to-br from-[#172a3aee] to-[#0d1117ee] shadow-2xl cosmic-glass border-l border-teal-400/30 z-50 flex flex-col px-6 py-7 gap-3 focus:outline-none"
            tabIndex={-1}
          >
            <nav aria-label="Mobile Navigation" className="flex flex-col gap-4 mt-4">
              <Link href="/agents" tabIndex={0} className="text-lg font-semibold text-teal-200 hover:text-white focus:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 px-1 py-2 rounded" onClick={() => setOpen(false)}>Agent League</Link>
              <Link href="/services" tabIndex={0} className="text-lg font-semibold text-teal-200 hover:text-white focus:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 px-1 py-2 rounded" onClick={() => setOpen(false)}>Services Offered</Link>
              <Link href="/pricing" tabIndex={0} className="text-lg font-semibold text-teal-200 hover:text-white focus:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 px-1 py-2 rounded" onClick={() => setOpen(false)}>Pricing</Link>
              <Link href="/about" tabIndex={0} className="text-lg font-semibold text-teal-200 hover:text-white focus:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 px-1 py-2 rounded" onClick={() => setOpen(false)}>About</Link>
              <Link href="/contact" tabIndex={0} className="text-lg font-semibold text-teal-200 hover:text-white focus:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 px-1 py-2 rounded" onClick={() => setOpen(false)}>Contact</Link>
              <Link href="/sign-up" tabIndex={0} className="text-lg font-bold text-white bg-gradient-to-r from-teal-500 to-blue-400 px-3 py-2 rounded-lg shadow-glow hover:from-blue-400 hover:to-teal-500 transition-all" onClick={() => setOpen(false)}>Get Started</Link>
            </nav>
            {/* Mobile tagline, only if hidden above */}
            <div className="mt-8 text-xs text-teal-300 font-semibold italic text-center">
              just without the vowels.
            </div>
          </motion.div>
        </div>
      )}
    </>
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
