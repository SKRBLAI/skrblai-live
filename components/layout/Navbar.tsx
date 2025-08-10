"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles, LogIn } from "lucide-react";
import SkrblAiLogo from "../ui/SkrblAiLogo";
import { useAuth } from "../context/AuthContext";

/**
 * Premium minimal Navbar with clean 3-link design + hamburger menu.
 * - Only 3 visible links: About | Features | Pricing
 * - Hamburger menu: Agent League, Services, Sports, Contact
 * - Dual CTAs: Login + Try Percy Free
 * - Premium gradient animations with glass morphism.
 */
export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isEmailVerified, isLoading } = useAuth();

  // Smart login handler that routes based on authentication status
  const handleSmartLogin = () => {
    if (isLoading) return; // Wait for auth to load
    
    if (user && isEmailVerified) {
      // Verified user - go directly to dashboard
      console.log('[NAVBAR] Verified user clicking dashboard - routing to dashboard');
      router.push('/dashboard');
    } else {
      // Any other case (unverified or no user) - go to Percy onboarding
      console.log('[NAVBAR] User needs authentication - routing to Percy onboarding');
      router.push('/?action=dashboard');
    }
  };

  // Prefetch heavy routes for a snappy UX.
  useEffect(() => {
    ["/agents", "/pricing", "/dashboard", "/sports"].forEach((route) =>
      router.prefetch(route)
    );
  }, [router]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20 }}
      className="fixed top-0 left-0 right-0 z-50 p-3"
    >
      <nav className="relative mx-auto max-w-7xl">
        {/* Enhanced 3D Cosmic Glass Container */}
        <div className="absolute inset-0 rounded-2xl border-[3px] border-[#0066FF]/40 bg-gradient-to-r from-slate-900/98 via-gray-900/100 to-slate-900/98 backdrop-blur-2xl navbar-cosmic navbar-glow navbar-rim-glow navbar-3d-shadow" />
        {/* Pseudo-3D Shadow Layer */}
        <div className="absolute inset-x-0 top-0 h-full rounded-2xl bg-gradient-to-b from-black/20 via-transparent to-black/30 pointer-events-none" />
        {/* Enhanced shadow casting over page content */}
        <div className="absolute inset-x-0 top-full h-4 bg-gradient-to-b from-black/25 via-black/10 to-transparent pointer-events-none" />
        

        {/* NAV CONTENT */}
        <div className="relative py-4 px-5">
          <div className="flex h-16 md:h-24 lg:h-28 items-center justify-between">
            {/* SKRBL AI Animated Logo with Tagline */}
            <Link href="/" className="group relative flex items-center focus:outline-none logo-cosmic-glow">
              <SkrblAiLogo 
                size="lg" 
                variant="premium" 
                showTagline={true}
                className="flex-shrink-0 md:scale-110 lg:scale-125 navbar-element-3d"
              />
            </Link>

            {/* Desktop Nav & CTAs */}
            <div className="flex items-center space-x-6">
              {/* Enhanced Navigation Links (Desktop Only) */}
              <div className="hidden items-center space-x-3 py-1 lg:flex">
                <NavLink href="/about">About</NavLink>
                <NavLink href="/features">Features</NavLink>
                <NavLink href="/sports">Sports</NavLink>
                <NavLink href="/pricing">Pricing</NavLink>
                <MoreNavDropdown pathname={pathname} />
              </div>

              {/* Dashboard CTA */}
              <div className="hidden items-center space-x-3 lg:flex">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-shrink-0">
                  <button onClick={handleSmartLogin} className="group relative min-h-[44px] min-w-[44px] overflow-hidden rounded-lg bg-[#0066FF] px-6 py-2 font-semibold text-white shadow-lg transition-colors hover:bg-[#0055DD] focus-visible:ring-2 focus-visible:ring-cyan-400/80 focus:outline-none">
                    {/* Animated gradient */}
                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 transition-all group-hover:from-blue-600 group-hover:via-cyan-500 group-hover:to-teal-500" />
                    {/* Outer glow */}
                    <div className="absolute -inset-1 -z-20 rounded-xl bg-gradient-to-r from-cyan-400/50 via-blue-400/50 to-purple-400/50 blur opacity-60 transition-opacity group-hover:opacity-80" />
                    {/* Shimmer */}
                    <div className="absolute inset-0 -skew-x-12 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]" />
                    <div className="relative flex items-center space-x-2">
                      <Sparkles className="h-4 w-4" />
                      <span className="text-sm font-semibold">Dashboard</span>
                    </div>
                  </button>
                </motion.div>
              </div>

              {/* Mobile Hamburger */}
              <div className="flex-shrink-0 lg:hidden">
                <MobileMenu pathname={pathname} onSmartLogin={handleSmartLogin} />
              </div>
            </div>
          </div>
        </div>
      </nav>
    </motion.div>
  );
}

