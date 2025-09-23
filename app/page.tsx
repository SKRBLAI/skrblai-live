'use client';

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import HomeHeroScanFirst from "@/components/home/HomeHeroScanFirst";
import HomeHeroSplit from "@/components/home/HomeHeroSplit";
import MetricsStrip from "@/components/home/MetricsStrip";
import FooterCTAs from "@/components/home/FooterCTAs";
import { useOnboarding } from "@/contexts/OnboardingContext";
import dynamic from "next/dynamic";

const AgentLeaguePreview = dynamic(() => import("@/components/home/AgentLeaguePreview"), { ssr: false });
const WizardLauncher = dynamic(() => import("@/components/onboarding/WizardLauncher"), { ssr: false });
const PercyOnboardingRevolution = dynamic(() => import("@/components/legacy/home/PercyOnboardingRevolution"), { ssr: false });

export default function Page() {
  const isGuideStarEnabled = true; // process.env.NEXT_PUBLIC_HP_GUIDE_STAR === '1';
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
      <HomeHeroScanFirst />
      {isGuideStarEnabled ? (
        <AgentLeaguePreview onAgentClick={handleAgentClick} />
      ) : (
        <HomeHeroSplit />
      )}
      <MetricsStrip />
      <FooterCTAs />
    </>
  );
}
