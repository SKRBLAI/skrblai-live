'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ClientPageLayout from '../../components/layout/ClientPageLayout';
import GlassmorphicCard from '../../components/shared/GlassmorphicCard';
import Pseudo3DCard from '../../components/shared/Pseudo3DCard';
import CosmicButton from '../../components/shared/CosmicButton';
import CosmicHeading from '../../components/shared/CosmicHeading';
import PercyAvatar from '../../components/home/PercyAvatar';
import Image from 'next/image';
import Link from 'next/link';
import { 
  BookOpen, Palette, FilePenLine, Megaphone, BarChart2, LayoutDashboard, 
  Users, TrendingUp, Zap, Crown, DollarSign, Clock, Sparkles, Play, 
  MessageCircle, ArrowRight, Star, Target, Rocket, Eye, X
} from 'lucide-react';
import SkrblAiText from '../../components/shared/SkrblAiText';
import { businessSolutions, globalMetrics, LiveMetrics, ServiceSolution } from '../../lib/config/services';
import { getPercyRecommendation, PercyRecommendation } from '../../lib/percy/recommendationEngine';
import { agentHandoffAnimations } from '../../lib/animations/agentHandoff';
import toast from 'react-hot-toast';


// Business solutions now imported from lib/config/services.ts
// Percy recommendation and live stats integration
/* const businessSolutions = [ // Moved to config
  {
    problem: "Revenue Stalling",
    subheading: "Break through growth plateaus",
    description: "AI powered analytics and marketing automation that identifies hidden revenue opportunities and converts them into profit.",
    agents: ['analytics', 'adcreative', 'social'],
    icon: <TrendingUp className="w-8 h-8" />,
    metrics: { successRate: 94, avgIncrease: "127%", timeToResults: "14 days" },
    href: '/analytics',
    primaryColor: 'from-green-600 to-emerald-500',
    liveActivity: { users: 47, status: "🔥 Hot" },
    ctaText: "Show Me The Revenue Growth",
    demoVideo: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    conversionFocus: "revenue",
    percyRecommendation: "Perfect for businesses stuck at $50K-$500K monthly revenue"
  },
  {
    problem: "Brand Confusion", 
    subheading: "Customers don't get your brand",
    description: "Complete brand identity transformation with AI powered logo design, voice development, and positioning strategy.",
    agents: ['branding', 'contentcreation', 'book-publishing'],
    icon: <Palette className="w-8 h-8" />,
    metrics: { successRate: 89, avgIncrease: "156%", timeToResults: "21 days" },
    href: '/branding',
    primaryColor: 'from-purple-600 to-pink-500',
    liveActivity: { users: 33, status: "🎯 Trending" },
    ctaText: "Transform My Brand Identity",
    demoVideo: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    conversionFocus: "branding",
    percyRecommendation: "Ideal for businesses with unclear messaging or weak brand presence"
  },
  {
    problem: "Manual Overwhelm",
    subheading: "Drowning in repetitive tasks",
    description: "Complete workflow automation that handles your busywork while you focus on strategy and growth.",
    agents: ['sync', 'biz', 'percy'],
    icon: <Zap className="w-8 h-8" />,
    metrics: { successRate: 96, avgIncrease: "234%", timeToResults: "7 days" },
    href: '/content-automation',
    primaryColor: 'from-blue-600 to-cyan-500',
    liveActivity: { users: 61, status: "⚡ Active" },
    ctaText: "Automate My Workflows Now",
    demoVideo: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    conversionFocus: "automation",
    percyRecommendation: "Best for entrepreneurs spending 20+ hours/week on admin tasks"
  },
  {
    problem: "Content Drought",
    subheading: "Running out of content ideas",
    description: "AI powered content engine that creates unlimited engaging content across all platforms and formats.",
    agents: ['contentcreation', 'social', 'videocontent'],
    icon: <FilePenLine className="w-8 h-8" />,
    metrics: { successRate: 92, avgIncrease: "189%", timeToResults: "10 days" },
    href: '/content-automation',
    primaryColor: 'from-orange-600 to-red-500',
    liveActivity: { users: 78, status: "📈 Growing" },
    ctaText: "Generate Unlimited Content",
    demoVideo: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    conversionFocus: "content",
    percyRecommendation: "Perfect for businesses struggling with consistent content creation"
  },
  {
    problem: "Authority Absence",
    subheading: "Nobody knows you exist",
    description: "Complete thought leadership strategy with book publishing, speaking opportunities, and industry recognition.",
    agents: ['publishing', 'contentcreation', 'proposal'],
    icon: <BookOpen className="w-8 h-8" />,
    metrics: { successRate: 87, avgIncrease: "167%", timeToResults: "30 days" },
    href: '/book-publishing',
    primaryColor: 'from-indigo-600 to-purple-500',
    liveActivity: { users: 29, status: "📚 Expert" },
    ctaText: "Build My Authority Platform",
    demoVideo: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    conversionFocus: "authority",
    percyRecommendation: "Ideal for experts ready to become industry thought leaders"
  },
  {
    problem: "Sales Chaos",
    subheading: "Leads falling through cracks",
    description: "Complete sales automation with lead nurturing, proposal generation, and client success management.",
    agents: ['proposal', 'clientsuccess', 'analytics'],
    icon: <DollarSign className="w-8 h-8" />,
    metrics: { successRate: 91, avgIncrease: "198%", timeToResults: "14 days" },
    href: '/dashboard/analytics',
    primaryColor: 'from-green-600 to-teal-500',
    liveActivity: { users: 52, status: "💰 Profitable" },
    ctaText: "Fix My Sales Funnel",
    demoVideo: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    conversionFocus: "sales",
    percyRecommendation: "Best for businesses with high lead volume but low conversion rates"
  }
];
*/

