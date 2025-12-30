'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import type { JSX } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useDashboardAuth } from '../../hooks/useDashboardAuth';
import { useSkillSmithGuest } from '../../lib/skillsmith/guestTracker';
import PageLayout from 'components/layout/PageLayout';
import FloatingParticles from '../../components/ui/FloatingParticles';
import UnifiedSportsHero from '../../components/sports/UnifiedSportsHero';
import SportsPricingGrid from '../../components/pricing/SportsPricingGrid';
import MetricsStrip from '../../components/sports/MetricsStrip';
import VideoUploadModal from '../../components/skillsmith/VideoUploadModal';
import EmailCaptureModal from '../../components/skillsmith/EmailCaptureModal';
import AnalysisResultsModal from '../../components/skillsmith/AnalysisResultsModal';
import SkillSmithPromptBar from '../../components/sports/SkillSmithPromptBar';
import AgentChat from '../../components/chat/AgentChat';
import CardShell from '../../components/ui/CardShell';
import { getSportsPlans } from '../../lib/sports/pricingData';
import { PricingItem } from '../../lib/pricing/catalogShared';
import { ChevronDown, ChevronUp, MessageCircle, X, Star } from 'lucide-react';

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

type SportsHubTab = 'skillsmith' | 'ntntns' | 'air';

