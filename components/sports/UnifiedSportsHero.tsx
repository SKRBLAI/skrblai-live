'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Play, UserCheck, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  btnPrimary, 
  btnGhost, 
  heroCard, 
  h1ClampStrong, 
  h2ClampSub, 
  chip, 
  containerPad 
} from '../../styles/ui';
import GlowCarousel from '../common/GlowCarousel';
import SkillSmithPromptBar from './SkillSmithPromptBar';
import AgentChat from '../chat/AgentChat';

export interface UnifiedSportsHeroProps {
  headline?: string;
  highlight?: string;
  subhead?: string;
  keywords?: string[];
  images: { src: string; alt: string }[];
  onUploadClick?: () => void;
  onSampleAnalysisClick?: () => void;
  onParentPortalClick?: () => void;
}

export default function UnifiedSportsHero({
  headline = "Master Your Sport with",
  highlight = "AI Skill Smith",
  subhead = "Upload your game footage and get instant AI analysis, personalized training plans, and coach-level feedback from your personal Skill Smith.",
  keywords = ["Analysis", "Mental Health", "Nutrition", "Training Plans"],
  images,
  onUploadClick,
  onSampleAnalysisClick,
  onParentPortalClick
}: UnifiedSportsHeroProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative mb-16"
    >
      <div className={`relative max-w-7xl mx-auto ${containerPad}`}>
        <div className={`${heroCard} p-6 md:p-8`}>
          <div className="grid md:grid-cols-[1.05fr,0.95fr] gap-6 md:gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Headline + Subhead */}
              <div className="space-y-4">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className={`${h1ClampStrong} text-white`}
                >
                  {headline}{' '}
                  <span className="text-emerald-400">
                    {highlight}
                  </span>
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className={h2ClampSub}
                >
                  {subhead}
                </motion.p>
              </div>

              {/* CTA Trio */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <button
                  onClick={onUploadClick}
                  className={`${btnPrimary} w-full sm:w-auto flex items-center justify-center gap-2`}
                >
                  <Upload className="w-4 h-4" />
                  Upload Video
                </button>
                
                <button
                  onClick={onSampleAnalysisClick}
                  className={`${btnGhost} w-full sm:w-auto flex items-center justify-center gap-2`}
                >
                  <Play className="w-4 h-4" />
                  Sample Analysis
                </button>
                
                <button
                  onClick={onParentPortalClick}
                  className={`${btnGhost} w-full sm:w-auto flex items-center justify-center gap-2`}
                >
                  <UserCheck className="w-4 h-4" />
                  Parent Portal
                </button>
              </motion.div>

              {/* Keywords Row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-wrap gap-2"
              >
                {keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className={`${chip} text-white/80`}
                  >
                    {keyword}
                  </span>
                ))}
              </motion.div>

              {/* Prompt Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                data-upload-section
              >
                <SkillSmithPromptBar />
              </motion.div>

              {/* Mini-Chat Toggle */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <button
                  onClick={() => setIsChatOpen(!isChatOpen)}
                  className={`${btnGhost} w-full flex items-center justify-center gap-2`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat with SkillSmith</span>
                  {isChatOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {/* Collapsible Chat */}
                <AnimatePresence>
                  {isChatOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden mt-4"
                    >
                      <div className="max-h-[40vh] overflow-y-auto">
                        <AgentChat agentId="skillsmith" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Right Column - Carousel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <GlowCarousel 
                images={images && images.length ? images : [
                  { src: '/images/skillsmith-soccer-nobg-skrblai.png', alt: 'SkillSmith Soccer' },
                  { src: '/images/skillsmith-hoops-nobg-skrblai.png', alt: 'SkillSmith Hoops' },
                  { src: '/images/agents-skillsmith-nobg-skrblai.webp', alt: 'SkillSmith Coach' },
                ]}
                className="h-full min-h-[300px] md:min-h-[400px]"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}