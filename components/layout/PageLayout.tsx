import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import PercyWidget from '@/components/percy/PercyWidget';

type PageLayoutProps = {
  children: ReactNode;
  title?: string;
};

export default function PageLayout({ children, title }: PageLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-[#0D1117] relative">
      <Navbar />
      <main className="flex-grow pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {title && <h1 className="text-3xl font-bold mb-6 text-white">{title}</h1>}
        {children}
      </main>
      {/* Global Percy Floating Widget */}
      <PercyWidget />
    </div>
  );
}
