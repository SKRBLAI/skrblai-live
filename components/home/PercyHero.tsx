"use client";
import { motion, AnimatePresence } from "framer-motion";
import PercyAvatar from "./PercyAvatar";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { UniversalPromptBar, PercyTimeline, AgentStatsPanel } from "@/components/ui";
import { usePercyTimeline } from "@/components/hooks/usePercyTimeline";

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

  const [timeline, refreshTimeline] = usePercyTimeline();

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[80vh] py-8 px-4 z-10 bg-transparent">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 150, delay: 0.2 }}
        className="glass-card max-w-xl w-full mx-auto p-10 rounded-2xl shadow-2xl border border-teal-400/40 backdrop-blur-lg bg-white/10 flex flex-col items-center gap-6 relative z-10"
      >
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="text-4xl md:text-5xl font-extrabold text-center mb-2"
        >
          SKRBL AI: Unleash the Power of Automated Intelligence
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-lg md:text-xl text-gray-200 text-center mb-6"
        >
          Your next-gen platform for creative automation, smart business workflows, and effortless productivity—powered by AI, crafted for visionaries.
        </motion.p>
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
    </section>
  );
}