// Live metrics data - now imported from config
/*
const localGlobalMetrics = {
  totalProblems: 147,
  problemsSolved: 139,
  avgTimeToSolution: "12 days",
  clientSatisfaction: "97.3%",
  liveUsers: 1247,
  agentsDeployed: 89,
  revenueGenerated: 2849718
};
*/

// Competitive Intelligence Ticker Messages
const competitiveTicker = [
  "While you read this, 47 competitors fell behind",
  "3 businesses just automated their entire sales process",
  "Your competitor just gained 127% revenue increase",
  "2 industry leaders just published their authority books",
  "5 businesses just eliminated manual workflows forever",
  "Your competition just captured 89% more leads",
  "4 brands just transformed their entire identity",
  "While you wait, others are already dominating"
];

// Percy Recommendations based on user behavior
const percyRecommendations = {
  revenue: "I see you're focused on revenue growth. Based on 10,000+ businesses I've analyzed, the Revenue Stalling solution has the highest ROI.",
  branding: "Brand confusion is costing you customers daily. Let me show you how to fix this in 21 days with our proven system.",
  automation: "You're spending too much time on manual tasks. I can automate 80% of your workflows in the next 7 days.",
  content: "Content drought kills growth. Our AI engine has created 2.3M pieces of content. Want to see how?",
  authority: "Authority builds trust, trust builds revenue. I've helped 847 experts become industry leaders.",
  sales: "Leaky sales funnels waste money. I can plug those holes and increase your conversion rate by 198%."
};

