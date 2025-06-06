'use client';

// ARCHIVED: This legacy onboarding file was migrated to UnifiedPercyOnboarding.tsx as of June 2025.
// All business logic, analytics, state, and error handling are now consolidated in UnifiedPercyOnboarding.tsx.
// Do not edit. Retained for reference only.

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

// Intent to dashboard path mapping (sync with percySyncAgent)
const intentToDashboardMap: Record<string, string> = {
  branding: '/dashboard/branding',
  social: '/dashboard/social-media',
  content: '/dashboard/marketing', // fallback for content/marketing
  publishing: '/dashboard/book-publishing',
  web: '/dashboard/website',
};

const AGENT_OPTIONS = [
  { value: 'brandingAgent', label: 'Branding Agent' },
  { value: 'contentCreatorAgent', label: 'Content Creator Agent' },
  { value: 'analyticsAgent', label: 'Analytics Agent' },
  { value: 'publishingAgent', label: 'Publishing Agent' },
  { value: 'socialBotAgent', label: 'Social Bot Agent' },
  { value: 'adCreativeAgent', label: 'Ad Creative Agent' },
  { value: 'proposalGeneratorAgent', label: 'Proposal Generator Agent' },
  { value: 'paymentManagerAgent', label: 'Payment Manager Agent' },
  { value: 'clientSuccessAgent', label: 'Client Success Agent' },
  { value: 'siteGenAgent', label: 'Site Generator Agent' },
  { value: 'bizAgent', label: 'Business Agent' },
  { value: 'videoContentAgent', label: 'Video Content Agent' },
  { value: 'percyAgent', label: 'Percy (Concierge)' },
  { value: 'percySyncAgent', label: 'Percy Sync Agent' },
];

export default function PercyOnboarding({ onComplete }: PercyOnboardingProps) {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('');
  const [platform, setPlatform] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [inviteMessage, setInviteMessage] = useState('');
  const router = useRouter();

  // Centralized onboarding completion logic
  const completeOnboarding = async (goal: string, platform: string, agent: string) => {
    localStorage.setItem('onboardingComplete', 'true');
    localStorage.setItem('userGoal', goal);
    localStorage.setItem('userPlatform', platform);
    let userId = null;
    let redirectPath = '/dashboard/client';
    // Map goal to dashboard path
    if (goal && intentToDashboardMap[goal]) {
      redirectPath = intentToDashboardMap[goal];
    }
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
        meta: { userId, goal, platform, redirectPath, ts: new Date().toISOString() }
      });
      if (process.env.NODE_ENV === 'development') {
        console.log('[SKRBL ONBOARDING] Onboarding completion logged to Supabase and systemLog.', { userId, goal, platform, redirectPath });
      }
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[SKRBL ONBOARDING] Onboarding logging failed, falling back to localStorage.', e);
      }
      // Fallback: already set localStorage above
    }
    // Redirect to personalized dashboard
    router.push(redirectPath);
  };

  const handleSubmit = async () => {
    await completeOnboarding(goal, platform, selectedAgent);
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
          <h3 className="text-lg font-semibold mb-4 text-center">Have an invite code? (Optional)</h3>
          <input
            type="text"
            className="w-full py-3 px-4 rounded-lg bg-white/10 border border-white/20 text-white font-medium mb-3 focus:outline-none focus:ring-2 focus:ring-teal-400"
            placeholder="Enter invite code (optional)"
            value={inviteCode}
            onChange={e => setInviteCode(e.target.value)}
            disabled={inviteStatus === 'loading' || inviteStatus === 'success'}
            aria-label="Invite code"
          />
          {inviteStatus === 'error' && (
            <div className="text-red-400 text-sm mb-2">{inviteMessage}</div>
          )}
          {inviteStatus === 'success' && (
            <div className="text-green-400 text-sm mb-2">{inviteMessage}</div>
          )}
          <div className="flex gap-3 w-full">
            <button
              onClick={async () => {
                if (!inviteCode) {
                  setStep(4); // skip if empty
                  return;
                }
                setInviteStatus('loading');
                setInviteMessage('');
                try {
                  const res = await fetch('/api/invite/redeem', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: inviteCode })
                  });
                  const data = await res.json();
                  if (res.ok && data.success) {
                    setInviteStatus('success');
                    setInviteMessage('Invite code accepted! Bonus unlocked.');
                    setTimeout(() => setStep(4), 1200);
                  } else {
                    setInviteStatus('error');
                    setInviteMessage(data.message || 'Invalid invite code.');
                  }
                } catch (e) {
                  setInviteStatus('error');
                  setInviteMessage('Network error. Please try again.');
                }
              }}
              className={`flex-1 py-3 rounded-lg bg-gradient-to-r from-teal-400 to-purple-500 text-white font-bold text-lg shadow-glow border-2 border-teal-400/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 transition-all ${inviteStatus === 'loading' ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={inviteStatus === 'loading' || !inviteCode}
            >
              Redeem
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex-1 py-3 rounded-lg bg-white/10 border border-white/20 text-white font-medium text-lg hover:bg-teal-500/20 transition-all"
              disabled={inviteStatus === 'loading'}
            >
              Skip
            </button>
          </div>
        </div>
      )}
      {step === 4 && (
        <div className="w-full">
          <h3 className="text-lg font-semibold mb-4 text-center">Choose your starting agent</h3>
          <select
            className="w-full py-3 px-4 rounded-lg bg-white/10 border border-white/20 text-white font-medium mb-6 focus:outline-none focus:ring-2 focus:ring-teal-400"
            value={selectedAgent}
            onChange={e => setSelectedAgent(e.target.value)}
            aria-label="Choose your starting agent"
          >
            <option value="" disabled>Pick an agent...</option>
            {AGENT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button
            disabled={!selectedAgent}
            onClick={() => setStep(5)}
            className={`w-full py-3 rounded-lg bg-gradient-to-r from-teal-400 to-purple-500 text-white font-bold text-lg shadow-glow border-2 border-teal-400/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 transition-all ${!selectedAgent ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Next
          </button>
        </div>
      )}
      {step === 5 && (
        <div className="w-full flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-4 text-center">Ready to get started?</h3>
          <button
            onClick={handleSubmit}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-teal-400 to-purple-500 text-white font-bold text-lg shadow-glow border-2 border-teal-400/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 transition-all"
          >
            Finish Onboarding
          </button>
          <div className="w-full flex flex-col gap-3 mt-6">
            <button
              onClick={() => {/* TODO: Integrate with Stripe upgrade flow */ alert('Upgrade flow (Stripe) coming soon!'); }}
              className="w-full max-w-xs mx-auto px-6 py-3 rounded-lg bg-gradient-to-r from-electric-blue to-teal-400 text-white font-semibold shadow-glow hover:scale-105 hover:shadow-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 text-lg"
              aria-label="Upgrade and unlock agents"
            >
              Upgrade Now
            </button>
            <button
              onClick={() => {/* TODO: Integrate referral/bonus flow */ alert('Invite a friend & get bonus (coming soon!)'); }}
              className="w-full max-w-xs mx-auto px-6 py-3 rounded-lg bg-gradient-to-r from-teal-400 to-sky-400 text-white font-semibold shadow-glow hover:scale-105 hover:shadow-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 text-base"
              aria-label="Invite a friend and get bonus"
            >
              Invite a Friend (Get Bonus)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
