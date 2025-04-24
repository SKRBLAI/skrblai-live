"use client";
import PercyHero from "./PercyHero";
import AnimatedBackground from "../background/AnimatedBackground";

export default function PercyHeroSection() {
  return (
    <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      <AnimatedBackground />
      <PercyHero />
    </div>
  );
}
