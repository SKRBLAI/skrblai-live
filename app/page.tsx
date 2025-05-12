'use client';
import PageLayout from '@/components/layout/PageLayout';
import PercyHeroSection from '@/components/home/PercyHeroSection';
import FloatingParticles from '@/components/ui/FloatingParticles';

export default function HomePage() {
  return (
    <PageLayout>
      <div className="min-h-screen relative bg-gradient-to-b from-[#0d1117] to-[#161b22] text-white p-4">
        <h1 className="text-2xl mb-6">✅ SKRBL AI Homepage Loaded</h1>
        <FloatingParticles />
        <PercyHeroSection />
      </div>
    </PageLayout>
  );
}
