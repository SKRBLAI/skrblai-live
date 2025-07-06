'use client';
// @ts-nocheck
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="w-full bg-[#0d1117] text-gray-400 border-t border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-sm text-center md:text-left">
          © {currentYear} SKRBL AI. All rights reserved.
        </p>
        <nav className="flex flex-wrap gap-4 text-sm justify-center md:justify-end">
          <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
        </nav>
      </div>
    </footer>
  );
}