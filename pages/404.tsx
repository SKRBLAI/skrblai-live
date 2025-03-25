'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-deep-navy flex flex-col items-center justify-center text-center p-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-6xl font-bold text-electric-blue mb-4"
      >
        Oops! You found a broken route.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-2xl text-soft-gray mb-8"
      >
        Let's get you back on track.
      </motion.p>
      <div className="flex space-x-4">
        <Link
          href="/"
          className="btn-primary"
        >
          Go Home
        </Link>
        <Link
          href="/dashboard"
          className="btn-secondary"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
} 