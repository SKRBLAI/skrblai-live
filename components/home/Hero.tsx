import React from 'react';
import { useRouter } from 'next/navigation';

const Hero: React.FC = () => {
  const router = useRouter();
  
  return (
    <div className="relative max-w-5xl mx-auto p-6">
      {/* Hero Section: Unleash Your AI Superhero League */}
      <h1 className="text-4xl font-bold text-center text-white">
        Unleash Your AI Superhero League
      </h1>
      <p className="mt-2 text-lg text-center text-gray-300">
        Deploy Percy's cosmic intelligence and SkillSmith's sports mastery in seconds.
      </p>
      
      {/* Primary and Secondary CTAs */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
        <button
          onClick={() => {
            const el = document.getElementById('onboarding');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          className="px-6 py-3 bg-gradient-to-r from-electric-blue via-teal-400 to-fuchsia-500 text-white text-lg font-semibold rounded-lg shadow-lg transition-all hover:scale-105"
        >
          🚀 Start My Free Business Scan
        </button>
        <button
          onClick={() => router.push('/pricing')}
          className="px-6 py-3 bg-transparent backdrop-blur-xl border-2 border-teal-400/30 text-white rounded-lg hover:border-teal-400/50 hover:shadow-[0_8px_32px_rgba(0,212,255,0.18)] transition-all"
        >
          See Pricing & ROI
        </button>
      </div>
    </div>
  );
};

export default Hero;