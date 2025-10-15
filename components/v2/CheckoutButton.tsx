"use client";

import React from "react";

export default function CheckoutButton({ sku, enabled }: { sku: string; enabled: boolean }) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleClick() {
    if (!enabled || loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/v2/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Checkout failed");
      }
      if (json.url) {
        window.location.href = json.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (e: any) {
      setError(e?.message || "Checkout error");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-stretch">
      <button
        className={`mt-3 inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium ${
          enabled ? "bg-black text-white hover:bg-gray-800" : "bg-gray-200 text-gray-500 cursor-not-allowed"
        }`}
        onClick={handleClick}
        disabled={!enabled || loading}
        aria-disabled={!enabled || loading}
      >
        {loading ? "Starting checkout…" : enabled ? "Choose plan" : "Unavailable"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
