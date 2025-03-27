// pages/500.tsx
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Custom500() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center bg-deep-navy text-white">
      <h1 className="text-4xl font-bold mb-4">500 - Server-side error occurred</h1>
      <p className="text-soft-gray mb-6">Please try again later or contact support.</p>
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
