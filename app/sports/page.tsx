'use client';

import React, { useState, useEffect } from 'react';
import type { JSX } from 'react';
import { motion } from 'framer-motion';
import { getDisplayPlanOrNull as getSportsDisplayPlanOrNull, formatMoney } from '../../lib/pricing/catalog';
import { PRICING_CATALOG, getDisplayPlanOrNull } from '../../lib/pricing/catalog';
import { useSkillSmithGuest } from '../../lib/skillsmith/guestTracker';
import { useDashboardAuth } from '../../hooks/useDashboardAuth';
import { ProductKey, BillingPeriod } from '../../lib/pricing/types';
import CheckoutButton from '../../components/payments/CheckoutButton';
import { bundles } from '../../lib/config/skillsmithBundles';
import PageLayout from 'components/layout/PageLayout';
import FloatingParticles from '../../components/ui/FloatingParticles';
import SportsHero from '../../components/sports/SportsHero';
import IntakeSheet from '../../components/sports/IntakeSheet';
import PlansAndBundles from '../../components/sports/PlansAndBundles';
import EncouragementFooter from '../../components/sports/EncouragementFooter';
import VideoUploadModal from '../../components/skillsmith/VideoUploadModal';
import EmailCaptureModal from '../../components/skillsmith/EmailCaptureModal';
import AnalysisResultsModal from '../../components/skillsmith/AnalysisResultsModal';
import SkillSmithOnboardingFlow from '../../components/skillsmith/SkillSmithOnboardingFlow';
import { Trophy, Zap, Target, Star, Users, BarChart3, Eye, ShoppingCart, X } from 'lucide-react';
import type { Product } from '../../lib/config/skillsmithProducts';
import { products } from '../../lib/config/skillsmithProducts';
import CosmicTile from '../../components/ui/CosmicTile';
import AskPercy from '../../components/common/AskPercy';

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
  const { user, isLoading } = useDashboardAuth();
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
  const [showUpsell, setShowUpsell] = useState(false);
  // [CLEANUP] Remove UpgradeModal state and effect
  // const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [previewFlowOpen, setPreviewFlowOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [intakeData, setIntakeData] = useState<any>(null);

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
    if (user) return 'platform';
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

  // Loading states for checkout buttons
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null);
  
  // Prompt panel state for AskPercy event bridge
  const [promptOpen, setPromptOpen] = useState(false);

  // Event listener for AskPercy component
  useEffect(() => {
    const handleOpenPromptPanel = () => {
      setPromptOpen(true);
      // Scroll to the prompt panel (will be in PlansAndBundles or added separately)
      setTimeout(() => {
        const promptElement = document.getElementById('ask-percy');
        if (promptElement) {
          promptElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    };

    window.addEventListener('openPromptPanel', handleOpenPromptPanel);
    return () => window.removeEventListener('openPromptPanel', handleOpenPromptPanel);
  }, []);

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
      // Also click hidden trigger once modal is open on next tick
      setTimeout(() => {
        const btn = document.getElementById('skillsmith-upload-trigger') as HTMLButtonElement | null;
        btn?.click();
      }, 0);
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

  // Called by upload modal when user hits free limit (2 scans)
  const handleFreeLimitReached = () => {
    // Trigger upsell offer
    setShowUpsell(true);
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
      // Catalog-driven: Find the ProductKey for this product based on price and name
      const catalogEntry = Object.entries(PRICING_CATALOG).find(([_key, entry]) => {
        const e = entry as any;
        if (e.one_time && e.one_time.amount === product.price && e.one_time.name === product.title) {
          return true;
        }
        return false;
      });
      const tierKey = catalogEntry ? catalogEntry[0] : undefined;

      if (!tierKey) {
        console.error('Unable to resolve catalog key for product', { product });
        alert('Checkout is temporarily unavailable for this product. Please try again in a moment.');
        return;
      }

      // Create Stripe checkout session
      const response = await fetch('/api/stripe/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier: tierKey,
          title: product.title,
          metadata: { category: 'sports', source: 'sports_product_card', productId: product.id, productTitle: product.title },
          successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/checkout/cancel`,
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

  // Client-side checkout helper for bundles
  const startCheckout = async (tier: 'rookie' | 'pro' | 'allstar' | 'yearly', source: string) => {
    console.info('checkout_started', { tier, source });
    setLoadingCheckout(tier);
    
    try {
      const response = await fetch('/api/stripe/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier,
          source,
          metadata: { productSku: tier, category: 'sports', source },
          successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/checkout/cancel`,
        }),
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        console.error('Checkout failed:', await response.text());
        setLoadingCheckout(null);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setLoadingCheckout(null);
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
          <SportsHero
            userType={userType}
            freeScansRemaining={scansRemaining}
            onUploadClick={handleUploadClick}
            onEmailCaptureClick={handleEmailCaptureClick}
            liveMetrics={liveMetrics}
          />

          {/* Intake Sheet */}
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
            <IntakeSheet onIntakeComplete={(data) => {
              // Store intake data for checkout metadata and U13 mode
              setIntakeData(data);
              if (data.intakeId) {
                sessionStorage.setItem('sports_intake_id', data.intakeId);
              }
            }} />
          </div>

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
                  <h2 className="text-2xl md:text-3xl font-semibold text-gray-300 mb-4">
                    Add-Ons (Optional)
                  </h2>
                  <p className="text-gray-400 text-base max-w-2xl mx-auto mb-4">
                    These are optional upgrades you can add anytime.
                  </p>
                  <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-400/30 rounded-full px-4 py-2 text-cyan-300 text-sm font-medium mb-4">
                    <span>💡</span>
                    Add-ons are optional. You can pick them now or later from your dashboard.
                  </div>
                  <p className="text-orange-200 text-sm max-w-2xl mx-auto">
                    Perfect for kids to adults! Get AI analysis, Mastery of Emotion (MOE), nutrition guidance, and foundational training.
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                  {products && products.length > 0 ? [...products].sort((a, b) => a.price - b.price).map((product, index) => {
                    // Add scope badge for sports products
                    const scopeBadge = 'Sports';
                    
                    return (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ 
                        delay: index * 0.1, 
                        duration: 0.5
                      }}
                      whileHover={{ 
                        scale: 1.02,
                        y: -4
                      }}
                      style={{
                        transformStyle: 'preserve-3d',
                        perspective: 1000
                      }}
                      className="min-h-[420px] h-full flex flex-col justify-between relative bg-gradient-to-br from-[rgba(30,25,50,0.8)] via-[rgba(15,20,40,0.9)] to-[rgba(25,15,45,0.8)] border-2 border-purple-400/30 rounded-3xl p-6 backdrop-blur-xl hover:border-blue-400/60 transition-all duration-500 group cursor-pointer shadow-[0_0_40px_rgba(147,51,234,0.3),0_0_80px_rgba(99,102,241,0.2)]"
                    >
                      {/* Cosmic glassmorphic overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 via-blue-400/5 to-indigo-500/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-bg" />
                      
                      {/* Subtle cosmic particles */}
                      <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none z-bg">
                        {[...Array(8)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-purple-400/40 rounded-full anim-float"
                            style={{
                              left: `${10 + i * 12}%`,
                              top: `${15 + (i % 3) * 25}%`,
                            }}
                            animate={{
                              opacity: [0, 1, 0],
                              scale: [0, 1.5, 0],
                              y: [0, -3, 0] // Further reduced motion
                            }}
                            transition={{
                              duration: 8 + i * 1, // Increased duration for slower motion
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
                          
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-bold text-white group-hover:text-purple-200 transition-colors drop-shadow-lg flex-1">
                              {product.title}
                            </h3>
                            <span className="bg-orange-500/20 text-orange-300 border border-orange-400/30 text-xs px-2 py-1 rounded-full font-medium ml-2">
                              {scopeBadge}
                            </span>
                          </div>
                          
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
                          
                          {/* ENHANCED: Revenue-optimized buy button with urgency */}
                        <div className="space-y-3">
                          {/* Quick preview button */}
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => openPreviewFlow(product)}
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
                        className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl z-bg"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                      >
                        {[...Array(12)].map((_, i) => (
                          <motion.div
                            key={i}
                            className={`absolute w-1 h-1 rounded-full anim-float ${
                              i % 3 === 0 ? 'bg-purple-400' : i % 3 === 1 ? 'bg-blue-400' : 'bg-indigo-400'
                            }`}
                            style={{
                              left: `${15 + (i * 7)}%`,
                              top: `${20 + (i % 4) * 20}%`,
                            }}
                            animate={{
                              y: [-3, -6, -3], // Much more reduced motion
                              opacity: [0, 1, 0],
                              scale: [0, 1.5, 0],
                              rotate: [0, 180, 360]
                            }}
                            transition={{
                              duration: 8 + i * 0.5, // Even slower animation
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

          {/* REMOVED: Duplicate pricing section - using PlansAndBundles component instead */}
          {/* This duplicate pricing section has been removed to ensure only one pricing section exists on /sports */}



          {/* Plans & Bundles - Only for standalone users */}
          {(userType === 'guest' || userType === 'auth') && (
            <PlansAndBundles showLimitedOffer={true} />
          )}

          {/* AskPercy Component - Only for standalone users */}
          {(userType === 'guest' || userType === 'auth') && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative mb-16"
            >
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <AskPercy />
                
                {/* Inline Percy Chat with id for event bridge */}
                <div id="ask-percy" className="mt-8">
                  <div className="max-w-3xl mx-auto">
                    {/* Placeholder for future Percy chat integration */}
                    <div className="text-center p-6 bg-cyan-500/10 border border-cyan-400/30 rounded-xl">
                      <p className="text-cyan-300 font-medium">
                        💬 Percy chat integration coming soon - for now, use the contact form below!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Encouragement Footer - Only for standalone users */}
          {(userType === 'guest' || userType === 'auth') && (
            <EncouragementFooter 
              isU13Mode={intakeData?.age === '8-18'}
              onStartQuickWin={() => {
                // Scroll to upload section
                const uploadSection = document.querySelector('[data-upload-section]');
                if (uploadSection) {
                  uploadSection.scrollIntoView({ behavior: 'smooth' });
                } else {
                  handleUploadClick();
                }
              }}
              onSeePlans={() => {
                // Scroll to plans section
                const plansSection = document.querySelector('[data-plans-section]');
                if (plansSection) {
                  plansSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            />
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
          onFreeLimitReached={handleFreeLimitReached}
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

        {/* Simple Upsell Modal after 2 free scans */}
        {showUpsell && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70" onClick={() => setShowUpsell(false)} />
            <div className="relative max-w-2xl w-full mx-4 p-6 rounded-2xl bg-gradient-to-b from-gray-900/95 via-gray-800/95 to-gray-900/95 border border-cyan-400/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Unlock More Scans</h3>
                <button onClick={() => setShowUpsell(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                {[
                  { id: 'rookie', title: `Rookie — ${(() => {
                    const plan = getDisplayPlanOrNull('SPORTS_STARTER', 'one_time');
                    return plan ? formatMoney(plan.amountCents, 'USD') : '$19';
                  })()}` },
                  { id: 'pro', title: `Pro — ${(() => {
                    const plan = getDisplayPlanOrNull('SPORTS_PRO', 'one_time');
                    return plan ? formatMoney(plan.amountCents, 'USD') : '$29';
                  })()}` },
                  { id: 'allstar', title: `All‑Star — ${(() => {
                    const plan = getDisplayPlanOrNull('BUNDLE_ALL_ACCESS', 'one_time');
                    return plan ? formatMoney(plan.amountCents, 'USD') : '$99';
                  })()}` },
                  { id: 'yearly', title: `Yearly — ${(() => {
                    const plan = getDisplayPlanOrNull('BUS_STARTER', 'annual');
                    return plan ? formatMoney(plan.amountCents, 'USD') : '$290';
                  })()}` }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleBuyNow({ id: opt.id, title: opt.title, price: 0 } as Product)}
                    className="bg-white/10 hover:bg-white/15 border border-cyan-400/30 rounded-xl p-4 text-left text-gray-200"
                  >
                    <div className="font-bold text-white">{opt.title}</div>
                    <div className="text-xs text-gray-400 mt-1">Live Stripe pricing</div>
                  </button>
                ))}
              </div>
              <div className="mt-4 text-right">
                <button onClick={() => setShowUpsell(false)} className="text-gray-300 hover:text-white">Maybe Later</button>
              </div>
            </div>
          </div>
        )}

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