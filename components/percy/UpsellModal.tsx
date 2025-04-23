import React from 'react'; // Ensures React is available for JSX

interface UpsellModalProps {
  agent: { name: string; description: string };
  onClose: () => void;
}

export default function UpsellModal({ agent, onClose }: UpsellModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur p-6 rounded-xl text-white border border-white/20 max-w-md w-full shadow-xl">
        <h2 className="text-2xl font-bold mb-2">🚀 Unlock {agent.name}</h2>
        <p className="text-sm mb-4 text-gray-300">
          This agent is available to SKRBL Premium members. Upgrade now to access advanced workflows like:
        </p>
        <ul className="list-disc list-inside text-sm text-teal-300 mb-4">
          <li>{agent.description}</li>
        </ul>
        <div className="flex justify-end gap-2">
          <button onClick={() => window.location.href = '/upgrade'} className="bg-teal-500 px-4 py-2 rounded">See Plans</button>
          <button onClick={onClose} className="border border-white px-4 py-2 rounded">Not Now</button>
        </div>
      </div>
    </div>
  );
}