export default function SportsPage(): JSX.Element {
  const { user } = useDashboardAuth();
  const { 
    scansRemaining, 
    shouldShowUpgradeOffer, 
    session 
  } = useSkillSmithGuest();

  // Modal states
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [emailCaptureModalOpen, setEmailCaptureModalOpen] = useState(false);
  const [resultsModalOpen, setResultsModalOpen] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [activeTab, setActiveTab] = useState<SportsHubTab>('skillsmith');
  const [isSkillSmithChatOpen, setIsSkillSmithChatOpen] = useState(false);
  const [comingSoon, setComingSoon] = useState<{ isOpen: boolean; title: string; description?: string }>({
    isOpen: false,
    title: '',
    description: ''
  });

  const skillSmithPanelRef = useRef<HTMLDivElement | null>(null);
  const plansSectionRef = useRef<HTMLDivElement | null>(null);

  // Get pricing data
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

  const tabs = useMemo(
    () =>
      [
        { id: 'skillsmith' as const, label: 'SkillSmith' },
        { id: 'ntntns' as const, label: 'NTNTNS × MSTRY' },
        { id: 'air' as const, label: 'AIR Studio' }
      ] satisfies Array<{ id: SportsHubTab; label: string }>,
    []
  );

  const setTabAndScroll = (tab: SportsHubTab, target: React.RefObject<HTMLDivElement | null>) => {
    setActiveTab(tab);
    requestAnimationFrame(() => {
      const el = target.current;
      if (!el) return;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const openComingSoon = (title: string, description?: string) => {
    setComingSoon({ isOpen: true, title, description });
  };

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
          {/* Sports Hub Hero */}
          <UnifiedSportsHero
            headline="Sports HQ:"
            highlight="SkillSmith × NTNTNS × AIR"
            subhead="Upload a clip. Build mindset. Create identity. One league for youth athletes."
            microline="Built for parents, coaches, and athletes ages 7–18."
            keywords={["Video Analysis", "Mindset Score", "Avatar Identity"]}
            images={[
              { src: "/images/skillsmith-hoops-nobg-skrblai.png",   alt: "Skill Smith basketball athlete" },
              { src: "/images/skillsmith-soccer-nobg-skrblai.png",  alt: "Skill Smith soccer athlete" },
              { src: "/images/skillsmith-baseball-nobg.png",    alt: "Skill Smith baseball athlete" },
            ]}
            showCtas={false}
            showPromptBar={false}
            showChatToggle={false}
          />

          {/* Segmented Control */}
          <section className="relative mb-10">
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mx-auto w-full max-w-3xl rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-2 shadow-[0_10px_40px_rgba(0,0,0,0.25)]">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={[
                          "relative rounded-xl px-4 py-3 text-sm md:text-base font-semibold transition-all",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/80",
                          isActive
                            ? "text-white bg-gradient-to-r from-cyan-500/30 via-blue-500/25 to-purple-500/25 border border-cyan-400/30 shadow-[0_0_30px_rgba(56,189,248,0.18)]"
                            : "text-white/70 hover:text-white hover:bg-white/[0.04] border border-transparent"
                        ].join(' ')}
                        aria-pressed={isActive}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Tab Content */}
          <section className="relative mb-16">
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <AnimatePresence mode="wait">
                {activeTab === 'skillsmith' && (
                  <motion.div
                    key="skillsmith"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-8"
                  >
                    <div ref={skillSmithPanelRef} data-upload-section>
                      <CardShell className="p-6 md:p-8">
                        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                          <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-white">
                              SkillSmith Analysis
                            </h2>
                            <p className="text-white/70">
                              Upload game or training footage for instant coaching feedback.
                            </p>
                          </div>
                          {userType === 'platform' && (
                            <a
                              href="/agents/skillsmith?track=sports_hub"
                              className="inline-flex items-center justify-center rounded-xl border border-cyan-400/30 bg-gradient-to-r from-purple-600/30 via-blue-600/25 to-cyan-600/25 px-4 py-2 font-semibold text-white hover:border-cyan-400/50 hover:bg-white/[0.06] transition-colors"
                            >
                              Access Full Platform →
                            </a>
                          )}
                        </div>

                        <div className="mt-5 flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={handleUploadClick}
                            className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 px-6 py-3 font-bold text-white shadow-lg hover:shadow-xl transition-shadow"
                          >
                            Upload a Clip
                          </button>
                          <button
                            onClick={handleSampleAnalysisClick}
                            className="w-full sm:w-auto rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3 font-semibold text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors"
                          >
                            Sample Analysis
                          </button>
                          <button
                            onClick={handleParentPortalClick}
                            className="w-full sm:w-auto rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3 font-semibold text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors"
                          >
                            Parent Portal
                          </button>
                        </div>

                        {/* Existing SkillSmith plan builder / intake form (preserved) */}
                        <div className="mt-8">
                          <SkillSmithPromptBar />
                        </div>

                        {/* Optional SkillSmith chat (preserved UX, collapsible) */}
                        <div className="mt-6">
                          <button
                            onClick={() => setIsSkillSmithChatOpen((v) => !v)}
                            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-white/80 hover:text-white hover:bg-white/[0.05] transition-colors flex items-center justify-between"
                          >
                            <span className="inline-flex items-center gap-2 font-semibold">
                              <MessageCircle className="w-4 h-4" />
                              Chat with SkillSmith
                            </span>
                            {isSkillSmithChatOpen ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                          <AnimatePresence>
                            {isSkillSmithChatOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-4 max-h-[46vh] overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.02] p-3">
                                  <AgentChat agentId="skillsmith" />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </CardShell>
                    </div>

                    {/* 3-card row beneath the upload panel (UI only) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <CardShell className="p-6">
                        <h3 className="text-lg font-bold text-white mb-2">Quick Win Drill</h3>
                        <p className="text-white/70 text-sm mb-4">
                          One drill you can run today to tighten fundamentals fast.
                        </p>
                        <button
                          onClick={() => openComingSoon('Quick Win Drill', 'Preview drills and quick wins (coming online).')}
                          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-semibold text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors"
                        >
                          Preview
                        </button>
                      </CardShell>
                      <CardShell className="p-6">
                        <h3 className="text-lg font-bold text-white mb-2">Mechanics Breakdown</h3>
                        <p className="text-white/70 text-sm mb-4">
                          Frame-by-frame notes on movement, timing, and control.
                        </p>
                        <button
                          onClick={() => openComingSoon('Mechanics Breakdown', 'Breakdowns and annotated clips (coming online).')}
                          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-semibold text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors"
                        >
                          Preview
                        </button>
                      </CardShell>
                      <CardShell className="p-6">
                        <h3 className="text-lg font-bold text-white mb-2">7-Day Micro Plan</h3>
                        <p className="text-white/70 text-sm mb-4">
                          A simple week plan: reps, recovery, and mindset prompts.
                        </p>
                        <button
                          onClick={() => openComingSoon('7-Day Micro Plan', 'Weekly micro-plans and checklists (coming online).')}
                          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-semibold text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors"
                        >
                          Preview
                        </button>
                      </CardShell>
                    </div>

                    {/* Plans */}
                    {(userType === 'guest' || userType === 'auth') && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        ref={plansSectionRef}
                        data-plans-section
                      >
                        <SportsPricingGrid />
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'ntntns' && (
                  <motion.div
                    key="ntntns"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    <CardShell className="p-6 md:p-8">
                      <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">NTNTNS Score</h2>
                      <p className="text-white/70 mb-5">
                        Measure focus, confidence, composure, and resilience — then generate a weekly plan.
                      </p>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {['Focus', 'Confidence', 'Composure', 'Consistency'].map((chipText) => (
                          <span
                            key={chipText}
                            className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-sm font-semibold text-white/80"
                          >
                            {chipText}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => openComingSoon('Take the NTNTNS Intake', 'The NTNTNS intake flow is coming online.')}
                          className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 px-6 py-3 font-bold text-white shadow-lg hover:shadow-xl transition-shadow"
                        >
                          Take the NTNTNS Intake
                        </button>
                        <button
                          onClick={() => openComingSoon('Sample Scorecard', 'Sample scorecards are coming online.')}
                          className="w-full sm:w-auto rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3 font-semibold text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors"
                        >
                          See Sample Scorecard
                        </button>
                      </div>
                    </CardShell>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <CardShell className="p-6">
                        <h3 className="text-lg font-bold text-white mb-2">Coach &amp; Parent Insights</h3>
                        <p className="text-white/70 text-sm mb-4">
                          Shared notes + weekly checkpoints for support at home and in practice.
                        </p>
                        <button
                          onClick={() => openComingSoon('Preview Insights', 'Insights previews are coming online.')}
                          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-semibold text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors"
                        >
                          Preview Insights
                        </button>
                      </CardShell>
                      <CardShell className="p-6">
                        <h3 className="text-lg font-bold text-white mb-2">Focus Packs</h3>
                        <p className="text-white/70 text-sm mb-4">
                          Short guided routines: pre-game, between innings, after mistakes.
                        </p>
                        <button
                          onClick={() => openComingSoon('View Focus Packs', 'Focus Packs are coming online.')}
                          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-semibold text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors"
                        >
                          View Focus Packs
                        </button>
                      </CardShell>
                    </div>

                    <CardShell className="p-6 md:p-8">
                      <h3 className="text-xl font-bold text-white mb-2">Performance Reports</h3>
                      <p className="text-white/70 mb-4">
                        Monthly growth report: habits, mindset trend, and training consistency.
                      </p>
                      <button
                        onClick={() => openComingSoon('Preview Report', 'Performance reports are coming online.')}
                        className="w-full sm:w-auto rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3 font-semibold text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors"
                      >
                        Preview Report
                      </button>
                    </CardShell>
                  </motion.div>
                )}

                {activeTab === 'air' && (
                  <motion.div
                    key="air"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-6"
                  >
                    <CardShell className="p-6 md:p-8">
                      <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Avatar Builder</h2>
                      <p className="text-white/70 mb-6">
                        Create your athlete identity: style, gear, vibe, and evolving character.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => openComingSoon('Build My AIR Avatar', 'AIR Avatar Builder is coming online.')}
                          className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 px-6 py-3 font-bold text-white shadow-lg hover:shadow-xl transition-shadow"
                        >
                          Build My AIR Avatar
                        </button>
                        <button
                          onClick={() => openComingSoon('AIR Examples', 'Example galleries are coming online.')}
                          className="w-full sm:w-auto rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3 font-semibold text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors"
                        >
                          See Examples
                        </button>
                      </div>
                    </CardShell>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <CardShell className="p-6">
                        <h3 className="text-lg font-bold text-white mb-2">AIR Cards (QR-linked)</h3>
                        <p className="text-white/70 text-sm mb-4">
                          Shareable player card with highlights + growth storyline.
                        </p>
                        <button
                          onClick={() => openComingSoon('Preview AIR Card', 'AIR Cards are coming online.')}
                          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-semibold text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors"
                        >
                          Preview AIR Card
                        </button>
                      </CardShell>
                      <CardShell className="p-6">
                        <h3 className="text-lg font-bold text-white mb-2">Marketplace</h3>
                        <p className="text-white/70 text-sm mb-4">
                          Avatars, gear, clips, and templates (future).
                        </p>
                        <button
                          onClick={() => openComingSoon('Explore Marketplace', 'Marketplace is coming online.')}
                          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-semibold text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors"
                        >
                          Explore Marketplace
                        </button>
                      </CardShell>
                      <CardShell className="p-6">
                        <h3 className="text-lg font-bold text-white mb-2">AIR Academy</h3>
                        <p className="text-white/70 text-sm mb-4">
                          Branding + storytelling for athletes and families.
                        </p>
                        <button
                          onClick={() => openComingSoon('Preview Academy', 'AIR Academy is coming online.')}
                          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 font-semibold text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors"
                        >
                          Preview Academy
                        </button>
                      </CardShell>
                    </div>

                    <div className="text-center">
                      <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/70">
                        AIR Studio connects to NTNTNS profiles (coming online).
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Bottom CTA */}
          <section className="relative mb-14">
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="rounded-3xl border border-cyan-400/20 bg-gradient-to-r from-slate-900/70 via-blue-900/20 to-slate-900/70 backdrop-blur-xl p-7 md:p-10 shadow-[0_0_60px_rgba(56,189,248,0.10)]">
                <div className="flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-white">Start with one clip.</h3>
                    <p className="text-white/70 mt-1">
                      Get a SkillSmith analysis, then unlock NTNTNS × AIR.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => {
                        setTabAndScroll('skillsmith', skillSmithPanelRef);
                        setTimeout(() => handleUploadClick(), 250);
                      }}
                      className="rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 px-6 py-3 font-bold text-white shadow-lg hover:shadow-xl transition-shadow"
                    >
                      Upload a Clip
                    </button>
                    <button
                      onClick={() => setTabAndScroll('skillsmith', plansSectionRef)}
                      className="rounded-xl border border-white/10 bg-white/[0.04] px-6 py-3 font-semibold text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      View Plans
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

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

        {/* Coming soon modal (lightweight placeholder) */}
        {comingSoon.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/70"
              onClick={() => setComingSoon({ isOpen: false, title: '', description: '' })}
            />
            <div className="relative max-w-lg w-full mx-4 p-6 rounded-2xl bg-gradient-to-b from-gray-900/95 via-gray-800/95 to-gray-900/95 border border-cyan-400/30 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-white">{comingSoon.title}</h3>
                <button
                  onClick={() => setComingSoon({ isOpen: false, title: '', description: '' })}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Close"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-300">
                {comingSoon.description || 'Coming online.'}
              </p>
              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => setComingSoon({ isOpen: false, title: '', description: '' })}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 font-semibold text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
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
      </div>
    </PageLayout>
  );
}