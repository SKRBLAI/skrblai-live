'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center bg-deep-navy text-white">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-soft-gray mb-6">The page you're looking for doesn't exist.</p>
      <Link href="/">
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="bg-electric-blue text-white px-6 py-3 rounded-xl"
        >
          Back to Home
        </motion.button>
      </Link>
    </div>
  );
}
