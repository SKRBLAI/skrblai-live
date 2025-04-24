'use client';

import { useState } from 'react';

interface PercyOnboardingProps {
  onComplete: (data: { goal: string; platform: string }) => void;
}

export default function PercyOnboarding({ onComplete }: PercyOnboardingProps) {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('');
  const [platform, setPlatform] = useState('');

  const handleSubmit = async () => {
    localStorage.setItem('onboardingComplete', 'true');
    localStorage.setItem('userGoal', goal);
    localStorage.setItem('userPlatform', platform);
    // Firestore sync
    try {
      const { getAuth } = await import('firebase/auth');
      const { db, setDoc, doc, serverTimestamp } = await import('@/utils/firebase');
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, 'users', user.uid, 'memory', 'onboarding'), {
          onboardingComplete: true,
          goal,
          platform,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (e) {
      // fail silently, fallback to localStorage
    }
    onComplete({ goal, platform });
  };

  return (
    <div className="bg-white/10 backdrop-blur p-6 rounded-xl text-white max-w-md mx-auto mt-10 border border-white/20">
      {step === 1 && (
        <>
          <h2 className="text-xl font-bold mb-2">What’s your main goal?</h2>
          <select value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full p-2 mt-2 rounded bg-white/20">
            <option value="">Select one</option>
            <option value="content">Automate content creation</option>
            <option value="branding">Build my brand</option>
            <option value="publishing">Publish a book</option>
            <option value="web">Create a website</option>
          </select>
          <button onClick={() => setStep(2)} className="mt-4 px-4 py-2 bg-teal-500 rounded">Next</button>
        </>
      )}
      {step === 2 && (
        <>
          <h2 className="text-xl font-bold mb-2">What platform do you use the most?</h2>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full p-2 mt-2 rounded bg-white/20">
            <option value="">Select one</option>
            <option value="instagram">Instagram</option>
            <option value="youtube">YouTube</option>
            <option value="shopify">Shopify</option>
            <option value="none">None</option>
          </select>
          <button onClick={handleSubmit} className="mt-4 px-4 py-2 bg-teal-500 rounded">Finish</button>
        </>
      )}
    </div>
  );
}
