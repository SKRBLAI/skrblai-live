import { Suspense } from 'react';
import HeroSection from '@/components/home/HeroSection';
import dynamic from 'next/dynamic';

// Use dynamic import for components with client-side animations
const DynamicHeroSection = dynamic(
  () => import('@/components/home/HeroSection'),
  {
    ssr: false,
    loading: () => (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-[#0c1225] to-[#07101f]">
        <div className="animate-pulse text-white text-xl">Loading amazing experiences...</div>
      </div>
    ),
  }
);

export default function Home() {
  return (
    <main className="min-h-screen bg-deep-navy overflow-x-hidden">
      <Suspense fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-[#0c1225] to-[#07101f]">
          <div className="animate-pulse text-white text-xl">Loading amazing experiences...</div>
        </div>
      }>
        <DynamicHeroSection />
      </Suspense>
    </main>
  );
}