import Link from 'next/link';
import { useState } from 'react';
import Image from 'next/image';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-deep-navy/90 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
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
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/services" className="text-soft-gray hover:text-electric-blue transition-colors">
            Services
          </Link>
          <Link href="/pricing" className="text-soft-gray hover:text-electric-blue transition-colors">
            Pricing
          </Link>
          <Link href="/about" className="text-soft-gray hover:text-electric-blue transition-colors">
            About
          </Link>
          <Link href="/login" className="btn-secondary">
            Login
          </Link>
          <Link href="/signup" className="btn-primary">
            Sign Up
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
            <Link href="/login" className="btn-secondary w-full text-center py-2" onClick={() => setMobileMenuOpen(false)}>
              Login
            </Link>
            <Link href="/signup" className="btn-primary w-full text-center py-2" onClick={() => setMobileMenuOpen(false)}>
              Sign Up
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
} 