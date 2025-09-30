// @deprecated (2025-09-26): superseded by HomeHeroScanFirst. Kept for reference.
"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useOnboarding } from "@/contexts/OnboardingContext";

export default function SplitHero() {
  const { setTrack, setCurrentStep } = useOnboarding();
  
  const go = (t: "business" | "sports") => {
    setTrack(t);
    setCurrentStep("greeting");
    
    // Analytics event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent("homepage_card_click", { detail: { track: t } }));
    }
    
    // Smooth scroll to onboarding
    const el = document.getElementById("onboarding");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const floatAnimation = {
    y: [-4, 0, -4],
    transition: {
      duration: 7,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  };

  return (
    <div className="relative mx-auto max-w-6xl px-4 md:px-6 pt-16 pb-8 text-white min-h-[100svh]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Two Paths, One League — Pick Your Power
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
          Percy automates business. SkillSmith levels up your game. Both destroy your competition.
        </p>
      </motion.div>

      {/* Dual Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-16">
        {/* Percy / Business */}
        <motion.button
          aria-label="Automate my business with Percy"
          onClick={() => go("business")}
          className="group relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm md:backdrop-blur-xl p-8 shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 text-left overflow-hidden"
          animate={floatAnimation}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Gradient overlay for Percy */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative z-10">
            <div className="relative aspect-[4/3] w-full mb-6">
              <Image
                src="/images/Percy&Parker-skrblai.webp"
                alt="Percy with Parker — SKRBL AI business concierge"
                fill
                sizes="(max-width:768px) 100vw, 50vw"
                priority
                className="object-contain drop-shadow-2xl"
              />
            </div>
            
            <div className="text-center space-y-3">
              <div className="text-2xl md:text-3xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                Automate My Business
              </div>
              <div className="text-sm md:text-base text-gray-400 group-hover:text-gray-300 transition-colors">
                Branding • Publishing • Social Growth • Automation
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-white font-semibold shadow-lg group-hover:scale-105 transition-transform">
                <span>Launch Percy</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </div>
        </motion.button>

        {/* SkillSmith / Sports */}
        <motion.button
          aria-label="Level up my game with SkillSmith"
          onClick={() => go("sports")}
          className="group relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm md:backdrop-blur-xl p-8 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 text-left overflow-hidden"
          animate={floatAnimation}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Gradient overlay for SkillSmith */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative z-10">
            <div className="relative aspect-[4/3] w-full mb-6">
              <Image
                src="/images/SkillSmith-Athletics-skrblai.png"
                alt="SkillSmith — SKRBL AI sports coach"
                fill
                sizes="(max-width:768px) 100vw, 50vw"
                priority
                className="object-contain drop-shadow-2xl"
              />
            </div>
            
            <div className="text-center space-y-3">
              <div className="text-2xl md:text-3xl font-bold text-white group-hover:text-purple-300 transition-colors">
                Level Up My Game
              </div>
              <div className="text-sm md:text-base text-gray-400 group-hover:text-gray-300 transition-colors">
                Sports Analysis • Training • Nutrition • Performance
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-semibold shadow-lg group-hover:scale-105 transition-transform">
                <span>Launch SkillSmith</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </div>
        </motion.button>
      </div>

      {/* Bottom scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="text-center mt-12"
      >
        <p className="text-sm text-gray-500 mb-2">Choose your path above to get started</p>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-6 mx-auto"
        >
          <svg className="w-full h-full text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}