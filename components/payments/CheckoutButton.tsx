'use client';
import { useState } from "react";

import { ProductKey } from '@/lib/pricing/types';

export default function CheckoutButton(
  { label, sku, priceId, mode="subscription", className, metadata, vertical, addons }:
  {
    label: string;
    sku?: string | ProductKey;
    priceId?: string;
    mode?: "subscription" | "payment";
    className?: string;
    metadata?: Record<string, string>;
    vertical?: "sports" | "business";
    addons?: ProductKey[]; // Add-on product keys
  }
){
  const [loading,setLoading]=useState(false);
  async function start(){
    try{
      setLoading(true);
      const r = await fetch("/api/checkout", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ sku, priceId, mode, metadata, vertical, addons }),
      });
      if(!r.ok) throw new Error(await r.text());
      const { url } = await r.json();
      if(!url) throw new Error("No checkout URL");
      window.location.assign(url);
    }catch(e){
      console.error("Checkout error:", e);
      alert("Checkout failed. See console.");
      setLoading(false);
    }
  }
  return (
    <button type="button" onClick={start} disabled={loading}
      className={className || "btn-solid-grad h-11 w-full rounded-xl"}>
      {loading ? "Redirecting…" : label}
    </button>
  );
}
