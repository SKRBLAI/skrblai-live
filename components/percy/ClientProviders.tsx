"use client";
import React from "react";
import { PercyProvider } from "@/contexts/PercyContext";

export default function PercyProviderWrapper({ children }: { children: React.ReactNode }) {
  return <PercyProvider>{children}</PercyProvider>;
}
