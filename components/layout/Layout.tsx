import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import dynamic from 'next/dynamic';

// Dynamically import FloatingPercy to ensure it only runs on client-side
const DynamicFloatingPercy = dynamic(
  () => import('../assistant/FloatingPercy'),
  { ssr: false }
);

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-[#0D1117] relative">
      <Navbar />
      <main className="flex-grow pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {children}
      </main>
      <Footer />
      
      {/* Floating Percy Assistant - available on all pages */}
      <DynamicFloatingPercy />
    </div>
  );
}