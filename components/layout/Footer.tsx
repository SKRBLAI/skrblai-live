'use client';
import Link from 'next/link';
import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="relative z-10 w-full bg-[#0d1117] text-gray-400 border-t border-gray-700/50 pt-8 pb-[calc(env(safe-area-inset-bottom)+24px)]">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center justify-center gap-2">
          {/* Animated Brandmark */}
          <span
            className="relative inline-flex items-center justify-center w-10 h-10 mr-2 select-none"
            aria-label="SKRBL AI Brandmark"
          >
            <span className="absolute inset-0 rounded-full bg-gradient-to-br from-electric-blue via-fuchsia-500 to-teal-400 blur-xl opacity-70 animate-pulse-slow"></span>
            <span className="relative z-10 text-2xl font-extrabold bg-gradient-to-r from-electric-blue via-fuchsia-400 to-teal-300 bg-clip-text text-transparent drop-shadow-glow animate-float-slow">
              SKRBL
            </span>
          </span>
          <p className="text-sm text-center md:text-left">
            &copy; {currentYear} SKRBL AI. All rights reserved.
          </p>
        </div>
        <nav className="flex flex-wrap gap-4 text-sm justify-center md:justify-end">
          <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
        </nav>
      </div>
    </footer>
  );
}