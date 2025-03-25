'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export function CTASection() {
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="bg-deep-navy/80 p-12 rounded-xl border border-electric-blue/20 text-center">
        <h2 className="text-3xl font-bold mb-6 text-electric-blue">
          Ready to Transform Your Business?
        </h2>
        <p className="text-soft-gray/80 mb-8">
          Join thousands of businesses using SKRBL AI to power their marketing
        </p>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Link
            href="/signup"
            className="btn-primary inline-block"
          >
            Get Started Free
          </Link>
        </motion.div>
      </div>
    </section>
  );
} 