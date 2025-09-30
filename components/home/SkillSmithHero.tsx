// @deprecated (2025-09-26): superseded by HomeHeroScanFirst. Kept for reference.
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import WorkflowLaunchButton from '../agents/WorkflowLaunchButton';
import CosmicHeading from '../shared/CosmicHeading';

export default function SkillSmithHero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative mb-24"
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Animated glowing border */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-orange-500 via-fuchsia-500 to-red-600 opacity-40 blur-2xl animate-pulse -z-10" />
        <div className="relative z-10 bg-gradient-to-b from-[#1f2937]/60 to-[#111827]/60 border border-orange-500/30 rounded-3xl p-8 sm:p-12 backdrop-blur-xl overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            {/* Illustration */}
            <div className="shrink-0 w-40 h-40 sm:w-56 sm:h-56 lg:w-64 lg:h-64 relative">
              <Image
                src="/images/agents-skillsmith-nobg-skrblai.webp"
                alt="Skill Smith AI Agent"
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Text + CTAs */}
            <div className="text-center lg:text-left flex-1">
              <CosmicHeading level={2} className="text-4xl md:text-6xl font-extrabold mb-4">
                <span className="text-orange-400">Skill Smith</span> – Forge Your Victory
              </CosmicHeading>
              <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-2xl mx-auto lg:mx-0">
                Your personal AI performance forger. Upload your data or start from scratch and get a pro-grade training, nutrition and mental edge program in minutes.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <WorkflowLaunchButton
                  agentId="skillsmith"
                  agentName="Skill Smith"
                  superheroName="Skill Smith the Sports Performance Forger"
                  hasWorkflow
                  requiresPremium={false}
                  workflowCapabilities={['performance_analysis','training_programs','nutrition_planning']}
                  variant="primary"
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  initialPrompt="Analyze my athletic profile and craft a personalized plan."
                />
                <Link href="/sports/upload" className="text-orange-400 font-semibold flex items-center justify-center underline">
                  Upload Training Data →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}