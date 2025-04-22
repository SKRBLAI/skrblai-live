import React from 'react';

export default function PercyChat({ service }: { service?: string }) {
  return (
    <div className="glass-card p-6 rounded-lg shadow-lg bg-opacity-10 bg-black backdrop-blur-lg border border-gray-700">
      <h2 className="text-2xl font-semibold text-white mb-4">Percy Assistant</h2>
      <p className="text-gray-300">I'm Percy, your AI assistant. How can I help you today with {service || 'your needs'}?</p>
      {/* Placeholder for Percy Chat functionality */}
    </div>
  );
}
