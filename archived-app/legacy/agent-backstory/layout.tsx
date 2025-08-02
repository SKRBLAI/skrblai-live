import React from 'react';
import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Agent Backstory | SKRBL AI',
  description: 'Learn about the superhero backstories of our AI agents',
};

export default function AgentBackstoryLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      {children}
    </div>
  );
} 