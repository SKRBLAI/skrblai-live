"use client";
import { motion, AnimatePresence } from "framer-motion";
import PercyAvatar from "./PercyAvatar";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UniversalPromptBar } from "@/components/ui";

export default function PercyHero() {
  const router = useRouter();
  const [showIntake, setShowIntake] = useState(false);

  const handleExplore = () => {
    const el = document.getElementById("features");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/features");
    }
  };

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[80vh] py-8 px-4 z-10">
      <AnimatePresence>
        {/* Animated floating icons */}
        <motion.div
          className="absolute left-[10%] top-[15%] text-4xl opacity-80"
          animate={{ y: [0, -16, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        >🧠</motion.div>
        <motion.div
          className="absolute right-[10%] top-[25%] text-4xl opacity-80"
          animate={{ y: [0, 18, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 3.6, ease: "easeInOut" }}
        >⚡</motion.div>
        <motion.div
          className="absolute left-[15%] bottom-[15%] text-4xl opacity-80"
          animate={{ y: [0, -12, 0], opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 4.3, ease: "easeInOut" }}
        >📈</motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 150, delay: 0.2 }}
          className="glass-card max-w-xl w-full mx-auto p-10 rounded-2xl shadow-2xl border border-teal-400/40 backdrop-blur-lg bg-gradient-to-b from-white/10 to-white/5 flex flex-col items-center gap-6 relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col items-center w-full gap-6"
          >
            {/* Percy avatar and prompt bar with animation */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col items-center w-full gap-6"
            >
              {/* Percy avatar with floating animation */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, rotate: [0, 2, -2, 0], y: [0, -8, 0, 8, 0] }}
                transition={{
                  duration: 0.8,
                  delay: 0.4,
                  rotate: {
                    repeat: Infinity,
                    duration: 4,
                    ease: "linear"
                  },
                  y: {
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut"
                  }
                }}
                className="w-32 h-32 relative"
              >
                <PercyAvatar size="lg" />
              </motion.div>

              {/* Title and description */}
              <motion.h1
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.7 }}
                className="text-4xl md:text-5xl font-extrabold text-center mb-2"
              >
                Hi, I&apos;m Percy, your AI assistant for <span className="text-skbl">SKRBL AI</span>.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="text-lg md:text-xl text-gray-200 text-center mb-6"
              >
                Automate content, marketing, and business workflows with next-gen AI.
              </motion.p>

              {/* Universal Prompt Bar */}
              <UniversalPromptBar
                title="How can I help you today?"
                description="Ask me anything or upload a file to get started"
                showPrompt={true}
                promptLabel="What would you like to accomplish?"
                placeholder="e.g., Create a content strategy, Generate social media posts..."
                theme="dark"
                compact={true}
              />

              {/* Action buttons */}
              <div className="flex flex-col md:flex-row gap-4 w-full justify-center mt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowIntake(true)}
                  className="px-8 py-3 rounded-lg bg-gradient-to-r from-teal-400 to-purple-500 text-white font-bold text-lg"
                >
                  Let's Get Started
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleExplore}
                  className="px-8 py-3 rounded-lg bg-white/10 text-white font-semibold text-lg"
                >
                  Explore Features
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Modal for intake form */}
        {showIntake && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-teal-500 text-2xl"
                onClick={() => setShowIntake(false)}
              >
                ×
              </button>
              <UniversalPromptBar 
                title="Get Started with SKRBL AI"
                description="Tell us what you need or upload a file to get started."
                showPrompt={true}
                promptLabel="What would you like to accomplish?"
                placeholder="e.g., Create a content strategy, Generate social media posts..."
                theme="light"
                onComplete={(data) => {
                  console.log('Completed:', data);
                  setTimeout(() => setShowIntake(false), 2000);
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
