"use client";
import { motion } from "framer-motion";
import PercyAvatar from "./PercyAvatar";

export default function PercyHero() {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[70vh] py-16 px-4 z-10">
      {/* Animated floating icons */}
      <motion.div
        className="absolute left-8 top-8 text-4xl"
        animate={{ y: [0, -16, 0] }}
        transition={{ repeat: Infinity, duration: 3 }}
      >🧠</motion.div>
      <motion.div
        className="absolute right-8 top-20 text-4xl"
        animate={{ y: [0, 18, 0] }}
        transition={{ repeat: Infinity, duration: 2.6 }}
      >⚡</motion.div>
      <motion.div
        className="absolute left-1/2 bottom-8 text-4xl"
        animate={{ y: [0, -12, 0] }}
        transition={{ repeat: Infinity, duration: 3.3 }}
      >📈</motion.div>

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 150, delay: 0.2 }}
        className="glass-card max-w-xl w-full mx-auto p-10 rounded-2xl shadow-2xl border border-teal-400/40 backdrop-blur-lg bg-white/10 flex flex-col items-center gap-6"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
        >
          <PercyAvatar size="lg" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="text-4xl md:text-5xl font-extrabold text-center bg-gradient-to-r from-purple-300 via-teal-400 to-purple-500 bg-clip-text text-transparent mb-2 drop-shadow-glow"
        >
          Hi, I’m Percy, your AI assistant for <span className="text-skbl">SKRBL AI</span>.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-lg md:text-xl text-gray-200 text-center mb-6"
        >
          Automate content, marketing, and business workflows with next-gen AI.
        </motion.p>
        <motion.button
          whileHover={{ scale: 1.08, boxShadow: "0 0 24px #14ffe9, 0 0 12px #a259ff" }}
          className="px-8 py-3 rounded-lg bg-gradient-to-r from-teal-400 to-purple-500 text-white font-bold text-lg shadow-glow focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 transition-all"
        >
          Let’s Get Started
        </motion.button>
      </motion.div>
    </section>
  );
}
