'use client';

import React, { useState } from 'react';
import { resolvePriceId } from '@/lib/stripe/priceResolver';
import { FEATURE_FLAGS } from '@/lib/config/featureFlags';

export function BuyButton({
  sku,
  isSubscription,
  vertical,
  successPath = "/pricing?success=1",
  cancelPath = "/pricing?canceled=1",
  children = "Get Started",
  disabledText = "Stripe Not Enabled",
  className = "",
}: {
  sku?: string;
  isSubscription: boolean;
  vertical: "sports" | "business";
  successPath?: string;
  cancelPath?: string;
  children?: React.ReactNode;
  disabledText?: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  const stripeEnabled = FEATURE_FLAGS.ENABLE_STRIPE;

  // Check if SKU resolves to a valid price ID using unified resolver
  const resolvedPriceId = sku ? resolvePriceId(sku) : null;
  
  // Button enablement: disabled only if Stripe not enabled, missing SKU, or no price ID resolved
  const isDisabled = !stripeEnabled || !sku || !resolvedPriceId;

  if (isDisabled) {
    return (
      <button 
        className={`w-full py-3 px-4 bg-gray-600 text-gray-400 rounded-lg cursor-not-allowed font-medium ${className}`}
        disabled
      >
        {stripeEnabled ? disabledText : 'Stripe Disabled'}
      </button>
    );
  }

  const handleClick = async () => {
    if (loading) return;
    
    try {
      setLoading(true);
      
      // Determine mode based on SKU and isSubscription flag
      let mode: "subscription" | "payment" | "trial" | "contact";
      if (sku === "sports_trial_curiosity") {
        mode = "trial";
      } else if (sku?.includes("_plan_contact")) {
        mode = "contact";
      } else {
        mode = isSubscription ? "subscription" : "payment";
      }
      
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sku,
          mode,
          vertical,
          successPath: vertical === "sports" ? "/sports?status=success" : successPath,
          cancelPath: vertical === "sports" ? "/sports?status=cancel" : cancelPath,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Checkout failed:", errorData);
        throw new Error(`Checkout failed: ${response.status}`);
      }

      const { url } = await response.json();
      
      if (!url) {
        throw new Error("No checkout URL returned");
      }

      window.location.href = url;
    } catch (error) {
      console.error("Payment error:", error);
      setLoading(false);
      // Could show a toast or error message here
    }
  };

  return (
    <button
      className={`w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      disabled={loading}
      onClick={handleClick}
    >
      {loading ? "Redirecting…" : children}
    </button>
  );
}