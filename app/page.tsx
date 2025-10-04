'use client';

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import MetricsStrip from "@/components/home/MetricsStrip";
import FooterCTAs from "@/components/home/FooterCTAs";
import { useOnboarding } from "@/contexts/OnboardingContext";
import dynamic from "next/dynamic";
import { FEATURE_FLAGS } from '@/lib/config/featureFlags';

const AgentLeaguePreview = dynamic(() => import("@/components/home/AgentLeaguePreview"), { ssr: false });
const WizardLauncher = dynamic(() => import("@/components/onboarding/WizardLauncher"), { ssr: false });
const PercyOnboardingRevolution = dynamic(() => import("@/components/home/PercyOnboardingRevolution"), { ssr: false });

// Hero variant selector (env-driven)
const variant = FEATURE_FLAGS.HOMEPAGE_HERO_VARIANT;
const Hero = variant === 'split'
  ? require('@/components/home/HomeHeroSplit').default
  : variant === 'legacy'
    ? require('@/components/home/Hero').default
    : require('@/components/home/HomeHeroScanFirst').default;

export default function Page() {
  // Use unified feature flags for guide star
  const isGuideStarEnabled = FEATURE_FLAGS.HP_GUIDE_STAR;
  const searchParams = useSearchParams();
  const { setAnalysisIntent, analysisIntent } = useOnboarding();

  // Detect ?scan={agentId} parameter and set analysis intent
  useEffect(() => {
    const scanParam = searchParams.get('scan');
    if (scanParam && !analysisIntent) {
      setAnalysisIntent(scanParam);
    }
  }, [searchParams, analysisIntent, setAnalysisIntent]);

  const handleAgentClick = (agent: any) => {
    // Launch wizard with agent prefill
    const event = new CustomEvent('launch-wizard', { 
      detail: { 
        mode: agent.mode, 
        prefill: { intent: agent.intent },
        onClose: () => console.log('Wizard closed')
      }
    });
    window.dispatchEvent(event);
  };

  // If scan parameter is present, show Percy onboarding UI
  if (analysisIntent) {
    return <PercyOnboardingRevolution />;
  }

  return (
    <>
      <Hero />
      <AgentLeaguePreview onAgentClick={handleAgentClick} />
      <MetricsStrip />
      <FooterCTAs />
    </>
  );
}
