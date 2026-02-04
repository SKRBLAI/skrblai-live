"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Video, Activity, Shield, Users, ArrowRight } from "lucide-react";
import CosmicButton from "../shared/CosmicButton";
import CosmicHeading from "../shared/CosmicHeading";

export default function HomeHeroYouthSports() {
  const router = useRouter();

  const handleStartWithClip = () => {
    router.push('/athletics#skillsmith');
  };

  const handleStartDiagnostic = () => {
    router.push('/athletics#diagnostics');
  };

  return (
    <section className="relative z-10 min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          {/* Main Headline */}
          <CosmicHeading className="text-4xl md:text-6xl lg:text-7xl mb-6">
            A Safe Space to
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Train Smarter, Compete Calmer,
              <br />
              Grow Stronger
            </span>
          </CosmicHeading>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed"
          >
            AI-powered coaching for young athletes. Video analysis, mental toughness training, 
            and identity building in a <span className="text-green-400 font-semibold">parent-approved environment</span>.
          </motion.p>

          {/* Trust/Safety Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex flex-wrap items-center justify-center gap-4 px-6 py-3 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-full border border-green-400/30 mb-12"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-green-300 text-sm font-semibold">Kid-friendly</span>
            </div>
            <div className="hidden sm:block w-1 h-4 bg-green-400/30" />
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-green-400" />
              <span className="text-green-300 text-sm font-semibold">Parent-first</span>
            </div>
            <div className="hidden sm:block w-1 h-4 bg-green-400/30" />
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-400" />
              <span className="text-green-300 text-sm font-semibold">Not medical advice</span>
            </div>
          </motion.div>

          {/* Primary CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8"
          >
            {/* CTA 1: Start with a Clip */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="group"
            >
              <button
                onClick={handleStartWithClip}
                className="w-full h-full p-8 rounded-2xl bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border-2 border-cyan-400/40 hover:border-cyan-400/60 backdrop-blur-xl transition-all duration-300 text-left"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 group-hover:scale-110 transition-transform">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">Start with a Clip</h3>
                    <p className="text-gray-300 text-sm">
                      Upload game or practice footage. Get instant AI-powered feedback on technique, form, and improvement areas.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-cyan-400 font-semibold group-hover:gap-3 transition-all">
                  <span>Upload to SkillSmith</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </motion.div>

            {/* CTA 2: Start a Diagnostic */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="group"
            >
              <button
                onClick={handleStartDiagnostic}
                className="w-full h-full p-8 rounded-2xl bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-2 border-purple-400/40 hover:border-purple-400/60 backdrop-blur-xl transition-all duration-300 text-left"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 group-hover:scale-110 transition-transform">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2">Start a Diagnostic</h3>
                    <p className="text-gray-300 text-sm">
                      Assess fundamentals, mindset, and focus. Get personalized training recommendations and mental game strategies.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-purple-400 font-semibold group-hover:gap-3 transition-all">
                  <span>Take Assessment</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </button>
            </motion.div>
          </motion.div>

          {/* Supporting Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>Ages 7-18</span>
            </div>
            <div className="hidden sm:block w-1 h-4 bg-gray-600" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              <span>All sports supported</span>
            </div>
            <div className="hidden sm:block w-1 h-4 bg-gray-600" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
              <span>Parent dashboard included</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Visual Elements (Optional) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-3 gap-4 max-w-3xl mx-auto opacity-60"
        >
          <div className="text-center p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="text-3xl font-bold text-cyan-400 mb-1">1,200+</div>
            <div className="text-xs text-gray-400">Athletes trained</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="text-3xl font-bold text-purple-400 mb-1">15min</div>
            <div className="text-xs text-gray-400">Avg. analysis time</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="text-3xl font-bold text-green-400 mb-1">97%</div>
            <div className="text-xs text-gray-400">Parent approval</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
