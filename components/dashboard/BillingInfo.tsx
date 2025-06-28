'use client';

import { useState, useEffect } from 'react';
import { createCustomerPortalLink } from '@/utils/stripe';

interface Subscription {
  plan: {
    name: string;
    amount: number;
  };
  next_invoice_date: string;
  payment_method: string;
}

export default function BillingInfo() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState<boolean>(false);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/get-subscription');
        if (!response.ok) throw new Error('Failed to load subscription');
        const data = await response.json();
        setSubscription(data.subscription);
        setError(null);
      } catch (error) {
        setError('Unable to load billing info. Please try again or contact support.');
        setSubscription(null);
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  const handleManageBilling = async () => {
    setRedirecting(true);
    try {
      const userResponse = await fetch('/api/user/profile');
      const userData = await userResponse.json();
      if (!userData.success || !userData.stripeCustomerId) {
        setError('No Stripe customer ID found.');
        setRedirecting(false);
        return;
      }
      const result = await createCustomerPortalLink(userData.stripeCustomerId);
      if (result.success && result.url) {
        // Optionally, set a flag in localStorage to show a success message after return
        window.location.href = result.url;
      } else {
        setError('Error creating billing portal link. Please try again.');
        setRedirecting(false);
      }
    } catch (error) {
      setError('Error connecting to billing portal. Please try again.');
      setRedirecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[120px] px-4 py-8 animate-pulse">
        <svg className="w-8 h-8 mb-2 text-electric-blue animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        <span className="text-gray-300 text-sm">Loading billing information…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-md mx-auto px-4 md:px-0">
      <div className="flex justify-between items-center mb-2">
        <span className="text-base text-gray-300">Payments secured by</span>
        <img src="/stripe-logo.svg" alt="Stripe" className="h-5" aria-label="Payments secured by Stripe" />
      </div>
      {error && (
        <div className="bg-red-900/70 border border-red-500/30 text-red-200 p-3 rounded-xl text-sm mb-2">
          {error}
        </div>
      )}
      <div className="bg-deep-navy/80 p-6 rounded-xl border border-electric-blue/20 flex flex-col gap-2">
        <h3 className="text-lg font-semibold">Current Plan</h3>
        <p className="text-electric-blue text-2xl font-bold">
          {(subscription as any)?.plan?.name || 'No active subscription'}
        </p>
      </div>
      <div className="bg-deep-navy/80 p-6 rounded-xl border border-electric-blue/20 flex flex-col gap-2">
        <h3 className="text-lg font-semibold">Next Invoice</h3>
        <p className="text-soft-gray/80">
          {(subscription as any)?.nextInvoiceDate
            ? new Date((subscription as any).nextInvoiceDate).toLocaleDateString()
            : 'N/A'}
        </p>
      </div>
      <button
        onClick={handleManageBilling}
        className="btn-primary w-full text-center mt-4 flex items-center justify-center gap-2"
        aria-label="Manage your billing and subscription in Stripe"
        disabled={redirecting}
      >
        {redirecting ? (
          <>
            <svg className="w-5 h-5 animate-spin text-electric-blue" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
            <span>Redirecting to Stripe…</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5 text-electric-blue" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M12 17v-2m0-4V7m-7 5a9 9 0 1118 0 9 9 0 01-18 0z" /><path d="M9 12h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
            <span>Manage Billing</span>
          </>
        )}
      </button>
      <div className="flex justify-center mt-4">
        <span className="inline-flex items-center gap-1 text-xs text-gray-400"><svg className="w-4 h-4 text-teal-400" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> SSL Secured</span>
      </div>
    </div>
  );
}
