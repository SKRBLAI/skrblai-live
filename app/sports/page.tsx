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
import UpgradeModal from '../../components/skillsmith/UpgradeModal';
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
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
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
        setUpgradeModalOpen(true);
      }
    } catch (error) {
      console.error('Payment error:', error);
      // Fallback to upgrade modal
      setUpgradeModalOpen(true);
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
                    Premium SkillSmith <span className="text-orange-400">Products</span>
                  </h2>
                  <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                    Professional-grade analysis tools and training programs designed by sports scientists
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {products.map((product, index) => (
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
                        scale: 1.05,
                        rotateY: 5,
                        z: 50,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 60px 15px rgba(0,245,212,0.4), 0 0 100px 25px rgba(0,102,255,0.25), 0 0 40px 10px rgba(232,121,249,0.3)'
                      }}
                      whileTap={{ 
                        scale: 0.98,
                        rotateY: 2
                      }}
                      style={{
                        transformStyle: 'preserve-3d',
                        perspective: 1000
                      }}
                      className="min-h-[300px] h-full flex flex-col justify-between relative bg-gradient-to-br from-gray-800/40 via-gray-900/60 to-black/40 border border-gray-600/20 rounded-2xl p-6 backdrop-blur-xl hover:border-orange-500/40 transition-all duration-500 group cursor-pointer"
                    >
                      {/* Glassmorphic overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      {/* Popular badge with 3D effect */}
                      {product.popular && (
                        <motion.div 
                          className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
                          initial={{ scale: 0, rotateZ: -180 }}
                          animate={{ scale: 1, rotateZ: 0 }}
                          transition={{ delay: index * 0.15 + 0.5, type: "spring", stiffness: 200 }}
                          whileHover={{ 
                            scale: 1.1,
                            rotateZ: 5,
                            boxShadow: '0 10px 25px rgba(251, 146, 60, 0.5)'
                          }}
                        >
                          <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg border border-orange-400/30">
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
                            <product.icon className={`w-14 h-14 ${product.color} mx-auto mb-4 drop-shadow-lg`} />
                            <div className={`absolute inset-0 w-14 h-14 mx-auto mb-4 ${product.color.replace('text-', 'bg-').replace('-400', '-400/20')} rounded-full blur-xl`} />
                          </motion.div>
                          
                          <h3 className="text-lg font-bold text-white mb-3 group-hover:text-orange-100 transition-colors">
                            {product.title}
                          </h3>
                          <p className="text-gray-400 text-sm mb-4 group-hover:text-gray-300 transition-colors leading-relaxed line-clamp-3">
                            {product.description}
                          </p>
                          
                          <motion.div 
                            className="flex items-center justify-center gap-2 mb-6"
                            whileHover={{ scale: 1.05 }}
                          >
                            {product.originalPrice && (
                              <span className="text-gray-500 line-through text-sm">${product.originalPrice}</span>
                            )}
                            <span className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                              ${product.price}
                            </span>
                          </motion.div>
                        </div>

                        {/* Enhanced CTAs with 3D effects */}
                        <div className="space-y-3">
                          <motion.button
                            whileHover={{ 
                              scale: 1.03,
                              rotateX: 5,
                              boxShadow: '0 15px 35px rgba(59, 130, 246, 0.4)'
                            }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => openPreviewFlow(product)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-blue-600/20 border border-blue-400/40 text-blue-300 rounded-xl hover:from-blue-500/30 hover:via-cyan-500/30 hover:to-blue-600/30 hover:border-blue-400/60 transition-all duration-300 backdrop-blur-sm font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            Preview Demo
                          </motion.button>
                          
                          <motion.button
                            whileHover={{ 
                              scale: 1.03,
                              rotateX: 5,
                              boxShadow: '0 15px 35px rgba(251, 146, 60, 0.6)'
                            }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleBuyNow(product)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:via-red-600 hover:to-orange-700 transition-all duration-300 font-bold shadow-lg hover:shadow-2xl"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            Buy Now
                          </motion.button>
                        </div>
                      </motion.div>

                      {/* Floating particles effect on hover */}
                      <motion.div
                        className="absolute inset-0 pointer-events-none"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {[...Array(6)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-orange-400 rounded-full"
                            style={{
                              left: `${20 + i * 15}%`,
                              top: `${30 + (i % 2) * 40}%`,
                            }}
                            animate={{
                              y: [-10, -20, -10],
                              opacity: [0, 1, 0],
                              scale: [0, 1, 0],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: i * 0.2,
                            }}
                          />
                        ))}
                      </motion.div>
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
                <motion.div 
                  whileHover={{ 
                    scale: 1.02,
                    rotateX: 2,
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 80px 20px rgba(251,146,60,0.3)'
                  }}
                  style={{ transformStyle: 'preserve-3d' }}
                  className="bg-gradient-to-br from-gray-800/40 via-gray-900/60 to-black/40 border border-orange-500/30 rounded-3xl p-8 backdrop-blur-xl group relative overflow-hidden"
                >
                  {/* Glassmorphic overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10">
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6 }}
                      className="text-center mb-8"
                    >
                      <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                        Join Thousands of Athletes
                      </h2>
                      <p className="text-gray-400">
                        Real results from SkillSmith users worldwide
                      </p>
                    </motion.div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1, duration: 0.6 }}
                        whileHover={{ 
                          scale: 1.05,
                          rotateY: 5,
                          boxShadow: '0 15px 30px rgba(0,245,212,0.3)'
                        }}
                        className="text-center bg-gray-800/30 rounded-xl p-4 backdrop-blur-sm border border-gray-700/30 hover:border-orange-500/30 transition-all duration-300"
                      >
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Users className="w-6 h-6 text-orange-400" />
                          <motion.span 
                            className="text-3xl font-bold text-orange-400"
                            whileHover={{ scale: 1.1 }}
                          >
                            {liveMetrics.athletesTransformed.toLocaleString()}
                          </motion.span>
                        </div>
                        <p className="text-gray-400 text-sm">Athletes Improved</p>
                      </motion.div>
                      
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        whileHover={{ 
                          scale: 1.05,
                          rotateY: 5,
                          boxShadow: '0 15px 30px rgba(34,197,94,0.3)'
                        }}
                        className="text-center bg-gray-800/30 rounded-xl p-4 backdrop-blur-sm border border-gray-700/30 hover:border-orange-500/30 transition-all duration-300"
                      >
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <BarChart3 className="w-6 h-6 text-green-400" />
                          <motion.span 
                            className="text-3xl font-bold text-green-400"
                            whileHover={{ scale: 1.1 }}
                          >
                            {liveMetrics.performanceImprovement}%
                          </motion.span>
                        </div>
                        <p className="text-gray-400 text-sm">Avg Improvement</p>
                      </motion.div>
                      
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        whileHover={{ 
                          scale: 1.05,
                          rotateY: 5,
                          boxShadow: '0 15px 30px rgba(59,130,246,0.3)'
                        }}
                        className="text-center bg-gray-800/30 rounded-xl p-4 backdrop-blur-sm border border-gray-700/30 hover:border-orange-500/30 transition-all duration-300"
                      >
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Zap className="w-6 h-6 text-blue-400" />
                          <motion.span 
                            className="text-3xl font-bold text-blue-400"
                            whileHover={{ scale: 1.1 }}
                          >
                            {liveMetrics.injuriesPrevented.toLocaleString()}
                          </motion.span>
                        </div>
                        <p className="text-gray-400 text-sm">Injuries Prevented</p>
                      </motion.div>
                      
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                        whileHover={{ 
                          scale: 1.05,
                          rotateY: 5,
                          boxShadow: '0 15px 30px rgba(251,191,36,0.3)'
                        }}
                        className="text-center bg-gray-800/30 rounded-xl p-4 backdrop-blur-sm border border-gray-700/30 hover:border-orange-500/30 transition-all duration-300"
                      >
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Trophy className="w-6 h-6 text-yellow-400" />
                          <motion.span 
                            className="text-3xl font-bold text-yellow-400"
                            whileHover={{ scale: 1.1 }}
                          >
                            {liveMetrics.recordsBroken}
                          </motion.span>
                        </div>
                        <p className="text-gray-400 text-sm">Records Broken</p>
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