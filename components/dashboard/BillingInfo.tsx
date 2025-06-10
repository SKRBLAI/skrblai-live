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

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/get-subscription');
        const data = await response.json();
        setSubscription(data.subscription);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  const handleManageBilling = async () => {
    try {
      // First, get the customer ID from the user's profile
      const userResponse = await fetch('/api/user/profile');
      const userData = await userResponse.json();
      
      if (!userData.success || !userData.stripeCustomerId) {
        console.error('No Stripe customer ID found');
        return;
      }

      const result = await createCustomerPortalLink(userData.stripeCustomerId);
      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        console.error('Error creating customer portal link:', result.error);
      }
    } catch (error) {
      console.error('Error creating customer portal link:', error);
    }
  };

  if (loading) {
    return <p>Loading billing information...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-deep-navy/80 p-6 rounded-xl border border-electric-blue/20">
        <h3 className="text-lg font-semibold">Current Plan</h3>
        <p className="text-electric-blue text-2xl font-bold">
          {(subscription as any)?.plan?.name || 'No active subscription'}
        </p>
      </div>
      <div className="bg-deep-navy/80 p-6 rounded-xl border border-electric-blue/20">
        <h3 className="text-lg font-semibold">Next Invoice</h3>
        <p className="text-soft-gray/80">
          {(subscription as any)?.nextInvoiceDate
            ? new Date((subscription as any).nextInvoiceDate).toLocaleDateString()
            : 'N/A'}
        </p>
      </div>
      <button
        onClick={handleManageBilling}
        className="btn-primary w-full text-center mt-4"
      >
        Manage Billing
      </button>
    </div>
  );
}
