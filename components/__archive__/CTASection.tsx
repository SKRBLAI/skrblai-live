'use client';

import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="relative py-20 bg-gradient-to-br from-deep-navy to-electric-blue/20">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold text-white mb-6">
          Ready to Transform Your Business?
        </h2>
        <p className="text-lg text-gray-200 mb-8">
          Join thousands of businesses leveraging SKRBL AI to automate and scale their operations.
        </p>
        <div className="space-x-4">
          <Link
            href="/signup"
            className="inline-block px-8 py-3 bg-teal-500 hover:bg-teal-400 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
          >
            Get Started
          </Link>
          <Link
            href="/demo"
            className="inline-block px-8 py-3 border-2 border-teal-500 text-teal-500 hover:bg-teal-500 hover:text-white font-semibold rounded-lg transition-all transform hover:scale-105"
          >
            Request Demo
          </Link>
        </div>
      </div>
      <div className="absolute inset-0 bg-noise-pattern opacity-10 pointer-events-none" />
    </section>
  );
}