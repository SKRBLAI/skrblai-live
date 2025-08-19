'use client';

import HomeHeroScanFirst from "@/components/home/HomeHeroScanFirst";
import HomeHeroSplit from "@/components/home/HomeHeroSplit";
import MetricsStrip from "@/components/home/MetricsStrip";
import FooterCTAs from "@/components/home/FooterCTAs";

export default function Page() {
  return (
    <>
      <HomeHeroScanFirst />
      <HomeHeroSplit />
      <MetricsStrip />
      <FooterCTAs />
    </>
  );
}
