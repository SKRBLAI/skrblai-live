'use client';

import React, { useState, useEffect } from 'react';
import type { JSX } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/context/AuthContext';
import { useSkillSmithGuest } from '@/lib/skillsmith/guestTracker';
import PageLayout from 'components/layout/PageLayout';
import FloatingParticles from '@/components/ui/FloatingParticles';
import SkillSmithStandaloneHero from '@/components/home/SkillSmithStandaloneHero';
import VideoUploadModal from '@/components/skillsmith/VideoUploadModal';
import EmailCaptureModal from '@/components/skillsmith/EmailCaptureModal';
import AnalysisResultsModal from '@/components/skillsmith/AnalysisResultsModal';
import UpgradeModal from '@/components/skillsmith/UpgradeModal';
import { Trophy, Zap, Target, Star, Users, BarChart3 } from 'lucide-react';

interface AnalysisResult {
  feedback: string;
  score: number;
  improvements: string[];
  quickWins: QuickWin[];
  sport: string;
  ageGroup: 'youth' | 'teen' | 'adult' | 'senior';
}

interface QuickWin {
  id: string;
  title: string;
  description: string;
  downloadUrl: string;
  category: 'technique' | 'training' | 'nutrition' | 'mental';
}

export default function SportsPage(): JSX.Element {
  const { user, isEmailVerified } = useAuth();
  const { 
    scansRemaining, 
    shouldShowUpgradeOffer, 
    usageStats, 
    session 
  } = useSkillSmithGuest();

  // Modal states
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [emailCaptureModalOpen, setEmailCaptureModalOpen] = useState(false);
  const [resultsModalOpen, setResultsModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Determine user type for different flows
  const getUserType = (): 'guest' | 'auth' | 'platform' => {
    if (user && isEmailVerified) return 'platform';
    if (session.emailCaptured) return 'auth';
    return 'guest';
  };

  const userType = getUserType();

  // Show upgrade modal for returning users
  useEffect(() => {
    if (shouldShowUpgradeOffer && userType === 'guest') {
      const timer = setTimeout(() => {
        setUpgradeModalOpen(true);
      }, 5000); // Show after 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [shouldShowUpgradeOffer, userType]);

  // Live metrics for display
  const [liveMetrics, setLiveMetrics] = useState({
    athletesTransformed: 12847,
    performanceImprovement: 73,
    injuriesPrevented: 2156,
    recordsBroken: 847
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics(prev => ({
        athletesTransformed: prev.athletesTransformed + Math.floor(Math.random() * 3),
        performanceImprovement: Math.min(99, prev.performanceImprovement + Math.floor(Math.random() * 2)),
        injuriesPrevented: prev.injuriesPrevented + Math.floor(Math.random() * 2),
        recordsBroken: prev.recordsBroken + Math.floor(Math.random() * 1)
      }));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const handleUploadClick = () => {
    if (userType === 'guest' && scansRemaining === 0) {
      setEmailCaptureModalOpen(true);
    } else {
      setUploadModalOpen(true);
    }
  };

  const handleEmailCaptureClick = () => {
    setEmailCaptureModalOpen(true);
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setUploadModalOpen(false);
    setResultsModalOpen(true);
  };

  const handleEmailCaptured = (email: string) => {
    setEmailCaptureModalOpen(false);
    // In a real app, you'd send this to your backend
    console.log('Email captured:', email);
  };

  const handleUpgradeClick = () => {
    setResultsModalOpen(false);
    if (userType === 'guest') {
      setEmailCaptureModalOpen(true);
    } else {
      setUpgradeModalOpen(true);
    }
  };

  const handlePurchase = (plan: 'basic' | 'pro' | 'elite') => {
    // In a real app, integrate with Stripe or payment processor
    console.log('Purchase plan:', plan);
    setUpgradeModalOpen(false);
  };

  const quickWins = [
    {
      icon: Target,
      title: "Form Analysis",
      description: "Get instant feedback on your technique and form",
      color: "text-blue-400"
    },
    {
      icon: Zap,
      title: "Performance Insights",
      description: "Discover what's holding back your peak performance",
      color: "text-orange-400"
    },
    {
      icon: Trophy,
      title: "Training Plans",
      description: "Receive personalized recommendations to improve",
      color: "text-green-400"
    },
    {
      icon: Star,
      title: "Progress Tracking",
      description: "Monitor your improvement over time with detailed metrics",
      color: "text-purple-400"
    }
  ];

  return (
    <PageLayout>
      <div className="min-h-screen relative overflow-hidden">
        <FloatingParticles />
        
        {/* Main Content */}
        <div className="relative z-10 pt-8">
          {/* Hero Section */}
          <SkillSmithStandaloneHero
            userType={userType}
            freeScansRemaining={scansRemaining}
            onUploadClick={handleUploadClick}
            onEmailCaptureClick={handleEmailCaptureClick}
          />

          {/* Quick Wins Section - Only for standalone users */}
          {(userType === 'guest' || userType === 'auth') && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative mb-24"
            >
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    What You'll Get in <span className="text-orange-400">30 Seconds</span>
                  </h2>
                  <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                    Upload your training video and get instant, professional-grade analysis
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {quickWins.map((win, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1, duration: 0.6 }}
                      className="bg-gradient-to-b from-gray-800/60 to-gray-900/60 border border-gray-600/30 rounded-xl p-6 backdrop-blur-xl text-center hover:border-orange-500/30 transition-colors"
                    >
                      <win.icon className={`w-12 h-12 ${win.color} mx-auto mb-4`} />
                      <h3 className="text-lg font-semibold text-white mb-2">{win.title}</h3>
                      <p className="text-gray-400 text-sm">{win.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.section>
          )}

          {/* Live Metrics Section - Only for standalone users */}
          {(userType === 'guest' || userType === 'auth') && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative mb-24"
            >
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-gradient-to-b from-gray-800/40 to-gray-900/40 border border-orange-500/30 rounded-3xl p-8 backdrop-blur-xl">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      Join Thousands of Athletes
                    </h2>
                    <p className="text-gray-400">
                      Real results from SkillSmith users worldwide
                    </p>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Users className="w-6 h-6 text-orange-400" />
                        <span className="text-3xl font-bold text-orange-400">{liveMetrics.athletesTransformed.toLocaleString()}</span>
                      </div>
                      <p className="text-gray-400 text-sm">Athletes Improved</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <BarChart3 className="w-6 h-6 text-green-400" />
                        <span className="text-3xl font-bold text-green-400">{liveMetrics.performanceImprovement}%</span>
                      </div>
                      <p className="text-gray-400 text-sm">Avg Improvement</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Zap className="w-6 h-6 text-blue-400" />
                        <span className="text-3xl font-bold text-blue-400">{liveMetrics.injuriesPrevented.toLocaleString()}</span>
                      </div>
                      <p className="text-gray-400 text-sm">Injuries Prevented</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Trophy className="w-6 h-6 text-yellow-400" />
                        <span className="text-3xl font-bold text-yellow-400">{liveMetrics.recordsBroken}</span>
                      </div>
                      <p className="text-gray-400 text-sm">Records Broken</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* Platform users see original content */}
          {userType === 'platform' && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative mb-24"
            >
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Welcome back to <span className="text-orange-400">SkillSmith</span>
                  </h2>
                  <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
                    Continue your athletic journey with our full suite of training tools
                  </p>
                  <a 
                    href="/services/skillsmith" 
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-lg transition-colors"
                  >
                    Access Full Platform →
                  </a>
                </div>
              </div>
            </motion.section>
          )}
        </div>

        {/* Modals */}
        <VideoUploadModal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          userType={userType}
          onAnalysisComplete={handleAnalysisComplete}
        />

        <EmailCaptureModal
          isOpen={emailCaptureModalOpen}
          onClose={() => setEmailCaptureModalOpen(false)}
          onEmailCaptured={handleEmailCaptured}
        />

        <AnalysisResultsModal
          isOpen={resultsModalOpen}
          onClose={() => setResultsModalOpen(false)}
          result={analysisResult}
          userType={userType}
          onUpgradeClick={handleUpgradeClick}
          onQuickWinDownload={(quickWin) => {
            console.log('Download quick win:', quickWin);
          }}
        />

        <UpgradeModal
          isOpen={upgradeModalOpen}
          onClose={() => setUpgradeModalOpen(false)}
          onPurchase={handlePurchase}
          userType={userType === 'platform' ? 'auth' : userType}
        />
      </div>
    </PageLayout>
  );
} 