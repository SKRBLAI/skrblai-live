'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { auth } from '@/utils/firebase';
import type { User } from 'firebase/auth';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-deep-navy/95 backdrop-blur-md border-b border-electric-blue/20">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 relative">
            <Image 
              src="/images/logo.svg" 
              alt="SKRBL AI Logo" 
              fill 
              className="object-contain"
              priority
            />
          </div>
          <span className="text-2xl font-bold">
            <span className="text-electric-blue">SKRBL</span> AI
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          <Link href="/services" className="text-gray-300 hover:text-teal-300 transition-colors">
            Services
          </Link>
          <Link href="/pricing" className="text-gray-300 hover:text-teal-300 transition-colors">
            Pricing
          </Link>
          <Link href="/about" className="text-gray-300 hover:text-teal-300 transition-colors">
            About
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-soft-gray"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <Link href="/dashboard" className="px-4 py-2 text-gray-300 hover:text-teal-300 transition-colors">
                Dashboard
              </Link>
              <button
                onClick={() => auth.signOut()}
                className="px-4 py-2 text-gray-400 hover:text-red-400 transition-colors"
                title="Sign Out"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5m0 0a2 2 0 00-2-2h-4a2 2 0 00-2 2v14a2 2 0 002 2h4a2 2 0 002-2v-1" />
                </svg>
              </button>
              {/* Optional: user avatar or email */}
              {user.photoURL ? (
                <img src={user.photoURL} alt="avatar" className="w-8 h-8 rounded-full border-2 border-electric-blue" />
              ) : (
                <span className="w-8 h-8 flex items-center justify-center rounded-full bg-electric-blue text-white font-bold uppercase">
                  {user.displayName ? user.displayName[0] : user.email ? user.email[0] : 'U'}
                </span>
              )}
            </>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 text-gray-300 hover:text-teal-300 transition-colors">
                Login
              </Link>
              <Link href="/signup" className="px-6 py-2 bg-teal-500 hover:bg-teal-400 text-white rounded-lg transition-colors">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-deep-navy/95 backdrop-blur-md py-4">
          <div className="container mx-auto px-4 flex flex-col space-y-4">
            <Link href="/services" className="text-soft-gray hover:text-electric-blue transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
              Services
            </Link>
            <Link href="/pricing" className="text-soft-gray hover:text-electric-blue transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
              Pricing
            </Link>
            <Link href="/about" className="text-soft-gray hover:text-electric-blue transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
              About
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className="btn-secondary w-full text-center py-2" onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </Link>
                <button
                  onClick={() => { auth.signOut(); setMobileMenuOpen(false); }}
                  className="w-full text-center py-2 text-gray-400 hover:text-red-400 transition-colors flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5m0 0a2 2 0 00-2-2h-4a2 2 0 00-2 2v14a2 2 0 002 2h4a2 2 0 002-2v-1" />
                  </svg>
                  Sign Out
                </button>
                <div className="flex justify-center mt-2">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="avatar" className="w-10 h-10 rounded-full border-2 border-electric-blue" />
                  ) : (
                    <span className="w-10 h-10 flex items-center justify-center rounded-full bg-electric-blue text-white font-bold uppercase">
                      {user.displayName ? user.displayName[0] : user.email ? user.email[0] : 'U'}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-secondary w-full text-center py-2" onClick={() => setMobileMenuOpen(false)}>
                  Login
                </Link>
                <Link href="/signup" className="btn-primary w-full text-center py-2" onClick={() => setMobileMenuOpen(false)}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
} 
