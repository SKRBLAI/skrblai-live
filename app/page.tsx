import { Suspense } from 'react';
import HomePage from '@/components/home/HomePage';

export default function Home() {
  return (
    <main className="min-h-screen bg-deep-navy overflow-x-hidden">
      <Suspense fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-[#0c1225] to-[#07101f]">
          <div className="animate-pulse text-white text-xl">Loading amazing experiences...</div>
        </div>
      }>
        <HomePage />
      </Suspense>
    </main>
  );
}