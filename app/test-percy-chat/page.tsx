'use client';

import { StreamingPercyChat } from '@/components/percy/StreamingPercyChat';

export default function TestPercyChat() {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          Percy Streaming Chat Test
        </h1>

        <div className="h-[600px]">
          <StreamingPercyChat
            initialContext={{
              businessType: 'saas',
              currentRevenue: 50000,
              mainGoal: 'grow revenue'
            }}
            onRecommendation={(rec) => {
              console.log('Percy recommended:', rec);
            }}
          />
        </div>

        <div className="mt-8 p-4 bg-gray-800 rounded-lg text-sm text-gray-300">
          <p className="font-bold mb-2">Test Checklist:</p>
          <ul className="space-y-1">
            <li>✓ Chat should auto-send welcome message</li>
            <li>✓ Type a message and watch it stream token-by-token</li>
            <li>✓ Typing indicator should show while streaming</li>
            <li>✓ Suggested responses should appear initially</li>
            <li>✓ Messages should have markdown formatting</li>
            <li>✓ Export button should download chat</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
