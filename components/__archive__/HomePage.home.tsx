'use client';

import React from 'react';
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

export default function HomePage() {
  return <DynamicHeroSection />;
}
