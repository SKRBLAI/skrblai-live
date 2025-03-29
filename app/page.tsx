'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamic imports for better performance
const HeroSection = dynamic(() => import('@/components/ui/HeroSection'), {
  loading: () => <div className="h-screen animate-pulse bg-deep-navy" />
});

const FeatureSection = dynamic(() => import('@/components/ui/FeatureSection'), {
  loading: () => <div className="h-96 animate-pulse bg-deep-navy" />
});

const TestimonialSection = dynamic(() => import('@/components/ui/TestimonialSection'), {
  loading: () => <div className="h-96 animate-pulse bg-deep-navy" />
});

const PricingSection = dynamic(() => import('@/components/ui/PricingSection'), {
  loading: () => <div className="h-96 animate-pulse bg-deep-navy" />
});

const CTASection = dynamic(() => import('@/components/ui/CTASection'), {
  loading: () => <div className="h-48 animate-pulse bg-deep-navy" />
});

export default function Home() {
  return (
    <main className="min-h-screen bg-deep-navy">
      <div className="max-w-7xl mx-auto">
        <Suspense fallback={<div className="h-screen animate-pulse bg-deep-navy" />}>
          <HeroSection />
        </Suspense>

        <Suspense fallback={<div className="h-96 animate-pulse bg-deep-navy" />}>
          <FeatureSection />
        </Suspense>

        <Suspense fallback={<div className="h-96 animate-pulse bg-deep-navy" />}>
          <TestimonialSection />
        </Suspense>

        <Suspense fallback={<div className="h-96 animate-pulse bg-deep-navy" />}>
          <PricingSection />
        </Suspense>

        <Suspense fallback={<div className="h-48 animate-pulse bg-deep-navy" />}>
          <CTASection />
        </Suspense>
      </div>
    </main>
  );
}