"use client";
import { motion } from "framer-motion";
import Link from "next/link";

// Cosmic CTA Standard: Use scale 1.08/0.97, cosmic boxShadow, spring transition for all major CTAs.
export default function TrialButton({ className = "" }: { className?: string }) {
  return (
    <div className="w-full max-w-sm mx-auto">
      <Link href="/" passHref legacyBehavior>
        <motion.a
          whileHover={{ scale: 1.02, boxShadow: "0 0 36px #30D5C8, 0 0 72px #e879f9" }}
          className={`block w-full px-8 py-4 text-center text-lg font-bold text-white bg-gradient-to-r from-cyan-400 to-fuchsia-400 rounded-2xl shadow-glow border border-white/20 backdrop-blur-sm hover:from-cyan-300 hover:to-fuchsia-300 transition-all duration-300 ${className}`}
        >
          <span className="drop-shadow-md">🚀 Start Free Trial</span>
        </motion.a>
      </Link>
    </div>
  );
}
