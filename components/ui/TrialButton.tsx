"use client";
import { motion } from "framer-motion";
import Link from "next/link";

// Cosmic CTA Standard: Use scale 1.08/0.97, cosmic boxShadow, spring transition for all major CTAs.
export default function TrialButton({ className = "" }: { className?: string }) {
  return (
    <div className="w-full max-w-sm mx-auto">
      <Link href="/sign-up" passHref legacyBehavior>
        <motion.a
          whileHover={{ scale: 1.02, boxShadow: "0 0 36px #30D5C8, 0 0 72px #e879f9" }}
          whileTap={{ scale: 0.98, boxShadow: "0 0 52px #30D5C8" }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className={`relative w-full inline-flex items-center justify-center px-6 py-3 rounded-xl font-bold text-base sm:text-lg bg-gradient-to-r from-fuchsia-500 via-blue-600 to-teal-400 text-white shadow-[0_0_36px_#30D5C8] border-2 border-fuchsia-400/70 focus:outline-none focus:ring-4 focus:ring-fuchsia-400/60 focus:ring-offset-2 focus:ring-offset-black transition-all duration-300 backdrop-blur-md cosmic-glow ${className}`}
          aria-label="Start your 3-day free trial"
        >
          <span className="relative z-10 flex items-center justify-center text-center">
            🚀 Start 3-Day Free Trial
          </span>
          {/* Futuristic animated border effect */}
          <span className="absolute inset-0 rounded-xl pointer-events-none animate-pulse border-2 border-cyan-400/40 shadow-[0_0_40px_10px_#30D5C8AA,0_0_80px_20px_#e879f966]" />
        </motion.a>
      </Link>
    </div>
  );
}
