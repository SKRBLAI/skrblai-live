'use client';
import React, { useEffect, useState } from 'react';
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

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0d1117]/95 backdrop-blur-md border-b border-[#30D5C8]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left Side - Logo + Tagline */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center" aria-label="SKRBL AI Home">
              <BrandLogo animate={onHome} />
            </Link>
            
            {/* Tagline - responsive visibility */}
            <div className="hidden sm:block">
              <span className="text-xs font-medium text-teal-300 bg-teal-900/30 px-3 py-1 rounded-full border border-teal-400/30">
                pronounced like <em>scribble</em>, just without the vowels.
              </span>
            </div>
          </div>

          {/* Center/Right - Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink href="/about" active={pathname === '/about'}>About</NavLink>
            <NavLink href="/agents" active={pathname === '/agents'}>Agent League</NavLink>
            <NavLink href="/features" active={pathname === '/features'}>Features</NavLink>
            <NavLink href="/contact" active={pathname === '/contact'}>Contact</NavLink>
            <NavLink href="/pricing" active={pathname === '/pricing'}>Pricing</NavLink>
            <NavLink href="/services" active={pathname === '/services'}>Services</NavLink>
            
            {/* CTA Button */}
            <Link href="/sign-up" className="ml-4">
              <button className="bg-gradient-to-r from-blue-500 to-teal-400 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-teal-500 transition-all duration-200 hover:scale-105">
                Get Started
              </button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <MobileMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}

// Clean Navigation Link Component
function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link 
      href={href}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
        active 
          ? 'text-teal-400 bg-teal-900/20' 
          : 'text-gray-300 hover:text-teal-400 hover:bg-gray-800/50'
      }`}
    >
      {children}
    </Link>
  );
}

// Simplified Mobile Menu
function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const menuItems = [
    { href: '/about', label: 'About' },
    { href: '/agents', label: 'Agent League' },
    { href: '/features', label: 'Features' },
    { href: '/contact', label: 'Contact' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/services', label: 'Services' },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMenu}
        className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-teal-400"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={closeMenu}
          />
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 right-0 z-50 h-full w-80 max-w-[85vw] bg-[#0d1117]/95 backdrop-blur-md border-l border-teal-400/20 shadow-2xl"
          >
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
              <span className="text-lg font-semibold text-white">Menu</span>
              <button
                onClick={closeMenu}
                className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-800/50"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile Menu Items */}
            <div className="px-4 py-6 space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={`block px-3 py-3 rounded-md text-base font-medium transition-colors duration-200 ${
                    pathname === item.href
                      ? 'text-teal-400 bg-teal-900/20'
                      : 'text-gray-300 hover:text-teal-400 hover:bg-gray-800/50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile CTA */}
              <div className="pt-4">
                <Link href="/sign-up" onClick={closeMenu}>
                  <button className="w-full bg-gradient-to-r from-blue-500 to-teal-400 text-white px-4 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-teal-500 transition-all duration-200">
                    Get Started
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </>
  );
}
