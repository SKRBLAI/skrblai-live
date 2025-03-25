import Link from 'next/link';
import { HeroSection } from '@/components/ui/HeroSection';
import { FeatureSection } from '@/components/ui/FeatureSection';
import { TestimonialSection } from '@/components/ui/TestimonialSection';
import { PricingSection } from '@/components/ui/PricingSection';
import { CTASection } from '@/components/ui/CTASection';

export default function Home() {
  return (
    <div className="flex flex-col gap-20 py-10">
      <HeroSection />
      <FeatureSection />
      <TestimonialSection />
      <PricingSection />
      <CTASection />
    </div>
  );
} 