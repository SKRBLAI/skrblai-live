"use client";
import PercyHero from "./PercyHero";
import OnboardingSection from "./OnboardingSection";
import WaitlistPopup from "@/components/ui/WaitlistPopup";

export default function HomepageFlow() {
  return (
    <div className="relative w-full flex flex-col items-center bg-transparent">
      <PercyHero />
      <OnboardingSection />
      <WaitlistPopup />
    </div>
  );
}
