'use client';

import React, { useState } from 'react';
import { FEATURE_FLAGS } from '@/lib/config/featureFlags';
import { getPaymentLink } from '@/lib/stripe/paymentLinks';

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
  const useFallbackLinks = FEATURE_FLAGS.FF_STRIPE_FALLBACK_LINKS;

  // Let the server resolve price IDs; only disable when Stripe is off or SKU missing
  const isDisabled = !stripeEnabled || !sku;

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

  // If fallback is enabled and we have a payment link, use it directly
  if (useFallbackLinks && sku) {
    const paymentLink = getPaymentLink(sku);
    if (paymentLink) {
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[BuyButton] Using Payment Link fallback for SKU:', sku);
      }
      return (
        <a 
          href={paymentLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-center block ${className}`}
        >
          {children}
        </a>
      );
    }
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

      if (process.env.NODE_ENV !== 'production') {
        console.debug('[BuyButton] Checkout mode:', mode, 'SKU:', sku, 'Vertical:', vertical);
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