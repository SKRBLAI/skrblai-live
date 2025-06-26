'use client';
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import BrandLogo from '@/components/ui/BrandLogo';
import styles from './Navbar.module.css';

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
    <div className={styles.floatingNav}>
      <nav className={styles.glassContainer} aria-label="Main Navigation">
        <div className={styles.navCol}>
          <div className={styles.navRow}>
            {/* Logo + Tagline */}
            <div className={styles.logoTagline}>
              <Link href="/" aria-label="SKRBL AI Home">
                <span className={styles.logoGlow}><BrandLogo animate={onHome} /></span>
              </Link>
              <span className={styles.tagline + " hidden md:inline-block"}>
                pronounced like <span style={{marginRight: '0.22em'}}></span><span className="italic" style={{verticalAlign: 'baseline'}}>scribble</span>, just without the vowels.
              </span>
            </div>
            <div className={styles.flexSpacer} />
            {/* Desktop Nav Links */}
            <div className={styles.navLinks + " hidden md:flex"}>
              <NavLink href="/about">About</NavLink>
              <NavLink href="/agents">Agent League</NavLink>
              <NavLink href="/features">Features</NavLink>
              <NavLink href="/contact">Contact</NavLink>
              <NavLink href="/pricing">Pricing</NavLink>
              <NavLink href="/services">Services</NavLink>
            </div>
          </div>
          {/* CTA Button Desktop - now below */}
          <div className={styles.ctaRow + " hidden md:flex"}>
            <Link href="/sign-up">
              <button className={styles.ctaBtn}>
                Get Started
              </button>
            </Link>
          </div>
        </div>
        {/* Hamburger for mobile */}
        <div className="md:hidden flex items-center">
          <MobileMenu />
        </div>
      </nav>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.96 }}>
      <Link
        href={href}
        className={
          styles.navLink +
          ' ' +
          (isActive ? ' text-teal-300 font-semibold' : '')
        }
      >
        {children}
      </Link>
    </motion.div>
  );
}

// --- MobileMenu component ---
function MobileMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
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
      <button
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded="true"
        aria-controls="mobile-nav-menu"
        data-open={open}
        onClick={() => setOpen(v => !v)}
        className="p-2 rounded-lg bg-teal-700/70 hover:bg-teal-600/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 shadow-glow"
      >
        <span aria-hidden="true">
          {open ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          )}
        </span>
      </button>

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
              <Link href="/about" className="text-lg font-semibold text-teal-200 hover:text-white px-1 py-2 rounded" onClick={() => setOpen(false)}>About</Link>
              <Link href="/agents" className="text-lg font-semibold text-teal-200 hover:text-white px-1 py-2 rounded" onClick={() => setOpen(false)}>Agent League</Link>
              <Link href="/features" className="text-lg font-semibold text-teal-200 hover:text-white px-1 py-2 rounded" onClick={() => setOpen(false)}>Features</Link>
              <Link href="/contact" className="text-lg font-semibold text-teal-200 hover:text-white px-1 py-2 rounded" onClick={() => setOpen(false)}>Contact</Link>
              <Link href="/pricing" className="text-lg font-semibold text-teal-200 hover:text-white px-1 py-2 rounded" onClick={() => setOpen(false)}>Pricing</Link>
              <Link href="/services" className="text-lg font-semibold text-teal-200 hover:text-white px-1 py-2 rounded" onClick={() => setOpen(false)}>Services</Link>
              <div className="border-t border-teal-400/20 my-2"></div>
              <Link href="/sign-up" className="text-lg font-bold text-white bg-gradient-to-r from-teal-500 to-blue-400 px-3 py-2 rounded-lg shadow-glow hover:from-blue-400 hover:to-teal-500 transition-all text-center" onClick={() => setOpen(false)}>Get Started</Link>
            </nav>
          </motion.div>
        </div>
      )}
    </>
  );
}
