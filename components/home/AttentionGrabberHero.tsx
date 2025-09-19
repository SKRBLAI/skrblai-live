"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Zap, TrendingUp, Target } from "lucide-react";
import UniversalPromptBar from "../ui/UniversalPromptBar";

interface AttentionGrabberHeroProps {
  onScanComplete: (data: any) => void;
}

export default function AttentionGrabberHero({ onScanComplete }: AttentionGrabberHeroProps) {
  const [scanningMode, setScanningMode] = useState<'business' | 'social' | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [showPlatformGrid, setShowPlatformGrid] = useState(false);

  // Platform options based on your reference image
  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: '📸', category: 'social' },
    { id: 'youtube', name: 'YouTube', icon: '🎥', category: 'video' },
    { id: 'website', name: 'Website/Blog', icon: '🌐', category: 'web' },
    { id: 'shopify', name: 'Shopify', icon: '🛒', category: 'ecommerce' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼', category: 'professional' },
    { id: 'general', name: 'General Business', icon: '🏢', category: 'business' }
  ];

  const handlePlatformSelect = (platformId: string) => {
    setSelectedPlatform(platformId);
    const platform = platforms.find(p => p.id === platformId);
    
    // For platform-specific scans without URL, provide analysis based on platform
    setScanningMode('business');
    setShowPlatformGrid(false);
    
    // Generate platform-specific analysis
    setTimeout(() => {
      const platformAnalysis = {
        instagram: {
          problems: ['Instagram engagement below industry average', 'Story highlights not optimized', 'Bio lacks clear CTA'],
          opportunities: ['Reels optimization for 3x reach', 'Automated story sequences', 'Instagram Shopping integration']
        },
        youtube: {
          problems: ['Video SEO optimization gaps', 'Thumbnail click-through rates low', 'End screen engagement poor'],
          opportunities: ['YouTube Shorts strategy', 'Playlist optimization', 'Community tab automation']
        },
        linkedin: {
          problems: ['Profile optimization incomplete', 'Content posting inconsistent', 'Network growth stagnant'],
          opportunities: ['Thought leadership content', 'LinkedIn automation', 'Professional network expansion']
        },
        website: {
          problems: ['SEO gaps detected', 'Conversion rate below potential', 'Mobile optimization needed'],
          opportunities: ['Technical SEO improvements', 'Landing page optimization', 'User experience enhancement']
        },
        shopify: {
          problems: ['Product page optimization gaps', 'Cart abandonment rate high', 'Email marketing underutilized'],
          opportunities: ['E-commerce automation', 'Conversion rate optimization', 'Customer retention strategies']
        },
        general: {
          problems: ['Digital presence fragmented', 'Brand consistency lacking', 'Growth strategy unclear'],
          opportunities: ['Unified brand strategy', 'Multi-channel automation', 'Business process optimization']
        }
      };

      const analysis = platformAnalysis[platformId as keyof typeof platformAnalysis] || platformAnalysis.general;
      
      onScanComplete({
        type: 'business',
        problems: analysis.problems,
        opportunities: analysis.opportunities,
        platform: platform?.name,
        agentRecommendations: [
          {
            agentId: 'percy',
            superheroName: 'Percy the Cosmic Concierge',
            reason: 'Perfect starting point to coordinate your strategy',
            confidence: 95
          }
        ]
      });
      setScanningMode(null);
    }, 2500);
  };

  const handleQuickScan = async (data: any) => {
    const input = data.prompt?.trim();
    
    if (!input) {
      setShowPlatformGrid(true);
      return;
    }

    // Auto-detect scan type from URL
    let scanType = 'website';
    if (input.includes('linkedin.com')) {
      scanType = 'linkedin';
    } else if (input.includes('youtube.com') || input.includes('youtu.be')) {
      scanType = 'youtube';
    }
    
    setScanningMode('business');
    
    try {
      // Call real Percy scan API
      const response = await fetch('/api/percy/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: scanType,
          url: input,
          sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Transform API response to match expected format
        const transformedResults = {
          type: 'business',
          problems: result.analysis.challenges || ['Analysis completed'],
          opportunities: result.analysis.opportunities || ['Growth opportunities identified'],
          agentRecommendations: result.agentRecommendations,
          scanId: result.scanId,
          analysis: result.analysis
        };
        
        onScanComplete({ ...data, ...transformedResults });
      } else {
        // Handle API errors gracefully
        onScanComplete({
          ...data,
          type: 'business',
          problems: ['Unable to complete full analysis'],
          opportunities: ['Percy can still help optimize your business'],
          error: result.error
        });
      }
    } catch (error) {
      console.error('Scan failed:', error);
      // Fallback to basic analysis
      onScanComplete({
        ...data,
        type: 'business',
        problems: ['Connection issue prevented full scan'],
        opportunities: ['Percy can analyze your business once connected'],
        error: 'Network error'
      });
    } finally {
      setScanningMode(null);
    }
  };

  return (
    <section className="relative overflow-hidden">
      {/* Consistent Background matching About/Sports pages */}
      <div className="absolute inset-0 bg-gradient-radial from-[#0f0f2b] to-[#06061a] opacity-80 bg-fixed" />
      
      {/* Animated accent elements */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-1/4 -left-20 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Hero Character Cards - Inspired by dual card layout */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Percy - Left Side Hero */}
        <motion.div
          className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 hidden md:block"
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, delay: 0.3, type: "spring", stiffness: 60 }}
        >
          <div className="relative w-48 lg:w-56">
            <img 
              src="/images/Percy&Parker-skrblai.webp" 
              alt="Percy - Business Automation AI" 
              className="w-full h-auto object-contain filter drop-shadow-[0_0_30px_rgba(0,245,212,0.6)]"
            />
            
            {/* Percy's floating label */}
            <motion.div
              className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-500/90 border border-cyan-300/60 rounded-full px-4 py-2 text-sm text-white font-bold whitespace-nowrap shadow-lg"
              animate={{ y: [-3, 3, -3] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              🤖 PERCY - Business Automation
            </motion.div>
          </div>
        </motion.div>

        {/* SkillSmith - Right Side Hero */}
        <motion.div
          className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 hidden md:block"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, delay: 0.5, type: "spring", stiffness: 60 }}
        >
          <div className="relative w-48 lg:w-56">
            <img 
              src="/images/SkillSmith-Athletics-skrblai.png" 
              alt="SkillSmith - Sports Performance" 
              className="w-full h-auto object-contain filter drop-shadow-[0_0_30px_rgba(59,130,246,0.6)]"
            />
            
            {/* SkillSmith's floating label */}
            <motion.div
              className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-500/90 border border-blue-300/60 rounded-full px-4 py-2 text-sm text-white font-bold whitespace-nowrap shadow-lg"
              animate={{ y: [3, -3, 3] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              ⚡ SKILLSMITH - Level Up Your Game
            </motion.div>
          </div>
        </motion.div>

        {/* Mobile - Compact dual character preview */}
        <motion.div
          className="absolute top-16 left-1/2 -translate-x-1/2 md:hidden flex gap-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <div className="w-16 h-20">
            <img 
              src="/images/Percy&Parker-skrblai.webp" 
              alt="Percy" 
              className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(0,245,212,0.5)]"
            />
          </div>
          <div className="w-16 h-20">
            <img 
              src="/images/SkillSmith-Athletics-skrblai.png" 
              alt="SkillSmith" 
              className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"
            />
          </div>
        </motion.div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12 sm:py-16">
        <div className="text-center">
          {/* Attention-Grabbing Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-400/50 rounded-full px-6 py-2 mb-6">
              <Zap className="w-4 h-4 text-red-400" />
              <span className="text-red-300 font-semibold text-sm">TIRED OF BEING AVERAGE?</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white leading-tight mb-6">
              <span className="text-white">
                TWO PATHS, ONE LEAGUE —
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                PICK YOUR POWER
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8">
              Drop your link below and let <span className="text-cyan-400 font-bold">Percy</span> scan your business or 
              <span className="text-blue-400 font-bold"> SKRBL AI</span> analyze your game. 
              In 30 seconds, discover the <span className="text-yellow-400 font-bold">exact gaps</span> holding you back
              and how to fix them <span className="text-green-400 font-bold">automatically</span>.
            </p>

            {/* Path Selection Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-8 max-w-2xl mx-auto"
            >
              <button 
                onClick={() => setShowPlatformGrid(true)}
                className="group flex-1 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border border-cyan-400/40 rounded-2xl p-4 hover:from-cyan-500/30 hover:to-teal-500/30 transition-all"
              >
                <div className="text-cyan-300 font-bold text-lg mb-2">🚀 Automate My Business</div>
                <div className="text-gray-300 text-sm">Branding • Publishing • Social Growth</div>
              </button>
              
              <button 
                onClick={() => setShowPlatformGrid(true)}
                className="group flex-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/40 rounded-2xl p-4 hover:from-blue-500/30 hover:to-purple-500/30 transition-all"
              >
                <div className="text-blue-300 font-bold text-lg mb-2">⚡ Level Up My Game</div>
                <div className="text-gray-300 text-sm">Sports Analysis • Training • Nutrition</div>
              </button>
            </motion.div>
          </motion.div>

          {/* Quick Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4 mb-8"
          >
            {[
              { icon: Target, text: "Find Hidden Revenue Leaks", color: "text-red-400" },
              { icon: TrendingUp, text: "See Your 10x Growth Path", color: "text-green-400" },
              { icon: Zap, text: "Get Automated Solutions", color: "text-yellow-400" }
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2 border border-white/10">
                <benefit.icon className={`w-4 h-4 ${benefit.color}`} />
                <span className="text-white font-medium text-sm">{benefit.text}</span>
              </div>
            ))}
          </motion.div>

          {/* Scan Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-3xl mx-auto"
          >
            {scanningMode ? (
              <div className="bg-black/50 border border-cyan-400/50 rounded-2xl p-8">
                <motion.div
                  className="flex flex-col items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <h3 className="text-xl font-bold text-cyan-400 mb-2">
                    Percy is Scanning Your {scanningMode === 'business' ? 'Business' : 'Social Media'}...
                  </h3>
                  <p className="text-gray-300 text-center">
                    SKRBL AI is analyzing {scanningMode === 'business' ? 'SEO, conversion rates, and revenue optimization opportunities' : 'engagement patterns, content gaps, and growth potential'}
                  </p>
                  <div className="mt-4 space-y-2 text-sm text-yellow-400">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                      ✓ Percy checking competitive positioning...
                    </motion.div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
                      ✓ SKRBL AI identifying revenue gaps...
                    </motion.div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}>
                      ✓ Percy calculating growth potential...
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            ) : showPlatformGrid ? (
              <div className="bg-black/30 border border-white/20 rounded-2xl p-8 backdrop-blur-sm">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Start Your Cosmic AI Journey</h3>
                  <p className="text-gray-300">Percy will guide you to the perfect solution—just select your goal and platform!</p>
                </div>
                
                {/* Platform Selection Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                  {platforms.map((platform) => (
                    <motion.button
                      key={platform.id}
                      onClick={() => handlePlatformSelect(platform.id)}
                      className="group relative bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-xl p-4 hover:border-cyan-400/50 hover:from-cyan-500/20 hover:to-blue-500/20 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="text-3xl mb-2">{platform.icon}</div>
                      <div className="text-white font-semibold text-sm">{platform.name}</div>
                      
                      {/* Hover glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/20 to-cyan-400/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </motion.button>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowPlatformGrid(false)}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    ← Back to manual input
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-black/30 border border-white/20 rounded-2xl p-6 backdrop-blur-sm">
                <UniversalPromptBar
                  placeholder="Paste your website or social link here... (Instagram, TikTok, website, etc.)"
                  onComplete={handleQuickScan}
                  acceptedFileTypes=""
                  minimalUI={true}
                  buttonText={
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      <span>SCAN FOR FREE</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  }
                  className="text-lg"
                  theme="dark"
                />
                
                <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-gray-400">
                  <span>✓ 100% Free</span>
                  <span>✓ 30-Second Results</span>
                  <span>✓ No Sign-Up Required</span>
                  <span>✓ Instant Action Plan</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 text-center text-gray-400"
          >
            <p className="text-sm">
              <span className="text-cyan-400 font-bold">2,847</span> businesses scanned by Percy this week • 
              <span className="text-green-400 font-bold"> Average 340% </span> revenue increase with SKRBL AI
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
