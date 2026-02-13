'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Brain, Shield, Activity, Target, Users, ChevronDown, ChevronUp } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import CardShell from '@/components/ui/CardShell';
import CosmicHeading from '@/components/shared/CosmicHeading';
import CosmicButton from '@/components/shared/CosmicButton';

type SportType = 'basketball' | 'soccer' | 'baseball' | 'football' | 'volleyball' | 'other';
type Gender = 'male' | 'female' | 'prefer-not-to-say';
type AgeGroup = '7-10' | '11-13' | '14-16' | '17-18';

export default function AthleticsPage() {
  // User profile for diagnostics
  const [sport, setSport] = useState<SportType | null>(null);
  const [gender, setGender] = useState<Gender | null>(null);
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Refs for anchor scrolling
  const skillsmithRef = useRef<HTMLDivElement>(null);
  const diagnosticsRef = useRef<HTMLDivElement>(null);

  // Handle anchor links from homepage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    
    if (hash === '#skillsmith' && skillsmithRef.current) {
      setTimeout(() => {
        skillsmithRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else if (hash === '#diagnostics' && diagnosticsRef.current) {
      setTimeout(() => {
        diagnosticsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, []);

  // Load user preferences from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedSport = localStorage.getItem('athlete_sport') as SportType | null;
    const savedGender = localStorage.getItem('athlete_gender') as Gender | null;
    const savedAge = localStorage.getItem('athlete_age') as AgeGroup | null;
    
    if (savedSport) setSport(savedSport);
    if (savedGender) setGender(savedGender);
    if (savedAge) setAgeGroup(savedAge);
  }, []);

  // Save preferences
  const savePreferences = () => {
    if (typeof window === 'undefined') return;
    if (sport) localStorage.setItem('athlete_sport', sport);
    if (gender) localStorage.setItem('athlete_gender', gender);
    if (ageGroup) localStorage.setItem('athlete_age', ageGroup);
  };

  useEffect(() => {
    savePreferences();
  }, [sport, gender, ageGroup]);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <PageLayout>
      <div className="min-h-screen relative">
        {/* Hero Section */}
        <section className="relative z-10 pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <CosmicHeading className="text-4xl md:text-6xl mb-6">
                Youth Performance
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  + Wellness
                </span>
              </CosmicHeading>
              
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                Train smarter, compete calmer, grow stronger. Built for young athletes, parents, and coaches.
              </p>

              {/* SAFE Trust Bar */}
              <div className="inline-flex flex-wrap items-center justify-center gap-4 px-6 py-3 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-full border border-green-400/30 mb-8">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  <span className="text-green-300 font-semibold">Kid-friendly</span>
                </div>
                <div className="w-1 h-4 bg-green-400/30" />
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-400" />
                  <span className="text-green-300 font-semibold">Parent-first</span>
                </div>
                <div className="w-1 h-4 bg-green-400/30" />
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  <span className="text-green-300 font-semibold">Not medical advice</span>
                </div>
              </div>
            </motion.div>

            {/* 3 Main Product Tiles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {/* SkillSmith Tile */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                ref={skillsmithRef}
                id="skillsmith"
              >
                <CardShell className="p-6 h-full hover:border-cyan-400/50 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-500">
                      <Video className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">SkillSmith</h3>
                  </div>
                  
                  <p className="text-gray-300 mb-4">
                    Video breakdowns + drills. Upload clips, get AI-powered feedback, improve technique.
                  </p>

                  {/* Motion Overlay Beta Teaser */}
                  <div className="mb-4 p-3 bg-purple-500/10 border border-purple-400/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-purple-400 uppercase">Beta</span>
                      <span className="text-sm font-semibold text-purple-300">Motion Overlay</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Frame-by-frame analysis with movement tracking overlays (coming soon).
                    </p>
                  </div>

                  <CosmicButton
                    href="/sports"
                    variant="primary"
                    className="w-full"
                  >
                    Upload Clip
                  </CosmicButton>
                </CardShell>
              </motion.div>

              {/* NTNTNS × MSTRY Tile */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <CardShell className="p-6 h-full hover:border-purple-400/50 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">NTNTNS × MSTRY</h3>
                  </div>
                  
                  <p className="text-gray-300 mb-4">
                    Mindset, focus, composure under pressure. Build mental toughness that translates to performance.
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-2 h-2 bg-purple-400 rounded-full" />
                      <span>Focus assessment</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-2 h-2 bg-purple-400 rounded-full" />
                      <span>Confidence building</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-2 h-2 bg-purple-400 rounded-full" />
                      <span>Pre-game routines</span>
                    </div>
                  </div>

                  <CosmicButton
                    href="/sports#ntntns"
                    variant="secondary"
                    className="w-full"
                  >
                    Take Assessment
                  </CosmicButton>
                </CardShell>
              </motion.div>

              {/* SAFE Tile */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <CardShell className="p-6 h-full hover:border-green-400/50 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-500">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">SAFE</h3>
                  </div>
                  
                  <p className="text-gray-300 mb-4">
                    Safe Athlete-Focused Environment. Parent portal, privacy standards, age-appropriate guidance.
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <span>Parent dashboard access</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <span>Privacy-first platform</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <span>Age-appropriate content</span>
                    </div>
                  </div>

                  <CosmicButton
                    href="/dashboard/parent"
                    variant="outline"
                    className="w-full border-green-400/50 text-green-300 hover:bg-green-500/10"
                  >
                    Parent Portal
                  </CosmicButton>
                </CardShell>
              </motion.div>
            </div>

            {/* Diagnostics Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              ref={diagnosticsRef}
              id="diagnostics"
              className="mb-16"
            >
              <CardShell className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">Performance Diagnostics</h2>
                  <p className="text-gray-300 max-w-2xl mx-auto">
                    Comprehensive assessments to understand your athlete's current state and growth opportunities.
                  </p>
                </div>

                {/* Athlete Profile Setup */}
                <div className="max-w-3xl mx-auto mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4">Athlete Profile</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Sport Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Sport</label>
                      <select
                        value={sport || ''}
                        onChange={(e) => setSport(e.target.value as SportType)}
                        className="w-full px-4 py-2 bg-black/20 border border-gray-600/40 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                      >
                        <option value="">Select sport</option>
                        <option value="basketball">Basketball</option>
                        <option value="soccer">Soccer</option>
                        <option value="baseball">Baseball</option>
                        <option value="football">Football</option>
                        <option value="volleyball">Volleyball</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Gender Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Gender</label>
                      <select
                        value={gender || ''}
                        onChange={(e) => setGender(e.target.value as Gender)}
                        className="w-full px-4 py-2 bg-black/20 border border-gray-600/40 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>

                    {/* Age Group Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Age Group</label>
                      <select
                        value={ageGroup || ''}
                        onChange={(e) => setAgeGroup(e.target.value as AgeGroup)}
                        className="w-full px-4 py-2 bg-black/20 border border-gray-600/40 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                      >
                        <option value="">Select age</option>
                        <option value="7-10">7-10 years</option>
                        <option value="11-13">11-13 years</option>
                        <option value="14-16">14-16 years</option>
                        <option value="17-18">17-18 years</option>
                      </select>
                    </div>
                  </div>

                  {/* Profile saved indicator */}
                  {sport && gender && ageGroup && (
                    <div className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 px-4 py-2 rounded-lg">
                      <Target className="w-4 h-4" />
                      <span>Profile saved • Diagnostics personalized</span>
                    </div>
                  )}
                </div>

                {/* Diagnostic Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* FIT Diagnostic */}
                  <div className="border border-gray-600/40 rounded-xl p-6 bg-gradient-to-br from-blue-900/20 to-cyan-900/20">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-bold text-white mb-2">FIT</h4>
                        <p className="text-sm text-gray-400">Fundamental Integration Test</p>
                      </div>
                      <button
                        onClick={() => toggleSection('fit')}
                        className="text-cyan-400 hover:text-cyan-300"
                      >
                        {expandedSection === 'fit' ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    <AnimatePresence>
                      {expandedSection === 'fit' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="text-gray-300 text-sm mb-4">
                            Assess foundational movement patterns, coordination, and sport-specific skills. 
                            Identifies areas for technique improvement and drill recommendations.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex items-center gap-2 mb-4">
                      <Activity className="w-5 h-5 text-cyan-400" />
                      <span className="text-sm text-gray-400">~15 min assessment</span>
                    </div>

                    <button
                      disabled={!sport || !gender || !ageGroup}
                      className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {!sport || !gender || !ageGroup ? 'Complete Profile First' : 'Start FIT'}
                    </button>
                  </div>

                  {/* Mindset & Focus Check */}
                  <div className="border border-gray-600/40 rounded-xl p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-bold text-white mb-2">Mindset & Focus Check</h4>
                        <p className="text-sm text-gray-400">Mental readiness assessment</p>
                      </div>
                      <button
                        onClick={() => toggleSection('mindset')}
                        className="text-purple-400 hover:text-purple-300"
                      >
                        {expandedSection === 'mindset' ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    <AnimatePresence>
                      {expandedSection === 'mindset' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="text-gray-300 text-sm mb-4">
                            Evaluate focus, confidence, composure, and mental resilience. 
                            Provides personalized strategies for pre-game preparation and pressure management.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="flex items-center gap-2 mb-4">
                      <Brain className="w-5 h-5 text-purple-400" />
                      <span className="text-sm text-gray-400">~10 min assessment</span>
                    </div>

                    <button
                      disabled={!sport || !gender || !ageGroup}
                      className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-400 hover:to-pink-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {!sport || !gender || !ageGroup ? 'Complete Profile First' : 'Start Check'}
                    </button>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="mt-8 p-4 bg-orange-500/10 border border-orange-400/30 rounded-lg">
                  <p className="text-sm text-gray-300 text-center">
                    <strong className="text-orange-400">Important:</strong> These diagnostics are performance and readiness coaching tools. 
                    They are <strong>not medical or mental health diagnostics</strong>. 
                    Always consult qualified healthcare professionals for medical or mental health concerns.
                  </p>
                </div>
              </CardShell>
            </motion.div>

            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <CardShell className="p-8 text-center bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border-cyan-400/30">
                <h2 className="text-3xl font-bold text-white mb-4">
                  Ready to Start Your Journey?
                </h2>
                <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                  Join hundreds of young athletes building skills, confidence, and mental toughness.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <CosmicButton
                    href="/sign-up"
                    variant="primary"
                    size="lg"
                  >
                    Create Free Account
                  </CosmicButton>
                  <CosmicButton
                    href="/contact"
                    variant="secondary"
                    size="lg"
                  >
                    Questions? Contact Us
                  </CosmicButton>
                </div>
              </CardShell>
            </motion.div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
}