/****************************
 * NavLink (desktop only)
 ***************************/
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300, damping: 10 }}>
      <Link
        href={href}
        className={`group relative min-h-[44px] min-w-[44px] whitespace-nowrap rounded-lg border px-4 py-2 text-base font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/80 focus-visible:ring-offset-2 flex items-center justify-center ${
          isActive
            ? "border-cyan-400/60 bg-slate-700/80 text-white shadow-[0_0_20px_rgba(56,189,248,0.5)]"
            : "border-gray-600/40 bg-slate-800/50 text-gray-300 hover:border-cyan-400/50 hover:bg-slate-700/60 hover:text-white"
        }`}
      >
        <span className="relative z-10">{children}</span>
        {/* Cosmic glow effect */}
        <div
          className={`absolute inset-0 rounded-lg transition-all duration-300 ${
            isActive 
              ? "shadow-[0_0_25px_rgba(56,189,248,0.4)] bg-gradient-to-r from-cyan-500/10 via-blue-600/10 to-purple-600/10"
              : "group-hover:shadow-[0_0_15px_rgba(56,189,248,0.3)] group-hover:bg-gradient-to-r group-hover:from-cyan-500/5 group-hover:via-blue-600/5 group-hover:to-purple-600/5"
          }`}
        />
      </Link>
    </motion.div>
  );
}

/****************************
 * MoreNavDropdown (desktop dropdown menu)
 ***************************/
