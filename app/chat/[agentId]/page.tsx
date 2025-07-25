'use client';

import React from 'react';
import PercyChat from '../../PercyChat';

export default function AgentChatPage({ params }: { params: { agentId: string } }) {
  // PercyChat will internally read search params or context to adapt; we can pass props if needed.
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <PercyChat />
    </div>
  );
}