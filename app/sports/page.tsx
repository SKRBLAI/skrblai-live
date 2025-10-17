'use client';

import React, { useState, useEffect } from 'react';
import type { JSX } from 'react';
import { motion } from 'framer-motion';
import { useDashboardAuth } from '../../hooks/useDashboardAuth';
import { useSkillSmithGuest } from '../../lib/skillsmith/guestTracker';
import PageLayout from 'components/layout/PageLayout';
import FloatingParticles from '../../components/ui/FloatingParticles';
import UnifiedSportsHero from '../../components/sports/UnifiedSportsHero';
import PricingGrid from '../../components/pricing/PricingGrid';
import SportsPricingGrid from '../../components/pricing/SportsPricingGrid';
import MetricsStrip from '../../components/sports/MetricsStrip';
// Removed separate IntakeSheet in favor of unified form inside SkillSmithPromptBar
import EncouragementFooter from '../../components/sports/EncouragementFooter';
import VideoUploadModal from '../../components/skillsmith/VideoUploadModal';
import EmailCaptureModal from '../../components/skillsmith/EmailCaptureModal';
import AnalysisResultsModal from '../../components/skillsmith/AnalysisResultsModal';
import SkillSmithOnboardingFlow from '../../components/skillsmith/SkillSmithOnboardingFlow';
import { getSportsAddons, getSportsPlans } from '../../lib/sports/pricingData';
import { PricingItem } from '../../lib/pricing/catalogShared';
import { X, Star } from 'lucide-react';
import type { Product } from '../../lib/config/skillsmithProducts';

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
  const [previewFlowOpen, setPreviewFlowOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [intakeData, setIntakeData] = useState<any>(null);

  // Get pricing data
  const addOns = getSportsAddons();
  const subscriptions = getSportsPlans();

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
        setShowUpsell(true);
      }, 5000); // Show after 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [shouldShowUpgradeOffer, userType]);

  const handleUploadClick = () => {
    // Analytics stub
    console.log('event:upload_click', { 
      userType, 
      scansRemaining, 
      timestamp: new Date().toISOString() 
    });

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

  const handleSampleAnalysisClick = () => {
    setEmailCaptureModalOpen(true);
  };

  const handleParentPortalClick = () => {
    if (user) {
      window.open('/dashboard/parent', '_blank');
    } else {
      window.open('/sign-in?from=/dashboard/parent', '_blank');
    }
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    // Analytics stub
    console.log('event:first_chat_reply', { 
      userType, 
      sport: result.sport, 
      score: result.score,
      timestamp: new Date().toISOString() 
    });

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
    }
  };


  // Handle pricing item purchases using unified checkout
  const handlePricingPurchase = async (item: PricingItem) => {
    console.log("Purchase initiated for:", item);
    try {
      // Unified checkout API: one-time = 'payment', otherwise 'subscription'
      const mode =
        item.type === "addon" || item.billingInterval === "one_time"
          ? "payment"
          : "subscription";

      const resp = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sku: item.sku,
          mode,
          vertical: "sports",
          metadata: {
            source: "sports_page",
            sku: item.sku,
          },
          successPath: "/sports?success=true",
          cancelPath: "/sports",
        }),
      });

      if (!resp.ok) {
        console.error("Checkout failed:", await resp.text());
        setEmailCaptureModalOpen?.(true);
        return;
      }

      const { url } = await resp.json();
      if (!url) {
        console.error("Checkout response missing URL");
        setEmailCaptureModalOpen?.(true);
        return;
      }

      window.location.assign(url);
    } catch (error) {
      console.error("Payment error:", error);
      setEmailCaptureModalOpen?.(true);
    }
  };

  return (
    <PageLayout>
      <div className="min-h-screen relative overflow-hidden">
        <FloatingParticles />
        
        {/* Main Content */}
        <div className="relative z-10 pt-8">
          {/* Unified Sports Hero */}
          <UnifiedSportsHero
            headline="Master Your Sport with"
            highlight="Skill Smith AI"
            subhead="Upload your sports footage and get instant AI analysis, personalized training plans, and coach-level feedback from your personal Skill Smith."
            keywords={["Analysis","Mastery of Emotion","Nutrition","Training Plans"]}
            images={[
              { src: "/images/skillsmith-hoops-nobg-skrblai.png",   alt: "Skill Smith basketball athlete" },
              { src: "/images/skillsmith-soccer-nobg-skrblai.png",  alt: "Skill Smith soccer athlete" },
              { src: "/images/skillsmith-baseball-nobg.png",    alt: "Skill Smith baseball athlete" },
            ]}
            onUploadClick={handleUploadClick}
            onSampleAnalysisClick={handleSampleAnalysisClick}
            onParentPortalClick={handleParentPortalClick}
          />

          {/* Unified intake is now part of the plan builder inside the hero prompt bar */}

          {/* Sports Pricing Section - Only for standalone users */}
          {(userType === 'guest' || userType === 'auth') && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative mb-24"
            >
              <SportsPricingGrid />
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

          {/* Metrics Strip in Footer with subtle page grounding */}
          <section className="relative mt-8">
            <div className="pointer-events-none absolute inset-x-0 -bottom-24 h-48 bg-gradient-to-b from-transparent to-black/40" />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] shadow-[0_-40px_80px_-20px_rgba(0,0,0,0.5)_inset]">
                <div className="px-4 sm:px-6 lg:px-8 py-6">
                  <MetricsStrip />
                </div>
              </div>
            </div>
          </section>
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
                <h3 className="text-xl font-bold text-white">Unlock More Training</h3>
                <button onClick={() => setShowUpsell(false)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              <p className="text-gray-300 mb-6">
                Ready to take your athletic performance to the next level? Choose from our training plans:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subscriptions.slice(0, 4).map((plan) => (
                  <button
                    key={plan.sku}
                    onClick={() => handlePricingPurchase(plan)}
                    className="bg-white/10 hover:bg-white/15 border border-cyan-400/30 rounded-xl p-4 text-left text-gray-200 transition-colors"
                  >
                    <div className="font-bold text-white mb-1">{plan.tier} Plan</div>
                    <div className="text-sm text-gray-300 mb-2">{plan.includes.slice(0, 2).join(', ')}</div>
                    <div className="text-lg font-bold text-cyan-400">${plan.priceUsd}/{plan.billingInterval === 'month' ? 'month' : 'one-time'}</div>
                  </button>
                ))}
              </div>
              <div className="mt-4 text-right">
                <button onClick={() => setShowUpsell(false)} className="text-gray-300 hover:text-white">Maybe Later</button>
              </div>
            </div>
          </div>
        )}

        <SkillSmithOnboardingFlow
          isOpen={previewFlowOpen}
          onClose={() => setPreviewFlowOpen(false)}
          product={selectedProduct}
          onBuyNow={(p: any) => { console.log('Buy now:', p); }}
        />
      </div>
    </PageLayout>
  );
}