'use client';

import React, { useState, useEffect } from 'react';
import type { JSX } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../components/context/AuthContext';
import { useSkillSmithGuest } from '../../lib/skillsmith/guestTracker';
import PageLayout from 'components/layout/PageLayout';
import FloatingParticles from '../../components/ui/FloatingParticles';
import SkillSmithStandaloneHero from '../../components/home/SkillSmithStandaloneHero';
import VideoUploadModal from '../../components/skillsmith/VideoUploadModal';
import EmailCaptureModal from '../../components/skillsmith/EmailCaptureModal';
import AnalysisResultsModal from '../../components/skillsmith/AnalysisResultsModal';
// [CLEANUP] Remove UpgradeModal import and usage
// import UpgradeModal from '../../components/skillsmith/UpgradeModal';
import SkillSmithOnboardingFlow from '../../components/skillsmith/SkillSmithOnboardingFlow';
import { Trophy, Zap, Target, Star, Users, BarChart3, Eye, ShoppingCart, X } from 'lucide-react';
import type { Product } from '../../lib/config/skillsmithProducts';
import { products } from '../../lib/config/skillsmithProducts';

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
  // [CLEANUP] Remove UpgradeModal state and effect
  // const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [previewFlowOpen, setPreviewFlowOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Check for successful purchase from URL params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('success') === 'true') {
        setShowSuccessMessage(true);
        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

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
        // [CLEANUP] Remove UpgradeModal state and effect
        // setUpgradeModalOpen(true);
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
    
    // For guest users, request email before showing results
    if (userType === 'guest') {
      setEmailCaptureModalOpen(true);
    } else {
      // Authenticated users see results immediately
      setResultsModalOpen(true);
    }
  };

  const handleEmailCaptured = (email: string) => {
    setEmailCaptureModalOpen(false);
    
    // For scan results: show results immediately after email capture
    if (analysisResult) {
      setResultsModalOpen(true);
      console.log('Scan results email sent to:', email, 'Analysis:', analysisResult);
    } else {
      // Regular upgrade email capture
      console.log('Email captured for upgrade:', email);
    }
  };

  const handleUpgradeClick = () => {
    setResultsModalOpen(false);
    if (userType === 'guest') {
      setEmailCaptureModalOpen(true);
    } else {
      // [CLEANUP] Remove UpgradeModal state and effect
      // setUpgradeModalOpen(true);
    }
  };

  const handleProductSelectFromModal = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      void handleBuyNow(product);
    }
  };

  const handlePurchase = (plan: 'basic' | 'pro' | 'elite') => {
    // In a real app, integrate with Stripe or payment processor
    console.log('Purchase plan:', plan);
    // [CLEANUP] Remove UpgradeModal state and effect
    // setUpgradeModalOpen(false);
  };

  // Product Preview Flow Handler
  const openPreviewFlow = (product: Product) => {
    setSelectedProduct(product);
    setPreviewFlowOpen(true);
  };

  // Buy Now Handler
  const handleBuyNow = async (product: Product) => {
    setSelectedProduct(product);
    try {
      // Create Stripe checkout session
      const response = await fetch('/api/stripe/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productSku: product.sku,
          price: product.price,
          title: product.title,
          successUrl: `${window.location.origin}/sports?success=true`,
          cancelUrl: `${window.location.origin}/sports`,
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        // Fallback to upgrade modal for now
        // [CLEANUP] Remove UpgradeModal state and effect
        // setUpgradeModalOpen(true);
      }
    } catch (error) {
      console.error('Payment error:', error);
      // Fallback to upgrade modal
      // [CLEANUP] Remove UpgradeModal state and effect
      // setUpgradeModalOpen(true);
    }
  };

  // `products` now imported from config

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

          {/* Products Section - Only for standalone users */}
          {(userType === 'guest' || userType === 'auth') && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative mb-24"
            >
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="text-center mb-12"
                >
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    🚀 AI Sports Tools for <span className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-500 bg-clip-text text-transparent">Every Athlete</span>
                  </h2>
                  <p className="text-orange-200 text-lg max-w-2xl mx-auto">
                    🏆 Perfect for kids to adults! Get AI analysis, mental health support, nutrition guidance, and foundational training – all in one place.
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                  {products && products.length > 0 ? products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ 
                        opacity: 0, 
                        y: 40,
                        rotateY: -15,
                        scale: 0.9
                      }}
                      whileInView={{ 
                        opacity: 1, 
                        y: 0,
                        rotateY: 0,
                        scale: 1
                      }}
                      viewport={{ once: true }}
                      transition={{ 
                        delay: index * 0.15, 
                        duration: 0.8,
                        type: "spring",
                        stiffness: 120,
                        damping: 15
                      }}
                      whileHover={{ 
                        scale: 1.03,
                        rotateY: 8,
                        rotateX: 3,
                        y: -8,
                        boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.9), 0 0 80px 20px rgba(147,51,234,0.6), 0 0 120px 30px rgba(99,102,241,0.4), 0 0 60px 15px rgba(168,85,247,0.5)'
                      }}
                      whileTap={{ 
                        scale: 0.98,
                        rotateY: 2
                      }}
                      style={{
                        transformStyle: 'preserve-3d',
                        perspective: 1000
                      }}
                      className="min-h-[420px] h-full flex flex-col justify-between relative bg-gradient-to-br from-[rgba(30,25,50,0.8)] via-[rgba(15,20,40,0.9)] to-[rgba(25,15,45,0.8)] border-2 border-purple-400/30 rounded-3xl p-6 backdrop-blur-xl hover:border-blue-400/60 transition-all duration-500 group cursor-pointer shadow-[0_0_40px_rgba(147,51,234,0.3),0_0_80px_rgba(99,102,241,0.2)]"
                    >
                      {/* Cosmic glassmorphic overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 via-blue-400/5 to-indigo-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {/* Subtle cosmic particles */}
                      <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                        {[...Array(8)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-purple-400/40 rounded-full"
                            style={{
                              left: `${10 + i * 12}%`,
                              top: `${15 + (i % 3) * 25}%`,
                            }}
                            animate={{
                              opacity: [0, 1, 0],
                              scale: [0, 1.5, 0],
                              y: [0, -10, 0]
                            }}
                            transition={{
                              duration: 3 + i * 0.5,
                              repeat: Infinity,
                              delay: i * 0.3,
                              ease: "easeInOut"
                            }}
                          />
                        ))}
                      </div>
                      
                      {/* Popular badge with 3D effect */}
                      {product.popular && (
                        <motion.div 
                          className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
                          initial={{ scale: 0, rotateZ: -180 }}
                          animate={{ scale: 1, rotateZ: 0 }}
                          transition={{ delay: index * 0.15 + 0.5, type: "spring", stiffness: 200 }}
                          whileHover={{ 
                            scale: 1.15,
                            rotateZ: 5,
                            y: -2,
                            boxShadow: '0 15px 35px rgba(147, 51, 234, 0.6)'
                          }}
                        >
                          <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl border-2 border-purple-300/40 backdrop-blur-sm">
                            ⭐ POPULAR
                          </div>
                        </motion.div>
                      )}

                      <motion.div 
                        className="relative z-10"
                        style={{ transform: 'translateZ(20px)' }}
                      >
                        <div className="text-center mb-6">
                          <motion.div
                            whileHover={{ 
                              rotateX: 15,
                              rotateY: 10,
                              scale: 1.1
                            }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="relative"
                          >
                            <product.icon className="w-16 h-16 text-purple-300 mx-auto mb-4 drop-shadow-2xl" />
                            <div className="absolute inset-0 w-16 h-16 mx-auto mb-4 bg-purple-400/20 rounded-full blur-xl" />
                          </motion.div>
                          
                          <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-200 transition-colors drop-shadow-lg">
                            {product.title}
                          </h3>
                          
                          {/* ADDED: Social proof indicator */}
                          <motion.div 
                            className="flex items-center justify-center gap-2 mb-2"
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-green-300 text-xs font-semibold">
                              {Math.floor(Math.random() * 50) + 20} athletes bought in last 24hrs
                            </span>
                          </motion.div>
                          
                          <p className="text-gray-300 text-sm mb-4 group-hover:text-purple-200 transition-colors leading-relaxed line-clamp-3">
                            {product.description}
                          </p>
                          
                          <motion.div 
                            className="flex items-center justify-center gap-2 mb-6"
                            whileHover={{ scale: 1.05 }}
                          >
                            {product.originalPrice && (
                              <span className="text-gray-500 line-through text-sm">${product.originalPrice}</span>
                            )}
                            <span className="text-3xl font-bold bg-gradient-to-r from-purple-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
                              ${product.price}
                            </span>
                          </motion.div>
                        </div>

                        {/* Enhanced CTAs with cosmic 3D effects */}
                        <div className="space-y-3 mt-auto">
                          <motion.button
                            whileHover={{ 
                              scale: 1.05,
                              rotateX: 5,
                              rotateY: 2,
                              boxShadow: '0 20px 40px rgba(99, 102, 241, 0.5)'
                            }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openPreviewFlow(product)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600/30 via-indigo-600/30 to-purple-600/30 border-2 border-blue-400/50 text-blue-200 rounded-xl hover:from-blue-500/40 hover:via-indigo-500/40 hover:to-purple-500/40 hover:border-blue-300/70 hover:text-white transition-all duration-300 backdrop-blur-sm font-semibold text-base"
                          >
                            <Eye className="w-5 h-5" />
                            Preview Demo
                          </motion.button>
                          
                          {/* ENHANCED: Revenue-optimized buy button with urgency */}
                          <div className="space-y-3">
                            {/* Quick preview button */}
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setPreviewFlowOpen(true)}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-400/50 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all duration-300 font-medium text-sm"
                            >
                              <Eye className="w-4 h-4" />
                              🎮 Try Demo (FREE)
                            </motion.button>
                            
                            {/* Main buy button with enhanced urgency */}
                            <motion.div className="relative">
                              <motion.button
                                whileHover={{ 
                                  scale: 1.05,
                                  rotateX: 5,
                                  rotateY: -2,
                                  boxShadow: '0 20px 40px rgba(147, 51, 234, 0.7)'
                                }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleBuyNow(product)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 text-white rounded-xl hover:from-purple-500 hover:via-pink-400 hover:to-indigo-500 transition-all duration-300 font-bold shadow-xl hover:shadow-2xl text-base relative overflow-hidden"
                              >
                                {/* Shimmer effect */}
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                  animate={{
                                    x: [-100, 300],
                                    opacity: [0, 1, 0]
                                  }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatDelay: 4
                                  }}
                                />
                                <ShoppingCart className="w-5 h-5 relative z-10" />
                                <span className="relative z-10">🚀 Get Instant Access</span>
                              </motion.button>
                              
                              {/* Urgency badge */}
                              <motion.div
                                className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full"
                                animate={{
                                  scale: [1, 1.1, 1],
                                  rotate: [-2, 2, -2]
                                }}
                                transition={{
                                  duration: 1.5,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                              >
                                {product.originalPrice ? `SAVE $${product.originalPrice - product.price}` : 'HOT'}
                              </motion.div>
                            </motion.div>
                            
                            {/* Trust indicators */}
                            <div className="flex justify-center gap-4 text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                ⚡ Instant delivery
                              </span>
                              <span className="flex items-center gap-1">
                                🔒 Secure payment
                              </span>
                              <span className="flex items-center gap-1">
                                💯 Money-back
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>

                      {/* Enhanced cosmic particles effect on hover */}
                      <motion.div
                        className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                      >
                        {[...Array(12)].map((_, i) => (
                          <motion.div
                            key={i}
                            className={`absolute w-1 h-1 rounded-full ${
                              i % 3 === 0 ? 'bg-purple-400' : i % 3 === 1 ? 'bg-blue-400' : 'bg-indigo-400'
                            }`}
                            style={{
                              left: `${15 + (i * 7)}%`,
                              top: `${20 + (i % 4) * 20}%`,
                            }}
                            animate={{
                              y: [-15, -30, -15],
                              opacity: [0, 1, 0],
                              scale: [0, 1.5, 0],
                              rotate: [0, 180, 360]
                            }}
                            transition={{
                              duration: 2.5 + i * 0.1,
                              repeat: Infinity,
                              delay: i * 0.15,
                              ease: "easeInOut"
                            }}
                          />
                        ))}
                      </motion.div>
                    </motion.div>
                  )) : (
                    // Error handling for empty/null products data
                    <div className="col-span-full flex flex-col items-center justify-center py-12">
                      <div className="text-center">
                        <div className="text-6xl mb-4">⚠️</div>
                        <h3 className="text-xl font-bold text-white mb-2">Products Not Available</h3>
                        <p className="text-gray-400 text-sm">
                          SkillSmith products are currently unavailable. Please try again later.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.section>
          )}

          {/* ADDED: Instant Revenue Booster - Bundle Deals & Subscriptions */}
          {(userType === 'guest' || userType === 'auth') && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative mb-16"
            >
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Bundle Deal Card */}
                <motion.div
                  className="bg-gradient-to-br from-yellow-500/20 via-orange-500/30 to-red-500/20 border-2 border-yellow-400/50 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden"
                  whileHover={{
                    scale: 1.02,
                    boxShadow: '0 25px 50px rgba(245, 158, 11, 0.5)'
                  }}
                  animate={{
                    borderColor: [
                      'rgba(245, 158, 11, 0.5)',
                      'rgba(249, 115, 22, 0.7)',
                      'rgba(245, 158, 11, 0.5)'
                    ]
                  }}
                  transition={{
                    borderColor: { duration: 3, repeat: Infinity }
                  }}
                >
                  {/* Animated background effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-orange-400/20 to-red-400/10"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  
                  <div className="relative z-10 text-center">
                    <motion.h3 
                      className="text-3xl md:text-4xl font-bold mb-4"
                      animate={{
                        color: ['#fbbf24', '#f97316', '#ef4444', '#fbbf24']
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      🎯 PAY-AS-YOU-GO OPTIONS
                    </motion.h3>
                    
                    <p className="text-xl text-yellow-100 mb-6">
                      Get ALL 4 SkillSmith Tools + BONUS Content - One-Time Purchase!
                    </p>
                    
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <div className="text-gray-400 line-through text-2xl">$136</div>
                      <div className="text-5xl font-bold text-yellow-300">$89</div>
                      <motion.div 
                        className="bg-red-500 text-white px-4 py-2 rounded-full text-lg font-bold"
                        animate={{
                          scale: [1, 1.1, 1],
                          rotate: [-5, 5, -5]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        SAVE $47!
                      </motion.div>
                    </div>
                    
                    {/* Pay-as-you-go options */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
                      <div className="bg-white/10 rounded-lg p-3 text-center">
                        <div className="text-green-400 font-bold text-lg">$5</div>
                        <div className="text-gray-300">Single Analysis</div>
                        <div className="text-xs text-gray-400">Perfect for trying out</div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3 text-center">
                        <div className="text-blue-400 font-bold text-lg">$25</div>
                        <div className="text-gray-300">10 Analysis Pack</div>
                        <div className="text-xs text-gray-400">50% savings per scan</div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3 text-center border-2 border-yellow-400/50">
                        <div className="text-yellow-400 font-bold text-lg">$89</div>
                        <div className="text-gray-300">Unlimited + Tools</div>
                        <div className="text-xs text-gray-400">Best value forever</div>
                      </div>
                    </div>
                    
                    {/* Multiple purchase options */}
                    <div className="flex flex-wrap justify-center gap-4">
                      {/* Single Analysis */}
                      <motion.button
                        onClick={() => handleBuyNow({
                          id: 'single-analysis',
                          title: 'Single Sports Analysis',
                          price: 5,
                          sku: 'skillsmith_single_analysis'
                        } as Product)}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-3 px-6 rounded-xl hover:from-green-400 hover:to-emerald-400 transition-all duration-300 shadow-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        💚 Try for $5
                      </motion.button>
                      
                      {/* 10-Pack */}
                      <motion.button
                        onClick={() => handleBuyNow({
                          id: 'analysis-10-pack',
                          title: '10 Sports Analysis Pack',
                          price: 25,
                          originalPrice: 50,
                          sku: 'skillsmith_10_pack'
                        } as Product)}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-3 px-6 rounded-xl hover:from-blue-400 hover:to-cyan-400 transition-all duration-300 shadow-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        💎 10-Pack $25
                      </motion.button>
                      
                      {/* Mega Bundle */}
                      <motion.button
                        onClick={() => handleBuyNow({
                          id: 'mega-bundle',
                          title: 'SkillSmith Mega Bundle',
                          price: 89,
                          originalPrice: 136,
                          sku: 'skillsmith_mega_bundle_2024'
                        } as Product)}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold py-4 px-8 rounded-xl text-lg hover:from-yellow-400 hover:to-orange-400 transition-all duration-300 shadow-xl hover:shadow-2xl relative overflow-hidden"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                          animate={{
                            x: [-100, 300],
                            opacity: [0, 1, 0]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 3
                          }}
                        />
                        <span className="relative z-10">🚀 UNLIMITED ACCESS $89</span>
                      </motion.button>
                    </div>
                    
                    <p className="text-yellow-200 text-sm mt-4">
                      ⏰ Limited time: Next 50 customers only!
                    </p>
                  </div>
                </motion.div>
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
                <motion.div 
                  whileHover={{ 
                    scale: 1.02,
                    rotateX: 3,
                    y: -5,
                    boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.6), 0 0 100px 25px rgba(147,51,234,0.4), 0 0 150px 35px rgba(99,102,241,0.25), 0 0 60px 15px rgba(168,85,247,0.5)'
                  }}
                  style={{ transformStyle: 'preserve-3d' }}
                  className="bg-gradient-to-br from-[rgba(30,25,50,0.8)] via-[rgba(15,20,40,0.9)] to-[rgba(25,15,45,0.8)] border-2 border-purple-400/40 rounded-3xl p-8 backdrop-blur-xl group relative overflow-hidden shadow-[0_0_50px_rgba(147,51,234,0.3)]"
                >
                  {/* Cosmic glassmorphic overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/15 via-blue-500/10 to-indigo-500/15 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Cosmic particle overlay */}
                  <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        className={`absolute w-0.5 h-0.5 rounded-full ${
                          i % 4 === 0 ? 'bg-purple-400/30' : 
                          i % 4 === 1 ? 'bg-blue-400/30' : 
                          i % 4 === 2 ? 'bg-indigo-400/30' : 'bg-violet-400/30'
                        }`}
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0, 2, 0],
                          y: [0, -20, 0]
                        }}
                        transition={{
                          duration: 4 + Math.random() * 2,
                          repeat: Infinity,
                          delay: Math.random() * 3,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </div>
                  
                  <div className="relative z-10">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6 }}
                      className="text-center mb-12"
                    >
                      <motion.h2 
                        className="text-3xl md:text-4xl font-bold text-white mb-4"
                        whileHover={{ scale: 1.05 }}
                      >
                        Join 50,000+ <span className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">Young Athletes</span>
                      </motion.h2>
                      <p className="text-orange-200 text-lg">
                        🎆 Kids, teens, and adults crushing their sports goals with AI!
                      </p>
                    </motion.div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1, duration: 0.6 }}
                        whileHover={{ 
                          scale: 1.08,
                          rotateY: 5,
                          y: -5,
                          boxShadow: '0 20px 40px rgba(147,51,234,0.4)'
                        }}
                        className="text-center bg-purple-900/20 rounded-2xl p-6 backdrop-blur-sm border-2 border-purple-400/30 hover:border-purple-300/60 transition-all duration-300 shadow-lg"
                      >
                        <div className="flex flex-col items-center justify-center gap-3 mb-2">
                          <Users className="w-8 h-8 text-purple-400" />
                          <motion.span 
                            className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent"
                            whileHover={{ scale: 1.15 }}
                            animate={{ 
                              textShadow: [
                                '0 0 10px rgba(147,51,234,0.5)',
                                '0 0 20px rgba(147,51,234,0.8)',
                                '0 0 10px rgba(147,51,234,0.5)'
                              ]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            {liveMetrics.athletesTransformed.toLocaleString()}
                          </motion.span>
                        </div>
                        <p className="text-purple-200 text-sm font-medium">Athletes Improved</p>
                      </motion.div>
                      
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        whileHover={{ 
                          scale: 1.08,
                          rotateY: 5,
                          y: -5,
                          boxShadow: '0 20px 40px rgba(59,130,246,0.4)'
                        }}
                        className="text-center bg-blue-900/20 rounded-2xl p-6 backdrop-blur-sm border-2 border-blue-400/30 hover:border-blue-300/60 transition-all duration-300 shadow-lg"
                      >
                        <div className="flex flex-col items-center justify-center gap-3 mb-2">
                          <BarChart3 className="w-8 h-8 text-blue-400" />
                          <motion.span 
                            className="text-3xl font-bold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent"
                            whileHover={{ scale: 1.15 }}
                            animate={{ 
                              textShadow: [
                                '0 0 10px rgba(59,130,246,0.5)',
                                '0 0 20px rgba(59,130,246,0.8)',
                                '0 0 10px rgba(59,130,246,0.5)'
                              ]
                            }}
                            transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                          >
                            {liveMetrics.performanceImprovement}%
                          </motion.span>
                        </div>
                        <p className="text-blue-200 text-sm font-medium">Avg Improvement</p>
                      </motion.div>
                      
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        whileHover={{ 
                          scale: 1.08,
                          rotateY: 5,
                          y: -5,
                          boxShadow: '0 20px 40px rgba(99,102,241,0.4)'
                        }}
                        className="text-center bg-indigo-900/20 rounded-2xl p-6 backdrop-blur-sm border-2 border-indigo-400/30 hover:border-indigo-300/60 transition-all duration-300 shadow-lg"
                      >
                        <div className="flex flex-col items-center justify-center gap-3 mb-2">
                          <Zap className="w-8 h-8 text-indigo-400" />
                          <motion.span 
                            className="text-3xl font-bold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent"
                            whileHover={{ scale: 1.15 }}
                            animate={{ 
                              textShadow: [
                                '0 0 10px rgba(99,102,241,0.5)',
                                '0 0 20px rgba(99,102,241,0.8)',
                                '0 0 10px rgba(99,102,241,0.5)'
                              ]
                            }}
                            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                          >
                            {liveMetrics.injuriesPrevented.toLocaleString()}
                          </motion.span>
                        </div>
                        <p className="text-indigo-200 text-sm font-medium">Injuries Prevented</p>
                      </motion.div>
                      
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        whileHover={{ 
                          scale: 1.08,
                          rotateY: 5,
                          y: -5,
                          boxShadow: '0 20px 40px rgba(168,85,247,0.4)'
                        }}
                        className="text-center bg-violet-900/20 rounded-2xl p-6 backdrop-blur-sm border-2 border-violet-400/30 hover:border-violet-300/60 transition-all duration-300 shadow-lg"
                      >
                        <div className="flex flex-col items-center justify-center gap-3 mb-2">
                          <Trophy className="w-8 h-8 text-violet-400" />
                          <motion.span 
                            className="text-3xl font-bold bg-gradient-to-r from-violet-300 to-pink-300 bg-clip-text text-transparent"
                            whileHover={{ scale: 1.15 }}
                            animate={{ 
                              textShadow: [
                                '0 0 10px rgba(168,85,247,0.5)',
                                '0 0 20px rgba(168,85,247,0.8)',
                                '0 0 10px rgba(168,85,247,0.5)'
                              ]
                            }}
                            transition={{ duration: 2.2, repeat: Infinity, delay: 1.5 }}
                          >
                            {liveMetrics.recordsBroken}
                          </motion.span>
                        </div>
                        <p className="text-violet-200 text-sm font-medium">Records Broken</p>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
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
                    Welcome back to <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">SkillSmith</span>
                  </h2>
                  <p className="text-purple-200 text-lg max-w-2xl mx-auto mb-8">
                    Continue your athletic journey with our full suite of training tools
                  </p>
                  <a 
                    href="/agents/skillsmith?track=sports" 
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-500 hover:via-blue-500 hover:to-indigo-500 text-white font-bold rounded-lg transition-colors shadow-lg hover:shadow-xl"
                  >
                    Access Full Platform →
                  </a>
                </div>
              </div>
            </motion.section>
          )}
        </div>

        {/* Modals */}
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-8 right-8 z-50 bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-2xl shadow-2xl border border-green-400/30 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold">Purchase Successful! 🎉</h3>
                <p className="text-sm opacity-90">Your SkillSmith product is ready to use.</p>
              </div>
              <button 
                onClick={() => setShowSuccessMessage(false)}
                className="ml-4 text-white/70 hover:text-white transition-colors"
                title="Close success message"
                aria-label="Close success message"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

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
          purpose={analysisResult ? 'scan-results' : 'upgrade'}
          scanData={analysisResult ? {
            sport: analysisResult.sport,
            ageGroup: analysisResult.ageGroup,
            overallScore: analysisResult.score,
            quickWins: analysisResult.quickWins?.map(qw => qw.title) || []
          } : undefined}
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

        {/* [CLEANUP] Remove UpgradeModal JSX */}
        {/* <UpgradeModal
          isOpen={upgradeModalOpen}
          onClose={() => setUpgradeModalOpen(false)}
          onProductSelect={handleProductSelectFromModal}
          userType={userType === 'platform' ? 'auth' : userType}
        /> */}

        <SkillSmithOnboardingFlow
          isOpen={previewFlowOpen}
          onClose={() => setPreviewFlowOpen(false)}
          product={selectedProduct}
          onBuyNow={(p: any) => { void handleBuyNow(p); }}
        />
      </div>
    </PageLayout>
  );
} 