import { Suspense } from 'react';
import PercyIntakeForm from '@/components/forms/PercyIntakeForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-deep-navy overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-teal-600">
        <div className="animate-pulse text-white text-xl">Loading...</div>
      </div>}>
        <PercyIntakeForm />
      </Suspense>
      </div>
    </main>
  );
}