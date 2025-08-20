'use client';

import HomeHeroScanFirst from "@/components/home/HomeHeroScanFirst";
import HomeHeroSplit from "@/components/home/HomeHeroSplit";
import MetricsStrip from "@/components/home/MetricsStrip";
import FooterCTAs from "@/components/home/FooterCTAs";
import dynamic from "next/dynamic";

const AgentLeaguePreview = dynamic(() => import("@/components/home/AgentLeaguePreview"), { ssr: false });
const WizardLauncher = dynamic(() => import("@/components/onboarding/WizardLauncher"), { ssr: false });

export default function Page() {
  const isGuideStarEnabled = true; // process.env.NEXT_PUBLIC_HP_GUIDE_STAR === '1';

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