function MoreNavDropdown({ pathname }: { pathname: string | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const moreNavItems = [
    { href: "/agents", label: "Agent League" },
    { href: "/agents", label: "Agents" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 300, damping: 10 }}
        onClick={() => setIsOpen(!isOpen)}
        className="group relative min-h-[44px] min-w-[44px] whitespace-nowrap rounded-lg border border-gray-600/40 bg-slate-800/50 px-4 py-2 text-base font-medium transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/80 focus-visible:ring-offset-2 text-gray-300 hover:border-cyan-400/50 hover:bg-slate-700/60 hover:text-white flex items-center justify-center space-x-1"
      >
        <span className="relative z-10">More</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-4 h-4 relative z-10"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
        {/* Cosmic glow effect */}
        <div className="absolute inset-0 rounded-lg transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(56,189,248,0.3)] group-hover:bg-gradient-to-r group-hover:from-cyan-500/5 group-hover:via-blue-600/5 group-hover:to-purple-600/5" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-48 rounded-xl border border-cyan-400/30 bg-gradient-to-br from-slate-900/95 via-gray-900/95 to-slate-900/95 backdrop-blur-xl shadow-2xl dropdown-cosmic"
          >
            <div className="py-2">
              {moreNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 text-sm font-medium transition-colors duration-200 hover:bg-[#0066FF]/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/80 ${
                    pathname === item.href ? "bg-[#0066FF]/30 text-white" : "text-gray-300"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/****************************
 * MobileMenu (slide-in panel with hamburger items)
 ***************************/
interface MobileMenuProps {
  pathname: string | null;
  onSmartLogin: () => void;
}

function MobileMenu({ pathname, onSmartLogin }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  // Close on Esc & trap focus
  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Tab" && menuRef.current) {
      const focusableEls = menuRef.current.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])"
      );
      const firstEl = focusableEls[0];
      const lastEl = focusableEls[focusableEls.length - 1];
      if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      } else if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      }
    }
  }

  // Focus first link when panel opens
  useEffect(() => {
    if (isOpen && firstLinkRef.current) firstLinkRef.current.focus();
  }, [isOpen]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const menuVariants = {
    closed: { opacity: 0, x: "100%" },
    open: { opacity: 1, x: 0 },
  } as const;

  // Mobile menu items (hamburger menu + main nav items)
  const navItems = [
    // Main nav items for mobile
    { href: "/about", label: "About" },
    { href: "/features", label: "Features" },
    { href: "/sports", label: "Sports" },
    { href: "/pricing", label: "Pricing" },
    // Hamburger menu items
    { href: "/agents", label: "Agent League", section: "More" },
    { href: "/services", label: "Services", section: "More" },
    { href: "/contact", label: "Contact", section: "More" },
  ];

  return (
    <>
      <motion.button
        aria-label="Open menu"
        aria-expanded={isOpen}
        aria-controls="mobile-nav-menu"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="relative min-h-[44px] min-w-[44px] rounded-xl border border-cyan-400/40 bg-slate-800/60 p-2.5 text-cyan-400 transition-colors hover:bg-slate-700/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/80"
      >
        <Menu className="h-5 w-5" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Slide-in panel */}
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
              className="fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw] overflow-hidden"
              tabIndex={-1}
              onKeyDown={handleKeyDown}
            >
              {/* Panel background */}
              <div className="absolute inset-0 border-l border-cyan-400/30 bg-gradient-to-br from-slate-900/95 via-gray-900/95 to-slate-900/95 backdrop-blur-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5" />
              </div>

              {/* Content */}
              <div className="relative flex h-full flex-col p-6">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                  {/* Small logo */}
                  <Link href="/" onClick={() => setIsOpen(false)} className="focus:outline-none">
                    <SkrblAiLogo size="sm" variant="premium" className="h-8 w-auto" />
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Close menu"
                    onClick={() => setIsOpen(false)}
                    className="min-h-[44px] min-w-[44px] rounded-lg border border-cyan-400/30 bg-slate-800/50 p-2 text-cyan-400 transition-colors hover:bg-slate-700/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/80"
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>

                {/* Links */}
                <nav className="mb-8 flex flex-col space-y-3">
                  {navItems.map((item, idx) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      {item.section && idx === 3 && (
                        <div className="mb-3 mt-4 border-t border-gray-700/50 pt-3">
                          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                            {item.section}
                          </p>
                        </div>
                      )}
                      <Link
                        ref={idx === 0 ? firstLinkRef : undefined}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`block min-h-[44px] min-w-[44px] rounded-lg border border-slate-700/50 px-4 py-3.5 text-base font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/80 hover:border-cyan-400/30 hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/10 hover:text-white ${
                          pathname === item.href ? "text-white" : "text-gray-300"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                {/* Mobile CTAs */}
                <div className="mt-auto space-y-3">
                  {/* Dashboard CTA */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <button
                      onClick={() => { setIsOpen(false); onSmartLogin(); }}
                      className="group relative w-full min-h-[44px] overflow-hidden rounded-xl px-6 py-4 font-bold text-white shadow-lg transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/80"
                    >
                      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-cyan-500 via-blue-600 to-teal-400" />
                      <div className="relative flex items-center justify-center space-x-2">
                        <Sparkles className="h-5 w-5" />
                        <span>Dashboard</span>
                      </div>
                    </button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
