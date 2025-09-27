"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import UniversalPromptBar from "../ui/UniversalPromptBar";
import AttentionGrabberHero from "./AttentionGrabberHero";
import ScanResultsBridge from "./ScanResultsBridge";
import { useEffect } from "react";
import { FEATURE_FLAGS } from '@/lib/config/featureFlags';
import UnifiedCodeModal from '@/components/codes/UnifiedCodeModal';

const WizardLauncher = dynamic(() => import("@/components/onboarding/WizardLauncher"), { ssr: false });

type Mode = "business" | "sports";

export default function HomeHeroScanFirst() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("business");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [prefill, setPrefill] = useState<any>(null);
  const [scanResults, setScanResults] = useState<any>(null);
  const [showGuideStarHero, setShowGuideStarHero] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  
  const isGuideStarEnabled = FEATURE_FLAGS.HP_GUIDE_STAR;
  
  // Debug logging
  console.log('NEXT_PUBLIC_HP_GUIDE_STAR:', process.env.NEXT_PUBLIC_HP_GUIDE_STAR);
  console.log('isGuideStarEnabled:', isGuideStarEnabled);

  // Mode deep-linking support (?mode=sports|business)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const modeParam = new URLSearchParams(window.location.search).get('mode');
    if (modeParam === 'sports' || modeParam === 'business') {
      setMode(modeParam as Mode);
    }
  }, []);

  const handleSmartStart = (data: any) => {
    // Auto-detect mode from input
    let detectedMode = mode;
    if (data.fileName?.match(/\.(mp4|mov|avi|mkv)$/i) || 
        data.prompt?.toLowerCase().includes('video') ||
        data.prompt?.toLowerCase().includes('sport')) {
      detectedMode = 'sports';
      setMode('sports');
    }

    setPrefill({
      input: data.prompt,
      uploadedFile: data.fileName ? { name: data.fileName } : undefined,
      intent: detectedMode === 'sports' ? 'video_analysis' : 'business_optimization'
    });
    setWizardOpen(true);

    // Analytics
    if (typeof window !== 'undefined') {
      (window as any).gtag?.('event', 'hp_start_interaction', {
        path: detectedMode,
        hasUpload: !!data.fileName
      });
    }
  };

  const autoDetect = () => {
    setMode("business"); // Default to business
    setPrefill({ intent: 'auto_detect' });
    setWizardOpen(true);
  };

  // Feature flag fallback - return existing implementation if disabled
  if (!isGuideStarEnabled) {
    return (
      <section className="pt-24 md:pt-28 scroll-mt-28">
        <div className="mx-auto max-w-5xl px-4">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white text-center">
            Start with a Free AI Scan
          </h1>
          <p className="text-center text-white/70 mt-3">
            Paste your website or social link and get instant quick wins. Prefer sports? Switch and upload your video on the next page.
          </p>

          <div className="mt-6 flex justify-center gap-2">
            <button 
              onClick={() => setMode("business")}
              className={`px-4 py-2 rounded-full ${
                mode === "business" 
                  ? "bg-cyan-500 text-white" 
                  : "bg-white/5 text-white/70 border border-white/10"
              }`}
            >
              Business Scan
            </button>
            <button 
              onClick={() => setMode("sports")}
              className={`px-4 py-2 rounded-full ${
                mode === "sports" 
                  ? "bg-cyan-500 text-white" 
                  : "bg-white/5 text-white/70 border border-white/10"
              }`}
            >
              Sports Scan
            </button>
          </div>

          <div className="mt-5 flex justify-center">
            <button 
              type="button" 
              onClick={() => router.push(mode === "sports" ? "/sports#scan" : "/?action=scan")}
              className="btn-solid-grad px-8 py-3 relative z-50 pointer-events-auto"
            >
              {mode === "business" ? "Run Business Scan" : "Start Sports Scan"}
            </button>
          </div>
        </div>
      </section>
    );
  }

  // NEW Guide Star Experience with progressive flow
  return (
    <>
      {/* Step 1: Attention-Grabbing Hero with Scan */}
      {!scanResults && (
        <AttentionGrabberHero 
          onScanComplete={(results) => {
            setScanResults(results);
            setShowGuideStarHero(true);
          }}
        />
      )}

      {/* Step 2: Scan Results Bridge */}
      {scanResults && !showGuideStarHero && (
        <ScanResultsBridge 
          scanResults={scanResults}
          onGetStarted={() => setShowGuideStarHero(true)}
        />
      )}

      {/* Step 3: Revenue Guide Star Hero (Original) */}
      {showGuideStarHero && (
        <section className="pt-24 md:pt-28 scroll-mt-28">
          <div 
            className="relative mx-auto w-full max-w-6xl px-6 sm:px-8"
            style={{ paddingTop: "calc(var(--nav-h) + 1.5rem)" }}
          >
            <motion.div 
              className="gs-plate px-6 py-8 sm:px-10 sm:py-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="aura-h1 text-3xl sm:text-5xl md:text-6xl">
                Run the Business. <span className="whitespace-nowrap">Win the Game.</span>
              </h1>
              <p className="mt-4 sm:mt-5 text-base sm:text-lg md:text-xl opacity-90 text-white">
                Percy automates growth. SkillSmith elevates performance. Meet your specialized AI team below.
              </p>

              {/* Mode Pills */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <button 
                  className={`mode-pill ${mode === "business" ? "active" : ""}`}
                  onClick={() => setMode("business")}
                >
                  Business (Percy)
                </button>
                <button 
                  className={`mode-pill ${mode === "sports" ? "active" : ""}`}
                  onClick={() => setMode("sports")}
                >
                  Sports (SkillSmith)
                </button>
                <button 
                  className="mode-pill"
                  onClick={autoDetect}
                >
                  Choose for me
                </button>
              </div>

              {/* Smart Start Bar */}
              <div className="mt-6 sm:mt-8">
                <UniversalPromptBar
                  placeholder="Tell us your goal, paste a link, or drop a file/video..."
                  onComplete={handleSmartStart}
                  acceptedFileTypes={mode === 'sports' ? '.mp4,.mov,.avi,.mkv' : '.pdf,.doc,.txt,.png,.jpg'}
                  minimalUI={true}
                  buttonText="Start Free Scan"
                  className="max-w-2xl mx-auto"
                />
              </div>
              {/* Have a code? CTA */}
              <div className="mt-3 text-sm text-gray-300">
                <button onClick={() => setShowCodeModal(true)} className="text-cyan-400 hover:text-cyan-300">
                  Have a code?
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Wizard Launcher */}
      {wizardOpen && (
        <WizardLauncher
          mode={mode}
          prefill={prefill}
          onClose={() => setWizardOpen(false)}
        />
      )}

      {/* Unified Code Modal */}
      <UnifiedCodeModal isOpen={showCodeModal} onClose={() => setShowCodeModal(false)} source="hero" />
    </>
  );
}
