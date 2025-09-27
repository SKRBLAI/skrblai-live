'use client';

import React, { useState } from 'react';

// SKU to Environment Price ID resolver
const SKU_TO_ENV: Record<string, string> = {
  // Sports plans
  sports_plan_starter: process.env.NEXT_PUBLIC_STRIPE_PRICE_ROOKIE!,
  sports_plan_pro:     process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO!,
  sports_plan_elite:   process.env.NEXT_PUBLIC_STRIPE_PRICE_ALLSTAR!,
  // Sports add-ons (using legacy variable names to match your .env.local)
  sports_addon_scans10: process.env.NEXT_PUBLIC_STRIPE_PRICE_ADDON_SCANS10!,
  sports_addon_video:   process.env.NEXT_PUBLIC_STRIPE_PRICE_ADDON_VIDEO ?? "",
  sports_addon_emotion: process.env.NEXT_PUBLIC_STRIPE_PRICE_ADDON_EMOTION ?? "",
  sports_addon_nutrition: process.env.NEXT_PUBLIC_STRIPE_PRICE_ADDON_NUTRITION ?? "",
  sports_addon_foundation: process.env.NEXT_PUBLIC_STRIPE_PRICE_ADDON_FOUNDATION ?? "",
  // Business plans
  biz_plan_starter_m: process.env.NEXT_PUBLIC_STRIPE_PRICE_BIZ_STARTER_M ?? "",
  biz_plan_pro_m: process.env.NEXT_PUBLIC_STRIPE_PRICE_BIZ_PRO_M ?? "",
  biz_plan_elite_m: process.env.NEXT_PUBLIC_STRIPE_PRICE_BIZ_ELITE_M ?? "",
  // Business add-ons
  biz_addon_adv_analytics: process.env.NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_ADV_ANALYTICS ?? "",
  biz_addon_automation: process.env.NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_AUTOMATION ?? "",
  biz_addon_team_seat: process.env.NEXT_PUBLIC_STRIPE_PRICE_BIZ_ADDON_TEAM_SEAT ?? "",
};

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
  const stripeEnabled = (process.env.NEXT_PUBLIC_ENABLE_STRIPE ?? '1').toString() === '1';

  // Check if SKU resolves to a valid price ID
  const resolvedPriceId = sku ? SKU_TO_ENV[sku] : undefined;
  const isDisabled = !stripeEnabled || !sku || !resolvedPriceId || resolvedPriceId.trim().length === 0;

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