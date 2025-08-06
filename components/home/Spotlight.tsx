import React from 'react';

const Spotlight: React.FC = () => (
  <div className="relative max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Percy Spotlight Card */}
    <div className="bg-gray-800 p-4 rounded-lg text-white">
      <h2 className="text-2xl font-semibold">
        Your Cosmic Concierge & Automation Orchestrator
      </h2>
      <button className="mt-4 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
        Chat with Percy
      </button>
    </div>
    {/* SkillSmith Spotlight Card */}
    <div className="bg-gray-800 p-4 rounded-lg text-white">
      <h2 className="text-2xl font-semibold">
        Sports Performance Forger
      </h2>
      <button className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
        Upload to SkillSmith
      </button>
    </div>
  </div>
);

export default Spotlight;