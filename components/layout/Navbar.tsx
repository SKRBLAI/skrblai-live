"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sparkles } from "lucide-react";
import CosmicBrandLogo from "@/components/ui/CosmicBrandLogo";

/**
 * Premium animated Navbar with single video logo (desktop & mobile).
 * - Responsive, accessible, and mobile-first.
 * - Uses Framer Motion for subtle motion flourishes.
 * - Removes all legacy duplicated logos / taglines.
 */
export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  // Prefetch heavy routes for a snappy UX.
  useEffect(() => {
    ["/services", "/pricing", "/dashboard", "/agents", "/sports"].forEach((route) =>
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
        {/* Fancy glass + glow container */}
        <div className="absolute inset-0 rounded-2xl border-2 border-[#0066FF]/30 bg-gradient-to-r from-slate-900/95 via-gray-900/98 to-slate-900/95 backdrop-blur-xl shadow-2xl" />
        {/* Subtle blue glow */}
        

        {/* NAV CONTENT */}
        <div className="relative py-3 px-4">
          <div className="flex h-16 md:h-20 items-center justify-between">
            {/* Cosmic Brand Logo with Tagline */}
            <Link href="/" className="group relative flex items-center focus:outline-none">
              <CosmicBrandLogo 
                size="md" 
                animate={true} 
                showTagline={true}
                className="flex-shrink-0"
              />
            </Link>

            {/* Desktop Nav & CTA */}
            <div className="flex items-center space-x-6">
              {/* Links */}
              <div className="hidden items-center space-x-3 py-1 lg:flex">
                <NavLink href="/about">About</NavLink>
                <NavLink href="/agents">Agent League</NavLink>
                <NavLink href="/features">Features</NavLink>
                <NavLink href="/contact">Contact</NavLink>
                <NavLink href="/pricing">Pricing</NavLink>
                <NavLink href="/services">Services</NavLink>
                <NavLink href="/sports">Sports</NavLink>
              </div>

              {/* CTA */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden flex-shrink-0 py-1 md:flex"
              >
                <Link href="/sign-up" className="focus:outline-none">
                  <button className="relative min-h-[44px] min-w-[44px] overflow-hidden rounded-lg bg-[#0066FF] px-6 py-1.5 font-semibold text-white shadow-lg transition-colors hover:bg-[#0055DD] focus-visible:ring-2 focus-visible:ring-cyan-400/80">
                    {/* Animated gradient */}
                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 transition-all duration-300 group-hover:from-blue-600 group-hover:via-cyan-500 group-hover:to-teal-500" />
                    {/* Outer glow */}
                    <div className="absolute -inset-1 -z-20 rounded-xl bg-gradient-to-r from-cyan-400/50 via-blue-500/50 to-purple-500/50 blur opacity-60 transition-opacity group-hover:opacity-80" />
                    {/* Shimmer */}
                    <div className="absolute inset-0 -skew-x-12 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]" />
                    <div className="relative flex items-center space-x-2">
                      <Sparkles className="h-4 w-4" />
                      <span className="text-sm font-semibold">Get Started</span>
                    </div>
                  </button>
                </Link>
              </motion.div>

              {/* Mobile Hamburger */}
              <div className="flex-shrink-0 lg:hidden">
                <MobileMenu pathname={pathname} />
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
        className={`group relative min-h-[44px] min-w-[44px] whitespace-nowrap rounded-lg px-4 py-2 text-base font-medium transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/80 focus-visible:ring-offset-2 ${
          isActive
            ? "bg-[#0066FF]/30 text-white shadow-[0_0_30px_rgba(0,102,255,0.6)]"
            : "text-gray-300 hover:bg-[#0066FF]/20 hover:text-white"
        }`}
      >
        
          {children}
        {/* glow ring */}
        <div
          className="absolute inset-0 rounded-lg transition-shadow duration-300 group-hover:shadow-[0_0_15px_2px_rgba(0,102,255,0.4)] group-focus-visible:shadow-[0_0_15px_2px_rgba(0,102,255,0.5)]"
        />
      </Link>
    </motion.div>
  );
}

/****************************
 * MobileMenu (slide-in panel)
 ***************************/
interface MobileMenuProps {
  pathname: string | null;

}

function MobileMenu({ pathname }: MobileMenuProps) {
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

  const navItems = [
    { href: "/about", label: "About" },
    { href: "/agents", label: "Agent League" },
    { href: "/features", label: "Features" },
    { href: "/contact", label: "Contact" },
    { href: "/pricing", label: "Pricing" },
    { href: "/services", label: "Services" },
    { href: "/sports", label: "Sports" },
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
                <div className="mb-8 flex items-center justify-end">


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

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-auto"
                >
                  <Link href="/sign-up" onClick={() => setIsOpen(false)}>
                    <button className="relative w-full min-h-[44px] min-w-[44px] overflow-hidden rounded-xl px-6 py-4 font-bold text-white shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/80">
                      {/* Gradient */}
                      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-cyan-500 via-blue-600 to-teal-400 transition-all duration-300 group-hover:from-blue-600 group-hover:to-cyan-500" />
                      {/* Glow */}
                      <div className="absolute -inset-1 -z-20 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-400 to-teal-300 blur opacity-60 transition-opacity group-hover:opacity-90" />
                      {/* Shimmer */}
                      <div className="absolute inset-0 -skew-x-12 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-[100%]" />
                      <div className="relative flex items-center justify-center space-x-2">
                        <Sparkles className="h-5 w-5" />
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
