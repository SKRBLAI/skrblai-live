"use client";
import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import ActionBanner, { BannerVariant } from "../ui/ActionBanner";

interface BannerContextType {
  showBanner: (message: string, variant?: BannerVariant) => void;
}

const BannerContext = createContext<BannerContextType>({
  // default no-op – component will be wrapped by provider at runtime
  showBanner: () => {},
});

export function BannerProvider({ children }: { children: ReactNode }) {
  const [banner, setBanner] = useState<{ message: string; variant: BannerVariant } | null>(null);

  const showBanner = useCallback((message: string, variant: BannerVariant = "info") => {
    setBanner({ message, variant });
    // Hide after 4s
    setTimeout(() => setBanner(null), 4000);
  }, []);

  return (
    <BannerContext.Provider value={{ showBanner }}>
      {banner && <ActionBanner message={banner.message} variant={banner.variant} />}
      {children}
    </BannerContext.Provider>
  );
}

export const useBanner = () => useContext(BannerContext);
