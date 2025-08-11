import React from 'react';
import { useRouter } from 'next/navigation';

const Spotlight: React.FC = () => {
  const router = useRouter();
  
  return (
    <div className="relative max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Percy Spotlight Card */}
      <div className="bg-transparent backdrop-blur-sm md:backdrop-blur-xl border-2 border-teal-400/30 rounded-lg p-4 text-white shadow-[0_8px_32px_rgba(0,212,255,0.18)] hover:shadow-[0_16px_48px_rgba(0,212,255,0.28)] transition-all duration-300">
        <h2 className="text-2xl font-semibold">
          Your Cosmic Concierge & Automation Orchestrator
        </h2>
        <button 
          onClick={() => router.push('/agents/percy?track=business')}
          className="mt-4 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg hover:scale-105 transition-all"
        >
          Chat with Percy
        </button>
      </div>
      {/* SkillSmith Spotlight Card */}
      <div className="bg-transparent backdrop-blur-sm md:backdrop-blur-xl border-2 border-teal-400/30 rounded-lg p-4 text-white shadow-[0_8px_32px_rgba(0,212,255,0.18)] hover:shadow-[0_16px_48px_rgba(0,212,255,0.28)] transition-all duration-300">
        <h2 className="text-2xl font-semibold">
          Sports Performance Forger
        </h2>
        <button 
          onClick={() => router.push('/agents/skillsmith?track=sports')}
          className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:scale-105 transition-all"
        >
          Upload to SkillSmith
        </button>
      </div>
    </div>
  );
};

export default Spotlight;