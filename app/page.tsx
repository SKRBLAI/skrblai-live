import PercyHeroSection from "@/components/home/PercyHeroSection";
import TestimonialSection from "@/components/__archive__/TestimonialSection";
import FloatingParticles from "@/components/ui/FloatingParticles";

export default function HomePage() {
  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-[#0d1117] to-[#161b22] overflow-x-hidden">
      {/* Animated floating particles background */}
      <FloatingParticles />
      {/* Hero section with animated Percy, CTA, and floating particles */}
      <PercyHeroSection />
      {/* Animated testimonials section */}
      <TestimonialSection />
    </div>
  );
}
