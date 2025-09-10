'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Upload, Play, Users, Trophy, Zap, Star, BarChart3, UserCheck } from 'lucide-react';
import Image from 'next/image';
import CosmicButton from '../shared/CosmicButton';
import { useRouter } from 'next/navigation';
import { useDashboardAuth } from '@/hooks/useDashboardAuth';

interface SportsHeroProps {
  userType?: 'guest' | 'auth' | 'platform';
  freeScansRemaining?: number;
  onUploadClick?: () => void;
  onEmailCaptureClick?: () => void;
  liveMetrics?: {
    athletesTransformed: number;
    performanceImprovement: number;
    injuriesPrevented: number;
    recordsBroken: number;
  };
}

export default function SportsHero({ 
  userType = 'guest',
  freeScansRemaining = 5,
  onUploadClick,
  onEmailCaptureClick,
  liveMetrics = {
    athletesTransformed: 12847,
    performanceImprovement: 73,
    injuriesPrevented: 2156,
    recordsBroken: 847
  }
}: SportsHeroProps) {
  const router = useRouter();
  const { user, isLoading } = useDashboardAuth();
  const [displayText, setDisplayText] = useState("Level Up Your Game with AI! 🚀");
  const [isTyping, setIsTyping] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const typewriterWords = [
    "Level Up Your Game with AI! 🚀",
    "From Beginner to Beast Mode! 🦥", 
    "Get Coach-Level Feedback Instantly! 🏆",
    "Master Any Sport with AI! ⚽🏀🏈"
  ];

  // Reduced motion typewriter effect - desktop only, respects prefers-reduced-motion
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;
    
    if (prefersReducedMotion || isMobile) {
      return; // Keep static text
    }

    let currentWordIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;

    const typeEffect = () => {
      const currentWord = typewriterWords[currentWordIndex];
      
      if (!isDeleting) {
        if (currentCharIndex < currentWord.length) {
          setDisplayText(currentWord.substring(0, currentCharIndex + 1));
          currentCharIndex++;
          timeoutRef.current = setTimeout(typeEffect, 150); // Slow 150ms per char
        } else {
          // Pause at end of word
          timeoutRef.current = setTimeout(() => {
            isDeleting = true;
            typeEffect();
          }, 2000);
        }
      } else {
        if (currentCharIndex > 0) {
          setDisplayText(currentWord.substring(0, currentCharIndex - 1));
          currentCharIndex--;
          timeoutRef.current = setTimeout(typeEffect, 100);
        } else {
          isDeleting = false;
          currentWordIndex = (currentWordIndex + 1) % typewriterWords.length;
          typeEffect();
        }
      }
    };

    // Pause when tab is hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      } else if (!prefersReducedMotion && !isMobile) {
        typeEffect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Start typing effect
    intervalRef.current = setTimeout(typeEffect, 1000);

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleParentPortalClick = async () => {
    // Analytics stub
    console.log('event:parent_portal_click', { 
      userType, 
      isAuthenticated: !!user,
      timestamp: new Date().toISOString() 
    });

    if (isLoading) return;
    
    if (!user) {
      // Redirect to sign-in with return path
      router.push('/sign-in?from=/dashboard/parent');
      return;
    }
    
    try {
      // Provision parent profile
      const response = await fetch('/api/parent/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        // Redirect to parent dashboard
        router.push('/dashboard/parent');
      } else {
        console.error('Failed to provision parent profile');
        // Fallback - still redirect to dashboard
        router.push('/dashboard/parent');
      }
    } catch (error) {
      console.error('Error accessing parent portal:', error);
      // Fallback - still redirect to dashboard
      router.push('/dashboard/parent');
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative mb-16"
      data-upload-section
    >
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Unified Hero + Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative bg-gradient-to-br from-slate-900/80 via-purple-900/20 to-slate-900/80 backdrop-blur-xl rounded-3xl lg:p-16 md:p-12 p-8 shadow-[0_0_40px_rgba(147,51,234,0.15)] md:shadow-[0_0_60px_rgba(147,51,234,0.15)]"
        >
          {/* Optional SkillSmith Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center mb-8"
          >
            <Image
              src="/images/agents-skillsmith-nobg-skrblai.webp"
              alt="SkillSmith AI Sports Coach"
              width={200}
              height={200}
              className="rounded-full border-2 border-cyan-400/30 shadow-lg"
              onError={(e) => {
                // Hide image on error
                e.currentTarget.style.display = 'none';
              }}
            />
          </motion.div>

          {/* Hero Content */}
          <div className="text-center mb-12">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
            >
              {displayText}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Upload your game footage and get instant AI analysis, personalized training plans, and competitive edge coaching.
            </motion.p>

            {/* Hero Bullets */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap justify-center gap-4 mb-8 text-sm md:text-base"
            >
              <div className="flex items-center gap-2 text-cyan-300">
                <Star className="w-4 h-4" />
                <span>Instant AI Analysis</span>
              </div>
              <div className="flex items-center gap-2 text-green-300">
                <Trophy className="w-4 h-4" />
                <span>Mastery of Emotion (MOE)</span>
              </div>
              <div className="flex items-center gap-2 text-purple-300">
                <Zap className="w-4 h-4" />
                <span>Competitive Edge Coaching</span>
              </div>
              <div className="flex items-center gap-2 text-orange-300">
                <Users className="w-4 h-4" />
                <span>All Ages & Skill Levels</span>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
            >
              <CosmicButton 
                size="lg" 
                onClick={onUploadClick}
                className="flex items-center gap-2 px-8 py-4"
              >
                <Upload className="w-5 h-5" />
                Upload Video for Analysis
              </CosmicButton>
              
              {userType === 'guest' && (
                <CosmicButton 
                  variant="secondary" 
                  size="lg"
                  onClick={onEmailCaptureClick}
                  className="flex items-center gap-2 px-8 py-4"
                >
                  <Play className="w-5 h-5" />
                  See Sample Analysis
                </CosmicButton>
              )}
            </motion.div>
            
            {/* Parent Portal CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex justify-center mb-12"
            >
              <CosmicButton 
                variant="outline"
                size="md"
                onClick={handleParentPortalClick}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 transition-all duration-300"
              >
                <UserCheck className="w-4 h-4" />
                {isLoading ? 'Loading...' : user ? 'Parent Portal' : 'Parent Portal (Sign In)'}
              </CosmicButton>
            </motion.div>
          </div>

          {/* Integrated Stats Row */}
                      <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
            <div className="text-center bg-purple-900/20 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-2">
                <Users className="w-6 h-6 text-purple-400" />
                <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
                  {liveMetrics.athletesTransformed.toLocaleString()}
                </span>
              </div>
              <p className="text-purple-200 text-xs md:text-sm font-medium leading-tight">Athletes Improved</p>
            </div>
            
            <div className="text-center bg-blue-900/20 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-2">
                <BarChart3 className="w-6 h-6 text-blue-400" />
                <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                  {liveMetrics.performanceImprovement}%
                </span>
              </div>
              <p className="text-blue-200 text-xs md:text-sm font-medium leading-tight">Avg Improvement</p>
            </div>
            
            <div className="text-center bg-indigo-900/20 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-2">
                <Zap className="w-6 h-6 text-indigo-400" />
                <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                  {liveMetrics.injuriesPrevented.toLocaleString()}
                </span>
              </div>
              <p className="text-indigo-200 text-xs md:text-sm font-medium leading-tight">Injuries Prevented</p>
            </div>
            
            <div className="text-center bg-violet-900/20 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-2">
                <Trophy className="w-6 h-6 text-violet-400" />
                <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-300 to-pink-300 bg-clip-text text-transparent">
                  {liveMetrics.recordsBroken}
                </span>
              </div>
              <p className="text-violet-200 text-xs md:text-sm font-medium leading-tight">Records Broken</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}