export default function ServicesPage() {
  const [selectedSolution, setSelectedSolution] = useState<ServiceSolution | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTicker, setCurrentTicker] = useState(0);
  const [percyRecommendation, setPercyRecommendation] = useState<PercyRecommendation | null>(null);
  const [showVideoDemo, setShowVideoDemo] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState('');
  const [percyMood, setPercyMood] = useState<'excited' | 'analyzing' | 'confident'>('excited');
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics>({
    totalUsers: 187,
    urgentSpots: 12,
    activeSolutions: 6,
    businessesTransformed: 47213,
    revenueGenerated: '$12.4M',
    averageROI: '312%'
  });
  const [demoCache, setDemoCache] = useState<Map<string, any>>(new Map());

  // Live metrics fetching
  useEffect(() => {
    const fetchLiveMetrics = async () => {
      try {
        const response = await fetch('/api/services/live-stats');
        if (response.ok) {
          const data = await response.json();
          setLiveMetrics(data);
        }
      } catch (error) {
        console.error('[Services] Failed to fetch live metrics:', error);
      }
    };

    fetchLiveMetrics();
    const interval = setInterval(fetchLiveMetrics, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Competitive Intelligence Ticker Animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTicker((prev) => (prev + 1) % competitiveTicker.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSolutionClick = useCallback(async (solution: ServiceSolution) => {
    setSelectedSolution(solution);
    setIsLoading(true);
    setPercyMood('analyzing');
    
    // Add to user interests
    setUserInterests(prev => {
      const newInterests = [...prev, solution.personalization.tags[0] || solution.id];
      return [...new Set(newInterests)].slice(-3); // Keep last 3 unique interests
    });

    try {
      // Get Percy's recommendation via API
      const response = await fetch('/api/services/percy-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trigger: solution.problem,
          context: {
            currentSelection: solution.id,
            userHistory: userInterests,
            urgencyLevel: solution.urgencyLevel,
            businessType: 'general'
          },
          requestType: 'instant'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPercyRecommendation(data.recommendation);
        setPercyMood('confident');
        
        // Show success toast
        toast.success(`Percy analyzed "${solution.problem}" and found the perfect solution!`, {
          icon: '🚀',
          duration: 3000,
        });
      } else {
        throw new Error('Recommendation API failed');
      }
    } catch (error) {
      console.error('[Services] Percy recommendation error:', error);
      // Fallback to basic recommendation
      setPercyRecommendation({
        primaryService: solution,
        reasoning: `Based on your selection, **${solution.problem}** is clearly a priority. I recommend starting here for maximum impact.`,
        confidence: 0.8,
        followUpServices: businessSolutions.filter(s => s.id !== solution.id).slice(0, 2),
        urgencyMessage: solution.urgencyLevel === 'critical' ? '⚡ This needs immediate attention!' : undefined
      } as PercyRecommendation);
      setPercyMood('confident');
    } finally {
      setIsLoading(false);
    }

    // Track interaction for live metrics
    fetch('/api/services/live-stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: 'service_view', serviceId: solution.id })
    }).catch(console.error);
  }, [userInterests]);

  // Handle video demo
  const handleVideoDemo = useCallback((videoUrl: string) => {
    setSelectedVideo(videoUrl);
    setShowVideoDemo(true);
  }, []);

  // Close video demo
  const closeVideoDemo = useCallback(() => {
    setShowVideoDemo(false);
    setSelectedVideo('');
  }, []);

  return (
    <ClientPageLayout>
      {/* Cosmic Background with Animated Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900" />
        {/* Floating Orbs */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-64 h-64 rounded-full opacity-10"
            style={{
              background: `radial-gradient(circle, ${['#00d4ff', '#ff0080', '#00ff88'][i % 3]} 0%, transparent 70%)`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.5 }}
        className="min-h-screen relative z-10"
      >
        {/* Competitive Intelligence Ticker */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-900/90 to-orange-900/90 backdrop-blur-md border-b border-red-500/30 py-2"
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-2">
              <Target className="w-4 h-4 text-red-400 animate-pulse" />
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentTicker}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-sm font-bold text-red-200"
                >
                  {competitiveTicker[currentTicker]}
                </motion.span>
              </AnimatePresence>
              <Sparkles className="w-4 h-4 text-orange-400 animate-spin" />
            </div>
          </div>
        </motion.div>

        <div className="relative z-10 pt-20 sm:pt-24 lg:pt-28 px-4 md:px-8 lg:px-12">
          
          {/* Hero Section with Percy */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >


            {/* Animated Market Stats */}
            <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
              <motion.div 
                className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 backdrop-blur-xl border border-purple-400/50 rounded-full px-5 py-3 shadow-[0_0_30px_rgba(147,51,234,0.4)]"
                animate={{ 
                  boxShadow: [
                    '0 0 30px rgba(147,51,234,0.4)', 
                    '0 0 50px rgba(147,51,234,0.7)', 
                    '0 0 30px rgba(147,51,234,0.4)'
                  ],
                  scale: [1, 1.02, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <span className="text-purple-300 font-bold text-sm">🚀 {Math.floor(Math.random() * 20) + 14} brands transformed in last 24h</span>
              </motion.div>
              <motion.div 
                className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 backdrop-blur-xl border border-blue-400/50 rounded-full px-5 py-3 shadow-[0_0_30px_rgba(99,102,241,0.4)]"
                animate={{ 
                  scale: [1, 1.05, 1],
                  y: [0, -2, 0]
                }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
              >
                <span className="text-blue-300 font-bold text-sm">💰 ${Math.floor(Math.random() * 500) + 250}K revenue this month</span>
              </motion.div>
            </div>
            
            <CosmicHeading className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl mb-6">
              What's Killing Your <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Business Growth</span>?
            </CosmicHeading>
            <p className="text-xl sm:text-2xl text-purple-200 max-w-4xl mx-auto mb-8 font-semibold leading-relaxed">
              Percy analyzes your challenge and assembles the perfect AI agent team to solve it. 
              <span className="text-white font-bold block mt-2">Real solutions, real results, real fast.</span>
            </p>
          </motion.div>

          {/* Percy Recommendation Engine */}
          <AnimatePresence>
            {percyRecommendation && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                className="mb-12"
              >
                <div className="relative max-w-4xl mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-blue-500/30 rounded-3xl blur-2xl" />
                  <div className="relative bg-gradient-to-br from-[rgba(30,25,50,0.9)] to-[rgba(15,20,40,0.9)] backdrop-blur-xl border-2 border-purple-400/60 rounded-3xl p-8 shadow-[0_0_80px_rgba(147,51,234,0.5)]">
                    <div className="flex items-start gap-6">
                      <div className="relative">
                        <motion.div
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <PercyAvatar mood={percyMood} size="lg" />
                        </motion.div>
                        <motion.div
                          className="absolute -top-2 -right-2"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <Sparkles className="w-6 h-6 text-purple-400" />
                        </motion.div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="text-xl font-bold text-white">Percy's Recommendation</h3>
                          <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold"
                          >
                            AI ANALYZING
                          </motion.div>
                        </div>
                        <p className="text-gray-300 leading-relaxed mb-4">{percyRecommendation.reasoning}</p>
                        <div className="flex items-center gap-3">
                          <CosmicButton size="sm" className="flex items-center gap-2">
                            <Rocket className="w-4 h-4" />
                            Get Started Now
                          </CosmicButton>
                          <button 
                            onClick={() => setPercyRecommendation(null)}
                            className="text-gray-400 hover:text-white transition-colors text-sm"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Achievement Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap justify-center gap-4 mb-16"
          >
            {[
              { label: "Most Popular", icon: "🔥", color: "from-red-500/20 to-orange-500/20", border: "border-red-400/40" },
              { label: "New", icon: "✨", color: "from-purple-500/20 to-pink-500/20", border: "border-purple-400/40" },
              { label: "Trending", icon: "📈", color: "from-blue-500/20 to-cyan-500/20", border: "border-blue-400/40" },
              { label: "Editor's Choice", icon: "⭐", color: "from-yellow-500/20 to-amber-500/20", border: "border-yellow-400/40" }
            ].map((badge, index) => (
              <motion.div
                key={badge.label}
                className={`relative group bg-gradient-to-r ${badge.color} backdrop-blur-xl border ${badge.border} rounded-full px-4 py-2 shadow-lg`}
                whileHover={{ 
                  scale: 1.1,
                  y: -3,
                  rotateZ: [0, -2, 2, 0]
                }}
                animate={{ 
                  y: [0, -5, 0],
                  rotateZ: [0, 1, -1, 0]
                }}
                transition={{ 
                  y: { duration: 3 + index * 0.5, repeat: Infinity, ease: "easeInOut" },
                  rotateZ: { duration: 4 + index * 0.3, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="text-base">{badge.icon}</span>
                  {badge.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
          
          {/* Enhanced Business Solutions Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-16 max-w-7xl mx-auto"
          >
            {businessSolutions.map((solution, index) => (
              <motion.div
                key={solution.problem}
                className="group cursor-pointer relative overflow-hidden bg-gradient-to-br from-[rgba(30,25,50,0.8)] to-[rgba(15,20,40,0.9)] backdrop-blur-xl border-2 border-purple-400/30 rounded-3xl p-6 shadow-[0_0_40px_rgba(147,51,234,0.2)] min-h-[500px] flex flex-col"
                onClick={() => handleSolutionClick(solution)}
                data-service-id={solution.id}
                whileHover={{
                  scale: 1.02,
                  rotateY: 5,
                  rotateX: 2,
                  boxShadow: "0 0 80px rgba(147,51,234,0.4), 0 0 120px rgba(99,102,241,0.2)"
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative z-10"
                >
                  {/* Floating Status Badge */}
                  <div className="absolute top-4 right-4 z-20">
                    <motion.div 
                      className="flex items-center gap-1 bg-purple-900/60 backdrop-blur-sm border border-purple-400/40 rounded-full px-3 py-1 text-xs shadow-lg"
                      animate={{ 
                        y: [0, -3, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                      <span className="text-purple-200 font-medium">{solution.liveActivity.status}</span>
                    </motion.div>
                  </div>

                  {/* Icon with cosmic background */}
                  <motion.div 
                    className="p-4 rounded-xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-400/30 shadow-[0_0_20px_rgba(147,51,234,0.3)] mb-4"
                    whileHover={{ 
                      scale: 1.1,
                      rotateY: 10,
                      boxShadow: "0 0 40px rgba(147,51,234,0.6)"
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <div className="text-purple-200 w-8 h-8">
                      {solution.icon}
                    </div>
                  </motion.div>

                  {/* Problem Title */}
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors drop-shadow-lg">
                    {solution.problem}
                  </h3>

                  {/* Subheading */}
                  <p className="text-sm text-gray-400 mb-3">
                    {solution.subheading}
                  </p>

                  {/* Description */}
                  <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                    {solution.description}
                  </p>

                  {/* Tags from personalization */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {solution.personalization.tags.slice(0, 3).map((tag: string, tagIndex: number) => (
                      <motion.span
                        key={tagIndex}
                        className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium border border-purple-400/30"
                        whileHover={{ 
                          scale: 1.05, 
                          backgroundColor: "rgba(147, 51, 234, 0.3)",
                          borderColor: "rgba(147, 51, 234, 0.6)"
                        }}
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>

                  {/* Pricing and Actions */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-3xl font-bold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
                          Free Trial
                        </span>
                        <div className="text-sm text-gray-400">get started today</div>
                      </div>
                      <div className="text-right">
                        <motion.div 
                          className="text-sm text-purple-400 font-bold"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          🚀 {Math.floor(Math.random() * 50) + 10} active
                        </motion.div>
                        <div className="text-xs text-gray-500">this week</div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-auto">
                      <motion.button
                        onClick={() => handleSolutionClick(solution)}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-[0_0_30px_rgba(147,51,234,0.4)] hover:shadow-[0_0_50px_rgba(147,51,234,0.6)]"
                        whileHover={{ 
                          scale: 1.05,
                          rotateY: 2,
                          boxShadow: "0 0 50px rgba(147,51,234,0.8)"
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="flex items-center justify-center gap-2 text-base">
                          <Rocket className="w-5 h-5" />
                          {solution.id.includes('revenue') ? 'Unlock Revenue' :
                           solution.id.includes('brand') ? 'Transform Brand' :
                           solution.id.includes('automation') || solution.id.includes('manual') ? 'Automate Now' :
                           solution.id.includes('content') ? 'Generate Content' :
                           solution.id.includes('authority') ? 'Build Authority' :
                           solution.id.includes('sales') ? 'Fix Sales' :
                           'Get Started'}
                        </span>
                      </motion.button>
                      
                      
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>

          {/* 'Why Choose Us' section removed for a focused business solution experience */}


          {/* Final CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="relative max-w-4xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-3xl blur-2xl" />
              <div className="relative bg-[rgba(21,23,30,0.9)] backdrop-blur-xl border-2 border-purple-500/40 rounded-3xl p-12 shadow-[0_0_60px_#a855f7aa]">
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent mb-6">
                  Ready To Transform Your Business?
                </h2>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Join thousands of businesses already using <SkrblAiText variant="wave">SKRBL</SkrblAiText> to automate, scale, and dominate their industries.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link href="/sign-up">
                    <CosmicButton size="lg" className="text-lg px-8 py-4 flex items-center gap-2">
                      <Rocket className="w-5 h-5" />
                      Start Free Trial
                    </CosmicButton>
                  </Link>
                  <Link href="/about">
                    <CosmicButton variant="secondary" size="lg" className="text-lg px-8 py-4">
                      Learn More
                    </CosmicButton>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Percy Recommendation Modal */}
        <AnimatePresence>
          {percyRecommendation && selectedSolution && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              onClick={() => setPercyRecommendation(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: 50 }}
                className="relative max-w-2xl w-full bg-gradient-to-br from-[rgba(21,23,30,0.95)] to-[rgba(30,35,45,0.95)] backdrop-blur-xl border-2 border-teal-400/50 rounded-3xl overflow-hidden shadow-[0_0_80px_#30d5c8aa]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="p-6 border-b border-teal-400/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Percy's Recommendation</h2>
                        <p className="text-sm text-gray-400">AI-powered solution analysis</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setPercyRecommendation(null)}
                      title="Close recommendation modal"
                      aria-label="Close recommendation modal"
                      className="p-2 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-full transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Confidence Score */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Confidence Level</span>
                      <span className="text-sm font-bold text-teal-400">{Math.round(percyRecommendation.confidence * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-teal-400 to-cyan-400 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${percyRecommendation.confidence * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Reasoning */}
                  <div className="mb-6">
                    <div 
                      className="text-gray-300 leading-relaxed"
                      dangerouslySetInnerHTML={{ 
                        __html: percyRecommendation.reasoning.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                      }}
                    />
                  </div>

                  {/* Urgency Message */}
                  {percyRecommendation.urgencyMessage && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                      <p className="text-red-300 font-medium">
                        {percyRecommendation.urgencyMessage}
                      </p>
                    </div>
                  )}

                  {/* Follow-up Services */}
                  {percyRecommendation.followUpServices && percyRecommendation.followUpServices.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-white font-bold mb-3">Next Steps to Consider:</h3>
                      <div className="space-y-2">
                        {percyRecommendation.followUpServices.slice(0, 2).map((service) => (
                          <button
                            key={service.id}
                            onClick={() => {
                              setPercyRecommendation(null);
                              handleSolutionClick(service);
                            }}
                            className="w-full text-left p-3 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 rounded-lg transition-all"
                          >
                            <div className="font-medium text-teal-300">{service.problem}</div>
                            <div className="text-sm text-gray-400">{service.subheading}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Link href={percyRecommendation.primaryService.href} className="flex-1">
                      <CosmicButton className="w-full">
                        {percyRecommendation.primaryService.conversionCTA}
                      </CosmicButton>
                    </Link>
                    <CosmicButton
                      variant="secondary"
                      onClick={() => setPercyRecommendation(null)}
                      className="px-6"
                    >
                      Maybe Later
                    </CosmicButton>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Video Demo Modal */}
        <AnimatePresence>
          {showVideoDemo && selectedVideo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              onClick={closeVideoDemo}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative max-w-4xl w-full bg-[rgba(21,23,30,0.95)] backdrop-blur-xl border-2 border-teal-400/50 rounded-3xl overflow-hidden shadow-[0_0_80px_#30d5c8aa]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={closeVideoDemo}
                  title="Close video demo"
                  aria-label="Close video demo"
                  className="absolute top-4 right-4 z-10 p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-white rounded-full transition-all duration-300"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Video Container */}
                <div className="aspect-video">
                  <iframe
                    src={selectedVideo}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Solution Demo Video"
                  />
                </div>

                {/* Video Info */}
                <div className="p-6 border-t border-teal-400/20">
                  <h3 className="text-xl font-bold text-white mb-2">Solution Demo</h3>
                  <p className="text-gray-300">See how our AI agents solve real business challenges in minutes, not months.</p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </ClientPageLayout>
  );
}
