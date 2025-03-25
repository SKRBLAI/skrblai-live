'use client';

import { useState, useEffect } from 'react';
import { createCustomerPortalLink } from '@/utils/stripe';

export default function BillingInfo() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

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
    const { url } = await createCustomerPortalLink();
    window.location.href = url;
  };

  if (loading) return <div>Loading billing information...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Billing Information</h2>
      <div className="bg-deep-navy/80 p-6 rounded-xl border border-electric-blue/20">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Current Plan</h3>
            <p className="text-electric-blue text-2xl font-bold">
              {subscription?.plan?.name || 'No active subscription'}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Next Invoice</h3>
            <p className="text-soft-gray">
              {subscription?.next_invoice_date
                ? `Due on ${new Date(subscription.next_invoice_date).toLocaleDateString()}`
                : 'No upcoming invoices'}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Payment Method</h3>
            <p className="text-soft-gray">
              {subscription?.payment_method || 'No payment method on file'}
            </p>
          </div>

          <button
            onClick={handleManageBilling}
            className="btn-primary w-full mt-4"
          >
            Manage Billing
          </button>
        </div>
      </div>
    </div>
  );
} 