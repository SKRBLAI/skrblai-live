"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

const pulseKeyframes = {
  idle: { scale: 1 },
  pulse: { scale: 1.08, boxShadow: "0 0 0 4px #00F5D4, 0 0 0 12px #0066FF22" },
};

export default function WaitlistPopup() {
  const [visible, setVisible] = useState(false);
  const [pulse, setPulse] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Hide on dashboard routes
    if (pathname && pathname.startsWith("/dashboard")) {
      setVisible(false);
      return;
    }
    setVisible(true);
  }, [pathname]);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 700);
    }, 8000);
    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.5 }}
        className="fixed bottom-8 right-6 z-50"
        style={{ pointerEvents: "auto" }}
      >
        <motion.div
          className="bg-gradient-to-br from-electric-blue to-teal-400 p-5 rounded-2xl shadow-glow flex flex-col items-center gap-3 border border-white/10"
          animate={pulse ? "pulse" : "idle"}
          variants={pulseKeyframes}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
        >
          <div className="font-bold text-lg text-white flex items-center gap-2">
            <span role="img" aria-label="Party">🎉</span> Join SKRBL Early!
          </div>
          <div className="text-white text-sm text-center max-w-xs">
            Be among the first to access Pixar-level AI tools. Secure your spot on the waitlist or request early access!
          </div>
          <div className="flex gap-3 mt-2">
            <Link href="/signup?source=waitlist" passHref legacyBehavior>
              <motion.a
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.97 }}
                className="px-5 py-2 rounded-lg glass-card text-electric-blue font-semibold hover:bg-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-electric-blue/40"
              >
                Join Waitlist
              </motion.a>
            </Link>
            <Link href="/contact?ref=early" passHref legacyBehavior>
              <motion.a
                whileHover={{ scale: 1.07 }}
                whileTap={{ scale: 0.97 }}
                className="px-5 py-2 rounded-lg glass-card text-teal-200 font-semibold hover:bg-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-teal-400/40"
              >
                Request Access
              </motion.a>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
