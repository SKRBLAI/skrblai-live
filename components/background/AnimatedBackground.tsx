"use client";
import { motion } from "framer-motion";

export default function AnimatedBackground() {
  // Simple floating particles/constellations
  return (
    <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none overflow-hidden">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-teal-400/20 shadow-lg"
          style={{
            width: `${Math.random() * 6 + 6}px`,
            height: `${Math.random() * 6 + 6}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            filter: 'blur(1.5px)'
          }}
          animate={{
            y: [0, Math.random() * 40 - 20, 0],
            x: [0, Math.random() * 40 - 20, 0],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: Math.random() * 5 + 4,
            repeat: Infinity,
            repeatType: "mirror",
            delay: Math.random() * 2
          }}
        />
      ))}
    </div>
  );
}
