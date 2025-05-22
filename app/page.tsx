'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePercyContext } from '@/components/assistant/PercyProvider';
import FloatingParticles from '@/components/ui/FloatingParticles';
import Image from 'next/image';
import type { Agent } from '@/types/agent';
import { agentDashboardList } from '@/lib/agents/agentRegistry';

import PercyChat from '@/components/home/PercyHero'; // For Percy demo modal, fallback to PercyHero if PercyChat is not directly available

// Define extended Agent interface with additional properties used in this component
interface ExtendedAgent extends Agent {
  isBeta?: boolean;
  isNew?: boolean;
  demoOutput?: string;
}

export default function HomePage() {
  const { setPercyIntent, closePercy } = usePercyContext();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [demoAgent, setDemoAgent] = useState<ExtendedAgent | null>(null);

  useEffect(() => {
    closePercy();
    setPercyIntent('');
  }, [closePercy, setPercyIntent]);

  return (
    <main className="min-h-screen relative text-white bg-[#0d1117] pt-16 overflow-hidden">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold">SKRBL AI</h1>
        <p>
          Welcome to the SKRBL AI platform. 
          This page has been temporarily simplified for build purposes.
        </p>
      </div>
    </main>
  );
} 