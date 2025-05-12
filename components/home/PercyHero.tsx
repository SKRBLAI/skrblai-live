"use client";
import { motion } from "framer-motion";
import PercyAvatar from "./PercyAvatar";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { UniversalPromptBar } from "@/components/ui";

export default function PercyHero() {
  const router = useRouter();
  const featuresRef = useRef<null | HTMLElement>(null);
  const [showIntake, setShowIntake] = useState(false);

  // Handler for Explore Features
  const handleExplore = () => {
    const el = document.getElementById("features");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      // fallback: route to /features
      router.push("/features");
    }
  };

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
        {/* Percy avatar with tilt/float animation */}
        <motion.div
          animate={{ rotate: [0, 2, -2, 0], y: [0, -8, 0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        >
          <PercyAvatar size="lg" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="text-4xl md:text-5xl font-extrabold text-center mb-2"
        >
          Hi, I'm Percy, your AI assistant for <span className="text-skbl">SKRBL AI</span>.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-lg md:text-xl text-gray-200 text-center mb-6"
        >
          Automate content, marketing, and business workflows with next-gen AI.
        </motion.p>
        <div className="flex flex-col md:flex-row gap-4 w-full justify-center">
          <motion.button
            whileHover={{ scale: 1.08, boxShadow: "0 0 24px #14ffe9, 0 0 12px #a259ff" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowIntake(true)}
            className="flex-1 px-8 py-3 rounded-lg bg-gradient-to-r from-teal-400 to-purple-500 text-white font-bold text-lg shadow-glow border-2 border-teal-400/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 transition-all glass-card animate-pulse"
            style={{ minWidth: 180 }}
          >
            Let's Get Started
          </motion.button>
          {showIntake && (
            <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="relative bg-white rounded-xl shadow-2xl p-0 max-w-lg w-full">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-teal-500 text-2xl font-bold z-10"
                  onClick={() => setShowIntake(false)}
                  aria-label="Close"
                >
                  &times;
                </button>
                <UniversalPromptBar 
                  title="Get Started with SKRBL AI"
                  description="Tell us what you need or upload a file to get started."
                  showPrompt={true}
                  promptLabel="What would you like to accomplish?"
                  placeholder="e.g., Create a content strategy for my website, Generate social media posts..."
                  acceptedFileTypes=".pdf,.doc,.docx,.txt,.jpg,.png"
                  fileCategory="input"
                  intentType="starter"
                  buttonText="Submit"
                  theme="light"
                  className="p-6"
                  onComplete={(data) => {
                    console.log('Completed with data:', data);
                    setTimeout(() => setShowIntake(false), 3000);
                  }}
                />
              </div>
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.06, boxShadow: "0 0 16px #14ffe9, 0 0 8px #a259ff" }}
            whileTap={{ scale: 0.97 }}
            onClick={handleExplore}
            className="flex-1 px-8 py-3 rounded-lg bg-white/10 text-white font-semibold text-lg border-2 border-teal-400/40 shadow-md glass-card hover:bg-white/20 transition-all"
            style={{ minWidth: 180 }}
          >
            Explore Features
          </motion.button>
        </div>
      </motion.div>
    </section>
  );
}
