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
      transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20 }}
      className="fixed top-0 left-0 right-0 z-50 p-3"
    >
      <nav className="relative max-w-7xl mx-auto">
        {/* Premium Navbar Container with Blue Border */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-gray-900/98 to-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-[#0066FF]/30" />
        {/* Subtle blue glow */}
        <div className="absolute -inset-0.5 bg-[#0066FF]/20 blur-xl opacity-20 rounded-2xl" />

        {/* Navigation Content - Everything contained within */}
        <div className="relative px-4 py-3">
          <div className="flex items-center justify-between h-20">
            
            {/* SINGLE Brand Logo Section (Circled 1 - Keep this) */}
            <motion.div 
              className="flex items-center space-x-3 flex-shrink-0 -mb-1"
              whileHover={{ scale: 1.02 }}
            >
              <Link href="/" className="flex items-center space-x-3 group focus:outline-none pb-0.5 relative">
                <div className="flex flex-col items-start relative leading-tight max-w-[160px] sm:max-w-none truncate">
  <div className="flex items-center relative">
    <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-purple-500/30 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition-opacity" />
    <BrandLogo animate={onHome} className="w-48 relative mt-8" />
  </div>
  <div className="text-xs text-white font-medium ml-1 tracking-wide whitespace-nowrap truncate max-w-[140px] sm:max-w-none drop-shadow-[0_0_5px_rgba(45,212,191,0.6)] mt-0">pronounced like scribble, just without the vowels</div>
</div>
                
                {/* Mobile-only: Just brand logo */}
                <div className="sm:hidden">
                  <BrandLogo animate={onHome} className="w-24" />
                </div>
              </Link>
            </motion.div>

            {/* Right Side: Navigation & CTA */}
            <div className="flex items-center space-x-6">
              {/* Desktop Navigation Links */}
              <div className="hidden lg:flex items-center space-x-3 py-1">
                <NavLink href="/about">About</NavLink>
                <NavLink href="/agents">Agent League</NavLink>
                <NavLink href="/features">Features</NavLink>
                <NavLink href="/contact">Contact</NavLink>
                <NavLink href="/pricing">Pricing</NavLink>
                <NavLink href="/services">Services</NavLink>
              </div>

              {/* Eye-Catching CTA Button */}
              <motion.div 
                className="hidden md:flex flex-shrink-0 py-1"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/sign-up">
                  <button className="relative px-4 py-1.5 font-semibold text-white overflow-hidden rounded-lg group shadow-lg bg-[#0066FF] hover:bg-[#0055DD] transition-colors min-w-[44px] min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/80">
  {/* Animated background gradient */}
  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 group-hover:from-blue-600 group-hover:via-cyan-500 group-hover:to-teal-500 transition-all duration-300" />
  {/* Subtle outer glow */}
  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400/50 via-blue-500/50 to-purple-500/50 rounded-xl blur opacity-60 group-hover:opacity-80 transition-opacity" />
  {/* Shimmer effect */}
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
  {/* Button content */}
  <div className="relative flex items-center space-x-2">
    <Sparkles className="w-4 h-4" />
    <span className="font-semibold text-sm">Get Started</span>
  </div>
</button>
                </Link>
              </motion.div>

              {/* Mobile Menu Button */}
              <div className="lg:hidden flex-shrink-0">
                <MobileMenu />
              </div>
            </div>
          </div>
        </div>
      </nav>
    </motion.div>
  );
}

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 10 }}
    >
      <Link
        href={href}
        className={`relative px-4 py-2 font-medium transition-all duration-300 group focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/80 focus-visible:ring-offset-2 rounded-lg text-base whitespace-nowrap min-w-[44px] min-h-[44px] ${isActive ? 'text-white bg-[#0066FF]/15 shadow-[0_0_30px_rgba(255,182,255,0.6)]' : 'text-gray-400 hover:text-white hover:bg-[#0066FF]/10 hover:shadow-[0_0_25px_rgba(255,182,255,0.5)]'}`}
      >
        <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-white via-fuchsia-200 to-cyan-200 font-semibold tracking-wide drop-shadow-[0_0_4px_rgba(255,182,255,0.4)]">{children}</span>
        <div 
          className={`absolute -bottom-px left-3 right-3 h-px bg-cyan-400 transform origin-left transition-transform duration-300 ${isActive ? 'scale-x-100' : 'scale-x-0'}`}
        />
      </Link>
    </motion.div>
  );
}

function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  // Focus trap and Escape key handler
  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Tab' && menuRef.current) {
      // Trap focus within the menu
      const focusableEls = menuRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const firstEl = focusableEls[0];
      const lastEl = focusableEls[focusableEls.length - 1];
      if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        (firstEl as HTMLElement).focus();
      } else if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        (lastEl as HTMLElement).focus();
      }
    }
  }

  // Focus the first link when menu opens
  useEffect(() => {
    if (isOpen && firstLinkRef.current) {
      firstLinkRef.current.focus();
    }
  }, [isOpen]);

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
         className="relative p-2.5 rounded-xl bg-slate-800/60 border border-cyan-400/40 text-cyan-400 hover:bg-slate-700/60 transition-colors min-w-[44px] min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/80"
         whileHover={{ scale: 1.1 }}
         whileTap={{ scale: 0.9 }}
         aria-label="Open menu"
         aria-expanded={isOpen}
         aria-controls="mobile-nav-menu"
       >
        <Menu className="w-5 h-5" />
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
               id="mobile-nav-menu"
               role="dialog"
               aria-modal="true"
               initial="closed"
               animate="open"
               exit="closed"
               variants={menuVariants}
               transition={{ type: "spring", stiffness: 200, damping: 25 }}
               className="fixed top-0 right-0 h-full w-80 max-w-[85vw] z-50 overflow-hidden"
               tabIndex={-1}
               onKeyDown={handleKeyDown}
             >
              {/* Panel Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-gray-900/95 to-slate-900/95 backdrop-blur-xl border-l border-cyan-400/30">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5" />
              </div>

              {/* Panel Content */}
              <div className="relative h-full flex flex-col p-6">
                {/* Header - Single brand display */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex flex-col">
                    <div className="text-2xl font-bold tracking-tight whitespace-nowrap bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-white drop-shadow-[0_0_4px_rgba(255,182,255,0.4)]">SKRBL AI</div>
                    <div className="text-xs text-white font-medium -mt-1 ml-0.5 tracking-wide whitespace-nowrap drop-shadow-[0_0_5px_rgba(45,212,191,0.6)]">
                      pronounced like scribble, just without the vowels
                    </div>
                  </div>
                  <motion.button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg bg-slate-800/50 border border-cyan-400/30 text-cyan-400 hover:bg-slate-700/50 transition-colors min-w-[44px] min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/80"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Navigation Links */}
                <nav className="flex flex-col space-y-3 mb-8">
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
                        ref={index === 0 ? firstLinkRef : undefined}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-3.5 text-base font-medium text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/10 rounded-lg transition-all border border-slate-700/50 hover:border-cyan-400/30 min-w-[44px] min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/80"
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
                    <button className="w-full relative px-6 py-4 font-bold text-white overflow-hidden rounded-xl group shadow-lg min-w-[44px] min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/80">
                      {/* Background gradient */}
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-teal-400 group-hover:from-blue-600 group-hover:to-cyan-500 transition-all duration-300" />
                      
                      {/* Glow effect */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-300 rounded-xl blur opacity-60 group-hover:opacity-90 transition-opacity" />
                      
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      
                      {/* Button content */}
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
