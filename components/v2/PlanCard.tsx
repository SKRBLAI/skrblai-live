"use client";

import React from "react";
import CheckoutButton from "./CheckoutButton";

export default function PlanCard({
  title,
  description,
  price,
  sku,
  enabled,
}: {
  title: string;
  description: string;
  price: string;
  sku: string;
  enabled: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="text-2xl font-bold">{price}</div>
      </div>
      <p className="mt-3 text-sm text-gray-600">{description}</p>
      <CheckoutButton sku={sku} enabled={enabled} />
    </div>
  );
}
