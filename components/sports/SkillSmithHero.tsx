'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Upload, Play, UserCheck } from 'lucide-react';
import Image from 'next/image';
import { getButtonClass, getCardClass, cn } from '../../styles/ui';
import SkillSmithPromptBar from './SkillSmithPromptBar';
import SkillSmithChat from './SkillSmithChat';

interface SkillSmithHeroProps {
  onUploadClick?: () => void;
  onSampleAnalysisClick?: () => void;
  onParentPortalClick?: () => void;
}

export default function SkillSmithHero({
  onUploadClick,
  onSampleAnalysisClick,
  onParentPortalClick
}: SkillSmithHeroProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative mb-16"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Headline + Subcopy */}
            <div className="space-y-6">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight"
              >
                Master Your Sport with{' '}
                <span className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  AI Skill Smith
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl md:text-2xl text-slate-300 leading-relaxed max-w-2xl"
              >
                Upload your game footage and get instant AI analysis, personalized training plans, and competitive edge coaching from your personal Skill Smith.
              </motion.p>
            </div>

            {/* Trio of Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button
                onClick={onUploadClick}
                className={cn(
                  getButtonClass('primary'),
                  'flex items-center gap-2 text-lg px-8 py-4'
                )}
              >
                <Upload className="w-5 h-5" />
                Upload Video
              </button>
              
              <button
                onClick={onSampleAnalysisClick}
                className={cn(
                  getButtonClass('ghost'),
                  'flex items-center gap-2 text-lg px-8 py-4'
                )}
              >
                <Play className="w-5 h-5" />
                See Sample Analysis
              </button>
              
              <button
                onClick={onParentPortalClick}
                className={cn(
                  getButtonClass('neon'),
                  'flex items-center gap-2 text-lg px-6 py-4'
                )}
              >
                <UserCheck className="w-5 h-5" />
                Parent Portal (Beta)
              </button>
            </motion.div>

            {/* Visual Prompt Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <SkillSmithPromptBar />
            </motion.div>

            {/* Skill Smith Chat */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <SkillSmithChat />
            </motion.div>
          </div>

          {/* Right Column - Card Container with Skill Smith Artwork */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className={cn(getCardClass('neon'), 'p-8 text-center')}>
              {/* Carousel-ready container */}
              <div className="relative aspect-square max-w-md mx-auto">
                <Image
                  src="/images/agents-skillsmith-nobg-skrblai.webp"
                  alt="Skill Smith AI Coach"
                  fill
                  className="object-contain rounded-2xl"
                  priority
                  onError={(e) => {
                    // Fallback to placeholder if image fails
                    e.currentTarget.style.display = 'none';
                  }}
                />
                
                {/* Fallback content if image doesn't load */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-2xl backdrop-blur-sm">
                  <div className="text-center space-y-4">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-r from-green-400 to-blue-400 rounded-full flex items-center justify-center">
                      <span className="text-4xl">🏆</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Skill Smith AI</h3>
                      <p className="text-slate-300">Your Personal Sports Coach</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Card Title */}
              <div className="mt-6 space-y-2">
                <h3 className="text-2xl font-bold text-white">Meet Your Skill Smith</h3>
                <p className="text-slate-300">
                  AI-powered sports analysis and coaching tailored to your game
                </p>
              </div>
              
              {/* Features */}
              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-400/20">
                  <div className="text-green-400 font-semibold">Instant Analysis</div>
                  <div className="text-slate-400">Real-time feedback</div>
                </div>
                <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-400/20">
                  <div className="text-blue-400 font-semibold">Custom Plans</div>
                  <div className="text-slate-400">Personalized training</div>
                </div>
                <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-400/20">
                  <div className="text-purple-400 font-semibold">All Sports</div>
                  <div className="text-slate-400">Universal coaching</div>
                </div>
                <div className="text-center p-3 bg-orange-500/10 rounded-lg border border-orange-400/20">
                  <div className="text-orange-400 font-semibold">All Ages</div>
                  <div className="text-slate-400">Kids to pros</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}