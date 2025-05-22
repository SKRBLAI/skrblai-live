'use client';

import { useState } from 'react';
import PercyAvatar from '@/components/home/PercyAvatar';
import { supabase } from '@/utils/supabase';
import { getCurrentUser } from '@/utils/supabase-auth';
import { useRouter } from 'next/navigation';
import { systemLog } from '@/utils/systemLog';

interface PercyOnboardingProps {
  onComplete: (data: { goal: string; platform: string }) => void;
}

const GOALS = [
  { value: 'content', label: 'Automate content creation' },
  { value: 'branding', label: 'Build my brand' },
  { value: 'publishing', label: 'Publish a book' },
  { value: 'web', label: 'Create a website' },
];
const PLATFORMS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'shopify', label: 'Shopify' },
  { value: 'none', label: 'None' },
];

export default function PercyOnboarding({ onComplete }: PercyOnboardingProps) {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('');
  const [platform, setPlatform] = useState('');
  const router = useRouter();

  // Centralized onboarding completion logic
  const completeOnboarding = async (goal: string, platform: string) => {
    localStorage.setItem('onboardingComplete', 'true');
    localStorage.setItem('userGoal', goal);
    localStorage.setItem('userPlatform', platform);
    let userId = null;
    try {
      const user = await getCurrentUser();
      if (user) {
        userId = user.id;
        await supabase
          .from('user_settings')
          .upsert({
            userId: user.id,
            onboardingComplete: true,
            goal,
            platform,
            updatedAt: new Date().toISOString()
          }, { onConflict: 'userId' });
      }
      await systemLog({
        type: 'info',
        message: 'User onboarding completed',
        meta: { userId, goal, platform, ts: new Date().toISOString() }
      });
      if (process.env.NODE_ENV === 'development') {
        console.log('[SKRBL ONBOARDING] Onboarding completion logged to Supabase and systemLog.', { userId, goal, platform });
      }
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[SKRBL ONBOARDING] Onboarding logging failed, falling back to localStorage.', e);
      }
      // Fallback: already set localStorage above
    }
    // Redirect to personalized dashboard
    router.push('/dashboard/client');
  };

  const handleSubmit = async () => {
    await completeOnboarding(goal, platform);
    onComplete({ goal, platform });
  };

  return (
    <div className="bg-white/10 backdrop-blur p-6 rounded-xl text-white max-w-md mx-auto mt-10 border border-white/20 flex flex-col items-center">
      {/* Animated Percy avatar */}
      <div className="mb-6">
        <PercyAvatar size="md" />
      </div>
      <h2 className="text-2xl font-bold mb-2 text-center">Hi, I'm Percy — your AI assistant for SKRBL AI.<br/>Let's find the right tools for you.</h2>
      {step === 1 && (
        <div className="w-full">
          <h3 className="text-lg font-semibold mb-4 text-center">What's your main goal?</h3>
          <div className="flex flex-col gap-3">
            {GOALS.map(g => (
              <button
                key={g.value}
                onClick={() => { setGoal(g.value); setStep(2); }}
                className={`w-full py-3 rounded-lg bg-white/10 hover:bg-teal-500/20 border border-white/20 text-white font-medium transition-all ${goal === g.value ? 'ring-2 ring-teal-400' : ''}`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {step === 2 && (
        <div className="w-full">
          <h3 className="text-lg font-semibold mb-4 text-center">What platform do you use the most?</h3>
          <div className="flex flex-col gap-3">
            {PLATFORMS.map(p => (
              <button
                key={p.value}
                onClick={() => { setPlatform(p.value); setStep(3); }}
                className={`w-full py-3 rounded-lg bg-white/10 hover:bg-teal-500/20 border border-white/20 text-white font-medium transition-all ${platform === p.value ? 'ring-2 ring-teal-400' : ''}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {step === 3 && (
        <div className="w-full flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-4 text-center">Ready to get started?</h3>
          <button
            onClick={handleSubmit}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-teal-400 to-purple-500 text-white font-bold text-lg shadow-glow border-2 border-teal-400/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 transition-all"
          >
            Finish Onboarding
          </button>
        </div>
      )}
    </div>
  );
}
