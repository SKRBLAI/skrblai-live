'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser } from '../utils/supabase-helpers';

// Simplified trial status (matches API response)
interface TrialStatus {
  isTrialUser: boolean;
  trialActive: boolean;
  trialExpired: boolean;
  daysRemaining: number;
  canAccessFeatures: boolean;
}

interface UseTrialReturn {
  trialStatus: TrialStatus | null;
  isLoading: boolean;
  error: string | null;
  refreshTrialStatus: () => Promise<void>;
  initializeTrial: (email?: string) => Promise<boolean>;
  showUpgradeModal: boolean;
  setShowUpgradeModal: (show: boolean) => void;
  handleUpgrade: () => void;
}

export function useTrial(): UseTrialReturn {
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const refreshTrialStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const user = await getCurrentUser();
      if (!user) {
        setTrialStatus(null);
        return;
      }

      const response = await fetch('/api/trial/status');
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setTrialStatus(data.trialStatus);
    } catch (err: any) {
      console.error('Error fetching trial status:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const initializeTrial = useCallback(async (email?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/trial/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setTrialStatus(data.trialStatus);
      return true;
    } catch (err: any) {
      console.error('Error initializing trial:', err);
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleUpgrade = useCallback(() => {
    // Close the modal
    setShowUpgradeModal(false);
    
    // Redirect to pricing/upgrade page
    window.location.href = '/upgrade';
  }, []);

  // Initial load
  useEffect(() => {
    refreshTrialStatus();
  }, [refreshTrialStatus]);

  // Check for daily upgrade prompts
  useEffect(() => {
    const checkDailyPrompt = async () => {
      if (!trialStatus?.isTrialUser || trialStatus.trialExpired) {
        return;
      }

      try {
        const user = await getCurrentUser();
        if (!user) return;

        // This would be implemented in TrialManager
        // const promptCheck = await TrialManager.shouldShowDailyPrompt(user.id);
        // if (promptCheck.show && promptCheck.prompt) {
        //   setUpgradePrompt(promptCheck.prompt);
        //   setShowUpgradeModal(true);
        // }
      } catch (err) {
        console.warn('Error checking daily prompt:', err);
      }
    };

    // Check on component mount and then daily
    checkDailyPrompt();
    
    // Set up daily check (every 24 hours)
    const interval = setInterval(checkDailyPrompt, 24 * 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [trialStatus]);

  return {
    trialStatus,
    isLoading,
    error,
    refreshTrialStatus,
    initializeTrial,
    showUpgradeModal,
    setShowUpgradeModal,
    handleUpgrade
  };
} 