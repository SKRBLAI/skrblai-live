"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';

const BusinessWizard = dynamic(() => import('./BusinessWizard'), { ssr: false });

export type WizardMode = 'business' | 'sports';

interface WizardLauncherProps {
  mode: WizardMode;
  prefill?: {
    input?: string;
    urls?: string[];
    uploadedFile?: File;
    intent?: string;
  };
  onClose?: () => void;
}

export default function WizardLauncher({ mode, prefill, onClose }: WizardLauncherProps) {
  const preset = {
    email: prefill?.input?.includes('@') ? prefill.input : undefined,
    urls: prefill?.urls || [],
    quickWins: prefill?.intent ? [`Intent: ${prefill.intent}`] : []
  };

  return (
    <BusinessWizard 
      mode={mode}
      preset={preset} 
      onClose={onClose}
    />
  );
}

export function launchWizard(
  mode: WizardMode, 
  prefill?: WizardLauncherProps['prefill']
): Promise<void> {
  return new Promise((resolve) => {
    const event = new CustomEvent('launch-wizard', { 
      detail: { mode, prefill, onClose: resolve }
    });
    window.dispatchEvent(event);
  });
}
