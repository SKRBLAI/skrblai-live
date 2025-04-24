"use client";
import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import dynamic from "next/dynamic";

const PercyWidget = dynamic(() => import('@/components/percy/PercyWidget'), { ssr: false });
const FloatingParticles = dynamic(() => import('@/components/ui/FloatingParticles'), { ssr: false });

type PageLayoutProps = {
  children: ReactNode;
  title?: string;
};

export default function ClientPageLayout({ children, title }: PageLayoutProps) {
  return (
    <div className="relative min-h-screen bg-deep-navy overflow-hidden">
      {/* Floating Particles Background */}
      <div className="fixed inset-0 z-0">
        <FloatingParticles />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full backdrop-blur-lg bg-white/5 rounded-lg shadow-xl border border-white/10 mt-4">
          {title && (
            <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-electric-blue to-teal-500 bg-clip-text text-transparent">
              {title}
            </h1>
          )}
          <div className="glass-card p-6">
            {children}
          </div>
        </main>

        {/* Global Percy Floating Widget */}
        <PercyWidget />
      </div>
    </div>
  );
}
