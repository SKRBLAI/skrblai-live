'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Upload, Play, Users, Trophy, Zap, Star } from 'lucide-react';
import TypewriterText from '../shared/TypewriterText';
import CosmicButton from '../shared/CosmicButton';
import StatCounter from '../features/StatCounter';

interface SkillSmithStandaloneHeroProps {
  userType?: 'guest' | 'auth' | 'platform';
  freeScansRemaining?: number;
  onUploadClick?: () => void;
  onEmailCaptureClick?: () => void;
}

export default function SkillSmithStandaloneHero({ 
  userType = 'guest',
  freeScansRemaining = 5,
  onUploadClick,
  onEmailCaptureClick 
}: SkillSmithStandaloneHeroProps) {
  const [liveStats, setLiveStats] = useState({
    scansCompleted: 15847,
    athletesImproved: 3241,
    recordsBroken: 189
  });

  // Live stats animation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        scansCompleted: prev.scansCompleted + Math.floor(Math.random() * 3),
        athletesImproved: prev.athletesImproved + Math.floor(Math.random() * 2),
        recordsBroken: prev.recordsBroken + (Math.random() > 0.8 ? 1 : 0)
      }));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const typewriterWords = [
    "Level Up Your Game with AI! 🚀",
    "From Beginner to Beast Mode! 🦥",
    "Get Coach-Level Feedback Instantly! 🏆",
    "Master Any Sport with AI! ⚽🏀🏈"
  ];

  const isStandalone = userType === 'guest' || userType === 'auth';

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative mb-16"
    >
      {/* Cosmic Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-orange-400/5 via-red-500/5 to-pink-500/5 rounded-full blur-3xl animate-spin-slow" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Floating Glass Container */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="relative z-10"
        >
          {/* Animated glowing border */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 opacity-60 blur-2xl animate-pulse -z-10" />
          
          {/* Main Glass Panel */}
          <div className="relative bg-gradient-to-b from-gray-900/80 via-gray-800/70 to-gray-900/80 border border-orange-500/40 rounded-3xl backdrop-blur-xl overflow-hidden shadow-2xl">
            {/* Top Stats Bar (for standalone) */}
            {isStandalone && (
              <div className="border-b border-orange-500/20 bg-gray-900/50 px-6 py-4">
                <div className="flex flex-wrap justify-center gap-8 text-center">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-orange-400" />
                    <StatCounter 
                      end={liveStats.scansCompleted} 
                      suffix="+" 
                      label="Video Scans" 
                      isLive 
                      className="text-orange-400 font-bold"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-red-400" />
                    <StatCounter 
                      end={liveStats.athletesImproved} 
                      suffix="+" 
                      label="Athletes Improved" 
                      isLive 
                      className="text-red-400 font-bold"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <StatCounter 
                      end={liveStats.recordsBroken} 
                      suffix="+" 
                      label="Records Broken" 
                      isLive 
                      className="text-yellow-400 font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="p-8 sm:p-12">
              <div className="flex flex-col lg:flex-row items-center gap-10">
                {/* SkillSmith Image */}
                <motion.div 
                  className="shrink-0 w-48 h-48 sm:w-64 sm:h-64 lg:w-72 lg:h-72 relative"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-full blur-xl" />
                  <Image
                    src="/images/agents-skillsmith-nobg-skrblai.webp"
                    alt="SkillSmith AI Sports Analyst"
                    fill
                    className="object-contain relative z-10"
                    priority
                  />
                </motion.div>

                {/* Content */}
                <div className="text-center lg:text-left flex-1">
                  {/* Main Headline */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                  >
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6">
                      <span className="text-orange-400">SkillSmith</span>
                      <br />
                      <span className="text-white">Sports Analysis</span>
                    </h1>
                  </motion.div>

                  {/* Typewriter Subtitle */}
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                    className="text-center lg:text-left mb-6"
                  >
                    <div className="text-5xl md:text-6xl lg:text-7xl font-black mb-4">
                      <TypewriterText
                        words={typewriterWords}
                        typeSpeed={60}
                        deleteSpeed={40}
                        delaySpeed={1500}
                        cosmicMode={true}
                        actionWords={["Level", "Beast", "Coach-Level", "Master"]}
                        className="font-extrabold"
                      />
                    </div>
                    
                    {isStandalone && (
                      <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 1.2, duration: 0.5 }}
                        className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-400/30 rounded-2xl p-4 mb-4 backdrop-blur-sm"
                      >
                        <p className="text-lg md:text-xl font-bold text-white mb-1">
                          🏆 <span className="text-orange-400">{freeScansRemaining} FREE</span> AI Sports Analysis!
                        </p>
                        <p className="text-sm text-orange-200">Perfect for kids, teens, and adults • No trainer needed to start!</p>
                      </motion.div>
                    )}
                  </motion.h1>

                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.0, duration: 0.6 }}
                    className="text-gray-300 text-lg md:text-xl mb-8 max-w-2xl mx-auto lg:mx-0"
                  >
                    🤖 Upload your video (30 sec) → Get AI analysis → Improve your game! 
                    <br />
                    <span className="text-orange-300 font-semibold">
                      ✨ Analysis + Mental Health + Nutrition + Training Plans
                    </span>
                  </motion.p>

                  {/* CTAs */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                  >
                    <CosmicButton
                      variant="primary"
                      size="xl"
                      onClick={onUploadClick}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-8 py-4 text-lg"
                    >
                      <Upload className="w-6 h-6 mr-3" />
                      Upload Your Video
                    </CosmicButton>

                    {userType === 'guest' && (
                      <CosmicButton
                        variant="outline"
                        size="xl"
                        onClick={onEmailCaptureClick}
                        className="border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-black font-bold px-8 py-4 text-lg"
                      >
                        <Users className="w-6 h-6 mr-3" />
                        Get 10 More + Save 20%
                      </CosmicButton>
                    )}

                    {userType === 'platform' && (
                      <Link href="/services/skillsmith" className="text-orange-400 hover:text-orange-300 font-semibold text-lg flex items-center">
                        <Play className="w-5 h-5 mr-2" />
                        Explore All Sports Features →
                      </Link>
                    )}
                  </motion.div>

                  {/* Trust Indicators */}
                  {isStandalone && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.4, duration: 0.6 }}
                      className="mt-8 text-center lg:text-left"
                    >
                      <div className="text-sm text-orange-200 mb-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg p-3 border border-orange-400/20">
                        ✅ No signup required • ✅ Works for ANY sport • ✅ Kid-friendly results
                      </div>
                      <div className="text-xs text-gray-400">
                        🏀 Basketball • ⚽ Soccer • 🏈 Football • 🎾 Tennis • 🏐 Volleyball • 🏓 More!
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
} 